"use client";

import { useState, type ReactNode } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Button from "@/components/base/Button";
import { WizardTreatment } from "@/types/wizardRisk.types";
import ValidationMessage from "./ValidationMessage";
import WizardStepShell from "./WizardStepShell";
import WizardStickyNav from "./WizardStickyNav";

// Item C-04 — "La marca aparece en el resumen de validación del wizard junto
// con una nota de qué falta confirmar". Espejo del texto que el backend usa
// para TreatmentPendingNote.reasonText (ver PENDING_REVIEW_REASON_BY_QUESTION
// en wizardTreatmentGeneration.ts) — acá solo es un adelanto informativo
// dentro del wizard, antes de que exista la nota real en BD (esa se crea
// recién al confirmar el Bloque 5).
const PENDING_REVIEW_REASON_BY_QUESTION: Record<string, string> = {
  "B2-P11":
    "Respondiste \"No estoy seguro\" sobre si la empresa usa servicios digitales fuera de Chile — este tratamiento depende de esa respuesta para su transferencia internacional.",
  "B3-P26":
    "Respondiste \"No sé\" sobre si existen registros de actividad de usuarios.",
  "B2-P13":
    "Respondiste \"No estoy seguro\" sobre si la empresa usa inteligencia artificial o decisiones automatizadas.",
  "B3-P36":
    "Respondiste \"No estoy seguro\" sobre si la empresa es un sujeto obligado a reportar ante la UAF.",
  "B4-systems":
    "No se pudo confirmar el país del servidor de un sistema del inventario. El catálogo solo sugiere ese dato: si no puedes confirmarlo, el tratamiento queda pendiente de verificar y no se asume transferencia internacional.",
};

function pendingReviewReason(questionKey?: string): string {
  if (questionKey && PENDING_REVIEW_REASON_BY_QUESTION[questionKey]) {
    return PENDING_REVIEW_REASON_BY_QUESTION[questionKey];
  }
  return "Este tratamiento se generó a partir de una respuesta marcada como incierta.";
}

interface TreatmentSummaryProps {
  treatments: WizardTreatment[];
  onChange: (treatments: WizardTreatment[]) => void;
  isLoading?: boolean;
  onPrevious?: () => void;
  onNext: () => void;
  showPreviousButton?: boolean;
}

const EMPTY_TREATMENT: Omit<WizardTreatment, "id"> = {
  name: "",
  legalBasis: "",
  securityMeasures: "",
  retentionPeriod: "",
  accepted: false,
  modified: true,
  sourceKeys: [],
};

export default function TreatmentSummary({
  treatments,
  onChange,
  isLoading = false,
  onPrevious,
  onNext,
  showPreviousButton = true,
}: TreatmentSummaryProps) {
  const [showValidationError, setShowValidationError] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function updateTreatment(id: string, patch: Partial<WizardTreatment>) {
    onChange(
      treatments.map((row) => (row.id === id ? { ...row, ...patch, modified: patch.accepted === undefined ? true : row.modified } : row))
    );
  }

  function acceptAll() {
    onChange(treatments.map((row) => ({ ...row, accepted: true })));
    setShowValidationError(false);
  }

  function addTreatment() {
    const id = crypto.randomUUID();
    onChange([...treatments, { ...EMPTY_TREATMENT, id }]);
    setExpandedId(id);
  }

  function removeTreatment(id: string) {
    onChange(treatments.filter((row) => row.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  function toggleExpanded(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  function isComplete(row: WizardTreatment): boolean {
    return Boolean(row.name.trim() && row.legalBasis.trim() && row.securityMeasures.trim() && row.retentionPeriod.trim());
  }

  function handleNext() {
    if (treatments.length === 0 || treatments.some((row) => !row.accepted || !isComplete(row))) {
      setShowValidationError(true);
      return;
    }
    onNext();
  }

  const allAccepted = treatments.length > 0 && treatments.every((row) => row.accepted && isComplete(row));

  return (
    <>
    <WizardStepShell>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#1A2B5B] sm:text-2xl">Validación de tratamientos</h2>
          <p className="mt-2 text-sm text-[#64748B]">
            Despliega un tratamiento para revisar o corregir sus datos. Acepta cada uno cuando esté en
            orden — no hace falta abrirlos todos.
          </p>
        </div>
        {treatments.length > 0 && (
          <span className="rounded-full bg-[#EEF3FB] px-3 py-1 text-xs font-semibold text-[#1A2B5B]">
            {treatments.length} tratamiento{treatments.length === 1 ? "" : "s"} inferido{treatments.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button hierarchy="secondary" onClick={acceptAll} disabled={isLoading || treatments.length === 0}>
          Aceptar todos
        </Button>
        <Button hierarchy="secondary" onClick={addTreatment} disabled={isLoading} startContent={<Icon icon="tabler:plus" />}>
          Agregar tratamiento
        </Button>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        {treatments.length === 0 && (
          <p className="rounded-lg border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-500">
            No se infirieron tratamientos. Agrega al menos uno para continuar, o vuelve a los bloques anteriores
            si faltó marcar una actividad.
          </p>
        )}

        {treatments.map((treatment, index) => {
          const expanded = expandedId === treatment.id;
          const complete = isComplete(treatment);

          return (
          <article
            key={treatment.id}
            className={`rounded-xl border ${
              treatment.accepted ? "border-emerald-200 bg-emerald-50/40" : "border-stone-200 bg-white"
            }`}
          >
            <div className="flex items-stretch gap-1">
              <button
                type="button"
                onClick={() => toggleExpanded(treatment.id)}
                aria-expanded={expanded}
                className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left"
              >
                <Icon
                  icon="tabler:chevron-right"
                  className={`shrink-0 text-lg text-[#94A3B8] transition-transform ${expanded ? "rotate-90" : ""}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-[#1A2B5B]">
                      {treatment.name.trim() || `Tratamiento ${index + 1}`}
                    </p>
                    <span className="rounded bg-[#F1F5F9] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-[#64748B]">
                      {treatment.id.replace(/-/g, "_").slice(0, 28)}
                    </span>
                    {treatment.isSensitive && <Badge tone="rose">Dato sensible</Badge>}
                    {treatment.internationalTransfer && <Badge tone="amber">TI</Badge>}
                    {treatment.generatesPendingReview && (
                      <Badge tone="orange">Pendiente de verificar</Badge>
                    )}
                    {treatment.modified && <span className="text-[10px] font-semibold uppercase text-amber-700">Modificado</span>}
                  </div>
                </div>
                {treatment.legalBasis && (
                  <LegalBasisPill label={treatment.legalBasis} code={treatment.legalBasisCode} />
                )}
                {treatment.accepted && (
                  <Icon icon="tabler:circle-check-filled" className="shrink-0 text-lg text-emerald-600" />
                )}
              </button>
              <button
                type="button"
                onClick={() => removeTreatment(treatment.id)}
                disabled={isLoading}
                aria-label={`Eliminar ${treatment.name || "tratamiento"}`}
                className="shrink-0 px-3 text-red-600 hover:text-red-800"
              >
                <Icon icon="tabler:trash" className="text-lg" />
              </button>
            </div>

            {expanded && (
            <div className="border-t border-[#E4EAF6] px-4 pb-4 pt-3">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex flex-wrap gap-2">
                {treatment.isSensitive && (
                  <Badge tone="rose">Datos sensibles{treatment.sensitiveLegalRef ? ` · ${treatment.sensitiveLegalRef}` : ""}</Badge>
                )}
                {treatment.internationalTransfer && (
                  <Badge tone="amber">Transferencia internacional</Badge>
                )}
                {treatment.legalBasisLocked && <Badge tone="navy">Base legal bloqueada</Badge>}
              </div>

              {treatment.generatesPendingReview && (
                <div className="flex items-start gap-2 rounded-xl border border-orange-200 bg-orange-50/70 px-3 py-2.5 text-xs leading-relaxed text-orange-900">
                  <Icon icon="tabler:help-circle" className="mt-0.5 shrink-0 text-base" />
                  <div>
                    <p className="font-semibold">Este tratamiento quedará marcado como pendiente de verificar.</p>
                    <p className="mt-0.5">{pendingReviewReason(treatment.pendingReviewQuestionKey)}</p>
                    <p className="mt-1">
                      No bloquea completar el wizard — se confirma después, sin reabrirlo, desde la ficha del
                      tratamiento en Registro de Tratamientos.
                    </p>
                  </div>
                </div>
              )}

              {treatment.primaryData && treatment.primaryData.length > 0 && (
                <div>
                  <p className="mb-1.5 text-sm font-medium text-primary-900">Datos principales pre-llenados</p>
                  <div className="flex flex-wrap gap-1.5">
                    {treatment.primaryData.map((item, itemIndex) => (
                      <span key={`${treatment.id}-data-${itemIndex}`} className="rounded-full bg-[#EEF3FB] px-2.5 py-1 text-xs text-[#1A2B5B]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {treatment.internationalTransferReason && (
                <p className="text-xs text-[#64748B]">{treatment.internationalTransferReason}</p>
              )}

              <Field
                label="Nombre"
                value={treatment.name}
                disabled={isLoading}
                onChange={(value) => updateTreatment(treatment.id, { name: value })}
              />
              <Field
                label="Base legal"
                value={treatment.legalBasis}
                disabled={isLoading || treatment.legalBasisLocked}
                hint={treatment.legalBasisRestriction}
                onChange={(value) => updateTreatment(treatment.id, { legalBasis: value })}
              />
              {treatment.securityMeasureItems && treatment.securityMeasureItems.length > 0 && (
                <div>
                  <p className="mb-1.5 text-sm font-medium text-primary-900">Medidas de seguridad inyectadas</p>
                  <p className="mb-2 text-xs text-[#64748B]">
                    Las medidas obligatorias y de alto riesgo no se pueden quitar. Puedes complementar el texto
                    de abajo.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {treatment.securityMeasureItems.map((item, itemIndex) => (
                      <span
                        key={`${treatment.id}-sec-${itemIndex}`}
                        className={`rounded-full px-2.5 py-1 text-xs ${
                          item.removable ? "bg-stone-100 text-stone-600" : "bg-[#EEF3FB] text-[#1A2B5B]"
                        }`}
                      >
                        {item.label}
                        {!item.removable && " · fija"}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <Field
                label="Medidas de seguridad"
                value={treatment.securityMeasures}
                disabled={isLoading}
                multiline
                onChange={(value) => updateTreatment(treatment.id, { securityMeasures: value })}
              />
              <Field
                label="Período de conservación"
                value={treatment.retentionPeriod}
                disabled={isLoading}
                hint={
                  treatment.retentionStartEvent
                    ? `Evento que inicia el conteo: ${treatment.retentionStartEvent}${
                        treatment.retentionCanReduce === false ? " · No reducir bajo el mínimo legal." : ""
                      }`
                    : undefined
                }
                onChange={(value) => updateTreatment(treatment.id, { retentionPeriod: value })}
              />
              {/* Item Especificación de Finalidad (Niveles 1, 2 y 3) — SMG,
                  02-sep-2026: fila generada automáticamente igual que las
                  demás de este resumen, editable de la misma forma. Nivel
                  1/2 se muestran como contexto (de dónde salió la
                  categoría); lo editable es el detalle (Nivel 3). Sin fila
                  en wizard_finalidad_templates para este tratamiento (hoy:
                  decisiones_automatizadas, menores), no se muestra nada. */}
              {(treatment.purposeNivel1Label || treatment.purposeNivel2) && (
                <div className="flex flex-wrap gap-1.5">
                  {treatment.purposeNivel1Label && (
                    <span className="rounded-full bg-[#EEF3FB] px-2.5 py-1 text-xs font-medium text-[#1A2B5B]">
                      Nivel 1 · {treatment.purposeNivel1Label}
                    </span>
                  )}
                  {treatment.purposeNivel2 && (
                    <span className="rounded-full bg-[#F1F5F9] px-2.5 py-1 text-xs text-[#475569]">
                      Nivel 2 · {treatment.purposeNivel2}
                    </span>
                  )}
                </div>
              )}
              {treatment.purposeDetail !== undefined && (
                <Field
                  label="Finalidad detallada (Nivel 3)"
                  value={treatment.purposeDetail}
                  disabled={isLoading}
                  multiline
                  onChange={(value) => updateTreatment(treatment.id, { purposeDetail: value })}
                />
              )}
            </div>

            <Button
              hierarchy={treatment.accepted ? "secondary" : "primary"}
              className="mt-4 w-full sm:w-auto"
              disabled={isLoading || !complete}
              onClick={() => updateTreatment(treatment.id, { accepted: !treatment.accepted })}
            >
              {treatment.accepted ? "Aceptado" : "Aceptar este tratamiento"}
            </Button>
            </div>
            )}
          </article>
          );
        })}
      </div>

      {showValidationError && (
        <ValidationMessage
          message="Acepta cada tratamiento (o agrégalo y complétalo) antes de continuar."
          onDismiss={() => setShowValidationError(false)}
        />
      )}

    </WizardStepShell>
      <WizardStickyNav
        onPrevious={onPrevious}
        onNext={handleNext}
        showPrevious={showPreviousButton}
        nextEnabled={allAccepted}
        isLoading={isLoading}
      />
    </>
  );
}

function Field({
  label,
  value,
  disabled,
  multiline,
  hint,
  onChange,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  multiline?: boolean;
  hint?: string;
  onChange: (value: string) => void;
}) {
  const className =
    "w-full rounded-xl border border-[#D7E2F5] px-3 py-2.5 text-sm text-[#1A2B5B] outline-none focus:border-[#1A2B5B] disabled:bg-[#F8FAFC] disabled:text-[#64748B]";

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-primary-900">{label}</span>
      {multiline ? (
        <textarea value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} rows={4} className={className} />
      ) : (
        <input type="text" value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className={className} />
      )}
      {hint && <span className="text-xs text-[#64748B]">{hint}</span>}
    </label>
  );
}

function Badge({ children, tone }: { children: ReactNode; tone: "rose" | "amber" | "navy" | "orange" }) {
  const tones = {
    rose: "bg-rose-50 text-rose-800",
    amber: "bg-amber-50 text-amber-800",
    navy: "bg-[#EEF3FB] text-[#1A2B5B]",
    orange: "bg-orange-50 text-orange-800",
  };

  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

function LegalBasisPill({ label, code }: { label: string; code?: string }) {
  const text = `${code ?? ""} ${label}`.toLowerCase();
  let tone = "bg-[#EEF3FB] text-[#1A2B5B]";
  if (text.includes("obligacion") || text.includes("obligación") || text.includes("legal_obligation")) {
    tone = "bg-emerald-50 text-emerald-800";
  } else if (text.includes("consent")) {
    tone = "bg-amber-50 text-amber-800";
  } else if (text.includes("interes") || text.includes("interés") || text.includes("legitimate")) {
    tone = "bg-violet-50 text-violet-800";
  } else if (text.includes("economic") || text.includes("económic") || text.includes("financier")) {
    tone = "bg-orange-50 text-orange-900";
  } else if (text.includes("contrato") || text.includes("contract")) {
    tone = "bg-sky-50 text-sky-800";
  }

  const shortLabel = label.split(" (")[0];

  return <span className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium sm:inline ${tone}`}>{shortLabel}</span>;
}
