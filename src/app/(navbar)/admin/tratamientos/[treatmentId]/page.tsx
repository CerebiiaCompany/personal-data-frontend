"use client";

import Button from "@/components/base/Button";
import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import ArchiveTreatmentDialog from "@/components/treatments/ArchiveTreatmentDialog";
import TreatmentStatusBadge from "@/components/treatments/TreatmentStatusBadge";
import TreatmentVersionHistory from "@/components/treatments/TreatmentVersionHistory";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { usePermissions } from "@/hooks/usePermissions";
import { useTreatment } from "@/hooks/useTreatment";
import { useTreatmentPurposes } from "@/hooks/useTreatmentPurposes";
import { activateTreatment } from "@/lib/treatment.api";
import {
  DATA_CATEGORY_LABELS,
  DATA_SUBJECT_CATEGORY_LABELS,
  LEGAL_BASIS_LABELS,
  SECURITY_MEASURE_LABELS,
  Treatment,
  TREATMENT_ACTIVATION_FIELD_LABELS,
} from "@/types/treatment.types";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const NAVY = "#1A2B5B";

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
        {label}
      </span>
      <div className="text-sm text-[#1A2B5B]">{children}</div>
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  if (!items.length) return <span className="text-[#94A3B8]">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((label) => (
        <span
          key={label}
          className="rounded-full border border-[#E4EAF6] bg-[#F8FAFC] px-2.5 py-1 text-xs font-medium text-[#475569]"
        >
          {label}
        </span>
      ))}
    </div>
  );
}

const cardClass =
  "rounded-2xl border border-[#E8EDF7] bg-white p-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:p-6";

export default function TreatmentDetailPage() {
  const params = useParams();
  const treatmentId = params.treatmentId as string;
  const companyId = useActiveCompanyId();
  const { hasPermission } = usePermissions();

  const { data, loading, error, refresh } = useTreatment({
    companyId,
    treatmentId,
  });
  const { data: purposes } = useTreatmentPurposes({ companyId });

  const [activating, setActivating] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  const purposeLabel = useMemo(() => {
    if (!data?.purposeId) return null;
    return purposes?.find((p) => p.id === data.purposeId)?.label ?? null;
  }, [data?.purposeId, purposes]);

  const canEdit = hasPermission("treatments", "edit");
  const canActivate = hasPermission("treatments", "activate");
  const canArchive = hasPermission("treatments", "archive");

  async function handleActivate() {
    if (!companyId || !data) return;
    setActivating(true);
    const res = await activateTreatment(companyId, data.id);
    setActivating(false);

    if (res.error) {
      const missing = (res.error as { missingFields?: string[] }).missingFields;
      if (Array.isArray(missing) && missing.length) {
        const labels = missing
          .map((f) => TREATMENT_ACTIVATION_FIELD_LABELS[f] ?? f)
          .join(", ");
        toast.error(`No se puede activar. Faltan campos: ${labels}`);
        return;
      }
      showApiErrorToast(res.error, res.error.status);
      return;
    }

    toast.success("Tratamiento activado");
    refresh();
  }

  function handleArchived(updated: Treatment) {
    refresh();
    void updated;
  }

  if (loading && !data) {
    return (
      <div className="flex min-h-full w-full flex-col gap-4 bg-[#F8FAFC] p-6">
        <div className="h-24 w-full animate-pulse rounded-2xl bg-[#EEF3FB]" />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-[#EEF3FB]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-full w-full flex-col items-center justify-center gap-3 bg-[#F8FAFC] p-6 text-center">
        <Icon icon="tabler:file-off" className="text-4xl text-[#94A3B8]" />
        <p className="text-sm text-[#64748B]">
          {error ?? "No se encontró el tratamiento."}
        </p>
        <Button hierarchy="secondary" href="/admin/tratamientos">
          Volver al listado
        </Button>
      </div>
    );
  }

  const isDraft = data.status === "DRAFT";
  const isArchived = data.status === "ARCHIVED";

  return (
    <div className="flex min-h-full w-full flex-col bg-[#F8FAFC]">
      <div className="w-full px-5 pt-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <header className={cardClass}>
          <nav className="mb-3 flex flex-wrap items-center gap-2 text-sm text-[#64748B]">
            <Link href="/admin" className="hover:underline">
              Inicio
            </Link>
            <Icon
              icon="tabler:chevron-right"
              className="text-base text-[#94A3B8]"
            />
            <Link href="/admin/tratamientos" className="hover:underline">
              Tratamientos
            </Link>
            <Icon
              icon="tabler:chevron-right"
              className="text-base text-[#94A3B8]"
            />
            <span className="max-w-[220px] truncate font-semibold" style={{ color: NAVY }}>
              {data.name}
            </span>
          </nav>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1
                  className="text-[24px] font-bold tracking-tight sm:text-[26px]"
                  style={{ color: NAVY }}
                >
                  {data.name}
                </h1>
                <TreatmentStatusBadge status={data.status} />
                <span className="text-xs font-medium text-[#94A3B8]">
                  Versión {data.version}
                </span>
              </div>
              {data.description && (
                <p className="max-w-2xl text-sm text-[#64748B]">
                  {data.description}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {canEdit && !isArchived && (
                <Button
                  hierarchy="secondary"
                  href={`/admin/tratamientos/${data.id}/editar`}
                  startContent={<Icon icon="tabler:pencil" />}
                >
                  Editar
                </Button>
              )}
              {canActivate && isDraft && (
                <Button
                  onClick={handleActivate}
                  loading={activating}
                  startContent={<Icon icon="tabler:circle-check" />}
                  className="border-emerald-600! bg-emerald-600!"
                >
                  Activar
                </Button>
              )}
              {canArchive && !isArchived && (
                <Button
                  hierarchy="secondary"
                  onClick={() => setArchiveOpen(true)}
                  startContent={<Icon icon="tabler:archive" />}
                  className="border-rose-200! text-rose-600!"
                >
                  Archivar
                </Button>
              )}
            </div>
          </div>

          {isDraft && (
            <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2.5 text-xs leading-relaxed text-amber-950">
              <Icon
                icon="tabler:info-circle"
                className="mt-0.5 shrink-0 text-base"
              />
              Para activar este tratamiento se requieren: finalidad, base legal,
              al menos una categoría de datos y una de titulares.
            </p>
          )}
        </header>
      </div>

      <div className="w-full px-5 py-6 sm:px-6 sm:py-7 lg:px-8 xl:px-10 2xl:px-12">
        <div className="grid gap-5 lg:grid-cols-2">
          <section className={cardClass}>
            <h2 className="mb-4 text-sm font-semibold text-[#1A2B5B]">
              Finalidad y base legal
            </h2>
            <div className="flex flex-col gap-4">
              <Field label="Finalidad">
                {purposeLabel ?? (data.purposeId ? data.purposeId : "—")}
              </Field>
              <Field label="Detalle de la finalidad">
                {data.purposeDetail || "—"}
              </Field>
              <Field label="Base legal">
                {data.legalBasis ? LEGAL_BASIS_LABELS[data.legalBasis] : "—"}
              </Field>
              <Field label="Justificación de la base legal">
                {data.legalBasisJustification || "—"}
              </Field>
            </div>
          </section>

          <section className={cardClass}>
            <h2 className="mb-4 text-sm font-semibold text-[#1A2B5B]">
              Datos y titulares
            </h2>
            <div className="flex flex-col gap-4">
              <Field label="Categorías de datos">
                <Chips
                  items={data.dataCategories.map(
                    (c) => DATA_CATEGORY_LABELS[c]
                  )}
                />
              </Field>
              <Field label="Datos sensibles">
                {data.containsSensitiveData ? (
                  <span className="inline-flex items-center gap-1.5 font-semibold text-rose-600">
                    <Icon icon="tabler:shield-lock" /> Sí
                  </span>
                ) : (
                  <span className="text-[#475569]">No</span>
                )}
              </Field>
              <Field label="Categorías de titulares">
                <Chips
                  items={data.dataSubjectCategories.map(
                    (c) => DATA_SUBJECT_CATEGORY_LABELS[c]
                  )}
                />
              </Field>
            </div>
          </section>

          <section className={cardClass}>
            <h2 className="mb-4 text-sm font-semibold text-[#1A2B5B]">
              Conservación y seguridad
            </h2>
            <div className="flex flex-col gap-4">
              <Field label="Periodo de conservación">
                {data.retentionPeriod || "—"}
              </Field>
              <Field label="Medidas de seguridad">
                <Chips
                  items={data.securityMeasures.map(
                    (m) => SECURITY_MEASURE_LABELS[m]
                  )}
                />
              </Field>
            </div>
          </section>

          <section className={cardClass}>
            <h2 className="mb-4 text-sm font-semibold text-[#1A2B5B]">
              Transferencias internacionales
            </h2>
            <div className="flex flex-col gap-4">
              <Field label="¿Ocurren?">
                {data.internationalTransferOccurs ? "Sí" : "No"}
              </Field>
              {data.internationalTransferOccurs && (
                <>
                  <Field label="País de destino">
                    {data.internationalTransferCountry || "—"}
                  </Field>
                  <Field label="Mecanismo">
                    {data.internationalTransferMechanism || "—"}
                  </Field>
                </>
              )}
            </div>
          </section>

          <section className={`${cardClass} lg:col-span-2`}>
            <h2 className="mb-4 text-sm font-semibold text-[#1A2B5B]">
              Ciclo de vida
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Creado">{formatDateTime(data.createdAt)}</Field>
              <Field label="Actualizado">
                {formatDateTime(data.updatedAt)}
              </Field>
              <Field label="Activado">{formatDateTime(data.activatedAt)}</Field>
              <Field label="Archivado">{formatDateTime(data.archivedAt)}</Field>
            </div>
            {isArchived && data.archivedReason && (
              <div className="mt-4">
                <Field label="Motivo del archivado">
                  {data.archivedReason}
                </Field>
              </div>
            )}
          </section>

          {companyId && (
            <TreatmentVersionHistory
              companyId={companyId}
              treatmentId={data.id}
              version={data.version}
              purposes={purposes ?? undefined}
            />
          )}
        </div>
      </div>

      {companyId && (
        <ArchiveTreatmentDialog
          open={archiveOpen}
          companyId={companyId}
          treatment={data}
          onClose={() => setArchiveOpen(false)}
          onArchived={handleArchived}
        />
      )}
    </div>
  );
}
