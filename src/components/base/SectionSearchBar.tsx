import { Icon } from "@iconify/react";
import React from "react";

interface Props {
  search: string;
  onSearchChange: (q: string) => void;
  /** Placeholder del input (por defecto busca formularios) */
  placeholder?: string;
  /**
   * `pill`: barra ancha tipo píldora (p. ej. listado de campañas).
   * `compact`: ancho máximo acotado (formularios, clasificación, etc.).
   */
  variant?: "compact" | "pill";
}

const SectionSearchBar = ({
  search,
  onSearchChange,
  placeholder = "Buscar formularios...",
  variant = "compact",
}: Props) => {
  const isPill = variant === "pill";
  return (
    <label
      className={[
        "flex w-full items-center gap-2.5 text-[#7083A8] border border-[#E4EAF6] bg-white relative shadow-[0_1px_3px_rgba(15,35,70,0.06)]",
        isPill
          ? "max-w-none rounded-full px-5 py-3"
          : "max-w-[430px] flex-1 rounded-xl px-4 py-2.5 shadow-[0_1px_2px_rgba(15,35,70,0.04)] bg-[#FAFCFF]",
      ].join(" ")}
    >
      <Icon
        icon="tabler:search"
        className="text-[18px] flex-shrink-0 text-[#8B9BB8]"
      />
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        type="text"
        placeholder={placeholder}
        className="w-full py-0.5 text-[15px] bg-transparent placeholder:text-[#9AA8C2]"
      />
    </label>
  );
};

export default SectionSearchBar;
