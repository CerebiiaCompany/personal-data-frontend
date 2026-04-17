import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  sendDefaultPii: true,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  replaysSessionSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [Sentry.replayIntegration()],
  beforeSend(event) {
    const message = event.message || "";
    const stack = event.exception?.values?.[0]?.stacktrace?.frames
      ?.map((f) => f.filename || "")
      .join(" ");

    // Reduce ruido de extensiones del navegador (no son errores de la app)
    const isExtensionError =
      message.includes("disconnected port object") ||
      message.includes("Attempting to use a disconnected port object") ||
      stack?.includes("chrome-extension://");

    if (isExtensionError) return null;
    return event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

