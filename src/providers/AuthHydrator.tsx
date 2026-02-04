"use client";
import { useEffect, useRef } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { parseApiError } from "@/utils/parseApiError";
import { toast } from "sonner";
import { getSession, getPermissions } from "@/lib/auth.api";

export function AuthHydrator() {
  const setUser = useSessionStore((store) => store.setUser);
  const setPermissions = useSessionStore((store) => store.setPermissions);
  const setError = useSessionStore((store) => store.setError);
  const setLoading = useSessionStore((store) => store.setLoading);
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;

    (async () => {
      setLoading(true);

      const session = await getSession();

      if (session.error) {
        let parsedError = parseApiError(session.error);
        setError(parsedError);
        setLoading(false);
        return;
      }

      setUser(session.data);

      // Obtener permisos del usuario si hay sesión activa
      const permissionsRes = await getPermissions();

      if (permissionsRes.error) {
        // Si falla obtener permisos, solo loguear el error
        console.error("Error al obtener permisos:", permissionsRes.error);
      } else {
        setPermissions(permissionsRes.data);
      }
      
      setLoading(false);
    })();
  }, [setUser, setPermissions, setError, setLoading]);
  
  return null;
}
