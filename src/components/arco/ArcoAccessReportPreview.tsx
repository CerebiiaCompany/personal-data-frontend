import {
  ArcoAccessReportAutoPopulated,
  ArcoAccessReportFull,
} from "@/types/arco.admin.types";
import ArcoConsentStatusBadge from "@/components/arco/ArcoConsentStatusBadge";
import {
  ARCO_DOC_TYPE_LABELS,
  formatArcoDateTime,
  isArcoConsentLegacyRecord,
  isArcoDataOriginFromSystem,
} from "@/utils/arcoAdmin.utils";
import { Icon } from "@iconify/react/dist/iconify.js";

type ReportData = ArcoAccessReportAutoPopulated | ArcoAccessReportFull;

interface Props {
  report: ReportData;
  showOfficerSection?: boolean;
  /** Si false, oculta origen (se captura en formulario del oficial). Por defecto: según dataOriginRaw */
  showDataOrigin?: boolean;
  hideConsentSection?: boolean;
  hideProcessingPurposesSection?: boolean;
}

function countryLabel(code: string) {
  if (code === "CL") return "Chile";
  if (code === "CO") return "Colombia";
  return code;
}

const ArcoAccessReportPreview = ({
  report,
  showOfficerSection = true,
  showDataOrigin,
  hideConsentSection = false,
  hideProcessingPurposesSection = false,
}: Props) => {
  const full = report as ArcoAccessReportFull;
  const pd = report.personalData;
  const displayDataOrigin =
    showDataOrigin ??
    (Boolean(report.dataOrigin) &&
      (showOfficerSection || isArcoDataOriginFromSystem(report.dataOriginRaw)));

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex items-center gap-2 rounded-xl bg-[#EEF3FF] px-3 py-2 text-xs font-medium text-primary-900">
        <Icon icon="tabler:world" />
        Informe de acceso · {countryLabel(report.countryCode)}
      </div>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
          Datos personales almacenados
        </h3>
        <dl className="grid gap-2 rounded-xl border border-[#EEF2F8] bg-[#F8FAFC] p-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-[#64748B]">Documento</dt>
            <dd className="font-medium text-[#1A2B5B]">
              {ARCO_DOC_TYPE_LABELS[pd.docType]} · {pd.docNumber}
            </dd>
          </div>
          {(pd.name || pd.lastName) && (
            <div>
              <dt className="text-xs text-[#64748B]">Nombre</dt>
              <dd className="font-medium text-[#1A2B5B]">
                {[pd.name, pd.lastName].filter(Boolean).join(" ")}
              </dd>
            </div>
          )}
          {pd.email && (
            <div>
              <dt className="text-xs text-[#64748B]">Correo</dt>
              <dd>{pd.email}</dd>
            </div>
          )}
          {pd.phone && (
            <div>
              <dt className="text-xs text-[#64748B]">Teléfono</dt>
              <dd>{pd.phone}</dd>
            </div>
          )}
        </dl>
      </section>

      {displayDataOrigin && report.dataOrigin && (
        <section>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            Origen de los datos
          </h3>
          <p className="rounded-xl border border-[#EEF2F8] bg-white p-3 text-[#334155]">
            {report.dataOrigin}
          </p>
          {isArcoDataOriginFromSystem(report.dataOriginRaw) && (
            <p className="mt-1 text-xs text-[#64748B]">
              Registrado en el sistema al momento del consentimiento.
            </p>
          )}
        </section>
      )}

      {report.consentInfo && !hideConsentSection && (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            Consentimiento y política
          </h3>
          {isArcoConsentLegacyRecord(report.consentInfo) && (
            <p className="mb-3 flex gap-2 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-xs leading-relaxed text-amber-950">
              <Icon
                icon="tabler:alert-triangle"
                className="mt-0.5 shrink-0 text-base text-amber-700"
              />
              Registro antiguo sin consentimiento formal en el sistema. Verifique la
              base legal del tratamiento antes de resolver la solicitud de acceso.
            </p>
          )}
          <dl className="flex flex-col gap-2 rounded-xl border border-[#EEF2F8] bg-white p-3">
            <div>
              <dt className="mb-1 text-xs text-[#64748B]">Estado</dt>
              <dd>
                <ArcoConsentStatusBadge consent={report.consentInfo} />
              </dd>
            </div>
            {report.consentInfo.acceptedAt && (
              <div>
                <dt className="text-xs text-[#64748B]">Aceptado</dt>
                <dd>{formatArcoDateTime(report.consentInfo.acceptedAt)}</dd>
              </div>
            )}
            {report.consentInfo.collectionPoint && (
              <div>
                <dt className="text-xs text-[#64748B]">Punto de recolección</dt>
                <dd>{report.consentInfo.collectionPoint}</dd>
              </div>
            )}
            {report.consentInfo.policyName && (
              <div>
                <dt className="text-xs text-[#64748B]">Política</dt>
                <dd>
                  {report.consentInfo.policyName}
                  {report.consentInfo.policyVersionLabel
                    ? ` (${report.consentInfo.policyVersionLabel})`
                    : ""}
                </dd>
              </div>
            )}
            {report.consentInfo.policyFileUrl && (
              <a
                href={report.consentInfo.policyFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary-900 underline"
              >
                Ver política de privacidad
              </a>
            )}
          </dl>
        </section>
      )}

      {!hideProcessingPurposesSection &&
        report.processingPurposes &&
        report.processingPurposes.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            Finalidad del tratamiento
          </h3>
          <ul className="flex flex-col gap-2">
            {report.processingPurposes.map((p, i) => (
              <li
                key={i}
                className="rounded-xl border border-[#EEF2F8] bg-white px-3 py-2"
              >
                <span className="font-medium text-[#1A2B5B]">{p.dataType}</span>
                <span className="text-[#64748B]"> — </span>
                <span className="text-[#334155]">{p.purpose}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {report.internationalTransfers !== undefined && (
        <section>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            Transferencias internacionales
          </h3>
          <p className="rounded-xl border border-[#EEF2F8] bg-white p-3 text-[#334155]">
            {report.internationalTransfers.occurs
              ? report.internationalTransfers.details ?? "Sí se realizan transferencias"
              : "No se realizan transferencias internacionales"}
          </p>
        </section>
      )}

      {showOfficerSection && full.thirdParties && full.thirdParties.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            Terceros con quienes se compartió
          </h3>
          <ul className="list-inside list-disc rounded-xl border border-[#EEF2F8] bg-white p-3 text-[#334155]">
            {full.thirdParties.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </section>
      )}

      {showOfficerSection && full.retentionPeriod && (
        <section>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            Plazo de conservación
          </h3>
          <p className="rounded-xl border border-[#EEF2F8] bg-white p-3 text-[#334155]">
            {full.retentionPeriod}
          </p>
        </section>
      )}

      {showOfficerSection && full.automatedDecisions !== undefined && (
        <section>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
            Decisiones automatizadas
          </h3>
          <p className="rounded-xl border border-[#EEF2F8] bg-white p-3 text-[#334155]">
            {full.automatedDecisions.occurs
              ? full.automatedDecisions.description ?? "Sí aplican"
              : "No se aplican decisiones automatizadas"}
          </p>
        </section>
      )}
    </div>
  );
};

export default ArcoAccessReportPreview;
