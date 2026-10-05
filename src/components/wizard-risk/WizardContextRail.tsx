"use client";

import { Icon } from "@iconify/react/dist/iconify.js";
import { useWizardContext } from "@/contexts/WizardContext";
import { getWizardLocalProgress, WIZARD_BLOCKS } from "@/constants/wizardBlocks";

interface WizardContextRailProps {
  currentBlock: number;
  currentQuestion: number;
}

export function WizardMobileContext({ currentBlock, currentQuestion }: WizardContextRailProps) {
  const { state } = useWizardContext();
  const block = WIZARD_BLOCKS.find((item) => item.number === currentBlock) ?? WIZARD_BLOCKS[0];
  const progress = getWizardLocalProgress(currentBlock, currentQuestion, state.answers);
  const stepNoun = currentBlock >= 4 ? "Paso" : "Pregunta";

  return (
    <div className="mb-4 flex items-center gap-3 rounded-2xl border border-[#E4EAF6] bg-white px-3.5 py-3 shadow-[0_8px_24px_rgba(15,35,70,0.04)] lg:hidden">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#1A2B5B] text-white">
        <Icon icon={block.icon} className="text-lg" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-[#1A2B5B]">{block.name}</p>
        <p className="text-xs text-[#64748B]">
          {stepNoun} {progress.local} de {progress.total} · ~{block.estimatedMinutes} min
        </p>
      </div>
    </div>
  );
}

export default function WizardContextRail({ currentBlock, currentQuestion }: WizardContextRailProps) {
  const { state } = useWizardContext();
  const block = WIZARD_BLOCKS.find((item) => item.number === currentBlock) ?? WIZARD_BLOCKS[0];
  const nextBlock = WIZARD_BLOCKS.find((item) => item.number === currentBlock + 1);
  const progress = getWizardLocalProgress(currentBlock, currentQuestion, state.answers);
  const stepNoun = currentBlock >= 4 ? "Paso" : "Pregunta";
  const blockPercent = Math.round((progress.local / progress.total) * 100);

  return (
    <aside className="hidden lg:flex lg:flex-col">
      <div className="sticky top-5 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1A2B5B] via-[#24386E] to-[#0F1C3D] p-6 text-white shadow-[0_24px_60px_rgba(15,35,70,0.18)]">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/12 ring-1 ring-white/15">
            <Icon icon={block.icon} className="text-xl" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">
              Bloque {block.number} de {WIZARD_BLOCKS.length}
            </p>
            <p className="text-sm font-bold leading-snug">{block.name}</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-white/75">{block.summary}</p>

        <div className="mt-6 rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>
              {stepNoun} {progress.local} de {progress.total}
            </span>
            <span className="text-white/70">{blockPercent}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-white transition-all duration-300" style={{ width: `${blockPercent}%` }} />
          </div>
          <p className="mt-3 text-xs text-white/65">~{block.estimatedMinutes} min en este bloque</p>
        </div>

        {nextBlock && (
          <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-white/60">
            <Icon icon="tabler:arrow-right" className="mt-0.5 shrink-0 text-sm" />
            Después: {nextBlock.name}
          </p>
        )}

        <p className="mt-6 text-[11px] leading-relaxed text-white/45">
          Puedes pausar cuando quieras. El avance queda guardado.
        </p>
      </div>
    </aside>
  );
}
