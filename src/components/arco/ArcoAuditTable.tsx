"use client";

import LoadingCover from "@/components/layout/LoadingCover";
import { ArcoCompanyAuditEntry } from "@/types/arco.admin.types";
import {
  formatArcoDateTime,
  formatArcoRequestLabel,
  getArcoRequestId,
  parseArcoAuditTypeLabel,
} from "@/utils/arcoAdmin.utils";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";

interface Props {
  items: ArcoCompanyAuditEntry[] | null;
  loading: boolean;
  error: string | null;
}

const ArcoAuditTable = ({ items, loading, error }: Props) => {
  if (loading && !items?.length) {
    return (
      <div className="relative min-h-[240px]">
        <LoadingCover />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-red-600">
        <Icon icon="tabler:alert-circle" className="text-3xl" />
        <p>{error}</p>
      </div>
    );
  }

  if (!items?.length) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-[#64748B]">
        <Icon icon="tabler:timeline" className="text-3xl text-[#94A3B8]" />
        <p>No hay eventos de trazabilidad con los filtros seleccionados.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[920px] text-left text-sm">
        <thead>
          <tr className="border-b border-[#EEF2F8] text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            <th className="px-3 py-3">Fecha</th>
            <th className="px-3 py-3">Evento</th>
            <th className="px-3 py-3">Solicitud</th>
            <th className="px-3 py-3">Actor</th>
            <th className="px-3 py-3 text-right">Acción</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const requestId = item.requestId ?? getArcoRequestId(item as never);

            return (
              <tr
                key={`${item.type ?? item.eventType ?? "event"}-${item.at ?? index}-${index}`}
                className="border-b border-[#F1F5F9] transition-colors hover:bg-[#F8FAFC]"
              >
                <td className="px-3 py-3 text-[#64748B]">
                  {formatArcoDateTime(item.at)}
                </td>
                <td className="px-3 py-3 font-medium text-[#1A2B5B]">
                  {parseArcoAuditTypeLabel(item.type ?? item.eventType)}
                </td>
                <td className="px-3 py-3 text-[#334155]">
                  {item.requestType && (
                    <p>{formatArcoRequestLabel(item.requestType)}</p>
                  )}
                  {item.docNumber && (
                    <p className="text-xs text-[#64748B]">Doc. {item.docNumber}</p>
                  )}
                </td>
                <td className="px-3 py-3 text-[#64748B]">
                  {item.actor?.name ?? "—"}
                  {item.actor?.role && (
                    <span className="block text-xs">{item.actor.role}</span>
                  )}
                </td>
                <td className="px-3 py-3 text-right">
                  {requestId ? (
                    <Link
                      href={`/admin/arco/${requestId}`}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-primary-900 hover:bg-primary-50"
                    >
                      Ver solicitud
                      <Icon icon="tabler:chevron-right" />
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ArcoAuditTable;
