"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/useSessionStore";
import LoadingCover from "@/components/layout/LoadingCover";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useSessionStore();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Evitar redirecciones múltiples
    if (isRedirecting) return;

    // Esperar a que termine de verificar la sesión
    if (loading) {
      console.log("⏳ Verificando sesión...");
      return;
    }

    // Ya terminó de cargar, tomar decisión
    console.log("🔍 Sesión verificada:", { user: !!user });

    // Si no hay usuario, redirigir a login
    if (!user) {
      console.log("❌ Sin sesión activa, redirigiendo a /login");
      setIsRedirecting(true);
      router.push("/login");
      return;
    }

    // Si hay usuario, redirigir al dashboard
    console.log("✅ Sesión activa, redirigiendo a /admin");
    setIsRedirecting(true);
    router.push("/admin");
  }, [user, loading, router, isRedirecting]);

  // Mostrar pantalla de carga mientras se decide la redirección
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 to-primary-700">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <LoadingCover />
        </div>
        <p className="text-white text-lg font-medium">
          Cargando sesión...
        </p>
      </div>
    </div>
  );
}

