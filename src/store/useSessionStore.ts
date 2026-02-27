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

export const useSessionStore = create<AuthState>((set, get) => ({
  user: undefined,
  permissions: undefined,
  loading: true, // Iniciar en true para que la app espere la verificación inicial
  error: undefined,
  
  setUser: (user) => {
    const currentState = get();
    // Evitar actualizaciones si ya hay un usuario válido y estamos intentando setear undefined
    if (!user && currentState.user && !currentState.error) {
      console.warn("[useSessionStore] Intento de limpiar usuario cuando hay uno válido sin error");
      return;
    }
    set({ user, loading: false, error: user ? undefined : currentState.error });
  },
  
  setPermissions: (permissions) => set({ permissions }),
  
  setError: (error) => {
    console.log("[useSessionStore] Setting error:", error);
    set({ error, loading: false });
  },
  
  setLoading: (value) => {
    // No permitir setear loading a false si hay un error activo sin usuario
    const currentState = get();
    if (!value && currentState.error && !currentState.user) {
      console.log("[useSessionStore] Manteniendo loading=false con error activo");
      set({ loading: false });
      return;
    }
    set({ loading: value });
  },
  
  logout: () => set({ 
    user: undefined, 
    permissions: undefined, 
    error: undefined, 
    loading: false 
  }),
}));

