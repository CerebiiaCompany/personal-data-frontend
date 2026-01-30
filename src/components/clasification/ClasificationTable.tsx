import { CollectFormClasification } from "@/types/collectForm.types";
import { Icon } from "@iconify/react/dist/iconify.js";
import React from "react";
import LoadingCover from "../layout/LoadingCover";
import { formatDateToString } from "@/utils/date.utils";
import Link from "next/link";
import { useSessionStore } from "@/store/useSessionStore";
import {
  fetchAllCollectFormResponses,
  fetchCollectFormResponses,
} from "@/lib/collectFormResponse.api";
import { toast } from "sonner";
import { flattenObject } from "@/utils/flattenObject";

interface Props {
  items: CollectFormClasification[] | null;
  loading: boolean;
  error: string | null;
}

const ClasificationTable = ({ items, loading, error }: Props) => {
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

    console.log(res);
  }

  return (
    <div className="w-full overflow-x-auto flex-1 relative">
      {loading && <LoadingCover />}

      {items ? (
        items.length ? (
          <>
            {/* Mobile Cards View */}
            <div className="md:hidden flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="bg-primary-50 rounded-lg p-4 shadow-md border border-disabled"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <h6 className="font-semibold text-primary-900 text-sm flex-1">
                        {item.name}
                      </h6>
                      <div className="flex-shrink-0">
                        {item.totalResponses > 0 ? (
                          item.verifiedResponses === item.totalResponses ? (
                            <Icon
                              icon={"tabler:check"}
                              className="text-green-400 text-2xl"
                            />
                          ) : (
                            <Icon
                              icon={"tabler:x"}
                              className="text-red-400 text-2xl"
                            />
                          )
                        ) : (
                          <Icon
                            icon={"tabler:user-x"}
                            className="text-yellow-400 text-2xl"
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 text-xs text-stone-600">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Fecha de envío:</span>
                        <span>{formatDateToString({ date: item.createdAt })}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Datos verificados:</span>
                        <span>
                          {item.verifiedResponses}/{item.totalResponses}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-disabled">
                      <button
                        aria-label="Exportar"
                        onClick={() => exportClassificationData(item._id)}
                        className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                      >
                        <Icon
                          icon={"material-symbols:export-notes-outline"}
                          className="text-primary-500 text-xl"
                        />
                      </button>
                      <Link
                        aria-label="Ver reporte"
                        href={`/admin/clasificacion/${item._id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-900 text-white rounded-lg hover:bg-primary-800 transition-colors text-sm font-medium"
                      >
                        <Icon
                          icon={"tabler:report-analytics"}
                          className="text-lg"
                        />
                        <span>Ver reporte</span>
                        <Icon icon={"tabler:chevron-right"} className="text-base" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <table className="hidden md:table w-full table-auto border-separate border-spacing-y-2">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-3 w-1/6"
                  >
                    Formulario
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-3 w-1/6"
                  >
                    Fecha de envío
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-3 w-1/6"
                  >
                    Datos verificados
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-3 w-1/6"
                  >
                    Verificación
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-3 w-1/6"
                  >
                    Exportar
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-3 w-1/6"
                  >
                    Ver reporte
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="align-middle text-center">
                    <td className="py-3 px-4 bg-primary-50 font-medium rounded-l-xl text-ellipsis">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 bg-primary-50 font-medium">
                      {formatDateToString({ date: item.createdAt })}
                    </td>
                    <td className="py-3 px-4 bg-primary-50 font-medium">
                      {item.verifiedResponses}/{item.totalResponses}
                    </td>
                    <td className="py-3 px-4 bg-primary-50 font-medium">
                      <div className="w-full flex justify-center">
                        {item.totalResponses > 0 ? (
                          item.verifiedResponses === item.totalResponses ? (
                            <Icon
                              icon={"tabler:check"}
                              className="text-green-400 text-3xl"
                            />
                          ) : (
                            <Icon
                              icon={"tabler:x"}
                              className="text-red-400 text-3xl"
                            />
                          )
                        ) : (
                          <Icon
                            icon={"tabler:user-x"}
                            className="text-yellow-400 text-3xl"
                          />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 bg-primary-50 font-medium">
                      <button
                        aria-label="Exportar"
                        onClick={() => exportClassificationData(item._id)}
                      >
                        <Icon
                          icon={"material-symbols:export-notes-outline"}
                          className="text-primary-500 text-3xl"
                        />
                      </button>
                    </td>
                    <td className="py-3 px-4 bg-primary-50 font-medium rounded-r-xl">
                      <Link
                        aria-label="Ver reporte"
                        href={`/admin/clasificacion/${item._id}`}
                        className="flex justify-center w-full items-center"
                      >
                        <Icon
                          icon={"tabler:report-analytics"}
                          className="text-primary-500 text-3xl"
                        />
                        <Icon
                          icon={"tabler:chevron-right"}
                          className="text-primary-500 text-xl"
                        />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <p className="text-center text-stone-500 text-sm sm:text-base">No hay formularios para clasificar</p>
          </div>
        )
      ) : null}

      {error && (
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <p className="text-center text-red-500 text-sm sm:text-base">Error: {error}</p>
        </div>
      )}
    </div>
  );
};

export default ClasificationTable;
