import { SessionUser } from "@/types/user.types";
import React, { useEffect, useMemo, useState } from "react";
import LoadingCover from "../layout/LoadingCover";
import { Icon } from "@iconify/react/dist/iconify.js";
import { CompanyArea } from "@/types/companyArea.types";
import { getCountryData } from "@/utils/country.utils";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { showDialog } from "@/utils/dialogs.utils";
import { Campaign } from "@/types/campaign.types";
import CustomCheckbox from "../forms/CustomCheckbox";
import { formatDateToString } from "@/utils/date.utils";
import Button from "../base/Button";
import CustomToggle from "../forms/CustomToggle";
import { updateCampaign } from "@/lib/campaign.api";
import { useSessionStore } from "@/store/useSessionStore";
import { toast } from "sonner";
import { parseApiError } from "@/utils/parseApiError";

interface Props {
  items: Campaign[] | null;
  loading: boolean;
  error: string | null;
  toggleSelected: (id: string) => void;
  selectedIds: string[];
}

const CampaignsTable = ({
  items,
  loading,
  error,
  toggleSelected,
  selectedIds,
}: Props) => {
  const [localItems, setLocalItems] = useState<Campaign[] | null>(null);

  const user = useSessionStore((store) => store.user);

  useEffect(() => {
    // populate local items on start
    if (items) {
      setLocalItems(items);
    }
  }, [items]);

  async function updateCampaignStatus(id: string, value: boolean) {
    if (!localItems) return;
    if (!user?.companyUserData?.companyId) return;
    const res = await updateCampaign(user?.companyUserData?.companyId, id, {
      active: value,
    });

    if (res.error) {
      return toast.error(parseApiError(res.error));
    }

    const newItems = [...localItems];
    const index = newItems.findIndex((e) => e._id === id);
    newItems[index].active = value;
    setLocalItems(newItems);

    return toast.success("Campaña actualizada");
  }

  return (
    <div className="w-full overflow-x-auto flex-1 relative min-h-20">
      {loading && <LoadingCover />}

      {localItems && (
        <table className="w-full border-separate table-auto border-spacing-y-2 p-2">
          <thead>
            <tr>
              <th
                scope="col"
                className="text-center font-bold text-primary-900 text-xs py-2 px-3 w-min"
              >
                Seleccionar
              </th>
              <th
                scope="col"
                className="text-center font-bold text-primary-900 text-xs py-2 px-3"
              >
                Estado
              </th>
              <th
                scope="col"
                className="text-center font-bold text-primary-900 text-xs py-2 px-3"
              >
                Campaña
              </th>
              <th
                scope="col"
                className="text-center font-bold text-primary-900 text-xs py-2 px-3"
              >
                Fecha de entrega
              </th>
              <th
                scope="col"
                className="text-center font-bold text-primary-900 text-xs py-2 px-3"
              >
                Ruta de envío
              </th>
              <th
                scope="col"
                className="text-center font-bold text-primary-900 text-xs py-2 px-3"
              >
                Alcance
              </th>
              <th
                scope="col"
                className="text-center font-bold text-primary-900 text-xs py-2 px-3"
              >
                Créditos
              </th>
              <th
                scope="col"
                className="text-center font-bold text-primary-900 text-xs py-2 px-3 w-1/6"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {localItems.map((item) => (
              <tr
                key={item._id}
                className="align-middle text-center shadow-lg rounded-md"
              >
                <td className="py-3 px-4 bg-white font-medium text-ellipsis rounded-l-md">
                  <div className="flex items-center justify-center">
                    <CustomCheckbox
                      onClick={(_) => toggleSelected(item._id)}
                      readOnly
                      checked={selectedIds.includes(item._id)}
                    />
                  </div>
                </td>
                <td className="py-3 px-4 bg-white font-medium text-ellipsis">
                  <div className="flex items-center justify-center">
                    <CustomToggle
                      readOnly
                      onClick={(_) =>
                        updateCampaignStatus(item._id, !item.active)
                      }
                      checked={item.active}
                    />
                  </div>
                </td>
                <td className="py-3 px-4 bg-white font-medium text-ellipsis">
                  {item.name}
                </td>
                <td className="py-3 px-4 bg-white font-medium text-ellipsis">
                  {formatDateToString({ date: item.scheduling.endDate })}
                </td>
                <td className="py-3 px-4 bg-white font-medium text-ellipsis">
                  {item.deliveryChannel}
                </td>
                <td className="py-3 px-4 bg-white font-medium text-ellipsis">
                  100
                </td>
                <td className="py-3 px-4 bg-white font-medium text-ellipsis">
                  250
                </td>
                <td className="py-3 px-4 bg-white font-medium text-ellipsis rounded-r-md">
                  <div className="flex flex-col items-center justify-center gap-2 h-full">
                    <Button className="text-xs w-full py-1.5!">
                      Ver detalle
                    </Button>
                    <div className="text-xs w-full py-1.5 rounded-lg border border-primary-500 font-semibold text-primary-500">
                      En proceso
                    </div>
                  </div>
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

export default CampaignsTable;
