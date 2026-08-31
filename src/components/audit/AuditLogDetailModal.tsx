"use client";

import React from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { hideDialog } from "@/utils/dialogs.utils";
import { useDialogBackdropClose } from "@/hooks/useDialogBackdropClose";
import {
  UserActionLog,
  parseActionLogTargetModelToString,
} from "@/types/userActionLogs.types";

interface Props {
  log: UserActionLog | null;
}

// Item OBS-33 (31 ago 2026): mismo criterio de formateo que
// formatAuditValue() en el backend (userActionLog.middleware.ts) — se
// duplica acá porque el frontend ya recibe before/after saneados por API,
// sin pasar por esa función de nuevo.
function formatDetailValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "vacío";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (Array.isArray(value)) {
    if (value.length === 0) return "vacío";
    return value.map((v) => formatDetailValue(v)).join(", ");
  }
  if (typeof value === "string") {
    const isoDateMatch = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
    if (isoDateMatch) {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) return parsed.toLocaleString("es-CL");
    }
    return value;
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

interface DiffRow {
  field: string;
  before: string;
  after: string;
}

function buildDiffRows(before: Record<string, unknown>, after: Record<string, unknown>): DiffRow[] {
  const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)])).sort();
  const rows: DiffRow[] = [];
  for (const key of keys) {
    const b = before[key];
    const a = after[key];
    if (JSON.stringify(b) === JSON.stringify(a)) continue;
    rows.push({ field: key, before: formatDetailValue(b), after: formatDetailValue(a) });
  }
  return rows;
}

function buildSnapshotRows(snapshot: Record<string, unknown>): DiffRow[] {
  return Object.keys(snapshot)
    .sort()
    .map((key) => ({ field: key, before: "", after: formatDetailValue(snapshot[key]) }));
}

const AuditLogDetailModal = ({ log }: Props) => {
  const id = HTML_IDS_DATA.auditLogDetailModal;
  const backdropClose = useDialogBackdropClose(() => hideDialog(id), { matchId: id });

  const before = (log?.before ?? {}) as Record<string, unknown>;
  const after = (log?.after ?? {}) as Record<string, unknown>;
  const isUpdate = log?.type === "UPDATE";
  const hasBefore = Object.keys(before).length > 0;
  const hasAfter = Object.keys(after).length > 0;

  const rows = isUpdate
    ? buildDiffRows(before, after)
    : buildSnapshotRows(hasAfter ? after : before);

  return (
    <div
      {...backdropClose}
      id={id}
      className="dialog-wrapper fixed hidden w-full top-0 left-0 h-full z-20 justify-center items-center bg-stone-900/50"
    >
      <div className="w-full animate-appear max-w-2xl rounded-xl overflow-hidden bg-white flex flex-col max-h-3/4 gap-4">
        <header className="border-b justify-between border-b-disabled flex items-center p-4">
          <span />
          <h3 className="font-bold text-xl text-center">
            Detalle de auditoría
            {log ? ` — ${parseActionLogTargetModelToString(log.targetModel)}` : ""}
          </h3>
          <button
            onClick={() => hideDialog(id)}
            className="w-fit p-1 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <Icon icon="tabler:x" className="text-2xl" />
          </button>
        </header>

        <div className="flex-1 px-4 pb-4 flex flex-col gap-3 h-full overflow-y-auto">
          {log?.summary && (
            <p className="text-sm text-stone-600 bg-stone-50 rounded-lg px-3 py-2">
              {log.summary}
            </p>
          )}

          {rows.length === 0 ? (
            <p className="text-center text-sm text-stone-500 py-6">
              {!hasBefore && !hasAfter
                ? "No hay datos detallados guardados para este registro (es anterior a esta mejora del log de auditoría, o corresponde a un tipo de recurso sin detalle registrado)."
                : "No se detectaron campos modificados."}
            </p>
          ) : (
            <table className="w-full table-auto border-separate border-spacing-y-2">
              <thead>
                <tr>
                  <th className="text-left font-medium text-stone-600 text-xs py-1 px-2 w-1/3">
                    Campo
                  </th>
                  {isUpdate ? (
                    <>
                      <th className="text-left font-medium text-stone-600 text-xs py-1 px-2 w-1/3">
                        Antes
                      </th>
                      <th className="text-left font-medium text-stone-600 text-xs py-1 px-2 w-1/3">
                        Después
                      </th>
                    </>
                  ) : (
                    <th className="text-left font-medium text-stone-600 text-xs py-1 px-2 w-2/3">
                      Valor
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.field} className="align-top">
                    <td className="py-2 px-2 bg-primary-50 font-mono text-xs rounded-l-lg break-words">
                      {row.field}
                    </td>
                    {isUpdate ? (
                      <>
                        <td className="py-2 px-2 bg-primary-50 text-sm text-red-700 break-words">
                          {row.before}
                        </td>
                        <td className="py-2 px-2 bg-primary-50 text-sm text-green-700 rounded-r-lg break-words">
                          {row.after}
                        </td>
                      </>
                    ) : (
                      <td className="py-2 px-2 bg-primary-50 text-sm rounded-r-lg break-words">
                        {row.after}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogDetailModal;
