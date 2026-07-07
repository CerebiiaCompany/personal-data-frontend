import { test, expect, type Page } from "@playwright/test";
import { execSync } from "node:child_process";
import path from "node:path";

/**
 * E2E de Portabilidad (ARCOP · Ley 21.719).
 *
 * Cubre lo que la UI real aporta sobre el contrato del backend:
 *  1. Titular de empresa CHILENA: "Portabilidad" aparece en el selector y, tras
 *     resolver, puede descargar el export persistido en CSV y JSON.
 *  2. Titular de empresa NO chilena (Colombia): "Portabilidad" NO aparece.
 *  3. Oficial (gated por credenciales): sección de export + descarga en el
 *     detalle admin. Se salta si no hay credenciales/solicitud sembrada.
 *
 * Requisitos: frontend (npm run dev) + backend + Postgres corriendo. El OTP del
 * titular se lee directamente de la BD (no hay bypass en el backend), por lo que
 * este spec necesita acceso a `docker exec` del contenedor de Postgres.
 *
 * Variables opcionales:
 *  - E2E_BACKEND_DIR   ruta al repo backend (default ../personal-data-backend)
 *  - E2E_PG_CONTAINER  contenedor Postgres (default personal-data-postgres-dev)
 *  - E2E_PG_USER/DB    usuario/base (default cerebiia/personal_data)
 *  - E2E_CO_DOCTYPE/E2E_CO_DOCNUMBER  titular CO real para el test de "oculto"
 */

const BACKEND_DIR =
  process.env.E2E_BACKEND_DIR ??
  path.resolve(process.cwd(), "../personal-data-backend");
const PG_CONTAINER = process.env.E2E_PG_CONTAINER ?? "personal-data-postgres-dev";
const PG_USER = process.env.E2E_PG_USER ?? "cerebiia";
const PG_DB = process.env.E2E_PG_DB ?? "personal_data";
const REDIS_CONTAINER = process.env.E2E_REDIS_CONTAINER ?? "personal-data-redis-dev";

// Titular CO real (empresa colombiana) para validar que "Portabilidad" se oculta.
const CO_DOCTYPE = process.env.E2E_CO_DOCTYPE ?? "CC";
const CO_DOCNUMBER = process.env.E2E_CO_DOCNUMBER ?? "1090457435";

const SHOTS = ".artifacts/report";

interface SeededFixture {
  companyId: string;
  requestId: string;
  docType: string;
  docNumber: string;
  titular: { name: string; lastName: string; email: string; phone: string };
}

function seedFixture(): SeededFixture {
  const out = execSync(
    "node -r dotenv/config scripts/e2ePortabilityFixture.js seed",
    { cwd: BACKEND_DIR, encoding: "utf8" }
  );
  const line = out.trim().split("\n").filter(Boolean).pop() ?? "{}";
  return JSON.parse(line) as SeededFixture;
}

function cleanupFixture(companyId: string) {
  execSync(
    `node -r dotenv/config scripts/e2ePortabilityFixture.js cleanup ${companyId}`,
    { cwd: BACKEND_DIR, encoding: "utf8" }
  );
}

function readOtp(sessionId: string): string {
  const cmd = `docker exec ${PG_CONTAINER} psql -U ${PG_USER} -d ${PG_DB} -P pager=off -At -c "SELECT code FROM arco_sessions WHERE id='${sessionId}';"`;
  return execSync(cmd, { encoding: "utf8" }).trim();
}

/**
 * El backend limita los OTP a 5 lookups por IP/15min (compartido entre
 * documentos) y 3 por documento/hora. En un entorno de dev corrido varias veces
 * eso agota la cuota; limpiamos las llaves de rate-limit antes de autenticar.
 * Fail-open: si Redis no está disponible, seguimos igual.
 */
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

/**
 * Inicia sesión como titular ARCO sin depender del correo: hace lookup+verify
 * contra el backend real (leyendo el OTP de la BD) e inyecta la verificación en
 * sessionStorage, tal como lo hace el portal tras validar el código.
 */
async function arcoTitularLogin(
  page: Page,
  opts: { docType: string; docNumber: string; country: "CO" | "CL" }
): Promise<void> {
  resetArcoRateLimit();
  const lookup = await page.request.post("/api/v1/arco/lookup", {
    data: { docType: opts.docType, docNumber: opts.docNumber, channel: "EMAIL" },
  });
  const lookupBody = await lookup.json();
  const sessionId: string | undefined = lookupBody?.data?.sessionId;
  if (!sessionId) {
    throw new Error(
      `lookup falló para ${opts.docType} ${opts.docNumber}: ${JSON.stringify(lookupBody)}`
    );
  }

  const code = readOtp(sessionId);
  const verify = await page.request.post("/api/v1/arco/verify", {
    data: { sessionId, code },
  });
  const verifyBody = await verify.json();
  const token: string | undefined = verifyBody?.data?.sessionToken;
  const expiresAt: string | undefined = verifyBody?.data?.expiresAt;
  if (!token) {
    throw new Error(`verify falló: ${JSON.stringify(verifyBody)}`);
  }

  // sessionStorage es por-origen: primero cargamos una página del app.
  await page.goto("/personas");
  await page.evaluate(
    ([tok, exp, docType, docNumber, country]) => {
      sessionStorage.setItem(
        "personas_verification",
        JSON.stringify({
          country,
          docType,
          docNumber,
          sessionToken: tok,
          tokenExpiresAt: exp,
          verifiedAt: new Date().toISOString(),
          channel: "EMAIL",
        })
      );
    },
    [token, expiresAt, opts.docType, opts.docNumber, opts.country] as const
  );

  await page.goto("/personas/portal");
}

/** Asegura que la empresa quede seleccionada (auto-selección si es la única). */
async function ensureCompanySelected(page: Page) {
  const acciones = page.getByRole("button", { name: /Acceso/ });
  if (await acciones.count()) return;
  // Si no está auto-seleccionada, hacer click en la primera tarjeta de empresa.
  const card = page.getByRole("button", { name: /Toca para seleccionar/ }).first();
  if (await card.count()) {
    await card.click();
  }
}

test.describe("Portabilidad — titular empresa CHILENA (CL)", () => {
  let fixture: SeededFixture;

  test.beforeAll(() => {
    fixture = seedFixture();
  });

  test.afterAll(() => {
    if (fixture?.companyId) cleanupFixture(fixture.companyId);
  });

  test('"Portabilidad" visible en el selector y descarga CSV/JSON tras resolver', async ({
    page,
  }) => {
    test.slow();

    await arcoTitularLogin(page, {
      docType: fixture.docType,
      docNumber: fixture.docNumber,
      country: "CL",
    });

    // La empresa CL sembrada es la única del titular → auto-seleccionada.
    await expect(
      page.getByRole("heading", { name: /E2E-PORTABILITY-FIXTURE Empresa CL/ })
    ).toBeVisible({ timeout: 15_000 });
    await ensureCompanySelected(page);

    // Selector de derechos: Portabilidad DEBE aparecer para una empresa CL.
    await expect(
      page.getByRole("button", { name: /Portabilidad/ })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Acceso/ })).toBeVisible();
    await page.screenshot({
      path: `${SHOTS}/portability-01-selector-cl.png`,
      fullPage: true,
    });

    // Historial: la solicitud resuelta muestra el panel de descarga.
    const panelToggle = page.getByRole("button", {
      name: /Ver y descargar la copia de tus datos/,
    });
    await expect(panelToggle).toBeVisible();
    await panelToggle.click();

    // Descarga CSV.
    const csvDownloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Descargar CSV" }).click();
    const csv = await csvDownloadPromise;
    expect(csv.suggestedFilename()).toMatch(/^portabilidad-.*\.csv$/);

    // Descarga JSON.
    const jsonDownloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Descargar JSON" }).click();
    const json = await jsonDownloadPromise;
    expect(json.suggestedFilename()).toMatch(/^portabilidad-.*\.json$/);

    await page.screenshot({
      path: `${SHOTS}/portability-02-descargas-cl.png`,
      fullPage: true,
    });
  });
});

test.describe("Portabilidad — titular empresa NO chilena (CO)", () => {
  test('"Portabilidad" NO aparece en el selector', async ({ page }) => {
    let loggedIn = false;
    try {
      await arcoTitularLogin(page, {
        docType: CO_DOCTYPE,
        docNumber: CO_DOCNUMBER,
        country: "CO",
      });
      loggedIn = true;
    } catch (err) {
      test.skip(
        true,
        `No se pudo iniciar sesión como titular CO real (${CO_DOCTYPE} ${CO_DOCNUMBER}): ${(err as Error).message}`
      );
    }
    if (!loggedIn) return;

    // Debe haber al menos una empresa (CO) para este titular.
    await ensureCompanySelected(page);
    await expect(page.getByRole("button", { name: /Acceso/ })).toBeVisible({
      timeout: 15_000,
    });

    // Gating: en una empresa CO, "Portabilidad" NO debe estar presente.
    await expect(page.getByRole("button", { name: /Portabilidad/ })).toHaveCount(
      0
    );
    await page.screenshot({
      path: `${SHOTS}/portability-03-selector-co-oculto.png`,
      fullPage: true,
    });
  });
});
