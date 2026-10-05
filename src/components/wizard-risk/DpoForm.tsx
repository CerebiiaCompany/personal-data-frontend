"use client";

import { useState } from "react";
import { WizardDpoForm } from "@/types/wizardRisk.types";
import ValidationMessage from "./ValidationMessage";
import WizardStepShell from "./WizardStepShell";
import WizardStickyNav from "./WizardStickyNav";

interface DpoFormProps {
  value: WizardDpoForm | null;
  onChange: (value: WizardDpoForm) => void;
  isLoading?: boolean;
  onPrevious?: () => void;
  onNext: () => void;
  showPreviousButton?: boolean;
}

const EMPTY_FORM: WizardDpoForm = { name: "", position: "", email: "", phone: "" };

// REQ Wizard v2.2 — mismas reglas que se validan de nuevo en el backend al
// confirmar (ver WIZARD_RISK_confirm): esta validación de cliente es solo
// para dar feedback inmediato, no la única barrera.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CHILE_PHONE_PATTERN = /^(\+56)?\d{9}$/;

function validate(form: WizardDpoForm): Record<keyof WizardDpoForm, string | null> {
  return {
    name: form.name.trim().length >= 5 && /[a-zA-Zá-úÁ-Ú]/.test(form.name) ? null : "Ingresa el nombre completo (mínimo 5 caracteres).",
    position: form.position.trim().length >= 3 ? null : "Ingresa el cargo (mínimo 3 caracteres).",
    email: EMAIL_PATTERN.test(form.email.trim()) ? null : "Ingresa un correo válido.",
    phone: CHILE_PHONE_PATTERN.test(form.phone.trim().replace(/[\s-]/g, ""))
      ? null
      : "Ingresa un teléfono válido (9 dígitos, o +56 seguido de 9 dígitos).",
  };
}

/**
 * REQ Wizard v2.2 — reemplaza el selector de categoría de B5-P46: en vez
 * de elegir "quién dentro de la empresa" es el DPO, se captura directo el
 * nombre/cargo/correo/teléfono de la persona real. Al confirmar el wizard
 * (ConfirmationSummary), el backend crea un usuario real con estos datos y
 * lo asigna como Company.dataOfficerId — ver confirmWizardRiskSession.
 *
 * Sigue el mismo patrón que SystemsTable.tsx: paso propio del bloque, no
 * una QuestionCard más, así que valida y guarda su propio estado en
 * WizardContext (`state.dpoForm`) en vez de usar `answers`.
 */
export default function DpoForm({
  value,
  onChange,
  isLoading = false,
  onPrevious,
  onNext,
  showPreviousButton = true,
}: DpoFormProps) {
  const form = value ?? EMPTY_FORM;
  const [showErrors, setShowErrors] = useState(false);

  function handleField(field: keyof WizardDpoForm, fieldValue: string) {
    onChange({ ...form, [field]: fieldValue });
  }

  const errors = validate(form);
  const firstError = Object.values(errors).find((e) => e !== null) ?? null;

  function handleNext() {
    if (firstError) {
      setShowErrors(true);
      return;
    }
    onNext();
  }

  return (
    <>
    <WizardStepShell>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#94A3B8]">Último paso del bloque</p>
      <h2 className="mt-1 text-xl font-bold tracking-tight text-[#1A2B5B] sm:text-2xl">
        Designación del DPO
      </h2>
      <p className="mt-2 text-sm text-[#64748B]">
        Con estos datos creamos su acceso a CEREBIIA — podrá activar su cuenta después.
      </p>

      <div className="mt-5 flex flex-col gap-3">
        <Field
          label="Nombre"
          value={form.name}
          placeholder="Nombre y apellido"
          disabled={isLoading}
          error={showErrors ? errors.name : null}
          onChange={(v) => handleField("name", v)}
        />
        <Field
          label="Cargo"
          value={form.position}
          placeholder="ej. Encargado de Cumplimiento"
          disabled={isLoading}
          error={showErrors ? errors.position : null}
          onChange={(v) => handleField("position", v)}
        />
        <Field
          label="Correo"
          type="email"
          value={form.email}
          placeholder="dpo@miempresa.cl"
          disabled={isLoading}
          error={showErrors ? errors.email : null}
          onChange={(v) => handleField("email", v)}
        />
        <Field
          label="Teléfono"
          value={form.phone}
          placeholder="+56912345678"
          disabled={isLoading}
          error={showErrors ? errors.phone : null}
          onChange={(v) => handleField("phone", v)}
        />
      </div>

      {showErrors && firstError && (
        <ValidationMessage message={firstError} onDismiss={() => setShowErrors(false)} />
      )}

    </WizardStepShell>
      <WizardStickyNav
        onPrevious={onPrevious}
        onNext={handleNext}
        showPrevious={showPreviousButton}
        nextEnabled={!firstError}
        isLoading={isLoading}
      />
    </>
  );
}

function Field({
  label,
  value,
  placeholder,
  disabled,
  error,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string | null;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-primary-900">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-[#D7E2F5] px-3 py-2.5 text-sm text-[#1A2B5B] outline-none focus:border-[#1A2B5B]"
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}
