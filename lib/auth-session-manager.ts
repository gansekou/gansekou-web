"use client";

import Cookies from "js-cookie";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";

const SESSION_DAYS = 7;
const TOKEN_REFRESH_SKEW_MS = 5 * 60 * 1000;
const TOKEN_MIN_REFRESH_INTERVAL_MS = 20 * 1000;
const AUTH_DEBOUNCE_MS = 120;
const TOKEN_STORAGE_KEY = "gansekou_token";
const TOKEN_EXPIRY_STORAGE_KEY = "gansekou_token_expires_at";
const SESSION_COOKIE = "gansekou_token";

export type AuthSnapshot = {
  firebaseUser: FirebaseUser | null;
  token: string | null;
  status: "loading" | "authenticated" | "unauthenticated";
  error: Error | null;
};

type AuthSubscriber = (snapshot: AuthSnapshot) => void;

function canUseBrowser() {
  return typeof window !== "undefined";
}

function decodeJwtExpiry(token: string) {
  if (!canUseBrowser()) return 0;
  try {
    const payload = JSON.parse(window.atob(token.split(".")[1] || ""));
    return typeof payload.exp === "number" ? payload.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

function authLog(message: string) {
  if (process.env.NODE_ENV !== "production") console.info(message);
}

class AuthSessionManager {
  private cachedToken: string | null = null;
  private cachedTokenExpiresAt = 0;
  private tokenPromise: Promise<string | null> | null = null;
  private authRequestLock: Promise<unknown> | null = null;
  private lastForcedRefreshAt = 0;
  private subscribers = new Set<AuthSubscriber>();
  private unsubscribeFirebase: (() => void) | null = null;
  private tokenSync: Promise<void> | null = null;
  private debounceTimer = 0;
  private snapshot: AuthSnapshot = {
    firebaseUser: firebaseAuth.currentUser,
    token: null,
    status: "loading",
    error: null,
  };

  getSessionMaxAgeSeconds() {
    return 60 * 60 * 24 * SESSION_DAYS;
  }

  getSessionToken() {
    return this.readStoredToken()?.token || null;
  }

  setToken(token: string) {
    this.persistToken(token);
    this.emit({
      firebaseUser: firebaseAuth.currentUser,
      token,
      status: "authenticated",
      error: null,
    });
  }

  clear() {
    this.cachedToken = null;
    this.cachedTokenExpiresAt = 0;
    this.tokenPromise = null;
    this.tokenSync = null;
    if (!canUseBrowser()) return;
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(TOKEN_EXPIRY_STORAGE_KEY);
    Cookies.remove(SESSION_COOKIE, { path: "/" });
  }

  async getToken(forceRefresh = false, userOverride?: FirebaseUser | null) {
    if (!canUseBrowser()) return null;

    const user = userOverride || firebaseAuth.currentUser;
    if (!user) return this.getSessionToken();

    const stored = this.readStoredToken();
    const needsRefresh =
      forceRefresh ||
      !stored ||
      stored.expiresAt <= Date.now() + TOKEN_REFRESH_SKEW_MS;

    if (!needsRefresh) return stored.token;

    const now = Date.now();
    const shouldForce =
      forceRefresh && now - this.lastForcedRefreshAt > TOKEN_MIN_REFRESH_INTERVAL_MS;
    if (shouldForce) this.lastForcedRefreshAt = now;

    if (!this.tokenPromise) {
      this.tokenPromise = user
        .getIdToken(shouldForce)
        .then((token) => {
          this.persistToken(token);
          if (forceRefresh || shouldForce) authLog("[auth] token refreshed");
          return token;
        })
        .finally(() => {
          this.tokenPromise = null;
        });
    }

    return this.tokenPromise;
  }

  async runAuthRequest<T>(request: () => Promise<T>) {
    if (this.authRequestLock) return this.authRequestLock as Promise<T>;

    this.authRequestLock = Promise.resolve()
      .then(request)
      .finally(() => {
        this.authRequestLock = null;
      });

    return this.authRequestLock as Promise<T>;
  }

  subscribe(subscriber: AuthSubscriber) {
    this.ensureListener();
    this.subscribers.add(subscriber);
    subscriber(this.snapshot);

    return () => {
      this.subscribers.delete(subscriber);
      if (this.subscribers.size === 0 && this.unsubscribeFirebase) {
        this.unsubscribeFirebase();
        this.unsubscribeFirebase = null;
      }
    };
  }

  private ensureListener() {
    if (this.unsubscribeFirebase || !canUseBrowser()) return;

    this.unsubscribeFirebase = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      authLog("[auth] firebase ready");
      window.clearTimeout(this.debounceTimer);
      this.debounceTimer = window.setTimeout(() => {
        void this.syncFirebaseUser(firebaseUser);
      }, AUTH_DEBOUNCE_MS);
    });
  }

  private async syncFirebaseUser(firebaseUser: FirebaseUser | null) {
    if (!firebaseUser) {
      this.clear();
      this.emit({ firebaseUser: null, token: null, status: "unauthenticated", error: null });
      return;
    }

    if (!this.tokenSync) {
      this.tokenSync = this.getToken(false, firebaseUser)
        .then((token) => {
          if (token) {
            authLog("[auth] state restored");
            this.emit({ firebaseUser, token, status: "authenticated", error: null });
          } else {
            this.emit({ firebaseUser, token: null, status: "loading", error: null });
          }
        })
        .catch((error: Error) => {
          this.emit({ firebaseUser, token: this.snapshot.token, status: this.snapshot.status, error });
        })
        .finally(() => {
          this.tokenSync = null;
        });
    }

    await this.tokenSync;
  }

  private emit(snapshot: AuthSnapshot) {
    this.snapshot = snapshot;
    this.subscribers.forEach((subscriber) => subscriber(snapshot));
  }

  private persistToken(token: string, expiresAt = decodeJwtExpiry(token)) {
    if (!canUseBrowser()) return;

    this.cachedToken = token;
    this.cachedTokenExpiresAt = expiresAt || Date.now() + 50 * 60 * 1000;
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    window.localStorage.setItem(TOKEN_EXPIRY_STORAGE_KEY, String(this.cachedTokenExpiresAt));

    Cookies.set(SESSION_COOKIE, token, {
      expires: SESSION_DAYS,
      path: "/",
      sameSite: "lax",
      secure: window.location.protocol === "https:",
    });
    authLog(`[auth-cookie] written length=${token.length}`);
  }

  private readStoredToken() {
    if (!canUseBrowser()) return null;
    const token = this.cachedToken || window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) return null;

    const expiresAt =
      this.cachedTokenExpiresAt ||
      Number(window.localStorage.getItem(TOKEN_EXPIRY_STORAGE_KEY) || 0) ||
      decodeJwtExpiry(token);

    this.cachedToken = token;
    this.cachedTokenExpiresAt = expiresAt;
    return { token, expiresAt };
  }
}

export const authSessionManager = new AuthSessionManager();
