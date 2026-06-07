import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { ApiError, apiFetch, clearAuthToken, setAuthToken } from "@/lib/api";
import { authSessionManager } from "@/lib/auth-session-manager";
import { ENDPOINTS } from "@/lib/endpoints";
import { firebaseAuth, firebaseAuthReady, googleProvider } from "@/lib/firebase";
import type {
  AuthResponse,
  GansekouRole,
  PreferredLanguage,
  RegisterEmailPayload,
} from "@/types/auth";
import type { User } from "@/types/user";

const AUTH_TIMEOUT_MS = 15000;

function authLog(message: string) {
  console.info(message);
}

function authErrorLog(scope: string, step: string, error: unknown) {
  const record = error && typeof error === "object" ? error as { code?: unknown; message?: unknown; stack?: unknown } : {};
  console.error(`[${scope}] error step=${step}`, {
    code: record.code,
    message: record.message || (error instanceof Error ? error.message : String(error)),
    stack: record.stack,
  });
}

export class AuthTokenMissingError extends Error {
  constructor(message = "Firebase token not found after successful sign-in.") {
    super(message);
    this.name = "AuthTokenMissingError";
  }
}

export class BackendProfileMissingError extends Error {
  constructor(message = "Compte authentifie, mais profil Gansekou introuvable ou inaccessible.") {
    super(message);
    this.name = "BackendProfileMissingError";
  }
}

function withTimeout<T>(promise: Promise<T>, message: string) {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), AUTH_TIMEOUT_MS);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function retryNetwork<T>(task: () => Promise<T>, retries = 1) {
  try {
    return await task();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const networkError = message.includes("network-request-failed");
    if (!networkError || retries <= 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, 650));
    return retryNetwork(task, retries - 1);
  }
}

async function getFreshFirebaseToken(firebaseUser: FirebaseUser, scope: "login-email" | "login-google" | "register-email") {
  authLog(`[${scope}] getIdToken start`);
  await firebaseUser.reload();
  await new Promise((resolve) => setTimeout(resolve, 250));

  let token = await firebaseUser.getIdToken(true);
  if (!token) {
    authLog(`[${scope}] getIdToken empty retry`);
    await new Promise((resolve) => setTimeout(resolve, 500));
    token = await firebaseUser.getIdToken(true);
  }

  if (!token) throw new AuthTokenMissingError();
  authLog(`[${scope}] getIdToken success length=${token.length}`);
  return token;
}

async function completeFirebaseLogin(
  firebaseUser: FirebaseUser,
  mode: "email" | "google",
  options?: {
    preferred_language?: PreferredLanguage;
    role?: GansekouRole;
  }
) {
  const scope = mode === "email" ? "login-email" : "login-google";
  const firebaseToken = await getFreshFirebaseToken(firebaseUser, scope);

  authLog(`[${scope}] setAuthToken start`);
  setAuthToken(firebaseToken);
  authLog(`[${scope}] setAuthToken done`);
  authLog(`[auth-cookie] exists ${typeof document !== "undefined" ? document.cookie.includes("gansekou_token=") : false}`);

  if (mode === "email") {
    try {
      authLog("[login-email] backend profile start");
      const user = await apiFetch<User>(ENDPOINTS.users.meProfile, {
        token: firebaseToken,
      });
      authLog("[login-email] backend profile success");

      return {
        access_type: "firebase",
        is_new_user: false,
        user,
        token: firebaseToken,
      };
    } catch (error) {
      authErrorLog("login-email", "backend profile", error);
      if (!(error instanceof ApiError) || ![401, 403, 404].includes(error.status)) {
        throw new BackendProfileMissingError();
      }
    }
  }

  authLog(`[${scope}] firebase-login backend start`);
  const data = await apiFetch<AuthResponse>(ENDPOINTS.auth.firebaseLogin, {
    method: "POST",
    token: firebaseToken,
    body: {
      id_token: firebaseToken,
      preferred_language: options?.preferred_language || "FR",
      role: options?.role || "ELEVE",
    },
  });
  authLog(`[${scope}] firebase-login backend success`);

  return {
    ...data,
    token: firebaseToken,
  };
}

async function loginWithEmailInternal(
  email: string,
  password: string,
  options?: {
    preferred_language?: PreferredLanguage;
    role?: GansekouRole;
  }
) {
  try {
    authLog("[login-email] start");
    await firebaseAuthReady;
    authLog("[login-email] firebaseAuthReady ok");

    authLog("[login-email] signInWithEmailAndPassword start");
    const credential = await retryNetwork(() =>
      withTimeout(
        signInWithEmailAndPassword(firebaseAuth, email.trim(), password),
        "Connexion Firebase trop lente."
      )
    );
    authLog(`[login-email] signInWithEmailAndPassword success uid=${credential.user.uid}`);

    return await completeFirebaseLogin(credential.user, "email", options);
  } catch (error) {
    authErrorLog("login-email", "loginWithEmailInternal", error);
    throw error;
  }
}

async function loginWithGoogleInternal(options?: {
  preferred_language?: PreferredLanguage;
  role?: GansekouRole;
}) {
  try {
    authLog("[login-google] start");
    await firebaseAuthReady;
    authLog("[login-google] firebaseAuthReady ok");

    authLog("[login-google] popup start");
    const credential = await retryNetwork(() =>
      withTimeout(signInWithPopup(firebaseAuth, googleProvider), "Connexion Google trop lente.")
    );
    authLog(`[login-google] popup success uid=${credential.user.uid}`);

    return await completeFirebaseLogin(credential.user, "google", options);
  } catch (error) {
    authErrorLog("login-google", "loginWithGoogleInternal", error);
    throw error;
  }
}

export const authService = {
  async registerEmail(payload: RegisterEmailPayload) {
    return authSessionManager.runAuthRequest(async () => {
      await firebaseAuthReady;

      const credential = await createUserWithEmailAndPassword(
        firebaseAuth,
        payload.email.trim(),
        payload.password || ""
      );

      await updateProfile(credential.user, {
        displayName: `${payload.prenom} ${payload.nom}`.trim(),
      });

      const firebaseToken = await getFreshFirebaseToken(credential.user, "register-email");

      let data: AuthResponse;

      try {
        data = await apiFetch<AuthResponse>(ENDPOINTS.auth.registerEmail, {
          method: "POST",
          token: null,
          body: {
            firebase_uid: credential.user.uid,
            nom: payload.nom,
            prenom: payload.prenom,
            email: payload.email.trim(),
            phone: payload.phone,
            genre: payload.genre,
            age: payload.age,
            preferred_language: payload.preferred_language,
            role: "ELEVE",
          },
        });
      } catch (error) {
        console.error("[auth] register backend failed, deleting Firebase user", {
          uid: credential.user.uid,
          error,
        });
        await credential.user.delete();
        throw error;
      }

      setAuthToken(firebaseToken);

      return {
        ...data,
        token: firebaseToken,
      };
    });
  },

  async loginWithEmail(
    email: string,
    password: string,
    _options?: {
      preferred_language?: PreferredLanguage;
      role?: GansekouRole;
    }
  ) {
    return authSessionManager.runAuthRequest(() =>
      loginWithEmailInternal(email, password, _options)
    );
  },

  async loginWithGoogle(options?: {
    preferred_language?: PreferredLanguage;
    role?: GansekouRole;
  }) {
    return authSessionManager.runAuthRequest(() => loginWithGoogleInternal(options));
  },
  
  async me() {
    const user = await apiFetch<User>(ENDPOINTS.users.meProfile);
    return user;
  },

  async logout() {
    await signOut(firebaseAuth);
    clearAuthToken();
  },
};
