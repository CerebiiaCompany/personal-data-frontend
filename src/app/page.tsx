"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/useSessionStore";

export default function HomePage() {
  const router = useRouter();
  const user = useSessionStore((store) => store.user);
  const loading = useSessionStore((store) => store.loading);
  const error = useSessionStore((store) => store.error);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Evitar redirecciones múltiples
    if (isRedirecting) return;

    // Si hay error de sesión, redirigir inmediatamente
    if (error && (error === "Sesión expirada" || error.includes("Sesión"))) {
      setIsRedirecting(true);
      router.push("/login");
      return;
    }

    // Timeout de seguridad: si después de 3 segundos no hay respuesta, redirigir a login
    if (loading && !timeoutRef.current && !user) {
      timeoutRef.current = setTimeout(() => {
        if (!user) {
          setIsRedirecting(true);
          router.push("/login");
        }
      }, 3000);
    }

    // Si ya terminó de cargar, tomar decisión
    if (!loading) {
      // Limpiar timeout si existe
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Si no hay usuario, redirigir a login
      if (!user) {
        setIsRedirecting(true);
        router.push("/login");
        return;
      }

      // Si hay usuario, redirigir al dashboard
      setIsRedirecting(true);
      router.push("/admin");
    }

    // Cleanup timeout
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [user, loading, error, router, isRedirecting]);

  // Mostrar pantalla de carga mientras se decide la redirección
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 to-primary-700">
      <div className="flex flex-col items-center gap-8">
        {/* Spinner mejorado con múltiples anillos */}
        <div className="relative w-24 h-24">
          {/* Anillo exterior */}
          <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
          
          {/* Anillo animado 1 */}
          <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
          
          {/* Anillo animado 2 (más lento y en sentido contrario) */}
          <div 
            className="absolute inset-2 border-4 border-transparent border-b-white/70 rounded-full animate-spin"
            style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
          ></div>
          
          {/* Punto central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Texto de carga */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-white text-xl font-semibold">
            Verificando sesión
          </p>
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
            <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
          </div>
        </div>
      </div>
    </div>
  );
}

