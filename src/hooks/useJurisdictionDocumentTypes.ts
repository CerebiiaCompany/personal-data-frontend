import { useEffect, useState, useMemo } from "react";
import {
  fetchJurisdictionDocumentTypes,
  JurisdictionDocumentType,
} from "@/lib/jurisdiction.api";
import { CustomSelectOption } from "@/types/forms.types";
import { DocType, getAdminDocTypeOptionsByCountry } from "@/types/user.types";

export function useJurisdictionDocumentTypes(countryCode: string = "CL") {
  const [documentTypes, setDocumentTypes] = useState<JurisdictionDocumentType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchJurisdictionDocumentTypes(countryCode)
      .then((res) => {
        if (isMounted) {
          if (res.data) {
            setDocumentTypes(res.data);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn("Failed to fetch jurisdiction document types, using fallback:", err);
          setError("Failed to fetch document types");
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [countryCode]);

  const options = useMemo<CustomSelectOption<DocType>[]>(() => {
    if (documentTypes.length > 0) {
      return documentTypes.map((dt) => ({
        value: dt.name as DocType,
        title: dt.name === "RUT" ? "RUT" : dt.name === "CI" ? "Cédula de Identidad" : dt.name === "CC" ? "C.C." : dt.name === "TI" ? "T.I." : dt.name,
      }));
    }
    // Fallback to static getAdminDocTypeOptionsByCountry
    return getAdminDocTypeOptionsByCountry(countryCode, { includeNit: true }).options;
  }, [documentTypes, countryCode]);

  const defaultValue = useMemo<DocType>(() => {
    if (options.length > 0) {
      return options[0].value;
    }
    return countryCode === "CL" ? "RUT" : "CC";
  }, [options, countryCode]);

  return { documentTypes, options, defaultValue, loading, error };
}
