import { ReactNode } from "react";
import clsx from "clsx";

interface WizardStepShellProps {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}

export default function WizardStepShell({ children, className, wide = false }: WizardStepShellProps) {
  return (
    <div className={clsx("wizard-risk-step-in w-full", className)}>
      <div
        className={clsx(
          "rounded-[28px] border border-[#E4EAF6] bg-white p-5 shadow-[0_18px_50px_rgba(15,35,70,0.08)] sm:p-8",
          wide && "overflow-hidden"
        )}
      >
        {children}
      </div>
    </div>
  );
}
