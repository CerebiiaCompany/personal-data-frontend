import { useEffect, useState, useMemo, useCallback } from "react";
import {
  fetchJurisdictionGeographicDivisions,
  JurisdictionGeographicDivision,
} from "@/lib/jurisdiction.api";
import { CustomSelectOption } from "@/types/forms.types";
import {
  CHILEAN_REGIONS,
  findChileanProvince,
  findChileanRegion,
  normalizeChilePlaceName,
} from "@/constants/chileanRegions";

function matchesChilePlace(left?: string | null, right?: string | null): boolean {
  if (!left || !right) return false;
  return normalizeChilePlaceName(left) === normalizeChilePlaceName(right);
}

function toOptions(values: string[]): CustomSelectOption<string>[] {
  return values
    .filter((value) => Boolean(value && value.trim()))
    .map((value) => ({ title: value, value }));
}

function fallbackProvinciaOptions(selectedRegion: string): CustomSelectOption<string>[] {
  const found = findChileanRegion(selectedRegion);
  if (!found) return [];
  return toOptions(found.provinces.map((province) => province.name));
}

function fallbackComunaOptions(
  selectedRegion: string,
  selectedProvincia?: string
): CustomSelectOption<string>[] {
  const found = findChileanRegion(selectedRegion);
  if (!found) return [];
  if (selectedProvincia) {
    const province = findChileanProvince(selectedRegion, selectedProvincia);
    return toOptions(province?.comunas ?? found.comunas);
  }
  return toOptions(found.comunas);
}

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
      divisions.forEach((d) => {
        if (d.level1Name?.trim()) set.add(d.level1Name);
      });
      const fromApi = toOptions(Array.from(set));
      if (fromApi.length > 0) return fromApi;
    }
    return CHILEAN_REGIONS.map((r) => ({ title: r.name, value: r.name }));
  }, [divisions]);

  // Unique Provincias (Level 2) for a given Región
  const getProvinciaOptions = useCallback(
    (selectedRegion: string): CustomSelectOption<string>[] => {
      if (!selectedRegion) return [];
      if (divisions.length > 0) {
        const set = new Set<string>();
        divisions
          .filter((d) => matchesChilePlace(d.level1Name, selectedRegion))
          .forEach((d) => {
            if (d.level2Name?.trim()) set.add(d.level2Name);
          });
        const fromApi = toOptions(Array.from(set));
        if (fromApi.length > 0) return fromApi;
      }
      return fallbackProvinciaOptions(selectedRegion);
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
            if (!matchesChilePlace(d.level1Name, selectedRegion)) return false;
            if (
              selectedProvincia &&
              !matchesChilePlace(d.level2Name, selectedProvincia)
            ) {
              return false;
            }
            return Boolean(d.level3Name?.trim());
          })
          .forEach((d) => set.add(d.level3Name));
        const fromApi = toOptions(Array.from(set));
        if (fromApi.length > 0) return fromApi;
      }
      return fallbackComunaOptions(selectedRegion, selectedProvincia);
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
