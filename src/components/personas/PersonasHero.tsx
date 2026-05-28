"use client";

import Button from "@/components/base/Button";
import PersonasAnimateIn from "@/components/personas/PersonasAnimateIn";
import { personasHeroFeatures } from "@/constants/personasData";
import { personasTheme } from "@/constants/personasTheme";
import { usePersonasCountryContent } from "@/hooks/usePersonasCountryContent";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";

const PersonasHero = () => {
  const content = usePersonasCountryContent();

  return (
    <section className={personasTheme.hero}>
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 lg:items-start">
          <div className="flex flex-col gap-8">
            <PersonasAnimateIn delay={0}>
              <span className={personasTheme.badge}>
                <span className="text-base">{content.flag}</span>
                {content.legalBadge}
              </span>
            </PersonasAnimateIn>

            <PersonasAnimateIn delay={90}>
              <div className="space-y-5">
                <h1
                  className={clsx(
                    "text-[1.75rem] font-semibold leading-[1.2] sm:text-4xl lg:text-[2.65rem]",
                    personasTheme.heading
                  )}
                >
                  {content.heroTitle}{" "}
                  <span className="text-primary-500">{content.heroHighlight}</span>
                </h1>
                <p
                  className={clsx(
                    "max-w-lg text-base leading-relaxed sm:text-lg",
                    personasTheme.body
                  )}
                >
                  {content.heroDescription}
                </p>
              </div>
            </PersonasAnimateIn>

            <PersonasAnimateIn delay={180}>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  href="/personas/ingresar"
                  hierarchy="primary"
                  className="rounded-xl! px-6 py-3!"
                  endContent={<Icon icon="tabler:arrow-right" />}
                >
                  Acceder a mis datos
                </Button>
                <Button
                  href="#como-funciona"
                  hierarchy="secondary"
                  className="rounded-xl! text-primary-900!"
                >
                  Cómo funciona
                </Button>
              </div>
            </PersonasAnimateIn>

            <PersonasAnimateIn delay={260}>
              <div className="flex flex-wrap gap-2">
                {content.trustStats.map((stat, i) => (
                  <PersonasAnimateIn
                    key={stat.label}
                    delay={320 + i * 60}
                    className="inline-flex"
                  >
                    <div className="flex items-center gap-2 rounded-xl border border-zinc-200/80 bg-zinc-50/80 px-3 py-2">
                      <Icon icon={stat.icon} className="text-primary-600" />
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                          {stat.label}
                        </p>
                        <p className="text-xs font-semibold text-primary-900">
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  </PersonasAnimateIn>
                ))}
              </div>
            </PersonasAnimateIn>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {personasHeroFeatures.map((feature, i) => (
              <PersonasAnimateIn
                key={feature.title}
                delay={140 + i * 80}
                className={clsx(i === 0 && "sm:col-span-2")}
              >
                <div className={personasTheme.bentoItem}>
                  <div className={clsx(personasTheme.iconBox, "mb-3 h-10 w-10")}>
                    <Icon icon={feature.icon} className="text-xl" />
                  </div>
                  <h3 className="mb-1 font-semibold text-primary-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-600">
                    {feature.description}
                  </p>
                </div>
              </PersonasAnimateIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PersonasHero;
