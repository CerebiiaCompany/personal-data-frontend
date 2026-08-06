import { CustomFile } from "./file.types";

// Item 7: STATIC_FILE es el comportamiento histórico (archivo subido).
// RAT_GENERATED no tiene archivo — su contenido se genera en vivo desde el
// RAT (Registro de Actividades de Tratamiento) en cada consulta.
export type PolicySourceType = "STATIC_FILE" | "RAT_GENERATED";

export interface CreatePolicyTemplate {
  name: string;
  fileId?: string;
  sourceType?: PolicySourceType;
}

export interface PolicyTemplate extends Omit<CreatePolicyTemplate, "fileId"> {
  _id: string;
  companyId: string;
  sourceType: PolicySourceType;
  createdAt: Date;
  updatedAt: Date;
  file: CustomFile | null;
}
