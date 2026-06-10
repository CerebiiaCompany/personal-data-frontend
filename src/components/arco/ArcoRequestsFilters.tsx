"use client";

import { ArcoOfficerUser } from "@/types/arco.admin.types";
import {
  ARCO_REQUEST_STATUS_LABELS,
  ARCO_REQUEST_TYPE_LABELS,
  ArcoRequestStatus,
  ArcoRequestType,
} from "@/types/arco.types";
import { Icon } from "@iconify/react/dist/iconify.js";

export interface ArcoRequestsFilterValues {
  status: ArcoRequestStatus | "";
  requestType: ArcoRequestType | "";
  docNumber: string;
  assignedToId: string;
  dateFrom: string;
  dateTo: string;
}

interface Props {
  values: ArcoRequestsFilterValues;
  officers: ArcoOfficerUser[];
  inputClass: string;
  onChange: (patch: Partial<ArcoRequestsFilterValues>) => void;
}

const ArcoRequestsFilters = ({
  values,
  officers,
  inputClass,
  onChange,
}: Props) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#64748B]">Estado</label>
        <select
          value={values.status}
          onChange={(e) =>
            onChange({ status: e.target.value as ArcoRequestStatus | "" })
          }
          className={inputClass}
        >
          <option value="">Todos</option>
          {(Object.keys(ARCO_REQUEST_STATUS_LABELS) as ArcoRequestStatus[]).map(
            (s) => (
              <option key={s} value={s}>
                {ARCO_REQUEST_STATUS_LABELS[s]}
              </option>
            )
          )}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#64748B]">Tipo</label>
        <select
          value={values.requestType}
          onChange={(e) =>
            onChange({ requestType: e.target.value as ArcoRequestType | "" })
          }
          className={inputClass}
        >
          <option value="">Todos</option>
          {(Object.keys(ARCO_REQUEST_TYPE_LABELS) as ArcoRequestType[]).map(
            (t) => (
              <option key={t} value={t}>
                {ARCO_REQUEST_TYPE_LABELS[t]}
              </option>
            )
          )}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#64748B]">Documento</label>
        <div className="relative">
          <Icon
            icon="tabler:search"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
          />
          <input
            type="text"
            value={values.docNumber}
            onChange={(e) => onChange({ docNumber: e.target.value })}
            placeholder="Buscar por número..."
            className={`${inputClass} pl-9`}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#64748B]">Asignado a</label>
        <select
          value={values.assignedToId}
          onChange={(e) => onChange({ assignedToId: e.target.value })}
          className={inputClass}
        >
          <option value="">Todos</option>
          {officers.map((o) => (
            <option key={o.userId} value={o.userId}>
              {[o.name, o.lastName].filter(Boolean).join(" ")}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#64748B]">Desde</label>
        <input
          type="date"
          value={values.dateFrom}
          onChange={(e) => onChange({ dateFrom: e.target.value })}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#64748B]">Hasta</label>
        <input
          type="date"
          value={values.dateTo}
          onChange={(e) => onChange({ dateTo: e.target.value })}
          className={inputClass}
        />
      </div>
    </div>
  );
};

export default ArcoRequestsFilters;

export const emptyArcoRequestsFilters: ArcoRequestsFilterValues = {
  status: "",
  requestType: "",
  docNumber: "",
  assignedToId: "",
  dateFrom: "",
  dateTo: "",
};
