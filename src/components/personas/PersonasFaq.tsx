"use client";

import { personasTheme } from "@/constants/personasTheme";
import PersonasSectionTitle from "@/components/personas/PersonasSectionTitle";
import { usePersonasCountryContent } from "@/hooks/usePersonasCountryContent";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import { useState } from "react";

const PersonasFaq = () => {
  const content = usePersonasCountryContent();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="preguntas" className="py-16 sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <PersonasSectionTitle
            eyebrow="FAQ"
            title="Preguntas frecuentes"
            description={`Respuestas para titulares en ${content.label}.`}
          />

          <div className="flex flex-col gap-2">
            {content.faq.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={item.question}
                  className={clsx(
                    personasTheme.cardSoft,
                    "overflow-hidden",
                    isOpen && "border-primary-900/20"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 p-4 text-left sm:p-5"
                    aria-expanded={isOpen}
                  >
                    <span className="font-medium text-primary-900">
                      {item.question}
                    </span>
                    <span
                      className={clsx(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
                        isOpen ? "bg-primary-900 text-white" : "bg-zinc-100 text-zinc-600"
                      )}
                    >
                      <Icon
                        icon={isOpen ? "tabler:minus" : "tabler:plus"}
                        className="text-lg"
                      />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-zinc-100 px-4 pb-4 sm:px-5 sm:pb-5">
                      <p className="text-sm leading-relaxed text-zinc-600">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PersonasFaq;
