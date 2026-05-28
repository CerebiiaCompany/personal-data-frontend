"use client";

import Button from "@/components/base/Button";
import CustomInput from "@/components/forms/CustomInput";
import CustomSelect from "@/components/forms/CustomSelect";
import { personasTheme } from "@/constants/personasTheme";
import { arcoCreateRequest } from "@/lib/arco.api";
import {
  ARCO_RECTIFICATION_FIELDS,
  ARCO_REQUEST_TYPE_LABELS,
  ArcoRectificationField,
  ArcoRequestType,
} from "@/types/arco.types";
import { CustomSelectOption } from "@/types/forms.types";
import { showApiErrorToast, showPersonasMessageToast } from "@/components/feedback/ApiErrorToast";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  companyId: string;
  companyName: string;
  requestType: ArcoRequestType;
  onClose: () => void;
  onSuccess: () => void;
}

const fieldOptions: CustomSelectOption<string>[] = ARCO_RECTIFICATION_FIELDS.map(
  (f) => ({ value: f.value, title: f.label })
);

const PersonasArcoRequestDialog = ({
  open,
  companyId,
  companyName,
  requestType,
  onClose,
  onSuccess,
}: Props) => {
  const [description, setDescription] = useState("");
  const [oppositionReason, setOppositionReason] = useState("");
  const [rectificationFields, setRectificationFields] = useState<
    ArcoRectificationField[]
  >([{ field: "name", currentValue: "", requestedValue: "" }]);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  function updateRectField(
    index: number,
    key: keyof ArcoRectificationField,
    value: string
  ) {
    setRectificationFields((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [key]: value } : row))
    );
  }

  function addRectField() {
    setRectificationFields((prev) => [
      ...prev,
      { field: "email", currentValue: "", requestedValue: "" },
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

    if (requestType === "OPPOSITION" && !oppositionReason.trim()) {
      showPersonasMessageToast("Indica el motivo de oposición.");
      return;
    }

    if (requestType === "RECTIFICATION") {
      const valid = rectificationFields.some(
        (f) => f.currentValue.trim() && f.requestedValue.trim()
      );
      if (!valid) {
        showPersonasMessageToast("Completa al menos un campo a rectificar.");
        return;
      }
    }

    setLoading(true);

    const payload = {
      companyId,
      requestType,
      description: description.trim(),
      ...(requestType === "OPPOSITION"
        ? { oppositionReason: oppositionReason.trim() }
        : {}),
      ...(requestType === "RECTIFICATION"
        ? {
            rectificationFields: rectificationFields.filter(
              (f) => f.currentValue.trim() && f.requestedValue.trim()
            ),
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
    setRectificationFields([
      { field: "name", currentValue: "", requestedValue: "" },
    ]);
    onSuccess();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="arco-request-title"
    >
      <div
        className={clsx(
          personasTheme.card,
          "max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 sm:p-8"
        )}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className={personasTheme.sectionTitle}>Nueva solicitud</p>
            <h2
              id="arco-request-title"
              className={clsx("text-xl font-semibold", personasTheme.heading)}
            >
              {ARCO_REQUEST_TYPE_LABELS[requestType]}
            </h2>
            <p className={clsx("mt-1 text-sm", personasTheme.body)}>{companyName}</p>
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
          <div className="flex flex-col gap-1">
            <label className="pl-2 text-sm font-medium text-stone-500">
              Descripción de la solicitud
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Explica con detalle qué necesitas..."
              className="w-full resize-y rounded-lg border border-disabled px-3 py-2 text-primary-900 outline-none focus:border-primary-900"
            />
          </div>

          {requestType === "OPPOSITION" && (
            <div className="flex flex-col gap-1">
              <label className="pl-2 text-sm font-medium text-stone-500">
                Motivo de oposición
              </label>
              <textarea
                value={oppositionReason}
                onChange={(e) => setOppositionReason(e.target.value)}
                rows={3}
                placeholder="Ej. No autorizo el uso de mis datos para marketing"
                className="w-full resize-y rounded-lg border border-disabled px-3 py-2 text-primary-900 outline-none focus:border-primary-900"
              />
            </div>
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
                  <div className="grid gap-2 sm:grid-cols-2">
                    <CustomInput
                      label="Valor actual"
                      value={row.currentValue}
                      onChange={(e) =>
                        updateRectField(index, "currentValue", e.target.value)
                      }
                    />
                    <CustomInput
                      label="Valor solicitado"
                      value={row.requestedValue}
                      onChange={(e) =>
                        updateRectField(index, "requestedValue", e.target.value)
                      }
                    />
                  </div>
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

          {requestType === "CANCELLATION" && (
            <p className={clsx("text-xs", personasTheme.muted)}>
              La cancelación aprobada elimina tus datos solo en esta empresa y
              revoca el consentimiento asociado.
            </p>
          )}

          <div className="flex flex-col gap-2 pt-2 sm:flex-row-reverse">
            <Button
              type="submit"
              hierarchy="primary"
              loading={loading}
              disabled={loading}
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
        </form>
      </div>
    </div>
  );
};

export default PersonasArcoRequestDialog;
