import { useEffect, useState, useMemo } from "react";
import {
  fetchJurisdictionLegalBases,
  JurisdictionLegalBase,
} from "@/lib/jurisdiction.api";
import { CustomSelectOption } from "@/types/forms.types";
import { LegalBasis, LEGAL_BASIS_OPTIONS, LEGAL_BASIS_LABELS } from "@/types/treatment.types";

// Item CHK-016 (auditoría 2026-08-26/27): el RAT dejó de ofrecer un
// catálogo hardcodeado de bases legales para todos los países por igual —
// ahora se lee jurisdiction_legal_bases filtrado por país. Para CL, esa
// tabla trae exactamente las 6 bases del Art. 13 (sin las 3 prohibidas para
// privados). Para países sin la tabla poblada (ej. CO, hoy con 0 filas), se
// mantiene el comportamiento previo vía LEGAL_BASIS_OPTIONS como fallback —
// mismo criterio que useJurisdictionDocumentTypes.
export function useJurisdictionLegalBases(countryCode: string = "CL") {
  const [legalBases, setLegalBases] = useState<JurisdictionLegalBase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchJurisdictionLegalBases(countryCode)
      .then((res) => {
        if (isMounted) {
          if (res.data) {
            setLegalBases(res.data);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn("Failed to fetch jurisdiction legal bases, using fallback:", err);
          setError("Failed to fetch legal bases");
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [countryCode]);

  const options = useMemo<CustomSelectOption<LegalBasis>[]>(() => {
    if (legalBases.length > 0) {
      return legalBases.map((b) => ({
        value: b.baseCode as LegalBasis,
        title: LEGAL_BASIS_LABELS[b.baseCode as LegalBasis] ?? b.baseCode,
      }));
    }
    // Fallback: país sin jurisdiction_legal_bases poblada (ej. CO).
    return LEGAL_BASIS_OPTIONS;
  }, [legalBases]);

  // baseCode -> requiresJustification, solo disponible cuando viene de BD.
  const requiresJustificationByBase = useMemo<Partial<Record<LegalBasis, boolean>>>(() => {
    const map: Partial<Record<LegalBasis, boolean>> = {};
    for (const b of legalBases) {
      map[b.baseCode as LegalBasis] = b.requiresJustification;
    }
    return map;
  }, [legalBases]);

  return { legalBases, options, requiresJustificationByBase, loading, error };
}
