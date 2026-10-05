"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";
import LogoCerebiia from "@public/logo.svg";
import Button from "@/components/base/Button";
import { useSessionStore } from "@/store/useSessionStore";
import { WIZARD_BLOCKS, WIZARD_TOTAL_ESTIMATED_MINUTES } from "@/constants/wizardBlocks";
import { getWizardBlockQuestionPath } from "@/utils/wizardRoutes";
import BlockMap from "./BlockMap";

interface WizardWelcomeProps {
  resume: boolean;
  /** Batch 10 — status real del backend; distingue una sesión ya activada de una simplemente en progreso (ambas llegan con resume=true). */
  sessionStatus: string;
  currentBlock: number;
  currentQuestion: number;
}

export default function WizardWelcome({
  resume,
  sessionStatus,
  currentBlock,
  currentQuestion,
}: WizardWelcomeProps) {
  const router = useRouter();
  const userName = useSessionStore((store) => store.user?.name);
  const companyName = useSessionStore((store) => store.user?.company?.name);
  const isCompleted = sessionStatus === "COMPLETED";
  const greetingName = userName?.trim() || "administrador";

  function goTo(block: number, question: number) {
    router.push(getWizardBlockQuestionPath(block, question));
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-y-auto bg-[#F4F7FB]">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#1A2B5B]/8 blur-3xl" />
        <div className="absolute -right-16 top-24 h-80 w-80 rounded-full bg-[#C7D7F5]/50 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full border border-[#D7E2F5]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="mb-6 flex items-center justify-between gap-3">
          <Image
            src={LogoCerebiia}
            width={148}
            alt="Logo de CEREBIIA"
            priority
            className="h-7 w-auto sm:h-8"
          />
          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#1A2B5B] ring-1 ring-[#E4EAF6]">
            Configuración inicial
          </span>
        </header>

        <div className="grid flex-1 items-start gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-8">
          <section className="rounded-3xl bg-gradient-to-br from-[#1A2B5B] via-[#24386E] to-[#0F1C3D] p-6 text-white shadow-[0_24px_60px_rgba(15,35,70,0.22)] sm:p-8">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold ring-1 ring-white/15">
              <Icon icon="tabler:sparkles" className="text-sm" />
              Asistente de cumplimiento
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Hola, {greetingName}
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75 sm:text-[15px]">
              Te guiaremos paso a paso para dejar lista la base legal de tu empresa:
              perfil, riesgos, tratamientos y sistemas.
            </p>
            {companyName && (
              <p className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-medium text-white/90 ring-1 ring-white/10">
                <Icon icon="tabler:building" className="text-base" />
                {companyName}
              </p>
            )}

            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                <p className="text-2xl font-bold">{WIZARD_BLOCKS.length}</p>
                <p className="mt-1 text-xs text-white/70">bloques guiados</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                <p className="text-2xl font-bold">~{WIZARD_TOTAL_ESTIMATED_MINUTES} min</p>
                <p className="mt-1 text-xs text-white/70">tiempo estimado</p>
              </div>
            </div>

            <ul className="mt-8 hidden space-y-3 text-sm text-white/80 sm:block">
              <li className="flex items-start gap-2.5">
                <Icon icon="tabler:circle-check" className="mt-0.5 shrink-0 text-base text-emerald-300" />
                Puedes pausar y retomar cuando quieras.
              </li>
              <li className="flex items-start gap-2.5">
                <Icon icon="tabler:circle-check" className="mt-0.5 shrink-0 text-base text-emerald-300" />
                Cada respuesta alimenta tu plan de cumplimiento.
              </li>
              <li className="flex items-start gap-2.5">
                <Icon icon="tabler:circle-check" className="mt-0.5 shrink-0 text-base text-emerald-300" />
                Al final revisas y activas lo generado.
              </li>
            </ul>

            <div className="mt-8 flex flex-col gap-2.5">
              {isCompleted ? (
                <>
                  <p className="text-sm text-white/75">Ya activaste tu plan de cumplimiento.</p>
                  <Button
                    className="w-full rounded-xl! border-white! bg-white! py-3! text-[#1A2B5B]! hover:bg-white/90!"
                    onClick={() => router.push("/wizard/finalizacion")}
                  >
                    Ver mi plan de cumplimiento
                  </Button>
                </>
              ) : resume ? (
                <>
                  <p className="text-sm text-white/75">
                    Tienes una configuración en progreso. Retoma exactamente donde lo dejaste.
                  </p>
                  <Button
                    className="w-full rounded-xl! border-white! bg-white! py-3! text-[13px]! text-[#1A2B5B]! hover:bg-white/90!"
                    onClick={() => goTo(currentBlock, currentQuestion)}
                  >
                    Retomar Bloque {currentBlock} · Pregunta {currentQuestion}
                  </Button>
                  <Button
                    hierarchy="secondary"
                    className="w-full rounded-xl! border-white/25! bg-transparent! py-2.5! text-white! hover:bg-white/10!"
                    onClick={() => goTo(1, 1)}
                  >
                    Comenzar de nuevo
                  </Button>
                </>
              ) : (
                <Button
                  className="w-full rounded-xl! border-white! bg-white! py-3! text-[#1A2B5B]! hover:bg-white/90!"
                  onClick={() => goTo(1, 1)}
                >
                  Comenzar configuración
                </Button>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-[#E4EAF6] bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,35,70,0.08)] backdrop-blur-sm sm:p-6">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-[#1A2B5B]">Tu recorrido</h2>
                <p className="mt-1 text-sm text-[#64748B]">
                  Cinco bloques. Al terminar, tu empresa queda lista para operar.
                </p>
              </div>
              <span className="hidden rounded-full bg-[#F1F5F9] px-3 py-1 text-[11px] font-semibold text-[#475569] sm:inline">
                Total ~{WIZARD_TOTAL_ESTIMATED_MINUTES} min
              </span>
            </div>
            <BlockMap
              currentBlock={currentBlock}
              resume={resume}
              sessionStatus={sessionStatus}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
