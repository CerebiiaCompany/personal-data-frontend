import { ArcoOfficerUser } from "@/types/arco.admin.types";
import { CompanyUserSummary } from "@/types/company.types";

export function arcoOfficerToUserSummary(
  officer: ArcoOfficerUser
): CompanyUserSummary {
  return {
    _id: officer.userId,
    name: officer.name,
    lastName: officer.lastName ?? "",
    username: officer.username ?? officer.email ?? "",
    companyUserData: {
      position: officer.position,
      phone: officer.phone,
      personalEmail: officer.email,
    },
  };
}

export function mergeUsersWithOfficers(
  users: CompanyUserSummary[],
  officers: ArcoOfficerUser[]
): CompanyUserSummary[] {
  const byId = new Map(users.map((u) => [u._id, u]));
  for (const officer of officers) {
    if (!byId.has(officer.userId)) {
      byId.set(officer.userId, arcoOfficerToUserSummary(officer));
    }
  }
  return Array.from(byId.values());
}

export function formatArcoOfficerName(officer: {
  name: string;
  lastName?: string;
}): string {
  return [officer.name, officer.lastName].filter(Boolean).join(" ");
}
