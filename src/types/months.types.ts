import { CustomSelectOption } from "./forms.types";

export type MONTH_KEY =
  | "jan"
  | "feb"
  | "mar"
  | "apr"
  | "may"
  | "jun"
  | "jul"
  | "aug"
  | "sep"
  | "oct"
  | "nov"
  | "dec";

export const monthsOptions: CustomSelectOption<MONTH_KEY>[] = [
  { title: "Enero", value: "jan" },
  { title: "Febrero", value: "feb" },
  { title: "Marzo", value: "mar" },
  { title: "Abril", value: "apr" },
  { title: "Mayo", value: "may" },
  { title: "Junio", value: "jun" },
  { title: "Julio", value: "jul" },
  { title: "Agosto", value: "aug" },
  { title: "Septiembre", value: "sep" },
  { title: "Octubre", value: "oct" },
  { title: "Noviembre", value: "nov" },
  { title: "Diciembre", value: "dec" },
];

export function getMonthRange(
  monthKey: MONTH_KEY,
  year: number = new Date().getFullYear()
) {
  const monthIndex = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ].indexOf(monthKey);

  if (monthIndex === -1) throw new Error("Invalid month key");

  const startDate = new Date(year, monthIndex, 1, 0, 0, 0);
  const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59);

  return { startDate, endDate };
}
