import { ArcoAuditEvent } from "@/types/arco.admin.types";
import {
  formatArcoDateTime,
  parseArcoAuditTypeLabel,
} from "@/utils/arcoAdmin.utils";
import { Icon } from "@iconify/react/dist/iconify.js";

interface Props {
  events: ArcoAuditEvent[];
}

const ArcoAuditTimeline = ({ events }: Props) => {
  if (!events.length) {
    return (
      <p className="text-sm text-[#64748B]">Sin eventos de auditoría registrados.</p>
    );
  }

  const sorted = [...events].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
  );

  return (
    <ol className="relative border-l border-[#E2E8F0] pl-6">
      {sorted.map((event, index) => (
        <li key={`${event.type}-${event.at}-${index}`} className="mb-6 last:mb-0">
          <span className="absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full bg-white ring-2 ring-primary-500">
            <Icon icon="tabler:point-filled" className="text-[10px] text-primary-600" />
          </span>
          <p className="text-sm font-semibold text-[#1A2B5B]">
            {parseArcoAuditTypeLabel(event.type)}
          </p>
          <p className="mt-0.5 text-xs text-[#64748B]">
            {formatArcoDateTime(event.at)}
            {event.actor?.name ? ` · ${event.actor.name}` : ""}
            {event.actor?.role ? ` (${event.actor.role})` : ""}
          </p>
          {typeof event.meta?.message === "string" && event.meta.message && (
            <p className="mt-2 rounded-lg bg-[#F8FAFC] px-3 py-2 text-xs text-[#475569]">
              {event.meta.message}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
};

export default ArcoAuditTimeline;
