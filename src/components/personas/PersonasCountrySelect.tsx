"use client";

import {
  PERSONAS_COUNTRIES,
  PERSONAS_COUNTRY_CONTENT,
} from "@/constants/personasCountryContent";
import { usePersonasCountryStore } from "@/store/usePersonasCountryStore";
import { PersonasCountryCode } from "@/types/personas.types";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  className?: string;
}

const MENU_MIN_WIDTH = 168;

const PersonasCountrySelect = ({ className }: Props) => {
  const country = usePersonasCountryStore((s) => s.country);
  const setCountry = usePersonasCountryStore((s) => s.setCountry);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: MENU_MIN_WIDTH });
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = PERSONAS_COUNTRY_CONTENT[country];

  const updateMenuPosition = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 6,
      left: rect.right - Math.max(rect.width, MENU_MIN_WIDTH),
      width: Math.max(rect.width, MENU_MIN_WIDTH),
    });
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    updateMenuPosition();

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      const portalMenu = document.getElementById("personas-country-menu");
      if (portalMenu?.contains(target)) return;
      setOpen(false);
    }

    function handleReposition() {
      updateMenuPosition();
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, updateMenuPosition]);

  function selectCountry(code: PersonasCountryCode) {
    setCountry(code);
    setOpen(false);
  }

  function toggleOpen() {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        requestAnimationFrame(updateMenuPosition);
      }
      return next;
    });
  }

  const dropdownMenu =
    mounted && open
      ? createPortal(
          <ul
            id="personas-country-menu"
            role="listbox"
            aria-label="Países disponibles"
            style={{
              position: "fixed",
              top: menuPosition.top,
              left: menuPosition.left,
              width: menuPosition.width,
              zIndex: 9999,
            }}
            className="overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-[0_12px_40px_rgba(0,11,80,0.15)] ring-1 ring-zinc-200/80"
          >
            {PERSONAS_COUNTRIES.map((code) => {
              const meta = PERSONAS_COUNTRY_CONTENT[code];
              const isActive = country === code;
              return (
                <li key={code} role="option" aria-selected={isActive}>
                  <button
                    type="button"
                    onClick={() => selectCountry(code)}
                    className={clsx(
                      "flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors",
                      isActive
                        ? "bg-primary-50 font-semibold text-primary-900"
                        : "text-zinc-700 hover:bg-zinc-50"
                    )}
                  >
                    <span className="text-lg leading-none" aria-hidden>
                      {meta.flag}
                    </span>
                    <span className="flex-1">{meta.label}</span>
                    {isActive && (
                      <Icon
                        icon="tabler:check"
                        className="shrink-0 text-base text-primary-600"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body
        )
      : null;

  return (
    <>
      <div ref={containerRef} className={clsx("relative w-[168px]", className)}>
        <button
          type="button"
          onClick={toggleOpen}
          className={clsx(
            "flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-3 py-2 text-left text-sm font-medium transition-all",
            open
              ? "border-primary-900/30 ring-2 ring-primary-900/10"
              : "border-zinc-200/90 hover:border-zinc-300 hover:bg-zinc-50/80"
          )}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Seleccionar país"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="text-lg leading-none" aria-hidden>
              {selected.flag}
            </span>
            <span className="truncate text-primary-900">{selected.label}</span>
          </span>
          <Icon
            icon="tabler:chevron-down"
            className={clsx(
              "shrink-0 text-lg text-zinc-500 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>
      </div>
      {dropdownMenu}
    </>
  );
};

export default PersonasCountrySelect;
