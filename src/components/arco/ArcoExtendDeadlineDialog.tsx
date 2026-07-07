"use client";

import Button from "@/components/base/Button";
import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import { extendArcoRequestDeadline } from "@/lib/arcoAdmin.api";
import { formatArcoDate } from "@/utils/arcoAdmin.utils";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { toast } from "sonner";

interface Props {
  open: boolean;
  companyId: string;
  requestId: string;
  /** Fecha límite actual, solo para contexto visual. */
  currentDueDate?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ArcoExtendDeadlineDialog = ({
  open,
  companyId,
  requestId,
  currentDueDate,
  onClose,
  onSuccess,
}: Props) => {
  const [additionalDays, setAdditionalDays] = useState<string>("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setAdditionalDays("");
      setReason("");
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const days = Number(additionalDays);
    if (!Number.isInteger(days) || days <= 0) {
      toast.error("Los días adicionales deben ser un entero positivo");
      return;
    }
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      toast.error("El motivo de la extensión es obligatorio");
      return;
    }

    setSubmitting(true);
    const res = await extendArcoRequestDeadline(companyId, requestId, {
      additionalDays: days,
      reason: trimmedReason,
    });
    setSubmitting(false);

    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
      return;
    }

    toast.success(
      res.data?.dueDate
        ? `Plazo extendido hasta ${formatArcoDate(res.data.dueDate)}`
        : "Plazo extendido"
    );
    onSuccess();
    onClose();
  }

  return ReactDOM.createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={submitting ? undefined : onClose}
      />
      <div className="animate-appear relative z-10 w-[min(92vw,30rem)] rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF3FF] text-[#3357A5]">
            <Icon icon="tabler:calendar-plus" className="text-2xl" />
          </span>
          <div>
            <h3 className="text-lg font-bold text-[#1A2B5B]">
              Extender plazo de la solicitud
            </h3>
            <p className="mt-1 text-sm text-[#64748B]">
              La nueva fecha límite se calcula según el motor de plazos
              (días hábiles/corridos y feriados del país).
              {currentDueDate && (
                <>
                  {" "}
                  Fecha límite actual:{" "}
                  <strong className="text-[#1A2B5B]">
                    {formatArcoDate(currentDueDate)}
                  </strong>
                  .
                </>
              )}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-600">
              Días adicionales <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              value={additionalDays}
              onChange={(e) => setAdditionalDays(e.target.value)}
              placeholder="Ej. 10"
              className="h-11 w-full rounded-xl border border-[#E4EAF6] px-3 text-sm text-primary-900 outline-none focus:border-primary-900 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-600">
              Motivo de la extensión <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej. Se solicitó información adicional al titular para completar la respuesta."
              className="w-full resize-y rounded-xl border border-[#E4EAF6] px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-900 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              hierarchy="secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={submitting}>
              Extender plazo
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ArcoExtendDeadlineDialog;
