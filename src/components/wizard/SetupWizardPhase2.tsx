"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import Button from "@/components/base/Button";
import CustomInput from "@/components/forms/CustomInput";
import CustomSelect from "@/components/forms/CustomSelect";
import SetupWizardPhase2Stepper from "@/components/wizard/SetupWizardPhase2Stepper";
import WizardModalShell, {
  WizardModalBody,
  WizardModalHeader,
} from "@/components/wizard/WizardModalShell";
import WizardCheckboxGroup from "@/components/wizard/WizardCheckboxGroup";
import WizardChoiceCards from "@/components/wizard/WizardChoiceCards";
import WizardQuestionCard from "@/components/wizard/WizardQuestionCard";
import {
  LEGAL_BASIS_HINTS,
  RAT_PHASE2_INTRO,
  RAT_STEP_COPY,
} from "@/components/wizard/ratPhase2Copy";
import { useJurisdictionLegalBases } from "@/hooks/useJurisdictionLegalBases";
import { usePolicyTemplates } from "@/hooks/usePolicyTemplates";
import { useTreatmentPurposes } from "@/hooks/useTreatmentPurposes";
import { fetchCompanyUsers } from "@/lib/user.api";
import { applyWizardPhase2, fetchWizardStatus, saveWizardStep } from "@/lib/wizard.api";
import { useOwnCompanyStore } from "@/store/useOwnCompanyStore";
import { useSessionStore } from "@/store/useSessionStore";
import {
  DATA_CATEGORY_OPTIONS,
  DATA_SUBJECT_CATEGORY_OPTIONS,
  LegalBasis,
  RETENTION_START_EVENT_OPTIONS,
  RETENTION_UNIT_OPTIONS,
  SecurityMeasure,
  SECURITY_MEASURE_OPTIONS,
  SYSTEM_TYPE_OPTIONS,
  SystemType,
} from "@/types/treatment.types";
import { SessionUser } from "@/types/user.types";
import {
  WizardDraftAnswers,
  WizardPhase2StepId,
  WizardRatSystemDraft,
  WizardStatus,
} from "@/types/wizard.types";
import { parseApiError } from "@/utils/parseApiError";
import { isWizardPhase1Done } from "@/utils/wizardPhase.utils";

type FlowStep = WizardPhase2StepId | "review";

const FLOW_STEPS: FlowStep[] = ["rat_identity", "rat_legal", "rat_security", "rat_systems", "review"];

function stepToNumber(step: FlowStep): number {
  return FLOW_STEPS.indexOf(step) + 1;
}

interface Props {
  companyId: string;
  mode?: "required" | "voluntary";
  onPhase2Applied: (status?: WizardStatus) => void;
  onCompleted: () => void;
  onDismiss?: () => void;
  onPhase1Required?: () => void;
}

export default function SetupWizardPhase2({
  companyId,
  mode = "required",
  onPhase2Applied,
  onCompleted: _onCompleted,
  onDismiss,
  onPhase1Required,
}: Props) {
  const [status, setStatus] = useState<WizardStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState<FlowStep>("rat_identity");
  const [draft, setDraft] = useState<WizardDraftAnswers>({});

  const sessionUser = useSessionStore((s) => s.user);
  const companyFromStore = useOwnCompanyStore((s) => s.company);
  const countryCode =
    companyFromStore?.countryCode ??
    (sessionUser as SessionUser & { company?: { countryCode?: string } })?.company?.countryCode ??
    draft.identity?.countryCode ??
    "CL";

  const { data: purposes } = useTreatmentPurposes({ companyId, country: countryCode });
  const { options: legalBasisOptions } = useJurisdictionLegalBases(countryCode);
  const { data: consentTemplates } = usePolicyTemplates({ companyId });
  const [owners, setOwners] = useState<SessionUser[]>([]);

  const purposeOptions = useMemo(
    () => (purposes ?? []).map((p) => ({ value: p.id, title: p.label })),
    [purposes]
  );
  const ownerOptions = useMemo(
    () => [
      { value: "", title: "— Seleccionar responsable —" },
      ...owners.map((u) => ({
        value: u._id,
        title: `${u.name} ${u.lastName}`.trim() || u.username,
      })),
    ],
    [owners]
  );
  const consentTemplateOptions = useMemo(
    () => [
      { value: "", title: "— Ninguna por ahora —" },
      ...(consentTemplates ?? []).map((t) => ({ value: t._id, title: t.name })),
    ],
    [consentTemplates]
  );

  const legalBasisChoiceOptions = useMemo(
    () =>
      legalBasisOptions.map((opt) => ({
        value: opt.value,
        title: opt.title,
        description: LEGAL_BASIS_HINTS[opt.value as LegalBasis],
      })),
    [legalBasisOptions]
  );

  const hasConsentTemplates = (consentTemplates?.length ?? 0) > 0;
  const needsPolicyBeforeActivation =
    draft.rat_legal?.legalBasis === "CONSENT" && !draft.rat_legal?.consentTemplateId?.trim();

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await fetchWizardStatus(companyId);
    setLoading(false);
    if (res.error || !res.data) {
      if (res.error) toast.error(parseApiError(res.error));
      return;
    }
    if (!isWizardPhase1Done(res.data)) {
      toast.error(
        "Confirma y aplica la fase 1 del asistente (DPO y contactos ARCO) antes de registrar el tratamiento"
      );
      onPhase1Required?.();
      return;
    }
    setStatus(res.data);
    setDraft(res.data.draft);
    const backendStep = res.data.currentStepId as FlowStep;
    if (FLOW_STEPS.includes(backendStep)) {
      setCurrentStep(backendStep);
    } else if (res.data.phase2Completed) {
      setCurrentStep("review");
    }
  }, [companyId, onPhase1Required]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    fetchCompanyUsers({ companyId, pageSize: 200 }).then((res) => {
      if (res.data) setOwners(res.data as SessionUser[]);
    });
  }, [companyId]);

  // Pre-seleccionar responsable interno con el DPO de fase 1 si aún no hay valor.
  useEffect(() => {
    if (currentStep !== "rat_security") return;
    if (draft.rat_security?.internalOwnerId?.trim()) return;
    const dpoUserId = draft.dpo?.dataOfficerUserId ?? status?.draft.dpo?.dataOfficerUserId;
    if (!dpoUserId) return;
    patchDraft("rat_security", { internalOwnerId: dpoUserId });
  }, [
    currentStep,
    draft.dpo?.dataOfficerUserId,
    draft.rat_security?.internalOwnerId,
    status?.draft.dpo?.dataOfficerUserId,
  ]);

  function patchDraft<K extends keyof WizardDraftAnswers>(key: K, patch: WizardDraftAnswers[K]) {
    setDraft((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }

  function validateClientStep(step: FlowStep): string | null {
    const ratIdentity = draft.rat_identity ?? {};
    const ratLegal = draft.rat_legal ?? {};
    const ratSecurity = draft.rat_security ?? {};
    const systems = draft.rat_systems?.systems ?? [];

    if (step === "rat_identity") {
      if (!ratIdentity.name?.trim()) return "El nombre del tratamiento es obligatorio";
      if (!ratIdentity.purposeId?.trim()) return "Selecciona la finalidad";
    }
    if (step === "rat_legal") {
      if (!ratLegal.legalBasis?.trim()) return "Selecciona la base legal";
      if (!(ratLegal.dataCategories?.length ?? 0)) return "Selecciona categorías de datos";
      if (!(ratLegal.dataSubjectCategories?.length ?? 0)) return "Selecciona categorías de titulares";
      if (
        (ratLegal.legalBasis === "LEGAL_OBLIGATION" ||
          ratLegal.legalBasis === "ECONOMIC_FINANCIAL_DATA" ||
          ratLegal.legalBasis === "RIGHTS_DEFENSE") &&
        !ratLegal.legalBasisJustification?.trim()
      ) {
        return "La justificación de la base legal es obligatoria";
      }
    }
    if (step === "rat_security") {
      if (!ratSecurity.internalOwnerId?.trim()) return "Designa el responsable interno";
      if (!ratSecurity.retentionValue || ratSecurity.retentionValue <= 0) {
        return "Indica la duración de conservación";
      }
      if (!ratSecurity.retentionUnit) return "Selecciona la unidad de conservación";
      if (!ratSecurity.retentionStartEvent) return "Selecciona el evento de inicio de conservación";
      if (!(ratSecurity.securityMeasures?.length ?? 0)) {
        return "Selecciona al menos una medida de seguridad";
      }
      const hasGeo = ratLegal.dataCategories?.includes("GEOLOCATION");
      if (hasGeo) {
        if (!ratSecurity.geolocationDuration?.trim()) {
          return "Indica la duración del tratamiento de geolocalización";
        }
        if (ratSecurity.geolocationSharedWithThirdParties == null) {
          return "Indica si la geolocalización se comparte con terceros";
        }
        if (
          ratSecurity.geolocationSharedWithThirdParties &&
          !ratSecurity.geolocationThirdPartiesIdentity?.trim()
        ) {
          return "Indica con qué terceros se comparte la geolocalización";
        }
      }
    }
    if (step === "rat_systems") {
      for (const s of systems) {
        if (s.name?.trim() && !s.type?.trim()) return "Completa el tipo de cada sistema agregado";
      }
    }
    return null;
  }

  async function persistStep(step: WizardPhase2StepId, advance: boolean) {
    const clientError = validateClientStep(step);
    if (clientError) {
      toast.error(clientError);
      return false;
    }

    setSaving(true);
    let payload: Record<string, unknown> = { ...(draft[step] ?? {}), advance };

    if (step === "rat_security" && draft.rat_security?.retentionValue != null) {
      payload.retentionValue = Number(draft.rat_security.retentionValue);
    }

    const res = await saveWizardStep(companyId, step, payload);
    setSaving(false);

    if (res.error) {
      toast.error(parseApiError(res.error));
      return false;
    }

    if (res.data) {
      setDraft(res.data.draft);
      if (advance && step !== "rat_systems") {
        const idx = FLOW_STEPS.indexOf(step);
        setCurrentStep(FLOW_STEPS[idx + 1]);
      }
    }
    return true;
  }

  async function handleNext() {
    if (currentStep === "review") {
      setSaving(true);
      const res = await applyWizardPhase2(companyId);
      setSaving(false);
      if (res.error) {
        toast.error(parseApiError(res.error));
        return;
      }
      toast.success(
        mode === "voluntary"
          ? "Tratamiento actualizado correctamente"
          : "Primer tratamiento registrado. Continúa con tu política de privacidad."
      );
      onPhase2Applied(res.data ?? undefined);
      return;
    }

    const ok = await persistStep(currentStep as WizardPhase2StepId, true);
    if (ok && currentStep === "rat_systems") {
      setCurrentStep("review");
    }
  }

  function handleBack() {
    const idx = FLOW_STEPS.indexOf(currentStep);
    if (idx > 0) setCurrentStep(FLOW_STEPS[idx - 1]);
  }

  function addSystem() {
    const systems = [...(draft.rat_systems?.systems ?? [])];
    systems.push({ name: "", type: "OTHER", provider: "", isOutsideChile: false });
    patchDraft("rat_systems", { systems });
  }

  function updateSystem(index: number, patch: Partial<WizardRatSystemDraft>) {
    const systems = [...(draft.rat_systems?.systems ?? [])];
    systems[index] = { ...systems[index], ...patch };
    patchDraft("rat_systems", { systems });
  }

  function removeSystem(index: number) {
    const systems = [...(draft.rat_systems?.systems ?? [])];
    systems.splice(index, 1);
    patchDraft("rat_systems", { systems });
  }

  const hasGeolocation = draft.rat_legal?.dataCategories?.includes("GEOLOCATION");
  const legalBasis = draft.rat_legal?.legalBasis as LegalBasis | undefined;

  if (loading && !status) {
    return (
      <WizardModalShell loading loadingMessage="Cargando tratamiento…" mode={mode} onDismiss={onDismiss} />
    );
  }

  return (
    <WizardModalShell mode={mode} onDismiss={onDismiss} stepKey={currentStep} footer={
      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#EEF2F8] pt-5 sm:flex-row sm:justify-between">
        <Button
          type="button"
          hierarchy="secondary"
          disabled={currentStep === "rat_identity" || saving}
          onClick={handleBack}
        >
          Atrás
        </Button>
        <Button type="button" loading={saving} onClick={handleNext}>
          {currentStep === "review" ? "Confirmar tratamiento" : "Siguiente"}
        </Button>
      </div>
    }>
      <WizardModalHeader
        icon="tabler:list-details"
        phase={2}
        title="Registro de tratamiento (RAT)"
        subtitle={RAT_PHASE2_INTRO}
      />

      <SetupWizardPhase2Stepper currentStep={stepToNumber(currentStep)} />

      <WizardModalBody stepKey={currentStep} className="mt-6 space-y-4">
          {currentStep === "rat_identity" && (
            <div className="space-y-4">
              <WizardQuestionCard
                question={RAT_STEP_COPY.rat_identity.title}
                hint={RAT_STEP_COPY.rat_identity.nameHint}
              >
                <CustomInput
                  label="Nombre de esta actividad"
                  placeholder="Ej. Clientes del sitio web"
                  value={draft.rat_identity?.name ?? ""}
                  onChange={(e) => patchDraft("rat_identity", { name: e.target.value })}
                />
              </WizardQuestionCard>
              <WizardQuestionCard
                question="¿Para qué usarás estos datos?"
                hint={RAT_STEP_COPY.rat_identity.purposeHint}
              >
                <CustomSelect
                  label="Finalidad principal"
                  options={purposeOptions}
                  value={draft.rat_identity?.purposeId ?? ""}
                  unselectedText="Seleccionar finalidad"
                  onChange={(val) => patchDraft("rat_identity", { purposeId: val })}
                />
                <CustomInput
                  label="Cuéntanos un poco más (opcional)"
                  className="mt-3"
                  placeholder="Ej. Enviar cotizaciones y dar seguimiento comercial"
                  value={draft.rat_identity?.purposeDetail ?? ""}
                  onChange={(e) => patchDraft("rat_identity", { purposeDetail: e.target.value })}
                />
              </WizardQuestionCard>
            </div>
          )}

          {currentStep === "rat_legal" && (
            <div className="space-y-4">
              <WizardQuestionCard
                question={RAT_STEP_COPY.rat_legal.legalBasisQuestion}
                hint={RAT_STEP_COPY.rat_legal.legalBasisHint}
              >
                <WizardChoiceCards
                  options={legalBasisChoiceOptions}
                  value={draft.rat_legal?.legalBasis ?? ""}
                  onChange={(val) =>
                    patchDraft("rat_legal", {
                      legalBasis: val,
                      consentTemplateId: val === "CONSENT" ? draft.rat_legal?.consentTemplateId : null,
                    })
                  }
                />
              </WizardQuestionCard>

              {legalBasis === "CONSENT" && (
                <WizardQuestionCard
                  question={RAT_STEP_COPY.rat_legal.consentPolicyQuestion}
                  hint={
                    hasConsentTemplates
                      ? RAT_STEP_COPY.rat_legal.consentPolicyHintWithTemplates
                      : RAT_STEP_COPY.rat_legal.consentPolicyHintNoTemplates
                  }
                >
                  {!hasConsentTemplates && (
                    <div className="mb-3 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
                      <Icon icon="tabler:info-circle" className="mt-0.5 shrink-0 text-lg" />
                      <p>
                        Puedes continuar sin política. El tratamiento quedará en borrador hasta que subas
                        o generes la política en{" "}
                        <a href="/admin/plantillas" className="font-medium underline hover:no-underline">
                          Políticas de tratamiento
                        </a>
                        .
                      </p>
                    </div>
                  )}
                  {hasConsentTemplates && (
                    <CustomSelect
                      label="Vincular política existente (opcional)"
                      options={consentTemplateOptions}
                      value={draft.rat_legal?.consentTemplateId ?? ""}
                      unselectedText="Ninguna por ahora"
                      onChange={(val) => patchDraft("rat_legal", { consentTemplateId: val || null })}
                    />
                  )}
                </WizardQuestionCard>
              )}

              {(legalBasis === "LEGAL_OBLIGATION" ||
                legalBasis === "ECONOMIC_FINANCIAL_DATA" ||
                legalBasis === "RIGHTS_DEFENSE") && (
                <WizardQuestionCard
                  question={RAT_STEP_COPY.rat_legal.justificationQuestion}
                  hint={RAT_STEP_COPY.rat_legal.justificationHint}
                >
                  <CustomInput
                    label="Explica brevemente"
                    value={draft.rat_legal?.legalBasisJustification ?? ""}
                    onChange={(e) =>
                      patchDraft("rat_legal", { legalBasisJustification: e.target.value })
                    }
                  />
                </WizardQuestionCard>
              )}

              <WizardQuestionCard
                question={RAT_STEP_COPY.rat_legal.dataCategoriesQuestion}
                hint={RAT_STEP_COPY.rat_legal.dataCategoriesHint}
              >
                <WizardCheckboxGroup
                  label=""
                  options={DATA_CATEGORY_OPTIONS}
                  values={draft.rat_legal?.dataCategories ?? []}
                  onChange={(values) => patchDraft("rat_legal", { dataCategories: values })}
                />
              </WizardQuestionCard>

              <WizardQuestionCard
                question={RAT_STEP_COPY.rat_legal.subjectCategoriesQuestion}
                hint={RAT_STEP_COPY.rat_legal.subjectCategoriesHint}
              >
                <WizardCheckboxGroup
                  label=""
                  options={DATA_SUBJECT_CATEGORY_OPTIONS}
                  values={draft.rat_legal?.dataSubjectCategories ?? []}
                  onChange={(values) => patchDraft("rat_legal", { dataSubjectCategories: values })}
                />
              </WizardQuestionCard>

              <WizardQuestionCard question={RAT_STEP_COPY.rat_legal.dataSourceQuestion}>
                <CustomInput
                  label="Origen de los datos"
                  placeholder="Ej. Formulario web, contrato firmado, referido"
                  value={draft.rat_legal?.dataSource ?? ""}
                  onChange={(e) => patchDraft("rat_legal", { dataSource: e.target.value })}
                />
              </WizardQuestionCard>

              <WizardQuestionCard question={RAT_STEP_COPY.rat_legal.consequencesQuestion}>
                <CustomInput
                  label="Consecuencias si no los entregan"
                  placeholder="Ej. No podremos prestar el servicio contratado"
                  value={draft.rat_legal?.nonDeliveryConsequences ?? ""}
                  onChange={(e) =>
                    patchDraft("rat_legal", { nonDeliveryConsequences: e.target.value })
                  }
                />
              </WizardQuestionCard>
            </div>
          )}

          {currentStep === "rat_security" && (
            <div className="space-y-4">
              <WizardQuestionCard
                question={RAT_STEP_COPY.rat_security.ownerQuestion}
                hint={RAT_STEP_COPY.rat_security.ownerHint}
              >
                <CustomSelect
                  label="Responsable interno"
                  options={ownerOptions}
                  value={draft.rat_security?.internalOwnerId ?? ""}
                  unselectedText="Seleccionar responsable"
                  onChange={(val) => patchDraft("rat_security", { internalOwnerId: val })}
                />
              </WizardQuestionCard>

              <WizardQuestionCard
                question={RAT_STEP_COPY.rat_security.retentionQuestion}
                hint={RAT_STEP_COPY.rat_security.retentionHint}
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <CustomInput
                    label="Cantidad"
                    type="number"
                    min={1}
                    value={draft.rat_security?.retentionValue?.toString() ?? ""}
                    onChange={(e) =>
                      patchDraft("rat_security", {
                        retentionValue: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                  <CustomSelect
                    label="Unidad"
                    options={RETENTION_UNIT_OPTIONS}
                    value={draft.rat_security?.retentionUnit ?? ""}
                    unselectedText="Seleccionar"
                    onChange={(val) => patchDraft("rat_security", { retentionUnit: val })}
                  />
                  <CustomSelect
                    label="Desde cuándo cuenta"
                    options={RETENTION_START_EVENT_OPTIONS}
                    value={draft.rat_security?.retentionStartEvent ?? ""}
                    unselectedText="Seleccionar"
                    onChange={(val) => patchDraft("rat_security", { retentionStartEvent: val })}
                  />
                </div>
              </WizardQuestionCard>

              <WizardQuestionCard
                question={RAT_STEP_COPY.rat_security.securityQuestion}
                hint={RAT_STEP_COPY.rat_security.securityHint}
              >
                <WizardCheckboxGroup
                  label=""
                  options={SECURITY_MEASURE_OPTIONS}
                  values={(draft.rat_security?.securityMeasures ?? []) as SecurityMeasure[]}
                  onChange={(values) => patchDraft("rat_security", { securityMeasures: values })}
                />
              </WizardQuestionCard>

              {hasGeolocation && (
                <WizardQuestionCard
                  question="Usas geolocalización: ¿por cuánto tiempo y con quién la compartes?"
                  hint="La ley exige detallar el plazo y si se transfiere a terceros."
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <CustomInput
                      label="Duración del uso de geolocalización"
                      value={draft.rat_security?.geolocationDuration ?? ""}
                      onChange={(e) =>
                        patchDraft("rat_security", { geolocationDuration: e.target.value })
                      }
                    />
                    <CustomSelect
                      label="¿Se comparte con terceros?"
                      options={[
                        { value: "false", title: "No" },
                        { value: "true", title: "Sí" },
                      ]}
                      value={
                        draft.rat_security?.geolocationSharedWithThirdParties == null
                          ? ""
                          : draft.rat_security.geolocationSharedWithThirdParties
                            ? "true"
                            : "false"
                      }
                      unselectedText="Seleccionar"
                      onChange={(val) =>
                        patchDraft("rat_security", {
                          geolocationSharedWithThirdParties: val === "true",
                        })
                      }
                    />
                    {draft.rat_security?.geolocationSharedWithThirdParties && (
                      <CustomInput
                        label="¿Con qué terceros?"
                        className="sm:col-span-2"
                        value={draft.rat_security?.geolocationThirdPartiesIdentity ?? ""}
                        onChange={(e) =>
                          patchDraft("rat_security", {
                            geolocationThirdPartiesIdentity: e.target.value,
                          })
                        }
                      />
                    )}
                  </div>
                </WizardQuestionCard>
              )}
            </div>
          )}

          {currentStep === "rat_systems" && (
            <div className="space-y-4">
              <WizardQuestionCard
                question={RAT_STEP_COPY.rat_systems.question}
                hint={RAT_STEP_COPY.rat_systems.hint}
              >
              {(draft.rat_systems?.systems ?? []).map((system, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 gap-3 rounded-xl border border-[#E8EDF7] p-4 sm:grid-cols-2"
                >
                  <CustomInput
                    label="Nombre del sistema"
                    value={system.name}
                    onChange={(e) => updateSystem(index, { name: e.target.value })}
                  />
                  <CustomSelect
                    label="Tipo"
                    options={SYSTEM_TYPE_OPTIONS}
                    value={system.type}
                    unselectedText="Seleccionar tipo"
                    onChange={(val) => updateSystem(index, { type: val as SystemType })}
                  />
                  <CustomInput
                    label="Proveedor (opcional)"
                    value={system.provider ?? ""}
                    onChange={(e) => updateSystem(index, { provider: e.target.value })}
                  />
                  <label className="flex items-center gap-2 self-end pb-2 text-sm text-[#64748B]">
                    <input
                      type="checkbox"
                      checked={Boolean(system.isOutsideChile)}
                      onChange={(e) => updateSystem(index, { isOutsideChile: e.target.checked })}
                    />
                    Proveedor fuera de Chile
                  </label>
                  <button
                    type="button"
                    onClick={() => removeSystem(index)}
                    className="text-left text-sm text-red-500 hover:underline sm:col-span-2"
                  >
                    Eliminar sistema
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSystem}
                className="flex items-center gap-1.5 text-sm font-medium text-[#3357A5] hover:underline"
              >
                <Icon icon="tabler:plus" />
                Agregar sistema
              </button>
              </WizardQuestionCard>
            </div>
          )}

          {currentStep === "review" && (
            <div className="space-y-3 rounded-xl border border-[#E8EDF7] bg-[#F8FAFF] p-4 text-sm text-[#334155]">
              <p className="font-medium text-[#1A2B5B]">Resumen de lo que registraremos</p>
              <p>
                <span className="font-semibold text-[#1A2B5B]">Actividad:</span>{" "}
                {draft.rat_identity?.name}
              </p>
              <p>
                <span className="font-semibold text-[#1A2B5B]">Base legal:</span>{" "}
                {legalBasisOptions.find((o) => o.value === draft.rat_legal?.legalBasis)?.title ??
                  draft.rat_legal?.legalBasis}
              </p>
              <p>
                <span className="font-semibold text-[#1A2B5B]">Tipos de datos:</span>{" "}
                {(draft.rat_legal?.dataCategories ?? []).length} categoría(s)
              </p>
              <p>
                <span className="font-semibold text-[#1A2B5B]">Sistemas:</span>{" "}
                {draft.rat_systems?.systems?.filter((s) => s.name?.trim()).length ?? 0} registrado(s)
              </p>
              {needsPolicyBeforeActivation && (
                <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-amber-900">
                  <Icon icon="tabler:alert-triangle" className="mt-0.5 shrink-0 text-lg" />
                  <p>
                    Elegiste consentimiento como base legal. Antes de activar el tratamiento deberás
                    subir o generar tu política de tratamiento en{" "}
                    <a href="/admin/plantillas" className="font-medium underline hover:no-underline">
                      Políticas
                    </a>
                    .
                  </p>
                </div>
              )}
              <p className="text-stone-500">
                Al confirmar creamos el registro en borrador. Tu DPO podrá revisarlo y solicitar su
                activación cuando todo esté listo.
              </p>
            </div>
          )}
      </WizardModalBody>
    </WizardModalShell>
  );
}
