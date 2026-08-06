"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react/dist/iconify.js";
import Button from "@/components/base/Button";
import { WELCOME_TOUR_SLIDES } from "@/constants/welcomeTour";

interface Props {
  open: boolean;
  userName?: string;
  onComplete: () => void;
}

export default function WelcomeTourDialog({
  open,
  userName,
  onComplete,
}: Props) {
  const [index, setIndex] = useState(0);

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

  const slide = WELCOME_TOUR_SLIDES[index];
  const isFirst = index === 0;
  const isLast = index === WELCOME_TOUR_SLIDES.length - 1;
  const greetingName = userName?.trim() || "administrador";

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
          <Image
            key={slide.id}
            src={slide.imageSrc}
            alt={slide.imageAlt}
            fill
            className="object-cover object-center"
            sizes="(max-width: 512px) 100vw, 512px"
            priority
          />
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
              {WELCOME_TOUR_SLIDES.map((item, i) => (
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
                  {isLast ? "Comenzar" : "Siguiente"}
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
              {index + 1} de {WELCOME_TOUR_SLIDES.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
