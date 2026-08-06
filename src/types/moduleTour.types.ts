export type ModuleTourId =
  | "dashboard"
  | "recoleccion"
  | "plantillas"
  | "clasificacion"
  | "campanas"
  | "auditoria"
  | "arco"
  | "tratamientos"
  | "administracion";

export type TourPlacement = "top" | "bottom" | "left" | "right" | "auto";

export interface ModuleTourStep {
  /** Coincide con `data-tour="..."` en el DOM. */
  target: string;
  title: string;
  description: string;
  placement?: TourPlacement;
}

export interface ModuleTourDefinition {
  id: ModuleTourId;
  title: string;
  steps: ModuleTourStep[];
}
