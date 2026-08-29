export interface WelcomeTourSlide {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}

export const WELCOME_TOUR_SLIDES: WelcomeTourSlide[] = [
  {
    id: "welcome",
    title: "¡Bienvenido a Cerebiia Data!",
    description:
      "Tu espacio para gestionar el cumplimiento de protección de datos de forma clara, ordenada y trazable.",
    imageSrc: "/onboarding/welcome-slide-01-welcome.png",
    imageAlt: "Ilustración de bienvenida a la plataforma",
  },
  {
    id: "treatments",
    title: "Registra tus tratamientos",
    description:
      "Documenta qué datos personales trata tu empresa, con qué finalidad y bajo qué base legal. Es la base de tu cumplimiento.",
    imageSrc: "/onboarding/welcome-slide-02-treatments.png",
    imageAlt: "Ilustración de registros de tratamiento",
  },
  {
    id: "forms",
    title: "Recoge consentimientos",
    description:
      "Crea formularios y campañas para capturar datos y autorizaciones de tus titulares con evidencia clara.",
    imageSrc: "/onboarding/welcome-slide-03-forms.png",
    imageAlt: "Ilustración de formularios de consentimiento",
  },
  {
    id: "rights",
    title: "Atiende derechos ARCO",
    description:
      "Gestiona solicitudes de acceso, rectificación, supresión y oposición con plazos y trazabilidad.",
    imageSrc: "/onboarding/welcome-slide-04-rights.png",
    imageAlt: "Ilustración de atención de derechos ARCO",
  },
  {
    id: "first-steps",
    title: "Empieza por lo esencial",
    description:
      "Al cerrar esta guía verás tus primeros pasos. Completarlos te ayuda a dejar la plataforma lista para operar.",
    imageSrc: "/onboarding/welcome-slide-01-welcome.png",
    imageAlt: "Ilustración de primeros pasos",
  },
];
