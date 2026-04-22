import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  sendDefaultPii: true,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  replaysSessionSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [Sentry.replayIntegration()],
  ignoreErrors: [
    "MetaMask extension not found",
    "Failed to connect to MetaMask",
  ],
  beforeSend(event) {
    const message = event.message || "";
    const exceptionValues = event.exception?.values || [];
    const stack = exceptionValues
      .flatMap((value) => value.stacktrace?.frames || [])
      .map((frame) => frame.filename || "")
      .join(" ");
    const exceptionMessages = exceptionValues
      .map((value) => value.value || "")
      .join(" ");

    // Reduce ruido de extensiones del navegador (no son errores de la app)
    const isExtensionError =
      message.includes("disconnected port object") ||
      message.includes("Attempting to use a disconnected port object") ||
      message.includes("MetaMask") ||
      exceptionMessages.includes("MetaMask") ||
      stack?.includes("chrome-extension://") ||
      stack?.includes("app:///scripts/inpage.js");

    if (isExtensionError) return null;
    return event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

