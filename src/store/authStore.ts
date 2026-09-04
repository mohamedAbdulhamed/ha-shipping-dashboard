import { SignUserResponse } from "@/types/dtos/User.dto";
import { create } from "zustand";

export type AuthenticaedUser = SignUserResponse["Result"]["user"];
export type Token = SignUserResponse["Result"]["token"];

interface AuthState {
  user: AuthenticaedUser | null;
  token: Token | null;
  isAuthenticated: boolean;
  login: (user: AuthenticaedUser, token: Token) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: (user, token) => set({ user, token, isAuthenticated: true }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}));