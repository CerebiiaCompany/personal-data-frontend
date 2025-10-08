import { toast } from "sonner";

export function copyToClipboard(text: string, message?: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success(message || "Copiado al portapapeles"))
    .catch((e) => toast.error("Error al copiar al portapapeles"));
}
