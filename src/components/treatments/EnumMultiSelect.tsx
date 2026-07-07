import { CustomSelectOption } from "@/types/forms.types";
import { Icon } from "@iconify/react";
import clsx from "clsx";

interface Props<T extends string> {
  label?: string;
  options: CustomSelectOption<T>[];
  value: T[];
  onChange: (next: T[]) => void;
  disabled?: boolean;
  hint?: string;
}

/**
 * Selector múltiple por chips para enums (categorías de datos, titulares,
 * medidas de seguridad). Controlado; no hace fetch. Cada opción alterna su
 * pertenencia al arreglo `value`.
 */
function EnumMultiSelect<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled = false,
  hint,
}: Props<T>) {
  function toggle(option: T) {
    if (disabled) return;
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="pl-1 text-sm font-medium text-stone-500">
          {label}
        </label>
      )}
      {hint && <p className="pl-1 text-xs text-[#64748B]">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggle(option.value)}
              disabled={disabled}
              aria-pressed={selected}
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                selected
                  ? "border-primary-900 bg-primary-50 text-primary-900"
                  : "border-[#E4EAF6] bg-white text-[#64748B] hover:border-primary-300",
                disabled && "cursor-not-allowed opacity-60"
              )}
            >
              <Icon
                icon={selected ? "tabler:check" : "tabler:plus"}
                className="text-sm"
              />
              {option.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default EnumMultiSelect;
