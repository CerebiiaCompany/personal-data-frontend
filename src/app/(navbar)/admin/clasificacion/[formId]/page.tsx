"use client";

import Button from "@/components/base/Button";
import SectionSearchBar from "@/components/base/SectionSearchBar";
import FormResponsesTable from "@/components/clasification/FormResponsesTable";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { useCollectFormResponses } from "@/hooks/useCollectFormResponses";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useConsentResponsesExport } from "@/hooks/useConsentResponsesExport";
import { usePermissionCheck } from "@/hooks/usePermissionCheck";
import {
  ConsentStatus,
  consentStatusOptions,
} from "@/types/collectFormResponse.types";
import { Icon } from "@iconify/react";
import clsx from "clsx";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type ConsentStatusFilter = "ALL" | ConsentStatus;

type FormResponseSummary = {
  verifiedResponses?: number;
  consentActiveCount?: number;
  consentRevokedCount?: number;
};

export default function FormClassificationPage() {
  const { isCompanyAdmin } = usePermissionCheck();
  const canExportExcel = isCompanyAdmin;
  const formId = useParams().formId?.toString();
  const { debouncedValue, search, setSearch } = useDebouncedSearch();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [consentFilter, setConsentFilter] = useState<ConsentStatusFilter>("ALL");
  const companyId = useActiveCompanyId();
  const { startExport, exporting: exportingExcel, progress: exportProgress } =
    useConsentResponsesExport(companyId);

  const apiSearch = useMemo(() => {
    const value = debouncedValue.trim();
    if (!value) return "";

    // Para búsquedas por CC/teléfono: enviar solo dígitos al backend
    // y evitar que símbolos (+, -, espacios) rompan el match.
    const digits = value.replace(/\D/g, "");
    if (digits.length >= 4) return digits;

    return value;
  }, [debouncedValue]);

  const { data, loading, error, meta, summary, refresh } = useCollectFormResponses({
    companyId,
    id: formId,
    search: apiSearch,
    page: currentPage,
    pageSize: pageSize,
    consentStatus: consentFilter === "ALL" ? undefined : consentFilter,
  });

  const typedSummary = (summary || {}) as FormResponseSummary;
  useEffect(() => {
    setCurrentPage(1);
  }, [apiSearch, consentFilter]);

  const kpis = useMemo(() => {
    const responses = data?.responses || [];
    const fallbackVerified = responses.filter(
      (item) =>
        item.verifiedWithOTP ||
        item.consent?.otp?.verified ||
        (typeof item.otpCodeId === "object" && item.otpCodeId?.status === "VERIFIED")
    ).length;
    const activeConsentsFallback = responses.filter(
      (item) => (item.consent?.status || "").toUpperCase() === "ACTIVE"
    ).length;
    const revokedConsentsFallback = responses.filter(
      (item) => (item.consent?.status || "").toUpperCase() === "REVOKED"
    ).length;

    const legalEvidenceCount = responses.filter((item) => {
      const hasPolicy = Boolean(
        item.consent?.policy?.policyVersionLabel ||
          item.consent?.otpMessage?.policyUrl ||
          (typeof item.otpCodeId === "object" && item.otpCodeId?.policyUrl)
      );
      const hasAcceptedAt = Boolean(item.consent?.acceptedAt || item.consent?.otp?.verifiedAt);
      const hasTrace = Boolean(item.consent?.ipAddress || item.consent?.userAgent);
      return hasPolicy && hasAcceptedAt && hasTrace;
    }).length;

    const channels = responses.reduce(
      (acc, item) => {
        const ch =
          (typeof item.otpCodeId === "object"
            ? item.otpCodeId?.recipientData?.channel
            : undefined) || item.consent?.otp?.channel;
        const key = (ch || "OTHER").toUpperCase();
        if (key in acc) {
          acc[key as keyof typeof acc] += 1;
        } else {
          acc.OTHER += 1;
        }
        return acc;
      },
      { SMS: 0, EMAIL: 0, WHATSAPP: 0, OTHER: 0 }
    );

    const total = meta?.totalCount || responses.length || 0;
    const consentActive =
      typedSummary.consentActiveCount ?? activeConsentsFallback;
    const consentRevoked =
      typedSummary.consentRevokedCount ?? revokedConsentsFallback;
    const verified = typedSummary.verifiedResponses ?? fallbackVerified;
    const evidenceCoveragePct =
      total > 0 ? (legalEvidenceCount / total) * 100 : 0;
    const consentCoveragePct =
      total > 0 ? (consentActive / total) * 100 : 0;

    const channelEntries = [
      { key: "SMS", value: channels.SMS },
      { key: "EMAIL", value: channels.EMAIL },
      { key: "WHATSAPP", value: channels.WHATSAPP },
      { key: "OTHER", value: channels.OTHER },
    ].sort((a, b) => b.value - a.value);
    const topChannel = channelEntries[0];

    return {
      total,
      verified,
      verifiedPct: total > 0 ? (verified / total) * 100 : 0,
      consentActive,
      consentRevoked,
      consentCoveragePct,
      legalEvidenceCount,
      evidenceCoveragePct,
      topChannel: topChannel.key,
      topChannelCount: topChannel.value,
      channels,
    };
  }, [
    data?.responses,
    meta?.totalCount,
    typedSummary.consentActiveCount,
    typedSummary.consentRevokedCount,
    typedSummary.verifiedResponses,
  ]);

  function exportAllToExcel() {
    if (!formId) return;
    startExport({ collectFormId: formId });
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#F9FBFF]">
      <div className="px-5 md:px-6 pt-4 pb-3">
        <div className="max-w-[1240px] mx-auto space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <SectionSearchBar
              search={search}
              onSearchChange={setSearch}
              placeholder="Buscar por nombre, NIT, razón social, documento, correo..."
            />
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { value: "ALL", title: "Todos" },
                  ...consentStatusOptions,
                ] as { value: ConsentStatusFilter; title: string }[]
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setConsentFilter(option.value)}
                  className={clsx(
                    "px-3.5 py-2 rounded-xl text-[12px] font-semibold border transition-colors whitespace-nowrap",
                    consentFilter === option.value
                      ? "bg-[#133C95] text-white border-[#133C95]"
                      : "bg-white text-[#5C6D91] border-[#E3E9F5] hover:bg-[#F4F7FE]"
                  )}
                >
                  {option.title}
                </button>
              ))}
            </div>
            {canExportExcel && (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  hierarchy="secondary"
                  className="rounded-xl! border-[#E3E9F4]! text-[13px]! px-4! py-2.5!"
                  onClick={exportAllToExcel}
                  disabled={exportingExcel}
                  loading={exportingExcel}
                >
                  <span className="flex items-center gap-2">
                    {!exportingExcel && (
                      <Icon icon="tabler:file-export" className="text-base" />
                    )}
                    {exportingExcel
                      ? exportProgress != null
                        ? `Exportando... ${exportProgress}%`
                        : "Exportando..."
                      : "Exportar Excel"}
                  </span>
                </Button>
              </div>
            )}
          </div>

          <header className="rounded-2xl border border-[#E8EDF7] bg-white px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <nav className="flex items-center gap-1.5 text-xs text-[#7384A6] mb-2">
                  <Link href="/admin" className="hover:underline">Inicio</Link>
                  <Icon icon="tabler:chevron-right" className="text-sm" />
                  <Link href="/admin/clasificacion" className="hover:underline">Clasificación</Link>
                  <Icon icon="tabler:chevron-right" className="text-sm" />
                  <span className="font-semibold text-[#1D2E56] truncate">{data?.name || "..."}</span>
                </nav>
                <h1 className="text-[30px] leading-tight font-bold text-[#0B1737] truncate">
                  {data?.name || "Cargando formulario..."}
                </h1>
                <p className="text-[#6F7F9F] text-[13px] mt-1">
                  Reporte completo de usuarios registrados, validación OTP y trazabilidad.
                </p>
              </div>
              <Button href="/admin/clasificacion" hierarchy="secondary" className="rounded-xl! border-[#E3E9F4]! text-[13px]! px-4! py-2.5! shrink-0">
                <span className="flex items-center gap-2">
                  <Icon icon="tabler:arrow-left" className="text-base" />
                  Volver
                </span>
              </Button>
            </div>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <article className="rounded-2xl border border-[#E8EDF7] bg-white px-4 py-3">
              <p className="text-[11px] text-[#7E8BA5] font-semibold uppercase">Total registros</p>
              <p className="text-[28px] font-bold text-[#0B1737] leading-tight">{kpis.total}</p>
              <p className="text-[12px] text-emerald-600 font-semibold">
                {kpis.verifiedPct.toFixed(1)}% con OTP verificado
              </p>
            </article>
            <article className="rounded-2xl border border-[#E8EDF7] bg-white px-4 py-3">
              <p className="text-[11px] text-[#7E8BA5] font-semibold uppercase">Consentimiento activo</p>
              <p className="text-[28px] font-bold text-[#0B1737] leading-tight">{kpis.consentActive}</p>
              <p className="text-[12px] text-amber-600 font-semibold">
                {kpis.consentCoveragePct.toFixed(1)}% del total · {kpis.consentRevoked} revocados
              </p>
            </article>
            <article className="rounded-2xl border border-[#E8EDF7] bg-white px-4 py-3">
              <p className="text-[11px] text-[#7E8BA5] font-semibold uppercase">Evidencia legal completa</p>
              <p className="text-[28px] font-bold text-[#0B1737] leading-tight">{kpis.legalEvidenceCount}</p>
              <p className="text-[12px] text-[#6F7F9F]">
                {kpis.evidenceCoveragePct.toFixed(1)}% con política + aceptación + traza
              </p>
            </article>
            <article className="rounded-2xl border border-[#E8EDF7] bg-white px-4 py-3">
              <p className="text-[11px] text-[#7E8BA5] font-semibold uppercase">Canal principal OTP</p>
              <p className="text-[28px] font-bold text-[#0B1737] leading-tight">{kpis.topChannel}</p>
              <p className="text-[12px] text-[#6F7F9F]">distribución visible</p>
              <p className="text-[12px] text-[#6F7F9F] mt-0.5">
                {kpis.topChannelCount} casos · SMS {kpis.channels.SMS} · Email {kpis.channels.EMAIL} · WhatsApp {kpis.channels.WHATSAPP}
              </p>
            </article>
          </section>
        </div>
      </div>

      <div className="px-5 md:px-6 pb-4 flex-1 min-h-0">
        <div className="max-w-[1240px] mx-auto h-full rounded-2xl border border-[#E8EDF7] bg-white">
        <FormResponsesTable
          refresh={refresh}
          items={data ? data.responses : null}
          loading={loading}
          error={error}
          meta={meta}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
        </div>
      </div>
    </div>
  );
}
