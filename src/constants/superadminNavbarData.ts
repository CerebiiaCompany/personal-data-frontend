import { NavbarData } from "./navbarData";

export const SUPERADMIN_NAVBAR_DATA: NavbarData = [
  {
    title: "Inicio",
    path: "/superadmin",
    icon: "heroicons:home",
    minRole: "SUPERADMIN",
  },
  {
    title: "Empresas",
    path: "/superadmin/empresas",
    icon: "tabler:building",
    minRole: "SUPERADMIN",
  },
  {
    title: "Crear Empresa",
    path: "/superadmin/empresas/crear",
    minRole: "SUPERADMIN",
  },
  {
    title: "Pagos",
    path: "/superadmin/pagos",
    icon: "tabler:credit-card",
    minRole: "SUPERADMIN",
  },
  {
    title: "Crear Pago",
    path: "/superadmin/pagos/crear",
    minRole: "SUPERADMIN",
  },
  {
    title: "Administradores",
    path: "/superadmin/administradores",
    icon: "tabler:users-group",
    minRole: "SUPERADMIN",
  },
  {
    title: "Crear Administrador",
    path: "/superadmin/administradores/crear",
    minRole: "SUPERADMIN",
  },
];
