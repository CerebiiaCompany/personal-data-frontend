import { toast } from "sonner";

export function copyToClipboard(text: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success("Copiado al portapapeles"))
    .catch((e) => toast.error("Error al copiar al portapapeles"));
}
