"use client";

import { useParams } from "next/navigation";
import WizardRouter from "@/components/wizard-risk/WizardRouter";

export default function WizardBlockPage() {
  const params = useParams<{ blockNum: string; questionNum: string }>();
  return (
    <WizardRouter
      segment="block"
      blockNum={Number(params.blockNum)}
      questionNum={Number(params.questionNum)}
    />
  );
}
