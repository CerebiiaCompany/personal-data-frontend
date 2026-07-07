import { test, expect } from "@playwright/test";
import { login, adminCredentials } from "./utils/auth";

/**
 * Valida la extensión de plazo ARCO.
 *
 * Requiere IDs de solicitudes reales por variables de entorno:
 *   - E2E_ARCO_PENDING_ID → solicitud en PENDING/IN_PROGRESS (permite extender).
 *   - E2E_ARCO_CLOSED_ID  → solicitud cerrada (COMPLETED/REJECTED): no debe permitir.
 */

const SHOTS = ".artifacts/report";
const PENDING_ID = process.env.E2E_ARCO_PENDING_ID;
const CLOSED_ID = process.env.E2E_ARCO_CLOSED_ID;

test("ARCO: extender plazo en solicitud pendiente", async ({ page }) => {
  test.skip(!PENDING_ID, "Falta E2E_ARCO_PENDING_ID (solicitud en PENDING).");
  await login(page, adminCredentials());

  await page.goto(`/admin/arco/${PENDING_ID}`);

  const extendBtn = page.getByRole("button", { name: "Extender plazo" });
  await expect(extendBtn).toBeVisible();
  await page.screenshot({
    path: `${SHOTS}/arco-01-boton-visible.png`,
    fullPage: true,
  });

  await extendBtn.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  const reason = `Extensión E2E ${Date.now()}: información adicional al titular`;
  await dialog.getByPlaceholder("Ej. 10").fill("10");
  await dialog
    .getByPlaceholder(/Se solicitó información adicional/)
    .fill(reason);
  await dialog.getByRole("button", { name: "Extender plazo" }).click();

  await expect(page.getByText(/Plazo extendido/)).toBeVisible();

  // Tras refrescar el detalle, el cuadro de última extensión muestra el motivo.
  await expect(page.getByText(/Plazo extendido el/)).toBeVisible();
  await expect(page.getByText(reason)).toBeVisible();
  await page.screenshot({
    path: `${SHOTS}/arco-02-extension-aplicada.png`,
    fullPage: true,
  });
});

test("ARCO: solicitud cerrada no permite extender", async ({ page }) => {
  test.skip(!CLOSED_ID, "Falta E2E_ARCO_CLOSED_ID (solicitud cerrada).");
  await login(page, adminCredentials());

  await page.goto(`/admin/arco/${CLOSED_ID}`);
  // La ficha debe cargar (esperamos algún contenido estable de la página).
  await expect(page).toHaveURL(new RegExp(`/admin/arco/${CLOSED_ID}`));
  await expect(
    page.getByRole("button", { name: "Extender plazo" })
  ).toHaveCount(0);
  await page.screenshot({
    path: `${SHOTS}/arco-03-cerrada-sin-boton.png`,
    fullPage: true,
  });
});
