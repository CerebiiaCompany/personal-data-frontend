"use client";

import ArcoAccessReportPreview from "@/components/arco/ArcoAccessReportPreview";
import Button from "@/components/base/Button";
import LoadingCover from "@/components/layout/LoadingCover";
import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import {
  fetchArcoAccessReport,
  respondArcoRequest,
} from "@/lib/arcoAdmin.api";
import {
  ArcoAccessProcessingPurpose,
  ArcoAccessReportDraftResponse,
  ArcoAccessReportOfficerData,
} from "@/types/arco.admin.types";
import {
  chileOfficerFieldRequired,
  EMPTY_PROCESSING_PURPOSE,
  getMissingOverrideFields,
  getOverrideDescription,
  getResolvedAccessReport,
  needsConsentStatusOverride,
  needsDataOriginOverride,
  needsProcessingPurposesOverride,
} from "@/utils/arcoAccessReport.utils";
import {
  isArcoConsentLegacyRecord,
  isArcoDataOriginFromSystem,
} from "@/utils/arcoAdmin.utils";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  companyId: string;
  requestId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_RESOLVE_MESSAGE =
  "Se adjunta el informe completo con todos sus datos personales tratados por nuestra empresa.";

const ArcoAccessRespondDialog = ({
  open,
  companyId,
  requestId,
  onClose,
  onSuccess,
}: Props) => {
  const [draft, setDraft] = useState<ArcoAccessReportDraftResponse | null>(null);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [finalStatus, setFinalStatus] = useState<"RESOLVED" | "REJECTED">(
    "RESOLVED"
  );
  const [message, setMessage] = useState(DEFAULT_RESOLVE_MESSAGE);
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([""]);
  const [thirdParties, setThirdParties] = useState<string[]>([""]);
  const [noThirdParties, setNoThirdParties] = useState(false);
  const [dataOriginOverride, setDataOriginOverride] = useState("");
  const [consentStatusOverride, setConsentStatusOverride] = useState("");
  const [processingPurposesOverride, setProcessingPurposesOverride] = useState<
    ArcoAccessProcessingPurpose[]
  >([{ ...EMPTY_PROCESSING_PURPOSE }]);
  const [retentionPeriod, setRetentionPeriod] = useState("");
  const [automatedOccurs, setAutomatedOccurs] = useState(false);
  const [automatedDescription, setAutomatedDescription] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const loadDraft = useCallback(async () => {
    setLoadingDraft(true);
    const res = await fetchArcoAccessReport(companyId, requestId);
    setLoadingDraft(false);
    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
      return;
    }
    setDraft(res.data ?? null);
  }, [companyId, requestId]);

  useEffect(() => {
    if (!open) return;
    setFinalStatus("RESOLVED");
    setMessage(DEFAULT_RESOLVE_MESSAGE);
    setAttachmentUrls([""]);
    setThirdParties([""]);
    setNoThirdParties(false);
    setDataOriginOverride("");
    setConsentStatusOverride("");
    setProcessingPurposesOverride([{ ...EMPTY_PROCESSING_PURPOSE }]);
    setRetentionPeriod("");
    setAutomatedOccurs(false);
    setAutomatedDescription("");
    loadDraft();
  }, [open, loadDraft]);

  const autoPopulated = draft?.autoPopulated;
  const officerFields = draft?.officerFields;
  const missingOverrides = useMemo(
    () => getMissingOverrideFields(officerFields),
    [officerFields]
  );

  const needsRetention = chileOfficerFieldRequired(
    officerFields,
    "retentionPeriod"
  );
  const needsAutomated = chileOfficerFieldRequired(
    officerFields,
    "automatedDecisions"
  );

  const showDataOriginOverride = needsDataOriginOverride(
    autoPopulated,
    missingOverrides
  );
  const showConsentOverride = needsConsentStatusOverride(missingOverrides);
  const showPurposesOverride = needsProcessingPurposesOverride(missingOverrides);

  const legacyConsent =
    !draft?.alreadyResolved &&
    autoPopulated?.consentInfo != null &&
    isArcoConsentLegacyRecord(autoPopulated.consentInfo) &&
    !showConsentOverride;

  if (!open) return null;

  const readOnly = draft?.alreadyResolved === true;
  const reportToShow = getResolvedAccessReport(draft) ?? autoPopulated;
  const dataOriginHint = autoPopulated?.dataOrigin;

  function updateList(
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) {
    setter((prev) => prev.map((item, i) => (i === index ? value : item)));
  }

  function updatePurpose(
    index: number,
    key: keyof ArcoAccessProcessingPurpose,
    value: string
  ) {
    setProcessingPurposesOverride((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [key]: value } : row))
    );
  }

  function buildAccessReportData(): ArcoAccessReportOfficerData | undefined {
    if (finalStatus !== "RESOLVED") return undefined;

    const parties = noThirdParties
      ? []
      : thirdParties.map((t) => t.trim()).filter(Boolean);

    const data: ArcoAccessReportOfficerData = { thirdParties: parties };

    if (showDataOriginOverride && dataOriginOverride.trim()) {
      data.dataOriginOverride = dataOriginOverride.trim();
    }
    if (showConsentOverride && consentStatusOverride.trim()) {
      data.consentStatusOverride = consentStatusOverride.trim();
    }
    if (showPurposesOverride) {
      const purposes = processingPurposesOverride
        .map((p) => ({
          dataType: p.dataType.trim(),
          purpose: p.purpose.trim(),
        }))
        .filter((p) => p.dataType && p.purpose);
      if (purposes.length) {
        data.processingPurposesOverride = purposes;
      }
    }

    if (needsRetention) {
      data.retentionPeriod = retentionPeriod.trim();
    }
    if (needsAutomated) {
      data.automatedDecisions = {
        occurs: automatedOccurs,
        description: automatedOccurs ? automatedDescription.trim() : undefined,
      };
    }

    return data;
  }

  function validate(): boolean {
    if (!message.trim()) {
      toast.error("Escribe el mensaje de respuesta al titular");
      return false;
    }

    if (finalStatus !== "RESOLVED") return true;

    if (showDataOriginOverride && !dataOriginOverride.trim()) {
      toast.error("Indica cómo se obtuvieron los datos del titular");
      return false;
    }

    if (showConsentOverride && !consentStatusOverride.trim()) {
      toast.error("Indica el estado del consentimiento en lenguaje claro");
      return false;
    }

    if (showPurposesOverride) {
      const valid = processingPurposesOverride.some(
        (p) => p.dataType.trim() && p.purpose.trim()
      );
      if (!valid) {
        toast.error("Indica al menos una finalidad del tratamiento");
        return false;
      }
    }

    if (!noThirdParties) {
      const parties = thirdParties.map((t) => t.trim()).filter(Boolean);
      if (parties.length === 0) {
        toast.error(
          'Indica terceros o marca "No se compartió con terceros"'
        );
        return false;
      }
    }

    if (needsRetention && !retentionPeriod.trim()) {
      toast.error("Indica el plazo de conservación de los datos");
      return false;
    }

    if (needsAutomated && automatedOccurs && !automatedDescription.trim()) {
      toast.error("Describe las decisiones automatizadas aplicadas");
      return false;
    }

    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const urls = attachmentUrls.map((u) => u.trim()).filter(Boolean);

    setSubmitting(true);
    const res = await respondArcoRequest(companyId, requestId, {
      finalStatus,
      message: message.trim(),
      attachmentUrls: urls.length ? urls : undefined,
      accessReportData: buildAccessReportData(),
    });
    setSubmitting(false);

    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
      return;
    }

    toast.success(
      finalStatus === "RESOLVED"
        ? "Solicitud de acceso resuelta con informe"
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
      aria-labelledby="arco-access-dialog-title"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#E8EDF7] bg-white shadow-xl">
        {loadingDraft && <LoadingCover />}

        <div className="shrink-0 border-b border-[#EEF2F8] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary-600">
                Solicitud de acceso
              </p>
              <h2
                id="arco-access-dialog-title"
                className="text-xl font-semibold text-[#1A2B5B]"
              >
                {readOnly ? "Informe de acceso" : "Resolver con informe de acceso"}
              </h2>
              <p className="mt-1 text-sm text-[#64748B]">
                {readOnly
                  ? "Consulta del informe entregado al titular."
                  : "Revisa los datos autocompletados y completa los campos indicados."}
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

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {reportToShow && (
            <div className="mb-6">
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#64748B]">
                <Icon icon="tabler:sparkles" className="text-primary-600" />
                {readOnly ? "Informe guardado" : "Datos autocompletados del sistema"}
              </p>
              <ArcoAccessReportPreview
                report={reportToShow}
                showOfficerSection={readOnly}
                showDataOrigin={
                  readOnly || !showDataOriginOverride
                }
                hideConsentSection={!readOnly && showConsentOverride}
                hideProcessingPurposesSection={
                  !readOnly && showPurposesOverride
                }
              />
            </div>
          )}

          {!readOnly && missingOverrides.size > 0 && (
            <p className="mb-4 flex gap-2 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-xs text-amber-950">
              <Icon
                icon="tabler:info-circle"
                className="mt-0.5 shrink-0 text-base"
              />
              Algunos datos no pudieron autocompletarse (registro antiguo). Complétalos
              en la sección del oficial.
            </p>
          )}

          {!readOnly && (
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="flex flex-col gap-5 border-t border-[#EEF2F8] pt-5"
            >
              <p className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
                <Icon icon="tabler:pencil" className="text-primary-600" />
                Campos del oficial
              </p>

              {legacyConsent && (
                <p className="flex gap-2 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2.5 text-xs leading-relaxed text-amber-950">
                  <Icon
                    icon="tabler:alert-triangle"
                    className="mt-0.5 shrink-0 text-base text-amber-700"
                  />
                  <span>
                    <strong>Sin consentimiento formal registrado.</strong> Verifique
                    la base legal antes de cerrar el informe.
                  </span>
                </p>
              )}

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

              {finalStatus === "RESOLVED" && (
                <>
                  {showDataOriginOverride && (
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-stone-600">
                        Origen de los datos{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      {getOverrideDescription(
                        officerFields?.missingDataOverrides,
                        "dataOriginOverride"
                      ) && (
                        <p className="text-xs text-[#64748B]">
                          {getOverrideDescription(
                            officerFields?.missingDataOverrides,
                            "dataOriginOverride"
                          )}
                        </p>
                      )}
                      {dataOriginHint &&
                        !isArcoDataOriginFromSystem(autoPopulated?.dataOriginRaw) && (
                          <p className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs text-amber-950">
                            {dataOriginHint}
                          </p>
                        )}
                      <textarea
                        value={dataOriginOverride}
                        onChange={(e) => setDataOriginOverride(e.target.value)}
                        rows={3}
                        placeholder="Ej. Formulario físico en tienda, campaña de 2022"
                        className="w-full resize-y rounded-xl border border-[#E4EAF6] px-3 py-2 text-sm outline-none focus:border-primary-900 focus:ring-2 focus:ring-primary-500/20"
                      />
                    </div>
                  )}

                  {showConsentOverride && (
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-stone-600">
                        Estado del consentimiento{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      {getOverrideDescription(
                        officerFields?.missingDataOverrides,
                        "consentStatusOverride"
                      ) && (
                        <p className="text-xs text-[#64748B]">
                          {getOverrideDescription(
                            officerFields?.missingDataOverrides,
                            "consentStatusOverride"
                          )}
                        </p>
                      )}
                      <textarea
                        value={consentStatusOverride}
                        onChange={(e) =>
                          setConsentStatusOverride(e.target.value)
                        }
                        rows={2}
                        placeholder="Ej. Consentimiento verbal antes del sistema digital"
                        className="w-full resize-y rounded-xl border border-[#E4EAF6] px-3 py-2 text-sm outline-none focus:border-primary-900"
                      />
                    </div>
                  )}

                  {showPurposesOverride && (
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-stone-600">
                        Finalidades del tratamiento{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      {getOverrideDescription(
                        officerFields?.missingDataOverrides,
                        "processingPurposesOverride"
                      ) && (
                        <p className="text-xs text-[#64748B]">
                          {getOverrideDescription(
                            officerFields?.missingDataOverrides,
                            "processingPurposesOverride"
                          )}
                        </p>
                      )}
                      {processingPurposesOverride.map((row, index) => (
                        <div
                          key={index}
                          className="grid gap-2 rounded-xl border border-[#EEF2F8] bg-[#F8FAFC] p-3 sm:grid-cols-2"
                        >
                          <input
                            type="text"
                            value={row.dataType}
                            onChange={(e) =>
                              updatePurpose(index, "dataType", e.target.value)
                            }
                            placeholder="Tipo de dato"
                            className="h-10 rounded-xl border border-[#E4EAF6] px-3 text-sm"
                          />
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={row.purpose}
                              onChange={(e) =>
                                updatePurpose(index, "purpose", e.target.value)
                              }
                              placeholder="Finalidad"
                              className="h-10 flex-1 rounded-xl border border-[#E4EAF6] px-3 text-sm"
                            />
                            {processingPurposesOverride.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setProcessingPurposesOverride((prev) =>
                                    prev.filter((_, i) => i !== index)
                                  )
                                }
                                className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
                              >
                                <Icon icon="tabler:trash" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          setProcessingPurposesOverride((prev) => [
                            ...prev,
                            { ...EMPTY_PROCESSING_PURPOSE },
                          ])
                        }
                        className="text-left text-sm font-medium text-primary-900 hover:underline"
                      >
                        + Agregar finalidad
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-stone-600">
                      Terceros con quienes se compartieron los datos
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-[#64748B]">
                      <input
                        type="checkbox"
                        checked={noThirdParties}
                        onChange={(e) => {
                          setNoThirdParties(e.target.checked);
                          if (e.target.checked) setThirdParties([""]);
                        }}
                        className="rounded border-zinc-300"
                      />
                      No se compartió con terceros (enviar lista vacía)
                    </label>
                    {!noThirdParties &&
                      thirdParties.map((party, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={party}
                            onChange={(e) =>
                              updateList(setThirdParties, index, e.target.value)
                            }
                            placeholder="Ej. Google Analytics"
                            className="h-10 flex-1 rounded-xl border border-[#E4EAF6] px-3 text-sm outline-none focus:border-primary-900"
                          />
                          {thirdParties.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setThirdParties((prev) =>
                                  prev.filter((_, i) => i !== index)
                                )
                              }
                              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
                            >
                              <Icon icon="tabler:trash" />
                            </button>
                          )}
                        </div>
                      ))}
                    {!noThirdParties && (
                      <button
                        type="button"
                        onClick={() => setThirdParties((prev) => [...prev, ""])}
                        className="text-left text-sm font-medium text-primary-900 hover:underline"
                      >
                        + Agregar otro tercero
                      </button>
                    )}
                  </div>

                  {(needsRetention || needsAutomated) && (
                    <>
                      {needsRetention && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium text-stone-600">
                            Plazo de conservación{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={retentionPeriod}
                            onChange={(e) => setRetentionPeriod(e.target.value)}
                            placeholder="Ej. 3 años desde el último uso del servicio"
                            className="h-10 rounded-xl border border-[#E4EAF6] px-3 text-sm outline-none focus:border-primary-900"
                          />
                        </div>
                      )}

                      {needsAutomated && (
                        <div className="flex flex-col gap-3 rounded-xl border border-[#EEF2F8] bg-[#F8FAFC] p-4">
                          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#1A2B5B]">
                            <input
                              type="checkbox"
                              checked={automatedOccurs}
                              onChange={(e) =>
                                setAutomatedOccurs(e.target.checked)
                              }
                              className="rounded border-zinc-300"
                            />
                            Aplican decisiones automatizadas
                          </label>
                          {automatedOccurs && (
                            <textarea
                              value={automatedDescription}
                              onChange={(e) =>
                                setAutomatedDescription(e.target.value)
                              }
                              rows={3}
                              placeholder="Describe el proceso..."
                              className="w-full resize-y rounded-xl border border-[#E4EAF6] px-3 py-2 text-sm outline-none focus:border-primary-900"
                            />
                          )}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-stone-600">
                  Mensaje al titular
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full resize-y rounded-xl border border-[#E4EAF6] px-3 py-2 text-sm outline-none focus:border-primary-900 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-stone-600">
                  Adjuntos del informe (URLs, opcional)
                </label>
                {attachmentUrls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) =>
                        updateList(setAttachmentUrls, index, e.target.value)
                      }
                      placeholder="https://..."
                      className="h-10 flex-1 rounded-xl border border-[#E4EAF6] px-3 text-sm outline-none focus:border-primary-900"
                    />
                    {attachmentUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setAttachmentUrls((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                        className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
                      >
                        <Icon icon="tabler:trash" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setAttachmentUrls((prev) => [...prev, ""])}
                  className="text-left text-sm font-medium text-primary-900 hover:underline"
                >
                  + Agregar otro adjunto
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="shrink-0 border-t border-[#EEF2F8] px-6 py-4">
          {readOnly ? (
            <Button
              type="button"
              hierarchy="secondary"
              onClick={onClose}
              className="w-full sm:ml-auto sm:w-auto"
            >
              Cerrar
            </Button>
          ) : (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
                hierarchy="primary"
                loading={submitting}
                disabled={submitting || loadingDraft}
                onClick={() => formRef.current?.requestSubmit()}
              >
                Enviar respuesta e informe
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArcoAccessRespondDialog;
