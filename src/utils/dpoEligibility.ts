import { CompanyRolePermissions } from "@/types/companyRole.types";
import { UserRole } from "@/types/user.types";

type DpoCandidate = {
  role?: UserRole | string;
  companyUserData?: {
    companyRole?: {
      permissions?: CompanyRolePermissions;
    };
  };
  companyRole?: {
    permissions?: CompanyRolePermissions;
  };
};

export function isEligibleDpoCandidate(user: DpoCandidate | Record<string, unknown> | null | undefined): boolean {
  if (!user || typeof user !== "object") return false;
  const u = user as DpoCandidate;
  if (u.role === "SUPERADMIN" || u.role === "COMPANY_ADMIN") return true;
  const permissions =
    u.companyUserData?.companyRole?.permissions ?? u.companyRole?.permissions;
  return Boolean(
    permissions?.treatments?.activate || permissions?.arcoRequests?.respond
  );
}

type IdLike = { _id?: string; id?: string } | null | undefined;

export function resolveEntityId(entity: IdLike): string | undefined {
  if (!entity) return undefined;
  return entity._id ?? entity.id;
}

/** True when the session user is Company.dataOfficerId (RF-03). */
export function isDesignatedCompanyDataOfficer(
  user: IdLike,
  dataOfficer: IdLike
): boolean {
  const userId = resolveEntityId(user);
  const officerId = resolveEntityId(dataOfficer);
  return Boolean(userId && officerId && userId === officerId);
}

export function canApproveRatActivation(
  user: (IdLike & { role?: UserRole | string }) | null | undefined,
  dataOfficer: IdLike
): boolean {
  if (!user) return false;
  if (user.role === "SUPERADMIN") return true;
  return isDesignatedCompanyDataOfficer(user, dataOfficer);
}

export function findDpoCompanyRoleId(
  roles: Array<{ _id: string; position?: string; permissions?: CompanyRolePermissions }> | null | undefined
): string | undefined {
  if (!roles?.length) return undefined;
  const byName = roles.find((r) => r.position?.toLowerCase().includes("dpo"));
  if (byName) return byName._id;
  return roles.find((r) =>
    Boolean(r.permissions?.treatments?.activate && r.permissions?.arcoRequests?.respond)
  )?._id;
}
