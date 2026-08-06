"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useModuleTour } from "./ModuleTourContext";

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function readTargetRect(selector: string): HighlightRect | null {
  const el = document.querySelector<HTMLElement>(`[data-tour="${selector}"]`);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  if (rect.width < 2 && rect.height < 2) return null;
  const pad = 8;
  return {
    top: Math.max(8, rect.top - pad),
    left: Math.max(8, rect.left - pad),
    width: Math.min(window.innerWidth - 16, rect.width + pad * 2),
    height: Math.min(window.innerHeight - 16, rect.height + pad * 2),
  };
}

export default function ModuleTourOverlay() {
  const { activeTour, stepIndex, nextStep, prevStep, stopTour } =
    useModuleTour();
  const [rect, setRect] = useState<HighlightRect | null>(null);

  const step = activeTour?.steps[stepIndex] ?? null;
  const total = activeTour?.steps.length ?? 0;
  const isLast = stepIndex >= total - 1;

  useLayoutEffect(() => {
    if (!step) {
      setRect(null);
      return;
    }

    const sync = () => {
      const target = document.querySelector<HTMLElement>(
        `[data-tour="${step.target}"]`
      );
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      }
      // Espera un frame al scroll para medir bien.
      window.requestAnimationFrame(() => {
        setRect(readTargetRect(step.target));
      });
    };

    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
    };
  }, [step]);

  useEffect(() => {
    if (!activeTour) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [activeTour]);

  useEffect(() => {
    if (!activeTour) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") stopTour();
      if (e.key === "ArrowRight" || e.key === "Enter") nextStep();
      if (e.key === "ArrowLeft") prevStep();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeTour, nextStep, prevStep, stopTour]);

  const tooltipStyle = useMemo(() => {
    if (!rect) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      } as const;
    }

    const tooltipWidth = Math.min(360, window.innerWidth - 32);
    const spaceBelow = window.innerHeight - (rect.top + rect.height);
    const placeBelow = spaceBelow > 180 || rect.top < 160;

    const left = Math.min(
      Math.max(16, rect.left + rect.width / 2 - tooltipWidth / 2),
      window.innerWidth - tooltipWidth - 16
    );

    if (placeBelow) {
      return {
        top: rect.top + rect.height + 14,
        left,
        width: tooltipWidth,
      } as const;
    }

    return {
      top: Math.max(16, rect.top - 14),
      left,
      width: tooltipWidth,
      transform: "translateY(-100%)",
    } as const;
  }, [rect]);

  if (!activeTour || !step) return null;

  return (
    <div className="module-tour-root fixed inset-0 z-[60]" role="dialog" aria-modal="true">
      {/* Capa oscura + recorte */}
      {rect ? (
        <div
          className="module-tour-spotlight pointer-events-none fixed rounded-xl border-2 border-primary-300/80 transition-all duration-200"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.48)",
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-slate-900/45" />
      )}

      {/* Tooltip */}
      <div
        className="module-tour-tooltip fixed z-[61] rounded-2xl border border-[#E4EAF6] bg-white p-4 shadow-[0_18px_50px_rgba(15,35,70,0.25)]"
        style={tooltipStyle}
      >
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-primary-500 uppercase">
              {activeTour.title}
            </p>
            <h3 className="mt-0.5 text-base font-bold text-primary-900">
              {step.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={stopTour}
            className="rounded-lg p-1 text-[#94A3B8] transition-colors hover:bg-stone-100 hover:text-primary-900"
            aria-label="Cerrar tutorial"
          >
            <Icon icon="tabler:x" className="text-lg" />
          </button>
        </div>

        <p className="text-sm leading-relaxed text-[#64748B]">{step.description}</p>

        {!rect && (
          <p className="mt-2 text-xs text-amber-700">
            No se encontró este elemento en pantalla. Continúa al siguiente paso.
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs font-medium text-[#94A3B8]">
            {stepIndex + 1} / {total}
          </p>
          <div className="flex items-center gap-2">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={prevStep}
                className="rounded-xl border border-[#E4EAF6] px-3 py-2 text-sm font-semibold text-primary-900 transition-colors hover:bg-[#F8FAFC]"
              >
                Anterior
              </button>
            )}
            <button
              type="button"
              onClick={nextStep}
              className="rounded-xl bg-primary-900 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(0,11,80,0.18)] transition-colors hover:bg-primary-700"
            >
              {isLast ? "¡Listo!" : "¡Vale!"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
