"use client";

import { authSessionManager } from "@/lib/auth-session-manager";

const SESSION_DAYS = 7;

export function setSessionCookie(token: string) {
  authSessionManager.setToken(token);
}

export function clearSessionCookie() {
  authSessionManager.clear();
}

export function getSessionToken() {
  return authSessionManager.getSessionToken();
}

export function setCachedFirebaseToken(token: string) {
  authSessionManager.setToken(token);
}

export function clearCachedFirebaseToken() {
  authSessionManager.clear();
}

export async function getCachedFirebaseToken() {
  return authSessionManager.getToken(false);
}

export async function refreshFirebaseTokenIfNeeded(forceRefresh = false) {
  return authSessionManager.getToken(forceRefresh);
}

export function getSessionMaxAgeSeconds() {
  return authSessionManager.getSessionMaxAgeSeconds();
}

export function getSessionDays() {
  return SESSION_DAYS;
}
