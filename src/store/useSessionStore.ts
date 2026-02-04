import { SessionUser, UserPermissionsResponse } from "@/types/user.types";
import { create } from "zustand";

interface AuthState {
  user?: SessionUser;
  permissions?: UserPermissionsResponse;
  loading: boolean;
  error?: string;
  setUser: (user: AuthState["user"]) => void;
  setPermissions: (permissions: AuthState["permissions"]) => void;
  setError: (error: AuthState["error"]) => void;
  setLoading: (value: boolean) => void;
  logout: () => void;
}

export const useSessionStore = create<AuthState>((set) => ({
  user: undefined,
  permissions: undefined,
  loading: true, // Iniciar en true para que la app espere la verificación inicial
  error: undefined,
  setUser: (user) => set({ user, loading: false, error: undefined }),
  setPermissions: (permissions) => set({ permissions }),
  setError: (error) => set({ error, loading: false }),
  setLoading: (value) => set({ loading: value }),
  logout: () => set({ user: undefined, permissions: undefined, error: undefined, loading: false }),
}));
