"use client";

import { Icon } from "@iconify/react";
import clsx from "clsx";
import { ReactNode } from "react";

type MaxWidth = "md" | "lg" | "xl";
type Accent = "default" | "amber";

interface Props {
  children?: ReactNode;
  loading?: boolean;
  loadingMessage?: string;
  mode?: "required" | "voluntary";
  onDismiss?: () => void;
  maxWidth?: MaxWidth;
  accent?: Accent;
  /** Cambia al avanzar pasos para animar el contenido. */
  stepKey?: string;
  footer?: ReactNode;
}

const maxWidthClass: Record<MaxWidth, string> = {
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-3xl",
};

export function WizardModalHeader({
  icon,
  phase,
  title,
  subtitle,
  accent = "default",
}: {
  icon: string;
  phase?: number;
  title: string;
  subtitle?: string;
  accent?: Accent;
}) {
  const iconWrapClass =
    accent === "amber"
      ? "bg-amber-100 text-amber-700 ring-amber-200/80"
      : "bg-[#EEF3FF] text-[#1A2B5B] ring-[#C7D7F5]/60";

  return (
    <div className="mb-5 flex items-start gap-3.5 pr-10">
      <div
        className={clsx(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1",
          iconWrapClass
        )}
      >
        <Icon icon={icon} className="text-[22px]" />
      </div>
      <div className="min-w-0">
        {phase != null && (
          <span className="mb-1 inline-flex rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#64748B]">
            Fase {phase}
          </span>
        )}
        <h2 className="text-lg font-bold tracking-tight text-[#1A2B5B] sm:text-xl">{title}</h2>
        {subtitle ? (
          <p className="mt-1.5 text-sm leading-relaxed text-[#64748B]">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

export function WizardModalBody({
  children,
  stepKey,
  scrollable = true,
  className,
}: {
  children: ReactNode;
  stepKey?: string;
  scrollable?: boolean;
  className?: string;
}) {
  return (
    <div
      key={stepKey}
      className={clsx(
        "wizard-step-in",
        scrollable && "max-h-[55vh] overflow-y-auto pr-1",
        className
      )}
    >
      {children}
    </div>
  );
}

export function WizardModalFooter({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 flex flex-col-reverse gap-2 border-t border-[#EEF2F8] pt-5 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
      {children}
    </div>
  );
}

export default function WizardModalShell({
  children,
  loading = false,
  loadingMessage = "Cargando asistente…",
  mode = "required",
  onDismiss,
  maxWidth = "xl",
  accent = "default",
  stepKey,
  footer,
}: Props) {
  const panelAccentRing =
    accent === "amber" ? "ring-amber-200/50" : "ring-[#E8EDF7]/80";

  if (loading) {
    return (
      <div className="wizard-backdrop fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="wizard-panel-in flex flex-col items-center gap-3 rounded-2xl border border-white/20 bg-white/95 px-8 py-6 shadow-2xl backdrop-blur-xl">
          <span className="wizard-spinner h-8 w-8 rounded-full border-2 border-[#E4EAF6] border-t-[#1A2B5B]" />
          <p className="text-sm font-medium text-[#64748B]">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="wizard-backdrop fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={clsx(
          "wizard-panel-in relative my-auto w-full rounded-2xl border border-white/60 bg-white/95 p-6 shadow-[0_24px_80px_rgba(15,35,70,0.18)] backdrop-blur-xl sm:p-8",
          "ring-1",
          panelAccentRing,
          maxWidthClass[maxWidth]
        )}
      >
        {mode === "voluntary" && onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="absolute right-3 top-3 rounded-xl p-2 text-[#94A3B8] transition-all hover:bg-[#F1F5F9] hover:text-[#475569] active:scale-95"
            aria-label="Cerrar asistente"
          >
            <Icon icon="tabler:x" className="text-xl" />
          </button>
        )}

        <div key={stepKey} className="wizard-content-in">
          {children}
        </div>

        {footer ? footer : null}
      </div>
    </div>
  );
}
