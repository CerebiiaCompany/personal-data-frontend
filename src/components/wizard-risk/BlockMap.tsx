import { WIZARD_BLOCKS, WIZARD_TOTAL_ESTIMATED_MINUTES, WizardBlockInfo } from "@/constants/wizardBlocks";

interface BlockMapProps {
  blocks?: WizardBlockInfo[];
}

export default function BlockMap({ blocks = WIZARD_BLOCKS }: BlockMapProps) {
  const totalMinutes =
    blocks === WIZARD_BLOCKS
      ? WIZARD_TOTAL_ESTIMATED_MINUTES
      : blocks.reduce((sum, b) => sum + b.estimatedMinutes, 0);

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {blocks.map((block) => (
          <div
            key={block.number}
            className="rounded-lg border border-stone-200 bg-white p-4 text-center shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">
              Bloque {block.number}
            </p>
            <p className="mt-1 text-sm font-medium text-primary-900">{block.name}</p>
            <p className="mt-1 text-xs text-stone-500">~{block.estimatedMinutes} min</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-sm text-stone-500">Total: ~{totalMinutes} minutos</p>
    </div>
  );
}
