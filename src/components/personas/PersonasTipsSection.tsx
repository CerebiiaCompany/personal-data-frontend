import { personasTips } from "@/constants/personasData";
import { personasTheme } from "@/constants/personasTheme";
import PersonasSectionTitle from "@/components/personas/PersonasSectionTitle";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";

const PersonasTipsSection = () => (
  <section className="py-16 sm:py-20">
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <PersonasSectionTitle
        eyebrow="Tips"
        title="Antes de ingresar"
        className="mb-8"
      />

      <div className="grid gap-3 md:grid-cols-3">
        {personasTips.map((tip) => (
          <div
            key={tip.title}
            className={clsx(personasTheme.bentoItem, "flex gap-3 p-4")}
          >
            <div className={clsx(personasTheme.iconBox, "h-9 w-9 shrink-0")}>
              <Icon icon={tip.icon} className="text-lg" />
            </div>
            <div>
              <h3 className="font-medium text-primary-900">{tip.title}</h3>
              <p className="mt-1 text-sm text-zinc-600">{tip.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default PersonasTipsSection;
