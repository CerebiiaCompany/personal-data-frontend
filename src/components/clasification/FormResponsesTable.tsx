import React from "react";
import { useParams } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import { toast } from "sonner";
import LoadingCover from "../layout/LoadingCover";
import Button from "../base/Button";
import SendConsentInvitationDialog from "../dialogs/SendConsentInvitationDialog";
import { showDialog } from "@/utils/dialogs.utils";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { parseApiError } from "@/utils/parseApiError";
import { deleteCollectFormResponse } from "@/lib/collectFormResponse.api";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { usePermissionCheck } from "@/hooks/usePermissionCheck";
import { useConfirm } from "@/components/dialogs/ConfirmProvider";
import { APIResponse } from "@/types/api.types";
import ResponsePermissionsCell from "@/components/clasification/ResponsePermissionsCell";
import {
  CollectFormResponse,
  getConsentStatusChipClass,
  getConsentStatusLabel,
  isJuridicaDocType,
  OneTimeCodePopulated,
  parseCollectFormDocTypeToString,
  parseUserGenderToString,
} from "@/types/collectFormResponse.types";
import { hasAnyPermissionBlock } from "@/utils/collectFormPermissions.utils";

interface Props {
  items: CollectFormResponse[] | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  meta: APIResponse["meta"] | null;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  embedded?: boolean;
}

function formatDateTime(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-ES", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function splitDateTime(value?: string) {
  if (!value) return { date: "—", time: "—" };
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { date: "—", time: "—" };
  return {
    date: d.toLocaleDateString("es-CO"),
    time: d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
  };
}

function prettyOtpStatus(status?: string) {
  const s = (status || "").toUpperCase();
  if (s === "VERIFIED") return "Verificado";
  if (s === "PENDING") return "Pendiente";
  if (s === "EXPIRED") return "Expirado";
  if (s === "FAILED") return "Fallido";
  return s || "—";
}

function otpStatusChipClass(status?: string) {
  const s = (status || "").toUpperCase();
  if (s === "VERIFIED") return "bg-[#E8F8EE] text-[#1E8A52]";
  if (s === "PENDING") return "bg-[#EDF2FA] text-[#4D5D81]";
  if (s === "EXPIRED" || s === "FAILED") return "bg-[#FDF4E6] text-[#A97711]";
  return "bg-[#F1F5F9] text-[#64748B]";
}

function personKindChipClass(docType?: string) {
  return isJuridicaDocType(docType)
    ? "bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE]"
    : "bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]";
}

function prettyObtainedVia(value?: string) {
  const v = (value || "").toUpperCase();
  if (v === "WEB_FORM" || v === "FORM" || v === "FORMULARIO_WEB") return "Formulario Web";
  if (v === "CHATBOT") return "ChatBot";
  if (v === "MANUAL") return "Manual";
  if (v === "KIOSK") return "Kiosko";
  return value || "—";
}

function extractIp(consent?: CollectFormResponse["consent"]): string {
  if (!consent) return "—";
  if (consent.ipAddress) return consent.ipAddress;

  const audit = consent.audit || [];
  for (const entry of audit) {
    const meta = (entry?.meta || {}) as Record<string, any>;
    const maybeIp =
      meta.ipAddress ||
      meta.ip ||
      meta.clientIp ||
      meta.clientIP ||
      meta.remoteIp ||
      meta.remoteAddress ||
      meta.forwardedFor ||
      meta["x-forwarded-for"];

    if (typeof maybeIp === "string" && maybeIp.trim().length > 0) {
      return maybeIp;
    }
  }

  return "—";
}

function extractUserAgent(consent?: CollectFormResponse["consent"]): string {
  if (!consent) return "—";
  if (consent.userAgent) return consent.userAgent;

  const audit = consent.audit || [];
  for (const entry of audit) {
    const meta = (entry?.meta || {}) as Record<string, any>;
    const maybeUa = meta.userAgent || meta.ua || meta.browserUserAgent;
    if (typeof maybeUa === "string" && maybeUa.trim().length > 0) {
      return maybeUa;
    }
  }

  return "—";
}

function channelChip(channel: string) {
  const ch = (channel || "—").toUpperCase();
  const isSms = ch === "SMS";
  const isEmail = ch === "EMAIL";
  const isWhatsapp = ch === "WHATSAPP";
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2 py-[2px] rounded-full text-[10px] font-semibold whitespace-nowrap border",
        isSms
          ? "bg-[#EEF2FF] text-[#4F46E5] border-[#E1E7FF]"
          : isEmail
            ? "bg-[#E7F2FF] text-[#2563EB] border-[#D8E8FF]"
            : isWhatsapp
              ? "bg-[#E8F8EE] text-[#0F9D58] border-[#D7F1E1]"
              : "bg-[#ECFDF5] text-[#059669] border-[#DBF5EA]"
      )}
    >
      <Icon
        icon={
          isSms
            ? "mdi:message-text-outline"
            : isEmail
              ? "material-symbols:email-outline"
              : isWhatsapp
                ? "ic:baseline-whatsapp"
                : "tabler:help"
        }
        className="text-sm"
      />
      {ch}
    </span>
  );
}

const FormResponsesTable = ({
  items,
  loading,
  error,
  refresh,
  meta,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  embedded,
}: Props) => {
  const companyId = useActiveCompanyId();
  const { can } = usePermissionCheck();
  const confirm = useConfirm();
  const formId = useParams().formId!.toString();
  const [selectedResponse, setSelectedResponse] = React.useState<CollectFormResponse | null>(null);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const getOtp = (item: CollectFormResponse): OneTimeCodePopulated | null => {
    if (!item.otpCodeId) return null;
    if (typeof item.otpCodeId === "string") return null;
    return item.otpCodeId;
  };

  async function deleteResponse(id: string) {
    if (!companyId) return;

    let reason = "";
    const confirmed = await confirm({
      title: "¿Eliminar este registro?",
      description: (
        <>
          ¿Estás seguro de que deseas eliminar este registro? Esta acción puede ser{" "}
          <strong>irreversible</strong>.
        </>
      ),
      withReasonField: true,
      reasonLabel: "Razón de eliminación (opcional)",
      reasonPlaceholder: "Ej. Registro duplicado",
      onReasonChange: (value) => {
        reason = value;
      },
      confirmText: "Sí, eliminar",
      cancelText: "Cancelar",
      danger: true,
    });

    if (!confirmed) return;

    const res = await deleteCollectFormResponse(companyId, formId, id, reason || undefined);
    if (res.error) {
      toast.error(parseApiError(res.error));
      return;
    }

    toast.success("Registro eliminado");
    refresh();
  }

  function handleSendConsent(item: CollectFormResponse) {
    setSelectedResponse(item);
    showDialog(HTML_IDS_DATA.sendConsentInvitationDialog);
  }

  const totalCount = meta?.totalCount || 0;
  const calculatedTotalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1;
  const totalPages = meta?.totalPages || calculatedTotalPages;
  const hasMoreData = Boolean(items && items.length === pageSize);
  const showPagination = totalCount > pageSize || hasMoreData || currentPage > 1;

  return (
    <div
      className={clsx(
        "relative flex h-full min-h-0 w-full flex-col",
        embedded && "min-h-[320px]"
      )}
    >
      {loading && <LoadingCover />}

      <SendConsentInvitationDialog
        response={selectedResponse}
        companyId={companyId || ""}
        collectFormId={formId}
        onSent={refresh}
      />

      {!loading && items?.length ? (
        <>
          <div
            className={clsx(
              "min-h-0 w-full flex-1 overflow-x-auto overflow-y-auto border-b border-[#E5EAF2]",
              !embedded && "rounded-t-2xl"
            )}
          >
            <table className="w-full min-w-[1960px] border-separate border-spacing-0">
              <thead className="sticky top-0 bg-[#F4F6FA] z-10">
                <tr>
                  {[
                    "Tipo",
                    "Documento",
                    "Razón social",
                    "Nombres",
                    "Apellidos",
                    "Edad",
                    "Género",
                    "Correo",
                    "Teléfono",
                    "Registrado por",
                    "Canal OTP",
                    "Destino OTP",
                    "Estado OTP",
                    "Provider",
                    "OTP sentAt",
                    "OTP verifiedAt",
                    "OTP expiresAt",
                    "Intentos",
                    "Fallos",
                    "Obtenido vía",
                    "Consentimiento",
                    "Camp. marketing",
                    "Camp. consentimiento",
                    "Compartir terceros",
                    "Política",
                    "Fecha",
                    "Usó OTP",
                    "Estado",
                    "Acciones",
                  ].map((title) => (
                    <th
                      key={title}
                      title={
                        title === "Camp. marketing"
                          ? "canReceiveMarketingCampaigns"
                          : title === "Camp. consentimiento"
                            ? "canReceiveConsentCampaigns"
                            : title === "Compartir terceros"
                              ? "canShareWithThirdParties"
                              : undefined
                      }
                      className="text-left font-semibold text-[#7A869D] text-[10px] uppercase tracking-wide py-3 px-3 whitespace-nowrap border-b border-[#E3E8F2]"
                    >
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {items.map((item) => {
                  const otp = getOtp(item);
                  const otpChannel =
                    otp?.recipientData?.channel ?? item.consent?.otp?.channel ?? "—";
                  const otpStatus =
                    otp?.status ?? (item.consent?.otp?.verified ? "VERIFIED" : "—");
                  const obtainedVia = prettyObtainedVia(item.consent?.obtainedVia);
                  const consentStatus = item.consent?.status ?? "PENDIENTE";
                  const isJuridica = isJuridicaDocType(item.user.docType);
                  const createdAt = splitDateTime(item.createdAt);
                  const createdByName = item.createdBy?.name || item.createdBy?.lastName
                    ? `${item.createdBy?.name || ""}${
                        item.createdBy?.lastName ? ` ${item.createdBy.lastName}` : ""
                      }`
                    : item.createdBy?.username || "—";
                  const isProcessingOk = Boolean(item.dataProcessing);
                  const policyVersion = item.consent?.policy?.policyVersionLabel || "—";
                  const policyUrl =
                    otp?.policyUrl || item.consent?.otpMessage?.policyUrl || undefined;
                  const otpDestination =
                    otp?.recipientData?.address || item.consent?.otp?.address || "—";
                  const otpProvider = otp?.delivery?.provider || item.consent?.otp?.sendStatus || "—";
                  const otpSentAt = otp?.delivery?.sentAt;
                  const otpVerifiedAt = otp?.verifiedAt || item.consent?.otp?.verifiedAt;
                  const otpExpiresAt = otp?.expiresAt;
                  const otpAttempts =
                    otp?.delivery?.attempts ?? item.consent?.otp?.sendAttempts ?? "—";
                  const otpFails =
                    otp?.failedAttempts ?? item.consent?.otp?.failedVerifyAttempts ?? "—";
                  const consentIp = extractIp(item.consent);
                  const consentUserAgent = extractUserAgent(item.consent);

                  return (
                    <React.Fragment key={item._id}>
                    <tr className="align-middle border-b border-[#EDF1F7] hover:bg-[#F9FBFF] transition-colors">
                      <td className="py-3 px-3 text-[11px]">
                        <span
                          className={clsx(
                            "inline-flex items-center px-2 py-[2px] rounded-full text-[10px] font-semibold whitespace-nowrap",
                            personKindChipClass(item.user.docType)
                          )}
                        >
                          {isJuridica ? "Jurídica" : "Natural"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-[#3A4B70] whitespace-nowrap">
                        {parseCollectFormDocTypeToString(item.user.docType)}{" "}
                        {item.user.docNumber}
                      </td>
                      <td className="py-3 px-3 text-[12px] font-semibold text-[#0B1737] max-w-[200px]">
                        <div className="truncate" title={item.user.razonSocial || undefined}>
                          {isJuridica ? item.user.razonSocial || "—" : "—"}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-[#3A4B70] max-w-[140px]">
                        <div
                          className="truncate"
                          title={isJuridica ? "Representante legal" : undefined}
                        >
                          {item.user.name || "—"}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-[#3A4B70] max-w-[140px]">
                        <div className="truncate">{item.user.lastName || "—"}</div>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-[#3A4B70] whitespace-nowrap">
                        {!isJuridica && item.user.age != null ? item.user.age : "—"}
                      </td>
                      <td className="py-3 px-3 text-[11px] text-[#3A4B70] whitespace-nowrap">
                        {!isJuridica && item.user.gender
                          ? parseUserGenderToString(item.user.gender)
                          : "—"}
                      </td>
                      <td className="py-3 px-3 text-[11px] text-[#3A4B70] max-w-[240px]">
                        <div className="flex items-center gap-1.5 truncate">
                          <Icon icon="tabler:mail" className="text-[13px] text-[#8DA0C3] shrink-0" />
                          <span className="truncate">{item.user.email || "—"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-[#3A4B70] whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <Icon icon="tabler:phone" className="text-[13px] text-[#8DA0C3]" />
                          {item.user.phone || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-[#3A4B70] max-w-[170px] truncate">
                        <span className="inline-flex items-center gap-1.5">
                          <Icon icon="tabler:user-edit" className="text-[13px] text-[#8DA0C3] shrink-0" />
                          <span className="truncate">{createdByName}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[11px]">{channelChip(String(otpChannel))}</td>
                      <td className="py-3 px-3 text-[11px] text-[#3A4B70] max-w-[200px] truncate">
                        <span title={String(otpDestination)}>{otpDestination}</span>
                      </td>
                      <td className="py-3 px-3 text-[11px]">
                        <span
                          className={clsx(
                            "inline-flex items-center px-2 py-[2px] rounded-full text-[10px] font-semibold whitespace-nowrap",
                            otpStatusChipClass(String(otpStatus))
                          )}
                        >
                          {prettyOtpStatus(String(otpStatus))}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-[#3A4B70] whitespace-nowrap">
                        {otpProvider}
                      </td>
                      <td className="py-3 px-3 text-[11px] text-[#3A4B70] whitespace-nowrap">
                        {formatDateTime(otpSentAt)}
                      </td>
                      <td className="py-3 px-3 text-[11px] text-[#3A4B70] whitespace-nowrap">
                        {formatDateTime(otpVerifiedAt)}
                      </td>
                      <td className="py-3 px-3 text-[11px] text-[#3A4B70] whitespace-nowrap">
                        {formatDateTime(otpExpiresAt)}
                      </td>
                      <td className="py-3 px-3 text-[11px] text-[#3A4B70] whitespace-nowrap">
                        {otpAttempts}
                      </td>
                      <td className="py-3 px-3 text-[11px] text-[#3A4B70] whitespace-nowrap">
                        {otpFails}
                      </td>
                      <td className="py-3 px-3 text-[11px] text-[#3A4B70] whitespace-nowrap">
                        {obtainedVia}
                      </td>
                      <td className="py-3 px-3 text-[11px]">
                        <span
                          className={clsx(
                            "inline-flex items-center px-2 py-[2px] rounded-full text-[10px] font-semibold whitespace-nowrap",
                            getConsentStatusChipClass(String(consentStatus))
                          )}
                        >
                          {getConsentStatusLabel(String(consentStatus))}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[11px] align-top">
                        <ResponsePermissionsCell
                          permissions={item.permissions}
                          column="marketing"
                        />
                      </td>
                      <td className="py-3 px-3 text-[11px] align-top">
                        <ResponsePermissionsCell
                          permissions={item.permissions}
                          column="consentCampaigns"
                        />
                      </td>
                      <td className="py-3 px-3 text-[11px] align-top">
                        <ResponsePermissionsCell
                          permissions={item.permissions}
                          column="thirdParty"
                        />
                      </td>
                      <td className="py-3 px-3 text-[11px] text-[#3A4B70] whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-flex items-center rounded-full border border-[#E1E8F5] bg-[#F7F9FD] px-2 py-[2px] font-semibold text-[#334A79]"
                            title={policyVersion}
                          >
                            {policyVersion}
                          </span>
                          {policyUrl ? (
                            <a
                              href={policyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-[#DDE6F5] text-[#4869A9] hover:bg-[#EEF3FC]"
                              title="Abrir política aceptada"
                            >
                              <Icon icon="tabler:external-link" className="text-[13px]" />
                            </a>
                          ) : (
                            <span
                              className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-dashed border-[#DDE6F5] text-[#9AA8C2]"
                              title="No llegó URL de política en backend"
                            >
                              <Icon icon="tabler:link-off" className="text-[13px]" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-[#3A4B70] whitespace-nowrap leading-tight">
                        <p className="font-medium text-[#20345E]">{createdAt.date}</p>
                        <p className="text-[#7B8BA9]">{createdAt.time}</p>
                      </td>
                      <td className="py-3 px-3 text-[11px]">
                        <span
                          className={clsx(
                            "inline-flex items-center px-2 py-[2px] rounded-full text-[10px] font-semibold",
                            item.verifiedWithOTP
                              ? "bg-[#E8F8EE] text-[#1E8A52]"
                              : "bg-[#EDF2FA] text-[#4D5D81]"
                          )}
                        >
                          {item.verifiedWithOTP ? "Sí" : "No"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[11px]">
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1.5 text-[11px] font-semibold",
                            isProcessingOk ? "text-[#17914D]" : "text-[#C98E15]"
                          )}
                        >
                          <span
                            className={clsx(
                              "w-2 h-2 rounded-full",
                              isProcessingOk ? "bg-[#16A34A]" : "bg-[#EAAA08]"
                            )}
                          />
                          {isProcessingOk ? "Completo" : "Incompleto"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[11px]">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId((prev) => (prev === item._id ? null : item._id))
                            }
                            className="h-7 w-7 rounded-lg text-[#667895] hover:bg-[#EFF3FA] inline-flex items-center justify-center"
                            title={expandedId === item._id ? "Ocultar detalle" : "Ver detalle"}
                          >
                            <Icon icon={expandedId === item._id ? "tabler:eye-off" : "tabler:eye"} className="text-[15px]" />
                          </button>
                          {consentStatus !== "ACTIVE" && (
                            <button
                              type="button"
                              onClick={() => handleSendConsent(item)}
                              className="h-7 w-7 rounded-lg text-[#667895] hover:bg-[#EFF3FA] inline-flex items-center justify-center"
                              title="Solicitar consentimiento"
                            >
                              <Icon icon="tabler:refresh" className="text-[15px]" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => can("classification.edit") && deleteResponse(item._id)}
                            disabled={!can("classification.edit")}
                            className={clsx(
                              "h-7 w-7 rounded-lg inline-flex items-center justify-center transition-colors",
                              can("classification.edit")
                                ? "hover:bg-red-50 cursor-pointer"
                                : "opacity-40 cursor-not-allowed"
                            )}
                            aria-label="Eliminar registro"
                            title={
                              can("classification.edit")
                                ? "Eliminar registro"
                                : "No tienes permiso para eliminar"
                            }
                          >
                            <Icon
                              icon="bx:trash"
                              className={clsx(
                                "text-[15px]",
                                can("classification.edit")
                                  ? "text-red-500"
                                  : "text-stone-400"
                              )}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === item._id && (
                      <tr>
                        <td colSpan={29} className="px-3 pb-3">
                          <div className="rounded-xl border border-[#E7ECF4] bg-[#FAFCFF] p-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 text-[11px]">
                            {item.permissions && (
                              <div className="md:col-span-2 xl:col-span-4 rounded-lg border border-[#E3E9F5] bg-white p-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-[#7A869D] font-semibold mb-2">
                                    Campañas de marketing
                                  </p>
                                  <ResponsePermissionsCell
                                    permissions={item.permissions}
                                    column="marketing"
                                  />
                                </div>
                                <div>
                                  <p className="text-[#7A869D] font-semibold mb-2">
                                    Campañas de consentimiento
                                  </p>
                                  <ResponsePermissionsCell
                                    permissions={item.permissions}
                                    column="consentCampaigns"
                                  />
                                </div>
                                <div>
                                  <p className="text-[#7A869D] font-semibold mb-2">
                                    Compartir con terceros
                                  </p>
                                  <ResponsePermissionsCell
                                    permissions={item.permissions}
                                    column="thirdParty"
                                  />
                                </div>
                                {!hasAnyPermissionBlock(item.permissions) && (
                                  <p className="sm:col-span-3 text-[#16A34A]">
                                    Sin bloqueos activos en ningún canal.
                                  </p>
                                )}
                              </div>
                            )}
                            <div>
                              <p className="text-[#7A869D] font-semibold">Tipo de persona</p>
                              <p className="text-[#1E2D4E]">
                                {isJuridica ? "Jurídica (NIT)" : "Natural"}
                              </p>
                            </div>
                            {isJuridica && (
                              <div>
                                <p className="text-[#7A869D] font-semibold">Razón social</p>
                                <p className="text-[#1E2D4E]">{item.user.razonSocial || "—"}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-[#7A869D] font-semibold">
                                {isJuridica ? "Representante legal" : "Titular"}
                              </p>
                              <p className="text-[#1E2D4E]">
                                {[item.user.name, item.user.lastName].filter(Boolean).join(" ") || "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#7A869D] font-semibold">OTP destino</p>
                              <p className="text-[#1E2D4E] break-all">
                                {otp?.recipientData?.address || item.consent?.otp?.address || "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#7A869D] font-semibold">OTP enviado</p>
                              <p className="text-[#1E2D4E]">{formatDateTime(otp?.delivery?.sentAt)}</p>
                            </div>
                            <div>
                              <p className="text-[#7A869D] font-semibold">OTP verificado</p>
                              <p className="text-[#1E2D4E]">
                                {formatDateTime(otp?.verifiedAt || item.consent?.otp?.verifiedAt)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#7A869D] font-semibold">OTP expira</p>
                              <p className="text-[#1E2D4E]">{formatDateTime(otp?.expiresAt)}</p>
                            </div>
                            <div>
                              <p className="text-[#7A869D] font-semibold">Intentos OTP</p>
                              <p className="text-[#1E2D4E]">
                                {otp?.delivery?.attempts ?? item.consent?.otp?.sendAttempts ?? "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#7A869D] font-semibold">Fallos OTP</p>
                              <p className="text-[#1E2D4E]">
                                {otp?.failedAttempts ?? item.consent?.otp?.failedVerifyAttempts ?? "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#7A869D] font-semibold">Policy label</p>
                              <p className="text-[#1E2D4E]">
                                {item.consent?.policy?.policyVersionLabel || "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#7A869D] font-semibold">Consentimiento aceptado</p>
                              <p className="text-[#1E2D4E]">
                                {formatDateTime(item.consent?.acceptedAt)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#7A869D] font-semibold">Punto de recolección</p>
                              <p className="text-[#1E2D4E]">
                                {item.consent?.collectionPoint || "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#7A869D] font-semibold">Audit entries</p>
                              <p className="text-[#1E2D4E]">{item.consent?.audit?.length ?? 0}</p>
                            </div>
                            <div className="md:col-span-2 xl:col-span-4">
                              <p className="text-[#7A869D] font-semibold">IP / User-Agent</p>
                              <p className="text-[#1E2D4E] break-all">
                                {consentIp} · {consentUserAgent}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {showPagination && (
            <div className="flex-shrink-0 w-full border-t border-[#E5EAF2] px-4 pt-3 pb-3 bg-[#FAFBFD] rounded-b-2xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-[12px] text-[#7A869D]">
                  <span>
                    Mostrando{" "}
                    <span className="font-semibold text-[#0B1737]">
                      {(currentPage - 1) * pageSize + 1}
                    </span>{" "}
                    a{" "}
                    <span className="font-semibold text-[#0B1737]">
                      {Math.min(
                        currentPage * pageSize,
                        totalCount > 0
                          ? totalCount
                          : (items?.length || 0) + (currentPage - 1) * pageSize
                      )}
                    </span>
                    {totalCount > 0 && (
                      <>
                        {" "}de{" "}
                        <span className="font-semibold text-[#0B1737]">{totalCount}</span>{" "}
                        registros
                      </>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#CBD5E1]">|</span>
                    <label htmlFor="pageSize" className="text-[#7A869D]">
                      Por página:
                    </label>
                    <select
                      id="pageSize"
                      value={pageSize}
                      onChange={(e) => onPageSizeChange(Number(e.target.value))}
                      className="px-2 py-1 border border-[#E2E8F3] bg-white rounded-lg text-[12px] focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    hierarchy="secondary"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="px-2 py-1 text-[12px] rounded-lg! border-[#E2E8F3]!"
                  >
                    <Icon icon="tabler:chevrons-left" className="text-base sm:text-lg" />
                  </Button>
                  <Button
                    hierarchy="secondary"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2 py-1 text-[12px] rounded-lg! border-[#E2E8F3]!"
                  >
                    <Icon icon="tabler:chevron-left" className="text-base sm:text-lg" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, idx) => {
                      const maxVisible = 5;
                      let startPage = Math.max(
                        1,
                        currentPage - Math.floor(maxVisible / 2)
                      );
                      let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                      if (endPage - startPage < maxVisible - 1) {
                        startPage = Math.max(1, endPage - maxVisible + 1);
                      }
                      const page = startPage + idx;
                      if (page > endPage) return null;
                      return (
                        <Button
                          key={page}
                          hierarchy={page === currentPage ? "primary" : "secondary"}
                          onClick={() => onPageChange(page)}
                          className={clsx(
                            "px-3 py-1 text-[12px] min-w-[32px] rounded-lg! border-[#E2E8F3]!",
                            page === currentPage && "!bg-primary-700 !text-white"
                          )}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    hierarchy="secondary"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={!hasMoreData && currentPage >= totalPages}
                    className="px-2 py-1 text-[12px] rounded-lg! border-[#E2E8F3]!"
                  >
                    <Icon icon="tabler:chevron-right" className="text-base sm:text-lg" />
                  </Button>
                  <Button
                    hierarchy="secondary"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage >= totalPages}
                    className="px-2 py-1 text-[12px] rounded-lg! border-[#E2E8F3]!"
                  >
                    <Icon icon="tabler:chevrons-right" className="text-base sm:text-lg" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : !loading && items && items.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F5F9]">
            <Icon icon="tabler:clipboard-off" className="text-3xl text-[#94A3B8]" />
          </div>
          <p className="text-sm font-semibold text-[#334155]">
            No hay registros que coincidan
          </p>
          <p className="mt-1.5 max-w-sm text-xs text-[#64748B]">
            Prueba otro filtro de consentimiento o espera nuevas respuestas del formulario.
          </p>
        </div>
      ) : null}

      {error && (
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <p className="text-center text-red-500 text-sm sm:text-base">Error: {error}</p>
        </div>
      )}
    </div>
  );
};

export default FormResponsesTable;
