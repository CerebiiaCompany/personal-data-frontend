"use client";

import clsx from "clsx";
import { Icon } from "@iconify/react/dist/iconify.js";
import { WIZARD_BLOCKS } from "@/constants/wizardBlocks";

interface WizardBlockProgressProps {
  currentBlock: number;
}

export default function WizardBlockProgress({ currentBlock }: WizardBlockProgressProps) {
  return (
    <ol className="flex items-center" aria-label="Progreso por bloque">
      {WIZARD_BLOCKS.map((block, index) => {
        const isDone = block.number < currentBlock;
        const isActive = block.number === currentBlock;

        return (
          <li key={block.number} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <span
                className={clsx(
                  "grid h-8 w-8 place-items-center rounded-full text-[12px] font-bold transition-colors",
                  isActive && "bg-[#1A2B5B] text-white shadow-[0_8px_16px_rgba(26,43,91,0.25)]",
                  isDone && "bg-emerald-500 text-white",
                  !isActive && !isDone && "bg-white text-[#94A3B8] ring-1 ring-[#E4EAF6]"
                )}
                aria-current={isActive ? "step" : undefined}
                title={block.name}
              >
                {isDone ? <Icon icon="tabler:check" className="text-sm" /> : block.number}
              </span>
              <span
                className={clsx(
                  "hidden text-[10px] font-semibold sm:block",
                  isActive ? "text-[#1A2B5B]" : isDone ? "text-emerald-700" : "text-[#94A3B8]"
                )}
              >
                {block.shortName}
              </span>
            </div>
            {index < WIZARD_BLOCKS.length - 1 && (
              <span
                aria-hidden
                className={clsx(
                  "mx-1.5 mb-4 h-px w-6 sm:mx-2 sm:w-8 lg:w-10",
                  isDone ? "bg-emerald-300" : "bg-[#E4EAF6]"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
