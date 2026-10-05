"use client";

import Button from "@/components/base/Button";
import CheckPermission from "@/components/checkers/CheckPermission";
import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import { markSystemDpaSigned, revertSystemDpaToPending, updateSystemInventory } from "@/lib/systemInventory.api";
import { SystemInventory } from "@/types/systemInventory.types";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  companyId: string;
  system: SystemInventory;
  onUpdated: (system: SystemInventory) => void;
}

function isCerebiia(system: SystemInventory): boolean {
  return system.name.trim().toLowerCase() === "cerebiia";
}

function looksUnconfirmedProvider(provider: string | null): boolean {
  const value = (provider ?? "").trim().toLowerCase();
  return !value || value === "por confirmar" || value === "no_seguro";
}

export default function SystemInventoryDpaPanel({ companyId, system, onUpdated }: Props) {
  const [saving, setSaving] = useState<"none" | "external" | "internal" | "signed" | "unsigned">("none");
  const lockedPlatform = isCerebiia(system);
  const unconfirmedVendor = looksUnconfirmedProvider(system.provider);

  async function applyPatch(next: SystemInventory) {
    onUpdated({ ...system, ...next, treatments: system.treatments });
  }

  async function setNeedsDpa(needsDpa: boolean) {
    setSaving(needsDpa ? "external" : "internal");
    const res = await updateSystemInventory(companyId, system.id, { hasExternalAccess: needsDpa });
    setSaving("none");
    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
      return;
    }
    if (res.data) {
      await applyPatch(res.data);
      toast.success(needsDpa ? "Quedó marcado: hace falta DPA" : "Quedó marcado: no requiere DPA");
    }
  }

  async function markSigned() {
    setSaving("signed");
    const res = await markSystemDpaSigned(companyId, system.id);
    setSaving("none");
    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
      return;
    }
    if (res.data) {
      await applyPatch(res.data);
      toast.success("DPA marcado como firmado");
    }
  }

  async function unmarkSigned() {
    setSaving("unsigned");
    const res = await revertSystemDpaToPending(companyId, system.id);
    setSaving("none");
    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
      return;
    }
    if (res.data) {
      await applyPatch(res.data);
      toast.success("DPA vuelto a pendiente");
    }
  }

  if (system.dpaStatus === "SIGNED") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-relaxed text-[#1B5E3B]">
        <p className="font-semibold">DPA marcado como firmado</p>
        <p className="mt-1 text-[#2F6B4A]">
          Si lo marcaste por error, puedes dejarlo otra vez en pendiente. El encargado no se quita.
        </p>
        <CheckPermission group="treatments" permission="edit">
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              hierarchy="secondary"
              loading={saving === "unsigned"}
              disabled={saving !== "none"}
              onClick={unmarkSigned}
              startContent={<Icon icon="tabler:arrow-back-up" className="text-lg" />}
              className="border-emerald-300! bg-white! text-[#1B5E3B]!"
            >
              Todavía no está firmado
            </Button>
            {!lockedPlatform && (
              <Button
                hierarchy="secondary"
                loading={saving === "internal"}
                disabled={saving !== "none"}
                onClick={() => setNeedsDpa(false)}
                startContent={<Icon icon="tabler:building" className="text-lg" />}
                className="border-emerald-300! bg-white! text-[#1B5E3B]!"
              >
                No: es solo de la empresa
              </Button>
            )}
          </div>
        </CheckPermission>
      </div>
    );
  }

  const isPending = system.dpaStatus === "PENDING";
  const boxClass = isPending
    ? "rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-relaxed text-[#7A4A12]"
    : "rounded-xl border border-[#E8EDF7] bg-[#F8FAFC] px-4 py-4 text-sm leading-relaxed text-[#475569]";
  const titleClass = isPending ? "font-semibold text-[#9A5B14]" : "font-semibold text-[#1A2B5B]";
  const buttonClass = isPending
    ? "border-amber-300! bg-white! text-[#9A5B14]!"
    : "border-[#D8E0EF]! bg-white! text-[#1A2B5B]!";

  return (
    <div className={boxClass}>
      <p className={titleClass}>¿Hace falta un DPA?</p>
      <p className="mt-1">
        Un DPA es el contrato con una empresa externa que trata datos por ti. No depende del país del servidor.
        Pregunta: ¿alguien de afuera ve o guarda estos datos?
      </p>
      {unconfirmedVendor && system.hasExternalAccess && (
        <p className="mt-2">
          El proveedor figura como «{system.provider || "sin confirmar"}», por eso el sistema asumió que hay un
          tercero. Si esto es solo de la empresa, márcalo abajo.
        </p>
      )}
      {lockedPlatform && (
        <p className="mt-2">CEREBIIA sí es un encargado: el DPA aplica. Puedes marcarlo como firmado cuando exista.</p>
      )}

      <CheckPermission group="treatments" permission="edit">
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {!lockedPlatform && system.hasExternalAccess && (
            <Button
              hierarchy="secondary"
              loading={saving === "internal"}
              disabled={saving !== "none"}
              onClick={() => setNeedsDpa(false)}
              startContent={<Icon icon="tabler:building" className="text-lg" />}
              className={buttonClass}
            >
              No: es solo de la empresa
            </Button>
          )}
          {!system.hasExternalAccess && (
            <Button
              hierarchy="secondary"
              loading={saving === "external"}
              disabled={saving !== "none"}
              onClick={() => setNeedsDpa(true)}
              startContent={<Icon icon="tabler:users" className="text-lg" />}
              className={buttonClass}
            >
              Sí: hay un encargado, hace falta DPA
            </Button>
          )}
          {system.hasExternalAccess && (
            <Button
              hierarchy="primary"
              loading={saving === "signed"}
              disabled={saving !== "none"}
              onClick={markSigned}
              startContent={<Icon icon="tabler:file-check" className="text-lg" />}
            >
              Ya firmamos el DPA
            </Button>
          )}
        </div>
      </CheckPermission>
    </div>
  );
}
