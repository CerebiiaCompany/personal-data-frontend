"use client";

import Button from "@/components/base/Button";
import { respondArcoRequest } from "@/lib/arcoAdmin.api";
import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import {
  ARCO_RECTIFICATION_FIELDS,
  ArcoRectificationField,
  ArcoRequestType,
} from "@/types/arco.types";
import { userGendersOptions } from "@/types/collectFormResponse.types";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ApprovalRow {
  field: string;
  requestedValue: string;
  approved: boolean;
}

interface Props {
  open: boolean;
  companyId: string;
  requestId: string;
  requestType?: ArcoRequestType;
  rectificationFields?: ArcoRectificationField[];
  onClose: () => void;
  onSuccess: () => void;
}

function fieldLabel(field: string) {
  return (
    ARCO_RECTIFICATION_FIELDS.find((f) => f.value === field)?.label ?? field
  );
}

const ArcoRespondDialog = ({
  open,
  companyId,
  requestId,
  requestType,
  rectificationFields,
  onClose,
  onSuccess,
}: Props) => {
  const [finalStatus, setFinalStatus] = useState<"RESOLVED" | "REJECTED">(
    "RESOLVED"
  );
  const [message, setMessage] = useState("");
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([""]);
  const [approvalRows, setApprovalRows] = useState<ApprovalRow[]>([]);
  const [loading, setLoading] = useState(false);

  const isRectification = requestType === "RECTIFICATION";
  const showApprovalFields =
    isRectification && finalStatus === "RESOLVED" && approvalRows.length > 0;

  useEffect(() => {
    if (!open) return;
    setFinalStatus("RESOLVED");
    setMessage("");
    setAttachmentUrls([""]);
    setApprovalRows(
      (rectificationFields ?? []).map((f) => ({
        field: f.field,
        requestedValue: f.requestedValue,
        approved: true,
      }))
    );
  }, [open, rectificationFields]);

  if (!open) return null;

  function updateApprovalRow(
    index: number,
    patch: Partial<Pick<ApprovalRow, "requestedValue" | "approved">>
  ) {
    setApprovalRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  }

  function updateAttachment(index: number, value: string) {
    setAttachmentUrls((prev) =>
      prev.map((url, i) => (i === index ? value : url))
    );
  }

  function addAttachment() {
    setAttachmentUrls((prev) => [...prev, ""]);
  }

  function removeAttachment(index: number) {
    setAttachmentUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Escribe el mensaje de respuesta al titular");
      return;
    }

    if (showApprovalFields) {
      const approvedEmpty = approvalRows.filter(
        (r) => r.approved && !r.requestedValue.trim()
      );
      if (approvedEmpty.length > 0) {
        toast.error(
          "Los campos marcados para aplicar deben tener un valor solicitado."
        );
        return;
      }
    }

    const urls = attachmentUrls.map((u) => u.trim()).filter(Boolean);

    const payload: Parameters<typeof respondArcoRequest>[2] = {
      finalStatus,
      message: message.trim(),
      attachmentUrls: urls.length ? urls : undefined,
    };

    if (isRectification && finalStatus === "RESOLVED") {
      payload.approvedFields = approvalRows
        .filter((r) => r.approved && r.requestedValue.trim())
        .map((r) => ({
          field: r.field,
          requestedValue: r.requestedValue.trim(),
        }));
    }

    setLoading(true);
    const res = await respondArcoRequest(companyId, requestId, payload);
    setLoading(false);

    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
      return;
    }

    const approvedCount = payload.approvedFields?.length ?? 0;
    toast.success(
      finalStatus === "RESOLVED"
        ? isRectification && approvedCount > 0
          ? `Solicitud resuelta. Se aplicarán ${approvedCount} cambio(s).`
          : "Solicitud marcada como resuelta"
        : "Solicitud rechazada"
    );
    onSuccess();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#E8EDF7] bg-white p-6 shadow-xl sm:max-w-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary-600">Respuesta final</p>
            <h2 className="text-xl font-semibold text-[#1A2B5B]">
              {isRectification
                ? "Resolver solicitud de rectificación"
                : "Resolver solicitud ARCO"}
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">
              El titular recibirá un correo con esta respuesta.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
            aria-label="Cerrar"
          >
            <Icon icon="tabler:x" className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-600">
              Resolución
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { value: "RESOLVED" as const, label: "Resolver a favor" },
                  { value: "REJECTED" as const, label: "Rechazar" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFinalStatus(opt.value)}
                  className={clsx(
                    "rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                    finalStatus === opt.value
                      ? "border-primary-900 bg-primary-50 text-primary-900"
                      : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {showApprovalFields && (
            <div className="flex flex-col gap-3 rounded-xl border border-[#E4EAF6] bg-[#F8FAFC] p-4">
              <div>
                <p className="text-sm font-semibold text-[#1A2B5B]">
                  Campos a aplicar
                </p>
                <p className="mt-1 text-xs text-[#64748B] leading-relaxed">
                  Marca los cambios que deseas aplicar. Puedes corregir el valor
                  antes de enviar (por ejemplo, un error ortográfico). Los campos
                  sin marcar no se modificarán en el sistema.
                </p>
              </div>
              <ul className="flex flex-col gap-3">
                {approvalRows.map((row, index) => (
                  <li
                    key={`${row.field}-${index}`}
                    className={clsx(
                      "rounded-xl border p-3 transition-colors",
                      row.approved
                        ? "border-primary-200 bg-white"
                        : "border-zinc-200 bg-zinc-50 opacity-80"
                    )}
                  >
                    <label className="mb-2 flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={row.approved}
                        onChange={(e) =>
                          updateApprovalRow(index, {
                            approved: e.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded border-zinc-300 text-primary-900 focus:ring-primary-500"
                      />
                      <span className="text-sm font-semibold text-[#1A2B5B]">
                        {fieldLabel(row.field)}
                      </span>
                    </label>
                    {row.approved && (
                      <div className="pl-6">
                        {row.field === "gender" ? (
                          <select
                            value={row.requestedValue}
                            onChange={(e) =>
                              updateApprovalRow(index, {
                                requestedValue: e.target.value,
                              })
                            }
                            className="w-full rounded-lg border border-primary-900 bg-primary-50 px-3 py-2 text-sm text-primary-900 outline-none focus:ring-2 focus:ring-primary-500/20"
                          >
                            <option value="" disabled>
                              Seleccionar opción
                            </option>
                            {userGendersOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.title}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={row.field === "age" ? "number" : "text"}
                            value={row.requestedValue}
                            onChange={(e) =>
                              updateApprovalRow(index, {
                                requestedValue: e.target.value,
                              })
                            }
                            placeholder="Valor que se aplicará"
                            className="w-full rounded-lg border border-[#E4EAF6] px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-900 focus:ring-2 focus:ring-primary-500/20"
                          />
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              {approvalRows.every((r) => !r.approved) && (
                <p className="text-xs text-amber-700">
                  Ningún campo marcado: la solicitud se resolverá sin modificar
                  datos del titular.
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-600">
              Mensaje al titular
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder={
                isRectification
                  ? "Explica qué cambios se aplicaron y cuáles no proceden..."
                  : "Explica la decisión y los pasos realizados..."
              }
              className="w-full resize-y rounded-xl border border-[#E4EAF6] px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-900 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-stone-600">
              Adjuntos (URLs, opcional)
            </label>
            {attachmentUrls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => updateAttachment(index, e.target.value)}
                  placeholder="https://..."
                  className="h-10 flex-1 rounded-xl border border-[#E4EAF6] px-3 text-sm outline-none focus:border-primary-900"
                />
                {attachmentUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
                  >
                    <Icon icon="tabler:trash" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addAttachment}
              className="text-left text-sm font-medium text-primary-900 hover:underline"
            >
              + Agregar otro adjunto
            </button>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              hierarchy="secondary"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              hierarchy="primary"
              loading={loading}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Enviar respuesta
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArcoRespondDialog;
