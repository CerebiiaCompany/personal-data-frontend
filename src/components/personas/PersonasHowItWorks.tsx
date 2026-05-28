"use client";

import PersonasAnimateIn from "@/components/personas/PersonasAnimateIn";
import PersonasReveal from "@/components/personas/PersonasReveal";
import PersonasSectionTitle from "@/components/personas/PersonasSectionTitle";
import { personasHowItWorks } from "@/constants/personasData";
import { personasTheme } from "@/constants/personasTheme";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import { useState } from "react";

const PersonasHowItWorks = () => {
  const [stagger, setStagger] = useState(false);

  return (
    <section id="como-funciona" className="py-16 sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <PersonasReveal onVisible={() => setStagger(true)}>
          <PersonasSectionTitle
            eyebrow="Proceso"
            title="Cuatro pasos, sin complicaciones"
            description="Validación rápida y gestión centralizada de tus solicitudes."
            centered
            className="mb-12"
          />
        </PersonasReveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {personasHowItWorks.map((item, index) => {
            const card = (
              <article className={clsx(personasTheme.cardSoft, "relative h-full p-5")}>
                <span className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-900 text-sm font-semibold text-white">
                  {item.step}
                </span>
                <div className={clsx(personasTheme.iconBox, "mb-3 h-10 w-10")}>
                  <Icon icon={item.icon} className="text-lg" />
                </div>
                <h3 className="mb-2 font-semibold text-primary-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-600">
                  {item.description}
                </p>
              </article>
            );

            return stagger ? (
              <PersonasAnimateIn key={item.step} delay={80 + index * 70}>
                {card}
              </PersonasAnimateIn>
            ) : (
              <div key={item.step} className="opacity-0" aria-hidden>
                {card}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PersonasHowItWorks;
