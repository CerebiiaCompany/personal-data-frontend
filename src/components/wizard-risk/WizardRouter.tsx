"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWizardContext } from "@/contexts/WizardContext";
import { isValidWizardBlock, isValidWizardQuestion, getWizardBlockQuestionPath } from "@/utils/wizardRoutes";
import { resolveWizardBlockForQuestion } from "@/constants/wizardBlocks";
import WizardContainer from "./WizardContainer";

type WizardRouteSegment = "bienvenida" | "block" | "finalizacion";

interface WizardRouterProps {
  segment: WizardRouteSegment;
  blockNum?: number;
  questionNum?: number;
}

/**
 * Puente entre las rutas de Next.js (app/wizard/**) y el WizardContext.
 * Next.js resuelve el deep-linking vía filesystem; este componente valida
 * los parámetros de la URL y sincroniza bloque/pregunta hacia el contexto.
 */
export default function WizardRouter({ segment, blockNum, questionNum }: WizardRouterProps) {
  const router = useRouter();
  const { state, setCurrentBlock, setCurrentQuestion } = useWizardContext();

  useEffect(() => {
    if (segment !== "block") return;
    if (blockNum === undefined || questionNum === undefined) return;

    if (!isValidWizardBlock(blockNum) || !isValidWizardQuestion(questionNum)) {
      router.replace(getWizardBlockQuestionPath(state.currentBlock, state.currentQuestion));
      return;
    }

    // El bloque de la URL nunca se toma como verdad por sí solo — se deriva
    // de questionNum (ver wizardBlocks.ts) para no quedar en un bloque sin
    // preguntas propias (p. ej. tras cruzar de bloque, ver useWizardSession).
    // Una URL con el bloque "equivocado" para su pregunta se autocorrige.
    const correctBlock = resolveWizardBlockForQuestion(questionNum);
    if (blockNum !== correctBlock) {
      router.replace(getWizardBlockQuestionPath(correctBlock, questionNum));
      return;
    }

    if (correctBlock !== state.currentBlock) setCurrentBlock(correctBlock);
    if (questionNum !== state.currentQuestion) setCurrentQuestion(questionNum);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segment, blockNum, questionNum]);

  return <WizardContainer segment={segment} />;
}
