import { test, expect, type Page } from "@playwright/test";
import { login, adminCredentials } from "./utils/auth";

/**
 * Valida el módulo RAT (Tratamientos) de punta a punta:
 *  1. Crear un tratamiento (solo nombre) → queda como borrador.
 *  2. Activar sin completar → los campos faltantes aparecen traducidos.
 *  3. Completar y activar → pasa a "Activo".
 *  4. Editar en dos pestañas cambiando la base legal → la segunda avisa conflicto
 *     (guarda anti-sobrescritura del frontend) sin pisar en silencio.
 *  5. Archivar sin motivo → queda bloqueado.
 */

const SHOTS = ".artifacts/report";

/** Interactúa con un CustomSelect ubicándolo por su etiqueta. */
async function selectByLabel(page: Page, label: string, optionTitle: string) {
  const labelEl = page.getByText(label, { exact: true });
  const container = labelEl.locator("xpath=..");
  await container.locator("button").first().click();
  // El <li role="button"> y su <button> interno matchean ambos por rol; se
  // apunta solo al <button> de la opción por etiqueta.
  await container
    .locator("ul button")
    .filter({ hasText: optionTitle })
    .first()
    .click();
}

/** Devuelve el título de la primera finalidad real del catálogo, o null. */
async function pickFirstPurpose(page: Page): Promise<string | null> {
  const labelEl = page.getByText("Finalidad", { exact: true });
  const container = labelEl.locator("xpath=..");
  await container.locator("button").first().click();
  const optionButtons = container.locator("ul button");
  const count = await optionButtons.count();
  let chosen: string | null = null;
  for (let i = 0; i < count; i++) {
    const text = (await optionButtons.nth(i).innerText()).trim();
    if (text && !text.includes("Sin finalidad")) {
      chosen = text;
      break;
    }
  }
  if (chosen) {
    await optionButtons.filter({ hasText: chosen }).first().click();
  } else {
    // Cerrar el dropdown sin seleccionar.
    await container.locator("button").first().click();
  }
  return chosen;
}

test("RAT: crear, activar, editar en 2 pestañas y archivar", async ({
  page,
  context,
}) => {
  test.slow();
  await login(page, adminCredentials());

  // --- Paso 1: crear tratamiento (solo nombre) → borrador ---
  const name = `E2E RAT ${Date.now()}`;
  await page.goto("/admin/tratamientos/crear");
  await page
    .getByPlaceholder("Ej. Gestión de nómina de empleados")
    .fill(name);
  await page.getByRole("button", { name: "Crear tratamiento" }).click();

  // OJO: el regex /admin/tratamientos/[^/]+$ también matchea la propia página
  // /crear, así que hay que esperar explícitamente una URL de detalle que NO
  // sea /crear (si no, capturamos la URL equivocada antes del redirect real).
  await page.waitForURL(
    (url) =>
      /^\/admin\/tratamientos\/[^/]+$/.test(url.pathname) &&
      !url.pathname.endsWith("/crear"),
    { timeout: 15_000 }
  );
  const detailUrl = page.url();
  const editUrl = `${detailUrl}/editar`;

  await expect(page.getByText("Borrador").first()).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/rat-01-borrador.png`, fullPage: true });

  // --- Paso 2: activar sin completar → campos faltantes traducidos ---
  await page.getByRole("button", { name: "Activar" }).click();
  await expect(
    page.getByText(/No se puede activar\. Faltan campos:/)
  ).toBeVisible();
  await page.screenshot({
    path: `${SHOTS}/rat-02-faltan-campos.png`,
    fullPage: true,
  });

  // --- Paso 3: completar y activar ---
  await page.goto(editUrl);
  const purpose = await pickFirstPurpose(page);
  await selectByLabel(page, "Base legal", "Obligación legal");
  await page.getByRole("button", { name: "Identificación" }).click();
  await page.getByRole("button", { name: "Empleados" }).click();
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("Cambios guardados")).toBeVisible();

  await page.goto(detailUrl);

  test.skip(
    !purpose,
    "No hay finalidades en el catálogo; no se puede activar (sembrar TreatmentPurpose global)."
  );

  await page.getByRole("button", { name: "Activar" }).click();
  await expect(page.getByText("Tratamiento activado")).toBeVisible();
  await expect(page.getByText("Activo").first()).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/rat-03-activo.png`, fullPage: true });

  // --- Paso 4: editar en 2 pestañas, cambiar base legal en ambas ---
  const page2 = await context.newPage();
  await page.goto(editUrl);
  await page2.goto(editUrl);
  // Ambas pestañas cargaron sobre la misma versión.

  await selectByLabel(page, "Base legal", "Consentimiento del titular");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("Cambios guardados")).toBeVisible();

  await selectByLabel(page2, "Base legal", "Interés legítimo");
  await page2.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(
    page2.getByText(/cambió mientras lo editabas/)
  ).toBeVisible();
  await page2.screenshot({
    path: `${SHOTS}/rat-04-conflicto.png`,
    fullPage: true,
  });
  await page2.close();

  // La base legal persistida debe ser la de la 1ª pestaña, no la de la 2ª.
  await page.goto(detailUrl);
  await expect(
    page.getByText("Consentimiento del titular").first()
  ).toBeVisible();

  // --- Bloque 4: historial de versiones ---
  // Se editó la base legal dos veces (v2: —→Obligación legal, v3: Obligación
  // legal→Consentimiento), así que el timeline debe mostrar 2 entradas, más
  // reciente primero, con el antes→después correcto.
  const history = page.locator("section").filter({
    has: page.getByText("Historial de versiones"),
  });
  await expect(history).toBeVisible();
  const badges = history.locator("span").filter({ hasText: /^v\d+$/ });
  await expect(badges).toHaveCount(2);
  await expect(badges.first()).toHaveText("v3"); // más reciente primero
  await expect(badges.nth(1)).toHaveText("v2");
  // antes → después del cambio más reciente de base legal
  await expect(history.getByText("Obligación legal").first()).toBeVisible();
  await expect(
    history.getByText("Consentimiento del titular").first()
  ).toBeVisible();
  await page.screenshot({
    path: `${SHOTS}/rat-06-historial.png`,
    fullPage: true,
  });

  // --- Paso 5: archivar sin motivo → bloqueado ---
  await page.getByRole("button", { name: "Archivar" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Archivar" }).click();
  await expect(
    page.getByText("El motivo de archivado es obligatorio")
  ).toBeVisible();
  // El diálogo sigue abierto (no se archivó).
  await expect(dialog).toBeVisible();
  await page.screenshot({
    path: `${SHOTS}/rat-05-archivar-sin-motivo.png`,
    fullPage: true,
  });
});
