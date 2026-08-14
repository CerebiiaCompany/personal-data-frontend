/**
 * Reglas de validación para el parámetro de texto libre ({{3}}) de la plantilla de
 * WhatsApp de marketing/notificación (cerebiia_data_notificaciones). A diferencia del
 * resto del contenido de la plantilla (ya aprobado por Meta), este valor lo escribe
 * cada empresa en cada campaña y se inserta en el mensaje sin revisión previa de Meta
 * — un texto que viole las políticas de WhatsApp Business puede hacer que Meta
 * suspenda o restrinja el número de WhatsApp de la cuenta. Espejo del validador del
 * backend (utils/whatsappTemplateValidation.ts) para dar feedback inmediato en el
 * formulario — el backend sigue siendo la fuente de verdad al crear/activar.
 */

export const WHATSAPP_FREE_TEXT_MAX_LENGTH = 550;
const MAX_CONSECUTIVE_SPACES = 4;

export interface WhatsappFreeTextValidationResult {
  valid: boolean;
  errors: string[];
}

const DIACRITIC_MARKS_REGEX = new RegExp("[\\u0300-\\u036f]", "g");

function normalizeForMatch(text: string): string {
  return text.normalize("NFD").replace(DIACRITIC_MARKS_REGEX, "").toLowerCase();
}

const PROHIBITED_WORDS = new Set([
  "cerveza", "cervezas", "whisky", "whiskey", "vodka", "tequila", "aguardiente",
  "licor", "licores", "alcohol", "alcoholicas", "alcoholico", "ron", "vino", "vinos",
  "cigarrillo", "cigarrillos", "cigarro", "cigarros", "tabaco", "vapeador", "vapeadores", "vape",
  "arma", "armas", "pistola", "pistolas", "rifle", "rifles", "municion", "municiones",
  "explosivo", "explosivos", "granada", "granadas",
  "cocaina", "marihuana", "heroina", "droga", "drogas", "narcotico", "narcoticos", "metanfetamina",
  "apuesta", "apuestas", "casino", "ruleta",
  "pornografia", "escort", "escorts",
  "suicidio", "autolesion",
]);

const PROHIBITED_PHRASES: string[] = [
  "dinero facil",
  "dinero garantizado",
  "gane dinero",
  "juegos de azar",
  "prestamo sin buro",
  "inversion garantizada",
  "contenido sexual",
  "servicios sexuales",
  "discurso de odio",
];

function findProhibitedContent(text: string): string | null {
  const normalized = normalizeForMatch(text);
  const tokens = normalized.split(/[^a-z0-9]+/).filter(Boolean);

  for (const token of tokens) {
    if (PROHIBITED_WORDS.has(token)) return token;
  }

  const joined = ` ${tokens.join(" ")} `;
  for (const phrase of PROHIBITED_PHRASES) {
    if (joined.includes(` ${phrase} `)) return phrase;
  }

  return null;
}

export function validateWhatsappFreeTextParam(
  raw: string | null | undefined
): WhatsappFreeTextValidationResult {
  const errors: string[] = [];
  const text = raw ?? "";

  if (!text.trim()) {
    errors.push("El texto no puede estar vacío.");
    return { valid: false, errors };
  }

  if (text.length > WHATSAPP_FREE_TEXT_MAX_LENGTH) {
    errors.push(
      `El texto supera el máximo de ${WHATSAPP_FREE_TEXT_MAX_LENGTH} caracteres permitido por WhatsApp (actual: ${text.length}).`
    );
  }

  if (/[\n\r\t]/.test(text)) {
    errors.push(
      "El texto no puede contener saltos de línea ni tabulaciones — WhatsApp rechaza plantillas con este formato."
    );
  }

  if (new RegExp(` {${MAX_CONSECUTIVE_SPACES + 1},}`).test(text)) {
    errors.push(`El texto no puede tener más de ${MAX_CONSECUTIVE_SPACES} espacios seguidos.`);
  }

  if (text !== text.trim()) {
    errors.push("El texto no puede empezar ni terminar con espacios.");
  }

  const prohibited = findProhibitedContent(text);
  if (prohibited) {
    errors.push(
      `El texto parece incluir contenido restringido por las políticas de WhatsApp Business ("${prohibited}"). Revísalo — este tipo de contenido puede hacer que Meta suspenda el número de WhatsApp de la empresa.`
    );
  }

  return { valid: errors.length === 0, errors };
}
