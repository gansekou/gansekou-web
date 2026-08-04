"use client";

const REFRESH_TOKEN_KEY = "gansekou_refresh_token";

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(REFRESH_TOKEN_KEY);
}


export function saveRefreshToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}


export function clearRefreshToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(REFRESH_TOKEN_KEY);
}
