import { Icon } from "@iconify/react/dist/iconify.js";
import React from "react";

interface Props {
  search: string;
  onSearchChange: (q: string) => void;
}

const SectionSearchBar = ({ search, onSearchChange }: Props) => {
  return (
    <label className="flex max-w-xl w-full items-center rounded-lg gap-2 text-stone-600 border border-disabled flex-1 relative px-3 py-2 sm:py-2.5">
      <Icon icon={"tabler:search"} className="text-base sm:text-lg flex-shrink-0" />
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        type="text"
        placeholder="Buscar"
        className="w-full py-1 sm:py-1.5 text-sm sm:text-base"
      />
      {search && (
        <button
          onClick={(_) => onSearchChange("")}
          className="text-base sm:text-lg rounded-md text-primary-900 cursor-pointer relative before:w-full before:h-full hover:before:bg-stone-200 before:transition-colors before:absolute before:inset-0 before:m-auto before:z-0 before:scale-125 before:rounded-md flex-shrink-0"
        >
          <Icon icon={"tabler:x"} className="relative z-10" />
        </button>
      )}
    </label>
  );
};

export default SectionSearchBar;
