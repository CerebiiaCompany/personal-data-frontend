"use client";

import React, { useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSessionStore } from "@/store/useSessionStore";
import { parseApiError } from "@/utils/parseApiError";
import { getSession } from "@/lib/auth.api";
import { useOwnCompanyStore } from "@/store/useOwnCompanyStore";
import { fetchOwnCompany } from "@/lib/company.api";

const CheckActiveSession = () => {
  const router = useRouter();
  const pathname = usePathname();
  const user = useSessionStore((store) => store.user);
  const error = useSessionStore((store) => store.error);
  const loading = useSessionStore((store) => store.loading);
  const setUser = useSessionStore((store) => store.setUser);
  const setError = useSessionStore((store) => store.setError);
  const setLoading = useSessionStore((store) => store.setLoading);
  
  const company = useOwnCompanyStore((store) => store.company);
  const companyError = useOwnCompanyStore((store) => store.error);
  const setCompany = useOwnCompanyStore((store) => store.setCompany);
  const setCompanyError = useOwnCompanyStore((store) => store.setError);

  const hasCheckedRef = useRef(false);
  const isCheckingRef = useRef(false);
  const currentPathnameRef = useRef(pathname);

  const checkSession = useCallback(async () => {
    const currentPath = currentPathnameRef.current;
    
    // Skip if already checking
    if (isCheckingRef.current) return;
    if (currentPath === "/login") return;

    isCheckingRef.current = true;

    try {
      setLoading(true);

      const session = await getSession();

      if (session.error) {
        const parsedError = parseApiError(session.error);
        setError(parsedError);
        setUser(undefined);
        setLoading(false);
        isCheckingRef.current = false;
        
        // If it's an auth error and we're not on login, redirect
        if ((session.error.code === "auth/unauthenticated" || parsedError === "Sesión expirada") && currentPath !== "/login") {
          router.push(`/login?callback_url=${encodeURIComponent(currentPath)}`);
        }
        return;
      }

      if (session.data?.companyUserData) {
        const companyData = await fetchOwnCompany();

        if (companyData.error) {
          setCompanyError(parseApiError(companyData.error));
        } else {
          setCompany(companyData.data);
        }
      } else {
        setCompanyError("No company data for this user");
      }

      setUser(session.data);
      setLoading(false);
      isCheckingRef.current = false;
    } catch (error) {
      setUser(undefined);
      setLoading(false);
      setError((error as Error).message || "Unknown error");
      isCheckingRef.current = false;
      
      // Redirect to login on error if not already there
      if (currentPath !== "/login") {
        router.push(`/login?callback_url=${encodeURIComponent(currentPath)}`);
      }
    }
  }, [setUser, setError, setLoading, setCompany, setCompanyError, router]);

  // Efecto que maneja cambios de pathname y verificación inicial
  useEffect(() => {
    const pathnameChanged = currentPathnameRef.current !== pathname;
    
    // Actualizar ref del pathname
    if (pathnameChanged) {
      currentPathnameRef.current = pathname;
      // Reset ref cuando cambia la ruta para permitir nueva verificación
      hasCheckedRef.current = false;
    }

    // Si estamos en login, resetear y no verificar
    if (pathname === "/login") {
      hasCheckedRef.current = false;
      isCheckingRef.current = false;
      setLoading(false);
      return;
    }

    // Si hay un error de sesión expirada, no intentar verificar de nuevo
    if (error && (error === "Sesión expirada" || error.includes("Sesión"))) {
      setLoading(false);
      hasCheckedRef.current = true;
      return;
    }

    // Verificar sesión cuando no hay usuario y no se ha verificado aún
    // O cuando cambió la ruta
    const shouldCheck = !user && !isCheckingRef.current && (!hasCheckedRef.current || pathnameChanged);
    
    if (shouldCheck) {
      hasCheckedRef.current = true;
      checkSession();
    }
  }, [pathname, user, error, checkSession]);

  return null;
};

export default CheckActiveSession;
