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
    <div className="w-full flex-1 relative min-h-20">
      {items?.length ? (
        <ul className="flex flex-col gap-2.5">
          {items.map((item) => (
            <li
              key={item._id}
              className="rounded-xl border border-[#E6ECF7] bg-[#FAFCFF] px-3 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <div className="bg-[#15367C] w-8 h-8 aspect-square grid place-content-center text-white font-bold rounded-md text-[11px]">
                  {item.user?.name[0]}
                  {item.user?.lastName[0]}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#152F63] text-ellipsis">
                    {item.user?.name.split(" ")[0]} {item.user?.lastName.split(" ")[0]}
                  </p>
                  <p className="text-xs text-[#6A7EA7] text-ellipsis">
                    {parseActionLogTargetModelToString(item.targetModel)}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-[#5974A8]">
                  <Icon
                    icon={parseUserActionLogTypeToIconName(item.type)}
                    className="text-sm"
                  />
                  <span className="text-xs whitespace-nowrap">
                    {formatDateToString({
                      date: item.createdAt,
                    })}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export default UserActionLogsTable;
