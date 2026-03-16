"use client";

import LoadingCover from "@/components/layout/LoadingCover";
import {
  parseActionLogTargetModelToString,
  UserActionLog,
  UserActionLogType,
} from "@/types/userActionLogs.types";
import { formatDateToString } from "@/utils/date.utils";
import {
  isRestoreableTargetModel,
  parseEndpointForRestore,
  RestoreableTargetModel,
} from "@/utils/auditRestore.utils";
import { restoreCampaign } from "@/lib/campaign.api";
import { restoreCollectForm } from "@/lib/collectForm.api";
import { restoreCollectFormResponse } from "@/lib/collectFormResponse.api";
import { restoreCompanyArea } from "@/lib/companyArea.api";
import { restoreCompanyRole } from "@/lib/companyRole.api";
import { restorePolicyTemplate } from "@/lib/policyTemplate.api";
import { restoreCompanyUser } from "@/lib/user.api";
import { parseApiError } from "@/utils/parseApiError";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/base/Button";
import { useConfirm } from "@/components/dialogs/ConfirmProvider";

function formatDateTime(isoString: string): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  const date = formatDateToString({ date: d });
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `${date} ${hours}:${minutes}`;
}

function parseUserActionLogTypeToLabel(type: UserActionLogType): string {
  switch (type) {
    case "CREATE":
      return "Crear";
    case "UPDATE":
      return "Editar";
    case "DELETE":
      return "Eliminar";
    case "RESTORE":
      return "Restaurar";
    default:
      return type;
  }
}

function parseUserActionLogTypeToIcon(type: UserActionLogType): string {
  switch (type) {
    case "CREATE":
      return "tabler:plus";
    case "UPDATE":
      return "material-symbols:edit-outline";
    case "DELETE":
      return "bx:trash";
    case "RESTORE":
      return "tabler:arrow-back-up";
    default:
      return "tabler:question-mark";
  }
}

interface Props {
  items: UserActionLog[] | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

async function executeRestore(
  parsed: { companyId: string; targetModel: RestoreableTargetModel; resourceId: string; responseId?: string }
): Promise<{ ok: boolean; error?: string }> {
  const { companyId, targetModel, resourceId, responseId } = parsed;
  try {
    switch (targetModel) {
      case "USER": {
        const res = await restoreCompanyUser(companyId, resourceId);
        if (res.error) return { ok: false, error: parseApiError(res.error) };
        return { ok: true };
      }
      case "COMPANY_AREA": {
        const res = await restoreCompanyArea(companyId, resourceId);
        if (res.error) return { ok: false, error: parseApiError(res.error) };
        return { ok: true };
      }
      case "COMPANY_ROLE": {
        const res = await restoreCompanyRole(companyId, resourceId);
        if (res.error) return { ok: false, error: parseApiError(res.error) };
        return { ok: true };
      }
      case "CAMPAIGN": {
        const res = await restoreCampaign(companyId, resourceId);
        if (res.error) return { ok: false, error: parseApiError(res.error) };
        return { ok: true };
      }
      case "COLLECT_FORM": {
        const res = await restoreCollectForm(companyId, resourceId);
        if (res.error) return { ok: false, error: parseApiError(res.error) };
        return { ok: true };
      }
      case "COLLECT_FORM_RESPONSE": {
        if (!responseId) {
          return { ok: false, error: "No se encontró el ID de la respuesta del formulario" };
        }
        const res = await restoreCollectFormResponse(companyId, resourceId, responseId);
        if (res.error) return { ok: false, error: parseApiError(res.error) };
        return { ok: true };
      }
      case "POLICY_TEMPLATE": {
        const res = await restorePolicyTemplate(companyId, resourceId);
        if (res.error) return { ok: false, error: parseApiError(res.error) };
        return { ok: true };
      }
      default:
        return { ok: false, error: "Recurso no restaurable" };
    }
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

const AuditLogsTable = ({ items, loading, error, refresh }: Props) => {
  const confirm = useConfirm();
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const handleRestore = async (item: UserActionLog) => {
    if (item.type !== "DELETE" || !isRestoreableTargetModel(item.targetModel)) return;
    const parsed = parseEndpointForRestore(item.endpoint || "", item.targetModel);
    if (!parsed) {
      toast.error("No se pudo obtener la información del registro para restaurar.");
      return;
    }

    const confirmed = await confirm({
      title: "¿Restaurar este registro?",
      description: (
        <span>
          Se restaurará el recurso &quot;{parseActionLogTargetModelToString(item.targetModel)}&quot; eliminado.
          Esta acción puede revertir el borrado.
        </span>
      ),
      confirmText: "Sí, restaurar",
      cancelText: "Cancelar",
      danger: false,
    });

    if (!confirmed) return;

    setRestoringId(item._id);
    const result = await executeRestore(parsed);
    setRestoringId(null);

    if (result.ok) {
      toast.success("Registro restaurado correctamente");
      refresh();
    } else {
      toast.error(result.error || "Error al restaurar");
    }
  };

  return (
    <div className="w-full overflow-x-auto flex-1 relative min-h-20">
      {loading && <LoadingCover />}

      {items && !error && (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[700px] table-auto border-separate border-spacing-y-2">
            <thead className="sticky top-0 bg-white z-10">
              <tr>
                <th
                  scope="col"
                  className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[120px]"
                >
                  Fecha y hora
                </th>
                <th
                  scope="col"
                  className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[120px]"
                >
                  Usuario
                </th>
                <th
                  scope="col"
                  className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[90px]"
                >
                  Acción
                </th>
                <th
                  scope="col"
                  className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[100px]"
                >
                  Recurso
                </th>
                <th
                  scope="col"
                  className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 min-w-[140px]"
                >
                  Resumen
                </th>
                <th
                  scope="col"
                  className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 min-w-[180px] max-w-[220px]"
                >
                  Endpoint
                </th>
                <th
                  scope="col"
                  className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[100px]"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-stone-500 text-sm bg-primary-50/50 rounded-xl"
                  >
                    No hay registros de auditoría en el rango seleccionado.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item._id}
                    className="align-middle text-center"
                  >
                    <td className="py-2 sm:py-3 px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm text-primary-900 rounded-l-xl whitespace-nowrap">
                      {formatDateTime(item.createdAt)}
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm text-primary-900 truncate max-w-[140px]">
                      {item.user
                        ? `${item.user.name} ${item.user.lastName}`.trim()
                        : "—"}
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm">
                      <div className="flex items-center justify-center gap-1">
                        <Icon
                          icon={parseUserActionLogTypeToIcon(item.type)}
                          className="text-base text-primary-900"
                        />
                        <span className="text-primary-900">
                          {parseUserActionLogTypeToLabel(item.type)}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm text-primary-900">
                      {parseActionLogTargetModelToString(item.targetModel)}
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm text-primary-900 truncate max-w-[160px] mx-auto">
                      {item.summary || "—"}
                    </td>
                    <td
                      className="py-2 sm:py-3 px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm text-stone-600 max-w-[220px] truncate"
                      title={item.endpoint}
                    >
                      {item.endpoint || "—"}
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm rounded-r-xl">
                      {item.type === "DELETE" && isRestoreableTargetModel(item.targetModel) && (
                        <Button
                          type="button"
                          hierarchy="tertiary"
                          className="text-xs text-primary-700 hover:bg-primary-100"
                          onClick={() => handleRestore(item)}
                          disabled={restoringId === item._id}
                          startContent={
                            restoringId === item._id ? (
                              <span className="inline-block w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Icon icon="tabler:arrow-back-up" className="text-base" />
                            )
                          }
                        >
                          {restoringId === item._id ? "Restaurando…" : "Restaurar"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <p className="text-center text-red-500 text-sm sm:text-base mb-3">
            Error: {error}
          </p>
          <button
            type="button"
            onClick={refresh}
            className="text-primary-600 hover:underline text-sm font-medium"
          >
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditLogsTable;
