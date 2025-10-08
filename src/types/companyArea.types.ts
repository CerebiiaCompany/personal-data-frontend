import { CustomSelectOption } from "./forms.types";
import { SessionUser } from "./user.types";

export type CountryIsoCode = "co" | "ve" | "us"; // ISO 3166-1 alpha-2

export const countriesOptions: CustomSelectOption<CountryIsoCode>[] = [
  {
    value: "co",
    title: "Colombia",
  },
  {
    value: "ve",
    title: "Venezuela",
  },
  {
    value: "us",
    title: "Estados Unidos",
  },
];

export const parseCompanyAreaCountryToString = (
  country: CountryIsoCode
): string =>
  countriesOptions.find((e) => e.value === country)?.title || "País inválido";

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
