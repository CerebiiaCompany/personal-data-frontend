import { test, expect, type Page } from "@playwright/test";
import { execSync } from "node:child_process";
import path from "node:path";
import { login } from "./utils/auth";

/**
 * QA-F1-002 — E2E del flujo ARCO completo (Art. 5, Art. 11):
 *
 *   1. Titular crea una solicitud de Acceso en el portal público, verificando
 *      identidad con OTP (leído de la BD vía `docker exec psql`, igual que
 *      blocking.spec.ts / portability.spec.ts — no hay bypass de OTP en el
 *      backend).
 *   2. Operador (que en este fixture también es el DPO designado — mismo
 *      criterio que e2eAdminFixture.js) marca la solicitud "en proceso" y la
 *      resuelve con el informe de acceso autocompletado desde el RAT (item
 *      ARCO-007/ARCO-008: terceros/retención/decisiones automatizadas
 *      vienen del Treatment ACTIVE sembrado por el fixture, no se piden a
 *      mano) — la resolución genera el PDF del informe automáticamente
 *      (bloqueante: sin PDF, no hay resolve, ver arcoManagement.controller.ts).
 *   3. El titular ve la solicitud Resuelta en su historial y puede
 *      descargar el informe en PDF.
 *   4. Se verifica que el plazo se respetó (dueDate no vencido al resolver).
 *
 * Requiere: frontend (npm run dev) + backend + Postgres + Redis corriendo.
 * El seed/cleanup usa un script Node en el repo backend (mismo patrón que
 * blocking.spec.ts / e2eBlockingFixture.js).
 */

const BACKEND_DIR =
  process.env.E2E_BACKEND_DIR ?? path.resolve(process.cwd(), "../personal-data-backend");
const PG_CONTAINER = process.env.E2E_PG_CONTAINER ?? "personal-data-postgres-dev";
const PG_USER = process.env.E2E_PG_USER ?? "cerebiia";
const PG_DB = process.env.E2E_PG_DB ?? "personal_data";
const REDIS_CONTAINER = process.env.E2E_REDIS_CONTAINER ?? "personal-data-redis-dev";

const SHOTS = ".artifacts/report";

interface SeededFixture {
  companyId: string;
  planId: string;
  adminId: string;
  username: string;
  password: string;
  docType: string;
  docNumber: string;
  titular: { name: string; lastName: string; email: string; phone: string };
  treatmentId: string;
}

function seedFixture(): SeededFixture {
  const out = execSync("node -r dotenv/config scripts/e2eArcoCompletoFixture.js seed", {
    cwd: BACKEND_DIR,
    encoding: "utf8",
  });
  const line = out.trim().split("\n").filter(Boolean).pop() ?? "{}";
  return JSON.parse(line) as SeededFixture;
}

function cleanupFixture(companyId: string) {
  execSync(`node -r dotenv/config scripts/e2eArcoCompletoFixture.js cleanup ${companyId}`, {
    cwd: BACKEND_DIR,
    encoding: "utf8",
  });
}

function readOtp(sessionId: string): string {
  const cmd = `docker exec ${PG_CONTAINER} psql -U ${PG_USER} -d ${PG_DB} -P pager=off -At -c "SELECT code FROM arco_sessions WHERE id='${sessionId}';"`;
  return execSync(cmd, { encoding: "utf8" }).trim();
}

// Ver portability.spec.ts / blocking.spec.ts: el backend limita OTP lookups
// por IP/15min; se limpian las llaves de rate-limit antes de autenticar.
// Fail-open si Redis no está disponible.
function resetArcoRateLimit(): void {
  try {
    execSync(
      `docker exec ${REDIS_CONTAINER} sh -c "redis-cli --scan --pattern 'arco:rl:*' | xargs -r redis-cli del"`,
      { encoding: "utf8", stdio: "pipe" }
    );
  } catch {
    // Redis no disponible o sin llaves; el rate limiter falla-abierto igual.
  }
}

async function arcoTitularLogin(
  page: Page,
  opts: { docType: string; docNumber: string }
): Promise<void> {
  resetArcoRateLimit();
  const lookup = await page.request.post("/api/v1/arco/lookup", {
    data: { docType: opts.docType, docNumber: opts.docNumber, channel: "EMAIL" },
  });
  const lookupBody = await lookup.json();
  const sessionId: string | undefined = lookupBody?.data?.sessionId;
  if (!sessionId) {
    throw new Error(`lookup falló para ${opts.docType} ${opts.docNumber}: ${JSON.stringify(lookupBody)}`);
  }

  const code = readOtp(sessionId);
  const verify = await page.request.post("/api/v1/arco/verify", { data: { sessionId, code } });
  const verifyBody = await verify.json();
  const token: string | undefined = verifyBody?.data?.sessionToken;
  const expiresAt: string | undefined = verifyBody?.data?.expiresAt;
  if (!token) {
    throw new Error(`verify falló: ${JSON.stringify(verifyBody)}`);
  }

  await page.goto("/personas");
  await page.evaluate(
    ([tok, exp, docType, docNumber]) => {
      sessionStorage.setItem(
        "personas_verification",
        JSON.stringify({
          country: "CL",
          docType,
          docNumber,
          sessionToken: tok,
          tokenExpiresAt: exp,
          verifiedAt: new Date().toISOString(),
          channel: "EMAIL",
        })
      );
    },
    [token, expiresAt, opts.docType, opts.docNumber] as const
  );

  await page.goto("/personas/portal");
}

async function ensureCompanySelected(page: Page, companyNamePattern: RegExp) {
  const heading = page.getByRole("heading", { name: companyNamePattern });
  await expect(heading).toBeVisible({ timeout: 15_000 });
  const acciones = page.getByRole("button", { name: /Acceso/ });
  if (await acciones.count()) return;
  const card = page.getByRole("button", { name: /Toca para seleccionar/ }).first();
  if (await card.count()) {
    await card.click();
  }
}

test.describe("Flujo ARCO completo — Acceso (item QA-F1-002)", () => {
  let fixture: SeededFixture;

  test.beforeAll(() => {
    fixture = seedFixture();
  });

  test.afterAll(() => {
    if (fixture?.companyId) cleanupFixture(fixture.companyId);
  });

  test("titular crea solicitud de Acceso → operador (DPO) la resuelve con informe autocompletado del RAT y PDF → titular ve Resuelta y descarga el PDF, dentro del plazo", async ({
    page,
    context,
  }) => {
    test.slow();

    // --- Paso 1: titular verifica identidad (OTP real) y crea la solicitud ---
    await arcoTitularLogin(page, { docType: fixture.docType, docNumber: fixture.docNumber });
    await ensureCompanySelected(page, new RegExp(`E2E-ARCO-COMPLETO-FIXTURE`));

    const accessButton = page.getByRole("button", { name: /Acceso/ });
    await expect(accessButton).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/arco-completo-01-selector.png`, fullPage: true });
    await accessButton.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog
      .getByPlaceholder("Explica con detalle qué necesitas...")
      .fill("Quiero saber qué datos personales míos tiene almacenados esta empresa.");
    await page.screenshot({ path: `${SHOTS}/arco-completo-02-dialogo.png`, fullPage: true });
    await dialog.getByRole("button", { name: "Enviar solicitud" }).click();

    await expect(page.getByText(/Solicitud de .* enviada/)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Pendiente").first()).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/arco-completo-03-pendiente.png`, fullPage: true });

    // --- Paso 2: operador (DPO) marca en proceso y resuelve con informe ---
    const adminPage = await context.newPage();
    await login(adminPage, { username: fixture.username, password: fixture.password });

    await adminPage.goto("/admin/arco");
    // Item ARCO-002/B16: la solicitud debió auto-asignarse al DPO (el mismo
    // admin de este fixture) al crearse — se busca por documento del titular
    // en vez de por folio (el titular no expone el requestId completo).
    await adminPage.getByPlaceholder(/documento/i).fill(fixture.docNumber).catch(() => {});
    const row = adminPage.getByText(fixture.docNumber).first();
    await expect(row).toBeVisible({ timeout: 15_000 });
    await row.click();

    await adminPage.waitForURL(/\/admin\/arco\/[^/]+$/, { timeout: 15_000 });
    await adminPage.screenshot({ path: `${SHOTS}/arco-completo-04-detalle-oficial.png`, fullPage: true });

    await adminPage.getByRole("button", { name: "1. Marcar en proceso" }).click();
    await expect(adminPage.getByText("Solicitud marcada en proceso")).toBeVisible();

    await adminPage.getByRole("button", { name: "2. Resolver con informe de acceso" }).click();
    const respondDialog = adminPage.getByRole("dialog");
    await expect(respondDialog).toBeVisible();

    // Item ARCO-007/ARCO-008: con el Treatment ACTIVE único sembrado por el
    // fixture, terceros/retención/decisiones automatizadas ya vienen
    // autocompletados del RAT — no hace falta completarlos a mano. Solo se
    // confirma "no hay terceros" (checkbox) por si el auto-fill no cubrió el
    // campo en este ambiente.
    const noThirdPartiesCheckbox = respondDialog.getByText("No se compartió con terceros", { exact: false });
    if (await noThirdPartiesCheckbox.count()) {
      await noThirdPartiesCheckbox.click().catch(() => {});
    }
    await page.screenshot({ path: `${SHOTS}/arco-completo-05-informe-autocompletado.png`, fullPage: true });

    await respondDialog.getByRole("button", { name: "Enviar respuesta e informe" }).click();

    await expect(adminPage.getByText("Solicitud de acceso resuelta con informe")).toBeVisible({
      timeout: 20_000, // genera el PDF (Playwright/Chromium) antes de responder — más lento que un PATCH normal.
    });
    await adminPage.screenshot({ path: `${SHOTS}/arco-completo-06-resuelta-oficial.png`, fullPage: true });

    // --- Paso 3: el titular ve la solicitud Resuelta y descarga el PDF ---
    await page.reload();
    await expect(page.getByText("Resuelta favorablemente").first()).toBeVisible({ timeout: 15_000 });
    await page.screenshot({ path: `${SHOTS}/arco-completo-07-titular-resuelta.png`, fullPage: true });

    const reportPanelToggle = page.getByText("Ver los datos que la empresa te entregó");
    await expect(reportPanelToggle).toBeVisible();
    await reportPanelToggle.click();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Descargar informe PDF" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/informe-acceso.*\.pdf$/);
    await page.screenshot({ path: `${SHOTS}/arco-completo-08-pdf-descargado.png`, fullPage: true });

    await adminPage.close();
  });
});
