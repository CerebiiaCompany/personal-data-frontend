import { CustomSelectOption } from "@/types/forms.types";
import { Icon } from "@iconify/react";
import clsx from "clsx";
import React, { useRef, useState } from "react";

interface Props<T extends string> {
  label?: string;
  value?: T;
  unselectedText?: string;
  onChange: (e: T) => void;
  options: CustomSelectOption<T>[];
  className?: string;
}

const CustomSelect = <T extends string>({
  label,
  options,
  value,
  unselectedText,
  className,
  onChange,
}: Props<T>) => {
  const [dialogToggle, setDialogToggle] = useState<boolean>(false);
  const [dialogDown, setDialogDown] = useState<boolean>(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((e) => e.value === value);

  function toggleDialog() {
    if (!dialogToggle) {
      calcDialogAnchor();
    }
    setDialogToggle(!dialogToggle);
  }

  function calcDialogAnchor() {
    if (!dialogRef.current) return;

    const appearPoint =
      window.innerHeight -
      dialogRef.current.parentElement!.getBoundingClientRect().top; // get appear point

    if (appearPoint < dialogRef.current.clientHeight) {
      // dialog doesn't fit
      setDialogDown(false);
    } else {
      setDialogDown(true);
    }
  }

  return (
    <div
      className={clsx([
        "flex flex-col items-start gap-1 text-left flex-1 relative h-fit",
        className,
      ])}
    >
      {label && (
        <label className="font-medium w-full text-ellipsis pl-2 text-stone-500 text-sm">
          {label}
        </label>
      )}
      {dialogToggle && (
        <div
          onClick={toggleDialog}
          className="z-10 fixed left-0 top-0 w-full h-screen"
        ></div>
      )}
      <select className="hidden"></select>
      <button
        type="button"
        onClick={toggleDialog}
        className="rounded-lg gap-2 w-full text-primary-900 border border-primary-900 flex-1 relative px-3 py-2 flex items-center justify-between bg-primary-50 text-ellipsis"
      >
        {selectedOption ? (
          <div className="flex items-center gap-2">
            {selectedOption.icon && (
              <Icon icon={selectedOption.icon} className="text-lg w-fit" />
            )}
            <p className="">{selectedOption.title}</p>
          </div>
        ) : (
          unselectedText || "Seleccionar opción"
        )}
        <Icon icon={"tabler:chevron-down"} className="text-lg" />
      </button>

      <div
        ref={dialogRef}
        className={clsx([
          "absolute w-full bg-white shadow-md h-fit max-h-40 border border-stone-100 rounded-lg z-20 flex flex-col items-center transition-all overflow-y-auto",
          { "opacity-0 pointer-events-none -translate-y-5": !dialogToggle },
          { "top-[115%] origin-top": dialogDown },
          { "bottom-[115%] origin-bottom": !dialogDown },
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
                type="button"
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
