"use client";

import React, { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSessionStore } from "@/store/useSessionStore";
import { NAVBAR_DATA } from "@/constants/navbarData";
import LoadingCover from "../layout/LoadingCover";

const CheckRole = () => {
  const pathname = usePathname();
  const user = useSessionStore((store) => store.user);
  const error = useSessionStore((store) => store.error);
  const loading = useSessionStore((store) => store.loading);
  const router = useRouter();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (pathname === "/login") {
      hasRedirectedRef.current = false;
      return;
    }

    // Si hay un error de sesión, redirigir inmediatamente
    if (error && (error === "Sesión expirada" || error.includes("Sesión"))) {
      if (!hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        window.location.href = `/login?callback_url=${encodeURIComponent(pathname)}`;
      }
      return;
    }

    // Si no está cargando y no hay usuario, redirigir
    if (!loading && !user) {
      if (!hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        window.location.href = `/login?callback_url=${encodeURIComponent(pathname)}`;
      }
      return;
    }

    // Verificar permisos de rol solo si hay usuario
    if (!loading && user) {
      if (
        pathname.includes("/admin") &&
        !["COMPANY_ADMIN", "SUPERADMIN"].includes(user.role)
      ) {
        if (!hasRedirectedRef.current) {
          hasRedirectedRef.current = true;
          window.location.href = `/login?callback_url=${encodeURIComponent(pathname)}`;
        }
        return;
      }
    }

    // Reset ref if we have a valid user
    if (user) {
      hasRedirectedRef.current = false;
    }
  }, [pathname, user, loading, error]);

  // Si hay error o no hay usuario, no mostrar nada (redirección en curso)
  if (error && (error === "Sesión expirada" || error.includes("Sesión"))) {
    return null;
  }

  if (!loading && !user) {
    return null;
  }

  // Mostrar loading solo mientras se verifica la sesión
  if (loading || (!user && !error)) {
    return <LoadingCover wholePage={true} />;
  }

  return null;
};

export default CheckRole;

