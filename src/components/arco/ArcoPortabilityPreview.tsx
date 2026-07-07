import { PortabilityExportData } from "@/types/arco.types";
import { formatArcoDateTime } from "@/utils/arcoAdmin.utils";
import {
  parseUserGenderToString,
  UserGender,
} from "@/types/collectFormResponse.types";
import { Icon } from "@iconify/react/dist/iconify.js";

interface Props {
  data: PortabilityExportData;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  CC: "Cédula de ciudadanía",
  TI: "Tarjeta de identidad",
  NIT: "NIT",
  RUT: "RUT",
  CI: "Cédula de identidad",
  PASSPORT: "Pasaporte",
  OTHER: "Otro",
};

function docTypeLabel(code: string): string {
  return DOC_TYPE_LABELS[code] ?? code;
}

function countryLabel(code: string): string {
  if (code === "CL") return "Chile";
  if (code === "CO") return "Colombia";
  return code;
}

function formatGender(value?: string): string | undefined {
  if (!value) return undefined;
  if (["MALE", "FEMALE", "OTHER"].includes(value)) {
    return parseUserGenderToString(value as UserGender);
  }
  return value;
}

/**
 * Vista de solo lectura del export de portabilidad (Ley 21.719, Chile).
 * Muestra únicamente los datos del titular; el detalle del tratamiento se cubre
 * por separado en el derecho de acceso.
 */
const ArcoPortabilityPreview = ({ data }: Props) => {
  const pd = data.personalData;
  const fullName = [pd.name, pd.lastName].filter(Boolean).join(" ");
  const gender = formatGender(pd.gender);

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-[#EEF3FF] px-3 py-2 text-xs font-medium text-primary-900">
        <span className="flex items-center gap-1.5">
          <Icon icon="tabler:package-export" />
          Copia de datos personales · {countryLabel(data.countryCode)}
        </span>
        <span className="text-primary-600">· {data.companyName}</span>
      </div>

      <dl className="grid gap-2 rounded-xl border border-[#EEF2F8] bg-[#F8FAFC] p-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-[#64748B]">Documento</dt>
          <dd className="font-medium text-[#1A2B5B]">
            {docTypeLabel(pd.docType)} · {pd.docNumber}
          </dd>
        </div>
        {fullName && (
          <div>
            <dt className="text-xs text-[#64748B]">Nombre</dt>
            <dd className="font-medium text-[#1A2B5B]">{fullName}</dd>
          </div>
        )}
        {pd.razonSocial && (
          <div>
            <dt className="text-xs text-[#64748B]">Razón social</dt>
            <dd className="font-medium text-[#1A2B5B]">{pd.razonSocial}</dd>
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
        {gender && (
          <div>
            <dt className="text-xs text-[#64748B]">Género</dt>
            <dd>{gender}</dd>
          </div>
        )}
        {pd.age !== undefined && pd.age !== null && (
          <div>
            <dt className="text-xs text-[#64748B]">Edad</dt>
            <dd>{pd.age}</dd>
          </div>
        )}
      </dl>

      <p className="text-xs text-[#64748B]">
        Generado el {formatArcoDateTime(data.exportedAt)}
      </p>
    </div>
  );
};

export default ArcoPortabilityPreview;
