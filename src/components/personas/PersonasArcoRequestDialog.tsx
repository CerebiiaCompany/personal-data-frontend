"use client";

import Button from "@/components/base/Button";
import CustomInput from "@/components/forms/CustomInput";
import CustomSelect from "@/components/forms/CustomSelect";
import { personasTheme } from "@/constants/personasTheme";
import { arcoCreateRequest } from "@/lib/arco.api";
import PersonasOppositionScopesPicker from "@/components/personas/PersonasOppositionScopesPicker";
import {
  ARCO_RECTIFICATION_FIELDS,
  ARCO_REQUEST_TYPE_LABELS,
  ArcoOppositionScope,
  ArcoRectificationField,
  ArcoRequestListItem,
  ArcoRequestType,
} from "@/types/arco.types";
import { validateOppositionScopes } from "@/utils/arcoOppositionScopes.utils";
import {
  UserGender,
  userGendersOptions,
} from "@/types/collectFormResponse.types";
import { CustomSelectOption } from "@/types/forms.types";
import { showApiErrorToast, showPersonasMessageToast } from "@/components/feedback/ApiErrorToast";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDialogBackdropClose } from "@/hooks/useDialogBackdropClose";
import { toast } from "sonner";

interface Props {
  open: boolean;
  companyId: string;
  companyName: string;
  requestType: ArcoRequestType;
  /** Historial completo del titular (todas las empresas) — se usa solo para
   * BLOCKING, para ofrecer qué solicitud R/S/O bloquear. */
  myRequests: ArcoRequestListItem[];
  onClose: () => void;
  onSuccess: () => void;
}

const fieldOptions: CustomSelectOption<string>[] = ARCO_RECTIFICATION_FIELDS.map(
  (f) => ({ value: f.value, title: f.label })
);

// Art. 8 ter: el bloqueo solo aplica sobre una solicitud de Rectificación,
// Supresión (Cancelación) u Oposición — no ACCESS ni PORTABILITY.
const BLOCKABLE_TYPES: ArcoRequestType[] = ["RECTIFICATION", "CANCELLATION", "OPPOSITION"];
const OPEN_STATUSES = ["PENDING", "IN_PROGRESS"];

const PersonasArcoRequestDialog = ({
  open,
  companyId,
  companyName,
  requestType,
  myRequests,
  onClose,
  onSuccess,
}: Props) => {
  const [description, setDescription] = useState("");
  const [oppositionReason, setOppositionReason] = useState("");
  const [oppositionScopes, setOppositionScopes] = useState<ArcoOppositionScope[]>(
    []
  );
  const [rectificationFields, setRectificationFields] = useState<
    Pick<ArcoRectificationField, "field" | "requestedValue">[]
  >([{ field: "name", requestedValue: "" }]);
  const [relatedRequestId, setRelatedRequestId] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const backdropClose = useDialogBackdropClose(onClose, { disabled: loading });

  // Solicitudes de ESTA empresa, de tipo bloqueable, todavía abiertas — Art.
  // 8 ter exige que el bloqueo se refiera a una de estas. Si hay más de una,
  // el titular DEBE elegir explícitamente (condición no-negociable: adivinar
  // mal aquí bloquearía la solicitud equivocada).
  const blockableRequests = myRequests.filter(
    (r) =>
      r.company.companyId === companyId &&
      BLOCKABLE_TYPES.includes(r.requestType) &&
      OPEN_STATUSES.includes(r.status)
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setDescription("");
    setOppositionReason("");
    setOppositionScopes([]);
    setRectificationFields([{ field: "name", requestedValue: "" }]);
    // Auto-selección SOLO si hay exactamente una solicitud bloqueable — con
    // más de una, se deja vacío a propósito para forzar elección explícita
    // (se muestra igual el nombre/fecha para transparencia, no en silencio).
    setRelatedRequestId(
      requestType === "BLOCKING" && blockableRequests.length === 1
        ? blockableRequests[0].requestId
        : ""
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, requestType]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || !mounted) return null;

  function updateRectField(
    index: number,
    key: "field" | "requestedValue",
    value: string
  ) {
    setRectificationFields((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        // Al cambiar el tipo de campo, limpiar el valor solicitado (p. ej. texto → género).
        if (key === "field" && value !== row.field) {
          return { field: value, requestedValue: "" };
        }
        return { ...row, [key]: value };
      })
    );
  }

  function addRectField() {
    setRectificationFields((prev) => [
      ...prev,
      { field: "email", requestedValue: "" },
    ]);
  }

  function removeRectField(index: number) {
    setRectificationFields((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      showPersonasMessageToast("Describe tu solicitud para continuar.");
      return;
    }

    if (requestType === "OPPOSITION") {
      if (!oppositionReason.trim()) {
        showPersonasMessageToast("Indica el motivo de oposición.");
        return;
      }
      const scopesError = validateOppositionScopes(oppositionScopes);
      if (scopesError) {
        showPersonasMessageToast(scopesError);
        return;
      }
    }

    if (requestType === "RECTIFICATION") {
      const valid = rectificationFields.some((f) => f.requestedValue.trim());
      if (!valid) {
        showPersonasMessageToast(
          "Indica el valor solicitado en al menos un campo a rectificar."
        );
        return;
      }
    }

    if (requestType === "BLOCKING") {
      if (blockableRequests.length === 0) {
        showPersonasMessageToast(
          "No tienes solicitudes de Rectificación, Supresión u Oposición abiertas para bloquear en esta empresa."
        );
        return;
      }
      // No-negociable: con más de una solicitud bloqueable, el titular debe
      // haber elegido explícitamente cuál — nunca se envía sin selección.
      if (!relatedRequestId) {
        showPersonasMessageToast("Elige cuál de tus solicitudes quieres bloquear.");
        return;
      }
    }

    setLoading(true);

    const payload = {
      companyId,
      requestType,
      description: description.trim(),
      ...(requestType === "OPPOSITION"
        ? {
            oppositionReason: oppositionReason.trim(),
            oppositionScopes,
          }
        : {}),
      ...(requestType === "RECTIFICATION"
        ? {
            rectificationFields: rectificationFields
              .filter((f) => f.requestedValue.trim())
              .map((f) => ({
                field: f.field,
                requestedValue: f.requestedValue.trim(),
              })),
          }
        : {}),
      ...(requestType === "BLOCKING"
        ? {
            relatedRequestId,
            // Reusa el mismo texto que "Descripción de la solicitud" (ya
            // requerido arriba) como el fundamento que exige Art. 8 ter —
            // evita duplicar un segundo textarea para lo mismo.
            blockingReason: description.trim(),
          }
        : {}),
    };

    const res = await arcoCreateRequest(payload);

    setLoading(false);

    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
      return;
    }

    toast.success(
      `Solicitud de ${ARCO_REQUEST_TYPE_LABELS[requestType]} enviada. Folio: ${res.data?.requestId?.slice(-8) ?? ""}`
    );
    setDescription("");
    setOppositionReason("");
    setOppositionScopes([]);
    setRectificationFields([{ field: "name", requestedValue: "" }]);
    setRelatedRequestId("");
    onSuccess();
    onClose();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="arco-request-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Cerrar"
        {...backdropClose}
        tabIndex={-1}
      />
      <div
        className={clsx(
          personasTheme.card,
          "animate-appear relative z-10 flex max-h-[min(90vh,100%)] w-full max-w-lg flex-col overflow-hidden shadow-xl"
        )}
      >
        <div className="shrink-0 border-b border-zinc-200/70 px-6 py-5 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={personasTheme.sectionTitle}>Nueva solicitud</p>
              <h2
                id="arco-request-title"
                className={clsx("text-xl font-semibold", personasTheme.heading)}
              >
                {ARCO_REQUEST_TYPE_LABELS[requestType]}
              </h2>
              <p className={clsx("mt-1 text-sm", personasTheme.body)}>
                {companyName}
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
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="sidebar-scroll flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-5 sm:px-8">
          {requestType === "BLOCKING" && (
            <div className="flex flex-col gap-2">
              <label className="pl-2 text-sm font-medium text-stone-500">
                ¿Qué solicitud quieres bloquear?
              </label>
              {blockableRequests.length === 0 ? (
                <div
                  className={clsx(
                    personasTheme.infoBox,
                    "flex gap-2 text-xs leading-relaxed"
                  )}
                >
                  <Icon
                    icon="tabler:alert-circle"
                    className="shrink-0 text-lg text-amber-600"
                  />
                  <p className={personasTheme.body}>
                    No tienes solicitudes de Rectificación, Supresión u
                    Oposición abiertas en esta empresa. El bloqueo preventivo
                    (Art. 8 ter) solo puede pedirse sobre una de esas
                    solicitudes ya en trámite — envía primero esa solicitud.
                  </p>
                </div>
              ) : blockableRequests.length === 1 ? (
                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3 text-sm">
                  <p className="font-medium text-primary-900">
                    {ARCO_REQUEST_TYPE_LABELS[blockableRequests[0].requestType]}
                  </p>
                  <p className={clsx("mt-0.5 text-xs", personasTheme.muted)}>
                    {blockableRequests[0].description}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {blockableRequests.map((r) => (
                    <label
                      key={r.requestId}
                      className={clsx(
                        "flex cursor-pointer items-start gap-2 rounded-xl border p-3 text-sm",
                        relatedRequestId === r.requestId
                          ? "border-primary-900 bg-primary-50/60"
                          : "border-zinc-200/80 bg-zinc-50/50"
                      )}
                    >
                      <input
                        type="radio"
                        name="relatedRequestId"
                        className="mt-1"
                        checked={relatedRequestId === r.requestId}
                        onChange={() => setRelatedRequestId(r.requestId)}
                      />
                      <span>
                        <span className="block font-medium text-primary-900">
                          {ARCO_REQUEST_TYPE_LABELS[r.requestType]}
                        </span>
                        <span className={clsx("block text-xs", personasTheme.muted)}>
                          {r.description}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="pl-2 text-sm font-medium text-stone-500">
              {requestType === "BLOCKING"
                ? "Fundamento del bloqueo"
                : "Descripción de la solicitud"}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder={
                requestType === "BLOCKING"
                  ? "Explica por qué pides que se bloquee el tratamiento de tus datos mientras se resuelve la solicitud elegida arriba..."
                  : "Explica con detalle qué necesitas..."
              }
              className="w-full resize-y rounded-lg border border-disabled px-3 py-2 text-primary-900 outline-none focus:border-primary-900"
            />
          </div>

          {requestType === "OPPOSITION" && (
            <>
              <PersonasOppositionScopesPicker
                value={oppositionScopes}
                onChange={setOppositionScopes}
              />
              <div className="flex flex-col gap-1">
                <label className="pl-2 text-sm font-medium text-stone-500">
                  Motivo de oposición <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={oppositionReason}
                  onChange={(e) => setOppositionReason(e.target.value)}
                  rows={3}
                  placeholder="Ej. No deseo recibir publicidad ni que compartan mis datos."
                  className="w-full resize-y rounded-lg border border-disabled px-3 py-2 text-primary-900 outline-none focus:border-primary-900"
                />
              </div>
            </>
          )}

          {requestType === "RECTIFICATION" && (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-primary-900">
                Campos a rectificar
              </p>
              {rectificationFields.map((row, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <CustomSelect
                      options={fieldOptions}
                      value={row.field}
                      onChange={(v) => updateRectField(index, "field", v)}
                      className="flex-1"
                    />
                    {rectificationFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRectField(index)}
                        className="text-zinc-500 hover:text-red-600"
                      >
                        <Icon icon="tabler:trash" />
                      </button>
                    )}
                  </div>
                  {row.field === "gender" ? (
                    <div className="flex flex-col items-start gap-1 text-left w-full">
                      <label className="font-medium w-full text-ellipsis pl-2 text-stone-500 text-sm">
                        Valor solicitado
                      </label>
                      <select
                        value={row.requestedValue}
                        onChange={(e) =>
                          updateRectField(
                            index,
                            "requestedValue",
                            e.target.value as UserGender
                          )
                        }
                        className="rounded-lg gap-2 w-full text-primary-900 border border-primary-900 flex-1 relative px-3 py-2 bg-primary-50"
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
                    </div>
                  ) : (
                    <CustomInput
                      label="Valor solicitado"
                      value={row.requestedValue}
                      onChange={(e) =>
                        updateRectField(index, "requestedValue", e.target.value)
                      }
                      placeholder="Escribe el dato correcto que deseas registrar"
                    />
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addRectField}
                className={clsx("text-sm", personasTheme.link)}
              >
                + Agregar otro campo
              </button>
              <p className={clsx("text-xs", personasTheme.muted)}>
                Si se aprueba, el cambio puede aplicarse en todas las empresas
                donde estés registrado.
              </p>
            </div>
          )}

          {requestType === "PORTABILITY" && (
            <div
              className={clsx(
                personasTheme.infoBox,
                "flex gap-2 text-xs leading-relaxed"
              )}
            >
              <Icon
                icon="tabler:package-export"
                className="shrink-0 text-lg text-primary-600"
              />
              <p className={personasTheme.body}>
                Al resolver tu solicitud, la empresa generará una{" "}
                <strong className="text-primary-900">
                  copia de tus datos personales
                </strong>{" "}
                que podrás descargar en formato CSV o JSON desde el historial,
                para llevarla a otro proveedor.
              </p>
            </div>
          )}

          {requestType === "CANCELLATION" && (
            <div
              className={clsx(
                personasTheme.infoBox,
                "flex gap-2 text-xs leading-relaxed"
              )}
            >
              <Icon
                icon="tabler:info-circle"
                className="shrink-0 text-lg text-primary-600"
              />
              <p className={personasTheme.body}>
                Al enviar esta solicitud, tu registro quedará como{" "}
                <strong className="text-primary-900">
                  solicitud de supresión en trámite
                </strong>{" "}
                y no recibirás campañas mientras la empresa revisa tu caso. Si se
                aprueba, tus datos se eliminan en esta empresa; si se rechaza,
                tu consentimiento vuelve a activo.
              </p>
            </div>
          )}

          </div>

          <div className="shrink-0 border-t border-zinc-200/70 px-6 py-4 sm:px-8">
            <div className="flex flex-col gap-2 sm:flex-row-reverse">
              <Button
                type="submit"
                hierarchy="primary"
                loading={loading}
                disabled={
                  loading || (requestType === "BLOCKING" && blockableRequests.length === 0)
                }
                className="w-full rounded-xl! sm:flex-1"
              >
                Enviar solicitud
              </Button>
              <Button
                type="button"
                hierarchy="secondary"
                onClick={onClose}
                className="w-full rounded-xl! text-primary-900! sm:flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default PersonasArcoRequestDialog;
