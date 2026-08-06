import {
  ModuleTourDefinition,
  ModuleTourId,
} from "@/types/moduleTour.types";

export const MODULE_TOURS: Record<ModuleTourId, ModuleTourDefinition> = {
  dashboard: {
    id: "dashboard",
    title: "Tutorial del panel de inicio",
    steps: [
      {
        target: "dashboard-header",
        title: "Panel de inicio",
        description:
          "Aquí ves un resumen del estado de cumplimiento de tu empresa: métricas, alertas y actividad reciente.",
      },
      {
        target: "dashboard-period",
        title: "Filtro de periodo",
        description:
          "Cambia mes y año para consultar indicadores del rango seleccionado. También puedes exportar el resumen.",
      },
      {
        target: "dashboard-stats",
        title: "Indicadores clave",
        description:
          "Créditos, formularios activos y registros totales te dan una foto rápida de la operación.",
      },
      {
        target: "dashboard-officer",
        title: "Oficial de datos",
        description:
          "Aquí ves quién es el Oficial de Protección de Datos de tu empresa. Si aún no hay uno, puedes asignarlo desde este aviso.",
      },
      {
        target: "dashboard-activity",
        title: "Actividad reciente",
        description:
          "Revisa las últimas acciones de usuarios y el estado de campañas o formularios desde este espacio.",
      },
    ],
  },
  recoleccion: {
    id: "recoleccion",
    title: "Tutorial de recolección",
    steps: [
      {
        target: "recoleccion-header",
        title: "Recolección de datos",
        description:
          "Este módulo concentra tus formularios de consentimiento y políticas asociadas a la captura de datos.",
      },
      {
        target: "recoleccion-search",
        title: "Búsqueda",
        description:
          "Filtra formularios por nombre para encontrar rápido el canal que necesitas gestionar.",
      },
      {
        target: "recoleccion-create",
        title: "Crear formulario",
        description:
          "Desde aquí creas un nuevo formulario de recolección para capturar datos y consentimientos.",
      },
      {
        target: "recoleccion-filters",
        title: "Filtros",
        description:
          "Segmenta entre formularios propios e importados desde políticas de tratamiento según tu necesidad.",
      },
      {
        target: "recoleccion-list",
        title: "Listado de formularios",
        description:
          "Cada tarjeta o fila te lleva al detalle del formulario: edición, respuestas y estado.",
      },
    ],
  },
  plantillas: {
    id: "plantillas",
    title: "Tutorial de políticas de tratamiento",
    steps: [
      {
        target: "plantillas-header",
        title: "Políticas de tratamiento de datos personales",
        description:
          "Aquí gestionas las políticas de tratamiento de datos personales que tus titulares deben aceptar.",
      },
      {
        target: "plantillas-actions",
        title: "Acciones principales",
        description:
          "Sube una política, genera una desde el RAT o actualiza el listado cuando hagas cambios.",
      },
      {
        target: "plantillas-list",
        title: "Tus políticas",
        description:
          "Consulta, previsualiza, renombra o elimina cada política de tratamiento. Úsalas luego en formularios y campañas.",
      },
    ],
  },
  clasificacion: {
    id: "clasificacion",
    title: "Tutorial de clasificación",
    steps: [
      {
        target: "clasificacion-header",
        title: "Clasificación",
        description:
          "Revisa y clasifica las respuestas capturadas en tus formularios de recolección.",
      },
      {
        target: "clasificacion-search",
        title: "Búsqueda de formularios",
        description:
          "Encuentra un formulario por nombre para entrar a su bandeja de respuestas.",
      },
      {
        target: "clasificacion-actions",
        title: "Acciones rápidas",
        description:
          "Descarga plantillas Excel, importa registros o lanza campañas de consentimiento desde aquí.",
      },
      {
        target: "clasificacion-table",
        title: "Tabla de formularios",
        description:
          "Muestra totales, verificados y pendientes. Entra a cada formulario para clasificar respuestas.",
      },
    ],
  },
  campanas: {
    id: "campanas",
    title: "Tutorial de campañas",
    steps: [
      {
        target: "campanas-header",
        title: "Campañas",
        description:
          "Gestiona campañas de consentimiento o comunicación asociadas a tus formularios y titulares.",
      },
      {
        target: "campanas-summary",
        title: "Resumen",
        description:
          "Indicadores de campañas activas, alcance y créditos consumidos en el periodo.",
      },
      {
        target: "campanas-filters",
        title: "Filtros",
        description:
          "Filtra por estado (activa, programada, pausada…) y por tipo de campaña.",
      },
      {
        target: "campanas-create",
        title: "Crear campaña",
        description:
          "Inicia una campaña nueva o programada para solicitar consentimientos o informar a titulares.",
      },
      {
        target: "campanas-table",
        title: "Listado",
        description:
          "Consulta el detalle de cada campaña, su estado y resultados de envío.",
      },
    ],
  },
  auditoria: {
    id: "auditoria",
    title: "Tutorial de auditoría",
    steps: [
      {
        target: "auditoria-header",
        title: "Auditoría",
        description:
          "Trazabilidad de acciones realizadas en la plataforma por usuarios de tu empresa.",
      },
      {
        target: "auditoria-filters",
        title: "Filtros de auditoría",
        description:
          "Acota por fechas, tipo de acción, modelo afectado o usuario para investigar cambios.",
      },
      {
        target: "auditoria-table",
        title: "Registro de eventos",
        description:
          "Cada fila documenta quién hizo qué, cuándo y sobre qué recurso. Útil para cumplimiento.",
      },
    ],
  },
  arco: {
    id: "arco",
    title: "Tutorial de solicitudes ARCO",
    steps: [
      {
        target: "arco-header",
        title: "Solicitudes ARCO",
        description:
          "Atiende derechos de acceso, rectificación, cancelación, oposición y portabilidad de titulares.",
      },
      {
        target: "arco-summary",
        title: "Resumen de estados",
        description:
          "Tarjetas con conteos por estado y vencidas. Haz clic para filtrar la tabla rápidamente.",
      },
      {
        target: "arco-filters",
        title: "Filtros",
        description:
          "Busca por documento, estado u otros criterios para priorizar la atención.",
      },
      {
        target: "arco-table",
        title: "Bandeja de solicitudes",
        description:
          "Abre cada solicitud para responder, ampliar plazos o registrar la gestión completa.",
      },
      {
        target: "arco-officers",
        title: "Oficiales ARCO",
        description:
          "Define quiénes pueden gestionar solicitudes en nombre de la empresa.",
      },
    ],
  },
  tratamientos: {
    id: "tratamientos",
    title: "Tutorial de tratamientos (RAT)",
    steps: [
      {
        target: "tratamientos-header",
        title: "Registro de Actividades de Tratamiento",
        description:
          "Inventario legal de qué datos trata tu empresa, con qué finalidad y base jurídica.",
      },
      {
        target: "tratamientos-filters",
        title: "Filtros del RAT",
        description:
          "Filtra por estado, base legal, datos sensibles o texto libre para ubicar un tratamiento.",
      },
      {
        target: "tratamientos-create",
        title: "Nuevo tratamiento",
        description:
          "Documenta una nueva actividad de tratamiento. Es la base de tu cumplimiento normativo.",
      },
      {
        target: "tratamientos-table",
        title: "Listado RAT",
        description:
          "Consulta, edita o archiva tratamientos existentes desde esta tabla.",
      },
    ],
  },
  administracion: {
    id: "administracion",
    title: "Tutorial de administración",
    steps: [
      {
        target: "administracion-header",
        title: "Administración",
        description:
          "Centro de configuración de tu empresa: estructura, accesos y perfil organizacional.",
      },
      {
        target: "administracion-profile",
        title: "Perfil de empresa",
        description:
          "Completa identificación, representante legal, oficial de datos y demás secciones de cumplimiento.",
      },
      {
        target: "administracion-cards",
        title: "Accesos rápidos",
        description:
          "Entra a usuarios, áreas, roles y finalidades para organizar tu operación interna.",
      },
      {
        target: "administracion-company",
        title: "Datos de la compañía",
        description:
          "Revisa la información básica y edítala cuando cambie la razón social, contacto u otros datos.",
      },
    ],
  },
};

export function getModuleTour(id: ModuleTourId): ModuleTourDefinition {
  return MODULE_TOURS[id];
}
