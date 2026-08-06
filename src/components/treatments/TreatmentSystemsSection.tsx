"use client";

import Button from "@/components/base/Button";
import CustomInput from "@/components/forms/CustomInput";
import CustomSelect from "@/components/forms/CustomSelect";
import {
  createTreatmentSystem,
  deleteTreatmentSystem,
  fetchTreatmentSystems,
} from "@/lib/treatment.api";
import {
  SYSTEM_TYPE_LABELS,
  SYSTEM_TYPE_OPTIONS,
  SystemType,
  TreatmentSystem,
} from "@/types/treatment.types";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
  companyId: string;
  /** null mientras el tratamiento todavía no se guardó (modo "create"). */
  treatmentId: string | null;
}

const sectionClass =
  "rounded-2xl border border-[#E8EDF7] bg-white p-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:p-6";

// Fase 1 PRD v2.2 item A (RF-01 a RF-07) — Inventario de Sistemas, "Paso 3.5"
// del formulario de tratamiento (después de "Datos y titulares"). Es un
// recurso hijo de un Treatment ya persistido (FK real, igual que
// TreatmentVersion), así que en modo "create" solo se muestra un aviso: el
// inventario se puebla una vez el tratamiento existe, mismo criterio que
// TreatmentVersionHistory en la página de detalle.
export default function TreatmentSystemsSection({ companyId, treatmentId }: Props) {
  const [systems, setSystems] = useState<TreatmentSystem[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<SystemType | "">("");
  const [provider, setProvider] = useState("");
  const [isOutsideChile, setIsOutsideChile] = useState(false);

  useEffect(() => {
    if (!treatmentId) return;
    let active = true;
    setLoading(true);
    fetchTreatmentSystems(companyId, treatmentId).then((res) => {
      if (!active) return;
      setLoading(false);
      if (res.data) setSystems(res.data);
    });
    return () => {
      active = false;
    };
  }, [companyId, treatmentId]);

  async function handleAdd() {
    if (!treatmentId) return;
    if (!name.trim() || !type) {
      toast.error("Nombre y tipo de sistema son obligatorios");
      return;
    }
    setAdding(true);
    const res = await createTreatmentSystem(companyId, treatmentId, {
      name: name.trim(),
      type,
      provider: provider.trim() || null,
      isOutsideChile,
    });
    setAdding(false);
    if (res.error) {
      toast.error("No se pudo agregar el sistema");
      return;
    }
    if (res.data) setSystems((prev) => [...prev, res.data as TreatmentSystem]);
    setName("");
    setType("");
    setProvider("");
    setIsOutsideChile(false);
  }

  async function handleDelete(systemId: string) {
    if (!treatmentId) return;
    const res = await deleteTreatmentSystem(companyId, treatmentId, systemId);
    if (res.error) {
      toast.error("No se pudo eliminar el sistema");
      return;
    }
    setSystems((prev) => prev.filter((s) => s.id !== systemId));
  }

  return (
    <section className={sectionClass}>
      <h2 className="mb-1 text-sm font-semibold text-[#1A2B5B]">
        Inventario de sistemas
      </h2>
      <p className="mb-4 text-xs text-[#64748B]">
        Registra los sistemas o bases de datos que procesan los datos de este
        tratamiento (CRM, ERP, nube, on-premise, etc.). Marca &ldquo;fuera de
        Chile&rdquo; si el sistema aloja o procesa datos en el extranjero —
        ayuda a detectar transferencias internacionales indirectas.
      </p>

      {!treatmentId ? (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2.5 text-xs leading-relaxed text-amber-950">
          <Icon icon="tabler:info-circle" className="mt-0.5 shrink-0 text-base" />
          Guarda el tratamiento primero para poder agregar sistemas a su
          inventario.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {loading ? (
            <p className="text-xs text-[#94A3B8]">Cargando sistemas…</p>
          ) : systems.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {systems.map((system) => (
                <li
                  key={system.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E4EAF6] bg-[#F8FAFC] px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1A2B5B]">
                      {system.name}{" "}
                      <span className="font-normal text-[#64748B]">
                        ({SYSTEM_TYPE_LABELS[system.type]})
                      </span>
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {system.provider ? `Proveedor: ${system.provider}` : "Sin proveedor especificado"}
                      {system.isOutsideChile && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                          <Icon icon="tabler:world" className="text-xs" />
                          Fuera de Chile
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(system.id)}
                    className="inline-flex items-center justify-center rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                    aria-label={`Eliminar ${system.name}`}
                  >
                    <Icon icon="tabler:trash" className="text-lg" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#94A3B8]">Todavía no hay sistemas registrados.</p>
          )}

          <div className="grid gap-3 rounded-xl border border-[#EAF0FA] bg-[#FAFCFF] p-4 sm:grid-cols-2">
            <CustomInput
              label="Nombre del sistema"
              name="systemName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Salesforce"
            />
            <CustomSelect
              label="Tipo"
              options={SYSTEM_TYPE_OPTIONS}
              value={type}
              unselectedText="— Selecciona un tipo —"
              onChange={(v) => setType(v)}
            />
            <CustomInput
              label="Proveedor"
              name="systemProvider"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              placeholder="Ej. Salesforce Inc."
            />
            <label className="flex cursor-pointer items-center gap-2 self-end pb-2 text-sm font-medium text-[#1A2B5B]">
              <input
                type="checkbox"
                checked={isOutsideChile}
                onChange={(e) => setIsOutsideChile(e.target.checked)}
                className="rounded border-zinc-300"
              />
              El sistema está fuera de Chile
            </label>
            <div className="sm:col-span-2">
              <Button
                type="button"
                hierarchy="secondary"
                loading={adding}
                onClick={handleAdd}
                startContent={<Icon icon="tabler:plus" className="text-lg" />}
              >
                Agregar sistema
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
