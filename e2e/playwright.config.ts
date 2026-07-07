import { defineConfig, devices } from "@playwright/test";

/**
 * Configuración E2E para validar los 3 flujos entregados:
 *  - Tratamientos (RAT)
 *  - Extensión de plazo ARCO
 *  - Feriados (superadmin)
 *
 * Requiere que el frontend (npm run dev) y el backend estén corriendo, y que
 * se provean credenciales de prueba por variables de entorno (ver e2e/README.md).
 */
const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: ".",
  testMatch: "**/*.spec.ts",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ["list"],
    ["html", { outputFolder: ".report", open: "never" }],
  ],
  outputDir: ".artifacts",
  use: {
    baseURL: BASE_URL,
    screenshot: "on",
    trace: "retain-on-failure",
    video: "retain-on-failure",
    // El backend usa cookies de sesión cross-origin; aceptamos su manejo por defecto.
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
