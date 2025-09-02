import { Icon } from "@iconify/react";
import clsx from "clsx";
import React, { useState } from "react";

interface Props {
  label?: string;
  value: string | null;
  onChange: (e: any) => void;
  options: {
    value: string;
    title: string;
  }[];
}

const CustomSelect = ({ label, options, value, onChange }: Props) => {
  const [dialogToggle, setDialogToggle] = useState<boolean>(false);

  function toggleDialog() {
    setDialogToggle(!dialogToggle);
  }

  return (
    <div className="flex flex-col items-start gap-1 text-left flex-1 relative">
      {label && (
        <label className="font-normal w-full text-lg text-primary-900 pl-3">
          {label}
        </label>
      )}
      <select className="hidden"></select>
      <button
        onClick={toggleDialog}
        className="rounded-lg gap-2 w-full text-primary-900 border border-disabled flex-1 relative px-3 py-2 flex items-center justify-between"
      >
        <p className="">
          {options.find((e) => e.value === value)?.title ||
            "Seleccionar opción"}
        </p>
        <Icon icon={"tabler:chevron-down"} className="text-lg" />
      </button>

      <div
        className={clsx([
          "absolute w-full bg-white shadow-md h-fit max-h-40 top-[115%] border border-stone-100 rounded-lg z-10 flex flex-col items-center transition-all",
          { "opacity-0 pointer-events-none -translate-y-5": !dialogToggle },
        ])}
      >
        <ul className="w-full h-fit p-1 flex flex-col gap-1">
          {options.map((option) => (
            <li
              role="button"
              className={clsx([
                "hover:bg-stone-200 cursor-pointer rounded-md",
                { "font-medium bg-stone-100": value === option.value },
              ])}
              key={option.value}
            >
              <button
                className="w-full h-full text-left py-1 px-2 flex items-center gap-2"
                onClick={(_) => {
                  toggleDialog();
                  onChange(option.value);
                }}
              >
                {option.title}
                {option.value === value && (
                  <Icon icon={"tabler:check"} className="text-lg" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CustomSelect;
