import clsx from "clsx";

const NAVY = "#1A2B5B";
const TOTAL_BLUE = "#2563EB";

const cardClass =
  "rounded-xl border border-[#E8EDF7] bg-white p-6 sm:p-8 shadow-sm";

function SummaryItem({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#94A3B8]">
        {label}
      </dt>
      <dd
        className={clsx(
          "text-sm font-bold leading-snug text-[#0F172A] break-words",
          valueClassName
        )}
      >
        {value}
      </dd>
    </div>
  );
}

export interface CampaignReviewSummary {
  goalLabel: string;
  formularioLabel: string;
  generoLabel: string;
  nombreCampaña: string;
  canalLabel: string;
  audienciaDestinatarios: number;
  rangoEdadLabel: string;
  /** Texto completo de la fila TOTAL, ej. COP 571 (571 créditos) */
  totalLine: string;
}

interface Props {
  summary: CampaignReviewSummary;
}

export default function CreateScheduledCampaignStep4({ summary }: Props) {
  const nombreDisplay = summary.nombreCampaña?.trim()
    ? summary.nombreCampaña.trim()
    : "—";

  return (
    <section className={clsx(cardClass, "flex flex-col gap-8")}>
      <h2
        className="text-[15px] font-bold tracking-tight"
        style={{ color: NAVY }}
      >
        Resumen de campaña
      </h2>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-x-14 sm:gap-y-8">
        <div className="flex flex-col gap-6 sm:gap-7">
          <SummaryItem label="Objetivo" value={summary.goalLabel} />
          <SummaryItem label="Formulario" value={summary.formularioLabel} />
          <SummaryItem label="Género" value={summary.generoLabel} />
          <SummaryItem label="Nombre" value={nombreDisplay} />
        </div>
        <div className="flex flex-col gap-6 sm:gap-7">
          <SummaryItem label="Canal" value={summary.canalLabel} />
          <SummaryItem
            label="Audiencia"
            value={`${summary.audienciaDestinatarios.toLocaleString("es-CO")} destinatarios`}
          />
          <SummaryItem label="Rango edad" value={summary.rangoEdadLabel} />
          <div className="flex flex-col gap-1 min-w-0">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#94A3B8]">
              Total
            </dt>
            <dd
              className="text-sm font-bold leading-snug break-words"
              style={{ color: TOTAL_BLUE }}
            >
              {summary.totalLine}
            </dd>
          </div>
        </div>
      </div>
    </section>
  );
}
