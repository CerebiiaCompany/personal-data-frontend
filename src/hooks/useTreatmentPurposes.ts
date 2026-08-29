import { fetchTreatmentPurposes } from "@/lib/treatment.api";
import { TreatmentPurpose } from "@/types/treatment.types";
import { useCallback, useEffect, useState } from "react";

interface Params {
  companyId: string | undefined;
  enabled?: boolean;
  /** item B26: la pantalla de ABM también necesita ver las desactivadas. */
  includeInactive?: boolean;
  /** Item CHK-011/017: filtra las finalidades globales por jurisdicción. */
  country?: string;
}

/**
 * Catálogo de finalidades (global + propias de la empresa) para el dropdown de
 * `purposeId`. No pagina y falla en silencio: si no carga, el formulario sigue
 * usable con la finalidad en null.
 */
export function useTreatmentPurposes({ companyId, enabled = true, includeInactive = false, country }: Params) {
  const [data, setData] = useState<TreatmentPurpose[] | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    const res = await fetchTreatmentPurposes(companyId, { includeInactive, country });
    setLoading(false);
    if (res.error) {
      setData([]);
      return;
    }
    setData(res.data ?? []);
  }, [companyId, includeInactive, country]);

  useEffect(() => {
    if (!enabled || !companyId) return;
    refresh();
  }, [enabled, companyId, refresh]);

  return { data, loading, refresh };
}
