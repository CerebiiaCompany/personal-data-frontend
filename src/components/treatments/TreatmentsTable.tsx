import TreatmentStatusBadge from "@/components/treatments/TreatmentStatusBadge";
import { Treatment, LEGAL_BASIS_LABELS } from "@/types/treatment.types";
import { Icon } from "@iconify/react";
import Link from "next/link";

interface Props {
  items: Treatment[] | null;
  loading: boolean;
  error: string | null;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const TreatmentsTable = ({ items, loading, error }: Props) => {
  if (loading && !items) {
    return (
      <div className="flex flex-col gap-2 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-14 w-full animate-pulse rounded-xl bg-[#F1F5FB]"
          />
        ))}
      </div>
    );
  }

  if (error && !items) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
        <Icon
          icon="tabler:alert-triangle"
          className="text-3xl text-rose-400"
        />
        <p className="text-sm text-[#64748B]">{error}</p>
      </div>
    );
  }

  if (items && items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF3FF] text-[#3357A5]">
          <Icon icon="tabler:list-details" className="text-2xl" />
        </span>
        <div>
          <p className="text-sm font-semibold text-[#1A2B5B]">
            Aún no hay tratamientos
          </p>
          <p className="mt-1 text-sm text-[#64748B]">
            Registra tu primera actividad de tratamiento para construir el RAT.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[#EEF2F8] text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Base legal</th>
            <th className="px-4 py-3">Datos sensibles</th>
            <th className="px-4 py-3">Versión</th>
            <th className="px-4 py-3">Actualizado</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {items?.map((t) => (
            <tr
              key={t.id}
              className="border-b border-[#F1F5FB] transition-colors hover:bg-[#F8FAFC]"
            >
              <td className="max-w-[260px] px-4 py-3">
                <Link
                  href={`/admin/tratamientos/${t.id}`}
                  className="block truncate font-semibold text-[#1A2B5B] hover:underline"
                  title={t.name}
                >
                  {t.name}
                </Link>
                {t.description && (
                  <p className="mt-0.5 truncate text-xs text-[#94A3B8]">
                    {t.description}
                  </p>
                )}
              </td>
              <td className="px-4 py-3">
                <TreatmentStatusBadge status={t.status} />
              </td>
              <td className="px-4 py-3 text-sm text-[#475569]">
                {t.legalBasis ? LEGAL_BASIS_LABELS[t.legalBasis] : "—"}
              </td>
              <td className="px-4 py-3">
                {t.containsSensitiveData ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
                    <Icon icon="tabler:shield-lock" className="text-sm" />
                    Sí
                  </span>
                ) : (
                  <span className="text-xs text-[#94A3B8]">No</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-[#475569]">v{t.version}</td>
              <td className="px-4 py-3 text-sm text-[#64748B]">
                {formatDate(t.updatedAt)}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/admin/tratamientos/${t.id}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary-900 hover:underline"
                >
                  Ver
                  <Icon icon="tabler:chevron-right" className="text-base" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TreatmentsTable;
