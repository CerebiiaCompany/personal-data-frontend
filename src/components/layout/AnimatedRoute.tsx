"use client";

import clsx from "clsx";
import { usePathname } from "next/navigation";

interface Props {
  children: React.ReactNode;
  className?: string;
  /** Escalonar secciones internas de la página */
  stagger?: boolean;
}

/**
 * Wrapper de ruta con animación de entrada al cambiar pathname.
 * Usar en layouts para animar todas las páginas hijas de forma consistente.
 */
export default function AnimatedRoute({
  children,
  className,
  stagger = true,
}: Props) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      className={clsx(
        "flex min-h-0 min-w-0 flex-1 flex-col",
        stagger && "page-stagger-auto",
        className
      )}
    >
      {children}
    </div>
  );
}
