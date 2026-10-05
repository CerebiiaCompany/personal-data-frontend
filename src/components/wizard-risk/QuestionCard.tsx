"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Icon } from "@iconify/react/dist/iconify.js";
import { WIZARD_ERRORS } from "@/constants/wizardErrors";
import { QuestionCardProps, WizardConditionalField } from "@/types/wizardRisk.types";
import { encodeAnswer, getConditionalFields, getSelectedValues } from "@/utils/wizardQuestionHelpers";
import ValidationMessage from "./ValidationMessage";
import WizardStepShell from "./WizardStepShell";
import WizardStickyNav from "./WizardStickyNav";

function isValidConditionalUrl(value: string): boolean {
  return /^(https?:\/\/|www\.)/i.test(value.trim());
}

function isTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
}

export default function QuestionCard({
  questionKey,
  questionText,
  helpText,
  tooltipWhy,
  type,
  options,
  conditionalFieldsByOption,
  currentAnswer,
  isLoading = false,
  onAnswer,
  onPrevious,
  onNext,
  showPreviousButton = true,
  canGoNext,
}: QuestionCardProps) {
  const [selected, setSelected] = useState<string[]>(() => getSelectedValues(currentAnswer));
  const [fields, setFields] = useState<Record<string, string>>(() => getConditionalFields(currentAnswer));
  const [showValidationError, setShowValidationError] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string>(WIZARD_ERRORS.ERR_01.message);

  const selectedRef = useRef(selected);
  const fieldsRef = useRef(fields);
  selectedRef.current = selected;
  fieldsRef.current = fields;

  useEffect(() => {
    setSelected(getSelectedValues(currentAnswer));
    setFields(getConditionalFields(currentAnswer));
    setShowValidationError(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionKey]);

  const hasSelection = selected.length > 0;
  const nextEnabled = canGoNext ?? hasSelection;
  const exclusiveValues = new Set(options.filter((option) => option.exclusive).map((option) => option.value));
  const firstExclusiveIndex = options.findIndex((option) => option.exclusive);

  function emit(nextSelected: string[], nextFields: Record<string, string>) {
    onAnswer(encodeAnswer(nextSelected, nextFields));
  }

  function toggleOption(value: string) {
    if (isLoading) return;

    const option = options.find((item) => item.value === value);
    const currentSelected = selectedRef.current;
    let nextSelected: string[];
    let nextFields = { ...fieldsRef.current };

    if (type === "SINGLE_CHOICE") {
      nextSelected = [value];
      nextFields = {};
    } else if (currentSelected.includes(value)) {
      nextSelected = currentSelected.filter((item) => item !== value);
      delete nextFields[value];
    } else if (option?.exclusive) {
      nextSelected = [value];
      nextFields = {};
    } else {
      nextSelected = [...currentSelected.filter((item) => !exclusiveValues.has(item)), value];
      for (const exclusiveValue of exclusiveValues) {
        delete nextFields[exclusiveValue];
      }
    }

    setSelected(nextSelected);
    setFields(nextFields);
    setShowValidationError(false);
    emit(nextSelected, nextFields);
  }

  function handleFieldChange(optionValue: string, value: string) {
    const nextFields = { ...fields, [optionValue]: value };
    setFields(nextFields);
    setShowValidationError(false);
    emit(selected, nextFields);
  }

  function validateFields(): string | null {
    for (const optionValue of selectedRef.current) {
      const field: WizardConditionalField | undefined = conditionalFieldsByOption?.[optionValue];
      if (!field) continue;
      const trimmed = (fieldsRef.current[optionValue] ?? "").trim();
      if (field.required && !trimmed) {
        return `${field.label} es obligatorio.`;
      }
      if (trimmed && field.fieldType === "url" && !isValidConditionalUrl(trimmed)) {
        return "Ingresa una URL válida (debe comenzar con http://, https:// o www.).";
      }
    }
    return null;
  }

  function handleNext() {
    if (!(canGoNext ?? selectedRef.current.length > 0)) {
      setValidationMessage(WIZARD_ERRORS.ERR_01.message);
      setShowValidationError(true);
      return;
    }
    const fieldError = validateFields();
    if (fieldError) {
      setValidationMessage(fieldError);
      setShowValidationError(true);
      return;
    }
    onNext();
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (isLoading || isTypingTarget(event.target)) return;

      if (event.key === "Enter") {
        event.preventDefault();
        handleNext();
        return;
      }

      if (event.key === "ArrowLeft" && showPreviousButton && onPrevious) {
        event.preventDefault();
        onPrevious();
        return;
      }

      const index = Number(event.key) - 1;
      if (index >= 0 && index < options.length) {
        event.preventDefault();
        toggleOption(options[index].value);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // Intencionalmente se re-suscribe al cambiar de pregunta o de set de opciones.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionKey, options, isLoading, showPreviousButton, onPrevious]);

  return (
    <>
      <WizardStepShell>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#EEF3FF] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#1A2B5B]">
            {type === "MULTIPLE_CHOICE" ? "Puedes marcar varias" : "Elige una opción"}
          </span>
          {selected.length > 0 && type === "MULTIPLE_CHOICE" && (
            <span className="text-[12px] font-medium text-[#64748B]">
              {selected.length} seleccionada{selected.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        <h2 className="mt-3 text-[22px] font-bold leading-snug tracking-tight text-[#1A2B5B] sm:text-[26px]">
          {questionText}
        </h2>

        {tooltipWhy && (
          <p className="mt-3 flex items-start gap-2 rounded-2xl bg-[#F4F7FB] px-3.5 py-3 text-sm leading-relaxed text-[#475569]">
            <Icon icon="tabler:info-circle" className="mt-0.5 shrink-0 text-base text-[#1A2B5B]" />
            {tooltipWhy}
          </p>
        )}

        {helpText && <p className="mt-3 text-sm text-[#64748B]">{helpText}</p>}

        <fieldset className="mt-6 flex flex-col gap-2.5" disabled={isLoading}>
          <legend className="sr-only">{questionText}</legend>
          {options.map((option, index) => {
            const checked = selected.includes(option.value);
            const field = conditionalFieldsByOption?.[option.value];
            const showDivider = type === "MULTIPLE_CHOICE" && index === firstExclusiveIndex && firstExclusiveIndex > 0;

            return (
              <div key={option.value}>
                {showDivider && (
                  <p className="mb-2 mt-1 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">
                    o
                  </p>
                )}
                <OptionRow
                  inputId={`option-${questionKey}-${option.value}`}
                  inputType={type === "SINGLE_CHOICE" ? "radio" : "checkbox"}
                  name={questionKey}
                  value={option.value}
                  index={index}
                  label={option.label}
                  helpText={option.helpText}
                  checked={checked}
                  exclusive={Boolean(option.exclusive)}
                  isLoading={isLoading}
                  onChange={() => toggleOption(option.value)}
                />
                {checked && field && (
                  <div className="mt-2 ml-4 rounded-2xl border border-[#E4EAF6] bg-[#F8FAFD] p-3 sm:ml-12">
                    <label
                      htmlFor={`conditional-${questionKey}-${option.value}`}
                      className="mb-1.5 block text-sm font-semibold text-[#1A2B5B]"
                    >
                      {field.label}
                      {field.required && <span className="text-red-600"> *</span>}
                    </label>
                    <input
                      id={`conditional-${questionKey}-${option.value}`}
                      type={field.fieldType === "number" ? "number" : "text"}
                      value={fields[option.value] ?? ""}
                      placeholder={field.placeholder}
                      disabled={isLoading}
                      autoFocus
                      onChange={(event) => handleFieldChange(option.value, event.target.value)}
                      className="w-full rounded-xl border border-[#D7E2F5] bg-white px-3 py-2.5 text-sm text-[#1A2B5B] outline-none focus:border-[#1A2B5B]"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </fieldset>

        {showValidationError && (
          <ValidationMessage message={validationMessage} onDismiss={() => setShowValidationError(false)} />
        )}
      </WizardStepShell>

      <WizardStickyNav
        onPrevious={onPrevious}
        onNext={handleNext}
        showPrevious={showPreviousButton}
        nextEnabled={nextEnabled}
        isLoading={isLoading}
        hint={`1-${options.length} para elegir · Enter para continuar`}
      />
    </>
  );
}

function OptionRow({
  inputId,
  inputType,
  name,
  value,
  index,
  label,
  helpText,
  checked,
  exclusive,
  isLoading,
  onChange,
}: {
  inputId: string;
  inputType: "radio" | "checkbox";
  name: string;
  value?: string;
  index: number;
  label: string;
  helpText?: string;
  checked: boolean;
  exclusive?: boolean;
  isLoading: boolean;
  onChange: () => void;
}) {
  return (
    <label
      htmlFor={inputId}
      className={clsx(
        "flex items-start gap-3 rounded-2xl border px-3.5 py-3.5 transition-all sm:px-4",
        checked
          ? "border-[#1A2B5B] bg-[#EEF3FF] shadow-[0_8px_20px_rgba(26,43,91,0.08)]"
          : exclusive
            ? "border-[#E8EDF7] bg-[#F8FAFD] hover:border-[#C5D0E3]"
            : "border-[#E4EAF6] bg-white hover:border-[#C5D0E3] hover:bg-[#F8FAFD]",
        isLoading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      )}
    >
      <input
        id={inputId}
        type={inputType}
        name={name}
        value={value ?? label}
        checked={checked}
        onChange={onChange}
        disabled={isLoading}
        aria-label={label}
        className="sr-only"
      />
      <span
        aria-hidden
        className={clsx(
          "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[12px] font-bold",
          checked ? "bg-[#1A2B5B] text-white" : "bg-[#F4F7FB] text-[#64748B] ring-1 ring-[#E4EAF6]"
        )}
      >
        {checked ? <Icon icon="tabler:check" className="text-sm" /> : index + 1}
      </span>
      <span className="min-w-0 pt-0.5">
        <span className="block text-sm font-semibold leading-snug text-[#1A2B5B] sm:text-[15px]">{label}</span>
        {helpText && <span className="mt-1 block text-xs text-[#64748B]">{helpText}</span>}
      </span>
    </label>
  );
}
