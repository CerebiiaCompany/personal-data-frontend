/**
 * País del inventario de sistemas (Documento 5 + N-16).
 * ZZ = el cliente no confirmó el país; se puede completar después.
 */

export const UNKNOWN_INVENTORY_COUNTRY = "ZZ";
export const UNKNOWN_INVENTORY_COUNTRY_LABEL = "No estoy seguro";

export function isUnknownInventoryCountry(code?: string | null): boolean {
  const normalized = (code ?? "").trim().toLowerCase();
  return normalized === "zz" || normalized === "no_seguro";
}

export function formatInventoryCountry(code?: string | null): string {
  if (isUnknownInventoryCountry(code) || !(code ?? "").trim()) {
    return UNKNOWN_INVENTORY_COUNTRY_LABEL;
  }
  return code!.trim();
}
