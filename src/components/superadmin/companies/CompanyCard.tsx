import { formatDateToString } from "@/utils/date.utils";
import React, { useMemo } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Company, COMPANY_COUNTRY_CODE_OPTIONS } from "@/types/company.types";

interface Props {
  data: Company;
  deleteHandler: (id: string) => void;
  onEditCountry?: (company: Company) => void;
}

const COUNTRY_FLAGS: Record<string, string> = {
  CO: "🇨🇴",
  CL: "🇨🇱",
};

interface InfoRowProps {
  icon: string;
  label: string;
  value?: string;
}

const InfoRow = ({ icon, label, value }: InfoRowProps) => (
  <div className="flex items-center gap-3">
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
      <Icon icon={icon} className="text-base" />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p
        className="truncate text-sm font-semibold text-primary-900"
        title={value}
      >
        {value || "—"}
      </p>
    </div>
  </div>
);

const CompanyCard = ({ data, onEditCountry }: Props) => {
  const countryLabel =
    COMPANY_COUNTRY_CODE_OPTIONS.find((o) => o.value === data.countryCode)
      ?.title ??
    data.countryCode ??
    "—";

  const countryFlag = data.countryCode ? COUNTRY_FLAGS[data.countryCode] : "";

  const initial = data.name?.trim().charAt(0).toUpperCase() || "?";

  const formattedDate = useMemo(
    () =>
      formatDateToString({
        date: data.createdAt,
        format: "DD/MM/YYYY",
      }),
    [data.createdAt]
  );

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-primary-50 bg-white shadow-[0_4px_20px_-10px_rgba(0,11,80,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-primary-500/30 hover:shadow-[0_20px_44px_-18px_rgba(0,11,80,0.4)]">
      {/* Barra de acento superior */}
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-900 via-primary-500 to-primary-300" />

      {/* Encabezado */}
      <div className="flex items-start gap-3 p-5 pb-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-900 to-primary-500 text-lg font-bold text-white shadow-md shadow-primary-500/30">
          {initial}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <h4
            className="truncate text-lg font-semibold leading-tight text-primary-900"
            title={data.name}
          >
            {data.name}
          </h4>
          {data.plan?.name && (
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
              <Icon icon="tabler:crown" className="text-sm" />
              {data.plan.name}
            </span>
          )}
        </div>
      </div>

      <div className="h-px w-full bg-slate-100" />

      {/* Datos */}
      <div className="flex flex-1 flex-col gap-3.5 p-5 pt-4">
        <InfoRow icon="tabler:calendar-event" label="Creada" value={formattedDate} />
        <InfoRow
          icon="tabler:world"
          label="País"
          value={countryFlag ? `${countryFlag} ${countryLabel}` : countryLabel}
        />
        <InfoRow
          icon="tabler:id-badge-2"
          label={data.countryCode === "CL" ? "RUT" : "NIT"}
          value={data.nit}
        />
        <InfoRow icon="tabler:mail" label="Correo" value={data.email} />
        <InfoRow icon="tabler:phone" label="Teléfono" value={data.phone} />
      </div>

      {/* Acciones */}
      {onEditCountry && (
        <div className="p-5 pt-0">
          <button
            type="button"
            onClick={() => onEditCountry(data)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary-50 bg-white py-2.5 text-sm font-semibold text-primary-700 transition-all hover:border-primary-500/40 hover:bg-primary-50"
          >
            <Icon icon="tabler:world" className="text-base" />
            Editar país
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(CompanyCard);
