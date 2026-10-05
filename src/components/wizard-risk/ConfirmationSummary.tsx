"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useWizardContext } from "@/contexts/WizardContext";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { useWizardError } from "@/hooks/useWizardError";
import { confirmReopenedWizardSession, confirmWizardSession, downloadWizardCompliancePdf } from "@/lib/wizardSession.api";
import { computeWizardCompliancePlan } from "@/utils/wizardCompliance";
import { toPersistableTreatments } from "@/utils/wizardTreatmentPersist";
import { acceptedBiometricConsentTreatments } from "@/utils/wizardBiometricConsent";
import { BLOCK1_QUESTIONS } from "@/constants/wizard-blocks/block1Questions";
import { QuestionOption, RiskLevel, WizardConfirmResult, WizardReopenConfirmResult } from "@/types/wizardRisk.types";
import Button from "@/components/base/Button";

const RISK_LABELS: Record<RiskLevel, string> = { LOW: "Bajo", MEDIUM: "Medio", HIGH: "Alto", CRITICAL: "Crítico" };

// Batch 10 — duplicado a propósito del WIZARD_RISK_NEXT_STEPS del backend
// (wizardRiskSession.controller.ts): se usa como fallback cuando se llega a
// esta pantalla por resumir una sesión ya COMPLETED (sin pasar por
// /confirm en esta visita, así que no hay respuesta de API de la cual
// tomarlo). Mismo criterio de duplicación que las etiquetas del PDF.
const WIZARD_RISK_NEXT_STEPS_FALLBACK = [
  "Comparte este plan de cumplimiento con tu equipo y tu Responsable de Protección de Datos.",
  "Prioriza las medidas recomendadas según el nivel de riesgo de cada tarjeta.",
  "Si inferiste tratamientos biométricos, envía el consentimiento OTP (Art. 16) desde la ficha de cada tratamiento antes de activarlo.",
  "Agenda una revisión de este diagnóstico en los próximos 6 meses o ante cambios relevantes en tus tratamientos.",
];

function findLabel(options: QuestionOption[], value: string | undefined): string {
  return options.find((o) => o.value === value)?.label ?? "—";
}

interface ConfirmationSummaryProps {
  /** Estado real de la sesión según el backend (createOrResumeWizardSession), no el `state.status` del contexto (ver WizardContainer). */
  sessionStatus: string;
}

/**
 * Pantalla de confirmación (Batch 9) — reemplaza el placeholder de
 * /wizard/finalizacion. Calcula el plan de cumplimiento en el cliente
 * (ver utils/wizardCompliance.ts) y lo envía al confirmar; el backend solo
 * valida, persiste y marca la sesión COMPLETED.
 *
 * Batch 10 — si se llega acá con una sesión que el backend ya devolvió
 * como COMPLETED (revisitando /wizard/finalizacion, o vía el enlace del
 * correo de confirmación), se muestra la vista de éxito directamente sin
 * volver a llamar /confirm — el plan se recalcula en el cliente a partir
 * de las respuestas ya hidratadas (mismo cálculo, determinístico).
 */
export default function ConfirmationSummary({ sessionStatus }: ConfirmationSummaryProps) {
  const router = useRouter();
  const { state } = useWizardContext();
  const companyId = useActiveCompanyId();
  const { showBlockingError } = useWizardError();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<WizardConfirmResult | null>(null);
  const [reopenResult, setReopenResult] = useState<WizardReopenConfirmResult | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [dpoFormError, setDpoFormError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // Item N-15 — una sesión EDITING (reabierta desde COMPLETED para corregir
  // Bloques 1 a 4) confirma distinto: sin dpoForm/acknowledge, endpoint
  // reopen/confirm en vez de confirm, y el resultado es una reconciliación
  // (creados/desactivados/en conflicto), no "tratamientos generados" + DPO.
  const isEditing = sessionStatus === "EDITING";

  const sector = findLabel(BLOCK1_QUESTIONS[0].options, state.answers["B1-P1"]?.[0]);
  const employees = findLabel(BLOCK1_QUESTIONS[1].options, state.answers["B1-P2"]?.[0]);
  const plan = computeWizardCompliancePlan(state.answers, state.treatments);
  const biometricTreatments = acceptedBiometricConsentTreatments(state.treatments);

  async function handleConfirm() {
    if (!companyId || !state.sessionId) return;

    if (isEditing) {
      setIsSubmitting(true);
      setConfirmError(null);
      const res = await confirmReopenedWizardSession(companyId, state.sessionId, {
        treatments: toPersistableTreatments(state.treatments),
        compliancePlan: plan,
      });
      setIsSubmitting(false);

      if (res.error || !res.data) {
        setConfirmError(res.error?.message ?? "No se pudieron guardar los cambios del diagnóstico.");
        showBlockingError("ERR_05");
        return;
      }
      setReopenResult(res.data);
      return;
    }

    // El formulario de DPO (WizardBlock5/DpoForm) ya exige los 4 campos
    // para poder avanzar hasta acá — este chequeo es solo un respaldo
    // (ej. estado recuperado de localStorage de una versión previa sin
    // el formulario nuevo, o navegación directa a /wizard/finalizacion).
    if (!state.dpoForm?.name || !state.dpoForm.position || !state.dpoForm.email || !state.dpoForm.phone) {
      setDpoFormError("Falta completar los datos del DPO — volvé al paso anterior para completarlos.");
      return;
    }

    setIsSubmitting(true);
    setConfirmError(null);
    const persistableTreatments = toPersistableTreatments(state.treatments);
    const res = await confirmWizardSession(companyId, state.sessionId, {
      dpoAssigned: state.dpoForm.name,
      dpoForm: state.dpoForm,
      acknowledge: true,
      compliancePlan: plan,
      treatments: persistableTreatments,
    });
    setIsSubmitting(false);

    if (res.error || !res.data) {
      setConfirmError(res.error?.message ?? "No se pudo activar el plan de cumplimiento.");
      showBlockingError("ERR_05");
      return;
    }
    setResult({
      ...res.data,
      treatmentsGenerated: res.data.treatmentsGenerated ?? persistableTreatments.length,
    });
  }

  async function handleDownloadPdf() {
    if (!companyId || !state.sessionId) return;
    setPdfError(null);
    setIsDownloadingPdf(true);
    const res = await downloadWizardCompliancePdf(companyId, state.sessionId);
    setIsDownloadingPdf(false);
    if (res.error) {
      setPdfError(res.error.message ?? "No se pudo descargar el plan de cumplimiento.");
    }
  }

  if (reopenResult) {
    return (
      <div className="mx-auto w-full max-w-[700px] rounded-[28px] border border-[#E4EAF6] bg-white px-6 py-10 text-center shadow-[0_18px_50px_rgba(15,35,70,0.08)] sm:px-8">
        <Icon icon="tabler:circle-check" className="mx-auto text-5xl text-green-600" />
        <h2 className="mt-4 text-xl font-semibold text-primary-900">¡Diagnóstico actualizado!</h2>
        <p className="mt-2 text-sm text-stone-600">Score de cumplimiento: {reopenResult.compliancePlan.score}%</p>
        <ul className="mt-6 flex flex-col gap-2 text-left text-sm text-stone-700">
          {reopenResult.treatmentsCreated > 0 && (
            <li className="flex items-start gap-2">
              <Icon icon="tabler:circle-plus" className="mt-0.5 shrink-0 text-emerald-600" />
              Se crearon {reopenResult.treatmentsCreated} tratamiento{reopenResult.treatmentsCreated === 1 ? "" : "s"} nuevo{reopenResult.treatmentsCreated === 1 ? "" : "s"} en borrador.
            </li>
          )}
          {reopenResult.treatmentsDeactivated > 0 && (
            <li className="flex items-start gap-2">
              <Icon icon="tabler:circle-minus" className="mt-0.5 shrink-0 text-amber-600" />
              {reopenResult.treatmentsDeactivated} tratamiento{reopenResult.treatmentsDeactivated === 1 ? "" : "s"} ya no aplica{reopenResult.treatmentsDeactivated === 1 ? "" : "n"} según tus nuevas respuestas — quedaron marcados para desactivar en el listado RAT.
            </li>
          )}
          {reopenResult.treatmentsConflicted > 0 && (
            <li className="flex items-start gap-2">
              <Icon icon="tabler:alert-triangle" className="mt-0.5 shrink-0 text-red-600" />
              {reopenResult.treatmentsConflicted} tratamiento{reopenResult.treatmentsConflicted === 1 ? "" : "s"} quedó{reopenResult.treatmentsConflicted === 1 ? "" : "aron"} con un conflicto que requiere revisión manual en el listado RAT.
            </li>
          )}
          {reopenResult.treatmentsCreated === 0 && reopenResult.treatmentsDeactivated === 0 && reopenResult.treatmentsConflicted === 0 && (
            <li className="flex items-start gap-2">
              <Icon icon="tabler:info-circle" className="mt-0.5 shrink-0 text-primary-700" />
              No hubo cambios en tus tratamientos — tus respuestas actualizadas coinciden con el RAT existente.
            </li>
          )}
        </ul>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => router.push("/admin")}>Ir al panel</Button>
          <Button hierarchy="secondary" onClick={() => router.push("/admin/tratamientos")}>
            Ver Tratamientos
          </Button>
        </div>
      </div>
    );
  }

  // EDITING nunca debe caer acá antes de que el admin confirme — a
  // diferencia de COMPLETED, no hay un resultado ya persistido que mostrar
  // (reopenResult recién existe después de handleConfirm).
  const isAlreadyCompleted = sessionStatus === "COMPLETED";

  if (result || isAlreadyCompleted) {
    const score = result?.compliancePlan.score ?? plan.score;
    const nextSteps = result?.nextSteps ?? WIZARD_RISK_NEXT_STEPS_FALLBACK;

    return (
      <div className="mx-auto w-full max-w-[700px] rounded-[28px] border border-[#E4EAF6] bg-white px-6 py-10 text-center shadow-[0_18px_50px_rgba(15,35,70,0.08)] sm:px-8">
        <Icon icon="tabler:circle-check" className="mx-auto text-5xl text-green-600" />
        <h2 className="mt-4 text-xl font-semibold text-primary-900">¡Plan de cumplimiento activado!</h2>
        <p className="mt-2 text-sm text-stone-600">Score de cumplimiento: {score}%</p>
        <p className="mt-1 text-sm text-primary-700">
          {typeof result?.treatmentsGenerated === "number" && result.treatmentsGenerated > 0
            ? `Se crearon ${result.treatmentsGenerated} tratamiento${result.treatmentsGenerated === 1 ? "" : "s"} en borrador a partir de tu diagnóstico.`
            : "El plan quedó activado. Si no ves tratamientos nuevos, revisa el listado RAT o vuelve a confirmar con los tratamientos aceptados."}
        </p>
        <ul className="mt-6 flex flex-col gap-2 text-left text-sm text-stone-700">
          {nextSteps.map((step) => (
            <li key={step} className="flex items-start gap-2">
              <Icon icon="tabler:arrow-right" className="mt-0.5 shrink-0 text-primary-700" />
              {step}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => router.push("/admin")}>Ir al panel</Button>
          {typeof result?.treatmentsGenerated === "number" && result.treatmentsGenerated > 0 && (
            <Button hierarchy="secondary" onClick={() => router.push("/admin/tratamientos")}>
              Ver Tratamientos
            </Button>
          )}
          <Button hierarchy="secondary" onClick={handleDownloadPdf} loading={isDownloadingPdf}>
            Descargar PDF
          </Button>
        </div>
        {pdfError && <p className="mt-3 text-xs text-red-600">{pdfError}</p>}
        {result?.dpoCreated && (
          <div className="mt-6 rounded-lg border border-primary-200 bg-primary-50 p-4 text-left">
            <p className="text-sm font-semibold text-primary-900">Acceso del DPO creado</p>
            <p className="mt-1 text-xs text-stone-600">
              Compartí estos datos con {state.dpoForm?.name ?? "el DPO"} para que active su cuenta —
              esta contraseña temporal no se muestra de nuevo.
            </p>
            <p className="mt-2 text-sm text-stone-700">
              Usuario: <span className="font-mono font-medium">{result.dpoCreated.username}</span>
            </p>
            <p className="text-sm text-stone-700">
              Contraseña temporal: <span className="font-mono font-medium">{result.dpoCreated.tempPassword}</span>
            </p>
          </div>
        )}
        {biometricTreatments.length > 0 && (
          <div className="mt-6 rounded-lg border border-violet-200 bg-violet-50/80 p-4 text-left">
            <p className="text-sm font-semibold text-violet-950">Siguiente paso: consentimiento biométrico (C-01)</p>
            <p className="mt-1 text-xs text-violet-900/90">
              Abre cada tratamiento biométrico y envía el documento con código OTP a los titulares. La confirmación
              queda con hash SHA-256 — no necesitas Firma Electrónica Avanzada.
            </p>
            <ul className="mt-3 space-y-1 text-sm text-violet-900">
              {biometricTreatments.map((row) => (
                <li key={row.id}>• {row.name}</li>
              ))}
            </ul>
            <Button
              className="mt-4"
              hierarchy="secondary"
              onClick={() => router.push("/admin/tratamientos")}
            >
              Ir a Tratamientos y enviar consentimientos
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[760px]">
      <div className="rounded-[28px] border border-[#E4EAF6] bg-white p-5 shadow-[0_18px_50px_rgba(15,35,70,0.08)] sm:p-8">
      <h1 className="text-xl font-bold tracking-tight text-[#1A2B5B] sm:text-2xl">
        {isEditing ? "Revisa los cambios antes de guardarlos" : "Revisa tu diagnóstico antes de activarlo"}
      </h1>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SummaryItem label="Sector" value={sector} />
        <SummaryItem label="Empleados" value={employees} />
        <SummaryItem label="Sistemas listados" value={String(state.systems.length)} />
        <SummaryItem label="Tratamientos validados" value={String(state.treatments.filter((row) => row.accepted).length)} />
        {!isEditing && (
          <SummaryItem
            label="Responsable de datos"
            value={state.dpoForm?.name ? `${state.dpoForm.name} (${state.dpoForm.position})` : "—"}
          />
        )}
        <SummaryItem label="Score de cumplimiento estimado" value={`${plan.score}%`} />
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-primary-900">Riesgos detectados</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {(Object.entries(plan.riskCounts) as [RiskLevel, number][])
            .filter(([, count]) => count > 0)
            .map(([level, count]) => (
              <span key={level} className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700">
                {RISK_LABELS[level]}: {count}
              </span>
            ))}
          {plan.recommendedTreatments.length === 0 && (
            <span className="text-xs text-stone-500">Sin riesgos pendientes detectados.</span>
          )}
        </div>
      </div>

      {state.treatments.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-primary-900">Tratamientos generados</h2>
          <ul className="mt-2 flex flex-col gap-3">
            {state.treatments.map((treatment) => (
              <li key={treatment.id} className="rounded-lg border border-stone-200 bg-white p-3">
                <p className="text-sm font-medium text-primary-900">{treatment.name}</p>
                <p className="mt-1 text-xs text-stone-500">Base legal: {treatment.legalBasis}</p>
                <p className="mt-1 text-xs text-stone-500">Medidas: {treatment.securityMeasures}</p>
                <p className="mt-1 text-xs text-stone-500">Conservación: {treatment.retentionPeriod}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {biometricTreatments.length > 0 && (
        <div className="mt-6 rounded-lg border border-violet-200 bg-violet-50/70 p-4 text-left">
          <p className="text-sm font-semibold text-violet-950">Consentimiento biométrico pendiente (C-01)</p>
          <p className="mt-1 text-xs text-violet-900/90">
            Tras activar el plan, deberás enviar el documento con OTP a cada titular desde la ficha del tratamiento.
            No se requiere Firma Electrónica Avanzada.
          </p>
          <ul className="mt-2 space-y-1 text-xs text-violet-900">
            {biometricTreatments.map((row) => (
              <li key={row.id}>• {row.name}</li>
            ))}
          </ul>
        </div>
      )}

      {dpoFormError && <p className="mt-4 text-xs text-red-600">{dpoFormError}</p>}
      {confirmError && <p className="mt-4 text-sm text-red-600">{confirmError}</p>}

      <Button className="mt-8 w-full rounded-xl! px-6! py-3! sm:w-auto" onClick={handleConfirm} loading={isSubmitting}>
        {isEditing ? "Guardar cambios y actualizar RATs" : "Confirmar y Activar Plan de Cumplimiento"}
      </Button>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-3">
      <p className="text-xs uppercase text-stone-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-primary-900">{value}</p>
    </div>
  );
}
