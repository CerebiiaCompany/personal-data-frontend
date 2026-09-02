"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/base/Button";
import CustomInput from "@/components/forms/CustomInput";
import CustomSelect from "@/components/forms/CustomSelect";
import WizardQuestionCard from "@/components/wizard/WizardQuestionCard";
import WizardModalShell, {
  WizardModalBody,
  WizardModalHeader,
} from "@/components/wizard/WizardModalShell";
import { useCompanyRoles } from "@/hooks/useCompanyRoles";
import {
  applyWizardPhase4CollectForm,
  fetchWizardStatus,
  finishWizardPhase4,
} from "@/lib/wizard.api";
import { WizardStatus } from "@/types/wizard.types";
import { parseApiError } from "@/utils/parseApiError";
import { isWizardPhase3Done } from "@/utils/wizardPhase.utils";

type SubStep = "collect_form" | "team";

interface Props {
  companyId: string;
  mode?: "required" | "voluntary";
  onPhase4Applied: (status?: WizardStatus) => void;
  onCompleted: () => void;
  onDismiss?: () => void;
}

export default function SetupWizardPhase4({
  companyId,
  mode = "required",
  onPhase4Applied,
  onCompleted: _onCompleted,
  onDismiss,
}: Props) {
  const [status, setStatus] = useState<WizardStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subStep, setSubStep] = useState<SubStep>("collect_form");
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const [teamName, setTeamName] = useState("");
  const [teamLastName, setTeamLastName] = useState("");
  const [teamUsername, setTeamUsername] = useState("");
  const [teamRoleId, setTeamRoleId] = useState("");
  const [teamPosition, setTeamPosition] = useState("");

  const { data: companyRoles } = useCompanyRoles({ companyId, pageSize: 100 });
  const roleOptions = useMemo(
    () => [
      { value: "", title: "— Seleccionar rol —" },
      ...(companyRoles ?? []).map((r) => ({ value: r._id, title: r.name })),
    ],
    [companyRoles]
  );

  const treatmentName = status?.draft.rat_identity?.name ?? "tu tratamiento";
  const defaultFormName = useMemo(
    () => `Consentimiento — ${treatmentName}`,
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
    if (!isWizardPhase3Done(res.data)) {
      toast.error("Genera la política antes de continuar");
      return;
    }
    setStatus(res.data);
    setFormName((prev) => prev.trim() || defaultFormName);
    if (res.data.phase4CollectFormId) setSubStep("team");
  }, [companyId, defaultFormName]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleCreateForm() {
    setSaving(true);
    const res = await applyWizardPhase4CollectForm(companyId, {
      name: formName.trim() || defaultFormName,
      description:
        formDescription.trim() ||
        "Canal para capturar datos personales y registrar el consentimiento informado del titular.",
    });
    setSaving(false);
    if (res.error) {
      toast.error(parseApiError(res.error));
      return;
    }
    if (res.data) setStatus(res.data);
    toast.success("Formulario de recolección creado");
    setSubStep("team");
  }

  async function handleFinish(skipTeam: boolean) {
    if (!skipTeam) {
      if (!teamName.trim() || !teamLastName.trim() || !teamUsername.trim()) {
        toast.error("Completa nombre, apellido y correo del colaborador");
        return;
      }
      if (!teamRoleId) {
        toast.error("Selecciona un rol para el colaborador");
        return;
      }
    }

    setSaving(true);
    const res = await finishWizardPhase4(companyId, {
      skipTeam,
      teamMember: skipTeam
        ? undefined
        : {
            name: teamName.trim(),
            lastName: teamLastName.trim(),
            username: teamUsername.trim(),
            companyRoleId: teamRoleId,
            position: teamPosition.trim() || undefined,
            personalEmail: teamUsername.trim(),
          },
    });
    setSaving(false);

    if (res.error) {
      toast.error(parseApiError(res.error));
      return;
    }

    if (res.data?.tempPassword) {
      setTempPassword(res.data.tempPassword);
      toast.success("Colaborador invitado. Copia la contraseña temporal.");
      return;
    }

    toast.success(
      mode === "voluntary"
        ? "Configuración de recolección completada"
        : "¡Casi listo! Tu canal de recolección está activo."
    );
    onPhase4Applied(res.data ?? undefined);
  }

  function handleContinueAfterPassword() {
    setTempPassword(null);
    onPhase4Applied(status ?? undefined);
  }

  const formPublicPath = status?.phase4CollectFormId
    ? `/formulario/${status.phase4CollectFormId}`
    : null;

  if (loading && !status) {
    return <WizardModalShell loading loadingMessage="Cargando…" mode={mode} onDismiss={onDismiss} />;
  }

  if (tempPassword) {
    return (
      <WizardModalShell mode={mode} onDismiss={onDismiss} maxWidth="md">
        <WizardModalHeader
          icon="tabler:user-check"
          title="Colaborador creado"
          subtitle="Comparte esta contraseña temporal. Solo se muestra una vez."
        />
        <p className="mt-2 rounded-xl border border-[#E8EDF7] bg-[#F8FAFF] p-4 font-mono text-sm text-[#1A2B5B]">
          {tempPassword}
        </p>
        <Button type="button" className="mt-6 w-full" onClick={handleContinueAfterPassword}>
          Continuar
        </Button>
      </WizardModalShell>
    );
  }

  return (
    <WizardModalShell mode={mode} onDismiss={onDismiss} stepKey={subStep}>
      <WizardModalHeader
        icon="tabler:forms"
        phase={4}
        title="Recolección y equipo"
        subtitle="Crea el canal donde capturas datos con consentimiento y, si quieres, invita a alguien de tu equipo."
      />

      <WizardModalBody stepKey={subStep} scrollable={false} className="space-y-4">
        {subStep === "collect_form" && (
          <>
            <WizardQuestionCard
              question="¿Cómo se llamará tu formulario de recolección?"
              hint="Se vinculará automáticamente a la política y al tratamiento que registraste."
            >
              <CustomInput
                label="Nombre del formulario"
                value={formName}
                placeholder={defaultFormName}
                onChange={(e) => setFormName(e.target.value)}
              />
              <CustomInput
                label="Descripción (opcional)"
                className="mt-3"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </WizardQuestionCard>
            <div className="flex justify-end">
              <Button type="button" loading={saving} onClick={handleCreateForm}>
                Crear formulario
              </Button>
            </div>
          </>
        )}

        {subStep === "team" && (
          <>
            {formPublicPath && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900">
                Formulario listo. Podrás compartirlo desde Recolección o usar la ruta:{" "}
                <code className="font-mono text-xs">{formPublicPath}</code>
              </div>
            )}

            <WizardQuestionCard
              question="¿Quieres invitar a alguien de tu equipo?"
              hint="Opcional. Delega tareas de recolección sin compartir tu usuario de administrador."
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <CustomInput
                  label="Nombre"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
                <CustomInput
                  label="Apellido"
                  value={teamLastName}
                  onChange={(e) => setTeamLastName(e.target.value)}
                />
                <CustomInput
                  label="Correo (usuario de acceso)"
                  className="sm:col-span-2"
                  value={teamUsername}
                  onChange={(e) => setTeamUsername(e.target.value)}
                />
                <CustomSelect
                  label="Rol en la empresa"
                  options={roleOptions}
                  value={teamRoleId}
                  unselectedText="Seleccionar rol"
                  onChange={setTeamRoleId}
                />
                <CustomInput
                  label="Cargo (opcional)"
                  value={teamPosition}
                  onChange={(e) => setTeamPosition(e.target.value)}
                />
              </div>
            </WizardQuestionCard>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button
                type="button"
                hierarchy="secondary"
                disabled={saving}
                onClick={() => handleFinish(true)}
              >
                Omitir por ahora
              </Button>
              <Button type="button" loading={saving} onClick={() => handleFinish(false)}>
                Invitar y finalizar
              </Button>
            </div>
          </>
        )}
      </WizardModalBody>
    </WizardModalShell>
  );
}
