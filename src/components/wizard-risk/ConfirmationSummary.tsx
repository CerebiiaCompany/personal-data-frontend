"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useWizardContext } from "@/contexts/WizardContext";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { useWizardError } from "@/hooks/useWizardError";
import { confirmWizardSession, downloadWizardCompliancePdf } from "@/lib/wizardSession.api";
import { assignCompanyDataOfficer } from "@/lib/company.api";
import { computeWizardCompliancePlan } from "@/utils/wizardCompliance";
import { BLOCK1_QUESTIONS } from "@/constants/wizard-blocks/block1Questions";
import { BLOCK4_QUESTIONS } from "@/constants/wizard-blocks/block4Questions";
import { BLOCK5_DPO_QUESTION } from "@/constants/wizard-blocks/block5Questions";
import { QuestionOption, RiskLevel, WizardConfirmResult } from "@/types/wizardRisk.types";
import Button from "@/components/base/Button";
import WizardDpoStep from "@/components/wizard/WizardDpoStep";

// Batch 12 — categorías de B5-P46 que corresponden a una persona DENTRO de
// la empresa (a diferencia de "external-consulting"/"no-assigned", donde no
// hay un usuario real que designar). Solo para estas se ofrece el selector.
const INTERNAL_DPO_CATEGORIES = ["internal-cto", "internal-legal", "internal-compliance", "internal-other"];

const RISK_LABELS: Record<RiskLevel, string> = { LOW: "Bajo", MEDIUM: "Medio", HIGH: "Alto", CRITICAL: "Crítico" };

// Batch 10 — duplicado a propósito del WIZARD_RISK_NEXT_STEPS del backend
// (wizardRiskSession.controller.ts): se usa como fallback cuando se llega a
// esta pantalla por resumir una sesión ya COMPLETED (sin pasar por
// /confirm en esta visita, así que no hay respuesta de API de la cual
// tomarlo). Mismo criterio de duplicación que las etiquetas del PDF.
const WIZARD_RISK_NEXT_STEPS_FALLBACK = [
  "Comparte este plan de cumplimiento con tu equipo y tu Responsable de Protección de Datos.",
  "Prioriza las medidas recomendadas según el nivel de riesgo de cada tarjeta.",
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
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [dataOfficerUserId, setDataOfficerUserId] = useState<string | undefined>(undefined);
  const [dpoAssignError, setDpoAssignError] = useState<string | null>(null);

  const sector = findLabel(BLOCK1_QUESTIONS[0].options, state.answers["B1-P1"]?.[0]);
  const employees = findLabel(BLOCK1_QUESTIONS[1].options, state.answers["B1-P2"]?.[0]);
  const systemsDocumented = findLabel(BLOCK4_QUESTIONS[1].options, state.answers["B4-P32"]?.[0]);
  const dpoCategory = state.answers["B5-P46"]?.[0];
  const dpoLabel = findLabel(BLOCK5_DPO_QUESTION.options, dpoCategory);
  const plan = computeWizardCompliancePlan(state.answers);
  const showDpoPicker = Boolean(companyId) && INTERNAL_DPO_CATEGORIES.includes(dpoCategory ?? "");

  async function handleConfirm() {
    if (!companyId || !state.sessionId) return;

    setIsSubmitting(true);
    const res = await confirmWizardSession(companyId, state.sessionId, {
      dpoAssigned: dpoCategory ?? "no-assigned",
      acknowledge: true,
      compliancePlan: plan,
    });

    // Batch 12 — la categoría de B5-P46 ("internal-cto", etc.) no es un
    // usuario real: Company.dataOfficerId es un FK a User, y el wizard no
    // preguntaba antes por una persona concreta. Cuando corresponde
    // (ver INTERNAL_DPO_CATEGORIES) y se eligió alguien en el selector, se
    // asigna acá contra el endpoint ya existente y validado
    // (PATCH /companies/:id/data-officer — misma lógica de elegibilidad
    // que usa WizardDpoStep en el asistente viejo), NO dentro de /confirm:
    // un fallo de elegibilidad (rol sin permiso) no debe revertir ni
    // bloquear el plan ya activado, solo avisarse aparte.
    if (dataOfficerUserId) {
      const dpoRes = await assignCompanyDataOfficer(companyId, dataOfficerUserId);
      if (dpoRes.error) {
        setDpoAssignError(
          dpoRes.error.message ?? "No se pudo asignar el responsable de datos."
        );
      }
    }

    setIsSubmitting(false);

    if (res.error || !res.data) {
      showBlockingError("ERR_05");
      return;
    }
    setResult(res.data);
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

  const isAlreadyCompleted = sessionStatus === "COMPLETED";

  if (result || isAlreadyCompleted) {
    const score = result?.compliancePlan.score ?? plan.score;
    const nextSteps = result?.nextSteps ?? WIZARD_RISK_NEXT_STEPS_FALLBACK;

    return (
      <div className="mx-auto w-full max-w-[700px] px-4 py-10 text-center sm:px-6">
        <Icon icon="tabler:circle-check" className="mx-auto text-5xl text-green-600" />
        <h2 className="mt-4 text-xl font-semibold text-primary-900">¡Plan de cumplimiento activado!</h2>
        <p className="mt-2 text-sm text-stone-600">Score de cumplimiento: {score}%</p>
        {typeof result?.treatmentsGenerated === "number" && result.treatmentsGenerated > 0 && (
          <p className="mt-1 text-sm text-primary-700">
            Se crearon {result.treatmentsGenerated} tratamiento
            {result.treatmentsGenerated === 1 ? "" : "s"} en borrador a partir de tu diagnóstico.
          </p>
        )}
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
        {dpoAssignError && (
          <p className="mt-3 text-xs text-amber-600">
            El plan se activó, pero no pudimos asignar al responsable de datos: {dpoAssignError} Podés
            hacerlo desde Perfil de Empresa.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[700px] px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-xl font-semibold text-primary-900">Revisa tu diagnóstico antes de activarlo</h1>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SummaryItem label="Sector" value={sector} />
        <SummaryItem label="Empleados" value={employees} />
        <SummaryItem label="Sistemas documentados" value={systemsDocumented} />
        <SummaryItem label="Sistemas listados" value={String(state.systems.length)} />
        <SummaryItem label="Responsable de datos" value={dpoLabel} />
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

      {plan.recommendedTreatments.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-primary-900">Medidas recomendadas</h2>
          <ul className="mt-2 flex flex-col gap-1.5">
            {plan.recommendedTreatments.map((treatment) => (
              <li key={treatment} className="flex items-start gap-2 text-sm text-stone-700">
                <Icon icon="tabler:shield-check" className="mt-0.5 shrink-0 text-primary-700" />
                {treatment}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showDpoPicker && companyId && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-primary-900">¿Quién será el responsable de datos?</h2>
          <p className="mt-1 text-xs text-stone-500">
            Elegiste &quot;{dpoLabel}&quot; — seleccioná qué usuario de tu equipo cumple ese rol para
            dejarlo asignado de verdad en la empresa. Es opcional: podés hacerlo después desde Perfil
            de Empresa.
          </p>
          <div className="mt-3">
            <WizardDpoStep
              companyId={companyId}
              dataOfficerUserId={dataOfficerUserId}
              onChange={(patch) => {
                if (patch.dataOfficerUserId !== undefined) setDataOfficerUserId(patch.dataOfficerUserId);
              }}
            />
          </div>
        </div>
      )}

      <Button className="mt-8 w-full sm:w-auto" onClick={handleConfirm} loading={isSubmitting}>
        Confirmar y Activar Plan de Cumplimiento
      </Button>
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
