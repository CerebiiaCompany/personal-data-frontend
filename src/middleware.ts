import { NextResponse } from "next/server";

/**
 * Middleware de protección de rutas.
 *
 * TODO (seguridad - Prioridad 2):
 *  - Implementar verificación real de sesión/JWT desde cookie httpOnly.
 *  - Validar rol mínimo por prefijo usando un mapa tipo:
 *      { prefix: "/admin", minRole: "COMPANY_ADMIN" }
 *  - Redirigir a /login o /sin-acceso según corresponda.
 *  - Migrar a `proxy.ts` cuando se valide la nueva convención de Next 16.
 *
 * Hoy este middleware NO bloquea ninguna ruta. La protección efectiva debe
 * vivir aquí (perimetral) además de en cada page server-side.
 */
export async function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/superadmin/:path*"],
};
