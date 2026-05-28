"use client";

import Button from "@/components/base/Button";
import LoadingCover from "@/components/layout/LoadingCover";
import PersonasAnimateIn from "@/components/personas/PersonasAnimateIn";
import PersonasAccessReportPanel from "@/components/personas/PersonasAccessReportPanel";
import PersonasArcoRequestDialog from "@/components/personas/PersonasArcoRequestDialog";
import PersonasFlowStepper from "@/components/personas/PersonasFlowStepper";
import { personasArcoActions } from "@/constants/personasData";
import { personasTheme } from "@/constants/personasTheme";
import {
  arcoGetCompanyPolicy,
  arcoListCompanies,
  arcoListRequests,
} from "@/lib/arco.api";
import { usePersonasCountryContent } from "@/hooks/usePersonasCountryContent";
import { usePersonasCountryStore } from "@/store/usePersonasCountryStore";
import {
  ARCO_REQUEST_STATUS_LABELS,
  ARCO_REQUEST_TYPE_LABELS,
  ArcoCompanyEntry,
  ArcoRequestListItem,
  ArcoRequestType,
} from "@/types/arco.types";
import { showApiErrorToast, showPersonasMessageToast } from "@/components/feedback/ApiErrorToast";
import {
  clearPersonasVerification,
  getPersonasVerification,
  isArcoSessionValid,
} from "@/utils/personasSession";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

function consentStatusLabel(status: string) {
  if (status === "ACTIVE") return "Consentimiento activo";
  if (status === "REVOKED") return "Consentimiento revocado";
  return status;
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "RESOLVED":
      return "bg-emerald-50 text-emerald-800";
    case "REJECTED":
      return "bg-red-50 text-red-800";
    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-800";
    default:
      return "bg-amber-50 text-amber-800";
  }
}

const PersonasPortal = () => {
  const router = useRouter();
  const content = usePersonasCountryContent();
  const setCountry = usePersonasCountryStore((s) => s.setCountry);
  const [docLabel, setDocLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<ArcoCompanyEntry[]>([]);
  const [requests, setRequests] = useState<ArcoRequestListItem[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null
  );
  const [dialogType, setDialogType] = useState<ArcoRequestType | null>(null);
  const [loadingPolicyId, setLoadingPolicyId] = useState<string | null>(null);

  const selectedCompany = companies.find((c) => c.companyId === selectedCompanyId);

  const loadPortalData = useCallback(async () => {
    setLoading(true);
    const [companiesRes, requestsRes] = await Promise.all([
      arcoListCompanies(),
      arcoListRequests(),
    ]);
    setLoading(false);

    if (companiesRes.error) {
      showApiErrorToast(companiesRes.error, companiesRes.error.status);
    } else {
      setCompanies(companiesRes.data ?? []);
    }

    if (requestsRes.error) {
      showApiErrorToast(requestsRes.error, requestsRes.error.status);
    } else {
      setRequests(requestsRes.data ?? []);
    }
  }, []);

  useEffect(() => {
    if (!isArcoSessionValid()) {
      router.replace("/personas/ingresar");
      return;
    }
    const verification = getPersonasVerification();
    if (verification) {
      setDocLabel(verification.docNumber);
      if (verification.country) setCountry(verification.country);
    }
    loadPortalData();
  }, [router, setCountry, loadPortalData]);

  function handleExit() {
    clearPersonasVerification();
    router.push("/personas");
  }

  function handleArcoRequest(type: ArcoRequestType) {
    if (!selectedCompanyId) {
      showPersonasMessageToast("Selecciona una empresa antes de continuar.", {
        title: "Empresa requerida",
      });
      return;
    }
    setDialogType(type);
  }

  async function handleViewPolicy(companyId: string) {
    setLoadingPolicyId(companyId);
    const res = await arcoGetCompanyPolicy(companyId);
    setLoadingPolicyId(null);

    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
      return;
    }

    const url = res.data?.policy?.fileUrl;
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      showPersonasMessageToast("No hay política disponible para esta empresa.", {
        title: "Política no disponible",
        variant: "default",
      });
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {loading && <LoadingCover />}

      <PersonasAnimateIn delay={60}>
        <PersonasFlowStepper />
      </PersonasAnimateIn>

      <PersonasAnimateIn delay={120}>
        <div
          className={clsx(
            personasTheme.card,
            "mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
          )}
        >
          <div className="flex items-center gap-4">
            <div className={clsx(personasTheme.iconBox, "h-12 w-12 rounded-2xl")}>
              <Icon icon="tabler:user-check" className="text-2xl" />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-400">
                {content.flag} {content.label}
              </p>
              <h1 className="text-xl font-semibold text-primary-900">
                Tu espacio de titular
              </h1>
              <p className="text-sm text-zinc-600">Doc. {docLabel}</p>
            </div>
          </div>
          <Button
            hierarchy="secondary"
            onClick={handleExit}
            className="rounded-xl! text-primary-900!"
          >
            Cerrar sesión
          </Button>
        </div>
      </PersonasAnimateIn>

      <PersonasAnimateIn delay={180}>
        <section className="mb-10">
          <h2 className="mb-1 text-lg font-semibold text-primary-900">
            Empresas con tus datos
          </h2>
          <p className={clsx("mb-5 text-sm", personasTheme.body)}>
            Selecciona una empresa para ejercer tus derechos o ver la política
            aceptada.
          </p>

          {companies.length === 0 && !loading ? (
            <div className={clsx(personasTheme.infoBox, "text-sm")}>
              No encontramos empresas asociadas a tu documento.
            </div>
          ) : (
            <ul className="space-y-3">
              {companies.map((entry) => {
                const isSelected = selectedCompanyId === entry.companyId;
                return (
                  <li key={entry.companyId}>
                    <div
                      className={clsx(
                        "rounded-2xl border p-5 transition-all",
                        isSelected
                          ? personasTheme.selectedCard
                          : personasTheme.cardHover
                      )}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedCompanyId(
                            isSelected ? null : entry.companyId
                          )
                        }
                        className="w-full text-left"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={clsx(personasTheme.iconBox, "h-11 w-11")}
                          >
                            <Icon icon="tabler:building" className="text-xl" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-primary-900">
                              {entry.company.name}
                            </h3>
                            {entry.company.nit && (
                              <p className="text-sm text-zinc-500">
                                NIT {entry.company.nit}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="rounded-md bg-primary-50 px-2 py-0.5 text-xs text-primary-900">
                                {consentStatusLabel(entry.consent.status)}
                              </span>
                              {entry.consent.policyName && (
                                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                                  {entry.consent.policyName}
                                </span>
                              )}
                            </div>
                          </div>
                          <Icon
                            icon={
                              isSelected
                                ? "tabler:circle-check-filled"
                                : "tabler:circle"
                            }
                            className={clsx(
                              "shrink-0 text-2xl",
                              isSelected ? "text-primary-900" : "text-disabled"
                            )}
                          />
                        </div>
                      </button>

                      {isSelected && (
                        <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-100 pt-4">
                          <Button
                            hierarchy="secondary"
                            className="rounded-lg! text-primary-900! text-sm!"
                            loading={loadingPolicyId === entry.companyId}
                            disabled={loadingPolicyId === entry.companyId}
                            onClick={() => handleViewPolicy(entry.companyId)}
                            startContent={<Icon icon="tabler:file-text" />}
                          >
                            Ver política
                          </Button>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </PersonasAnimateIn>

      <PersonasAnimateIn delay={220}>
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-primary-900">
            Ejercer derechos · {content.rightsLabel}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {personasArcoActions.map((action) => (
              <button
                key={action.value}
                type="button"
                onClick={() => handleArcoRequest(action.value as ArcoRequestType)}
                className={clsx(
                  personasTheme.cardSoft,
                  "w-full p-4 text-left hover:bg-zinc-50"
                )}
              >
                <div className="mb-2 flex items-center gap-3">
                  <div className={clsx(personasTheme.iconBox, "h-9 w-9")}>
                    <Icon icon={action.icon} />
                  </div>
                  <span className="font-medium text-primary-900">
                    {action.label}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">{action.hint}</p>
              </button>
            ))}
          </div>
        </section>
      </PersonasAnimateIn>

      <PersonasAnimateIn delay={280}>
        <section>
          <h2 className="mb-4 text-lg font-semibold text-primary-900">
            Mis solicitudes
          </h2>
          {requests.length === 0 ? (
            <div className={clsx(personasTheme.infoBox, "text-sm")}>
              Aún no has enviado solicitudes ARCO.
            </div>
          ) : (
            <ul className="space-y-3">
              {requests.map((req) => (
                <li
                  key={req.requestId}
                  className={clsx(personasTheme.cardSoft, "p-4")}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-primary-900">
                        {ARCO_REQUEST_TYPE_LABELS[req.requestType]} ·{" "}
                        {req.company.name}
                      </p>
                      <p className="mt-1 text-sm text-zinc-600">
                        {req.description}
                      </p>
                    </div>
                    <span
                      className={clsx(
                        "rounded-full px-2.5 py-1 text-xs font-medium",
                        statusBadgeClass(req.status)
                      )}
                    >
                      {ARCO_REQUEST_STATUS_LABELS[req.status]}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-500">
                    <span>
                      Vence:{" "}
                      {new Date(req.dueDate).toLocaleDateString("es-CO")}
                    </span>
                    <span>
                      Creada:{" "}
                      {new Date(req.createdAt).toLocaleDateString("es-CO")}
                    </span>
                  </div>
                  {req.response?.message && (
                    <div className="mt-3 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700">
                      <p className="font-medium text-primary-900">Respuesta:</p>
                      <p>{req.response.message}</p>
                    </div>
                  )}
                  {req.requestType === "ACCESS" &&
                    req.status === "RESOLVED" &&
                    req.accessReport && (
                      <PersonasAccessReportPanel accessReport={req.accessReport} />
                    )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </PersonasAnimateIn>

      {dialogType && selectedCompany && (
        <PersonasArcoRequestDialog
          open={Boolean(dialogType)}
          companyId={selectedCompany.companyId}
          companyName={selectedCompany.company.name}
          requestType={dialogType}
          onClose={() => setDialogType(null)}
          onSuccess={loadPortalData}
        />
      )}
    </div>
  );
};

export default PersonasPortal;
