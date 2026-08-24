import { useEffect, useState, useMemo, useCallback } from "react";
import {
  fetchJurisdictionGeographicDivisions,
  JurisdictionGeographicDivision,
} from "@/lib/jurisdiction.api";
import { CustomSelectOption } from "@/types/forms.types";
import { CHILEAN_REGIONS } from "@/constants/chileanRegions";

export function useJurisdictionGeographicDivisions(countryCode: string = "CL") {
  const [divisions, setDivisions] = useState<JurisdictionGeographicDivision[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchJurisdictionGeographicDivisions(countryCode)
      .then((res) => {
        if (isMounted) {
          if (res.data && res.data.length > 0) {
            setDivisions(res.data);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn("Failed to fetch geographic divisions, using fallback:", err);
          setError("Failed to fetch geographic divisions");
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [countryCode]);

  // Unique Regiones (Level 1)
  const regionOptions = useMemo<CustomSelectOption<string>[]>(() => {
    if (divisions.length > 0) {
      const set = new Set<string>();
      divisions.forEach((d) => set.add(d.level1Name));
      return Array.from(set).map((r) => ({ title: r, value: r }));
    }
    // Fallback to static CHILEAN_REGIONS
    return CHILEAN_REGIONS.map((r) => ({ title: r.name, value: r.name }));
  }, [divisions]);

  // Unique Provincias (Level 2) for a given Región
  const getProvinciaOptions = useCallback(
    (selectedRegion: string): CustomSelectOption<string>[] => {
      if (!selectedRegion) return [];
      if (divisions.length > 0) {
        const set = new Set<string>();
        divisions
          .filter((d) => d.level1Name === selectedRegion)
          .forEach((d) => set.add(d.level2Name));
        return Array.from(set).map((p) => ({ title: p, value: p }));
      }
      return [];
    },
    [divisions]
  );

  // Unique Comunas (Level 3) for a given Región & optional Provincia
  const getComunaOptions = useCallback(
    (selectedRegion: string, selectedProvincia?: string): CustomSelectOption<string>[] => {
      if (!selectedRegion) return [];
      if (divisions.length > 0) {
        const set = new Set<string>();
        divisions
          .filter((d) => {
            if (d.level1Name !== selectedRegion) return false;
            if (selectedProvincia && d.level2Name !== selectedProvincia) return false;
            return true;
          })
          .forEach((d) => set.add(d.level3Name));
        return Array.from(set).map((c) => ({ title: c, value: c }));
      }
      // Fallback to static CHILEAN_REGIONS
      const found = CHILEAN_REGIONS.find((r) => r.name === selectedRegion);
      if (!found) return [];
      return found.comunas.map((c) => ({ title: c, value: c }));
    },
    [divisions]
  );

  return {
    divisions,
    regionOptions,
    getProvinciaOptions,
    getComunaOptions,
    loading,
    error,
  };
}
