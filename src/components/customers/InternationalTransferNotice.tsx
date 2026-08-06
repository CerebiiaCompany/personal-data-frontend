"use client";

import { Icon } from "@iconify/react/dist/iconify.js";
import { getInternationalTransferNotice } from "@/utils/internationalTransferNotice.utils";

interface Props {
  countryCode?: string | null;
}

// Item 5 (Art. 14 ter letra h) — aviso de transferencia internacional.
// Componente compartido por los 3 formularios públicos de cara al titular
// (PublicCollectForm, PublicConsentForm, PublicConsentCampaignForm) para no
// triplicar la lógica. Se renderiza SIEMPRE que el país tenga el aviso
// habilitado — no hay forma de cerrarlo/ocultarlo, y no depende de ningún
// otro estado del formulario (se ve exista o no policyUrl, exista o no
// prefill, etc.). Si el país no tiene aviso configurado, no renderiza nada
// y el formulario sigue funcionando exactamente igual que antes de este
// cambio — ver getInternationalTransferNotice().
export default function InternationalTransferNotice({ countryCode }: Props) {
  const notice = getInternationalTransferNotice(countryCode);
  if (!notice.enabled) return null;

  return (
    <div
      role="note"
      aria-label="Aviso de transferencia internacional de datos"
      className="flex items-start gap-3 rounded-xl border-2 border-blue-200 bg-blue-50 p-4"
    >
      <Icon
        icon="tabler:world"
        className="mt-0.5 shrink-0 text-xl text-blue-700"
      />
      <p className="text-sm leading-relaxed text-blue-900">{notice.text}</p>
    </div>
  );
}
