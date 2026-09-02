const ARCO_PORTAL_PATH = "/personas";

/** URL pública del portal ARCO — misma para todas las empresas de la plataforma. */
export function getArcoPortalUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}${ARCO_PORTAL_PATH}`;
  }

  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (configured) {
    const withScheme = /^https?:\/\//i.test(configured)
      ? configured
      : `https://${configured}`;
    return `${withScheme}${ARCO_PORTAL_PATH}`;
  }

  return `http://localhost:3000${ARCO_PORTAL_PATH}`;
}
