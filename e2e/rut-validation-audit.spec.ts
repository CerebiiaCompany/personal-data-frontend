import { test, expect } from "@playwright/test";
import { isValidRut, normalizeRut } from "../src/utils/rutValidator";

test.describe("Auditoría de Validación Módulo 11 de RUT", () => {
  test("Demostración Matemática Módulo 11", () => {
    // 1. 76.543.210-3: Suma 118, resto 8 -> DV 11-8 = 3. VÁLIDO.
    expect(isValidRut("76.543.210-3")).toBe(true);

    // 2. 76.543.210-K: Para cuerpo 76.543.210 el DV es 3, no K. INVÁLIDO.
    expect(isValidRut("76.543.210-K")).toBe(false);

    // 3. 76.543.212-K: Suma 120, resto 10 -> DV 11-10 = K. VÁLIDO.
    expect(isValidRut("76.543.212-K")).toBe(true);

    // 4. 76.543.212-3: Para cuerpo 76.543.212 el DV es K, no 3. INVÁLIDO.
    expect(isValidRut("76.543.212-3")).toBe(false);

    // 5. Normalización (sin puntos, K mayúscula)
    expect(normalizeRut("76.543.212-k")).toBe("76543212-K");
    expect(normalizeRut("76543212-k")).toBe("76543212-K");
  });
});
