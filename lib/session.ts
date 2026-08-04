import { apiFetch, clearAuthToken, setAuthToken } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import { firebaseAuth } from "@/lib/firebase";
import {
  getRefreshToken,
  saveRefreshToken,
  clearRefreshToken,
} from "@/lib/refresh-token";
import type { User } from "@/types/user";

type RefreshResponse = {
  user: User;
  refresh_token: string;
};

export async function restoreSession(): Promise<User | null> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await apiFetch<RefreshResponse>(
      ENDPOINTS.auth.refresh,
      {
        method: "POST",
        body: {
          refresh_token: refreshToken,
        },
      }
    );

    // Rotation du refresh token
    saveRefreshToken(response.refresh_token);

    // Rafraîchir le token Firebase si l'utilisateur est encore connecté
    const firebaseUser = firebaseAuth.currentUser;

    if (firebaseUser) {
      const idToken = await firebaseUser.getIdToken(true);
      setAuthToken(idToken);
    }

    return response.user;
  } catch (error) {
    console.error("[session] restore failed", error);

    clearRefreshToken();
    clearAuthToken();

    return null;
  }
}
