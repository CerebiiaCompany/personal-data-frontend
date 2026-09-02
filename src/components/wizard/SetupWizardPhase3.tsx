"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import Button from "@/components/base/Button";
import CustomInput from "@/components/forms/CustomInput";
import CustomSelect from "@/components/forms/CustomSelect";
import WizardQuestionCard from "@/components/wizard/WizardQuestionCard";
import WizardModalShell, {
  WizardModalBody,
  WizardModalHeader,
} from "@/components/wizard/WizardModalShell";
import {
  downloadGeneratedPolicyPreviewPdf,
  getGeneratedPolicyPreview,
} from "@/lib/policyTemplate.api";
import { applyWizardPhase3, fetchWizardStatus, linkWizardPhase3Policy } from "@/lib/wizard.api";
import { WizardStatus } from "@/types/wizard.types";
import { parseApiError } from "@/utils/parseApiError";
import { isWizardPhase2Done } from "@/utils/wizardPhase.utils";

interface GeneratedPolicyPreview {
  treatmentCount: number;
  treatments: { name: string; purpose: string | null }[];
  controllerIdentity: { name: string };
}

type Phase3Mode = "use-existing" | "create-new";

interface Props {
  companyId: string;
  mode?: "required" | "voluntary";
  onPhase3Applied: (status?: WizardStatus) => void;
  onCompleted: () => void;
  onDismiss?: () => void;
}

export default function SetupWizardPhase3({
  companyId,
  mode = "required",
  onPhase3Applied,
  onCompleted: _onCompleted,
  onDismiss,
}: Props) {
  const [status, setStatus] = useState<WizardStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewingPdf, setPreviewingPdf] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [preview, setPreview] = useState<GeneratedPolicyPreview | null>(null);
  const [policyName, setPolicyName] = useState("");
  const [phase3Mode, setPhase3Mode] = useState<Phase3Mode>("create-new");
  const [selectedPolicyId, setSelectedPolicyId] = useState("");

  const treatmentId = status?.phase2TreatmentId ?? null;
  const treatmentName = status?.draft.rat_identity?.name ?? "tu tratamiento";
  const policyOptions = status?.phase3PolicyOptions;
  const ratPolicies = policyOptions?.ratGeneratedPolicies ?? [];
  const linkedPolicy = policyOptions?.linkedPolicy ?? null;
  const hasExistingRatPolicies = ratPolicies.length > 0;

  const defaultPolicyName = useMemo(
    () => `Política de privacidad — ${treatmentName}`,
    [treatmentName]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await fetchWizardStatus(companyId);
    setLoading(false);
    if (res.error || !res.data) {
      if (res.error) toast.error(parseApiError(res.error));
      return;
    }
    if (!isWizardPhase2Done(res.data)) {
      toast.error("Completa el registro de tratamiento antes de generar la política");
      return;
    }
    setStatus(res.data);

    const opts = res.data.phase3PolicyOptions;
    const linked = opts?.linkedPolicy;
    const available = opts?.ratGeneratedPolicies ?? [];

    if (linked?.sourceType === "RAT_GENERATED") {
      setPhase3Mode("use-existing");
      setSelectedPolicyId(linked.id);
    } else if (available.length > 0) {
      setPhase3Mode("use-existing");
      setSelectedPolicyId(available[0].id);
    } else {
      setPhase3Mode("create-new");
      setSelectedPolicyId("");
    }

    setPolicyName((prev) => {
      if (prev.trim()) return prev;
      return res.data!.draft.rat_identity?.name
        ? `Política de privacidad — ${res.data!.draft.rat_identity!.name}`
        : "Política de privacidad";
    });
  }, [companyId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const loadPreview = useCallback(async () => {
    if (!treatmentId) return;
    setLoadingPreview(true);
    const res = await getGeneratedPolicyPreview(companyId, {
      includeDraftTreatmentId: treatmentId,
    });
    setLoadingPreview(false);
    if (res.error) {
      toast.error(parseApiError(res.error));
      return;
    }
    setPreview(res.data as GeneratedPolicyPreview);
  }, [companyId, treatmentId]);

  useEffect(() => {
    void loadPreview();
  }, [loadPreview]);

  async function handlePreviewPdf() {
    if (!treatmentId) return;
    setPreviewingPdf(true);
    const res = await downloadGeneratedPolicyPreviewPdf(companyId, {
      includeDraftTreatmentId: treatmentId,
    });
    setPreviewingPdf(false);
    if (res.error) toast.error(parseApiError(res.error));
  }

  async function handleUseExisting() {
    const policyId = selectedPolicyId || linkedPolicy?.id;
    if (!policyId) {
      toast.error("Selecciona una política existente");
      return;
    }
    setSaving(true);
    const res = await linkWizardPhase3Policy(companyId, policyId);
    setSaving(false);
    if (res.error) {
      toast.error(parseApiError(res.error));
      return;
    }
    toast.success(
      linkedPolicy?.id === selectedPolicyId
        ? "Fase 3 completada. No se creó ninguna política nueva."
        : "Política existente vinculada. No se creó ninguna copia nueva."
    );
    onPhase3Applied(res.data ?? undefined);
  }

  async function handleCreateNew(forceCreate = false) {
    const name = policyName.trim() || defaultPolicyName;
    if (!name) {
      toast.error("Indica un nombre para la política");
      return;
    }
    setSaving(true);
    const res = await applyWizardPhase3(companyId, { name, forceCreate });
    setSaving(false);
    if (res.error) {
      toast.error(parseApiError(res.error));
      return;
    }
    toast.success(
      forceCreate
        ? "Nueva entrada creada en Políticas. El contenido sigue saliendo del RAT en vivo."
        : mode === "voluntary"
          ? "Política registrada. El contenido se genera en vivo desde el RAT."
          : "Política registrada. Continúa con el formulario de recolección."
    );
    onPhase3Applied(res.data ?? undefined);
  }

  const selectedPolicyName =
    ratPolicies.find((p) => p.id === selectedPolicyId)?.name ??
    linkedPolicy?.name ??
    null;

  const resolvedNewPolicyName = policyName.trim() || defaultPolicyName;

  const actionSummary = useMemo(() => {
    if (phase3Mode === "use-existing") {
      if (linkedPolicy?.id === selectedPolicyId) {
        return {
          tone: "neutral" as const,
          title: "Al continuar, no se crea ninguna política nueva",
          lines: [
            `Se mantiene «${linkedPolicy.name}» como referencia del asistente.`,
            "El texto legal que ven los titulares se genera en vivo desde el RAT; no hay PDF que actualizar.",
            "Pasarás a la Fase 4 (formulario de recolección) sin duplicar registros en Políticas.",
          ],
        };
      }
      return {
        tone: "neutral" as const,
        title: "Al confirmar, no se crea ninguna política nueva",
        lines: [
          selectedPolicyName
            ? `Se vinculará «${selectedPolicyName}» al asistente de configuración.`
            : "Se vinculará la política seleccionada al asistente de configuración.",
          "No se modifica el contenido legal: sigue saliendo del RAT en cada consulta pública.",
          "Solo cambia qué registro de Políticas usará el formulario de recolección.",
        ],
      };
    }

    if (linkedPolicy) {
      return {
        tone: "warning" as const,
        title: "Al confirmar, se creará un registro adicional en Políticas",
        lines: [
          `Registro que ya existe (no cambia): «${linkedPolicy.name}».`,
          `Registro nuevo que se creará: «${resolvedNewPolicyName}».`,
          "Escribir un nombre distinto no renombra la política anterior: añades otra entrada en la biblioteca.",
          "El contenido legal de ambas sigue saliendo del RAT en vivo.",
        ],
      };
    }

    return {
      tone: "neutral" as const,
      title: "Al confirmar, se registrará tu primera política desde el RAT",
      lines: [
        "Se crea un registro en Políticas (referencia para formularios y portal).",
        "No se guarda un PDF fijo: el documento se arma en vivo cuando un titular lo consulta.",
        "Si más adelante cambias el RAT, el texto público se actualiza solo.",
      ],
    };
  }, [linkedPolicy, phase3Mode, resolvedNewPolicyName, selectedPolicyId, selectedPolicyName]);

  const primaryButtonLabel = useMemo(() => {
    if (phase3Mode === "use-existing") {
      if (linkedPolicy?.id === selectedPolicyId) {
        return "Continuar sin crear política nueva";
      }
      return "Vincular política existente (sin crear otra)";
    }
    if (linkedPolicy) {
      return "Sí, crear otra política en Políticas";
    }
    return "Registrar política desde el RAT";
  }, [linkedPolicy, phase3Mode, selectedPolicyId]);

  const existingPolicyOptions = useMemo(
    () =>
      ratPolicies.map((p) => ({
        value: p.id,
        title: p.name,
      })),
    [ratPolicies]
  );

  if (loading && !status) {
    return (
      <WizardModalShell loading loadingMessage="Cargando política…" mode={mode} onDismiss={onDismiss} />
    );
  }

  return (
    <WizardModalShell
      mode={mode}
      onDismiss={onDismiss}
      footer={
        <div className="mt-6 space-y-4 border-t border-[#EEF2F8] pt-5">
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              actionSummary.tone === "warning"
                ? "border-amber-200 bg-amber-50 text-amber-950"
                : "border-[#C7D7F5] bg-[#F8FAFF] text-[#334155]"
            }`}
          >
            <p className="font-semibold text-[#1A2B5B]">{actionSummary.title}</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-[13px] leading-relaxed">
              {actionSummary.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {phase3Mode === "use-existing" ? (
              <Button type="button" loading={saving} onClick={handleUseExisting}>
                {primaryButtonLabel}
              </Button>
            ) : (
              <Button
                type="button"
                loading={saving}
                onClick={() => handleCreateNew(Boolean(linkedPolicy))}
              >
                {primaryButtonLabel}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <WizardModalHeader
        icon="tabler:file-certificate"
        phase={3}
        title="Política de privacidad"
        subtitle="Esta fase NO genera ni actualiza un PDF. Solo elige qué política usará el formulario de recolección."
      />

      <WizardModalBody scrollable className="space-y-4">
        <div className="rounded-xl border border-[#C7D7F5] bg-[#F0F5FF] px-4 py-3 text-sm text-[#334155]">
          <div className="flex gap-2">
            <Icon icon="tabler:info-circle" className="mt-0.5 shrink-0 text-lg text-[#3357A5]" />
            <div className="space-y-2">
              <p className="font-semibold text-[#1A2B5B]">¿Qué hace y qué NO hace esta fase?</p>
              <ul className="list-inside list-disc space-y-1 text-[13px] leading-relaxed">
                <li>
                  <strong>Sí hace:</strong> registra o vincula una política «generada desde el RAT» para
                  la Fase 4 (formulario de recolección).
                </li>
                <li>
                  <strong>No hace:</strong> no guarda un PDF fijo ni lo “actualiza” cuando cambias el
                  RAT.
                </li>
                <li>
                  <strong>Cómo se ve el documento:</strong> el texto legal se arma en vivo desde tus
                  tratamientos activos cada vez que un titular lo consulta.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {hasExistingRatPolicies ? (
          <WizardQuestionCard
            question="¿Crear una política nueva o usar una que ya tienes?"
            hint="Recomendado: reutilizar la existente si ya la generaste antes. Así evitas duplicados en Políticas."
          >
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPhase3Mode("use-existing")}
                className={`rounded-xl border px-4 py-3 text-left transition-all ${
                  phase3Mode === "use-existing"
                    ? "border-[#1A2B5B] bg-[#EEF3FF] shadow-sm"
                    : "border-[#E8EDF7] bg-white hover:border-[#C7D7F5]"
                }`}
              >
                <p className="text-sm font-semibold text-[#1A2B5B]">
                  No crear nueva — usar la existente
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#64748B]">
                  Vincula una política RAT que ya está en tu biblioteca ({ratPolicies.length}{" "}
                  disponible{ratPolicies.length === 1 ? "" : "s"}).{" "}
                  <strong className="font-medium text-[#475569]">
                    No se crea ningún registro adicional.
                  </strong>
                </p>
              </button>
              <button
                type="button"
                onClick={() => setPhase3Mode("create-new")}
                className={`rounded-xl border px-4 py-3 text-left transition-all ${
                  phase3Mode === "create-new"
                    ? "border-[#1A2B5B] bg-[#EEF3FF] shadow-sm"
                    : "border-[#E8EDF7] bg-white hover:border-[#C7D7F5]"
                }`}
              >
                <p className="text-sm font-semibold text-[#1A2B5B]">
                  Sí, crear otra en Políticas
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#64748B]">
                  Añade un registro más con otro nombre interno. El contenido legal sigue saliendo
                  del RAT en vivo;{" "}
                  <strong className="font-medium text-[#475569]">
                    no es una copia distinta del texto.
                  </strong>
                </p>
              </button>
            </div>
          </WizardQuestionCard>
        ) : (
          <WizardQuestionCard
            question="Primera política desde el RAT"
            hint="Aún no tienes políticas «generadas desde el RAT» en tu biblioteca."
          >
            <p className="text-sm leading-relaxed text-[#64748B]">
              Debes registrar una referencia en Políticas para continuar con el formulario de
              recolección. Esto <strong className="font-medium text-[#475569]">no genera un PDF</strong>
              : solo crea el registro que el sistema usará en la Fase 4. El documento público se
              construirá en vivo desde el RAT.
            </p>
          </WizardQuestionCard>
        )}

        {phase3Mode === "use-existing" && hasExistingRatPolicies && (
          <WizardQuestionCard
            question="¿Cuál política quieres vincular?"
            hint="Esta será la referencia del formulario de recolección (Fase 4). No se crea otra política."
          >
            <CustomSelect
              label="Política generada desde el RAT"
              options={existingPolicyOptions}
              value={selectedPolicyId}
              unselectedText="Selecciona una política"
              onChange={setSelectedPolicyId}
            />
            {linkedPolicy?.id === selectedPolicyId ? (
              <p className="mt-2 text-xs leading-relaxed text-emerald-800">
                Esta política ya está vinculada al asistente. Al continuar{" "}
                <strong className="font-medium">no se crea nada nuevo</strong> ni se modifica el
                contenido legal.
              </p>
            ) : (
              <p className="mt-2 text-xs leading-relaxed text-[#64748B]">
                Al confirmar, cambiarás la referencia del asistente a la política seleccionada.{" "}
                <strong className="font-medium text-[#475569]">
                  Sigue sin crearse una política nueva.
                </strong>
              </p>
            )}
          </WizardQuestionCard>
        )}

        {phase3Mode === "create-new" && (
          <WizardQuestionCard
            question="Nombre del nuevo registro en Políticas"
            hint="Lo que escribes aquí solo aplica al registro nuevo. No renombra una política que ya exista."
          >
            {linkedPolicy && (
              <div className="mb-3 rounded-lg border border-[#E8EDF7] bg-[#F8FAFC] px-3 py-2.5 text-xs leading-relaxed text-[#64748B]">
                <p>
                  <span className="font-semibold text-[#475569]">Ya en tu biblioteca (no se modifica):</span>{" "}
                  «{linkedPolicy.name}»
                </p>
              </div>
            )}
            <CustomInput
              label="Nombre del registro nuevo"
              value={policyName}
              placeholder={defaultPolicyName}
              onChange={(e) => setPolicyName(e.target.value)}
            />
            <p className="mt-2 text-xs leading-relaxed text-[#64748B]">
              <span className="font-semibold text-[#475569]">Se creará con este nombre:</span>{" "}
              «{resolvedNewPolicyName}»
            </p>
            {linkedPolicy ? (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-950">
                <p className="font-semibold">¿Querías solo cambiar el nombre de la política actual?</p>
                <p className="mt-1">
                  Eso no se hace en esta pantalla. Aquí solo puedes{" "}
                  <strong>crear otra entrada</strong> o, si no necesitas duplicar, volver a{" "}
                  <button
                    type="button"
                    className="font-semibold text-[#1A2B5B] underline underline-offset-2"
                    onClick={() => setPhase3Mode("use-existing")}
                  >
                    No crear nueva — usar la existente
                  </button>
                  .
                </p>
              </div>
            ) : (
              <p className="mt-2 text-xs leading-relaxed text-[#64748B]">
                Se creará tu primera referencia en Políticas. El PDF que ve el titular se arma al
                consultarlo, no queda congelado en este paso.
              </p>
            )}
          </WizardQuestionCard>
        )}

        <WizardQuestionCard
          question="Vista previa (solo lectura)"
          hint={`Muestra cómo se vería hoy el documento con «${treatmentName}». No es el archivo que se guarda al confirmar esta fase.`}
        >
          <p className="mb-3 text-sm text-[#64748B]">
            Tratamiento incluido:{" "}
            <span className="font-medium text-[#1A2B5B]">{treatmentName}</span>
          </p>

          {loadingPreview ? (
            <p className="text-sm text-stone-400">Generando vista previa…</p>
          ) : preview ? (
            <div className="space-y-2 rounded-lg border border-[#E8EDF7] bg-white p-3 text-sm text-[#334155]">
              <p>
                <span className="font-semibold text-[#1A2B5B]">Responsable:</span>{" "}
                {preview.controllerIdentity.name}
              </p>
              <p>
                <span className="font-semibold text-[#1A2B5B]">Tratamientos en el documento:</span>{" "}
                {preview.treatmentCount}
              </p>
              {preview.treatments.length > 0 && (
                <ul className="list-inside list-disc text-[#64748B]">
                  {preview.treatments.map((t) => (
                    <li key={t.name}>
                      {t.name}
                      {t.purpose ? ` — ${t.purpose}` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              hierarchy="secondary"
              loading={previewingPdf}
              onClick={handlePreviewPdf}
              startContent={<Icon icon="tabler:file-type-pdf" className="text-lg" />}
            >
              Ver PDF de preview
            </Button>
            <Button
              type="button"
              hierarchy="tertiary"
              onClick={() => void loadPreview()}
              startContent={<Icon icon="tabler:refresh" className="text-lg" />}
            >
              Actualizar preview
            </Button>
          </div>
        </WizardQuestionCard>
      </WizardModalBody>
    </WizardModalShell>
  );
}
