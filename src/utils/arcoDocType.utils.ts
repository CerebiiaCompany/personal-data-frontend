import { ArcoDocType } from "@/types/arco.types";
import { PersonasDocTypeId } from "@/types/personas.types";

/** Mapea tipos del portal a códigos aceptados por POST /arco/lookup */
export function mapPersonasDocTypeToArco(docType: PersonasDocTypeId): ArcoDocType {
  switch (docType) {
    case "CC":
      return "CC";
    case "TI":
      return "TI";
    case "RUT":
      return "RUT";
    case "CI":
      return "CI";
    case "PASSPORT":
      return "PASSPORT";
    case "OTHER":
      return "OTHER";
    default:
      return "OTHER";
  }
}

/** RUT y CI chilenos usan el mismo formato con dígito verificador. */
export function isPersonasRutLikeDocType(docType: string | null | undefined): boolean {
  return docType === "RUT" || docType === "CI";
}
