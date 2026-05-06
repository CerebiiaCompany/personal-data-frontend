import {
  ClasificationListSummary,
  CollectFormClasification,
} from "@/types/collectForm.types";
import { Icon } from "@iconify/react";
import React, { useMemo } from "react";
import LoadingCover from "../layout/LoadingCover";
import { formatDateToString } from "@/utils/date.utils";
import Link from "next/link";
import { useSessionStore } from "@/store/useSessionStore";
import { fetchCollectFormResponses } from "@/lib/collectFormResponse.api";
import { toast } from "sonner";

interface Props {
  /** Filas mostradas (p. ej. filtradas por búsqueda en cliente) */
  items: CollectFormClasification[] | null;
  /** Si se define, las tarjetas de resumen usan este listado completo; si no, usan `items` */
  aggregateSource?: CollectFormClasification[] | null;
  /** Totales del backend (`summary`); si existe, sustituye el cálculo desde `aggregateSource` */
  listSummary?: ClasificationListSummary | null;
  loading: boolean;
  error: string | null;
}

function formatNumberEs(n: number): string {
  return n.toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

function formatRelativeDayEs(date: Date): string {
  const today = new Date();
  const a = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const b = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const diffDays = Math.round((b.getTime() - a.getTime()) / 86400000);
  if (diffDays <= 0) return "(hoy)";
  if (diffDays === 1) return "(ayer)";
  return `(hace ${diffDays} días)`;
}

function defaultFormDescription(item: CollectFormClasification): string {
  if (item.description?.trim()) return item.description.trim();
  return "Datos recolectados mediante formulario de consentimiento.";
}

const ClasificationTable = ({
  items,
  aggregateSource,
  listSummary,
  loading,
  error,
}: Props) => {
  const user = useSessionStore((store) => store.user);

  async function exportClassificationData(id: string) {
    const res = await fetchCollectFormResponses({
      companyId: user?.companyUserData?.companyId,
      id,
      pageSize: 0,
    }); //{data: {responses: CollectFormResponse[]}}

    if (res.error) {
      return toast.error("Error al exportar los datos del formulario");
    }

    const responses: any[] = res?.data?.responses || res?.data || [];

    if (!Array.isArray(responses) || responses.length === 0) {
      toast.info("No hay respuestas para exportar");
      return;
    }

    // Dynamic import to avoid SSR issues
    const ExcelJS = await import("exceljs");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Respuestas");

    // Helper para formatear fechas
    const formatDateTime = (value?: string) => {
      if (!value) return "";
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return "";
      return d.toLocaleString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Helper para traducir gender
    const parseGender = (gender: string) => {
      if (gender === "MALE") return "Masculino";
      if (gender === "FEMALE") return "Femenino";
      if (gender === "OTHER") return "Otro";
      return gender || "";
    };

    // Helper para traducir docType
    const parseDocType = (docType: string) => {
      if (docType === "CC") return "CC";
      if (docType === "CE") return "CE";
      if (docType === "TI") return "TI";
      if (docType === "PEP") return "PEP";
      if (docType === "PPT") return "PPT";
      return docType || "";
    };

    // Recolectar todas las claves de "data" (respuestas personalizadas) para columnas dinámicas
    const allDataKeys = Array.from(
      new Set(
        responses.flatMap((r: any) =>
          r.data && typeof r.data === "object" ? Object.keys(r.data) : []
        )
      )
    );

    // Definir columnas fijas + columnas dinámicas para "data"
    const fixedColumns = [
      { header: "Tipo de documento", key: "docType", width: 18 },
      { header: "Número de documento", key: "docNumber", width: 18 },
      { header: "Nombre", key: "name", width: 20 },
      { header: "Apellido", key: "lastName", width: 20 },
      { header: "Edad", key: "age", width: 10 },
      { header: "Género", key: "gender", width: 12 },
      { header: "Email", key: "email", width: 30 },
      { header: "Teléfono", key: "phone", width: 15 },
      { header: "Registrado por", key: "createdByName", width: 25 },
      { header: "Fecha y hora registro", key: "createdAt", width: 20 },
      { header: "Usó OTP", key: "verifiedWithOTP", width: 12 },
      { header: "Canal OTP", key: "otpChannel", width: 12 },
      { header: "Destino OTP", key: "otpAddress", width: 30 },
      { header: "Estado OTP", key: "otpStatus", width: 15 },
      { header: "Provider OTP", key: "otpProvider", width: 15 },
      { header: "OTP enviado", key: "otpSentAt", width: 20 },
      { header: "OTP verificado", key: "otpVerifiedAt", width: 20 },
      { header: "OTP expira", key: "otpExpiresAt", width: 20 },
      { header: "Intentos OTP", key: "otpAttempts", width: 15 },
      { header: "Fallos OTP", key: "otpFailedAttempts", width: 15 },
      { header: "Obtenido vía", key: "obtainedVia", width: 15 },
      { header: "Estado consentimiento", key: "consentStatus", width: 20 },
      { header: "Fecha consentimiento", key: "consentAcceptedAt", width: 20 },
      { header: "Política", key: "policyLabel", width: 30 },
      { header: "URL política", key: "policyUrl", width: 40 },
      { header: "IP", key: "ipAddress", width: 18 },
      { header: "User-Agent", key: "userAgent", width: 50 },
      { header: "Verificado", key: "dataProcessing", width: 12 },
    ];

    // Agregar columnas dinámicas para respuestas personalizadas (data)
    const dataColumns = allDataKeys.map((key) => ({
      header: `Pregunta: ${key}`,
      key: `data_${key}`,
      width: 25,
    }));

    worksheet.columns = [...fixedColumns, ...dataColumns];

    // Mapear cada respuesta a una fila
    responses.forEach((item: any) => {
      const otp =
        item.otpCodeId && typeof item.otpCodeId === "object"
          ? item.otpCodeId
          : null;
      const otpChannel =
        otp?.recipientData?.channel ?? item.consent?.otp?.channel ?? "";
      const otpAddress =
        otp?.recipientData?.address ?? item.consent?.otp?.address ?? "";
      const otpStatus =
        otp?.status ?? (item.consent?.otp?.verified ? "VERIFIED" : "");
      const otpVerifiedAt = otp?.verifiedAt ?? item.consent?.otp?.verifiedAt;
      const otpExpiresAt = otp?.expiresAt;
      const otpAttempts =
        otp?.delivery?.attempts ?? item.consent?.otp?.sendAttempts;
      const otpFailedAttempts =
        otp?.failedAttempts ?? item.consent?.otp?.failedVerifyAttempts;
      const obtainedVia = item.consent?.obtainedVia ?? "";
      const consentStatus = item.consent?.status ?? "";
      const consentAcceptedAt = item.consent?.acceptedAt;
      const policyLabel = item.consent?.policy?.policyVersionLabel || "";
      const policyUrl =
        otp?.policyUrl ?? item.consent?.otpMessage?.policyUrl ?? "";
      const createdByName = item.createdBy?.name || item.createdBy?.lastName
        ? `${item.createdBy?.name || ""}${
            item.createdBy?.lastName ? ` ${item.createdBy.lastName}` : ""
          }`
        : item.createdBy?.username || item.createdBy?.email || "";

      const rowData: any = {
        docType: parseDocType(item.user?.docType),
        docNumber: item.user?.docNumber || "",
        name: item.user?.name || "",
        lastName: item.user?.lastName || "",
        age:
          item.user?.age && item.user.age >= 18 ? item.user.age : "—",
        gender: parseGender(item.user?.gender),
        email: item.user?.email || "",
        phone: item.user?.phone || "",
        createdByName,
        createdAt: formatDateTime(item.createdAt),
        verifiedWithOTP: item.verifiedWithOTP ? "Sí" : "No",
        otpChannel,
        otpAddress,
        otpStatus,
        otpProvider: otp?.delivery?.provider || "",
        otpSentAt: formatDateTime(otp?.delivery?.sentAt),
        otpVerifiedAt: formatDateTime(otpVerifiedAt),
        otpExpiresAt: formatDateTime(otpExpiresAt),
        otpAttempts: typeof otpAttempts === "number" ? otpAttempts : "",
        otpFailedAttempts:
          typeof otpFailedAttempts === "number" ? otpFailedAttempts : "",
        obtainedVia,
        consentStatus,
        consentAcceptedAt: formatDateTime(consentAcceptedAt),
        policyLabel,
        policyUrl,
        ipAddress: item.consent?.ipAddress || "",
        userAgent: item.consent?.userAgent || "",
        dataProcessing: item.dataProcessing ? "Sí" : "No",
      };

      // Agregar respuestas personalizadas (data)
      if (item.data && typeof item.data === "object") {
        allDataKeys.forEach((key) => {
          const val = item.data[key];
          rowData[`data_${key}`] =
            val === null || val === undefined
              ? ""
              : typeof val === "object"
                ? JSON.stringify(val)
                : String(val);
        });
      }

      worksheet.addRow(rowData);
    });

    // Estilizar encabezados: fondo azul, texto blanco, negrita
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E3A8A" }, // Azul oscuro
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 20;

    // Aplicar bordes y alineación a todas las celdas de datos
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFD1D5DB" } },
          left: { style: "thin", color: { argb: "FFD1D5DB" } },
          bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
          right: { style: "thin", color: { argb: "FFD1D5DB" } },
        };
        if (rowNumber > 1) {
          // Solo para filas de datos
          cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
        }
      });
    });

    // Activar filtros automáticos
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: worksheet.columns?.length || 1 },
    };

    // Congelar la primera fila (encabezados)
    worksheet.views = [{ state: "frozen", ySplit: 1 }];

    // Build a readable filename
    const safeName = (res.data.name || "formulario").replace(
      /[^a-zA-Z0-9-_]/g,
      "_"
    );
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const filename = `${safeName}_respuestas_${y}-${m}-${d}.xlsx`;

    // Generate and download in the browser
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    toast.success("Exportación completada");
  }

  const statsItems = aggregateSource ?? items;

  const aggregates = useMemo(() => {
    if (listSummary) {
      const totalRecords = listSummary.totalResponses ?? 0;
      const verifiedTotal = listSummary.verifiedResponses ?? 0;
      const verifiedPct =
        totalRecords > 0
          ? Math.round((verifiedTotal / totalRecords) * 1000) / 10
          : 0;
      let lastActivity: Date | null = null;
      if (listSummary.lastResponseAt) {
        const d = new Date(listSummary.lastResponseAt);
        if (!Number.isNaN(d.getTime())) lastActivity = d;
      }
      return {
        activeForms: listSummary.activeFormsCount ?? 0,
        totalRecords,
        verifiedTotal,
        verifiedPct,
        lastActivity,
      };
    }

    if (!statsItems?.length) {
      return {
        activeForms: 0,
        totalRecords: 0,
        verifiedTotal: 0,
        verifiedPct: 0,
        lastActivity: null as Date | null,
      };
    }
    const activeForms = statsItems.filter((it) => it.isActive !== false).length;
    const totalRecords = statsItems.reduce(
      (s, it) => s + (it.totalResponses || 0),
      0
    );
    const verifiedTotal = statsItems.reduce(
      (s, it) => s + (it.verifiedResponses || 0),
      0
    );
    const verifiedPct =
      totalRecords > 0 ? Math.round((verifiedTotal / totalRecords) * 1000) / 10 : 0;

    let lastActivity: Date | null = null;
    for (const it of statsItems) {
      const raw =
        it.lastResponseAt ?? it.updatedAt ?? it.updated ?? it.createdAt;
      const d = new Date(raw as string | Date);
      if (!Number.isNaN(d.getTime())) {
        if (!lastActivity || d > lastActivity) lastActivity = d;
      }
    }

    return {
      activeForms,
      totalRecords,
      verifiedTotal,
      verifiedPct,
      lastActivity,
    };
  }, [listSummary, statsItems]);

  const showSummaryCards =
    listSummary != null || (statsItems != null && statsItems.length > 0);

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 min-w-0 relative">
      {loading && (
        <div className="absolute inset-0 z-10 min-h-[200px] rounded-2xl bg-white/60">
          <LoadingCover />
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm font-medium mb-4">
          {error}
        </div>
      )}

      {showSummaryCards && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center gap-3 rounded-2xl border border-[#E8EDF7] bg-white px-4 py-4 shadow-[0_2px_10px_rgba(15,35,70,0.04)]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F1FE] text-[#2563EB]">
              <Icon icon="tabler:file-text" className="text-xl" />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-[#64748B]">Formularios</p>
              <p className="text-[15px] font-bold text-[#0B1737] truncate">
                {formatNumberEs(aggregates.activeForms)} activos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#E8EDF7] bg-white px-4 py-4 shadow-[0_2px_10px_rgba(15,35,70,0.04)]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F1FE] text-[#2563EB]">
              <Icon icon="tabler:users" className="text-xl" />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-[#64748B]">
                Total Registros
              </p>
              <p className="text-[15px] font-bold text-[#0B1737] leading-snug">
                {formatNumberEs(aggregates.totalRecords)}{" "}
                <span className="text-[12px] font-semibold text-[#64748B]">
                  en todos los formularios
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#E8EDF7] bg-white px-4 py-4 shadow-[0_2px_10px_rgba(15,35,70,0.04)]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#16A34A]">
              <Icon icon="tabler:shield-check" className="text-xl" />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-[#64748B]">Verificados</p>
              <p className="text-[15px] font-bold text-[#0B1737] leading-snug">
                {formatNumberEs(aggregates.verifiedTotal)}
                <span className="text-emerald-600 font-bold">
                  {" "}
                  ({aggregates.verifiedPct}% del total)
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#E8EDF7] bg-white px-4 py-4 shadow-[0_2px_10px_rgba(15,35,70,0.04)]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFEDD5] text-[#EA580C]">
              <Icon icon="tabler:clock" className="text-xl" />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-[#64748B]">
                Último Registro
              </p>
              <p className="text-[14px] font-bold text-[#0B1737] leading-snug">
                {aggregates.lastActivity ? (
                  <>
                    {formatDateToString({ date: aggregates.lastActivity })}{" "}
                    <span className="text-[12px] font-semibold text-[#64748B]">
                      {formatRelativeDayEs(aggregates.lastActivity)}
                    </span>
                  </>
                ) : (
                  <span className="text-[#94A3B8]">—</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {items && items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {items.map((item) => {
            const pending = Math.max(
              0,
              (item.totalResponses || 0) - (item.verifiedResponses || 0)
            );
            const pct =
              item.totalResponses > 0
                ? Math.min(
                    100,
                    Math.round(
                      (item.verifiedResponses / item.totalResponses) * 1000
                    ) / 10
                  )
                : 0;
            return (
              <article
                key={item._id}
                className="flex flex-col rounded-2xl border border-[#E8EDF7] bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(15,35,70,0.06)] min-h-[260px]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E8F1FE] text-[#2563EB]">
                    <Icon icon="tabler:file-text" className="text-xl" />
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      aria-label="Exportar a Excel"
                      onClick={() => exportClassificationData(item._id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-transparent text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
                    >
                      <Icon
                        icon="material-symbols:export-notes-outline"
                        className="text-xl"
                      />
                    </button>
                    <Link
                      href={`/admin/clasificacion/${item._id}`}
                      aria-label="Ver datos del formulario"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-transparent text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
                    >
                      <Icon icon="tabler:eye" className="text-xl" />
                    </Link>
                  </div>
                </div>

                <h2 className="mt-4 text-[16px] sm:text-[17px] font-bold text-[#0B1737] leading-snug line-clamp-2">
                  {item.name}
                </h2>
                <p className="mt-2 text-[13px] text-[#64748B] leading-relaxed line-clamp-3">
                  {defaultFormDescription(item)}
                </p>

                <div className="mt-3 flex items-center gap-2 text-[12px] text-[#94A3B8]">
                  <Icon icon="tabler:calendar" className="text-base shrink-0" />
                  <span>
                    Creado el {formatDateToString({ date: item.createdAt })}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-t border-[#EEF2F8] pt-4 text-[13px]">
                  <span className="text-[#334155]">
                    <strong className="text-[#0B1737] tabular-nums">
                      {formatNumberEs(item.totalResponses || 0)}
                    </strong>{" "}
                    registros
                  </span>
                  <span className="text-emerald-600 font-semibold">
                    <strong className="tabular-nums">
                      {formatNumberEs(item.verifiedResponses || 0)}
                    </strong>{" "}
                    verificados
                  </span>
                  <span className="text-[#64748B]">
                    <strong className="text-[#0B1737] tabular-nums">
                      {formatNumberEs(pending)}
                    </strong>{" "}
                    pendientes
                  </span>
                </div>

                <div className="mt-auto pt-5">
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#E8EDF4]">
                    <div
                      className="h-full rounded-full bg-[#0D2B74] transition-[width] duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : !loading &&
        statsItems &&
        statsItems.length > 0 &&
        items &&
        items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#CBD5E1] bg-white/90 py-14 px-4">
          <p className="text-center text-[#64748B] text-sm font-medium">
            No hay formularios que coincidan con la búsqueda
          </p>
        </div>
      ) : !loading && statsItems && statsItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#CBD5E1] bg-white/90 py-14 px-4">
          <p className="text-center text-[#64748B] text-sm font-medium">
            No hay formularios para clasificar
          </p>
        </div>
      ) : !loading && !items ? (
        <div className="rounded-2xl border border-[#E8EDF7] bg-white/80 px-4 py-10 text-center text-[#64748B] text-sm">
          No se pudieron cargar los formularios o aún no hay datos disponibles.
        </div>
      ) : null}
    </div>
  );
};

export default ClasificationTable;
