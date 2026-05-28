/** Estilo moderno del portal personas (minimal, bordes suaves, poco shadow). */
export const personasTheme = {
  pageBg: "personas-page-bg min-h-full",
  hero: "relative overflow-hidden border-b border-zinc-200/70 bg-white",
  header:
    "sticky top-0 z-40 overflow-visible border-b border-zinc-200/60 bg-white/75 backdrop-blur-2xl backdrop-saturate-150",
  heading: "text-primary-900 tracking-tight",
  body: "text-zinc-600",
  muted: "text-zinc-500",
  link: "font-medium text-primary-900 transition-colors hover:text-primary-500",
  sectionTitle: "text-sm font-medium text-primary-500",
  card: "rounded-3xl border border-zinc-200/80 bg-white",
  cardSoft:
    "rounded-2xl border border-zinc-200/70 bg-white transition-colors duration-200 hover:border-primary-500/30",
  featurePanel:
    "rounded-3xl border border-zinc-200/80 bg-zinc-50/50 p-5 sm:p-6",
  sectionAlt: "bg-zinc-50/40",
  badge:
    "inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700",
  infoBox: "rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-4",
  iconBox:
    "flex items-center justify-center rounded-2xl bg-primary-50 text-primary-600",
  icon: "text-primary-600",
  iconAccent: "text-primary-900",
  selectedCard:
    "border-primary-900 bg-primary-50/40 ring-2 ring-primary-900/10",
  cardHover: "border-zinc-200/80 bg-white hover:border-zinc-300",
  ctaDark:
    "relative overflow-hidden rounded-3xl bg-primary-900 px-8 py-10 text-white sm:px-10 sm:py-12",
  bentoItem:
    "rounded-2xl border border-zinc-200/70 bg-white p-4 transition-colors hover:border-primary-500/25",
} as const;
