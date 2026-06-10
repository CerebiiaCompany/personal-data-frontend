"use client";

import ArcoRequestStatusBadge from "@/components/arco/ArcoRequestStatusBadge";
import LoadingCover from "@/components/layout/LoadingCover";
import { ArcoAdminRequestListItem } from "@/types/arco.admin.types";
import {
  ARCO_DOC_TYPE_LABELS,
  formatArcoAssignedTo,
  formatArcoDate,
  formatArcoDateTime,
  formatArcoRequestLabel,
  getArcoDaysUntilDue,
  getArcoRequestId,
  getArcoResolutionDays,
  isArcoRequestOverdue,
} from "@/utils/arcoAdmin.utils";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import Link from "next/link";

interface Props {
  items: ArcoAdminRequestListItem[] | null;
  loading: boolean;
  error: string | null;
}

const ArcoRequestsTable = ({ items, loading, error }: Props) => {
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
        <Icon icon="tabler:inbox" className="text-3xl text-[#94A3B8]" />
        <p>No hay solicitudes ARCO con los filtros seleccionados.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1100px] text-left text-sm">
        <thead>
          <tr className="border-b border-[#EEF2F8] text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            <th className="px-3 py-3">Documento</th>
            <th className="px-3 py-3">Tipo</th>
            <th className="px-3 py-3">Estado</th>
            <th className="px-3 py-3">Enviada</th>
            <th className="px-3 py-3">Resuelta</th>
            <th className="px-3 py-3">Resolvió</th>
            <th className="px-3 py-3">Plazo</th>
            <th className="px-3 py-3">Asignado</th>
            <th className="px-3 py-3 text-right">Acción</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const requestId = getArcoRequestId(item);
            const overdue = isArcoRequestOverdue(item.dueDate, item.status);
            const daysLeft = getArcoDaysUntilDue(item.dueDate);
            const resolutionDays = getArcoResolutionDays(
              item.createdAt,
              item.resolvedAt ?? undefined
            );

            return (
              <tr
                key={requestId}
                className="border-b border-[#F1F5F9] transition-colors hover:bg-[#F8FAFC]"
              >
                <td className="px-3 py-3">
                  <p className="font-medium text-[#1A2B5B]">
                    {ARCO_DOC_TYPE_LABELS[item.docType]} · {item.docNumber}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-[#64748B]">
                    {item.description}
                  </p>
                </td>
                <td className="px-3 py-3 text-[#334155]">
                  {formatArcoRequestLabel(item.requestType)}
                </td>
                <td className="px-3 py-3">
                  <ArcoRequestStatusBadge status={item.status} overdue={overdue} />
                </td>
                <td className="px-3 py-3 text-[#64748B]">
                  {formatArcoDateTime(item.createdAt)}
                </td>
                <td className="px-3 py-3 text-[#64748B]">
                  {item.resolvedAt ? (
                    <>
                      <p>{formatArcoDateTime(item.resolvedAt)}</p>
                      {resolutionDays !== null && (
                        <p className="text-xs">{resolutionDays} día(s) desde envío</p>
                      )}
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-3 text-[#334155]">
                  {item.response?.respondedByName ?? "—"}
                </td>
                <td className="px-3 py-3">
                  <p className={clsx(overdue && "font-medium text-red-600")}>
                    {formatArcoDate(item.dueDate)}
                  </p>
                  {item.status !== "RESOLVED" &&
                    item.status !== "REJECTED" &&
                    daysLeft !== null && (
                      <p className="text-xs text-[#64748B]">
                        {daysLeft < 0
                          ? `${Math.abs(daysLeft)} día(s) de retraso`
                          : daysLeft === 0
                            ? "Vence hoy"
                            : `${daysLeft} día(s) restantes`}
                      </p>
                    )}
                </td>
                <td className="px-3 py-3 text-[#334155]">
                  {formatArcoAssignedTo(item.assignedTo)}
                </td>
                <td className="px-3 py-3 text-right">
                  <Link
                    href={`/admin/arco/${requestId}`}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-primary-900 hover:bg-primary-50"
                  >
                    Ver detalle
                    <Icon icon="tabler:chevron-right" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ArcoRequestsTable;
