"use client";

import Button from "@/components/base/Button";
import SectionSearchBar from "@/components/base/SectionSearchBar";
import FormResponsesTable from "@/components/clasification/FormResponsesTable";
import FormResponsesFilters, {
  ConsentStatusFilter,
} from "@/components/clasification/FormResponsesFilters";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { useCollectFormResponses } from "@/hooks/useCollectFormResponses";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useConsentResponsesExport } from "@/hooks/useConsentResponsesExport";
import { usePermissionCheck } from "@/hooks/usePermissionCheck";
import { ConsentStatus } from "@/types/collectFormResponse.types";
import { Icon } from "@iconify/react";
import clsx from "clsx";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type FormResponseSummary = {
  verifiedResponses?: number;
  consentActiveCount?: number;
  consentRevokedCount?: number;
};

function formatInt(n: number) {
  return n.toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

interface KpiCardProps {
  icon: string;
  label: string;
  value: string | number;
  subtitle: string;
  subtitleClassName?: string;
  detail?: string;
}

function KpiCard({
  icon,
  label,
  value,
  subtitle,
  subtitleClassName,
  detail,
}: KpiCardProps) {
  return (
    <article className="flex items-start gap-3.5 rounded-2xl border border-[#E8EDF7] bg-white px-4 py-4 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:px-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#1A2B5B]">
        <Icon icon={icon} className="text-xl" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
          {label}
        </p>
        <p className="text-[22px] font-bold leading-tight text-[#0B1737] tabular-nums sm:text-[24px]">
          {value}
        </p>
        <p
          className={clsx(
            "mt-0.5 text-[12px] font-semibold",
            subtitleClassName ?? "text-[#64748B]"
          )}
        >
          {subtitle}
        </p>
        {detail ? (
          <p className="mt-1 text-[11px] leading-snug text-[#94A3B8]">{detail}</p>
        ) : null}
      </div>
    </article>
  );
}

export default function FormClassificationPage() {
  const { isCompanyAdmin } = usePermissionCheck();
  const canExportExcel = isCompanyAdmin;
  const formId = useParams().formId?.toString();
  const { debouncedValue, search, setSearch } = useDebouncedSearch();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [consentFilter, setConsentFilter] = useState<ConsentStatusFilter>("ALL");
  const companyId = useActiveCompanyId();
  const {
    startExport,
    exporting: exportingExcel,
    progress: exportProgress,
  } = useConsentResponsesExport(companyId);

  const apiSearch = useMemo(() => {
    const value = debouncedValue.trim();
    if (!value) return "";

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
    const consentActive = typedSummary.consentActiveCount ?? activeConsentsFallback;
    const consentRevoked = typedSummary.consentRevokedCount ?? revokedConsentsFallback;
    const verified = typedSummary.verifiedResponses ?? fallbackVerified;
    const evidenceCoveragePct = total > 0 ? (legalEvidenceCount / total) * 100 : 0;
    const consentCoveragePct = total > 0 ? (consentActive / total) * 100 : 0;

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const topCardClass =
    "bg-white border border-[#E8EDF7] rounded-2xl shadow-[0_2px_12px_rgba(15,35,70,0.04)]";

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F8FAFC]">
      <div className="w-full shrink-0 px-5 pt-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-5 sm:gap-6">
          <section className={clsx(topCardClass, "px-5 py-5 sm:px-6 sm:py-6")}>
            <div className="flex flex-col gap-6">
              <SectionSearchBar
                variant="pill"
                search={search}
                onSearchChange={setSearch}
                placeholder="Buscar por nombre, documento, correo, NIT..."
              />

              <header className="flex flex-col gap-4 border-t border-[#EEF2F8] pt-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
                <div className="min-w-0 flex-1 space-y-2">
                  <nav className="flex flex-wrap items-center gap-2 text-sm text-[#64748B]">
                    <Link href="/admin" className="hover:underline">
                      Inicio
                    </Link>
                    <Icon
                      icon="tabler:chevron-right"
                      className="shrink-0 text-base text-[#94A3B8]"
                    />
                    <Link href="/admin/clasificacion" className="hover:underline">
                      Clasificación
                    </Link>
                    <Icon
                      icon="tabler:chevron-right"
                      className="shrink-0 text-base text-[#94A3B8]"
                    />
                    <span className="truncate font-semibold text-[#1A2B5B]">
                      {data?.name || "…"}
                    </span>
                  </nav>
                  <h1 className="text-[26px] font-bold leading-tight tracking-tight text-[#0B1737] sm:text-[28px]">
                    {data?.name || "Cargando formulario…"}
                  </h1>
                  <p className="max-w-2xl text-[13px] leading-relaxed text-[#64748B] sm:text-sm">
                    Reporte de registros, validación OTP y trazabilidad de consentimiento.
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Button
                    href="/admin/clasificacion"
                    hierarchy="secondary"
                    className="rounded-xl! border-[#E2E8F0]! bg-white! px-4! py-2.5! text-[13px]! font-semibold! text-[#334155]! hover:bg-[#F8FAFC]!"
                    startContent={
                      <Icon icon="tabler:arrow-left" className="text-base" />
                    }
                  >
                    Volver
                  </Button>
                  {canExportExcel && (
                    <Button
                      hierarchy="primary"
                      className="rounded-xl! border-[#1A2B5B]! bg-[#1A2B5B]! px-4! py-2.5! text-[13px]! font-semibold! text-white!"
                      onClick={exportAllToExcel}
                      disabled={exportingExcel}
                      loading={exportingExcel}
                      startContent={
                        !exportingExcel ? (
                          <Icon icon="tabler:file-export" className="text-base" />
                        ) : undefined
                      }
                    >
                      {exportingExcel
                        ? exportProgress != null
                          ? `Exportando… ${exportProgress}%`
                          : "Exportando…"
                        : "Exportar Excel"}
                    </Button>
                  )}
                </div>
              </header>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              icon="tabler:users"
              label="Total registros"
              value={formatInt(kpis.total)}
              subtitle={`${kpis.verifiedPct.toFixed(1)}% con OTP verificado`}
              subtitleClassName="text-emerald-600"
            />
            <KpiCard
              icon="tabler:shield-check"
              label="Consentimiento activo"
              value={formatInt(kpis.consentActive)}
              subtitle={`${kpis.consentCoveragePct.toFixed(1)}% del total`}
              subtitleClassName="text-emerald-600"
              detail={`${formatInt(kpis.consentRevoked)} revocados`}
            />
            <KpiCard
              icon="tabler:file-certificate"
              label="Evidencia legal"
              value={formatInt(kpis.legalEvidenceCount)}
              subtitle={`${kpis.evidenceCoveragePct.toFixed(1)}% cobertura completa`}
              detail="Política + aceptación + traza"
            />
            <KpiCard
              icon="tabler:device-mobile-message"
              label="Canal OTP principal"
              value={kpis.topChannel}
              subtitle={`${formatInt(kpis.topChannelCount)} registros`}
              detail={`SMS ${kpis.channels.SMS} · Email ${kpis.channels.EMAIL} · WhatsApp ${kpis.channels.WHATSAPP}`}
            />
          </section>
        </div>
      </div>

      <div className="min-h-0 flex-1 px-5 pb-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto h-full max-w-[1240px] overflow-hidden rounded-2xl border border-[#E8EDF7] bg-white shadow-[0_2px_12px_rgba(15,35,70,0.04)]">
          <FormResponsesFilters
            activeFilter={consentFilter}
            onChange={setConsentFilter}
            resultCount={meta?.totalCount ?? data?.responses?.length ?? 0}
            totalCount={kpis.total}
            loading={loading && !data}
          />
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
            embedded
          />
        </div>
      </div>
    </div>
  );
}
