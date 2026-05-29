import { useSessionStore } from "@/store/useSessionStore";
import { useMemo } from "react";

/**
 * Resuelve el `companyId` activo del usuario en sesión.
 *
 * La sesión puede traer el id de empresa por dos vías según el tipo de usuario:
 * - Subusuarios con rol/área → `companyUserData.companyId`
 * - Admin/dueño de empresa   → `company._id`
 *
 * Centralizar esta lógica evita que una página deje de funcionar solo porque
 * el backend pobló una vía y no la otra.
 */
export function useActiveCompanyId(): string | undefined {
  const user = useSessionStore((store) => store.user);

  return useMemo(
    () => user?.companyUserData?.companyId ?? user?.company?._id,
    [user?.companyUserData?.companyId, user?.company?._id]
  );
}
