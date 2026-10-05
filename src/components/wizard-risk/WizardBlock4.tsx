"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWizardBlockQuestions } from "@/hooks/useWizardBlockQuestions";
import { useWizardContext } from "@/contexts/WizardContext";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { useWizardError } from "@/hooks/useWizardError";
import { saveWizardSystems } from "@/lib/wizardSession.api";
import { withMinTransitionDelay } from "@/utils/wizardTransitionDelay";
import { getWizardBlockStartQuestion } from "@/constants/wizardBlocks";
import { BLOCK4_QUESTIONS } from "@/constants/wizard-blocks/block4Questions";
import { inferSystemsFromAnswers, mergeWizardBlock4Systems, normalizeSystemForApi } from "@/utils/wizardInference";
import { getWizardBlockQuestionPath } from "@/utils/wizardRoutes";
import SystemsTable from "./SystemsTable";

const BLOCK_NUM = 4;

/**
 * Bloque 4 — tabla de sistemas. Siempre incluye CEREBIIA, el catálogo
 * predefinido (selector) y lo inferido de los bloques 1-3.
 */
export default function WizardBlock4() {
  const router = useRouter();
  const { state, setSystems, setLoading } = useWizardContext();
  const companyId = useActiveCompanyId();
  const { showBlockingError } = useWizardError();
  const blockStartQuestion = getWizardBlockStartQuestion(BLOCK_NUM, state.answers);
  const seededRef = useRef(false);

  const { handlePrevious, advanceBeyondBlock } = useWizardBlockQuestions({
    blockNum: BLOCK_NUM,
    blockStartQuestion,
    questions: BLOCK4_QUESTIONS,
  });

  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    const inferred = inferSystemsFromAnswers(state.answers);
    setSystems(mergeWizardBlock4Systems(state.systems, inferred));
    // Solo se siembra al entrar al bloque; no re-inferir en cada tecla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSystemsNext() {
    if (!companyId || !state.sessionId) return;
    const sessionId = state.sessionId;

    setLoading(true);
    const res = await withMinTransitionDelay(() =>
      saveWizardSystems(companyId, sessionId, state.systems.map(normalizeSystemForApi))
    );
    setLoading(false);

    if (res.error) {
      showBlockingError("ERR_05");
      return;
    }

    advanceBeyondBlock(1);
  }

  function handlePreviousBlock() {
    if (blockStartQuestion <= 1) {
      handlePrevious();
      return;
    }
    router.push(getWizardBlockQuestionPath(3, blockStartQuestion - 1));
  }

  return (
    <SystemsTable
      systems={state.systems}
      onChange={setSystems}
      isLoading={state.isLoading}
      onPrevious={handlePreviousBlock}
      onNext={handleSystemsNext}
      companyId={companyId}
    />
  );
}
