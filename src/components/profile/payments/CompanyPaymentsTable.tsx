import React from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { CompanyRole } from "@/types/companyRole.types";
import { useSessionStore } from "@/store/useSessionStore";
import { deleteCompanyRole } from "@/lib/companyRole.api";
import { parseApiError } from "@/utils/parseApiError";
import { toast } from "sonner";
import Link from "next/link";
import LoadingCover from "@/components/layout/LoadingCover";
import { CompanyPayment } from "@/types/payment.types";
import { formatDateToString } from "@/utils/date.utils";
import {
  parsePeriodTypeToString,
  planPeriodTypeOptions,
} from "@/types/plan.types";

interface Props {
  items: CompanyPayment[] | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const CompanyPaymentsTable = ({ items, loading, error, refresh }: Props) => {
  const user = useSessionStore((store) => store.user);

  return (
    <div className="w-full overflow-x-auto flex-1 relative min-h-20">
      {loading && <LoadingCover />}

      {items && (
        <table className="w-full table-auto border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th
                scope="col"
                className="text-center font-medium text-stone-600 text-xs py-2 px-3 w-1/6"
              >
                Periodo Facturado
              </th>
              <th
                scope="col"
                className="text-center font-medium text-stone-600 text-xs py-2 px-3 w-1/6"
              >
                Créditos usados
              </th>
              <th
                scope="col"
                className="text-center font-medium text-stone-600 text-xs py-2 px-3 w-1/6"
              >
                Plan
              </th>
              <th
                scope="col"
                className="text-center font-medium text-stone-600 text-xs py-2 px-3 w-1/6"
              >
                Estado del pago
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className="align-middle text-center">
                <td className="py-3 px-4 bg-primary-50 font-medium text-ellipsis rounded-l-xl">
                  {formatDateToString({ date: item.period.start })}-
                  {formatDateToString({ date: item.period.end })}
                </td>
                <td className="py-3 px-4 bg-primary-50 font-medium text-ellipsis">
                  350
                </td>
                <td className="py-3 px-4 bg-primary-50 font-medium text-ellipsis">
                  {parsePeriodTypeToString(item.periodType)}
                </td>

                <td className="py-3 px-4 bg-primary-50 font-medium text-ellipsis rounded-r-xl">
                  {String(item.active) ? "Vigente" : "Vencido"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default CompanyPaymentsTable;
