import { APIResponse } from "@/types/api.types";
import { customFetch } from "@/utils/customFetch";

export interface JurisdictionDocumentType {
  id: string;
  country: string;
  name: string;
  regexValidation?: string | null;
}

export interface JurisdictionGeographicDivision {
  id: string;
  country: string;
  level1Name: string; // Ej: Región (CL) / Departamento (CO)
  level2Name: string; // Ej: Provincia (CL) / Municipio (CO)
  level3Name: string; // Ej: Comuna (CL) / Localidad (CO)
}

export interface JurisdictionLegalBase {
  id: string;
  country: string;
  baseCode: string;
  description: string;
  requiresJustification: boolean;
}

export async function fetchJurisdictionDocumentTypes(
  country: string = "CL"
): Promise<APIResponse<JurisdictionDocumentType[]>> {
  return customFetch<JurisdictionDocumentType[]>(
    `/jurisdiction/document-types?country=${encodeURIComponent(country)}`
  );
}

export async function fetchJurisdictionGeographicDivisions(
  country: string = "CL"
): Promise<APIResponse<JurisdictionGeographicDivision[]>> {
  return customFetch<JurisdictionGeographicDivision[]>(
    `/jurisdiction/geographic-divisions?country=${encodeURIComponent(country)}`
  );
}

export async function fetchJurisdictionLegalBases(
  country: string = "CL"
): Promise<APIResponse<JurisdictionLegalBase[]>> {
  return customFetch<JurisdictionLegalBase[]>(
    `/jurisdiction/legal-bases?country=${encodeURIComponent(country)}`
  );
}
