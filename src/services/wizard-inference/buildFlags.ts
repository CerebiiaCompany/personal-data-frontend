import { firstValue, hasYes, employeeCountMin } from "./answerReader";
import { isConfirmedForeignCountry } from "./engine/serverCountry";
import { WizardInferenceFlags, WizardInferenceInput } from "./types";

/**
 * Variables globales de Bloques 1-2 y sistemas del Bloque 4.
 * Las tablas 6 y 7 consultan este objeto, no las respuestas crudas.
 */
export function buildWizardInferenceFlags(input: WizardInferenceInput): WizardInferenceFlags {
  const { answers, systems = [] } = input;
  const employeeBand = firstValue(answers, "B1-P2");
  const min = employeeCountMin(employeeBand);
  const paymentYes = hasYes(answers, "B3-P28");
  const foreignPayment = paymentYes && (hasYes(answers, "B3-P28", ["pasarela", "billeteras"]) || systems.some((row) => /pago|pasarela|stripe|paypal/i.test(`${row.type} ${row.provider}`)));

  // Item C-02 — ver comentario de hasIntlTransfer en types.ts.
  const foreignCloud =
    hasYes(answers, "B2-P11", ["cloud"]) || systems.some((row) => isConfirmedForeignCountry(row.serverCountry));
  const foreignCrm = hasYes(answers, "B2-P11", ["saas"]);
  const foreignMarketingSaas = hasYes(answers, "B2-P11", ["marketing_analytics"]);
  const hasIntlTransfer = foreignCloud || foreignCrm || foreignMarketingSaas || foreignPayment || hasYes(answers, "B2-P12");

  return {
    industry: firstValue(answers, "B1-P1"),
    employeeBand,
    employeeCountMin: min,
    employeesGt5: min > 5,
    employeesGt50: min > 50,
    hasWebsite: hasYes(answers, "B1-P3"),
    hasMobileApp: hasYes(answers, "B1-P4"),
    hasHealthClientData: hasYes(answers, "B2-P6", ["salud_clientes"]),
    hasHealthEmployeeData: hasYes(answers, "B2-P6", ["salud_empleados"]) || hasYes(answers, "B3-P19"),
    hasCameras: hasYes(answers, "B2-P7"),
    hasBiometrics: hasYes(answers, "B2-P8"),
    hasEmployeeBiometrics: hasYes(answers, "B2-P8", ["huella_empleados"]),
    hasMarketing: hasYes(answers, "B2-P9") || hasYes(answers, "B3-P23"),
    hasMinors: hasYes(answers, "B2-P10"),
    hasForeignCloud: foreignCloud,
    hasForeignCrm: foreignCrm,
    hasForeignMarketingSaas: foreignMarketingSaas,
    hasForeignPayment: foreignPayment,
    hasExternalProcessor: hasYes(answers, "B2-P14") || systems.some((row) => row.dpoProvidesServices),
    hasProfiling: hasYes(answers, "B2-P15"),
    hasAutomatedDecisions: hasYes(answers, "B2-P13"),
    hasSurveys: hasYes(answers, "B3-P24"),
    hasPhysicalPremises: true,
    hasIntlTransfer,
  };
}
