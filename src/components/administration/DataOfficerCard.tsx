"use client";

import Button from "@/components/base/Button";
import { useCompanyDataOfficer } from "@/hooks/useCompanyDataOfficer";
import { useCompanyUsers } from "@/hooks/useCompanyUsers";
import { useSessionStore } from "@/store/useSessionStore";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useMemo, useState } from "react";

interface Props {
  compact?: boolean;
  hideWhenAssigned?: boolean;
}

function readPosition(user: any): string {
  return user?.position || user?.companyUserData?.position || "—";
}
function readPhone(user: any): string {
  return user?.phone || user?.companyUserData?.phone || "—";
}
function readEmail(user: any): string {
  return user?.personalEmail || user?.companyUserData?.personalEmail || "—";
}

export default function DataOfficerCard({
  compact = false,
  hideWhenAssigned = true,
}: Props) {
  const user = useSessionStore((store) => store.user);
  const companyId = user?.companyUserData?.companyId;
  const canAssign = user?.role === "COMPANY_ADMIN";
  const [selectedUserId, setSelectedUserId] = useState("");
  const shouldLoadUsers = !compact && canAssign;

  const dataOfficer = useCompanyDataOfficer({
    companyId,
    enabled: Boolean(companyId),
  });
  const companyUsers = useCompanyUsers({
    companyId: shouldLoadUsers ? companyId : undefined,
    page: 1,
    pageSize: 200,
  });

  const userOptions = useMemo(() => {
    return (companyUsers.data || []).map((u) => ({
      id: u._id,
      label: `${u.name} ${u.lastName}`.trim(),
      sub: readPosition(u),
    }));
  }, [companyUsers.data]);

  const hasOfficer = Boolean(dataOfficer.data?._id);

  if (compact && dataOfficer.error) return null;
  if (compact && hasOfficer && hideWhenAssigned) return null;

  return (
    <article
      className={[
        "rounded-2xl border p-4 sm:p-5",
        compact
          ? hasOfficer
            ? "border-[#D7E3FA] bg-[#F5F8FF]"
            : "border-[#F2D88A] bg-[#FFF9E8]"
          : "border-[#E8EDF7] bg-white shadow-[0_2px_12px_rgba(15,35,70,0.04)]",
      ].join(" ")}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#EEF3FF] px-2.5 py-1 text-xs font-semibold text-[#1A2B5B]">
            <Icon icon="tabler:shield-check" className="text-sm" />
            Oficial de datos
          </div>
          {hasOfficer ? (
            <>
              <p className="text-[16px] font-bold text-[#0B1737]">
                {dataOfficer.data?.name} {dataOfficer.data?.lastName}
              </p>
              <p className="mt-1 text-sm text-[#64748B]">
                {readPosition(dataOfficer.data)} · {readPhone(dataOfficer.data)} ·{" "}
                {readEmail(dataOfficer.data)}
              </p>
            </>
          ) : (
            <>
              <p className="text-[15px] font-semibold text-[#0B1737]">
                No hay oficial de datos asignado
              </p>
              <p className="mt-1 text-sm text-[#64748B]">
                Asigna un responsable para trazabilidad y cumplimiento de protección de
                datos personales.
              </p>
            </>
          )}
        </div>

        {compact && !hasOfficer ? (
          <Link
            href="/admin/administracion"
            className="inline-flex items-center gap-2 rounded-xl border border-[#D8E2F6] bg-white px-4 py-2.5 text-sm font-semibold text-[#1A2B5B] hover:bg-[#F8FAFF]"
          >
            <Icon icon="tabler:settings" className="text-base" />
            Asignar ahora
          </Link>
        ) : null}
      </div>

      {!compact && (
        <div className="mt-4 border-t border-[#EEF2F8] pt-4">
          {dataOfficer.loading ? (
            <p className="mb-3 text-sm text-[#64748B]">Consultando oficial de datos...</p>
          ) : null}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                Usuario de la empresa
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="h-[42px] w-full rounded-xl border border-[#E4EAF6] bg-white px-3 text-sm text-[#0B1737] focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Selecciona un usuario…</option>
                {userOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label} - {opt.sub}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="button"
              onClick={() => {
                if (!selectedUserId || !canAssign) return;
                dataOfficer.assign(selectedUserId);
              }}
              disabled={!selectedUserId || !canAssign || dataOfficer.saving}
              className="rounded-xl! bg-[#1A2B5B]! border-[#1A2B5B]! px-4! py-2.5! text-sm!"
            >
              {dataOfficer.saving ? "Guardando..." : "Asignar oficial"}
            </Button>
          </div>
          {!canAssign ? (
            <p className="mt-2 text-xs text-[#9A7A2F]">
              Solo un COMPANY_ADMIN puede cambiar esta asignación.
            </p>
          ) : null}
          {dataOfficer.error ? (
            <p className="mt-2 text-xs text-red-600">{dataOfficer.error}</p>
          ) : null}
        </div>
      )}
    </article>
  );
}

