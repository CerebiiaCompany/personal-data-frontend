"use client";

import { personasFlowSteps } from "@/constants/personasData";
import clsx from "clsx";
import { usePathname } from "next/navigation";

const PersonasFlowStepper = () => {
  const pathname = usePathname();
  const currentIndex = personasFlowSteps.findIndex((s) => s.path === pathname);

  return (
    <nav
      aria-label="Progreso"
      className="mx-auto mb-10 flex w-full max-w-md justify-center"
    >
      <ol className="flex w-full items-center">
        {personasFlowSteps.map((step, index) => {
          const isActive = index === currentIndex;
          const isDone = index < currentIndex;

          return (
            <li
              key={step.id}
              className={clsx(
                "flex flex-1 items-center",
                index < personasFlowSteps.length - 1 && "gap-0"
              )}
            >
              <div className="flex flex-col items-center gap-2">
                <span
                  className={clsx(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all",
                    isDone && "bg-primary-900 text-white",
                    isActive &&
                      "bg-primary-900 text-white ring-4 ring-primary-900/15",
                    !isDone &&
                      !isActive &&
                      "bg-zinc-100 text-zinc-400"
                  )}
                >
                  {isDone ? "✓" : index + 1}
                </span>
                <span
                  className={clsx(
                    "hidden text-xs font-medium sm:block",
                    isActive ? "text-primary-900" : "text-zinc-400"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < personasFlowSteps.length - 1 && (
                <div
                  className={clsx(
                    "mx-1 h-px flex-1 sm:mx-2",
                    isDone ? "bg-primary-900" : "bg-zinc-200"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default PersonasFlowStepper;
