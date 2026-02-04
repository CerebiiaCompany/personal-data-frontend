import { UserRole } from "@/types/user.types";

export type NavbarItem = {
  title: string;
  path: string;
  icon?: string;
  minRole: UserRole;
  /**
   * Permiso requerido en formato 'modulo.accion' (ej: 'campaigns.view', 'collect.create')
   * Si no se especifica, solo se verifica el rol mínimo
   */
  requiredPermission?: string;
};

export type NavbarData = NavbarItem[];

export const NAVBAR_DATA: NavbarData = [
  { title: "Perfil", path: "/perfil", minRole: "USER" },
  { title: "Editar Perfil", path: "/perfil/editar", minRole: "USER" },
  { title: "Cambiar clave", path: "/perfil/cambiar-clave", minRole: "USER" },
  { title: "Historial de pagos", path: "/perfil/pagos", minRole: "USER" },
  { title: "Planes", path: "/perfil/planes", minRole: "USER" },
  {
    title: "Inicio",
    path: "/admin",
    icon: "heroicons:home",
    minRole: "USER",
    requiredPermission: "dashboard.view",
  },
  {
    title: "Recolección",
    path: "/admin/recoleccion",
    icon: "tabler:clipboard-list",
    minRole: "USER",
    requiredPermission: "collect.view",
  },
  {
    title: "Crear formulario nuevo",
    path: "/admin/recoleccion/crear-formulario",
    minRole: "USER",
    requiredPermission: "collect.create",
  },
  {
    title: "Plantillas",
    path: "/admin/plantillas",
    icon: "radix-icons:file-text",
    minRole: "USER",
    requiredPermission: "templates.view",
  },
  {
    title: "Clasificación",
    path: "/admin/clasificacion",
    icon: "material-symbols:view-column-outline",
    minRole: "USER",
    requiredPermission: "classification.view",
  },
  {
    title: "Campañas",
    path: "/admin/campanas",
    icon: "flowbite:grid-plus-outline",
    minRole: "USER",
    requiredPermission: "campaigns.view",
  },
  {
    title: "Crear Campaña",
    path: "/admin/campanas/crear",
    minRole: "USER",
    requiredPermission: "campaigns.create",
  },
  {
    title: "Administración",
    path: "/admin/administracion",
    icon: "heroicons-outline:user-group",
    minRole: "COMPANY_ADMIN",
  },
  {
    title: "Usuarios",
    path: "/admin/administracion/usuarios",
    minRole: "COMPANY_ADMIN",
  },
  {
    title: "Crear Usuario",
    path: "/admin/administracion/usuarios/crear",
    minRole: "COMPANY_ADMIN",
  },
  {
    title: "Áreas",
    path: "/admin/administracion/areas",
    minRole: "COMPANY_ADMIN",
  },
  {
    title: "Crear Área",
    path: "/admin/administracion/areas/crear",
    minRole: "COMPANY_ADMIN",
  },
  {
    title: "Roles",
    path: "/admin/administracion/roles",
    minRole: "COMPANY_ADMIN",
  },
];
