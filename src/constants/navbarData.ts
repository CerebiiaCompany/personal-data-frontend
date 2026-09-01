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

export const DASHBOARD_MODULE_TITLE = "Dashboard";

export const NAVBAR_DATA: NavbarData = [
  { title: "Perfil", path: "/perfil", minRole: "USER" },
  { title: "Editar Perfil", path: "/perfil/editar", minRole: "USER" },
  { title: "Cambiar clave", path: "/perfil/cambiar-clave", minRole: "USER" },
  { title: "Historial de pagos", path: "/perfil/pagos", minRole: "USER" },
  { title: "Planes", path: "/perfil/planes", minRole: "USER" },
  {
    title: DASHBOARD_MODULE_TITLE,
    path: "/admin",
    icon: "heroicons:home",
    minRole: "USER",
    requiredPermission: "dashboard.view",
  },
  {
    // Fusionado con "Dashboard" en el menú visible (Pre-Go-Live GRUPO C):
    // ambas páginas exigen el mismo permiso y siguen existiendo por
    // separado (fusionar el CONTENIDO de ambas páginas en una sola es un
    // trabajo de UI más grande, fuera de alcance de este cambio) — se
    // accede desde una tarjeta dentro de "Dashboard" (ver admin/page.tsx).
    // Sin `icon`: DashboardNavbar.tsx filtra por `route.icon` para decidir
    // qué aparece en el sidebar, mismo mecanismo ya usado para ocultar
    // sub-rutas como "Crear formulario nuevo".
    title: "Cumplimiento",
    path: "/admin/cumplimiento",
    minRole: "USER",
    requiredPermission: "dashboard.view",
  },
  {
    title: "Formularios de Recolección",
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
    title: "Políticas de Privacidad",
    path: "/admin/plantillas",
    icon: "radix-icons:file-text",
    minRole: "USER",
    requiredPermission: "templates.view",
  },
  {
    title: "Datos Recolectados",
    path: "/admin/clasificacion",
    icon: "material-symbols:view-column-outline",
    minRole: "USER",
    requiredPermission: "classification.view",
  },
  {
    title: "Campañas",
    path: "/admin/campanas",
    icon: "tabler:speakerphone",
    minRole: "USER",
    requiredPermission: "campaigns.view",
  },
  {
    title: "IA",
    path: "/admin/asistente-ia",
    icon: "tabler:sparkles",
    minRole: "USER",
  },
  {
    title: "Log de Auditoría",
    path: "/admin/auditoria",
    icon: "heroicons:clipboard-document-list",
    minRole: "USER",
    requiredPermission: "audit.view",
  },
  {
    title: "Solicitudes de Derechos",
    path: "/admin/arco",
    icon: "tabler:scale",
    minRole: "USER",
    requiredPermission: "arcoRequests.view",
  },
  {
    title: "Registro de Tratamientos",
    path: "/admin/tratamientos",
    icon: "tabler:list-details",
    minRole: "USER",
    requiredPermission: "treatments.view",
  },
  {
    title: "Nuevo tratamiento",
    path: "/admin/tratamientos/crear",
    minRole: "USER",
    requiredPermission: "treatments.create",
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
