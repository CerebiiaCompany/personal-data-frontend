"use client";

import Button from "@/components/base/Button";
import { personasTheme } from "@/constants/personasTheme";
import { usePersonasCountryContent } from "@/hooks/usePersonasCountryContent";
import { Icon } from "@iconify/react/dist/iconify.js";

const PersonasCtaBanner = () => {
  const content = usePersonasCountryContent();

  return (
    <section className="pb-20 pt-4">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className={personasTheme.ctaDark}>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-lg space-y-3">
              <p className="text-sm font-medium text-white/70">
                {content.flag} {content.label}
              </p>
              <h2 className="text-2xl font-semibold sm:text-3xl">
                Gestiona tus datos hoy
              </h2>
              <p className="text-sm leading-relaxed text-white/80 sm:text-base">
                Verifica tu identidad y accede al listado de empresas. Plazo de
                respuesta: {content.responseDaysLabel}.
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-stretch sm:items-end">
              <Button
                href="/personas/ingresar"
                hierarchy="secondary"
                className="rounded-xl! border-0! bg-white! text-primary-900! hover:brightness-95"
                endContent={<Icon icon="tabler:arrow-right" />}
              >
                Ingresar al portal
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PersonasCtaBanner;
