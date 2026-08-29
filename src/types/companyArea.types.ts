import { CustomSelectOption } from "./forms.types";
import { SessionUser } from "./user.types";

// Item CHK-014 (auditoría 2026-08-26/27): antes solo 4 países
// (cl/co/ve/us). LATAM completo + España, códigos ISO 3166-1 alpha-2 en
// minúscula (convención ya establecida en este archivo — el resto del
// código, ej. country.utils.ts, ya asume minúsculas).
export type CountryIsoCode =
  | "cl"
  | "ar"
  | "bo"
  | "br"
  | "co"
  | "cr"
  | "cu"
  | "do"
  | "ec"
  | "sv"
  | "es"
  | "gt"
  | "hn"
  | "mx"
  | "ni"
  | "pa"
  | "py"
  | "pe"
  | "pr"
  | "uy"
  | "ve"
  | "us";

// Orden: Chile primero (preseleccionado por getDefaultAreaCountryByJurisdiction
// para empresas CL), luego el resto de LATAM + España alfabético, EE.UU. al final.
export const countriesOptions: CustomSelectOption<CountryIsoCode>[] = [
  { value: "cl", title: "Chile" },
  { value: "ar", title: "Argentina" },
  { value: "bo", title: "Bolivia" },
  { value: "br", title: "Brasil" },
  { value: "co", title: "Colombia" },
  { value: "cr", title: "Costa Rica" },
  { value: "cu", title: "Cuba" },
  { value: "do", title: "República Dominicana" },
  { value: "ec", title: "Ecuador" },
  { value: "sv", title: "El Salvador" },
  { value: "es", title: "España" },
  { value: "gt", title: "Guatemala" },
  { value: "hn", title: "Honduras" },
  { value: "mx", title: "México" },
  { value: "ni", title: "Nicaragua" },
  { value: "pa", title: "Panamá" },
  { value: "py", title: "Paraguay" },
  { value: "pe", title: "Perú" },
  { value: "pr", title: "Puerto Rico" },
  { value: "uy", title: "Uruguay" },
  { value: "ve", title: "Venezuela" },
  { value: "us", title: "Estados Unidos" },
];

export function getDefaultAreaCountryByJurisdiction(
  countryCode?: string | null
): CountryIsoCode {
  return countryCode?.toUpperCase() === "CL" ? "cl" : "co";
}

export const parseCompanyAreaCountryToString = (
  country: string
): string =>
  countriesOptions.find((e) => e.value === country.toLowerCase())?.title ||
  "País inválido";

export interface CreateCompanyArea {
  name: string;
  country: CountryIsoCode;
  state: string;
  city: string;
  address: string;
  tags: string[];
  users?: string[];
}

export interface CompanyArea extends Omit<CreateCompanyArea, "users"> {
  _id: string;
  companyId: string;
  usersCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CompanyAreaUser = Pick<
  SessionUser,
  "_id" | "name" | "lastName" | "companyUserData"
>;
