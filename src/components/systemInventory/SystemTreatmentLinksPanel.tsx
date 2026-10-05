"use client";

import Button from "@/components/base/Button";
import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import CustomSelect from "@/components/forms/CustomSelect";
import { fetchTreatments } from "@/lib/treatment.api";
import { linkSystemTreatment, unlinkSystemTreatment } from "@/lib/systemInventory.api";
import { CustomSelectOption } from "@/types/forms.types";
import {
  SystemTreatmentLink,
  SystemTreatmentRelationshipType,
  SYSTEM_TREATMENT_RELATIONSHIP_LABELS,
  SYSTEM_TREATMENT_RELATIONSHIP_OPTIONS,
} from "@/types/systemInventory.types";
import { Treatment } from "@/types/treatment.types";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface Props {
  companyId: string;
  systemId: string;
  links: SystemTreatmentLink[];
  onChange: (links: SystemTreatmentLink[]) => void;
}

const sectionClass =
  "rounded-2xl border border-[#E8EDF7] bg-white p-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:p-6";

export default function SystemTreatmentLinksPanel({ companyId, systemId, links, onChange }: Props) {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [treatmentId, setTreatmentId] = useState("");
  const [relationshipType, setRelationshipType] = useState<SystemTreatmentRelationshipType | "">("");
  const [linking, setLinking] = useState(false);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTreatments(companyId, { pageSize: 200 }).then((res) => {
      if (res.data) setTreatments(res.data);
    });
  }, [companyId]);

  const linkedIds = useMemo(() => new Set(links.map((l) => l.treatmentId)), [links]);

  const treatmentOptions: CustomSelectOption<string>[] = useMemo(
    () => treatments.filter((t) => !linkedIds.has(t.id)).map((t) => ({ value: t.id, title: t.name })),
    [treatments, linkedIds]
  );

  async function handleLink() {
    if (!treatmentId || !relationshipType) {
      toast.error("Selecciona un tratamiento y un tipo de relación");
      return;
    }
    setLinking(true);
    const res = await linkSystemTreatment(companyId, systemId, { treatmentId, relationshipType });
    setLinking(false);
    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
      return;
    }
    if (res.data?.treatments) onChange(res.data.treatments);
    setTreatmentId("");
    setRelationshipType("");
    toast.success("Tratamiento vinculado");
  }

  async function handleUnlink(linkTreatmentId: string) {
    setUnlinkingId(linkTreatmentId);
    const res = await unlinkSystemTreatment(companyId, systemId, linkTreatmentId);
    setUnlinkingId(null);
    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
      return;
    }
    if (res.data?.treatments) onChange(res.data.treatments);
    toast.success("Tratamiento desvinculado");
  }

  return (
    <section className={sectionClass}>
      <h2 className="mb-1 text-sm font-semibold text-[#1A2B5B]">Tratamientos vinculados</h2>
      <p className="mb-4 text-xs text-[#64748B]">
        Tratamientos que usan este sistema para almacenar, procesar u originar datos personales.
      </p>

      {links.length > 0 ? (
        <ul className="mb-4 flex flex-col gap-2">
          {links.map((link) => (
            <li
              key={link.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E4EAF6] bg-[#F8FAFC] px-3 py-2.5"
            >
              <div className="min-w-0">
                {link.treatment ? (
                  <Link
                    href={`/admin/tratamientos/${link.treatment.id}`}
                    className="text-sm font-semibold text-[#1A2B5B] hover:underline"
                  >
                    {link.treatment.name}
                  </Link>
                ) : (
                  <span className="text-sm font-semibold text-[#1A2B5B]">{link.treatmentId}</span>
                )}
                <p className="text-xs text-[#64748B]">
                  {SYSTEM_TREATMENT_RELATIONSHIP_LABELS[link.relationshipType]}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleUnlink(link.treatmentId)}
                disabled={unlinkingId === link.treatmentId}
                className="inline-flex items-center justify-center rounded-lg p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-40"
                aria-label={`Desvincular ${link.treatment?.name ?? link.treatmentId}`}
              >
                <Icon icon="tabler:unlink" className="text-lg" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-4 text-xs text-[#94A3B8]">Todavía no hay tratamientos vinculados.</p>
      )}

      <div className="grid gap-3 rounded-xl border border-[#EAF0FA] bg-[#FAFCFF] p-4 sm:grid-cols-[1fr_1fr_auto]">
        <CustomSelect
          label="Tratamiento"
          options={treatmentOptions}
          value={treatmentId}
          unselectedText="— Selecciona —"
          onChange={setTreatmentId}
        />
        <CustomSelect
          label="Relación"
          options={SYSTEM_TREATMENT_RELATIONSHIP_OPTIONS}
          value={relationshipType}
          unselectedText="— Selecciona —"
          onChange={setRelationshipType}
        />
        <Button
          type="button"
          hierarchy="secondary"
          loading={linking}
          onClick={handleLink}
          className="self-end"
          startContent={<Icon icon="tabler:link" className="text-lg" />}
        >
          Vincular
        </Button>
      </div>
    </section>
  );
}
