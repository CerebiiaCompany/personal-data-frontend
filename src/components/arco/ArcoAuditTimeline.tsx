import { ArcoAuditEvent } from "@/types/arco.admin.types";
import {
  formatArcoAuditMetaLines,
  formatArcoDateTime,
  parseArcoAuditTypeLabel,
} from "@/utils/arcoAdmin.utils";
import { Icon } from "@iconify/react/dist/iconify.js";

interface Props {
  events: ArcoAuditEvent[];
}

function eventIcon(type?: string) {
  if (!type) return "tabler:point-filled";
  if (type.includes("CREATED")) return "tabler:file-plus";
  if (type.includes("NOTIFIED")) return "tabler:bell-ringing";
  if (type.includes("ASSIGNED")) return "tabler:user-check";
  if (type.includes("STATUS")) return "tabler:progress";
  if (type.includes("RESPONDED")) return "tabler:message-check";
  return "tabler:point-filled";
}

const ArcoAuditTimeline = ({ events }: Props) => {
  if (!events.length) {
    return (
      <p className="text-sm text-[#64748B]">Sin eventos de trazabilidad registrados.</p>
    );
  }

  const sorted = [...events]
    .filter((e) => e.type || e.at)
    .sort(
      (a, b) => new Date(a.at ?? 0).getTime() - new Date(b.at ?? 0).getTime()
    );

  return (
    <ol className="relative border-l border-[#E2E8F0] pl-6">
      {sorted.map((event, index) => {
        const metaLines = formatArcoAuditMetaLines(event.meta);

        return (
          <li key={`${event.type}-${event.at}-${index}`} className="mb-6 last:mb-0">
            <span className="absolute -left-[11px] flex h-6 w-6 items-center justify-center rounded-full bg-white ring-2 ring-primary-500">
              <Icon
                icon={eventIcon(event.type ?? event.eventType)}
                className="text-xs text-primary-600"
              />
            </span>
            <p className="text-sm font-semibold text-[#1A2B5B]">
              {parseArcoAuditTypeLabel(event.type ?? event.eventType)}
            </p>
            <p className="mt-0.5 text-xs text-[#64748B]">
              {formatArcoDateTime(event.at)}
              {event.actor?.name ? ` · ${event.actor.name}` : ""}
              {event.actor?.role ? ` (${event.actor.role})` : ""}
            </p>
            {metaLines.length > 0 && (
              <ul className="mt-2 space-y-1 rounded-lg bg-[#F8FAFC] px-3 py-2 text-xs text-[#475569]">
                {metaLines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
};

export default ArcoAuditTimeline;
