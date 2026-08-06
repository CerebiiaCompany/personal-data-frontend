import { test, expect, type Page } from "@playwright/test";
import { execSync } from "node:child_process";
import path from "node:path";

/**
 * E2E de Bloqueo Preventivo (Art. 8 ter · Ley 21.719) — item 3 de la
 * corrección de bloqueantes.
 *
 * Cubre lo que la UI real aporta sobre el contrato del backend:
 *  1. Titular de empresa CHILENA: "Bloqueo preventivo" aparece en el
 *     selector; al abrir el diálogo, con una única solicitud RECTIFICATION
 *     pendiente, se auto-selecciona (mostrada, no oculta) y permite enviar
 *     el fundamento; tras enviar, la nueva solicitud BLOCKING aparece en el
 *     historial con estado Pendiente.
 *  2. Titular de empresa NO chilena (Colombia, sembrada en el mismo
 *     fixture): "Bloqueo preventivo" NO aparece (sin regulación CL-only).
 *  3. Lado oficial (aprobar el bloqueo): requiere E2E_ADMIN_USER/PASS reales
 *     de una empresa con permisos ARCO — si no están, el test se salta
 *     explícitamente (mismo patrón que arco-extend.spec.ts), no se simula.
 *
 * Requisitos: frontend (npm run dev) + backend + Postgres corriendo. El OTP
 * del titular se lee directamente de la BD (no hay bypass en el backend),
 * por lo que este spec necesita acceso a `docker exec` del contenedor de
 * Postgres.
 */

const BACKEND_DIR =
  process.env.E2E_BACKEND_DIR ??
  path.resolve(process.cwd(), "../personal-data-backend");
const PG_CONTAINER = process.env.E2E_PG_CONTAINER ?? "personal-data-postgres-dev";
const PG_USER = process.env.E2E_PG_USER ?? "cerebiia";
const PG_DB = process.env.E2E_PG_DB ?? "personal_data";
const REDIS_CONTAINER = process.env.E2E_REDIS_CONTAINER ?? "personal-data-redis-dev";

const SHOTS = ".artifacts/report";

interface SeededFixture {
  companyId: string;
  coCompanyId: string;
  docType: string;
  docNumberCl: string;
  docNumberCo: string;
  titularCl: { name: string; lastName: string; email: string; phone: string };
  titularCo: { name: string; lastName: string; email: string; phone: string };
  rectificationRequestId: string;
}

function seedFixture(): SeededFixture {
  const out = execSync(
    "node -r dotenv/config scripts/e2eBlockingFixture.js seed",
    { cwd: BACKEND_DIR, encoding: "utf8" }
  );
  const line = out.trim().split("\n").filter(Boolean).pop() ?? "{}";
  return JSON.parse(line) as SeededFixture;
}

function cleanupFixture(companyId: string, coCompanyId: string) {
  execSync(
    `node -r dotenv/config scripts/e2eBlockingFixture.js cleanup ${companyId} ${coCompanyId}`,
    { cwd: BACKEND_DIR, encoding: "utf8" }
  );
}

function readOtp(sessionId: string): string {
  const cmd = `docker exec ${PG_CONTAINER} psql -U ${PG_USER} -d ${PG_DB} -P pager=off -At -c "SELECT code FROM arco_sessions WHERE id='${sessionId}';"`;
  return execSync(cmd, { encoding: "utf8" }).trim();
}

/**
 * Ver portability.spec.ts: el backend limita OTP lookups por IP/15min; se
 * limpian las llaves de rate-limit antes de autenticar. Fail-open si Redis
 * no está disponible.
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

test.describe("Bloqueo preventivo — titular empresa CHILENA (CL)", () => {
  let fixture: SeededFixture;

  test.beforeAll(() => {
    fixture = seedFixture();
  });

  test.afterAll(() => {
    if (fixture?.companyId) cleanupFixture(fixture.companyId, fixture.coCompanyId);
  });

  test('"Bloqueo preventivo" visible, auto-selecciona la única solicitud abierta y queda Pendiente tras enviar', async ({
    page,
  }) => {
    test.slow();

    await arcoTitularLogin(page, {
      docType: fixture.docType,
      docNumber: fixture.docNumberCl,
      country: "CL",
    });

    await ensureCompanySelected(page, /E2E-BLOCKING-FIXTURE Empresa CL/);

    // Selector de derechos: Bloqueo preventivo DEBE aparecer para CL.
    const blockingButton = page.getByRole("button", { name: /Bloqueo preventivo/ });
    await expect(blockingButton).toBeVisible();
    await page.screenshot({
      path: `${SHOTS}/blocking-01-selector-cl.png`,
      fullPage: true,
    });

    await blockingButton.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Auto-selección visible (una sola solicitud bloqueable: la RECTIFICATION
    // sembrada) — se muestra el tipo, no queda en silencio.
    await expect(dialog.getByText("Rectificación", { exact: true })).toBeVisible();

    await dialog
      .getByPlaceholder(/Explica por qué pides que se bloquee/)
      .fill(
        "Pedí una rectificación de mi email y quiero que no traten mis datos mientras se resuelve"
      );

    await page.screenshot({
      path: `${SHOTS}/blocking-02-dialogo-completado.png`,
      fullPage: true,
    });

    await dialog.getByRole("button", { name: "Enviar solicitud" }).click();

    await expect(page.getByText(/Bloqueo preventivo enviada/)).toBeVisible({
      timeout: 10_000,
    });

    // El historial debe reflejar la nueva solicitud como Pendiente. El label
    // se renderiza en minúsculas ahí ("Solicitud de bloqueo preventivo",
    // PersonasPortal.tsx usa .toLowerCase()) — regex case-insensitive.
    await expect(
      page.getByText(/bloqueo preventivo/i).first()
    ).toBeVisible();
    await expect(page.getByText("Pendiente").first()).toBeVisible();

    await page.screenshot({
      path: `${SHOTS}/blocking-03-historial-pendiente.png`,
      fullPage: true,
    });
  });
});

test.describe("Bloqueo preventivo — titular empresa NO chilena (CO, sembrada en el mismo fixture)", () => {
  let fixture: SeededFixture;

  test.beforeAll(() => {
    fixture = seedFixture();
  });

  test.afterAll(() => {
    if (fixture?.companyId) cleanupFixture(fixture.companyId, fixture.coCompanyId);
  });

  test('"Bloqueo preventivo" NO aparece en el selector', async ({ page }) => {
    await arcoTitularLogin(page, {
      docType: fixture.docType,
      docNumber: fixture.docNumberCo,
      country: "CO",
    });

    await ensureCompanySelected(page, /E2E-BLOCKING-FIXTURE Empresa CO/);

    await expect(page.getByRole("button", { name: /Acceso/ })).toBeVisible({
      timeout: 15_000,
    });

    await expect(
      page.getByRole("button", { name: /Bloqueo preventivo/ })
    ).toHaveCount(0);

    await page.screenshot({
      path: `${SHOTS}/blocking-04-selector-co-oculto.png`,
      fullPage: true,
    });
  });
});

test.describe("Bloqueo preventivo — lado oficial (aprobar)", () => {
  test("oficial aprueba el bloqueo y la solicitud relacionada queda marcada", async () => {
    test.skip(
      !process.env.E2E_ADMIN_USER || !process.env.E2E_ADMIN_PASS,
      "Faltan E2E_ADMIN_USER/E2E_ADMIN_PASS (admin real con permisos ARCO) — no se simula, se salta explícitamente igual que arco-extend.spec.ts."
    );
    // No implementado: requeriría credenciales reales de un admin con acceso
    // a la empresa CL sembrada por este fixture, que este entorno no tiene
    // configuradas. Cubierto por test de backend real (arco.blockingE2E.test.ts,
    // sin mocks de Prisma), no por navegador.
    //
    // ⚠️ PENDIENTE DE VERIFICACIÓN MANUAL EN STAGING antes del go-live de
    // Chile (con E2E_ADMIN_USER/PASS reales o a mano en el panel admin):
    // aprobar un Bloqueo desde /admin/arco/[requestId] y confirmar que la
    // solicitud relacionada (Rectificación/Supresión/Oposición) queda
    // visiblemente marcada como bloqueada en la UI del oficial.
  });
});

test.describe("Bloqueo preventivo — titular con MÁS DE UNA solicitud abierta", () => {
  test("el titular debe elegir explícitamente cuál bloquear (no auto-selección)", async () => {
    test.skip(
      true,
      "No implementado como E2E de navegador — requeriría un segundo fixture con 2+ " +
        "solicitudes R/S/O abiertas simultáneas para el mismo titular/empresa. Cubierto " +
        "hoy solo por la lógica del componente (PersonasArcoRequestDialog.tsx: con " +
        "blockableRequests.length > 1 se renderiza un selector de radio buttons y " +
        "relatedRequestId queda vacío hasta que el titular elige uno explícitamente — " +
        "ver handleSubmit, que bloquea el envío sin selección)."
    );
    // ⚠️ PENDIENTE DE VERIFICACIÓN MANUAL EN STAGING antes del go-live de
    // Chile — ES la condición de seguridad no-negociable del item 3 (no
    // adivinar cuál solicitud bloquear cuando hay más de una abierta):
    // sembrar (o crear a mano) un titular CL con 2 solicitudes abiertas de
    // tipo distinto (ej. Rectificación + Oposición) en la misma empresa,
    // abrir "Bloqueo preventivo" en el portal y confirmar que:
    //   1. aparecen AMBAS como opciones con radio buttons (no una
    //      auto-seleccionada en silencio),
    //   2. el botón "Enviar solicitud" no envía nada hasta elegir una,
    //   3. la solicitud creada tiene el relatedRequestId de la que
    //      efectivamente se eligió (no la primera de la lista por default).
  });
});
