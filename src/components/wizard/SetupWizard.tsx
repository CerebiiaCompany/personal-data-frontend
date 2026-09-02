"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import Button from "@/components/base/Button";
import CustomInput from "@/components/forms/CustomInput";
import CustomSelect from "@/components/forms/CustomSelect";
import CompanyUserMultiSelect from "@/components/company-profile/CompanyUserMultiSelect";
import SetupWizardStepper from "@/components/wizard/SetupWizardStepper";
import WizardDpoStep from "@/components/wizard/WizardDpoStep";
import WizardModalShell, {
  WizardModalBody,
  WizardModalHeader,
} from "@/components/wizard/WizardModalShell";
import { useCompanyUsers } from "@/hooks/useCompanyUsers";
import { useJurisdictionGeographicDivisions } from "@/hooks/useJurisdictionGeographicDivisions";
import { applyWizardPhase1, fetchWizardStatus, saveWizardStep } from "@/lib/wizard.api";
import { useSessionStore } from "@/store/useSessionStore";
import { getCompanyCountryLabel } from "@/types/company.types";
import { CompanyUserSummary } from "@/types/company.types";
import { WizardDraftAnswers, WizardStatus } from "@/types/wizard.types";
import { parseApiError } from "@/utils/parseApiError";
import {
  formatRutDisplay,
  isValidRut,
  normalizeRut,
  RUT_INVALID_MESSAGE,
} from "@/utils/rutValidator";
import { getArcoPortalUrl } from "@/utils/arcoPortalUrl.utils";

type FlowStep = "identity" | "legal_representative" | "dpo" | "arco" | "review";

const FLOW_STEPS: FlowStep[] = ["identity", "legal_representative", "dpo", "arco", "review"];

function stepToNumber(step: FlowStep): number {
  return FLOW_STEPS.indexOf(step) + 1;
}

interface Props {
  companyId: string;
  mode?: "required" | "voluntary";
  /** Tras guardar fase 1: el padre debe montar la fase 2 (RAT). */
  onPhase1Applied: (status?: WizardStatus) => void;
  onCompleted: (status?: WizardStatus) => void;
  onDismiss?: () => void;
}

export default function SetupWizard({
  companyId,
  mode = "required",
  onPhase1Applied,
  onCompleted: _onCompleted,
  onDismiss,
}: Props) {
  const [status, setStatus] = useState<WizardStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState<FlowStep>("identity");
  const [draft, setDraft] = useState<WizardDraftAnswers>({});

  const sessionUser = useSessionStore((s) => s.user);

  const [arcoSearch, setArcoSearch] = useState("");
  const [arcoDebouncedSearch, setArcoDebouncedSearch] = useState("");
  const [arcoPage, setArcoPage] = useState(1);
  const [arcoUsers, setArcoUsers] = useState<CompanyUserSummary[]>([]);

  const countryCode = status?.draft.identity?.countryCode ?? draft.identity?.countryCode ?? "CL";
  const isChile = countryCode === "CL";

  const { regionOptions, getProvinciaOptions, getComunaOptions } =
    useJurisdictionGeographicDivisions("CL");

  const selectedRegion = draft.identity?.regionName ?? "";
  const selectedProvince = draft.identity?.provinceName ?? "";
  const provinciaOptions = useMemo(
    () => getProvinciaOptions(selectedRegion),
    [getProvinciaOptions, selectedRegion]
  );
  const comunaOptions = useMemo(
    () => getComunaOptions(selectedRegion, selectedProvince),
    [getComunaOptions, selectedRegion, selectedProvince]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await fetchWizardStatus(companyId);
    setLoading(false);
    if (res.error || !res.data) {
      if (res.error) toast.error(parseApiError(res.error));
      return;
    }
    setStatus(res.data);
    setDraft(res.data.draft);
    const backendStep = res.data.currentStepId as FlowStep;
    if (FLOW_STEPS.includes(backendStep)) {
      setCurrentStep(backendStep);
    }
  }, [companyId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const t = setTimeout(() => setArcoDebouncedSearch(arcoSearch), 400);
    return () => clearTimeout(t);
  }, [arcoSearch]);

  const { data: arcoPageData, loading: arcoLoading, meta: arcoMeta } = useCompanyUsers({
    companyId: currentStep === "arco" || currentStep === "review" ? companyId : undefined,
    page: arcoPage,
    pageSize: 50,
    search: arcoDebouncedSearch,
  });

  useEffect(() => {
    if (!arcoPageData) return;
    setArcoUsers((prev) => (arcoPage === 1 ? arcoPageData : [...prev, ...arcoPageData]));
  }, [arcoPageData, arcoPage]);

  function patchDraft<K extends keyof WizardDraftAnswers>(key: K, patch: WizardDraftAnswers[K]) {
    setDraft((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }

  function validateClientStep(step: FlowStep): string | null {
    const identity = draft.identity ?? {};
    const legal = draft.legal_representative ?? {};
    const dpo = draft.dpo ?? {};
    const arco = draft.arco ?? {};

    if (step === "identity") {
      if (!identity.name?.trim()) return "El nombre de la empresa es requerido";
      if (!identity.nit?.trim()) return "El documento de la empresa es requerido";
      if (!identity.publicContactEmail?.trim()) return "El correo de contacto público es requerido";
      if (isChile && !isValidRut(identity.nit)) return RUT_INVALID_MESSAGE;
      if (isChile && !identity.regionName) return "Selecciona la región";
      if (isChile && !identity.provinceName) return "Selecciona la provincia";
      if (isChile && !identity.communeName) return "Selecciona la comuna";
      if (isChile && !identity.address?.trim()) return "La dirección es requerida";
    }
    if (step === "legal_representative") {
      if (!legal.managerName?.trim()) return "El nombre del representante legal es requerido";
      if (!legal.managerDocNumber?.trim()) return "El documento del representante es requerido";
      if (isChile && !isValidRut(legal.managerDocNumber)) return RUT_INVALID_MESSAGE;
    }
    if (step === "dpo") {
      if (!dpo.dataOfficerUserId) return "Debe designar un Oficial de Protección de Datos";
    }
    if (step === "arco") {
      if (!arco.publicContactEmail?.trim()) return "El correo ARCO de contacto es requerido";
      if (!arco.rightsAttentionPhoneLine?.trim()) return "La línea telefónica es requerida";
      if (!arco.rightsAttentionUserIds?.length) return "Selecciona al menos un encargado ARCO";
    }
    return null;
  }

  async function persistStep(step: Exclude<FlowStep, "review">, advance: boolean) {
    const clientError = validateClientStep(step);
    if (clientError) {
      toast.error(clientError);
      return false;
    }

    setSaving(true);
    let payload: Record<string, unknown> = {};

    if (step === "identity") {
      payload = {
        ...draft.identity,
        nit: isChile ? normalizeRut(draft.identity?.nit ?? "") : draft.identity?.nit,
        advance,
      };
    } else if (step === "legal_representative") {
      payload = {
        ...draft.legal_representative,
        managerDocNumber: isChile
          ? normalizeRut(draft.legal_representative?.managerDocNumber ?? "")
          : draft.legal_representative?.managerDocNumber,
        advance,
      };
    } else if (step === "dpo") {
      payload = { ...draft.dpo, advance };
    } else if (step === "arco") {
      payload = { ...draft.arco, advance };
    }

    const res = await saveWizardStep(companyId, step, payload);
    setSaving(false);

    if (res.error) {
      toast.error(parseApiError(res.error));
      return false;
    }

    if (res.data) {
      setDraft(res.data.draft);
      if (advance && step !== "arco") {
        const idx = FLOW_STEPS.indexOf(step);
        setCurrentStep(FLOW_STEPS[idx + 1]);
      }
    }
    return true;
  }

  async function handleNext() {
    if (currentStep === "review") {
      setSaving(true);
      const res = await applyWizardPhase1(companyId);
      if (res.error) {
        setSaving(false);
        toast.error(parseApiError(res.error));
        return;
      }

      let appliedStatus = res.data;
      if (!appliedStatus) {
        const refreshed = await fetchWizardStatus(companyId);
        appliedStatus = refreshed.data;
      }
      setSaving(false);

      // Siempre continuar a Fase 2 (RAT) tras guardar la fase 1.
      // No confiar en phase2Completed del payload para cerrar el flujo:
      // un false-positivo hacía que el modal se cerrara sin mostrar el RAT.
      toast.success(
        "Configuración aplicada. Continúa con el registro de tu primer tratamiento."
      );
      onPhase1Applied(
        appliedStatus
          ? { ...appliedStatus, phase1Completed: true, phase2Completed: false }
          : undefined
      );
      return;
    }

    const ok = await persistStep(currentStep as Exclude<FlowStep, "review">, true);
    if (ok && currentStep === "arco") {
      setCurrentStep("review");
    }
  }

  async function handleBack() {
    const idx = FLOW_STEPS.indexOf(currentStep);
    if (idx > 0) setCurrentStep(FLOW_STEPS[idx - 1]);
  }

  const dpoUserName = useMemo(() => {
    const id = draft.dpo?.dataOfficerUserId;
    if (!id) return "—";
    if (sessionUser?._id === id) {
      return `${sessionUser.name} ${sessionUser.lastName}`.trim();
    }
    const user = arcoUsers.find((u) => u._id === id);
    if (!user) return "Usuario seleccionado";
    return `${user.name} ${user.lastName}`.trim();
  }, [draft.dpo?.dataOfficerUserId, sessionUser, arcoUsers]);

  if (loading && !status) {
    return (
      <WizardModalShell loading loadingMessage="Cargando asistente…" mode={mode} onDismiss={onDismiss} />
    );
  }

  return (
    <WizardModalShell mode={mode} onDismiss={onDismiss} stepKey={currentStep} footer={
      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#EEF2F8] pt-5 sm:flex-row sm:justify-between">
        <Button
          type="button"
          hierarchy="secondary"
          disabled={currentStep === "identity" || saving}
          onClick={handleBack}
        >
          Atrás
        </Button>
        <Button type="button" loading={saving} onClick={handleNext}>
          {currentStep === "review"
            ? mode === "voluntary"
              ? "Guardar cambios"
              : "Confirmar y aplicar"
            : "Siguiente"}
        </Button>
      </div>
    }>
      <WizardModalHeader
        icon="tabler:wand"
        phase={1}
        title={mode === "voluntary" ? "Reconfigurar empresa" : "Configuración de tu empresa"}
        subtitle={
          mode === "voluntary"
            ? "Actualiza la identidad, el DPO y los contactos ARCO si hubo cambios estructurales o en cómo tratas datos personales."
            : "Primer paso obligatorio: confirma los datos base de tu empresa, el DPO y los contactos ARCO para operar con cumplimiento legal."
        }
      />

      <SetupWizardStepper currentStep={stepToNumber(currentStep)} />

      <WizardModalBody stepKey={currentStep} className="mt-6 space-y-4">
          {currentStep === "identity" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CustomInput
                label="Nombre de la empresa"
                value={draft.identity?.name ?? ""}
                onChange={(e) => patchDraft("identity", { name: e.target.value })}
              />
              <CustomInput
                label="País de operación"
                value={getCompanyCountryLabel(countryCode)}
                readOnly
                disabled
                className="opacity-90"
              />
              <CustomInput
                label={isChile ? "RUT de la empresa" : "NIT de la empresa"}
                value={draft.identity?.nit ?? ""}
                onChange={(e) =>
                  patchDraft("identity", {
                    nit: isChile ? formatRutDisplay(e.target.value) : e.target.value,
                  })
                }
              />
              <CustomInput
                label="Correo de contacto público"
                type="email"
                value={draft.identity?.publicContactEmail ?? ""}
                onChange={(e) => patchDraft("identity", { publicContactEmail: e.target.value })}
              />
              <CustomInput
                label="Sitio web (opcional)"
                type="url"
                placeholder="Ej. https://empresa.com"
                value={draft.identity?.website ?? ""}
                onChange={(e) => patchDraft("identity", { website: e.target.value })}
              />
              {isChile && (
                <>
                  <CustomSelect
                    label="Región"
                    options={regionOptions}
                    value={selectedRegion}
                    unselectedText="Seleccionar Región"
                    onChange={(val) =>
                      patchDraft("identity", { regionName: val, provinceName: "", communeName: "" })
                    }
                  />
                  <CustomSelect
                    label="Provincia"
                    options={provinciaOptions}
                    value={selectedProvince}
                    unselectedText={selectedRegion ? "Seleccionar Provincia" : "Selecciona una Región primero"}
                    disabled={!selectedRegion}
                    onChange={(val) => patchDraft("identity", { provinceName: val, communeName: "" })}
                  />
                  <CustomSelect
                    label="Comuna"
                    options={comunaOptions}
                    value={draft.identity?.communeName ?? ""}
                    unselectedText="Seleccionar Comuna"
                    disabled={!selectedProvince}
                    onChange={(val) => patchDraft("identity", { communeName: val })}
                  />
                  <CustomInput
                    label="Dirección"
                    value={draft.identity?.address ?? ""}
                    onChange={(e) => patchDraft("identity", { address: e.target.value })}
                  />
                </>
              )}
            </div>
          )}

          {currentStep === "legal_representative" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CustomInput
                label="Nombre del representante legal"
                value={draft.legal_representative?.managerName ?? ""}
                onChange={(e) => patchDraft("legal_representative", { managerName: e.target.value })}
              />
              <CustomInput
                label={isChile ? "RUT del representante legal" : "Documento del representante"}
                value={draft.legal_representative?.managerDocNumber ?? ""}
                onChange={(e) =>
                  patchDraft("legal_representative", {
                    managerDocNumber: isChile ? formatRutDisplay(e.target.value) : e.target.value,
                  })
                }
              />
              <CustomInput
                label="Cargo (opcional)"
                value={draft.legal_representative?.managerPosition ?? ""}
                onChange={(e) => patchDraft("legal_representative", { managerPosition: e.target.value })}
              />
              <CustomInput
                label="Correo de contacto (opcional)"
                type="email"
                value={draft.legal_representative?.managerContactEmail ?? ""}
                onChange={(e) =>
                  patchDraft("legal_representative", { managerContactEmail: e.target.value })
                }
              />
            </div>
          )}

          {currentStep === "dpo" && (
            <WizardDpoStep
              companyId={companyId}
              dataOfficerUserId={draft.dpo?.dataOfficerUserId}
              authorizedPersonnelUserIds={draft.dpo?.authorizedPersonnelUserIds}
              onChange={(patch) => patchDraft("dpo", { ...draft.dpo, ...patch })}
            />
          )}

          {currentStep === "arco" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <CustomInput
                  label="Correo ARCO de contacto"
                  type="email"
                  value={draft.arco?.publicContactEmail ?? ""}
                  onChange={(e) => patchDraft("arco", { publicContactEmail: e.target.value })}
                />
                <CustomInput
                  label="Línea telefónica de atención de derechos"
                  value={draft.arco?.rightsAttentionPhoneLine ?? ""}
                  onChange={(e) => patchDraft("arco", { rightsAttentionPhoneLine: e.target.value })}
                />
              </div>
              <div className="rounded-xl border border-[#E8EDF7] bg-[#F8FAFF] px-4 py-3 text-sm text-[#475569]">
                <p className="font-semibold text-[#1A2B5B]">URL del portal ARCO</p>
                <p className="mt-1 break-all">{getArcoPortalUrl()}</p>
                <p className="mt-1 text-xs text-stone-500">
                  Enlace fijo de la plataforma donde los titulares ejercen sus derechos. Se publicará
                  en la política de privacidad de tu empresa.
                </p>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-[#1A2B5B]">Encargados de atención ARCO</p>
                <CompanyUserMultiSelect
                  users={arcoUsers}
                  loading={arcoLoading && arcoUsers.length === 0}
                  loadingMore={arcoLoading && arcoUsers.length > 0}
                  selectedIds={draft.arco?.rightsAttentionUserIds ?? []}
                  onChange={(ids) => patchDraft("arco", { rightsAttentionUserIds: ids })}
                  search={arcoSearch}
                  onSearchChange={(v) => {
                    setArcoSearch(v);
                    setArcoPage(1);
                    setArcoUsers([]);
                  }}
                  totalCount={arcoMeta?.totalCount}
                  hasMore={!!arcoMeta && (arcoMeta.page ?? 1) < (arcoMeta.totalPages ?? 1)}
                  onLoadMore={() => setArcoPage((p) => p + 1)}
                />
              </div>
            </div>
          )}

          {currentStep === "review" && (
            <div className="space-y-3 rounded-xl border border-[#E8EDF7] bg-[#F8FAFF] p-4 text-sm text-[#334155]">
              <p>
                <span className="font-semibold text-[#1A2B5B]">Empresa:</span> {draft.identity?.name} —{" "}
                {draft.identity?.nit}
              </p>
              <p>
                <span className="font-semibold text-[#1A2B5B]">Representante:</span>{" "}
                {draft.legal_representative?.managerName}
              </p>
              <p>
                <span className="font-semibold text-[#1A2B5B]">DPO:</span> {dpoUserName}
              </p>
              <p>
                <span className="font-semibold text-[#1A2B5B]">Contacto ARCO:</span>{" "}
                {draft.arco?.publicContactEmail}
              </p>
              <p>
                <span className="font-semibold text-[#1A2B5B]">Portal ARCO:</span>{" "}
                {getArcoPortalUrl()}
              </p>
              <p className="text-stone-500">
                Al confirmar, estos datos se guardarán en el perfil de la empresa y se sincronizará
                la ficha documental del DPO.
              </p>
            </div>
          )}
        </WizardModalBody>
    </WizardModalShell>
  );
}
