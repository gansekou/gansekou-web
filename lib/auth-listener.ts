"use client";

import { authSessionManager, type AuthSnapshot } from "@/lib/auth-session-manager";

type AuthSubscriber = (snapshot: AuthSnapshot) => void;

export function subscribeAuthState(subscriber: AuthSubscriber) {
  return authSessionManager.subscribe(subscriber);
}
