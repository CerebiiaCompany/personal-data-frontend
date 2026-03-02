"use client";
import { useEffect, useRef } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { parseApiError } from "@/utils/parseApiError";
import { getSession, getPermissions } from "@/lib/auth.api";

// Función auxiliar para validar si un error es válido y no vacío
function isValidError(error: any): boolean {
  if (!error) return false;
  if (typeof error !== 'object') return false;
  // Un objeto de error vacío {} no es válido
  return Object.keys(error).length > 0;
}

export function AuthHydrator() {
  const setUser = useSessionStore((store) => store.setUser);
  const setPermissions = useSessionStore((store) => store.setPermissions);
  const setError = useSessionStore((store) => store.setError);
  const setLoading = useSessionStore((store) => store.setLoading);
  const isLoadingRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    // Solo ejecutar una vez
    if (hasLoadedRef.current) {
      console.log("[AuthHydrator] Ya se cargaron los datos, omitiendo...");
      return;
    }

    // Evitar múltiples ejecuciones simultáneas
    if (isLoadingRef.current) {
      console.log("[AuthHydrator] Ya hay una carga en progreso, omitiendo...");
      return;
    }

    // Función para cargar datos de autenticación con manejo robusto de errores
    async function loadAuthData() {
      isLoadingRef.current = true;
      hasLoadedRef.current = true;
      console.log("[AuthHydrator] ========================================");
      console.log("[AuthHydrator] Iniciando carga de datos de autenticación...");
      setLoading(true);

      try {
        // 1. Obtener sesión del usuario con manejo de errores
        console.log("[AuthHydrator] Obteniendo sesión del usuario...");
        let session;
        
        try {
          session = await getSession();
        } catch (sessionError) {
          console.error("[AuthHydrator] ❌ Excepción al obtener sesión:", sessionError);
          
          // Si falla la sesión, intentar reintentar
          if (retryCountRef.current < MAX_RETRIES) {
            retryCountRef.current++;
            console.log(`[AuthHydrator] Reintentando carga de sesión (${retryCountRef.current}/${MAX_RETRIES})...`);
            
            // Resetear refs para permitir reintento
            isLoadingRef.current = false;
            hasLoadedRef.current = false;
            
            // Reintentar después de un delay
            setTimeout(() => {
              loadAuthData();
            }, 2000 * retryCountRef.current);
            return;
          }
          
          // Si ya agotamos reintentos, marcar error y continuar
          setError("No se pudo cargar la sesión. Por favor, recarga la página.");
          setLoading(false);
          isLoadingRef.current = false;
          return;
        }

        // Validar que session no sea undefined o null
        if (!session) {
          console.error("[AuthHydrator] ❌ Sesión es null/undefined");
          setError("No se pudo obtener información de sesión");
          setLoading(false);
          isLoadingRef.current = false;
          return;
        }

        // Verificar si hay un error VÁLIDO (no vacío)
        if (session.error && isValidError(session.error)) {
          console.error("[AuthHydrator] ❌ Error al obtener sesión:", session.error);
          const parsedError = parseApiError(session.error);
          
          // Si el error es de autenticación (no hay sesión), no es un error crítico
          if (session.error.code === 'auth/unauthenticated') {
            console.log("[AuthHydrator] ℹ️ Usuario no autenticado (esperado si no ha iniciado sesión)");
            setError(parsedError);
            setLoading(false);
            isLoadingRef.current = false;
            return;
          }
          
          // Para otros errores, sí es problemático
          setError(parsedError);
          setLoading(false);
          isLoadingRef.current = false;
          return;
        }

        // Si el error es vacío pero no hay data, considerar como no autenticado
        if (!session.data) {
          console.log("[AuthHydrator] ℹ️ No hay datos de sesión (usuario no autenticado)");
          setError("No hay sesión activa");
          setLoading(false);
          isLoadingRef.current = false;
          return;
        }

        // Validar que session.data tenga las propiedades mínimas necesarias
        if (!session.data.username || !session.data.role) {
          console.error("[AuthHydrator] ❌ Datos de sesión incompletos:", session.data);
          setError("Datos de sesión incompletos");
          setLoading(false);
          isLoadingRef.current = false;
          return;
        }

        console.log("[AuthHydrator] ✅ Sesión obtenida exitosamente");
        console.log("[AuthHydrator]    - Usuario:", session.data?.username);
        console.log("[AuthHydrator]    - Rol:", session.data?.role);
        console.log("[AuthHydrator]    - Email:", session.data?.companyUserData?.personalEmail);
        setUser(session.data);

        // 2. Obtener permisos del usuario (no crítico, puede fallar)
        console.log("[AuthHydrator] Obteniendo permisos del usuario...");
        try {
          const permissionsRes = await getPermissions();

          if (permissionsRes.error && isValidError(permissionsRes.error)) {
            console.error("[AuthHydrator] ⚠️ Error al obtener permisos:", permissionsRes.error);
            console.log("[AuthHydrator] Continuando sin permisos (admins pueden funcionar sin ellos)");
            // No bloquear la app si fallan los permisos
          } else if (permissionsRes.data) {
            console.log("[AuthHydrator] ✅ Permisos obtenidos exitosamente");
            console.log("[AuthHydrator]    - Rol:", permissionsRes.data?.role);
            console.log("[AuthHydrator]    - Es SuperAdmin:", permissionsRes.data?.isSuperAdmin);
            console.log("[AuthHydrator]    - Tiene permisos:", !!permissionsRes.data?.permissions);
            setPermissions(permissionsRes.data);
          }
        } catch (permError) {
          console.error("[AuthHydrator] ⚠️ Excepción al obtener permisos (no crítico):", permError);
          // Continuar sin permisos, no es crítico
        }

        // Resetear contador de reintentos en caso de éxito
        retryCountRef.current = 0;
        
      } catch (error) {
        console.error("[AuthHydrator] ❌ Error inesperado:", error);
        
        // Intentar reintentar si no hemos agotado intentos
        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++;
          console.log(`[AuthHydrator] Reintentando después de error inesperado (${retryCountRef.current}/${MAX_RETRIES})...`);
          
          // Resetear refs para permitir reintento
          isLoadingRef.current = false;
          hasLoadedRef.current = false;
          
          // Reintentar después de un delay
          setTimeout(() => {
            loadAuthData();
          }, 2000 * retryCountRef.current);
          return;
        }
        
        setError("Error al cargar datos de autenticación. Por favor, recarga la página.");
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
        console.log("[AuthHydrator] ✅ Carga completada");
        console.log("[AuthHydrator] ========================================");
      }
    }

    // Ejecutar con un pequeño delay para evitar race conditions con hidratación de Next.js
    // Solo en el navegador (no en SSR)
    if (typeof window !== "undefined") {
      const timeoutId = setTimeout(() => {
        loadAuthData();
      }, 100);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, []); // Ejecutar una vez al montar el componente

  return null;
}
