"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";

import Button from "@/components/base/Button";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { sendConsentInvitation } from "@/lib/collectFormResponse.api";
import { hideDialog } from "@/utils/dialogs.utils";
import { parseApiError } from "@/utils/parseApiError";
import { CollectFormResponse } from "@/types/collectFormResponse.types";
import { useCompanyCreditsPricing } from "@/hooks/useCompanyCreditsPricing";
import LoadingCover from "@/components/layout/LoadingCover";

interface Props {
  response: CollectFormResponse | null;
  companyId: string;
  collectFormId: string;
  onSent?: () => void;
}

const SendConsentInvitationDialog = ({
  response,
  companyId,
  collectFormId,
  onSent,
}: Props) => {
  const id = HTML_IDS_DATA.sendConsentInvitationDialog;
  const [loading, setLoading] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<"SMS" | "EMAIL">("SMS");
  const otpPricing = useCompanyCreditsPricing();

  const formatPricing = (value?: number) => {
    if (typeof value !== "number" || Number.isNaN(value)) return "—";
    return new Intl.NumberFormat("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  function handleClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if ((e.target as HTMLElement).id === id && !loading) {
      hideDialog(id);
    }
  }

  async function handleSend() {
    if (!response) return;

    setLoading(true);

    // Generar el link de consentimiento (página específica para aceptar consentimiento)
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/consentimiento/${collectFormId}`;

    const data: any = {
      channel: selectedChannel,
      docType: response.user.docType,
      docNumber: response.user.docNumber,
      link,
    };

    if (selectedChannel === "SMS") {
      if (!response.user.phone) {
        setLoading(false);
        return toast.error("El usuario no tiene teléfono registrado");
      }
      data.phone = response.user.phone;
    } else {
      if (!response.user.email) {
        setLoading(false);
        return toast.error("El usuario no tiene correo electrónico registrado");
      }
      data.email = response.user.email;
    }

    const res = await sendConsentInvitation(companyId, collectFormId, data);
    setLoading(false);

    if (res.error) {
      return toast.error(parseApiError(res.error));
    }

    toast.success(
      `Invitación de consentimiento enviada por ${selectedChannel === "SMS" ? "SMS" : "correo electrónico"}`
    );
    hideDialog(id);
    onSent?.();
  }

  if (!response) return null;

  return (
    <div
      onClick={handleClick}
      id={id}
      className="dialog-wrapper fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-disabled flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon
                icon="tabler:send"
                className="text-xl text-blue-600"
              />
            </div>
            <h5 className="font-semibold text-base sm:text-lg text-primary-900">
              Enviar solicitud de consentimiento
            </h5>
          </div>
          <button
            type="button"
            onClick={() => !loading && hideDialog(id)}
            className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <Icon icon="tabler:x" className="text-xl text-stone-600" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0">
          <div className="flex flex-col gap-4">
            {/* Información del usuario */}
            <div className="bg-primary-50 border border-disabled rounded-lg p-4">
              <h6 className="font-semibold text-sm text-primary-900 mb-3">
                Información del destinatario
              </h6>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div>
                  <span className="font-medium text-stone-600">Nombre:</span>{" "}
                  <span className="text-primary-900">
                    {response.user.name} {response.user.lastName}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-stone-600">Documento:</span>{" "}
                  <span className="text-primary-900">
                    {response.user.docType} {response.user.docNumber}
                  </span>
                </div>
                {response.user.phone && (
                  <div>
                    <span className="font-medium text-stone-600">Teléfono:</span>{" "}
                    <span className="text-primary-900">{response.user.phone}</span>
                  </div>
                )}
                {response.user.email && (
                  <div>
                    <span className="font-medium text-stone-600">Email:</span>{" "}
                    <span className="text-primary-900 break-words">
                      {response.user.email}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Selección de canal */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block font-medium text-sm text-stone-700">
                  Selecciona el canal de envío
                </label>
                {otpPricing.loading && (
                  <div className="relative w-16 h-4">
                    <LoadingCover size="sm" />
                  </div>
                )}
                {!otpPricing.loading && otpPricing.data && (
                  <div className="text-[10px] text-stone-600">
                    <span
                      className={
                        selectedChannel === "SMS"
                          ? "font-semibold text-primary-900"
                          : ""
                      }
                    >
                      SMS: COP {formatPricing(otpPricing.data.smsPricePerMessage)}
                    </span>
                    <span className="mx-1.5 text-stone-400">·</span>
                    <span
                      className={
                        selectedChannel === "EMAIL"
                          ? "font-semibold text-primary-900"
                          : ""
                      }
                    >
                      Email: COP {formatPricing(otpPricing.data.emailPricePerMessage)}
                    </span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedChannel("SMS")}
                  disabled={loading || !response.user.phone}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    selectedChannel === "SMS"
                      ? "border-blue-500 bg-blue-50"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  } ${
                    !response.user.phone
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  {selectedChannel === "SMS" && (
                    <div className="absolute top-2 right-2">
                      <Icon
                        icon="tabler:check"
                        className="text-blue-600 text-lg"
                      />
                    </div>
                  )}
                  <Icon
                    icon="mdi:message-text-outline"
                    className={`text-3xl ${
                      selectedChannel === "SMS"
                        ? "text-blue-600"
                        : "text-stone-600"
                    }`}
                  />
                  <span
                    className={`font-semibold text-sm ${
                      selectedChannel === "SMS"
                        ? "text-blue-900"
                        : "text-stone-700"
                    }`}
                  >
                    SMS
                  </span>
                  {!response.user.phone && (
                    <span className="text-[10px] text-red-500 font-medium">
                      No disponible
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedChannel("EMAIL")}
                  disabled={loading || !response.user.email}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    selectedChannel === "EMAIL"
                      ? "border-blue-500 bg-blue-50"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  } ${
                    !response.user.email
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  {selectedChannel === "EMAIL" && (
                    <div className="absolute top-2 right-2">
                      <Icon
                        icon="tabler:check"
                        className="text-blue-600 text-lg"
                      />
                    </div>
                  )}
                  <Icon
                    icon="material-symbols:email-outline"
                    className={`text-3xl ${
                      selectedChannel === "EMAIL"
                        ? "text-blue-600"
                        : "text-stone-600"
                    }`}
                  />
                  <span
                    className={`font-semibold text-sm ${
                      selectedChannel === "EMAIL"
                        ? "text-blue-900"
                        : "text-stone-700"
                    }`}
                  >
                    Email
                  </span>
                  {!response.user.email && (
                    <span className="text-[10px] text-red-500 font-medium">
                      No disponible
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
              <Icon
                icon="tabler:info-circle"
                className="text-blue-600 text-lg flex-shrink-0 mt-0.5"
              />
              <div className="text-xs text-blue-900">
                <p className="font-semibold mb-1">Mensaje automático</p>
                <p>
                  Se enviará un mensaje predeterminado con un enlace para que el
                  usuario pueda aceptar el consentimiento de tratamiento de datos.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-disabled flex-shrink-0">
          <Button
            type="button"
            hierarchy="tertiary"
            onClick={() => hideDialog(id)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            hierarchy="primary"
            onClick={handleSend}
            loading={loading}
            disabled={
              loading ||
              (selectedChannel === "SMS" && !response.user.phone) ||
              (selectedChannel === "EMAIL" && !response.user.email)
            }
            startContent={<Icon icon="tabler:send" />}
          >
            Enviar invitación
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SendConsentInvitationDialog;
