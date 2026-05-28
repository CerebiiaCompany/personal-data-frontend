import { ArcoDocType } from "@/types/arco.types";
import { PersonasDocTypeId } from "@/types/personas.types";

/** Mapea tipos del portal a códigos aceptados por POST /arco/lookup */
export function mapPersonasDocTypeToArco(docType: PersonasDocTypeId): ArcoDocType {
  switch (docType) {
    case "CC":
    case "CI":
      return "CC";
    case "TI":
      return "TI";
    case "RUT":
    case "PASSPORT":
      return "OTHER";
    default:
      return "OTHER";
  }
}
