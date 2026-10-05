import { FinalidadTemplateRow } from "../types";

export interface FinalidadResolution {
  purposeNivel1Code?: string;
  purposeNivel1Label?: string;
  purposeNivel2?: string;
  purposeDetail?: string;
}

/**
 * Item Especificación de Finalidad de Tratamiento (Niveles 1, 2 y 3) — SMG,
 * 02-sep-2026. Reemplaza las variables {datos}/[cliente] de la plantilla
 * Nivel 3 (wizard_finalidad_templates.nivel3Template) por el primaryData
 * real del tratamiento y el nombre de la empresa.
 *
 * nivel3Variantes: ninguna pregunta del wizard distingue hoy la única
 * variante real del documento (Control de Asistencia, reloj/tarjeta vs. app
 * móvil — ver seed) — se usa siempre el template base hasta que exista esa
 * pregunta. La estructura ya está sembrada para no perder la data.
 */
export function resolveFinalidad(
  treatmentId: string,
  primaryData: string[],
  companyName: string,
  finalidadByTreatment: Map<string, FinalidadTemplateRow>,
  purposeNivel1Labels: Map<string, string>
): FinalidadResolution {
  const row = finalidadByTreatment.get(treatmentId);
  if (!row) return {};

  const datosTexto = primaryData.length > 0 ? primaryData.join(", ") : "los datos personales necesarios";
  const rendered = row.nivel3Template
    .replaceAll("{datos}", datosTexto)
    .replaceAll("{data_fields_texto}", datosTexto)
    .replaceAll("[cliente]", companyName)
    .replaceAll("[nombre cliente]", companyName);

  return {
    purposeNivel1Code: row.nivel1Code,
    purposeNivel1Label: purposeNivel1Labels.get(row.nivel1Code) ?? row.nivel1Code,
    purposeNivel2: row.nivel2Texto,
    purposeDetail: rendered,
  };
}
