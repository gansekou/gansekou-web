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

import {
  getDeviceId,
  getDeviceName,
  getPlatform,
} from "@/lib/device";

import {
  saveRefreshToken,
  getRefreshToken,
  clearRefreshToken,
} from "@/lib/refresh-token";

const AUTH_TIMEOUT_MS = 20000;
const AUTH_RETRY_DELAY_MS = 800;

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

export class FirebaseEmailAlreadyExistsError extends Error {
  constructor(
    message = "Cette adresse email possède déjà un compte Gansekou."
  ) {
    super(message);
    this.name = "FirebaseEmailAlreadyExistsError";
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

async function getFreshFirebaseToken(
  firebaseUser: FirebaseUser,
  scope: "login-email" | "login-google" | "register-email"
) {
  authLog(`[${scope}] getIdToken start`);

  let token: string | null = null;

  try {
    // Do not force reload() here.
    // reload() creates another network request and can make
    // authentication fragile on slow mobile connections.
    token = await withTimeout(
      firebaseUser.getIdToken(false),
      "Récupération de la session trop lente."
    );
  } catch (error) {
    authErrorLog(scope, "getIdToken first attempt", error);

    await new Promise((resolve) =>
      setTimeout(resolve, AUTH_RETRY_DELAY_MS)
    );

    token = await withTimeout(
      firebaseUser.getIdToken(true),
      "Récupération de la session impossible."
    );
  }

  if (!token) {
    throw new AuthTokenMissingError();
  }

  authLog(
    `[${scope}] getIdToken success length=${token.length}`
  );

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
    
      device_id: getDeviceId(),
      device_name: getDeviceName(),
      platform: getPlatform(),
    },
  });
  if (data.refresh_token) {
    saveRefreshToken(data.refresh_token);
  }
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
      const email = payload.email.trim().toLowerCase();
  
      try {
        await firebaseAuthReady;
  
        authLog("[register-email] start");
  
        let firebaseUser: FirebaseUser;
  
        // ---------------------------------------------------------
        // STEP 1 — Create Firebase account
        // ---------------------------------------------------------
  
        try {
          authLog("[register-email] Firebase account creation start");
  
          const credential = await withTimeout(
            createUserWithEmailAndPassword(
              firebaseAuth,
              email,
              payload.password || ""
            ),
            "Création du compte trop lente. Vérifiez votre connexion."
          );
  
          firebaseUser = credential.user;
  
          authLog(
            `[register-email] Firebase account created uid=${firebaseUser.uid}`
          );
  
          // Update display name.
          try {
            await withTimeout(
              updateProfile(firebaseUser, {
                displayName: `${payload.prenom} ${payload.nom}`.trim(),
              }),
              "Mise à jour du profil trop lente."
            );
          } catch (profileError) {
            // This should NOT invalidate the Firebase account.
            authErrorLog(
              "register-email",
              "updateProfile",
              profileError
            );
          }
        } catch (error) {
          authErrorLog(
            "register-email",
            "Firebase account creation",
            error
          );
  
          // -------------------------------------------------------
          // IMPORTANT:
          // If Firebase says that the email already exists,
          // DO NOT create another account.
          //
          // The user must use the login page to recover the account.
          // -------------------------------------------------------
  
          const code =
            error &&
            typeof error === "object" &&
            "code" in error
              ? String(
                  (error as { code?: unknown }).code || ""
                )
              : "";
  
          if (code.includes("auth/email-already-in-use")) {
            throw new FirebaseEmailAlreadyExistsError();
          }
  
          throw error;
        }
  
        // ---------------------------------------------------------
        // STEP 2 — Firebase token
        // ---------------------------------------------------------
  
        const firebaseToken =
          await getFreshFirebaseToken(
            firebaseUser,
            "register-email"
          );
  
        // ---------------------------------------------------------
        // STEP 3 — Device information
        // ---------------------------------------------------------
  
        const deviceId = getDeviceId();
        const deviceName = getDeviceName();
        const platform = getPlatform();
  
        // ---------------------------------------------------------
        // STEP 4 — Create/sync Gansekou profile
        // ---------------------------------------------------------
  
        authLog(
          "[register-email] backend registration start"
        );
  
        const data = await apiFetch<AuthResponse>(
          ENDPOINTS.auth.registerEmail,
          {
            method: "POST",
            token: firebaseToken,
            body: {
              id_token: firebaseToken,
  
              nom: payload.nom.trim(),
              prenom: payload.prenom.trim(),
  
              phone: payload.phone.trim(),
              genre: payload.genre,
              age: payload.age,
  
              preferred_language:
                payload.preferred_language || "FR",
  
              role: "ELEVE",
  
              device_id: deviceId,
              device_name: deviceName,
              platform,
            },
          }
        );
  
        authLog(
          "[register-email] backend registration success"
        );
  
        if (data.refresh_token) {
          saveRefreshToken(data.refresh_token);
        }
  
        setAuthToken(firebaseToken);
  
        return {
          ...data,
          token: firebaseToken,
        };
      } catch (error) {
        authErrorLog(
          "register-email",
          "registration",
          error
        );
  
        throw error;
      }
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
    try {
      const refreshToken = getRefreshToken();
  
      if (refreshToken) {
        await apiFetch(
          ENDPOINTS.auth.logout,
          {
            method: "POST",
            body: {
              refresh_token: refreshToken,
            },
          }
        );
      }
  
    } catch (error) {
      console.error("[auth] backend logout failed", error);
    } finally {
  
      clearRefreshToken();
  
      clearAuthToken();
  
      await signOut(firebaseAuth);
  
    }
  },
};
