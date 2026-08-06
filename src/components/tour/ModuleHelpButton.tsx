"use client";

import { Icon } from "@iconify/react/dist/iconify.js";
import { ModuleTourId } from "@/types/moduleTour.types";
import { useModuleTour } from "./ModuleTourContext";

interface Props {
  tourId: ModuleTourId;
  className?: string;
  label?: string;
}

/**
 * Botón "?" para lanzar el tutorial paso a paso del módulo actual.
 */
export default function ModuleHelpButton({
  tourId,
  className = "",
  label = "Ver tutorial del módulo",
}: Props) {
  const { startTour, activeTour } = useModuleTour();
  const busy = activeTour?.id === tourId;

  return (
    <button
      type="button"
      onClick={() => startTour(tourId)}
      disabled={busy}
      title={label}
      aria-label={label}
      className={`module-help-button inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-primary-300/50 bg-primary-50 text-primary-700 shadow-sm transition-all hover:border-primary-500/40 hover:bg-primary-100 hover:text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 disabled:opacity-60 ${className}`}
    >
      <Icon icon="tabler:question-mark" className="text-xl font-bold" />
    </button>
  );
}
