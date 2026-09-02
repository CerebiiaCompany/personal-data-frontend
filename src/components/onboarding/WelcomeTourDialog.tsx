"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react/dist/iconify.js";
import Button from "@/components/base/Button";
import { WELCOME_TOUR_SLIDES, WelcomeTourIllustrationKind } from "@/constants/welcomeTour";

interface Props {
  open: boolean;
  userName?: string;
  /** Ajusta el cierre del tour según el momento del onboarding. */
  context?: "dashboard" | "initial-setup";
  onComplete: () => void;
}

export default function WelcomeTourDialog({
  open,
  userName,
  context = "dashboard",
  onComplete,
}: Props) {
  const [index, setIndex] = useState(0);

  const slides = useMemo(() => {
    if (context !== "initial-setup") return WELCOME_TOUR_SLIDES;
    return WELCOME_TOUR_SLIDES.map((slide, slideIndex) => {
      if (slideIndex !== WELCOME_TOUR_SLIDES.length - 1) return slide;
      return {
        ...slide,
        title: "Un paso más antes de empezar",
        description:
          "A continuación completarás la Fase 1 del asistente: datos de tu empresa, DPO y contactos ARCO. Son necesarios para operar con claridad y cumplimiento legal.",
        illustrationKind: "company-setup" as const,
        imageAlt: "Ilustración de datos base de la empresa",
      };
    });
  }, [context]);

  useEffect(() => {
    if (open) setIndex(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  const slide = slides[index];
  const isFirst = index === 0;
  const isLast = index === slides.length - 1;
  const greetingName = userName?.trim() || "administrador";
  const symbolicKind =
    slide.illustrationKind === "company-setup" || slide.illustrationKind === "checklist"
      ? slide.illustrationKind
      : null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/45 p-3 backdrop-blur-[10px] sm:items-center sm:p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-tour-title"
    >
      <div className="auth-shell-card flex max-h-[min(92dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#E4EAF6] bg-white shadow-[0_24px_70px_rgba(15,35,70,0.22)] max-[480px]:max-h-[min(96dvh,100%)] sm:rounded-3xl">
        {/* Ilustración: altura acotada al viewport para no empujar el contenido fuera */}
        <div className="relative h-[min(28dvh,200px)] w-full shrink-0 overflow-hidden bg-gradient-to-br from-[#EEF3FF] to-[#F8FAFC] sm:h-[min(32dvh,240px)] [@media(max-height:700px)]:h-[min(22dvh,160px)] [@media(max-height:560px)]:h-[min(18dvh,120px)]">
          {symbolicKind ? (
            <WelcomeTourSymbolicIllustration kind={symbolicKind} />
          ) : (
            <Image
              key={`${slide.id}-${index}`}
              src={slide.imageSrc}
              alt={slide.imageAlt}
              fill
              unoptimized
              className="object-cover object-center"
              sizes="(max-width: 512px) 100vw, 512px"
              priority={index === 0}
            />
          )}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent sm:h-14" />
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-5 pt-1 pb-4 sm:px-8 sm:pb-6 sm:pt-2">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1">
            <div className="flex flex-col gap-1.5 text-center sm:gap-2">
              {isFirst && (
                <p className="text-[11px] font-semibold tracking-wide text-primary-500 uppercase sm:text-xs">
                  Hola, {greetingName}
                </p>
              )}
              <h2
                id="welcome-tour-title"
                className="text-lg font-bold tracking-tight text-primary-900 sm:text-2xl"
              >
                {slide.title}
              </h2>
              <p className="mx-auto max-w-md text-sm leading-relaxed text-[#64748B] sm:text-[15px]">
                {slide.description}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-center gap-1.5 sm:mt-5">
              {slides.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Ir a la diapositiva ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index
                      ? "w-6 bg-primary-900"
                      : "w-1.5 bg-[#D0CDE1] hover:bg-primary-300"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 shrink-0 space-y-2.5 sm:mt-5">
            <div className="flex items-center gap-2.5 sm:gap-3">
              {!isFirst ? (
                <Button
                  type="button"
                  hierarchy="secondary"
                  className="h-10 flex-1 rounded-xl! sm:h-11"
                  onClick={() => setIndex((prev) => Math.max(0, prev - 1))}
                >
                  <span className="inline-flex items-center justify-center gap-2 leading-none">
                    <Icon icon="tabler:arrow-left" className="size-5 shrink-0" />
                    Anterior
                  </span>
                </Button>
              ) : (
                <Button
                  type="button"
                  hierarchy="tertiary"
                  className="h-10 flex-1 rounded-xl! text-[#64748B]! sm:h-11"
                  onClick={onComplete}
                >
                  Saltar
                </Button>
              )}

              <Button
                type="button"
                hierarchy="primary"
                className="h-10 flex-1 rounded-xl! bg-primary-900! shadow-[0_10px_24px_rgba(0,11,80,0.18)] sm:h-11"
                onClick={() => {
                  if (isLast) onComplete();
                  else setIndex((prev) => prev + 1);
                }}
              >
                <span className="inline-flex items-center justify-center gap-2 leading-none">
                  {isLast
                    ? context === "initial-setup"
                      ? "Continuar"
                      : "Comenzar"
                    : "Siguiente"}
                  {!isLast && (
                    <Icon
                      icon="tabler:arrow-right"
                      className="size-5 shrink-0"
                    />
                  )}
                </span>
              </Button>
            </div>

            <p className="text-center text-[11px] text-[#94A3B8]">
              {index + 1} de {slides.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function WelcomeTourSymbolicIllustration({
  kind,
}: {
  kind: Exclude<WelcomeTourIllustrationKind, "image">;
}) {
  const isCompanySetup = kind === "company-setup";

  return (
    <div className="flex h-full items-center justify-center px-6" aria-hidden>
      <div className="relative flex size-36 items-center justify-center rounded-[2rem] border border-[#C7D7F5] bg-white shadow-[0_18px_40px_rgba(26,43,91,0.12)] sm:size-40">
        <Icon
          icon={isCompanySetup ? "tabler:building-skyscraper" : "tabler:list-check"}
          className="text-6xl text-[#1A2B5B] sm:text-7xl"
        />
        <div
          className={`absolute -right-3 -bottom-3 grid size-12 place-content-center rounded-2xl border shadow-sm ${
            isCompanySetup
              ? "border-[#BBF7D0] bg-[#ECFDF5]"
              : "border-[#C7D7F5] bg-[#EEF3FF]"
          }`}
        >
          <Icon
            icon={isCompanySetup ? "tabler:shield-check" : "tabler:arrow-right"}
            className={`text-2xl ${isCompanySetup ? "text-emerald-700" : "text-[#1A2B5B]"}`}
          />
        </div>
      </div>
    </div>
  );
}
