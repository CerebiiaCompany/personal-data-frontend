import LoadingCover from "../layout/LoadingCover";
import { formatDateToString } from "@/utils/date.utils";
import {
  parseActionLogTargetModelToString,
  UserActionLog,
  UserActionLogType,
} from "@/types/userActionLogs.types";
import { Icon } from "@iconify/react/dist/iconify.js";

interface Props {
  items: UserActionLog[] | null;
}

function parseUserActionLogTypeToIconName(type: UserActionLogType): string {
  switch (type) {
    case "CREATE":
      return "tabler:plus";
    case "UPDATE":
      return "material-symbols:edit-outline";
    case "DELETE":
      return "bx:trash";
    default:
      return "tabler:question-mark";
  }
}

const UserActionLogsTable = ({ items }: Props) => {
  return (
    <div className="w-full overflow-x-auto flex-1 relative min-h-20">
      {items?.length ? (
        <table className="w-full border-separate table-auto border-spacing-y-2">
          <thead>
            <tr>
              <th
                scope="col"
                className="text-left font-bold text-primary-900 text-xs py-2 px-3 w-min"
              >
                Usuario
              </th>
              <th
                scope="col"
                className="text-center font-bold text-primary-900 text-xs py-2 px-3"
              >
                Fecha
              </th>
              <th
                scope="col"
                className="text-center font-bold text-primary-900 text-xs py-2 px-3"
              >
                Última actividad
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item._id}
                className="align-middle text-center text-sm text-stone-600 rounded-md"
              >
                <td className="px-2 font-medium text-ellipsis rounded-l-md">
                  <div className="flex items-center gap-2">
                    <div
                      className={
                        "bg-primary-900 w-9 h-9 aspect-square grid place-content-center text-white font-bold rounded-md"
                      }
                    >
                      {item.user?.name[0]}
                      {item.user?.lastName[0]}
                    </div>
                    <p>
                      {item.user?.name.split(" ")[0]}{" "}
                      {item.user?.lastName.split(" ")[0]}
                    </p>
                  </div>
                </td>
                <td className="px-2 font-medium text-ellipsis">
                  <div className="flex items-center justify-center">
                    {formatDateToString({
                      date: item.createdAt,
                    })}
                  </div>
                </td>
                <td className="px-2 font-medium text-ellipsis rounded-r-md">
                  <div className="flex items-center justify-center rounded-md p-1 gap-1">
                    <Icon
                      icon={parseUserActionLogTypeToIconName(item.type)}
                      className="text-sm"
                    />
                    <p className="text-sm font-medium">
                      {parseActionLogTargetModelToString(item.targetModel)}
                    </p>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  );
};

export default UserActionLogsTable;
