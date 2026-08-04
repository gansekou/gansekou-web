import { apiFetch } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";

import {
  getRefreshToken,
  saveRefreshToken,
  clearRefreshToken,
} from "@/lib/refresh-token";

import { setAuthToken } from "@/lib/api";

import { firebaseAuth } from "@/lib/firebase";

export async function restoreSession() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await apiFetch<{
      user: any;
      refresh_token: string;
    }>(ENDPOINTS.auth.refresh, {
      method: "POST",
      body: {
        refresh_token: refreshToken,
      },
    });

    saveRefreshToken(response.refresh_token);

    const firebaseUser = firebaseAuth.currentUser;

    if (firebaseUser) {
      const idToken = await firebaseUser.getIdToken(true);
      setAuthToken(idToken);
    }

    return response.user;
  } catch {
    clearRefreshToken();
    return null;
  }
}
