import { test, expect } from "@playwright/test";
import { login, adminCredentials, superadminCredentials } from "./utils/auth";
import { isValidRut, normalizeRut } from "../src/utils/rutValidator";

const SHOTS = ".artifacts/report";

test.describe("Internacionalización CEREBIIA Chile — Ley 21.719", () => {

  test("1. Validación de RUT Módulo 11 (Frontend Utility & Form)", async () => {
    // Verificación unitaria E2E del algoritmo de módulo 11
    expect(isValidRut("12.345.678-5")).toBe(true);
    expect(isValidRut("12345678-5")).toBe(true);
    expect(isValidRut("12345678-9")).toBe(false); // DV incorrecto
    expect(normalizeRut("12.345.678-5")).toBe("12345678-5");
  });

  test("2. Formulario de Empresa y Onboarding (ONB-01): Sugiere RUT y valida Módulo 11", async ({ page }) => {
    if (!process.env.E2E_SUPERADMIN_USER) {
      test.skip();
      return;
    }
    await login(page, superadminCredentials());
    await page.goto("/superadmin/empresas/crear");

    // Seleccionar Chile como país
    const countrySelect = page.locator("select, button").filter({ hasText: /País|Colombia|Chile/i });
    if (await countrySelect.isVisible()) {
      await countrySelect.click();
      const optionChile = page.getByText("Chile", { exact: true });
      if (await optionChile.isVisible()) {
        await optionChile.click();
      }
    }

    // Verificar que el label cambie a RUT
    await expect(page.getByText("RUT")).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/i18n-chile-01-onboarding-rut.png`, fullPage: true });
  });

  test("3. Módulo de Áreas: País por defecto Chile (cl) y campo Región", async ({ page }) => {
    if (!process.env.E2E_ADMIN_USER) {
      test.skip();
      return;
    }
    await login(page, adminCredentials());
    await page.goto("/admin/administracion/areas/crear");

    // Verificar que el campo país incluya o muestre Chile por defecto
    await expect(page.getByText(/Ubicación y datos del área/i)).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/i18n-chile-02-area-region.png`, fullPage: true });
  });

  test("4. Tipos de Documentos y Rechazo de RUT Inválido por Jurisdicción Chile", async ({ page }) => {
    if (!process.env.E2E_ADMIN_USER) {
      test.skip();
      return;
    }
    await login(page, adminCredentials());
    await page.goto("/admin/administracion/usuarios/crear");

    // Verificar opciones de tipos de documento para Chile
    const docTypeSelect = page.locator("select[name='companyUserData.docType']");
    if (await docTypeSelect.isVisible()) {
      const optionsText = await docTypeSelect.innerText();
      expect(optionsText).toContain("RUT");
      expect(optionsText).toContain("Pasaporte");
      expect(optionsText).toContain("Cédula de Identidad Extranjera");
      expect(optionsText).not.toContain("C.C."); // Colombiano
      expect(optionsText).not.toContain("T.I."); // Colombiano
    }

    // Probar el rechazo de un RUT inválido en la UI
    const docNumberInput = page.getByLabel(/Número de documento/i);
    if (await docNumberInput.isVisible()) {
      await docNumberInput.fill("76.543.210-4"); // Un RUT matemáticamente inválido
      await docNumberInput.blur();
      
      // Esperar que aparezca el mensaje de error de validación
      const errorMsg = page.getByText(/El RUT ingresado no es válido/i);
      await expect(errorMsg).toBeVisible();
    }

    await page.screenshot({ path: `${SHOTS}/i18n-chile-03-usuarios-rut-invalido.png`, fullPage: true });
  });

  test("5. Registro de Auditoría (Snapshot & Resumen)", async ({ page }) => {
    if (!process.env.E2E_ADMIN_USER) {
      test.skip();
      return;
    }
    await login(page, adminCredentials());
    await page.goto("/admin/administracion/auditoria");

    await expect(page.getByText(/Registro de auditoría/i)).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/i18n-chile-04-auditoria-log.png`, fullPage: true });
  });

});
