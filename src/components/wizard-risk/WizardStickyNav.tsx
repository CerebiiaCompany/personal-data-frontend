"use client";

import clsx from "clsx";
import { Icon } from "@iconify/react/dist/iconify.js";
import Button from "@/components/base/Button";

interface WizardStickyNavProps {
  onPrevious?: () => void;
  onNext: () => void;
  showPrevious?: boolean;
  nextEnabled?: boolean;
  isLoading?: boolean;
  nextLabel?: string;
  hint?: string;
  /** Motivo visible en todos los anchos: por qué aún no se puede avanzar. */
  warning?: string;
}

export default function WizardStickyNav({
  onPrevious,
  onNext,
  showPrevious = true,
  nextEnabled = true,
  isLoading = false,
  nextLabel = "Siguiente",
  hint,
  warning,
}: WizardStickyNavProps) {
  return (
    <nav className="sticky bottom-0 z-20 mt-4 rounded-[22px] border border-[#E4EAF6] bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(15,35,70,0.06)] backdrop-blur sm:px-5">
      {warning && (
        <p role="status" className="mb-3 text-[13px] leading-snug text-[#64748B]">
          {warning}
        </p>
      )}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        {showPrevious && onPrevious ? (
          <Button
            hierarchy="secondary"
            className="w-full rounded-xl! border-[#D7E2F5]! px-5! py-3! text-[#1A2B5B]! sm:w-auto"
            onClick={onPrevious}
            disabled={isLoading}
            startContent={<Icon icon="tabler:arrow-left" />}
          >
            Anterior
          </Button>
        ) : (
          <span />
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          {hint && !warning && (
            <p className="text-[12px] text-[#94A3B8]">{hint}</p>
          )}
          <Button
            hierarchy="primary"
            className={clsx("w-full rounded-xl! px-6! py-3! sm:w-auto", !nextEnabled && "opacity-55")}
            onClick={onNext}
            loading={isLoading}
            endContent={<Icon icon="tabler:arrow-right" />}
          >
            {nextLabel}
          </Button>
        </div>
      </div>
    </nav>
  );
}
