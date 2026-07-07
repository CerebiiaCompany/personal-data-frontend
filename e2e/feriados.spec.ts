import { test, expect } from "@playwright/test";
import { login, superadminCredentials } from "./utils/auth";

/**
 * Valida el CRUD de Feriados (superadmin):
 *  - Alta → aparece en la lista, agrupado por país.
 *  - Alta duplicada (mismo país+fecha) → error de duplicado controlado.
 *  - Baja → pide confirmación antes de eliminar.
 */

const SHOTS = ".artifacts/report";

/** Fecha futura pseudo-única por corrida (evita chocar con datos sembrados). */
function uniqueFutureDate(): string {
  const base = new Date(Date.UTC(2099, 0, 1));
  base.setUTCDate(base.getUTCDate() + (Date.now() % 300));
  return base.toISOString().slice(0, 10);
}

test("Feriados: crear, duplicar (error) y eliminar (con confirmación)", async ({
  page,
}) => {
  await login(page, superadminCredentials());
  await page.goto("/superadmin/feriados");
  await expect(
    page.getByRole("heading", { name: "Feriados — Motor de Plazos" })
  ).toBeVisible();

  const date = uniqueFutureDate();
  const name1 = `E2E Feriado ${Date.now()}`;

  // --- Alta (país por defecto CL) ---
  await page.locator('input[type="date"]').fill(date);
  await page.getByPlaceholder("Ej. Fiestas Patrias").fill(name1);
  await page.getByRole("button", { name: "Agregar feriado" }).click();

  await expect(page.getByText("Feriado creado")).toBeVisible();
  await expect(page.getByText(name1)).toBeVisible();
  await expect(page.getByText("Chile (CL)").first()).toBeVisible();
  await page.screenshot({
    path: `${SHOTS}/feriados-01-creado.png`,
    fullPage: true,
  });

  // --- Alta duplicada (mismo país + misma fecha) ---
  await page.locator('input[type="date"]').fill(date);
  await page
    .getByPlaceholder("Ej. Fiestas Patrias")
    .fill(`${name1} (dup)`);
  await page.getByRole("button", { name: "Agregar feriado" }).click();

  await expect(
    page.getByText("Ya existe un feriado con esa fecha para ese país")
  ).toBeVisible();
  await page.screenshot({
    path: `${SHOTS}/feriados-02-duplicado.png`,
    fullPage: true,
  });

  // --- Baja: debe pedir confirmación ---
  await page.getByRole("button", { name: `Eliminar ${name1}` }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Eliminar feriado")).toBeVisible();
  await page.screenshot({
    path: `${SHOTS}/feriados-03-confirmacion.png`,
    fullPage: true,
  });

  await page.getByRole("button", { name: "Eliminar", exact: true }).click();
  await expect(page.getByText("Feriado eliminado")).toBeVisible();
  await expect(page.getByText(name1)).toHaveCount(0);
});
