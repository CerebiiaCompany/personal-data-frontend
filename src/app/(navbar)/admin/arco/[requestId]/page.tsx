"use client";

import ArcoAuditTimeline from "@/components/arco/ArcoAuditTimeline";
import ArcoAccessRespondDialog from "@/components/arco/ArcoAccessRespondDialog";
import ArcoAccessReportSection from "@/components/arco/ArcoAccessReportSection";
import ArcoRequestStatusBadge from "@/components/arco/ArcoRequestStatusBadge";
import ArcoRespondDialog from "@/components/arco/ArcoRespondDialog";
import Button from "@/components/base/Button";
import CheckPermission from "@/components/checkers/CheckPermission";
import LoadingCover from "@/components/layout/LoadingCover";
import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import { patchArcoRequestStatus } from "@/lib/arcoAdmin.api";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { useCompanyArcoRequestDetail } from "@/hooks/useCompanyArcoRequestDetail";
import { usePermissions } from "@/hooks/usePermissions";
import { useSessionStore } from "@/store/useSessionStore";
import {
  parseUserGenderToString,
  UserGender,
} from "@/types/collectFormResponse.types";
import { ARCO_RECTIFICATION_FIELDS } from "@/types/arco.types";
import {
  ARCO_DOC_TYPE_LABELS,
  formatArcoDate,
  formatArcoDateTime,
  formatArcoRequestLabel,
  getArcoDaysUntilDue,
  getArcoResolutionDays,
  isArcoRequestOverdue,
} from "@/utils/arcoAdmin.utils";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function fieldLabel(field: string) {
  return (
    ARCO_RECTIFICATION_FIELDS.find((f) => f.value === field)?.label ?? field
  );
}

function formatRectificationValue(field: string, value: string) {
  if (field === "gender" && ["MALE", "FEMALE", "OTHER"].includes(value)) {
    return parseUserGenderToString(value as UserGender);
  }
  return value;
}

export default function ArcoRequestDetailPage() {
  const params = useParams();
  const requestId = params.requestId as string;
  const router = useRouter();
  const user = useSessionStore((store) => store.user);
  const companyId = useActiveCompanyId();
  const { hasPermission } = usePermissions();
  const canView = hasPermission("arcoRequests", "view");
  const canRespond = hasPermission("arcoRequests", "respond");

  const [respondOpen, setRespondOpen] = useState(false);
  const [accessRespondOpen, setAccessRespondOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const { data, loading, error, refresh } = useCompanyArcoRequestDetail(
    companyId,
    requestId,
    canView
  );

  useEffect(() => {
    if (user && !canView) {
      router.push("/sin-acceso");
    }
  }, [user, canView, router]);

  async function handleMarkInProgress() {
    if (!companyId || !requestId) return;
    setStatusLoading(true);
    const res = await patchArcoRequestStatus(companyId, requestId, {
      status: "IN_PROGRESS",
    });
    setStatusLoading(false);
    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
      return;
    }
    toast.success("Solicitud marcada en proceso");
    refresh();
  }

  if (!user || !canView) return null;

  const overdue = data
    ? isArcoRequestOverdue(data.dueDate, data.status)
    : false;
  const daysLeft = data ? getArcoDaysUntilDue(data.dueDate) : null;
  const resolutionDays = data
    ? getArcoResolutionDays(data.createdAt, data.resolvedAt)
    : null;
  const isPending = data?.status === "PENDING";
  const isInProgress = data?.status === "IN_PROGRESS";
  // La acción de resolver/responder solo está disponible (y se muestra) cuando
  // la solicitud ya fue marcada "En proceso". En PENDING se muestra deshabilitada
  // para dejar claro que ese es el paso previo obligatorio.
  const canTakeAction = canRespond && (isPending || isInProgress);
  const canResolve = canRespond && isInProgress;
  const isAccessRequest = data?.requestType === "ACCESS";
  const isResolved = data?.status === "RESOLVED" || data?.status === "REJECTED";

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col bg-[#F8FAFC]">
      {loading && <LoadingCover />}

      <div className="w-full px-5 pt-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <header className="rounded-2xl border border-[#E8EDF7] bg-white px-5 py-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)]">
          <nav className="mb-3 flex flex-wrap items-center gap-2 text-sm text-[#64748B]">
            <Link href="/admin" className="hover:underline">
              Inicio
            </Link>
            <Icon icon="tabler:chevron-right" />
            <Link href="/admin/arco" className="hover:underline">
              Solicitudes ARCO
            </Link>
            <Icon icon="tabler:chevron-right" />
            <span className="font-semibold text-[#1A2B5B]">Detalle</span>
          </nav>

          {data && (
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-[#1A2B5B]">
                    {formatArcoRequestLabel(data.requestType)}
                  </h1>
                  <ArcoRequestStatusBadge status={data.status} overdue={overdue} />
                </div>
                <p className="mt-2 text-sm text-[#64748B]">
                  {ARCO_DOC_TYPE_LABELS[data.docType]} · {data.docNumber}
                </p>
                <p className="mt-3 max-w-2xl text-sm text-[#334155]">
                  {data.description}
                </p>
              </div>

              <CheckPermission group="arcoRequests" permission="respond">
                <div className="flex flex-col items-stretch gap-2 lg:items-end">
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {isPending && (
                      <Button
                        hierarchy="primary"
                        loading={statusLoading}
                        disabled={statusLoading}
                        onClick={handleMarkInProgress}
                        startContent={<Icon icon="tabler:progress" />}
                      >
                        1. Marcar en proceso
                      </Button>
                    )}
                    {canTakeAction && (
                      <Button
                        hierarchy={canResolve ? "primary" : "secondary"}
                        disabled={!canResolve}
                        onClick={() =>
                          isAccessRequest
                            ? setAccessRespondOpen(true)
                            : setRespondOpen(true)
                        }
                        startContent={
                          <Icon
                            icon={
                              isAccessRequest
                                ? "tabler:file-description"
                                : "tabler:message-reply"
                            }
                          />
                        }
                      >
                        {isAccessRequest
                          ? "2. Resolver con informe de acceso"
                          : "2. Responder solicitud"}
                      </Button>
                    )}
                    {isAccessRequest && isResolved && (
                      <Button
                        hierarchy="secondary"
                        onClick={() => setAccessRespondOpen(true)}
                        startContent={<Icon icon="tabler:eye" />}
                      >
                        Ver informe de acceso
                      </Button>
                    )}
                  </div>

                  {isPending && (
                    <p className="flex items-center gap-1.5 text-xs font-medium text-amber-600 lg:justify-end">
                      <Icon icon="tabler:info-circle" className="text-sm" />
                      Primero marca la solicitud “En proceso” para habilitar la
                      resolución.
                    </p>
                  )}
                </div>
              </CheckPermission>
            </div>
          )}
        </header>
      </div>

      <div className="grid gap-4 px-5 py-6 sm:px-6 lg:grid-cols-3 lg:px-8 xl:px-10 2xl:px-12">
        {error && !data && (
          <p className="text-sm text-red-600 lg:col-span-3">{error}</p>
        )}

        {data && (
          <>
            <div className="flex flex-col gap-4 lg:col-span-2">
              <section className="rounded-2xl border border-[#E8EDF7] bg-white p-5">
                <h2 className="mb-4 text-sm font-semibold text-[#1A2B5B]">
                  Plazos y cumplimiento
                </h2>
                <dl className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-[#64748B]">Fecha límite legal</dt>
                    <dd
                      className={clsx(
                        "font-medium",
                        overdue ? "text-red-600" : "text-[#1A2B5B]"
                      )}
                    >
                      {formatArcoDate(data.dueDate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[#64748B]">Creada</dt>
                    <dd className="font-medium text-[#1A2B5B]">
                      {formatArcoDateTime(data.createdAt)}
                    </dd>
                  </div>
                  {data.resolvedAt && (
                    <div>
                      <dt className="text-xs text-[#64748B]">Resuelta</dt>
                      <dd className="font-medium text-[#1A2B5B]">
                        {formatArcoDateTime(data.resolvedAt)}
                      </dd>
                    </div>
                  )}
                  {resolutionDays !== null && (
                    <div>
                      <dt className="text-xs text-[#64748B]">
                        Tiempo de resolución
                      </dt>
                      <dd className="font-medium text-[#1A2B5B]">
                        {resolutionDays} día(s)
                      </dd>
                    </div>
                  )}
                  {daysLeft !== null &&
                    data.status !== "RESOLVED" &&
                    data.status !== "REJECTED" && (
                      <div>
                        <dt className="text-xs text-[#64748B]">Días al plazo</dt>
                        <dd className="font-medium text-[#1A2B5B]">
                          {daysLeft < 0
                            ? `${Math.abs(daysLeft)} día(s) de retraso`
                            : daysLeft === 0
                              ? "Vence hoy"
                              : `${daysLeft} día(s) restantes`}
                        </dd>
                      </div>
                    )}
                </dl>
                {data.regulationSnapshot?.legalReference && (
                  <p className="mt-4 rounded-xl bg-[#F8FAFC] px-3 py-2 text-xs text-[#64748B]">
                    {data.regulationSnapshot.legalReference}
                    {data.regulationSnapshot.dueDays
                      ? ` · Plazo: ${data.regulationSnapshot.dueDays} días`
                      : ""}
                  </p>
                )}
              </section>

              {data.rectificationFields && data.rectificationFields.length > 0 && (
                <section className="rounded-2xl border border-[#E8EDF7] bg-white p-5">
                  <h2 className="mb-4 text-sm font-semibold text-[#1A2B5B]">
                    Campos a rectificar
                  </h2>
                  <ul className="flex flex-col gap-3">
                    {data.rectificationFields.map((field, i) => (
                      <li
                        key={i}
                        className="rounded-xl border border-[#EEF2F8] bg-[#F8FAFC] p-3 text-sm"
                      >
                        <p className="font-medium text-[#1A2B5B]">
                          {fieldLabel(field.field)}
                        </p>
                        {field.currentValue?.trim() ? (
                          <p className="mt-1 text-[#64748B]">
                            Actual:{" "}
                            <span className="text-[#334155]">{field.currentValue}</span>
                          </p>
                        ) : null}
                        <p className="text-[#64748B]">
                          Solicitado:{" "}
                          <span className="font-medium text-primary-900">
                            {formatRectificationValue(
                              field.field,
                              field.requestedValue
                            )}
                          </span>
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {data.oppositionReason && (
                <section className="rounded-2xl border border-[#E8EDF7] bg-white p-5">
                  <h2 className="mb-2 text-sm font-semibold text-[#1A2B5B]">
                    Motivo de oposición
                  </h2>
                  <p className="text-sm text-[#334155]">{data.oppositionReason}</p>
                </section>
              )}

              {isAccessRequest &&
                companyId &&
                (data.accessReport || data.status === "RESOLVED") && (
                  <ArcoAccessReportSection
                    companyId={companyId}
                    requestId={requestId}
                    embeddedReport={data.accessReport}
                  />
                )}

              {data.response && (
                <section className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-5">
                  <h2 className="mb-2 text-sm font-semibold text-emerald-900">
                    Respuesta enviada
                  </h2>
                  <p className="text-sm text-emerald-950">{data.response.message}</p>
                  {data.response.respondedByName && (
                    <p className="mt-2 text-xs text-emerald-800">
                      Por {data.response.respondedByName} ·{" "}
                      {formatArcoDateTime(data.response.respondedAt)}
                    </p>
                  )}
                  {data.response.attachmentUrls &&
                    data.response.attachmentUrls.length > 0 && (
                      <ul className="mt-3 flex flex-col gap-1">
                        {data.response.attachmentUrls.map((url) => (
                          <li key={url}>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-primary-900 underline"
                            >
                              Ver adjunto
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                </section>
              )}

              <section className="rounded-2xl border border-[#E8EDF7] bg-white p-5">
                <h2 className="mb-4 text-sm font-semibold text-[#1A2B5B]">
                  Historial forense
                </h2>
                <ArcoAuditTimeline events={data.audit ?? []} />
              </section>
            </div>

            <aside className="flex flex-col gap-4">
              <section className="rounded-2xl border border-[#E8EDF7] bg-white p-5">
                <h2 className="mb-4 text-sm font-semibold text-[#1A2B5B]">
                  Datos del titular
                </h2>
                {data.personData ? (
                  <dl className="flex flex-col gap-2 text-sm">
                    {data.personData.name && (
                      <div>
                        <dt className="text-xs text-[#64748B]">Nombre</dt>
                        <dd className="font-medium">
                          {[data.personData.name, data.personData.lastName]
                            .filter(Boolean)
                            .join(" ")}
                        </dd>
                      </div>
                    )}
                    {data.personData.email && (
                      <div>
                        <dt className="text-xs text-[#64748B]">Correo</dt>
                        <dd>{data.personData.email}</dd>
                      </div>
                    )}
                    {data.personData.phone && (
                      <div>
                        <dt className="text-xs text-[#64748B]">Teléfono</dt>
                        <dd>{data.personData.phone}</dd>
                      </div>
                    )}
                  </dl>
                ) : (
                  <p className="text-sm text-[#64748B]">Sin datos adicionales.</p>
                )}
                {data.consentStatus && (
                  <p className="mt-4 rounded-lg bg-[#F8FAFC] px-3 py-2 text-xs text-[#64748B]">
                    Consentimiento:{" "}
                    <span className="font-medium text-[#1A2B5B]">
                      {data.consentStatus}
                    </span>
                  </p>
                )}
              </section>

              {data.notifiedAt && (
                <section className="rounded-2xl border border-[#E8EDF7] bg-white p-5 text-sm">
                  <p className="text-xs text-[#64748B]">Notificación a encargados</p>
                  <p className="font-medium text-[#1A2B5B]">
                    {formatArcoDateTime(data.notifiedAt)}
                  </p>
                </section>
              )}
            </aside>
          </>
        )}
      </div>

      {companyId && (
        <>
          <ArcoRespondDialog
            open={respondOpen}
            companyId={companyId}
            requestId={requestId}
            requestType={data?.requestType}
            rectificationFields={data?.rectificationFields}
            onClose={() => setRespondOpen(false)}
            onSuccess={refresh}
          />
          <ArcoAccessRespondDialog
            open={accessRespondOpen}
            companyId={companyId}
            requestId={requestId}
            onClose={() => setAccessRespondOpen(false)}
            onSuccess={refresh}
          />
        </>
      )}
    </div>
  );
}
