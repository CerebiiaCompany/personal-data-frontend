const PUBLIC_ROUTE_PREFIXES = [
  "/login",
  "/formulario/",
  "/formularios/",
  "/consentimiento/",
  "/consentimiento-confirmado",
  "/personas",
] as const;

export function isPublicAppRoute(pathname: string): boolean {
  if (!pathname) return false;
  return PUBLIC_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix)
  );
}
