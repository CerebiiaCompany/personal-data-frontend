type NavbarData = {
  title: string;
  path: string;
  icon?: string;
}[];

export const NAVBAR_DATA: NavbarData = [
  {
    title: "Inicio",
    path: "/",
    icon: "heroicons:home",
  },
  {
    title: "Recolección",
    path: "/recoleccion",
    icon: "tabler:clipboard-list",
  },
  {
    title: "Crear formulario nuevo",
    path: "/recoleccion/crear-formulario",
  },
  {
    title: "Plantillas",
    path: "/plantillas",
    icon: "radix-icons:file-text",
  },
  {
    title: "Clasificación",
    path: "/clasificación",
    icon: "material-symbols:view-column-outline",
  },
  {
    title: "Campañas",
    path: "/campañas",
    icon: "flowbite:grid-plus-outline",
  },
  {
    title: "Administración",
    path: "/administracion",
    icon: "heroicons-outline:user-group",
  },
];
