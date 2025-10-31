import React, { useEffect, useState } from "react";
import LoadingCover from "../layout/LoadingCover";
import { 
  Campaign, 
  campaignGoalLabels, 
  campaignStatusLabels, 
  campaignStatusColors,
  deliveryChannelLabels 
} from "@/types/campaign.types";
import CustomCheckbox from "../forms/CustomCheckbox";
import { formatDateToString } from "@/utils/date.utils";
import Button from "../base/Button";
import CustomToggle from "../forms/CustomToggle";
import { updateCampaign } from "@/lib/campaign.api";
import { useSessionStore } from "@/store/useSessionStore";
import { toast } from "sonner";
import { parseApiError } from "@/utils/parseApiError";
import { useAppSettingsStore } from "@/store/useAppSettingsStore";
import { useAppSetting } from "@/hooks/useAppSetting";
import { showDialog } from "@/utils/dialogs.utils";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { useConfirm } from "../dialogs/ConfirmProvider";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";

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
  const confirm = useConfirm();
  const [localItems, setLocalItems] = useState<Campaign[] | null>(null);

  const user = useSessionStore((store) => store.user);

  useEffect(() => {
    // populate local items on start
    if (items) {
      setLocalItems(items);
    }
  }, [items]);

  async function updateCampaignStatus(id: string, value: boolean) {
    if (value === false) {
      return toast.warning("No puedes desactivar una campaña en proceso");
    }

    const confirmation = await confirm({
      title: "¿Estás seguro de activar la campaña?",
      confirmText: "Activar campaña",
      description: (
        <>
          Una vez activada, la campaña se comenzará a enviar a la audiencia y{" "}
          <b>
            no se podrá desactivar hasta que haya terminado su programación.
          </b>
        </>
      ),
    });

    if (!confirmation) return;

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

    return toast.success("Campaña activada");
  }

  const pricePerSMS = useAppSetting("SMS_PRICE_PER_MESSAGE");

  // Función helper para obtener la fecha de programación
  const getScheduledDate = (item: Campaign): string => {
    if (item.scheduledFor) {
      return formatDateToString({ date: item.scheduledFor });
    }
    if (item.scheduling?.scheduledDateTime) {
      return formatDateToString({ date: item.scheduling.scheduledDateTime });
    }
    if (item.scheduling?.startDate && item.scheduling?.endDate) {
      return `${formatDateToString({ date: item.scheduling.startDate })} - ${formatDateToString({ date: item.scheduling.endDate })}`;
    }
    return "—";
  };

  return (
    <div className="w-full overflow-x-auto flex-1 relative min-h-20">
      {loading && <LoadingCover />}

      {localItems ? (
        localItems.length ? (
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
                  Objetivo
                </th>
                <th
                  scope="col"
                  className="text-center font-bold text-primary-900 text-xs py-2 px-3"
                >
                  Fecha programada
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
                  Créditos Estimados
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
              {localItems.map((item) => {
                const status = item.status || "DRAFT";
                const audienceTotal = item.audience.total ?? item.audience.count ?? 0;
                const audienceDelivered = item.audience.delivered ?? 0;
                const credits = pricePerSMS.data 
                  ? (pricePerSMS.data.value as number) * audienceTotal 
                  : null;

                return (
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
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-semibold">{item.name}</span>
                        {item.content?.name && (
                          <span className="text-xs text-stone-500">{item.content.name}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 bg-white font-medium text-ellipsis">
                      {item.goal ? (
                        <div className="flex items-center justify-center gap-1">
                          <Icon 
                            icon={
                              item.goal === "SALES" ? "tabler:basket-bolt" :
                              item.goal === "INTERACTION" ? "tabler:message-share" :
                              item.goal === "POTENTIAL_CUSTOMERS" ? "tabler:user-share" :
                              item.goal === "PROMOTION" ? "tabler:speakerphone" :
                              "icon-park-outline:other"
                            }
                            className="text-lg"
                          />
                          <span className="text-sm">
                            {campaignGoalLabels[item.goal] || item.goal}
                          </span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 px-4 bg-white font-medium text-ellipsis">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm">{getScheduledDate(item)}</span>
                        {item.scheduling?.scheduledDateTime && (
                          <span className="text-xs text-stone-500">
                            {new Date(item.scheduling.scheduledDateTime).toLocaleTimeString("es-CO", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 bg-white font-medium text-ellipsis">
                      <div className="flex items-center justify-center gap-1">
                        <Icon 
                          icon={item.deliveryChannel === "SMS" ? "tabler:device-mobile-message" : "tabler:mail"}
                          className="text-lg"
                        />
                        <span>{deliveryChannelLabels[item.deliveryChannel] || item.deliveryChannel}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 bg-white font-medium text-ellipsis">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-semibold">
                          {audienceDelivered}/{audienceTotal}
                        </span>
                        <span className="text-xs text-stone-500">
                          Entregados / Total
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 bg-white font-medium text-ellipsis">
                      {credits !== null ? (
                        <span className="font-semibold">{credits} Créditos</span>
                      ) : (
                        <p className="text-stone-400">...</p>
                      )}
                    </td>
                    <td className="py-3 px-4 bg-white font-medium text-ellipsis rounded-r-md">
                      <div className="flex flex-col items-center justify-center gap-2 h-full">
                        <Button className="text-xs w-full py-1.5!" href={`/admin/campanas/${item._id}`}>
                          Ver detalle
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-center">No hay campañas para mostrar</p>
        )
      ) : null}

      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default CampaignsTable;
