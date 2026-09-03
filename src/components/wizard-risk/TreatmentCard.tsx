"use client";

import { Icon } from "@iconify/react/dist/iconify.js";
import { RiskLevel, TreatmentCardDefinition } from "@/types/wizardRisk.types";
import QuestionCard from "./QuestionCard";

const RISK_BADGE_STYLES: Record<RiskLevel, string> = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};

const RISK_LABELS: Record<RiskLevel, string> = {
  LOW: "Riesgo bajo",
  MEDIUM: "Riesgo medio",
  HIGH: "Riesgo alto",
  CRITICAL: "Riesgo crítico",
};

interface TreatmentCardProps {
  card: TreatmentCardDefinition;
  currentAnswer?: string[];
  isLoading?: boolean;
  onAnswer: (value: string[]) => void;
  onPrevious?: () => void;
  onNext: () => void;
  showPreviousButton?: boolean;
}

/**
 * Variante visual de QuestionCard usada en Bloque 5 Parte 1: agrega un
 * panel con nivel de riesgo + tratamientos recomendados sobre la pregunta.
 * Reutiliza QuestionCard tal cual para la selección/validación/navegación
 * — el panel y la QuestionCard son hermanos con el mismo ancho máximo, en
 * vez de anidar QuestionCard dentro de otro contenedor con padding propio.
 */
export default function TreatmentCard({
  card,
  currentAnswer,
  isLoading,
  onAnswer,
  onPrevious,
  onNext,
  showPreviousButton,
}: TreatmentCardProps) {
  return (
    <div>
      <div className="mx-auto w-full max-w-[700px] px-4 pt-6 sm:px-6 sm:pt-8 md:px-8 md:pt-10">
        <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-primary-900 sm:text-lg">{card.title}</h3>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${RISK_BADGE_STYLES[card.riskLevel]}`}
            >
              {RISK_LABELS[card.riskLevel]}
            </span>
          </div>
          {card.description && <p className="mt-2 text-sm text-stone-600">{card.description}</p>}
          {card.recommendedTreatments.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1.5">
              {card.recommendedTreatments.map((treatment) => (
                <li key={treatment} className="flex items-start gap-2 text-sm text-stone-700">
                  <Icon icon="tabler:shield-check" className="mt-0.5 shrink-0 text-primary-700" />
                  {treatment}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <QuestionCard
        key={card.questionKey}
        questionKey={card.questionKey}
        questionText={card.questionText}
        type="SINGLE_CHOICE"
        options={card.options}
        currentAnswer={currentAnswer}
        isLoading={isLoading}
        onAnswer={onAnswer}
        onPrevious={onPrevious}
        onNext={onNext}
        showPreviousButton={showPreviousButton}
      />
    </div>
  );
}
