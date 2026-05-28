import { personasTheme } from "@/constants/personasTheme";
import clsx from "clsx";

interface Props {
  eyebrow: string;
  title: string;
  description?: string;
  centered?: boolean;
  className?: string;
}

const PersonasSectionTitle = ({
  eyebrow,
  title,
  description,
  centered = false,
  className,
}: Props) => (
  <div
    className={clsx(
      "max-w-2xl space-y-2",
      centered && "mx-auto text-center",
      className
    )}
  >
    <p className={personasTheme.sectionTitle}>{eyebrow}</p>
    <h2
      className={clsx(
        "text-2xl font-semibold sm:text-[1.75rem]",
        personasTheme.heading
      )}
    >
      {title}
    </h2>
    {description && (
      <p className={clsx("text-base leading-relaxed", personasTheme.body)}>
        {description}
      </p>
    )}
  </div>
);

export default PersonasSectionTitle;
