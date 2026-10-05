/**
 * El backend limita las escrituras del wizard de riesgo a 10 solicitudes
 * cada 60s por sesión (ver wizardRiskRateLimit.middleware.ts). Un simple
 * "mínimo de 700ms entre clicks" no alcanza a evitar el error: en bloques
 * con varias preguntas Sí/No seguidas (Bloque 2 tiene 10), un usuario real
 * respondiendo a ritmo normal igual puede completar 10 en bastante menos
 * de 60 segundos y chocar con el límite del servidor.
 *
 * Este módulo lleva la cuenta, en el cliente, de las últimas solicitudes
 * de guardado (misma ventana deslizante que el rate limiter: 10 cada 60s,
 * con 1 de margen de seguridad) y, si ya se envían 9 en los últimos 60s,
 * espera lo que falte para que la más vieja "salga" de la ventana antes de
 * disparar la próxima — en vez de dejar que el servidor la rechace y
 * recién ahí mostrar un error. El spinner de "Siguiente" (`isLoading`)
 * cubre esa espera en la UI.
 */
const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;
const SAFETY_MARGIN = 1;
const WAIT_BUFFER_MS = 300;

const recentRequestTimestamps: number[] = [];

async function waitForRateLimitSlot(): Promise<void> {
  const now = Date.now();
  while (recentRequestTimestamps.length && now - recentRequestTimestamps[0] >= RATE_LIMIT_WINDOW_MS) {
    recentRequestTimestamps.shift();
  }

  if (recentRequestTimestamps.length < RATE_LIMIT_MAX_REQUESTS - SAFETY_MARGIN) {
    return;
  }

  const oldest = recentRequestTimestamps[0];
  const waitMs = RATE_LIMIT_WINDOW_MS - (now - oldest) + WAIT_BUFFER_MS;
  if (waitMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
  return waitForRateLimitSlot();
}

/**
 * Piso de tiempo por transición aunque no haya que esperar cupo — así la
 * animación de entrada de la siguiente pregunta (ver `.wizard-risk-step-in`
 * en globals.css) siempre alcanza a completarse y el cambio no se siente
 * instantáneo/brusco.
 */
const MIN_TRANSITION_MS = 500;

/**
 * `action` se recibe como función (no como Promise ya iniciada) para poder
 * esperar el cupo del rate limiter ANTES de disparar la solicitud real.
 */
export async function withMinTransitionDelay<T>(action: () => Promise<T>): Promise<T> {
  await waitForRateLimitSlot();
  recentRequestTimestamps.push(Date.now());

  const start = Date.now();
  const result = await action();
  const elapsed = Date.now() - start;
  if (elapsed < MIN_TRANSITION_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_TRANSITION_MS - elapsed));
  }
  return result;
}
