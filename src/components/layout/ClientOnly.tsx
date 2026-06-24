"use client";

import { useEffect, useState } from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Renderiza hijos solo en el cliente para evitar mismatch de hidratación
 * cuando el HTML del servidor no puede coincidir con el primer render del cliente.
 */
export default function ClientOnly({ children, fallback = null }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <>{fallback}</>;

  return <>{children}</>;
}
