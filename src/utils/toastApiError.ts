import { toast } from "sonner";

const NETWORK_TOAST_ID = "http-network-error";

const NETWORK_MESSAGE_RE =
  /error de conexión|sin conexión|verifica tu red|tiempo de espera/i;

export function isTransientNetworkMessage(message: string): boolean {
  return NETWORK_MESSAGE_RE.test(message);
}

/**
 * Toast de error de API. Los fallos de red/timeout se agrupan en un solo
 * aviso para no saturar la UI cuando varios hooks fallan a la vez (p. ej.
 * justo después del login).
 */
export function toastApiError(message: string) {
  if (isTransientNetworkMessage(message)) {
    toast.error(message, { id: NETWORK_TOAST_ID });
    return;
  }

  toast.error(message);
}
