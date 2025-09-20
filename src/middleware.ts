// middleware.ts (at project root)
import { NextRequest } from "next/server";

// Map path prefixes to the minimum role required
const ACCESS_MAP: {
  prefix: string;
  minRole: "USER" | "COMPANY_ADMIN" | "SUPERADMIN";
}[] = [
  { prefix: "/dashboard", minRole: "USER" },
  { prefix: "/admin", minRole: "COMPANY_ADMIN" },
  { prefix: "/superadmin", minRole: "SUPERADMIN" },
  // add more segments as you grow
];

const rank = { USER: 1, COMPANY_ADMIN: 2, SUPERADMIN: 3 };

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log({ pathname });
}

// Only run on routes that might be protected
export const config = {
  matcher: ["/dashboard/:path*", "/company-admin/:path*", "/superadmin/:path*"],
};
