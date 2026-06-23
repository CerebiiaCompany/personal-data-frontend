"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  children: React.ReactNode;
}

/**
 * Monta diálogos en document.body para que position:fixed
 * no quede anclado a un ancestro con transform (p. ej. animaciones de página).
 */
export default function DialogPortal({ children }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
}
