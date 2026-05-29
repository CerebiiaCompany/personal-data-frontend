// utils/parseExcelTemplate.ts
import {
  CollectFormResponseUser,
  UserGender,
} from "@/types/collectFormResponse.types";
import { DocType } from "@/types/user.types";
import ExcelJS from "exceljs";

type TemplateUserGender = "MASCULINO" | "FEMENINO" | "OTRO";

export interface ParsedUserRow {
  docType: DocType; // CC, CE, etc.
  docNumber: string;
  name: string;
  lastName: string;
  age: number;
  gender: TemplateUserGender; // MASCULINO / FEMENINO / Otro
  email: string;
  phone: string;
  razonSocial: string; // solo NITs (persona jurídica)
}

export type ParseResult = {
  rows: CollectFormResponseUser[];
  errors: { row: number; messages: string[] }[];
};

/** Normaliza el header: quita tildes, espacios extra y lo pasa a minúsculas */
function normalizeHeader(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/** Mapeo de headers de la plantilla -> claves internas */
const HEADER_MAP: Record<string, keyof ParsedUserRow> = {
  // columna en español normalizada : key interna
  "tipo de documento": "docType",
  "numero de documento": "docNumber",
  nombres: "name",
  apellidos: "lastName",
  edad: "age",
  genero: "gender",
  correo: "email",
  telefono: "phone",
  "razon social": "razonSocial",
};

/** Texto recortado o `undefined` si la celda está vacía. */
function toTrimmedString(val: unknown): string | undefined {
  if (val === undefined || val === null) return undefined;
  const s = String(val).trim();
  return s === "" ? undefined : s;
}

/** Número opcional: `undefined` si está vacío o no es numérico (no bloquea). */
function toOptionalNumber(val: unknown): number | undefined {
  const s = toTrimmedString(val);
  if (s === undefined) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

/** Entero opcional (edad, documento). */
function toOptionalInt(val: unknown): number | undefined {
  const n = toOptionalNumber(val);
  return n === undefined ? undefined : Math.trunc(n);
}

/** Normaliza el género a la forma del backend; `undefined` si no se reconoce. */
function normalizeGender(val: unknown): UserGender | undefined {
  const s = toTrimmedString(val);
  if (!s) return undefined;
  switch (s.toUpperCase()) {
    case "MASCULINO":
    case "MALE":
      return "MALE";
    case "FEMENINO":
    case "FEMALE":
      return "FEMALE";
    case "OTRO":
    case "OTHER":
      return "OTHER";
    default:
      return undefined;
  }
}

function isRowEmpty(obj: Record<string, unknown>) {
  return Object.values(obj).every(
    (v) => v === undefined || v === null || String(v).trim?.() === ""
  );
}

/**
 * Lee un File/Blob de Excel y devuelve filas parseadas + errores.
 * Acepta .xlsx y .xls (si el browser provee ArrayBuffer).
 */
export async function parseExcelTemplate(
  file: File | Blob
): Promise<ParseResult> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  const ws = workbook.worksheets[0]; // primera hoja (Sheet1)
  if (!ws)
    return {
      rows: [],
      errors: [{ row: 0, messages: ["El archivo no tiene hojas"] }],
    };

  // Leer encabezados (primera fila no vacía)
  const headerRow = ws.getRow(1);
  const headers: { key: keyof ParsedUserRow | null; text: string }[] = [];

  headerRow.eachCell((cell, colNumber) => {
    const raw = String(cell.value ?? "").trim();
    const normalized = normalizeHeader(raw);
    const mapped = HEADER_MAP[normalized] ?? null;
    headers[colNumber - 1] = { key: mapped, text: raw };
  });

  const presentKeys = new Set(
    headers.map((h) => h.key).filter(Boolean) as (keyof ParsedUserRow)[]
  );

  // Los datos del cliente son opcionales: solo exigimos que el archivo tenga
  // al menos una columna de contacto (Correo o Telefono), que es el único dato
  // imprescindible para poder llegar al cliente.
  if (!presentKeys.has("email") && !presentKeys.has("phone")) {
    return {
      rows: [],
      errors: [
        {
          row: 1,
          messages: [
            "El archivo debe incluir al menos una columna de contacto: " +
              "Correo o Telefono.",
          ],
        },
      ],
    };
  }

  const rows: CollectFormResponseUser[] = [];
  const errors: { row: number; messages: string[] }[] = [];

  // Recorre desde la 2 (datos)
  for (let r = 2; r <= ws.rowCount; r++) {
    const excelRow = ws.getRow(r);
    const draft: Record<string, unknown> = {};

    headers.forEach((h, idx) => {
      if (!h) return;
      const cell = excelRow.getCell(idx + 1).value;
      const key = h.key;
      if (!key) return;
      // Lee el valor "crudo" de la celda
      // ExcelJS puede devolver objetos RichText/Date/etc. Simplificamos:
      let value: unknown = cell as any;

      // Normalizaciones básicas
      if (typeof value === "object" && value && "text" in (value as any)) {
        value = (value as any).text; // por si viene RichText
      }
      if (value instanceof Date) {
        // para Edad no aplica; si en otra plantilla hubiera fechas, normalízalas aquí
        value = value.toISOString();
      }

      draft[key] = value ?? "";
    });

    if (isRowEmpty(draft)) continue;

    // Todos los campos son opcionales salvo el contacto. Si falta algún dato,
    // el cliente lo completa después en el formulario de consentimiento.
    const docType = toTrimmedString(draft.docType) as DocType | undefined;
    const docNumber = toOptionalInt(draft.docNumber);
    const name = toTrimmedString(draft.name);
    const lastName = toTrimmedString(draft.lastName);
    const age = toOptionalInt(draft.age);
    const gender = normalizeGender(draft.gender);
    const email = toTrimmedString(draft.email);
    const phone = toTrimmedString(draft.phone);
    const razonSocial = toTrimmedString(draft.razonSocial);

    // Único error que bloquea: la fila no tiene ningún canal de contacto.
    if (!email && !phone) {
      errors.push({
        row: r,
        messages: [
          "La fila no tiene correo ni teléfono. Indica al menos un medio de contacto.",
        ],
      });
      continue;
    }

    // Solo incluimos los campos presentes (omitimos vacíos/indefinidos).
    const clean = {
      ...(docType ? { docType } : {}),
      ...(docNumber !== undefined ? { docNumber } : {}),
      ...(name ? { name } : {}),
      ...(lastName ? { lastName } : {}),
      ...(age !== undefined ? { age } : {}),
      ...(gender ? { gender } : {}),
      ...(email ? { email } : {}),
      ...(phone ? { phone } : {}),
      ...(razonSocial ? { razonSocial } : {}),
    } as CollectFormResponseUser;

    rows.push(clean);
  }

  return { rows, errors };
}
