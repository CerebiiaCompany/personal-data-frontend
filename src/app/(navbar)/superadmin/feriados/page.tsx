"use client";

import Button from "@/components/base/Button";
import { useConfirm } from "@/components/dialogs/ConfirmProvider";
import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import CustomSelect from "@/components/forms/CustomSelect";
import { usePublicHolidays } from "@/hooks/usePublicHolidays";
import {
  createPublicHoliday,
  deletePublicHoliday,
} from "@/lib/publicHoliday.api";
import {
  getHolidayCountryLabel,
  HOLIDAY_COUNTRY_OPTIONS,
  PublicHoliday,
} from "@/types/publicHoliday.types";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const NAVY = "#1A2B5B";

/** Formatea la fecha DATE en UTC para evitar el corrimiento por zona horaria. */
function formatHolidayDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-CO", {
    weekday: "short",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

const countryFilterOptions = [
  { value: "", title: "Todos los países" },
  ...HOLIDAY_COUNTRY_OPTIONS,
];

export default function PublicHolidaysPage() {
  const confirm = useConfirm();
  const [countryFilter, setCountryFilter] = useState("");

  const { data, loading, error, refresh } = usePublicHolidays({
    countryCode: countryFilter || undefined,
  });

  // Formulario de creación
  const [formCountry, setFormCountry] = useState("CL");
  const [formDate, setFormDate] = useState("");
  const [formName, setFormName] = useState("");
  const [creating, setCreating] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<string, PublicHoliday[]>();
    for (const h of data ?? []) {
      const list = map.get(h.countryCode) ?? [];
      list.push(h);
      map.set(h.countryCode, list);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [data]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formCountry || !formDate || !formName.trim()) {
      toast.error("País, fecha y nombre son obligatorios");
      return;
    }

    setCreating(true);
    const res = await createPublicHoliday({
      countryCode: formCountry,
      date: formDate,
      name: formName.trim(),
    });
    setCreating(false);

    if (res.error) {
      if (res.error.code === "db/duplicate-key") {
        toast.error("Ya existe un feriado con esa fecha para ese país");
        return;
      }
      showApiErrorToast(res.error, res.error.status);
      return;
    }

    toast.success("Feriado creado");
    setFormDate("");
    setFormName("");
    refresh();
  }

  async function handleDelete(holiday: PublicHoliday) {
    const ok = await confirm({
      title: "Eliminar feriado",
      description: `¿Eliminar "${holiday.name}" (${formatHolidayDate(
        holiday.date
      )})? Esta acción afecta el cálculo de plazos.`,
      confirmText: "Eliminar",
      danger: true,
    });
    if (!ok) return;

    const res = await deletePublicHoliday(holiday.id);
    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
      return;
    }
    toast.success("Feriado eliminado");
    refresh();
  }

  const inputClass =
    "h-11 w-full rounded-xl border border-[#E4EAF6] px-3 text-sm text-primary-900 outline-none focus:border-primary-900 focus:ring-2 focus:ring-primary-500/20";

  return (
    <div className="flex min-h-full w-full flex-col bg-[#F8FAFC]">
      <div className="w-full px-5 pt-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <header className="rounded-2xl border border-[#E8EDF7] bg-white px-5 py-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:px-6 sm:py-6">
          <nav className="mb-3 flex flex-wrap items-center gap-2 text-sm text-[#64748B]">
            <Link href="/superadmin" className="hover:underline">
              Dashboard
            </Link>
            <Icon icon="tabler:chevron-right" className="text-base text-[#94A3B8]" />
            <span className="font-semibold" style={{ color: NAVY }}>
              Feriados
            </span>
          </nav>
          <h1
            className="text-[24px] font-bold tracking-tight sm:text-[26px]"
            style={{ color: NAVY }}
          >
            Feriados — Motor de Plazos
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[#64748B]">
            Los feriados afectan el cálculo de plazos legales (días hábiles) de
            las solicitudes ARCO por país.
          </p>
        </header>
      </div>

      <div className="w-full px-5 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Formulario de creación */}
          <section className="rounded-2xl border border-[#E8EDF7] bg-white p-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)] lg:col-span-1">
            <h2 className="mb-4 text-sm font-semibold text-[#1A2B5B]">
              Agregar feriado
            </h2>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <CustomSelect
                label="País"
                options={HOLIDAY_COUNTRY_OPTIONS}
                value={formCountry}
                onChange={setFormCountry}
              />
              <div className="flex flex-col gap-1">
                <label className="pl-2 text-sm font-medium text-stone-500">
                  Fecha
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="pl-2 text-sm font-medium text-stone-500">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej. Fiestas Patrias"
                  className={inputClass}
                />
              </div>
              <Button type="submit" loading={creating}>
                Agregar feriado
              </Button>
            </form>
          </section>

          {/* Listado */}
          <section className="rounded-2xl border border-[#E8EDF7] bg-white shadow-[0_2px_12px_rgba(15,35,70,0.04)] lg:col-span-2">
            <div className="flex flex-col gap-3 border-b border-[#EEF2F8] p-5 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-semibold text-[#1A2B5B]">
                Feriados registrados
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-52">
                  <CustomSelect
                    options={countryFilterOptions}
                    value={countryFilter}
                    unselectedText="Todos los países"
                    onChange={setCountryFilter}
                  />
                </div>
                <Button
                  hierarchy="tertiary"
                  onClick={refresh}
                  isIconOnly
                  aria-label="Actualizar"
                >
                  <Icon icon="tabler:refresh" className="text-lg" />
                </Button>
              </div>
            </div>

            <div className="p-5">
              {loading && !data ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-12 w-full animate-pulse rounded-xl bg-[#F1F5FB]"
                    />
                  ))}
                </div>
              ) : error && !data ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <Icon
                    icon="tabler:alert-triangle"
                    className="text-3xl text-rose-400"
                  />
                  <p className="text-sm text-[#64748B]">{error}</p>
                </div>
              ) : grouped.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <Icon
                    icon="tabler:calendar-off"
                    className="text-3xl text-[#94A3B8]"
                  />
                  <p className="text-sm text-[#64748B]">
                    No hay feriados registrados
                    {countryFilter
                      ? ` para ${getHolidayCountryLabel(countryFilter)}`
                      : ""}
                    .
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {grouped.map(([code, holidays]) => (
                    <div key={code}>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-md bg-[#EEF3FF] px-2 py-0.5 text-xs font-semibold text-[#3357A5]">
                          {getHolidayCountryLabel(code)}
                        </span>
                        <span className="text-xs text-[#94A3B8]">
                          {holidays.length} feriado(s)
                        </span>
                      </div>
                      <ul className="flex flex-col divide-y divide-[#F1F5FB] overflow-hidden rounded-xl border border-[#EEF2F8]">
                        {holidays.map((h) => (
                          <li
                            key={h.id}
                            className="flex items-center justify-between gap-3 px-4 py-3"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-[#1A2B5B]">
                                {h.name}
                              </p>
                              <p className="text-xs text-[#64748B]">
                                {formatHolidayDate(h.date)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDelete(h)}
                              className="shrink-0 rounded-lg p-2 text-rose-500 transition-colors hover:bg-rose-50"
                              aria-label={`Eliminar ${h.name}`}
                            >
                              <Icon icon="tabler:trash" className="text-lg" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
