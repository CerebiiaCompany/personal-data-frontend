import clsx from "clsx";
import { Icon } from "@iconify/react";

export const SETUP_WIZARD_PHASE2_STEPS = [
  { id: 1, label: "Tratamiento" },
  { id: 2, label: "Base legal" },
  { id: 3, label: "Seguridad" },
  { id: 4, label: "Sistemas" },
  { id: 5, label: "Resumen" },
] as const;

interface Props {
  currentStep: number;
}

export default function SetupWizardPhase2Stepper({ currentStep }: Props) {
  return (
    <nav
      aria-label="Progreso del registro de tratamiento"
      className="mx-auto flex w-full max-w-[760px] items-start justify-center py-2 md:py-3"
    >
      {SETUP_WIZARD_PHASE2_STEPS.map((step, index) => {
        const isComplete = currentStep > step.id;
        const isActive = currentStep === step.id;

        const circleClass = isComplete
          ? "bg-emerald-600 text-white border-emerald-600"
          : isActive
            ? "bg-[#1A2B5B] text-white border-[#1A2B5B]"
            : "bg-white text-[#94A3B8] border-[#E4EAF6]";

        const labelClass = isActive
          ? "text-[#1A2B5B] font-bold"
          : isComplete
            ? "text-[#64748B] font-semibold"
            : "text-[#94A3B8] font-semibold";

        return (
          <div key={step.id} className="flex min-w-0 flex-1 items-start">
            <div className="flex w-[64px] shrink-0 flex-col items-center gap-1.5 sm:w-[74px]">
              <span
                className={clsx(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300",
                  isActive && "scale-110 shadow-[0_4px_14px_rgba(26,43,91,0.2)]",
                  circleClass
                )}
              >
                {isComplete ? (
                  <Icon icon="tabler:check" className="text-lg stroke-[2.5]" />
                ) : (
                  step.id
                )}
              </span>
              <span
                className={clsx(
                  "max-w-[80px] text-center text-[10px] leading-tight sm:text-[11px]",
                  labelClass
                )}
              >
                {step.label}
              </span>
            </div>
            {index < SETUP_WIZARD_PHASE2_STEPS.length - 1 && (
              <div className="min-w-[24px] flex-1 px-2 pt-[17px]" aria-hidden>
                <div
                  className={clsx(
                    "h-0.5 w-full rounded-full transition-all duration-500",
                    currentStep > step.id ? "bg-emerald-600" : "bg-[#E4EAF6]"
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
