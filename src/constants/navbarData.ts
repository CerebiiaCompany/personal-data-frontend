import { UserRole } from "@/types/user.types";

type NavbarData = {
  title: string;
  path: string;
  icon?: string;
  minRole: UserRole;
}[];

export const NAVBAR_DATA: NavbarData = [
  {
    title: "Inicio",
    path: "/admin",
    icon: "heroicons:home",
    minRole: "COMPANY_ADMIN",
  },
  {
    title: "Recolección",
    path: "/admin/recoleccion",
    icon: "tabler:clipboard-list",
    minRole: "COMPANY_ADMIN",
  },
  {
    title: "Crear formulario nuevo",
    path: "/admin/recoleccion/crear-formulario",
    minRole: "COMPANY_ADMIN",
  },
  {
    title: "Plantillas",
    path: "/admin/plantillas",
    icon: "radix-icons:file-text",
    minRole: "COMPANY_ADMIN",
  },
  {
    title: "Clasificación",
    path: "/admin/clasificacion",
    icon: "material-symbols:view-column-outline",
    minRole: "COMPANY_ADMIN",
  },
  {
    title: "Campañas",
    path: "/admin/campanas",
    icon: "flowbite:grid-plus-outline",
    minRole: "COMPANY_ADMIN",
  },
  {
    title: "Administración",
    path: "/admin/administracion",
    icon: "heroicons-outline:user-group",
    minRole: "COMPANY_ADMIN",
  },
];
