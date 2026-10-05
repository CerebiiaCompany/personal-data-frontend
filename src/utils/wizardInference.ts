import { SystemRecord, WizardAnswers, WizardTreatment } from "@/types/wizardRisk.types";
import {
  toWizardTreatment,
  wizardInferenceService,
  WizardInferenceContext,
  WizardInferenceRuleSet,
} from "@/services/wizard-inference";
import { getConditionalFieldValue, getSelectedValues, hasYesSelection } from "@/utils/wizardQuestionHelpers";
import {
  canonicalizeServerCountry,
  isConfirmedForeignCountry,
  UNKNOWN_SERVER_COUNTRY,
} from "@/services/wizard-inference/engine/serverCountry";

export const CEREBIIA_SYSTEM_ID = "locked-cerebiia";
export const CEREBIIA_SYSTEM_NAME = "CEREBIIA";

function systemId(key: string): string {
  return `inferred-${key}`;
}

export function isCerebiiaSystem(row: Pick<SystemRecord, "id" | "name">): boolean {
  return row.id === CEREBIIA_SYSTEM_ID || row.name.trim().toLowerCase() === CEREBIIA_SYSTEM_NAME.toLowerCase();
}

/** Fila fija: toda empresa cliente opera sobre CEREBIIA. */
export function buildCerebiiaSystemRecord(serverCountry = "US"): SystemRecord {
  return {
    ...system({
      id: CEREBIIA_SYSTEM_ID,
      name: CEREBIIA_SYSTEM_NAME,
      type: "Cumplimiento y Protección de Datos",
      provider: "CEREBIIA",
      storedData:
        "Datos de titulares, consentimientos, tratamientos, solicitudes ARCO y registros de cumplimiento",
      serverCountry,
      inferredFrom: "platform",
      locked: true,
    }),
    locked: true,
  };
}

function system(partial: Omit<SystemRecord, "deployment" | "hasSensitiveData" | "dpoProvidesServices">): SystemRecord {
  const serverCountry = canonicalizeServerCountry(partial.serverCountry) || UNKNOWN_SERVER_COUNTRY;
  const abroad = isConfirmedForeignCountry(serverCountry);
  const sensitive = /salud|clínic|biometric|menor/i.test(`${partial.storedData} ${partial.type}`);

  return {
    ...partial,
    serverCountry,
    deployment: abroad ? "cloud" : "onprem",
    hasSensitiveData: sensitive,
    dpoProvidesServices: false,
  };
}

/**
 * Sistemas sugeridos a partir de las respuestas de los bloques 1-3.
 * El usuario completa los huecos y puede agregar filas extra en la tabla.
 */
export function inferSystemsFromAnswers(answers: WizardAnswers): SystemRecord[] {
  const systems: SystemRecord[] = [];

  const web = getSelectedValues(answers["B1-P3"])[0];
  if (web === "propio") {
    const url = getConditionalFieldValue(answers["B1-P3"], "propio");
    systems.push(
      system({
        id: systemId("B1-P3-propio"),
        name: url || "Sitio web propio",
        type: "Sitio web",
        provider: "Propio",
        storedData: "Datos de visitantes, formularios de contacto y, si aplica, cuentas de usuario",
        serverCountry: "CL",
        inferredFrom: "B1-P3",
      })
    );
  }
  if (web === "ecommerce") {
    const url = getConditionalFieldValue(answers["B1-P3"], "ecommerce");
    systems.push(
      system({
        id: systemId("B1-P3-ecommerce"),
        name: url || "Tienda en línea o e-commerce",
        type: "E-commerce",
        provider: "Por confirmar",
        storedData: "Datos de clientes, pedidos y, si aplica, medios de pago tokenizados",
        serverCountry: UNKNOWN_SERVER_COUNTRY,
        inferredFrom: "B1-P3",
      })
    );
  }

  if (hasYesSelection(answers["B1-P4"])) {
    const appName = getConditionalFieldValue(answers["B1-P4"], "si");
    systems.push(
      system({
        id: systemId("B1-P4"),
        name: appName || "Aplicación móvil propia",
        type: "Aplicación móvil",
        provider: "Propio",
        storedData: "Datos de usuarios de la aplicación y, si aplica, ubicación o identificadores del dispositivo",
        serverCountry: UNKNOWN_SERVER_COUNTRY,
        inferredFrom: "B1-P4",
      })
    );
  }

  if (hasYesSelection(answers["B2-P7"])) {
    systems.push(
      system({
        id: systemId("B2-P7"),
        name: "Videovigilancia",
        type: "Cámaras",
        provider: "Por confirmar",
        storedData: "Imágenes de personas en áreas de atención, empleados o bodegas",
        serverCountry: "CL",
        inferredFrom: "B2-P7",
      })
    );
  }

  if (hasYesSelection(answers["B2-P8"])) {
    systems.push(
      system({
        id: systemId("B2-P8"),
        name: "Control biométrico",
        type: "Biometría",
        provider: "Por confirmar",
        storedData: "Huella digital, reconocimiento facial u otros datos biométricos",
        serverCountry: "CL",
        inferredFrom: "B2-P8",
      })
    );
  }

  const cloud = getSelectedValues(answers["B2-P11"]);
  if (cloud.includes("cloud")) {
    systems.push(
      system({
        id: systemId("B2-P11-cloud"),
        name: "Servicios en la nube",
        type: "Cloud",
        provider: "Google Workspace, Microsoft 365, AWS, Azure u otro",
        storedData: "Correo, archivos y datos operacionales",
        serverCountry: UNKNOWN_SERVER_COUNTRY,
        inferredFrom: "B2-P11",
      })
    );
  }
  if (cloud.includes("saas")) {
    systems.push(
      system({
        id: systemId("B2-P11-saas"),
        name: "CRM, ERP o software SaaS",
        type: "SaaS",
        provider: "Por confirmar",
        storedData: "Datos de clientes, empleados u operación",
        serverCountry: UNKNOWN_SERVER_COUNTRY,
        inferredFrom: "B2-P11",
      })
    );
  }
  if (cloud.includes("marketing_analytics")) {
    systems.push(
      system({
        id: systemId("B2-P11-marketing"),
        name: "Marketing o analytics",
        type: "Marketing",
        provider: "Mailchimp, HubSpot, Google Analytics u otro",
        storedData: "Datos de contacto, aperturas y comportamiento web",
        serverCountry: UNKNOWN_SERVER_COUNTRY,
        inferredFrom: "B2-P11",
      })
    );
  }

  const destinos = getConditionalFieldValue(answers["B2-P12"], "si");
  if (hasYesSelection(answers["B2-P12"])) {
    systems.push(
      system({
        id: systemId("B2-P12"),
        name: "Destinatario en el extranjero",
        type: "Transferencia internacional",
        provider: destinos || "Empresa en el extranjero",
        storedData: "Datos de clientes o empleados enviados al exterior",
        serverCountry: canonicalizeServerCountry(destinos) || UNKNOWN_SERVER_COUNTRY,
        inferredFrom: "B2-P12",
      })
    );
  }

  const outsource = getSelectedValues(answers["B2-P14"]);
  if (outsource.includes("call_center")) {
    const empresa = getConditionalFieldValue(answers["B2-P14"], "call_center");
    systems.push(
      system({
        id: systemId("B2-P14-call"),
        name: empresa || "Call center externo",
        type: "Call center",
        provider: empresa || "Por confirmar",
        storedData: "Datos de clientes para atención",
        serverCountry: UNKNOWN_SERVER_COUNTRY,
        inferredFrom: "B2-P14",
      })
    );
  }
  if (outsource.includes("cobranza")) {
    const empresa = getConditionalFieldValue(answers["B2-P14"], "cobranza");
    systems.push(
      system({
        id: systemId("B2-P14-cobranza"),
        name: empresa || "Cobranza tercerizada",
        type: "Cobranza",
        provider: empresa || "Por confirmar",
        storedData: "Datos de contacto y deuda de clientes",
        serverCountry: UNKNOWN_SERVER_COUNTRY,
        inferredFrom: "B2-P14",
      })
    );
  }
  if (outsource.includes("otros")) {
    const detalle = getConditionalFieldValue(answers["B2-P14"], "otros");
    systems.push(
      system({
        id: systemId("B2-P14-otros"),
        name: detalle || "Servicio externo con acceso a datos",
        type: "Encargado",
        provider: detalle || "Por confirmar",
        storedData: "Datos personales según el servicio tercerizado",
        serverCountry: UNKNOWN_SERVER_COUNTRY,
        inferredFrom: "B2-P14",
      })
    );
  }

  if (hasYesSelection(answers["B3-P20"])) {
    systems.push(
      system({
        id: systemId("B3-P20"),
        name: "Base de datos de clientes",
        type: "Base de datos",
        provider: "Por confirmar",
        storedData: "Datos identificatorios y comerciales de clientes",
        serverCountry: UNKNOWN_SERVER_COUNTRY,
        inferredFrom: "B3-P20",
      })
    );
  }

  if (hasYesSelection(answers["B3-P21"])) {
    systems.push(
      system({
        id: systemId("B3-P21"),
        name: "Facturación electrónica",
        type: "Facturación",
        provider: "Facturador / SII",
        storedData: "RUT, razón social, montos y detalle tributario",
        serverCountry: "CL",
        inferredFrom: "B3-P21",
      })
    );
  }

  const pagos = getSelectedValues(answers["B3-P28"]);
  if (pagos.includes("transbank")) {
    systems.push(
      system({
        id: systemId("B3-P28-transbank"),
        name: "Transbank / WebPay / POS físico",
        type: "Pagos",
        provider: "Transbank",
        storedData: "Datos de transacción y, si aplica, identificadores de pago",
        serverCountry: "CL",
        inferredFrom: "B3-P28",
      })
    );
  }
  if (pagos.includes("pasarela")) {
    const pasarela = getConditionalFieldValue(answers["B3-P28"], "pasarela");
    systems.push(
      system({
        id: systemId("B3-P28-pasarela"),
        name: pasarela || "Pasarela de pago en línea",
        type: "Pagos",
        provider: pasarela || "Por confirmar",
        storedData: "Datos de transacción y referencia del pagador",
        serverCountry: UNKNOWN_SERVER_COUNTRY,
        inferredFrom: "B3-P28",
      })
    );
  }
  if (pagos.includes("billeteras")) {
    systems.push(
      system({
        id: systemId("B3-P28-billeteras"),
        name: "Billeteras digitales o fintech",
        type: "Pagos",
        provider: "Por confirmar",
        storedData: "Datos de transacción y cuenta del pagador",
        serverCountry: UNKNOWN_SERVER_COUNTRY,
        inferredFrom: "B3-P28",
      })
    );
  }

  return systems;
}

export function mergeInferredSystems(existing: SystemRecord[], inferred: SystemRecord[]): SystemRecord[] {
  if (existing.length === 0) return inferred;

  const byId = new Map(existing.map((row) => [row.id, row]));
  const merged = [...existing];

  for (const row of inferred) {
    if (byId.has(row.id)) continue;
    if (existing.some((current) => current.name.trim().toLowerCase() === row.name.trim().toLowerCase())) continue;
    merged.push(row);
  }

  return merged;
}

/**
 * Bloque 4: CEREBIIA siempre primero (no se puede quitar), luego lo ya
 * guardado y lo inferido de B1–B3.
 */
export function mergeWizardBlock4Systems(
  existing: SystemRecord[],
  inferred: SystemRecord[],
  cerebiiaCountry = "US"
): SystemRecord[] {
  const previousCerebiia = existing.find(isCerebiiaSystem);
  const defaults = buildCerebiiaSystemRecord(previousCerebiia?.serverCountry || cerebiiaCountry);
  const cerebiia: SystemRecord = {
    ...defaults,
    storedData: previousCerebiia?.storedData?.trim() || defaults.storedData,
    serverCountry:
      canonicalizeServerCountry(previousCerebiia?.serverCountry?.trim() || defaults.serverCountry) ||
      defaults.serverCountry,
  };
  const rest = mergeInferredSystems(
    existing.filter((row) => !isCerebiiaSystem(row)),
    inferred
  );
  return [cerebiia, ...rest];
}

export function mergeInferredTreatments(existing: WizardTreatment[], inferred: WizardTreatment[]): WizardTreatment[] {
  if (existing.length === 0) return inferred;

  const byId = new Map(existing.map((row) => [row.id, row]));
  const result: WizardTreatment[] = inferred.map((row) => byId.get(row.id) ?? row);

  for (const leftover of existing) {
    if (leftover.sourceKeys.length === 0 && !result.some((row) => row.id === leftover.id)) {
      result.push(leftover);
    }
  }

  return result;
}

export function inferTreatmentsFromAnswers(
  answers: WizardAnswers,
  systems: SystemRecord[] = [],
  rules: WizardInferenceRuleSet,
  context: WizardInferenceContext
): WizardTreatment[] {
  const result = wizardInferenceService.infer(
    {
      answers,
      systems: systems.map((row) => ({
        id: row.id,
        name: row.name,
        type: row.type,
        provider: row.provider,
        storedData: row.storedData,
        serverCountry: row.serverCountry,
        dpoProvidesServices: row.dpoProvidesServices,
      })),
    },
    rules,
    context
  );

  return result.treatments.map(toWizardTreatment);
}

export function emptySystemDraft(): Omit<SystemRecord, "id"> {
  return {
    name: "",
    type: "",
    provider: "",
    storedData: "",
    serverCountry: "",
    deployment: "onprem",
    hasSensitiveData: false,
    dpoProvidesServices: false,
  };
}

export function hydrateSystemRecord(row: Partial<SystemRecord> & Pick<SystemRecord, "id">): SystemRecord {
  return {
    id: row.id,
    name: row.name ?? "",
    type: row.type ?? "",
    provider: row.provider ?? "",
    storedData: row.storedData ?? "",
    serverCountry: canonicalizeServerCountry(row.serverCountry ?? ""),
    inferredFrom: row.inferredFrom,
    catalogId: row.catalogId,
    locked: row.locked,
    deployment: row.deployment,
    hasSensitiveData: row.hasSensitiveData,
    dpoProvidesServices: row.dpoProvidesServices,
  };
}

export function normalizeSystemForApi(systemRow: SystemRecord): SystemRecord {
  const serverCountry = canonicalizeServerCountry(systemRow.serverCountry) || UNKNOWN_SERVER_COUNTRY;
  const abroad = isConfirmedForeignCountry(serverCountry);
  return {
    ...systemRow,
    type: systemRow.type || "Otro",
    storedData: systemRow.storedData || "Por confirmar",
    serverCountry,
    deployment: systemRow.deployment ?? (abroad ? "cloud" : "onprem"),
    hasSensitiveData: systemRow.hasSensitiveData ?? false,
    dpoProvidesServices: systemRow.dpoProvidesServices ?? false,
  };
}
