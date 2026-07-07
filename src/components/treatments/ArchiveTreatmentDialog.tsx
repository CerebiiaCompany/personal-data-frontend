"use client";

import Button from "@/components/base/Button";
import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import { archiveTreatment } from "@/lib/treatment.api";
import { Treatment } from "@/types/treatment.types";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { toast } from "sonner";

interface Props {
  open: boolean;
  companyId: string;
  treatment: Treatment;
  onClose: () => void;
  onArchived: (treatment: Treatment) => void;
}

const ArchiveTreatmentDialog = ({
  open,
  companyId,
  treatment,
  onClose,
  onArchived,
}: Props) => {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setReason("");
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  async function handleConfirm() {
    const trimmed = reason.trim();
    if (!trimmed) {
      toast.error("El motivo de archivado es obligatorio");
      return;
    }

    setSubmitting(true);
    const res = await archiveTreatment(companyId, treatment.id, {
      archivedReason: trimmed,
    });
    setSubmitting(false);

    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
      return;
    }

    toast.success("Tratamiento archivado");
    if (res.data) onArchived(res.data);
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
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <Icon icon="tabler:archive" className="text-2xl" />
          </span>
          <div>
            <h3 className="text-lg font-bold text-[#1A2B5B]">
              Archivar tratamiento
            </h3>
            <p className="mt-1 text-sm text-[#64748B]">
              Esta acción es <strong>irreversible</strong>: un tratamiento
              archivado no puede reactivarse. Deja registrado el motivo.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <label className="mb-1 block text-sm font-medium text-stone-600">
            Motivo del archivado <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej. La actividad de tratamiento dejó de realizarse en enero de 2026."
            className="w-full resize-y rounded-xl border border-[#E4EAF6] px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-900 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            hierarchy="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            loading={submitting}
            className="border-rose-500! bg-rose-500!"
          >
            Archivar
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ArchiveTreatmentDialog;
