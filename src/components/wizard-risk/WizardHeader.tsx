"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react/dist/iconify.js";
import LogoCerebiia from "@public/logo.svg";
import { useWizardContext } from "@/contexts/WizardContext";
import { getWizardLocalProgress } from "@/constants/wizardBlocks";
import { WIZARD_WELCOME_PATH } from "@/utils/wizardRoutes";
import WizardBlockProgress from "./WizardBlockProgress";

interface WizardHeaderProps {
  currentQuestion: number;
  currentBlock: number;
  blockName: string;
}

export default function WizardHeader({ currentQuestion, currentBlock, blockName }: WizardHeaderProps) {
  const { state } = useWizardContext();
  const progress = getWizardLocalProgress(currentBlock, currentQuestion, state.answers);
  const stepNoun = currentBlock >= 4 ? "Paso" : "Pregunta";

  return (
    <header className="sticky top-0 z-30 border-b border-[#E4EAF6] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href={WIZARD_WELCOME_PATH} className="shrink-0" aria-label="Volver a la bienvenida">
          <Image src={LogoCerebiia} width={132} alt="Logo de CEREBIIA" className="h-6 w-auto sm:h-7" />
        </Link>

        <div className="min-w-0 flex-1 overflow-x-auto">
          <div className="mx-auto w-max">
            <WizardBlockProgress currentBlock={currentBlock} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded-full bg-[#EEF3FF] px-3 py-1 text-[12px] font-semibold text-[#1A2B5B] md:inline">
            {stepNoun} {progress.local}/{progress.total}
          </span>
          <Link
            href={WIZARD_WELCOME_PATH}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[12px] font-semibold text-[#64748B] hover:bg-[#F4F7FB] hover:text-[#1A2B5B]"
          >
            <Icon icon="tabler:player-pause" className="text-sm" />
            <span className="hidden sm:inline">Pausar</span>
          </Link>
        </div>
      </div>

      <div
        role="progressbar"
        aria-valuenow={progress.overallPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progreso del wizard: ${progress.overallPercent}%`}
        className="h-1 w-full bg-[#E8EDF7]"
      >
        <div
          className="h-full bg-[#1A2B5B] transition-all duration-300"
          style={{ width: `${progress.overallPercent}%` }}
        />
      </div>
      <p className="sr-only">
        {blockName}. {stepNoun} {progress.local} de {progress.total}.
      </p>
    </header>
  );
}
