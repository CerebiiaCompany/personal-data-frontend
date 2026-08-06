"use client";

import Button from "@/components/base/Button";
import CustomInput from "@/components/forms/CustomInput";
import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { useTreatmentPurposes } from "@/hooks/useTreatmentPurposes";
import {
  createTreatmentPurpose,
  deleteTreatmentPurpose,
  updateTreatmentPurpose,
} from "@/lib/treatment.api";
import { Icon } from "@iconify/react";
import Link from "next/link";
import clsx from "clsx";
import { useState } from "react";
import { toast } from "sonner";

const topCardClass =
  "bg-white border border-[#E8EDF7] rounded-2xl shadow-[0_2px_12px_rgba(15,35,70,0.04)]";
const NAVY = "#1A2B5B";

// Item B26: ABM simple de finalidades scoped a la empresa. Las globales
// (companyId: null) se muestran solo de referencia, sin acciones — editarlas/
// desactivarlas queda para otra tanda (ver treatmentPurpose.controller.ts).
export default function TreatmentPurposesAbmPage() {
  const companyId = useActiveCompanyId();
  const { data, loading, refresh } = useTreatmentPurposes({
    companyId,
    includeInactive: true,
  });

  const [creating, setCreating] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");

  const own = (data ?? []).filter((p) => p.companyId === companyId);
  const global = (data ?? []).filter((p) => p.companyId === null);

  async function handleCreate() {
    if (!companyId || !newCode.trim() || !newLabel.trim()) {
      toast.error("Código y nombre son obligatorios");
      return;
    }
    setSubmitting(true);
    const res = await createTreatmentPurpose(companyId, {
      code: newCode.trim(),
      label: newLabel.trim(),
    });
    setSubmitting(false);
    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
      return;
    }
    toast.success("Finalidad creada");
    setNewCode("");
    setNewLabel("");
    setCreating(false);
    refresh();
  }

  async function handleSaveLabel(purposeId: string) {
    if (!companyId || !editingLabel.trim()) return;
    setSubmitting(true);
    const res = await updateTreatmentPurpose(companyId, purposeId, {
      label: editingLabel.trim(),
    });
    setSubmitting(false);
    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
      return;
    }
    toast.success("Finalidad actualizada");
    setEditingId(null);
    refresh();
  }

  async function handleToggleActive(purposeId: string, isActive: boolean) {
    if (!companyId) return;
    setSubmitting(true);
    // Reactivar es un PATCH simple; desactivar usa el endpoint DELETE
    // (lógico) porque ese es el que aplica el bloqueo si hay un Treatment
    // ACTIVE referenciando la finalidad — ambos caminos aplican el mismo
    // bloqueo en el backend, pero DELETE es la acción semánticamente
    // correcta para "sacar del catálogo activo".
    const res = isActive
      ? await updateTreatmentPurpose(companyId, purposeId, { isActive: true })
      : await deleteTreatmentPurpose(companyId, purposeId);
    setSubmitting(false);
    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
      return;
    }
    toast.success(isActive ? "Finalidad reactivada" : "Finalidad desactivada");
    refresh();
  }

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col bg-[#F8FAFC]">
      <div className="w-full shrink-0 px-5 pt-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <section className={clsx(topCardClass, "px-5 py-5 sm:px-6 sm:py-6")}>
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
            <div className="min-w-0 flex-1 space-y-2">
              <nav className="flex flex-wrap items-center gap-2 text-sm text-[#64748B]">
                <Link href="/admin" className="hover:underline">
                  Inicio
                </Link>
                <Icon icon="tabler:chevron-right" className="shrink-0 text-base text-[#94A3B8]" />
                <Link href="/admin/administracion" className="hover:underline">
                  Administración
                </Link>
                <Icon icon="tabler:chevron-right" className="shrink-0 text-base text-[#94A3B8]" />
                <span className="font-semibold" style={{ color: NAVY }}>
                  Finalidades
                </span>
              </nav>
              <h1
                className="text-[26px] font-bold leading-tight tracking-tight sm:text-[28px]"
                style={{ color: NAVY }}
              >
                Finalidades del tratamiento
              </h1>
              <p className="max-w-2xl text-[13px] leading-relaxed text-[#64748B] sm:text-sm">
                Catálogo propio de tu empresa para el campo &ldquo;Finalidad&rdquo;
                de los tratamientos (RAT). Las finalidades globales del sistema
                se muestran solo como referencia.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pt-1">
              <Button
                hierarchy="tertiary"
                onClick={refresh}
                startContent={<Icon icon="tabler:refresh" />}
              >
                Actualizar
              </Button>
              <Button
                onClick={() => setCreating((v) => !v)}
                className="rounded-xl! border-[#1A2B5B]! bg-[#1A2B5B]! px-5! py-2.5! text-[13px]! font-semibold! text-white!"
                startContent={<Icon icon="tabler:plus" className="text-lg" />}
              >
                Nueva finalidad
              </Button>
            </div>
          </header>
        </section>
      </div>

      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-6 px-5 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8 xl:px-10 2xl:px-12">
        {creating && (
          <section className="rounded-2xl border border-[#E8EDF7] bg-white p-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:p-6">
            <h2 className="mb-4 text-sm font-semibold text-[#1A2B5B]">Nueva finalidad</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <CustomInput
                label="Código"
                placeholder="Ej. INTERNAL_ANALYTICS"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
              />
              <CustomInput
                label="Nombre"
                placeholder="Ej. Analítica interna"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
              />
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <Button hierarchy="secondary" onClick={() => setCreating(false)} disabled={submitting}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} loading={submitting}>
                Crear
              </Button>
            </div>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl border border-[#E8EDF7] bg-white shadow-[0_2px_12px_rgba(15,35,70,0.04)]">
          <h2 className="border-b border-[#EEF2F8] px-5 py-4 text-sm font-semibold text-[#1A2B5B]">
            Finalidades propias de tu empresa
          </h2>
          {loading ? (
            <p className="px-5 py-6 text-sm text-[#64748B]">Cargando...</p>
          ) : own.length === 0 ? (
            <p className="px-5 py-6 text-sm text-[#64748B]">
              Aún no has creado finalidades propias.
            </p>
          ) : (
            <ul className="divide-y divide-[#EEF2F8]">
              {own.map((p) => (
                <li key={p.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    {editingId === p.id ? (
                      <CustomInput
                        value={editingLabel}
                        onChange={(e) => setEditingLabel(e.target.value)}
                      />
                    ) : (
                      <>
                        <p className="truncate text-sm font-semibold text-[#0B1737]">{p.label}</p>
                        <p className="text-xs text-[#94A3B8]">{p.code}</p>
                      </>
                    )}
                  </div>
                  <span
                    className={clsx(
                      "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                      p.isActive ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"
                    )}
                  >
                    {p.isActive ? "Activa" : "Inactiva"}
                  </span>
                  <div className="flex shrink-0 items-center gap-2">
                    {editingId === p.id ? (
                      <>
                        <Button hierarchy="tertiary" onClick={() => setEditingId(null)} disabled={submitting}>
                          Cancelar
                        </Button>
                        <Button onClick={() => handleSaveLabel(p.id)} loading={submitting}>
                          Guardar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          hierarchy="tertiary"
                          onClick={() => {
                            setEditingId(p.id);
                            setEditingLabel(p.label);
                          }}
                          isIconOnly
                        >
                          <Icon icon="tabler:pencil" />
                        </Button>
                        <Button
                          hierarchy="tertiary"
                          onClick={() => handleToggleActive(p.id, !p.isActive)}
                          disabled={submitting}
                          isIconOnly
                        >
                          <Icon icon={p.isActive ? "tabler:trash" : "tabler:rotate-clockwise"} />
                        </Button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#E8EDF7] bg-white shadow-[0_2px_12px_rgba(15,35,70,0.04)]">
          <h2 className="border-b border-[#EEF2F8] px-5 py-4 text-sm font-semibold text-[#1A2B5B]">
            Finalidades globales del sistema (solo lectura)
          </h2>
          {global.length === 0 ? (
            <p className="px-5 py-6 text-sm text-[#64748B]">Sin finalidades globales.</p>
          ) : (
            <ul className="divide-y divide-[#EEF2F8]">
              {global.map((p) => (
                <li key={p.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#0B1737]">{p.label}</p>
                    <p className="text-xs text-[#94A3B8]">{p.code}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
