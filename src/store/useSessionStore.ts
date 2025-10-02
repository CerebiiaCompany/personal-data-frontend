import { SessionUser } from "@/types/user.types";
import { create } from "zustand";

interface AuthState {
  user?: SessionUser;
  loading: boolean;
  error?: string;
  setUser: (user: AuthState["user"]) => void;
  setError: (error: string) => void;
  setLoading: (value: boolean) => void;
  logout: () => void;
}

export const useSessionStore = create<AuthState>((set) => ({
  user: undefined,
  loading: false,
  error: undefined,
  setUser: (user) => set({ user, loading: false, error: undefined }),
  setError: (error) => set({ error, loading: false }),
  setLoading: (value) => set({ loading: value }),
  logout: () => set({ user: undefined, error: undefined, loading: undefined }),
}));
