"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Icon } from "@iconify/react/dist/iconify.js";
import Button from "@/components/base/Button";
import { WIZARD_ERRORS } from "@/constants/wizardErrors";
import { QuestionCardProps } from "@/types/wizardRisk.types";
import ValidationMessage from "./ValidationMessage";

/**
 * Componente pregunta reutilizable — usado por las 30 preguntas del wizard.
 *
 * Contrato entre `onAnswer` y `onNext`: `onAnswer` se dispara con cada
 * cambio de selección (el padre puede ir reflejando el borrador en
 * WizardContext sin esperar a "Siguiente"); `onNext` es la señal de
 * "avanzar" una vez pasada la validación local, y es el padre quien decide
 * qué hacer con ella (guardar en backend, navegar, etc.) — este componente
 * no conoce la red. `isLoading` es controlado por el padre para reflejar
 * ese guardado (deshabilita inputs y muestra el spinner en "Siguiente").
 *
 * El botón "Siguiente" nunca usa el atributo `disabled` nativo cuando no
 * hay selección: en vez de eso se ve "apagado" (hierarchy secondary) pero
 * sigue siendo clickeable, para poder mostrar el error de validación
 * (ERR-01) al hacer clic — un botón realmente disabled no dispara
 * `onClick` y ocultaría el motivo al usuario.
 */
export default function QuestionCard({
  questionKey,
  questionText,
  helpText,
  tooltipWhy,
  type,
  options,
  currentAnswer,
  isLoading = false,
  onAnswer,
  onPrevious,
  onNext,
  showPreviousButton = true,
  canGoNext,
}: QuestionCardProps) {
  const [selected, setSelected] = useState<string[]>(currentAnswer ?? []);
  const [showValidationError, setShowValidationError] = useState(false);
  const [showWhy, setShowWhy] = useState(false);

  // Cada pregunta es una "página" nueva: al cambiar questionKey se resetea
  // la selección local y cualquier error de validación pendiente.
  useEffect(() => {
    setSelected(currentAnswer ?? []);
    setShowValidationError(false);
    setShowWhy(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionKey]);

  const hasSelection = selected.length > 0;
  const nextEnabled = canGoNext ?? hasSelection;

  function toggleOption(value: string) {
    if (isLoading) return;

    const next =
      type === "SINGLE_CHOICE"
        ? [value]
        : selected.includes(value)
          ? selected.filter((v) => v !== value)
          : [...selected, value];

    setSelected(next);
    setShowValidationError(false);
    onAnswer(next);
  }

  function handleNext() {
    if (!hasSelection) {
      setShowValidationError(true);
      return;
    }
    onNext();
  }

  return (
    <div className="mx-auto w-full max-w-[700px] px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
      <div className="flex items-start gap-2">
        <h2 className="text-lg font-semibold text-primary-900 sm:text-xl">{questionText}</h2>
        {tooltipWhy && (
          <button
            type="button"
            aria-label="Por qué lo preguntamos"
            aria-expanded={showWhy}
            title={tooltipWhy}
            onClick={() => setShowWhy((v) => !v)}
            className="mt-0.5 shrink-0 text-stone-400 hover:text-stone-600"
          >
            <Icon icon="tabler:help-circle" className="text-lg" />
          </button>
        )}
      </div>

      {showWhy && tooltipWhy && (
        <p className="mt-2 rounded-md bg-stone-50 p-2 text-xs text-stone-600">{tooltipWhy}</p>
      )}

      {helpText && <p className="mt-2 text-sm text-stone-500">{helpText}</p>}

      <fieldset className="mt-5 flex flex-col gap-3" disabled={isLoading}>
        <legend className="sr-only">{questionText}</legend>
        {options.map((option) => {
          const inputId = `option-${questionKey}-${option.value}`;
          const checked = selected.includes(option.value);
          return (
            <label
              key={option.value}
              htmlFor={inputId}
              className={clsx(
                "flex items-start gap-3 rounded-lg border p-3 transition-colors",
                checked ? "border-primary-700 bg-primary-50" : "border-stone-200 bg-white",
                isLoading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
              )}
            >
              <input
                id={inputId}
                type={type === "SINGLE_CHOICE" ? "radio" : "checkbox"}
                name={questionKey}
                value={option.value}
                checked={checked}
                onChange={() => toggleOption(option.value)}
                disabled={isLoading}
                aria-label={option.label}
                className="mt-0.5 h-5 w-5 shrink-0 accent-primary-700"
              />
              <span>
                <span className="block text-sm font-medium text-primary-900 sm:text-base">
                  {option.label}
                </span>
                {option.helpText && (
                  <span className="mt-0.5 block text-xs text-stone-500">{option.helpText}</span>
                )}
              </span>
            </label>
          );
        })}
      </fieldset>

      {showValidationError && (
        <ValidationMessage
          message={WIZARD_ERRORS.ERR_01.message}
          onDismiss={() => setShowValidationError(false)}
        />
      )}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        {showPreviousButton && onPrevious ? (
          <Button
            hierarchy="secondary"
            className="w-full sm:w-auto"
            onClick={onPrevious}
            disabled={isLoading}
          >
            Anterior
          </Button>
        ) : (
          <span />
        )}
        <Button
          hierarchy={nextEnabled ? "primary" : "secondary"}
          className="w-full sm:w-auto"
          onClick={handleNext}
          loading={isLoading}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
