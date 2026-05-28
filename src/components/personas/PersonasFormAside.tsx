import { personasTips } from "@/constants/personasData";
import { personasTheme } from "@/constants/personasTheme";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";

interface Props {
  variant?: "ingresar" | "verificar";
}

const PersonasFormAside = ({ variant = "ingresar" }: Props) => {
  const tips =
    variant === "verificar" ? personasTips.slice(0, 2) : personasTips;

  return (
    <aside className="hidden lg:block">
      <div className={clsx(personasTheme.card, "sticky top-24 p-6")}>
        <h2 className={clsx("mb-4 text-lg font-semibold", personasTheme.heading)}>
          {variant === "verificar" ? "¿Problemas con el código?" : "Antes de continuar"}
        </h2>
        <ul className="flex flex-col gap-4">
          {tips.map((tip) => (
            <li key={tip.title} className="flex gap-3">
              <div className={clsx(personasTheme.iconBox, "h-9 w-9 shrink-0")}>
                <Icon icon={tip.icon} className="text-lg text-primary-600" />
              </div>
              <div>
                <p className={clsx("text-sm font-semibold", personasTheme.heading)}>
                  {tip.title}
                </p>
                <p className={clsx("mt-0.5 text-xs leading-relaxed", personasTheme.body)}>
                  {tip.text}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <div
          className={clsx(
            personasTheme.infoBox,
            "mt-6 flex gap-2 text-xs leading-relaxed"
          )}
        >
          <Icon icon="tabler:lock" className="shrink-0 text-primary-600" />
          <span className={personasTheme.body}>
            Conexión segura. No compartimos tu código con terceros.
          </span>
        </div>
      </div>
    </aside>
  );
};

export default PersonasFormAside;
