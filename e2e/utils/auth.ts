import { expect, type Page } from "@playwright/test";

export interface Credentials {
  username: string;
  password: string;
}

export function adminCredentials(): Credentials {
  const username = process.env.E2E_ADMIN_USER;
  const password = process.env.E2E_ADMIN_PASS;
  if (!username || !password) {
    throw new Error(
      "Faltan E2E_ADMIN_USER / E2E_ADMIN_PASS (admin de empresa con permisos de tratamientos y ARCO)."
    );
  }
  return { username, password };
}

export function superadminCredentials(): Credentials {
  const username = process.env.E2E_SUPERADMIN_USER;
  const password = process.env.E2E_SUPERADMIN_PASS;
  if (!username || !password) {
    throw new Error(
      "Faltan E2E_SUPERADMIN_USER / E2E_SUPERADMIN_PASS (rol SUPERADMIN para feriados)."
    );
  }
  return { username, password };
}

/**
 * Inicia sesión a través de la UI de /login y espera la redirección fuera de
 * la pantalla de login. Deja las cookies de sesión en el contexto de la página.
 */
export async function login(page: Page, creds: Credentials): Promise<void> {
  await page.goto("/login");

  await page.getByPlaceholder("Usuario").fill(creds.username);
  await page.getByPlaceholder("Clave").fill(creds.password);

  // El checkbox de términos es un <input class="peer hidden"> dentro de un
  // <label>; se activa haciendo click en el texto visible del label.
  await page.getByText("Acepto los términos y condiciones").click();
  await expect(page.locator('input[name="tyc"]')).toBeChecked();

  await page.getByRole("button", { name: "Ingresar" }).click();

  // La app redirige a /admin o /superadmin; esperamos salir de /login.
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
}
