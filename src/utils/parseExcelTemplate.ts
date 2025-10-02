// utils/parseExcelTemplate.ts
import {
  CollectFormResponseUser,
  UserGender,
} from "@/types/collectFormResponse.types";
import { DocType } from "@/types/user.types";
import ExcelJS from "exceljs";
import * as z from "zod";

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
};

const genderSchema = z.preprocess((val) => {
  if (!val) return undefined;
  const normalized = String(val).trim().toUpperCase();
  switch (normalized) {
    case "MASCULINO":
      return "MALE";
    case "FEMENINO":
      return "FEMALE";
    case "OTRO":
      return "OTHER";
    default:
      return normalized; // fallback, in case ya viene en formato inglés
  }
}, z.string<UserGender>("Género inválido"));

const rowSchema = z.object({
  docType: z.string<DocType>("Tipo de documento inválido"),
  docNumber: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.coerce.number("Número de documento inválido")
  ),
  name: z.string().min(1, "Nombres requeridos"),
  lastName: z.string().min(1, "Apellidos requeridos"),
  age: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.coerce.number("Edad inválida").int("Edad inválida")
  ),
  gender: genderSchema,
  email: z.email("Correo inválido").min(1, "Correo inválido"),
  phone: z.coerce.string().min(1, "Número inválido"),
});

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

  // Verifica que existan los headers mínimos
  const requiredKeys: (keyof ParsedUserRow)[] = [
    "docType",
    "docNumber",
    "name",
    "lastName",
    "age",
    "email",
    "gender",
    "phone",
  ];
  const presentKeys = new Set(
    headers.map((h) => h.key).filter(Boolean) as (keyof ParsedUserRow)[]
  );
  const missing = requiredKeys.filter((k) => !presentKeys.has(k));
  if (missing.length) {
    return {
      rows: [],
      errors: [
        {
          row: 1,
          messages: [
            `Faltan columnas requeridas: ${missing.join(", ")}. ` +
              `Asegúrate de usar exactamente: Tipo de Documento, Numero de Documento, Nombres, Apellidos, Edad, Genero, Correo y Telefono.`,
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

    const parsed = rowSchema.safeParse(draft);

    if (!parsed.success) {
      errors.push({
        row: r,
        messages: parsed.error.issues.map(
          (i) => `${i.path.join(".")}: ${i.message}`
        ),
      });
      continue;
    }

    // Limpieza adicional: recorta strings
    const clean: CollectFormResponseUser = {
      docType: parsed.data.docType,
      docNumber: parsed.data.docNumber,
      name: parsed.data.name.trim(),
      lastName: parsed.data.lastName.trim(),
      gender: parsed.data.gender,
      email: parsed.data.email.trim(),
      phone: parsed.data.phone.trim(),
      age: parsed.data.age,
    };

    rows.push(clean);
  }

  return { rows, errors };
}
