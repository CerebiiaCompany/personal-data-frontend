"use client";
import { useEffect, useRef } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { parseApiError } from "@/utils/parseApiError";
import { getSession, getPermissions } from "@/lib/auth.api";

export function AuthHydrator() {
  const setUser = useSessionStore((store) => store.setUser);
  const setPermissions = useSessionStore((store) => store.setPermissions);
  const setError = useSessionStore((store) => store.setError);
  const setLoading = useSessionStore((store) => store.setLoading);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    // Evitar múltiples ejecuciones simultáneas
    if (isLoadingRef.current) {
      console.log("[AuthHydrator] Ya hay una carga en progreso, omitiendo...");
      return;
    }

    // Función para cargar datos de autenticación
    async function loadAuthData() {
      isLoadingRef.current = true;
      console.log("[AuthHydrator] ========================================");
      console.log("[AuthHydrator] Iniciando carga de datos de autenticación...");
      setLoading(true);

      try {
        // 1. Obtener sesión del usuario
        console.log("[AuthHydrator] Obteniendo sesión del usuario...");
        const session = await getSession();

        if (session.error) {
          console.error("[AuthHydrator] ❌ Error al obtener sesión:", session.error);
          const parsedError = parseApiError(session.error);
          setError(parsedError);
          setLoading(false);
          isLoadingRef.current = false;
          return;
        }

        console.log("[AuthHydrator] ✅ Sesión obtenida exitosamente");
        console.log("[AuthHydrator]    - Usuario:", session.data?.username);
        console.log("[AuthHydrator]    - Rol:", session.data?.role);
        console.log("[AuthHydrator]    - Email:", session.data?.companyUserData?.personalEmail);
        setUser(session.data);

        // 2. Obtener permisos del usuario
        console.log("[AuthHydrator] Obteniendo permisos del usuario...");
        const permissionsRes = await getPermissions();

        if (permissionsRes.error) {
          console.error("[AuthHydrator] ❌ Error al obtener permisos:", permissionsRes.error);
          console.log("[AuthHydrator] Continuando sin permisos (admins pueden funcionar sin ellos)");
          // No bloquear la app si fallan los permisos
          // Los admins pueden funcionar sin permisos del backend
        } else {
          console.log("[AuthHydrator] ✅ Permisos obtenidos exitosamente");
          console.log("[AuthHydrator]    - Rol:", permissionsRes.data?.role);
          console.log("[AuthHydrator]    - Es SuperAdmin:", permissionsRes.data?.isSuperAdmin);
          console.log("[AuthHydrator]    - Tiene permisos:", !!permissionsRes.data?.permissions);
          console.log("[AuthHydrator]    - Permisos:", permissionsRes.data?.permissions);
          setPermissions(permissionsRes.data);
        }
      } catch (error) {
        console.error("[AuthHydrator] ❌ Error inesperado:", error);
        setError("Error al cargar datos de autenticación");
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
        console.log("[AuthHydrator] ✅ Carga completada");
        console.log("[AuthHydrator] ========================================");
      }
    }

    loadAuthData();
  }, []); // Ejecutar una vez al montar el componente

  return null;
}
