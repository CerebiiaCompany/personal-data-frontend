"use client";

import Button from "@/components/base/Button";
import { respondArcoRequest } from "@/lib/arcoAdmin.api";
import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  companyId: string;
  requestId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ArcoRespondDialog = ({
  open,
  companyId,
  requestId,
  onClose,
  onSuccess,
}: Props) => {
  const [finalStatus, setFinalStatus] = useState<"RESOLVED" | "REJECTED">(
    "RESOLVED"
  );
  const [message, setMessage] = useState("");
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

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

    const urls = attachmentUrls.map((u) => u.trim()).filter(Boolean);

    setLoading(true);
    const res = await respondArcoRequest(companyId, requestId, {
      finalStatus,
      message: message.trim(),
      attachmentUrls: urls.length ? urls : undefined,
    });
    setLoading(false);

    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
      return;
    }

    toast.success(
      finalStatus === "RESOLVED"
        ? "Solicitud marcada como resuelta"
        : "Solicitud rechazada"
    );
    setMessage("");
    setAttachmentUrls([""]);
    onSuccess();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#E8EDF7] bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary-600">Respuesta final</p>
            <h2 className="text-xl font-semibold text-[#1A2B5B]">
              Resolver solicitud ARCO
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

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-600">
              Mensaje al titular
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Explica la decisión y los pasos realizados..."
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
