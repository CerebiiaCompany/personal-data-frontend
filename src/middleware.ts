import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware de protección de rutas y redirección de URLs legacy (REQ v2.1).
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === "/cumplimiento" ||
    pathname === "/admin/cumplimiento" ||
    pathname === "/inicio"
  ) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (
    pathname === "/campanas" ||
    pathname === "/recoleccion/campanas"
  ) {
    return NextResponse.redirect(new URL("/admin/campanas", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/cumplimiento",
    "/admin/cumplimiento",
    "/inicio",
    "/campanas",
    "/recoleccion/campanas",
    "/admin/:path*",
    "/superadmin/:path*",
  ],
};
