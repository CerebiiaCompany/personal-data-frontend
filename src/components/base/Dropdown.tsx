"use client";

import { Icon } from "@iconify/react";
import Button from "./Button";
import { useState } from "react";
import clsx from "clsx";

interface Props {
  value?: string;
  options: {
    value: string;
    label: string;
  }[];
  onChange: (value: string) => void;
}

const Dropdown = ({ value, options, onChange }: Props) => {
  const [dialogToggle, setDialogToggle] = useState<boolean>(false);

  function toggleDialog() {
    setDialogToggle(!dialogToggle);
  }

  function selectOption(value: string) {
    onChange(value);
    toggleDialog();
  }

  return (
    <div className="relative">
      <Button
        onClick={toggleDialog}
        hierarchy="secondary"
        className="w-full"
        startContent={
          <Icon
            icon={"tabler:chevron-down"}
            style={{
              rotate: dialogToggle ? "-180deg" : "0deg",
            }}
            className="text-xl transition-transform"
          />
        }
      >
        <p className="text-ellipsis whitespace-nowrap overflow-hidden">
          {options.find((e) => e.value === value)?.label}
        </p>
      </Button>

      {dialogToggle ? (
        <div className="bg-white animate-appear rounded-lg shadow-primary-shadows shadow-lg h-fit p-1 max-h-72 w-[150%] absolute top-[130%] left-1/2 -translate-x-1/2 z-20">
          <div className="pointer-events-none rotate-180 w-10 h-1 grid place-content-center absolute bottom-full left-1/2 -translate-x-1/2">
            <Icon icon={"nrk:arrow-dropdown"} className="text-6xl text-white" />
          </div>

          <ul className="flex flex-col gap-1">
            {options.map((option) => (
              <li
                onClick={(e) => selectOption(option.value)}
                key={option.value}
                className={clsx([
                  "cursor-pointer rounded-md w-full text-center text-ellipsis whitespace-nowrap overflow-hidden hover:bg-stone-200 transition-colors font-normal flex justify-center gap-1 items-center py-1",
                  {
                    "bg-stone-100 font-semibold": value === option.value,
                  },
                ])}
              >
                {value === option.value ? (
                  <Icon icon={"tabler:check"} className="text-xl" />
                ) : null}
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default Dropdown;
