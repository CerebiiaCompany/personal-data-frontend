"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import LogoCerebiia from "@public/logo.svg";
import Button from "@/components/base/Button";
import { useSessionStore } from "@/store/useSessionStore";
import { WIZARD_TOTAL_ESTIMATED_MINUTES } from "@/constants/wizardBlocks";
import { getWizardBlockQuestionPath } from "@/utils/wizardRoutes";
import BlockMap from "./BlockMap";

interface WizardWelcomeProps {
  resume: boolean;
  currentBlock: number;
  currentQuestion: number;
}

export default function WizardWelcome({ resume, currentBlock, currentQuestion }: WizardWelcomeProps) {
  const router = useRouter();
  const userName = useSessionStore((store) => store.user?.name);
  const companyName = useSessionStore((store) => store.user?.company?.name);

  function goTo(block: number, question: number) {
    router.push(getWizardBlockQuestionPath(block, question));
  }

  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-8 px-4 py-6 sm:px-6 md:px-10">
      <header className="flex items-center">
        <Image src={LogoCerebiia} width={160} alt="Logo de CEREBIIA" priority className="h-8 w-auto" />
      </header>

      <div className="border-t border-stone-200" />

      <div className="text-center">
        <h1 className="text-xl font-semibold text-primary-900 sm:text-2xl">
          Hola, {userName ?? "Usuario"}
        </h1>
        <p className="mt-2 text-sm text-stone-600 sm:text-base">
          En ~{WIZARD_TOTAL_ESTIMATED_MINUTES} minutos tu empresa estará configurada.
        </p>
        {companyName && <p className="mt-1 text-sm font-medium text-primary-700">{companyName}</p>}
      </div>

      <div className="border-t border-stone-200" />

      <BlockMap />

      <div className="border-t border-stone-200" />

      <div className="flex flex-col items-center gap-3">
        {resume ? (
          <>
            <p className="text-sm text-stone-600">Tienes una configuración en progreso.</p>
            <Button className="w-full sm:w-auto" onClick={() => goTo(currentBlock, currentQuestion)}>
              Retomar desde Bloque {currentBlock} - Pregunta {currentQuestion}
            </Button>
            <Button
              hierarchy="secondary"
              className="w-full sm:w-auto"
              onClick={() => goTo(1, 1)}
            >
              Comenzar de nuevo
            </Button>
          </>
        ) : (
          <Button className="w-full sm:w-auto" onClick={() => goTo(1, 1)}>
            Comenzar configuración
          </Button>
        )}
      </div>
    </div>
  );
}
