"use client";

import React, { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";
import Button from "@/components/base/Button";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import {
  fetchCalcCampaignAudience,
  createConsentCampaign,
  updateCampaign,
} from "@/lib/campaign.api";
import { hideDialog } from "@/utils/dialogs.utils";
import { parseApiError } from "@/utils/parseApiError";
import { CampaignDeliveryChannel } from "@/types/campaign.types";
import { toDateTimeLocalString } from "@/utils/date.utils";

interface Props {
  companyId: string;
  formId: string;
  formName?: string;
}

const DEFAULT_BODY =
  "Estimado cliente, lo invitamos a aceptar la política de tratamiento de datos personales. Llene el formulario en el siguiente enlace:";

export default function ConsentCampaignDialog({ companyId, formId, formName }: Props) {
  const id = HTML_IDS_DATA.consentCampaignDialog;

  const [audienceCount, setAudienceCount] = useState<number | null>(null);
  const [audienceLoading, setAudienceLoading] = useState(true);

  const [campaignName, setCampaignName] = useState(
    `Campaña consentimiento${formName ? ` - ${formName}` : ""}`
  );
  const [channel, setChannel] = useState<CampaignDeliveryChannel>("SMS");
  const [scheduledDateTime, setScheduledDateTime] = useState("");
  const [contentName, setContentName] = useState("Aceptación Política de Datos");
  const [bodyText, setBodyText] = useState(DEFAULT_BODY);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setAudienceLoading(true);
    fetchCalcCampaignAudience({
      companyId,
      sourceForms: formId,
      type: "CONSENT_REQUEST",
    }).then((res) => {
      if (cancelled) return;
      setAudienceLoading(false);
      if (!res.error && res.data) {
        setAudienceCount(res.data.count ?? 0);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [companyId, formId]);

  useEffect(() => {
    setCampaignName(`Campaña consentimiento${formName ? ` - ${formName}` : ""}`);
  }, [formName]);

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).id === id && !submitting) {
      hideDialog(id);
    }
  }

  async function handleCreate(activate: boolean) {
    if (!canSubmit) {
      toast.error(disabledReasons[0] ?? "Revisa los datos del formulario.");
      return;
    }

    setSubmitting(true);

    const createRes = await createConsentCampaign(companyId, {
      type: "CONSENT_REQUEST",
      name: campaignName.trim(),
      deliveryChannel: channel,
      sourceFormIds: [formId],
      scheduling: { scheduledDateTime: new Date(scheduledDateTime).toISOString() },
      content: { name: contentName.trim(), bodyText: bodyText.trim() },
    });

    if (createRes.error) {
      setSubmitting(false);
      return toast.error(parseApiError(createRes.error));
    }

    const campaignId = createRes.data?.id;

    if (!activate) {
      setSubmitting(false);
      toast.success("Campaña de consentimiento creada y programada");
      hideDialog(id);
      return;
    }

    const activateRes = await updateCampaign(companyId, campaignId, { active: true });
    setSubmitting(false);

    if (activateRes.error) {
      toast.error(parseApiError(activateRes.error));
      return;
    }

    toast.success("Campaña de consentimiento creada y activada");
    hideDialog(id);
  }

  const maxChars = channel === "SMS" ? 160 : 1000;

  const { canSubmit, disabledReasons } = useMemo(() => {
    const reasons: string[] = [];

    if (audienceLoading) {
      return { canSubmit: false, disabledReasons: ["Esperando el cálculo de audiencia…"] };
    }
    if (audienceCount === null) {
      reasons.push(
        "No se pudo calcular la audiencia. Cierra el modal e inténtalo de nuevo."
      );
      return { canSubmit: false, disabledReasons: reasons };
    }
    if (audienceCount < 1) {
      reasons.push("No hay personas con consentimiento pendiente.");
    }

    const name = campaignName.trim();
    if (!name) reasons.push("Indica el nombre de la campaña.");
    else if (name.length < 3) reasons.push("El nombre de la campaña debe tener al menos 3 caracteres.");

    if (!contentName.trim()) reasons.push("Indica el nombre del anuncio.");

    if (!bodyText.trim()) reasons.push("Escribe el texto del mensaje.");
    else if (bodyText.length > maxChars) {
      reasons.push(
        `El mensaje supera ${maxChars} caracteres (${channel === "SMS" ? "SMS" : "correo"}). Acorta el texto o cambia el canal.`
      );
    }

    if (!scheduledDateTime.trim()) {
      reasons.push("Selecciona fecha y hora de envío.");
    } else {
      const when = new Date(scheduledDateTime);
      if (Number.isNaN(when.getTime())) {
        reasons.push("La fecha u hora de envío no es válida.");
      } else if (when.getTime() <= Date.now()) {
        reasons.push("La fecha y hora de envío deben ser posteriores al momento actual.");
      }
    }

    return { canSubmit: reasons.length === 0, disabledReasons: reasons };
  }, [
    audienceLoading,
    audienceCount,
    campaignName,
    contentName,
    bodyText,
    maxChars,
    scheduledDateTime,
    channel,
  ]);

  const inputBase =
    "w-full rounded-xl border px-4 py-2.5 text-sm text-[#0F172A] outline-none transition-all disabled:opacity-60 disabled:bg-stone-50";
  const inputOk = "border-[#E2E8F0] focus:border-[#1D2D5B] focus:ring-2 focus:ring-[#1D2D5B]/15";
  const inputErr = "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20";

  const nameInvalid =
    !campaignName.trim() || (campaignName.trim().length > 0 && campaignName.trim().length < 3);
  const contentInvalid = !contentName.trim();
  const bodyInvalid = !bodyText.trim() || bodyText.length > maxChars;
  const scheduleInvalid =
    !scheduledDateTime.trim() ||
    Number.isNaN(new Date(scheduledDateTime).getTime()) ||
    new Date(scheduledDateTime).getTime() <= Date.now();

  return (
    <div
      onClick={handleBackdrop}
      id={id}
      className="dialog-wrapper fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Icon icon="tabler:bell-ringing" className="text-xl text-emerald-600" />
            </div>
            <div>
              <h5 className="font-semibold text-base text-[#0B1737]">
                Campaña de consentimiento
              </h5>
              <p className="text-xs text-stone-500 mt-0.5">
                Envía solicitudes de aceptación masivas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => !submitting && hideDialog(id)}
            disabled={submitting}
            className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <Icon icon="tabler:x" className="text-xl text-stone-600" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 min-h-0 flex flex-col gap-5">
          {/* Audience badge */}
          <div
            className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${
              audienceLoading
                ? "bg-stone-50 border-stone-200"
                : audienceCount === 0
                ? "bg-amber-50 border-amber-200"
                : "bg-emerald-50 border-emerald-200"
            }`}
          >
            <Icon
              icon={audienceLoading ? "tabler:loader-2" : "tabler:users"}
              className={`text-xl shrink-0 ${
                audienceLoading
                  ? "text-stone-400 animate-spin"
                  : audienceCount === 0
                  ? "text-amber-600"
                  : "text-emerald-600"
              }`}
            />
            <div>
              <p
                className={`text-sm font-semibold ${
                  audienceLoading
                    ? "text-stone-600"
                    : audienceCount === 0
                    ? "text-amber-900"
                    : "text-emerald-900"
                }`}
              >
                {audienceLoading ? "Calculando audiencia..." : "Audiencia pendiente"}
              </p>
              {!audienceLoading && (
                <p
                  className={`text-xs mt-0.5 ${
                    audienceCount === 0 ? "text-amber-700" : "text-emerald-700"
                  }`}
                >
                  {audienceCount !== null
                    ? audienceCount === 0
                      ? "Todos los usuarios ya tienen consentimiento activo"
                      : `${audienceCount} persona${audienceCount !== 1 ? "s" : ""} con consentimiento pendiente`
                    : "No se pudo calcular la audiencia"}
                </p>
              )}
            </div>
          </div>

          {/* Campaign name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[#334155]">
              Nombre de la campaña
            </label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              disabled={submitting}
              placeholder="Ej: Campaña consentimiento enero 2025"
              aria-invalid={nameInvalid}
              className={clsx(inputBase, nameInvalid ? inputErr : inputOk)}
            />
          </div>

          {/* Delivery channel */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[#334155]">Canal de envío</label>
            <div className="grid grid-cols-2 gap-3">
              {(["SMS", "EMAIL"] as const).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setChannel(ch)}
                  disabled={submitting}
                  className={`relative flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all disabled:opacity-60 ${
                    channel === ch
                      ? "border-[#1D2D5B] bg-[#F0F4FF]"
                      : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]"
                  }`}
                >
                  {channel === ch && (
                    <span className="absolute top-2 right-2">
                      <Icon icon="tabler:check" className="text-[#1D2D5B] text-sm" />
                    </span>
                  )}
                  <Icon
                    icon={
                      ch === "SMS"
                        ? "mdi:message-text-outline"
                        : "material-symbols:email-outline"
                    }
                    className={`text-xl ${channel === ch ? "text-[#1D2D5B]" : "text-stone-400"}`}
                  />
                  <span
                    className={`font-semibold text-sm ${
                      channel === ch ? "text-[#1D2D5B]" : "text-stone-600"
                    }`}
                  >
                    {ch === "SMS" ? "SMS" : "Email"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Scheduled date/time */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[#334155]">
              Fecha y hora de envío
            </label>
            <input
              type="datetime-local"
              value={scheduledDateTime}
              onChange={(e) => setScheduledDateTime(e.target.value)}
              disabled={submitting}
              min={toDateTimeLocalString(new Date().toISOString())}
              aria-invalid={scheduleInvalid}
              className={clsx(inputBase, scheduleInvalid ? inputErr : inputOk)}
            />
          </div>

          {/* Content name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[#334155]">Nombre del anuncio</label>
            <input
              type="text"
              value={contentName}
              onChange={(e) => setContentName(e.target.value)}
              disabled={submitting}
              placeholder="Ej: Aceptación Política de Datos"
              aria-invalid={contentInvalid}
              className={clsx(inputBase, contentInvalid ? inputErr : inputOk)}
            />
          </div>

          {/* Body text */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[#334155]">Mensaje</label>
            <textarea
              rows={4}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              disabled={submitting}
              maxLength={maxChars}
              placeholder="Texto del mensaje que recibirá cada usuario..."
              aria-invalid={bodyInvalid}
              className={clsx(
                inputBase,
                "resize-y min-h-[96px]",
                bodyInvalid ? inputErr : inputOk
              )}
            />
            <p
              className={clsx(
                "text-xs text-right",
                bodyText.length > maxChars ? "text-red-600 font-medium" : "text-stone-400"
              )}
            >
              {bodyText.length} / {maxChars}
            </p>
          </div>

          {/* Info */}
          <div className="flex gap-3 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
            <Icon
              icon="tabler:info-circle"
              className="text-blue-600 text-lg shrink-0 mt-0.5"
            />
            <p className="text-xs text-blue-900 leading-relaxed">
              El mensaje incluirá automáticamente un enlace único firmado (válido 30 días) para que cada destinatario acepte el consentimiento de tratamiento de datos.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 p-5 border-t border-stone-200 shrink-0">
          {!canSubmit && !submitting && disabledReasons.length > 0 && (
            <div
              className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
              role="status"
            >
              <p className="text-xs font-semibold text-amber-900 mb-1.5">
                Para crear la campaña:
              </p>
              <ul className="list-disc pl-4 space-y-0.5 text-xs text-amber-900/90">
                {disabledReasons.map((msg, idx) => (
                  <li key={`${idx}-${msg}`}>{msg}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex items-center justify-end gap-3 flex-wrap">
            <Button
              type="button"
              hierarchy="tertiary"
              onClick={() => hideDialog(id)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              hierarchy="secondary"
              onClick={() => handleCreate(false)}
              loading={submitting}
              disabled={submitting || !canSubmit}
            >
              Solo crear
            </Button>
            <Button
              type="button"
              hierarchy="primary"
              onClick={() => handleCreate(true)}
              loading={submitting}
              disabled={submitting || !canSubmit}
              startContent={<Icon icon="tabler:send" />}
            >
              Crear y activar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
