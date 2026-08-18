"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { subscribeAuthState } from "@/lib/auth-listener";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { restoreSession } from "@/lib/session";

import { platformService } from "@/services/platform.service";

const PROFILE_TTL_MS = 5 * 60 * 1000;

const profileRequests = new Map<
  string,
  Promise<Awaited<ReturnType<typeof authService.me>>>
>();

function authLog(message: string) {
  if (process.env.NODE_ENV !== "production") {
    console.info(message);
  }
}

function loadProfileOnce(uid: string) {
  const active = profileRequests.get(uid);

  if (active) {
    return active;
  }

  const request = authService.me().finally(() => {
    profileRequests.delete(uid);
  });

  profileRequests.set(uid, request);

  return request;
}

async function loadUserWithSubscription(uid: string) {
  const [currentUser, subscription] = await Promise.all([
    loadProfileOnce(uid),
    platformService.payments.subscription(),
  ]);

  return {
    ...currentUser,
    is_premium: subscription.is_premium,
  };
}

export function useCurrentUser() {
  const {
    user,
    hydrateToken,
    setSession,
    clearSession,
  } = useAuthStore();

  const [authStatus, setAuthStatus] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");

  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    let cancelled = false;
  
    const init = async () => {
      hydrateToken();
  
      try {
        const restoredUser = await restoreSession();
  
        if (cancelled) return;
  
        if (restoredUser) {
          const subscription =
            await platformService.payments.subscription();
  
          const enrichedUser = {
            ...restoredUser,
            is_premium: subscription.is_premium,
          };
  
          setSession({
            user: enrichedUser,
            token: "",
          });
  
          setAuthStatus("authenticated");
  
          authLog("[auth] session restored");
          authLog(
            `[auth] premium status: ${subscription.is_premium}`
          );
        }
      } catch (error) {
        console.error("[auth] restore session failed", error);
      }
    };
  
    init();
  
    const unsubscribe = subscribeAuthState(
      async ({
        firebaseUser,
        token,
        status,
        error: authError,
      }) => {
        try {
          if (status === "loading") {
            if (!cancelled) {
              setAuthStatus("loading");
            }
            return;
          }
  
          if (authError) {
            if (!cancelled) {
              setError(
                "Connexion instable. La session locale est conservee."
              );
            }
            return;
          }
  
          if (status === "unauthenticated" || !firebaseUser) {
            if (!cancelled) {
              clearSession();
              setAuthStatus("unauthenticated");
            }
            return;
          }
  
          if (!token) {
            if (!cancelled) {
              setAuthStatus("loading");
            }
            return;
          }
  
          if (!cancelled) {
            setAuthStatus("loading");
          }
  
          const state = useAuthStore.getState();
  
          const hasFreshProfile =
            state.user?.firebase_uid === firebaseUser.uid &&
            Date.now() - state.profileLoadedAt < PROFILE_TTL_MS;
  
          if (hasFreshProfile) {
            if (!cancelled) {
              setError(null);
              setAuthStatus("authenticated");
            }
            return;
          }
  
          setError(null);
  
          const [currentUser, subscription] = await Promise.all([
            loadProfileOnce(firebaseUser.uid),
            platformService.payments.subscription(),
          ]);
  
          authLog("[auth] backend profile loaded");
          authLog(
            `[auth] premium status: ${subscription.is_premium}`
          );
  
          const enrichedUser = {
            ...currentUser,
            is_premium: subscription.is_premium,
          };
  
          if (!cancelled) {
            setSession({
              user: enrichedUser,
              token,
            });
  
            setAuthStatus("authenticated");
          }
        } catch (error) {
          console.error(
            "[auth-hook] profile refresh failed",
            error
          );
  
          if (!cancelled) {
            if (error instanceof ApiError) {
              setError(error.message);
  
              if (
                error.status === 401 ||
                error.status === 403
              ) {
                clearSession();
                setAuthStatus("unauthenticated");
              }
            } else {
              setError(
                "Impossible de charger le profil utilisateur."
              );
            }
          }
        }
      }
    );
  
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [
    hydrateToken,
    setSession,
    clearSession,
  ]);

  return {
    user,
    loading: authStatus === "loading",
    authStatus,
    isAuthenticated:
      authStatus === "authenticated" &&
      Boolean(user),
    error,
  };
}

