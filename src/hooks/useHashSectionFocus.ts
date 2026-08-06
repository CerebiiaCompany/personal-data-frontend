"use client";

import { useEffect } from "react";

/**
 * Al entrar a una página con hash (#seccion), hace scroll suave dentro de
 * `#scrollContainer` (layout del dashboard) y resalta temporalmente el
 * elemento objetivo.
 */
export function useHashSectionFocus(hashId: string, enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const applyFocus = () => {
      const currentHash = window.location.hash.replace(/^#/, "");
      if (currentHash !== hashId) return;

      const target = document.getElementById(hashId);
      const scroller = document.getElementById("scrollContainer");
      if (!target) return;

      const scrollToTarget = () => {
        if (scroller) {
          const scrollerRect = scroller.getBoundingClientRect();
          const targetRect = target.getBoundingClientRect();
          const top =
            targetRect.top - scrollerRect.top + scroller.scrollTop - 24;
          scroller.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
        } else {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        target.classList.add("hash-section-focus");
        window.setTimeout(() => {
          target.classList.remove("hash-section-focus");
        }, 2800);
      };

      // Espera a que el layout/contenido termine de pintar.
      window.requestAnimationFrame(() => {
        window.setTimeout(scrollToTarget, 120);
      });
    };

    applyFocus();
    window.addEventListener("hashchange", applyFocus);
    return () => window.removeEventListener("hashchange", applyFocus);
  }, [hashId, enabled]);
}
