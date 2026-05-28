"use client";

import { personasRights } from "@/constants/personasData";
import { personasTheme } from "@/constants/personasTheme";
import PersonasSectionTitle from "@/components/personas/PersonasSectionTitle";
import { usePersonasCountryContent } from "@/hooks/usePersonasCountryContent";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import Link from "next/link";

const PersonasRightsSection = () => {
  const content = usePersonasCountryContent();

  return (
    <section
      id="tus-derechos"
      className="border-y border-zinc-200/70 bg-white py-16 sm:py-24"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <PersonasSectionTitle
          eyebrow={content.rightsLabel}
          title="Controla tu información personal"
          description="Ejerce tus derechos ante cada empresa que trate tus datos."
          className="mb-10"
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {personasRights.map((right) => (
            <article
              key={right.key}
              className={clsx(
                personasTheme.cardSoft,
                "group p-5 hover:bg-primary-50/30"
              )}
            >
              <div
                className={clsx(
                  personasTheme.iconBox,
                  "mb-4 h-10 w-10 transition-transform group-hover:scale-105"
                )}
              >
                <Icon icon={right.icon} className="text-lg" />
              </div>
              <h3 className="mb-2 font-semibold text-primary-900">
                {right.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-600">
                {right.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/personas/ingresar"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-900 px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Empezar ahora
            <Icon icon="tabler:arrow-right" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PersonasRightsSection;
