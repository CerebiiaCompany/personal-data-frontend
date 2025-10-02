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

    // Normalize/flatten rows so nested fields become columns
    const flatRows = responses.map((r) => flattenObject(r));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Respuestas");

    // Determine all unique keys across rows to build consistent columns
    const allKeys = Array.from(
      new Set(flatRows.flatMap((r) => Object.keys(r)))
    );

    worksheet.columns = allKeys.map((key) => ({ header: key, key }));

    // Add rows (objects are fine since keys match column keys)
    flatRows.forEach((row) => worksheet.addRow(row));

    // Auto-fit column widths with reasonable bounds
    worksheet.columns?.forEach((col) => {
      let max = (col.header ? String(col.header).length : 10) as number;
      col.eachCell!({ includeEmpty: true }, (cell) => {
        const v = cell.value as any;
        const len = v == null ? 0 : String(v).length;
        if (len > max) max = len;
      });
      col.width = Math.min(60, Math.max(10, max + 2));
    });

    // Build a readable filename
    const safeName =
      res.data.name || "formulario".replace(/[^a-zA-Z0-9-_]/g, "_");
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

      {items && (
        <table className="w-full table-auto border-separate border-spacing-y-2">
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
                    {item.verifiedResponses === item.totalResponses ? (
                      <Icon
                        icon={"tabler:check"}
                        className="text-green-400 text-3xl"
                      />
                    ) : (
                      <Icon
                        icon={"tabler:x"}
                        className="text-red-400 text-3xl"
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
      )}

      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default ClasificationTable;
