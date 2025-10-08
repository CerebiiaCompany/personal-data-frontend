import { CustomSelectOption } from "./forms.types";

export type PlanCurrency = "USD" | "COP";

export type PlanPeriodType = "MONTHLY" | "QUARTERLY" | "ANNUAL";

export const planPeriodTypeOptions: CustomSelectOption<PlanPeriodType>[] = [
  {
    value: "MONTHLY",
    title: "Mensual",
  },
  {
    value: "QUARTERLY",
    title: "Trimestral",
  },
  {
    value: "ANNUAL",
    title: "Anual",
  },
];
export const parsePeriodTypeToString = (type: PlanPeriodType): string =>
  planPeriodTypeOptions.find((e) => e.value === type)?.title ||
  "Tipo de periodo inválido";

/**
 * We first declare the interface for the schema's shape so we can pass it
 * to the generic parameters of Schema to get proper method typings.
 */

export interface Plan {
  _id: string;
  name: string; // e.g. "Basic", "Pro", "Enterprise"
  description?: string; // short description of the plan
  prices: Record<PlanPeriodType, number>; // cost in the chosen currency
  currency: PlanCurrency; // e.g. "USD", "EUR"
  active: boolean; // whether the plan can be purchased
  monthlyCredits: number;
  createdAt: Date;
  updatedAt: Date;
}
