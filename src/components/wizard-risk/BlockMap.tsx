import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import { WIZARD_BLOCKS, WizardBlockInfo } from "@/constants/wizardBlocks";

type BlockStatus = "done" | "current" | "upcoming";

interface BlockMapProps {
  blocks?: WizardBlockInfo[];
  currentBlock?: number;
  resume?: boolean;
  sessionStatus?: string;
}

function resolveStatus(
  blockNumber: number,
  currentBlock: number,
  resume: boolean,
  sessionStatus?: string
): BlockStatus {
  if (sessionStatus === "COMPLETED") return "done";
  if (!resume) return blockNumber === 1 ? "current" : "upcoming";
  if (blockNumber < currentBlock) return "done";
  if (blockNumber === currentBlock) return "current";
  return "upcoming";
}

export default function BlockMap({
  blocks = WIZARD_BLOCKS,
  currentBlock = 1,
  resume = false,
  sessionStatus,
}: BlockMapProps) {
  return (
    <ol className="flex flex-col gap-3">
      {blocks.map((block, index) => {
        const status = resolveStatus(block.number, currentBlock, resume, sessionStatus);
        const isLast = index === blocks.length - 1;

        return (
          <li key={block.number} className="relative flex gap-3">
            {!isLast && (
              <span
                aria-hidden
                className={clsx(
                  "absolute left-[19px] top-11 h-[calc(100%-8px)] w-px",
                  status === "done" ? "bg-emerald-300" : "bg-[#E4EAF6]"
                )}
              />
            )}

            <div
              className={clsx(
                "relative z-10 mt-3 grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1",
                status === "done" && "bg-emerald-50 text-emerald-700 ring-emerald-200",
                status === "current" && "bg-[#1A2B5B] text-white ring-[#1A2B5B] shadow-[0_8px_18px_rgba(26,43,91,0.22)]",
                status === "upcoming" && "bg-[#EEF3FF] text-[#1A2B5B] ring-[#D7E2F5]"
              )}
            >
              <Icon
                icon={status === "done" ? "tabler:check" : block.icon}
                className="text-lg"
              />
            </div>

            <article
              className={clsx(
                "min-w-0 flex-1 rounded-2xl border p-3.5 transition-all sm:p-4",
                status === "current" &&
                  "border-[#1A2B5B]/20 bg-white shadow-[0_12px_30px_rgba(15,35,70,0.08)] ring-1 ring-[#1A2B5B]/10",
                status === "done" && "border-emerald-100 bg-emerald-50/50",
                status === "upcoming" && "border-[#E8EDF7] bg-white/80"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#94A3B8]">
                    Bloque {block.number}
                  </p>
                  <h3 className="mt-0.5 text-sm font-bold leading-snug text-[#1A2B5B] sm:text-[15px]">
                    {block.name}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#64748B]">{block.summary}</p>
                </div>
                <span
                  className={clsx(
                    "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                    status === "current" && "bg-[#EEF3FF] text-[#1A2B5B]",
                    status === "done" && "bg-emerald-100 text-emerald-800",
                    status === "upcoming" && "bg-[#F1F5F9] text-[#64748B]"
                  )}
                >
                  ~{block.estimatedMinutes} min
                </span>
              </div>
              {status === "current" && (
                <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#1A2B5B]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1A2B5B]" />
                  {resume ? "Continúa aquí" : "Empiezas aquí"}
                </p>
              )}
              {status === "done" && (
                <p className="mt-2 text-[11px] font-semibold text-emerald-700">Completado</p>
              )}
            </article>
          </li>
        );
      })}
    </ol>
  );
}
