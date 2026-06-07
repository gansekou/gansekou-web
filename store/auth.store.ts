"use client";

import { create } from "zustand";
import type { User } from "@/types/user";
import { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/api";
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
    set((state) => {
      const isAuthenticated = Boolean(token || state.user);
      if (state.token === token && state.isAuthenticated === isAuthenticated) {
        return state;
      }
      return { token, isAuthenticated };
    });
  },

  setSession: ({ user, token }) => {
    setAuthToken(token);

    set((state) => {
      if (
        state.user?.id === user.id &&
        state.token === token &&
        state.profileLoadedAt > 0
      ) {
        return state;
      }

      return {
        user,
        token,
        isAuthenticated: true,
        profileLoadedAt: Date.now(),
      };
    });
  },

  updateUser: (user) => {
    set({ user, profileLoadedAt: Date.now(), isAuthenticated: true });
  },

  clearSession: () => {
    clearAuthToken();
    realtimeSocketManager.close();

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      profileLoadedAt: 0,
    });
  },
}));
