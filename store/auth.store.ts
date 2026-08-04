"use client";

import { create } from "zustand";
import type { User } from "@/types/user";
import {
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from "@/lib/api";
import {
  clearRefreshToken,
} from "@/lib/refresh-token";
import { realtimeSocketManager } from "@/lib/websocket-manager";

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  profileLoadedAt: number;

  hydrateToken: () => void;

  setSession: (payload: {
    user: User;
    token: string;
  }) => void;

  updateUser: (user: User) => void;

  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  profileLoadedAt: 0,

  hydrateToken: () => {
    const token = getAuthToken();

    set((state) => ({
      ...state,
      token,
      isAuthenticated: Boolean(token || state.user),
    }));
  },

  setSession: ({ user, token }) => {
    // On ne remplace le token Firebase
    // que s'il existe réellement.
    if (token) {
      setAuthToken(token);
    }

    set({
      user,
      token: token || getAuthToken(),
      isAuthenticated: true,
      profileLoadedAt: Date.now(),
    });
  },

  updateUser: (user) => {
    set({
      user,
      profileLoadedAt: Date.now(),
      isAuthenticated: true,
    });
  },

  clearSession: () => {
    clearAuthToken();
    clearRefreshToken();
  
    realtimeSocketManager.close();
  
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      profileLoadedAt: 0,
    });
  },
}));
