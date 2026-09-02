"use client";

import { ReactNode } from "react";
import clsx from "clsx";

interface Props {
  question: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

/** Bloque de pregunta guiada del asistente (lenguaje claro, no jerga RAT). */
export default function WizardQuestionCard({ question, hint, children, className }: Props) {
  return (
    <section
      className={clsx(
        "rounded-xl border border-[#E8EDF7] bg-gradient-to-b from-[#FAFBFF] to-white p-4 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] transition-shadow duration-200 hover:shadow-[0_4px_20px_rgba(26,43,91,0.06)] sm:p-5",
        className
      )}
    >
      <h3 className="text-base font-semibold text-[#1A2B5B]">{question}</h3>
      {hint ? <p className="mt-1.5 text-sm leading-relaxed text-[#64748B]">{hint}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}
