"use client";

import Button from "@/components/base/Button";
import SectionSearchBar from "@/components/base/SectionSearchBar";
import FormResponsesTable from "@/components/clasification/FormResponsesTable";
import { useCollectFormResponses } from "@/hooks/useCollectFormResponses";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { fetchCollectFormResponses } from "@/lib/collectFormResponse.api";
import { useSessionStore } from "@/store/useSessionStore";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type FormResponseSummary = {
  verifiedResponses?: number;
  consentActiveCount?: number;
  consentRevokedCount?: number;
};

export default function FormClassificationPage() {
  const user = useSessionStore((store) => store.user);
  const formId = useParams().formId?.toString();
  const { debouncedValue, search, setSearch } = useDebouncedSearch();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [exportingExcel, setExportingExcel] = useState(false);
  
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
    companyId: user?.companyUserData?.companyId,
    id: formId,
    search: apiSearch,
    page: currentPage,
    pageSize: pageSize,
  });

  const typedSummary = (summary || {}) as FormResponseSummary;
  useEffect(() => {
    setCurrentPage(1);
  }, [apiSearch]);

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

  async function exportAllToExcel() {
    const companyId = user?.companyUserData?.companyId;
    if (!companyId || !formId) return;

    setExportingExcel(true);
    try {
      const res = await fetchCollectFormResponses({
        companyId,
        id: formId,
        pageSize: 0,
      });

      if (res.error) {
        toast.error("No se pudo exportar el Excel completo");
        return;
      }

      const rows = (res.data?.responses || res.data || []) as any[];
      if (!Array.isArray(rows) || rows.length === 0) {
        toast.info("No hay registros para exportar");
        return;
      }

      const ExcelJS = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Registros");

      worksheet.columns = [
      { header: "Tipo Doc", key: "docType", width: 12 },
      { header: "Documento", key: "docNumber", width: 16 },
      { header: "Nombre", key: "name", width: 18 },
      { header: "Apellido", key: "lastName", width: 18 },
      { header: "Edad", key: "age", width: 10 },
      { header: "Genero", key: "gender", width: 12 },
      { header: "Correo", key: "email", width: 30 },
      { header: "Telefono", key: "phone", width: 16 },
      { header: "Canal OTP", key: "otpChannel", width: 14 },
      { header: "Destino OTP", key: "otpAddress", width: 30 },
      { header: "Estado OTP", key: "otpStatus", width: 14 },
      { header: "Provider OTP", key: "otpProvider", width: 16 },
      { header: "OTP sentAt", key: "otpSentAt", width: 20 },
      { header: "OTP verifiedAt", key: "otpVerifiedAt", width: 20 },
      { header: "OTP expiresAt", key: "otpExpiresAt", width: 20 },
      { header: "Intentos OTP", key: "otpAttempts", width: 12 },
      { header: "Fallos OTP", key: "otpFails", width: 12 },
      { header: "Consentimiento", key: "consentStatus", width: 14 },
      { header: "Politica version", key: "policyVersion", width: 20 },
      { header: "Politica URL", key: "policyUrl", width: 40 },
      { header: "Consent acceptedAt", key: "consentAcceptedAt", width: 20 },
      { header: "IP", key: "ipAddress", width: 18 },
      { header: "User Agent", key: "userAgent", width: 45 },
      { header: "Obtenido via", key: "obtainedVia", width: 16 },
      { header: "Creado", key: "createdAt", width: 20 },
      { header: "Procesamiento", key: "processingStatus", width: 14 },
    ];

      for (const item of rows) {
        const otp = typeof item.otpCodeId === "object" ? item.otpCodeId : null;
        worksheet.addRow({
        docType: item.user?.docType || "",
        docNumber: item.user?.docNumber || "",
        name: item.user?.name || "",
        lastName: item.user?.lastName || "",
        age: item.user?.age ?? "",
        gender: item.user?.gender || "",
        email: item.user?.email || "",
        phone: item.user?.phone || "",
        otpChannel: otp?.recipientData?.channel || item.consent?.otp?.channel || "",
        otpAddress: otp?.recipientData?.address || item.consent?.otp?.address || "",
        otpStatus: otp?.status || "",
        otpProvider: otp?.delivery?.provider || item.consent?.otp?.sendStatus || "",
        otpSentAt: otp?.delivery?.sentAt || "",
        otpVerifiedAt: otp?.verifiedAt || item.consent?.otp?.verifiedAt || "",
        otpExpiresAt: otp?.expiresAt || "",
        otpAttempts: otp?.delivery?.attempts ?? item.consent?.otp?.sendAttempts ?? "",
        otpFails: otp?.failedAttempts ?? item.consent?.otp?.failedVerifyAttempts ?? "",
        consentStatus: item.consent?.status || "",
        policyVersion: item.consent?.policy?.policyVersionLabel || "",
        policyUrl: otp?.policyUrl || item.consent?.otpMessage?.policyUrl || "",
        consentAcceptedAt: item.consent?.acceptedAt || "",
        ipAddress: item.consent?.ipAddress || "",
        userAgent: item.consent?.userAgent || "",
        obtainedVia: item.consent?.obtainedVia || "",
        createdAt: item.createdAt || "",
        processingStatus: item.dataProcessing ? "Completo" : "Incompleto",
        });
      }

      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };
      const file = await workbook.xlsx.writeBuffer();
      const blob = new Blob([file], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `registros_datos_personales_${formId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Excel completo exportado");
    } catch {
      toast.error("Ocurrió un error al generar el Excel");
    } finally {
      setExportingExcel(false);
    }
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
              placeholder="Buscar por nombre, CC, correo, teléfono..."
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                hierarchy="secondary"
                className="rounded-xl! border-[#E3E9F4]! text-[13px]! px-4! py-2.5!"
                onClick={exportAllToExcel}
                disabled={exportingExcel}
              >
                <span className="flex items-center gap-2">
                  <Icon icon="tabler:file-export" className="text-base" />
                  {exportingExcel ? "Exportando..." : "Exportar Excel"}
                </span>
              </Button>
            </div>
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
