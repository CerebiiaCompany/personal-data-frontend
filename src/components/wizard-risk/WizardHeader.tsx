"use client";

import { WIZARD_TOTAL_QUESTIONS } from "@/types/wizardRisk.types";

interface WizardHeaderProps {
  currentQuestion: number;
  currentBlock: number;
  blockName: string;
}

export default function WizardHeader({ currentQuestion, currentBlock, blockName }: WizardHeaderProps) {
  const progressPercent = Math.min(
    100,
    Math.round((currentQuestion / WIZARD_TOTAL_QUESTIONS) * 100)
  );

  return (
    <header className="border-b border-stone-200 bg-white px-4 py-3 sm:px-6">
      <p className="text-sm font-semibold text-primary-900">
        Bloque {currentBlock} - {blockName}
      </p>
      <p className="text-xs text-stone-500">
        Pregunta {currentQuestion} de {WIZARD_TOTAL_QUESTIONS}
      </p>
      <div
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progreso del wizard: ${progressPercent}%`}
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-stone-200"
      >
        <div
          className="h-full rounded-full bg-primary-900 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </header>
  );
}
