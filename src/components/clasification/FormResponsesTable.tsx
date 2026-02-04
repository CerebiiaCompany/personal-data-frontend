import {
  CollectFormResponse,
  OneTimeCodePopulated,
  parseUserGenderToString,
} from "@/types/collectFormResponse.types";
import React from "react";
import LoadingCover from "../layout/LoadingCover";
import { Icon } from "@iconify/react/dist/iconify.js";
import { deleteCollectFormResponse } from "@/lib/collectFormResponse.api";
import { useSessionStore } from "@/store/useSessionStore";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { parseApiError } from "@/utils/parseApiError";
import { parseDocTypeToString } from "@/types/user.types";
import clsx from "clsx";
import Button from "../base/Button";
import SendConsentInvitationDialog from "../dialogs/SendConsentInvitationDialog";
import { showDialog } from "@/utils/dialogs.utils";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { usePermissionCheck } from "@/hooks/usePermissionCheck";

interface Props {
  items: CollectFormResponse[] | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const FormResponsesTable = ({ items, loading, error, refresh }: Props) => {
  const user = useSessionStore((store) => store.user);
  const { can } = usePermissionCheck();
  const formId = useParams().formId!.toString();
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [selectedResponse, setSelectedResponse] = React.useState<CollectFormResponse | null>(null);

  const getOtp = (item: CollectFormResponse): OneTimeCodePopulated | null => {
    if (!item.otpCodeId) return null;
    if (typeof item.otpCodeId === "string") return null;
    return item.otpCodeId;
  };

  const formatDateTime = (value?: string) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusChipClass = (status?: string) => {
    const s = (status || "").toUpperCase();
    if (s === "VERIFIED" || s === "ACTIVE" || s === "ACCEPTED") {
      return "bg-green-100 text-green-800 border-green-200";
    }
    if (s === "PENDING") {
      return "bg-amber-100 text-amber-800 border-amber-200";
    }
    if (s === "EXPIRED" || s === "REVOKED" || s === "FAILED" || s === "REJECTED") {
      return "bg-red-100 text-red-800 border-red-200";
    }
    if (!s || s === "—") {
      return "bg-stone-100 text-stone-700 border-stone-200";
    }
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  const ChannelChip = ({ channel }: { channel: string }) => {
    const ch = (channel || "—").toUpperCase();
    const isSms = ch === "SMS";
    const isEmail = ch === "EMAIL";
    return (
      <span
        className={clsx([
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] sm:text-xs font-semibold whitespace-nowrap",
          isSms
            ? "bg-indigo-100 text-indigo-800 border-indigo-200"
            : isEmail
              ? "bg-sky-100 text-sky-800 border-sky-200"
              : "bg-stone-100 text-stone-700 border-stone-200",
        ])}
        title={ch}
      >
        <Icon
          icon={isSms ? "mdi:message-text-outline" : isEmail ? "material-symbols:email-outline" : "tabler:help"}
          className="text-sm"
        />
        {ch}
      </span>
    );
  };

  async function deleteResponse(id: string) {
    const companyId = user?.companyUserData?.companyId;

    if (!companyId) return;

    const res = await deleteCollectFormResponse(companyId, formId, id);
    console.log(res);
    if (res.error) {
      return toast.error(parseApiError(res.error));
    }

    toast.success("Respuesta eliminada");
    refresh();
  }

  function handleSendConsent(item: CollectFormResponse) {
    setSelectedResponse(item);
    showDialog(HTML_IDS_DATA.sendConsentInvitationDialog);
  }

  return (
    <div className="w-full flex-1 relative min-h-0 flex flex-col">
      {loading && <LoadingCover />}

      {/* Modal de envío de consentimiento */}
      <SendConsentInvitationDialog
        response={selectedResponse}
        companyId={user?.companyUserData?.companyId || ""}
        collectFormId={formId}
        onSent={refresh}
      />

      {!loading ? (
        items?.length ? (
          <div className="w-full overflow-x-auto overflow-y-auto flex-1 min-h-0">
            <table className="w-full min-w-[1900px] table-auto border-separate border-spacing-y-2">
              <thead className="sticky top-0 bg-white z-10">
                <tr>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap"
                  >
                    CC
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[100px]"
                  >
                    Nombre
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[100px]"
                  >
                    Apellido
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap"
                  >
                    Edad
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap"
                  >
                    Sexo
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[150px]"
                  >
                    Correo
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[120px]"
                  >
                    Teléfono
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[120px]"
                  >
                    Registrado por
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[140px]"
                  >
                    Fecha y hora
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap"
                  >
                    Usó OTP
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap"
                  >
                    Canal OTP
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[150px]"
                  >
                    Destino OTP
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap"
                  >
                    Estado OTP
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap"
                  >
                    Provider
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[140px]"
                  >
                    OTP sentAt
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[140px]"
                  >
                    OTP verifiedAt
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[140px]"
                  >
                    OTP expiresAt
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap"
                  >
                    Intentos
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap"
                  >
                    Fallos
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap"
                  >
                    Obtenido vía
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[180px]"
                  >
                    Consentimiento
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap min-w-[180px]"
                  >
                    Política
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap"
                  >
                    Estado
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap"
                  >
                    Detalles
                  </th>
                  <th
                    scope="col"
                    className="text-center font-medium text-stone-600 text-xs py-2 px-2 sm:px-3 whitespace-nowrap"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const otp = getOtp(item);
                  const otpChannel =
                    otp?.recipientData?.channel ?? item.consent?.otp?.channel ?? "—";
                  const otpAddress =
                    otp?.recipientData?.address ?? item.consent?.otp?.address ?? "—";
                  const otpStatus =
                    otp?.status ?? (item.consent?.otp?.verified ? "VERIFIED" : "—");
                  const otpVerifiedAt = otp?.verifiedAt ?? item.consent?.otp?.verifiedAt;
                  const otpExpiresAt = otp?.expiresAt;
                  const otpAttempts = otp?.delivery?.attempts ?? item.consent?.otp?.sendAttempts;
                  const otpFailedAttempts = otp?.failedAttempts ?? item.consent?.otp?.failedVerifyAttempts;
                  const obtainedVia = item.consent?.obtainedVia ?? "—";
                  const consentAcceptedAt = formatDateTime(item.consent?.acceptedAt);
                  const consentStatus = item.consent?.status ?? "—";
                  const policyLabel = item.consent?.policy?.policyVersionLabel || "—";
                  const policyUrl = otp?.policyUrl ?? item.consent?.otpMessage?.policyUrl;
                  const isExpanded = expandedId === item._id;

                  return (
                    <React.Fragment key={item._id}>
                      <tr className="align-middle text-center">
                        <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm rounded-l-xl whitespace-nowrap">
                          {parseDocTypeToString(item.user.docType)} {item.user.docNumber}
                        </td>
                        <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm max-w-[120px] truncate">
                          {item.user.name}
                        </td>
                        <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm max-w-[120px] truncate">
                          {item.user.lastName}
                        </td>
                        <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm whitespace-nowrap">
                          {item.user.age && item.user.age >= 18 ? (
                            item.user.age
                          ) : (
                            <span
                              className="text-stone-400"
                              title="Información protegida para menores de edad"
                            >
                              —
                            </span>
                          )}
                        </td>
                        <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm whitespace-nowrap">
                          {parseUserGenderToString(item.user.gender)}
                        </td>
                        <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm max-w-[180px] truncate">
                          {item.user.email}
                        </td>
                        <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm whitespace-nowrap">
                          {item.user.phone}
                        </td>
                        <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm max-w-[130px] truncate">
                          {item.createdBy?.name || item.createdBy?.lastName
                            ? `${item.createdBy?.name || ""}${
                                item.createdBy?.lastName
                                  ? ` ${item.createdBy.lastName}`
                                  : ""
                              }`
                            : item.createdBy?.username || item.createdBy?.email || "—"}
                        </td>
                        <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm whitespace-nowrap">
                          {formatDateTime(item.createdAt)}
                        </td>
                        <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm whitespace-nowrap">
                          {item.verifiedWithOTP ? (
                            <span className="text-green-600 font-semibold">Sí</span>
                          ) : (
                            <span className="text-stone-600">No</span>
                          )}
                        </td>
                        <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm whitespace-nowrap">
                          <ChannelChip channel={String(otpChannel)} />
                        </td>
                        <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm max-w-[200px] truncate">
                          {otpAddress}
                        </td>
                        <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm whitespace-nowrap">
                          <span
                            className={clsx([
                              "inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] sm:text-xs font-semibold whitespace-nowrap",
                              statusChipClass(String(otpStatus)),
                            ])}
                            title={String(otpStatus)}
                          >
                            {otpStatus}
                          </span>
                        </td>
                        <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm whitespace-nowrap">
                          {otp?.delivery?.provider ? (
                            <span className="font-semibold text-primary-900">{otp.delivery.provider}</span>
                          ) : (
                            <span className="text-stone-500">—</span>
                          )}
                        </td>
                        <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm whitespace-nowrap">
                          {formatDateTime(otp?.delivery?.sentAt)}
                        </td>
                        <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm whitespace-nowrap">
                          {formatDateTime(otpVerifiedAt)}
                        </td>
                        <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm whitespace-nowrap">
                          {formatDateTime(otpExpiresAt)}
                        </td>
                        <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm whitespace-nowrap">
                          {typeof otpAttempts === "number" ? otpAttempts : "—"}
                        </td>
                        <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm whitespace-nowrap">
                          {typeof otpFailedAttempts === "number" ? otpFailedAttempts : "—"}
                        </td>
                        <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm whitespace-nowrap">
                          {obtainedVia}
                        </td>
                        <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm">
                          {consentStatus === "ACTIVE" ? (
                            <span
                              className="inline-flex items-center gap-2 text-green-700"
                              title={item.consent?.policy?.policyVersionLabel || ""}
                            >
                              <span className="font-semibold">{consentStatus}</span>
                              <span className="text-stone-500 whitespace-nowrap">
                                {consentAcceptedAt}
                              </span>
                            </span>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700"
                                title="Sin consentimiento activo"
                              >
                                <Icon
                                  icon="tabler:alert-circle"
                                  className="text-sm"
                                />
                                <span className="font-semibold text-[10px] whitespace-nowrap">
                                  {consentStatus || "Pendiente"}
                                </span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleSendConsent(item)}
                                className="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md text-[10px] font-semibold whitespace-nowrap"
                                title="Enviar solicitud de consentimiento"
                              >
                                <Icon 
                                  icon="tabler:send" 
                                  className="text-xs group-hover:translate-x-0.5 transition-transform" 
                                />
                                Solicitar
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm max-w-[260px] truncate">
                          <div className="flex items-center justify-center gap-2">
                            <span className="truncate" title={policyLabel}>
                              {policyLabel}
                            </span>
                            {policyUrl ? (
                              <a
                                href={policyUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary-700 underline whitespace-nowrap"
                                title="Abrir política"
                              >
                                Ver
                              </a>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm">
                          <div className="w-full flex justify-center">
                            <span
                              className={clsx([
                                "inline-block w-3 h-3 sm:w-4 sm:h-4 rounded-full",
                                item.dataProcessing ? "bg-green-400" : "bg-red-400",
                              ])}
                              title={item.dataProcessing ? "Verificado" : "No verificado"}
                            />
                          </div>
                        </td>
                        <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm whitespace-nowrap">
                          <Button
                            type="button"
                            hierarchy="secondary"
                            className="text-xs px-2 py-1"
                            onClick={() =>
                              setExpandedId((prev) =>
                                prev === item._id ? null : item._id
                              )
                            }
                          >
                            {isExpanded ? "Ocultar" : "Ver"}
                          </Button>
                        </td>
                        <td className="py-2 sm:py-3 text-ellipsis px-2 sm:px-4 bg-primary-50 font-medium text-xs sm:text-sm rounded-r-xl whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5 h-full">
                            <button
                              onClick={() => can('classification.edit') && deleteResponse(item._id)}
                              disabled={!can('classification.edit')}
                              className={`h-full rounded-lg transition-colors p-1 sm:p-1.5 aspect-square ${
                                can('classification.edit')
                                  ? 'hover:bg-red-400/10 cursor-pointer'
                                  : 'opacity-40 cursor-not-allowed'
                              }`}
                              aria-label="Eliminar"
                              title={can('classification.edit') ? 'Eliminar registro' : 'No tienes permiso para eliminar'}
                            >
                              <Icon
                                icon="bx:trash"
                                className={`text-lg sm:text-xl ${
                                  can('classification.edit') ? 'text-red-400' : 'text-stone-400'
                                }`}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="align-middle">
                          <td colSpan={23} className="px-2 sm:px-4 pb-3">
                            <div className="bg-primary-50 border border-disabled rounded-xl p-3 sm:p-4 text-left">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                                <div className="flex flex-col gap-2 text-xs sm:text-sm">
                                  <h6 className="font-semibold text-primary-900">
                                    Detalles (resumen)
                                  </h6>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div>
                                      <span className="font-medium text-stone-600">
                                        Consentimiento (política):
                                      </span>{" "}
                                      <span className="text-primary-900">
                                        {item.consent?.policy?.policyVersionLabel ||
                                          "—"}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-stone-600">
                                        IP:
                                      </span>{" "}
                                      <span className="text-primary-900">
                                        {item.consent?.ipAddress || "—"}
                                      </span>
                                    </div>
                                    <div className="sm:col-span-2">
                                      <span className="font-medium text-stone-600">
                                        User-Agent:
                                      </span>{" "}
                                      <span className="text-primary-900 break-words">
                                        {item.consent?.userAgent || "—"}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-stone-600">
                                        OTP provider:
                                      </span>{" "}
                                      <span className="text-primary-900">
                                        {otp?.delivery?.provider || "—"}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-stone-600">
                                        OTP send status:
                                      </span>{" "}
                                      <span className="text-primary-900">
                                        {otp?.delivery?.status ||
                                          item.consent?.otp?.sendStatus ||
                                          "—"}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-stone-600">
                                        OTP sent at:
                                      </span>{" "}
                                      <span className="text-primary-900">
                                        {formatDateTime(otp?.delivery?.sentAt)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-stone-600">
                                        Audit entries:
                                      </span>{" "}
                                      <span className="text-primary-900">
                                        {item.consent?.audit?.length ?? 0}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-col gap-2 min-h-0">
                                  <h6 className="font-semibold text-primary-900 text-xs sm:text-sm">
                                    JSON completo
                                  </h6>
                                  <pre className="text-[10px] sm:text-xs bg-white border border-disabled rounded-lg p-3 overflow-auto max-h-[320px]">
{JSON.stringify(item, null, 2)}
                                  </pre>
                                </div>
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
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <p className="text-center text-stone-500 text-sm sm:text-base">Este formulario aún no tiene registros</p>
          </div>
        )
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
