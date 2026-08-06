"use client";

import { Icon } from "@iconify/react/dist/iconify.js";
import { GeolocationNotice } from "@/types/collectForm.types";

interface Props {
  notice: GeolocationNotice | null | undefined;
}

// Item E (Fase 1 PRD v2.2, RF-73) — aviso de geolocalización. Mismo patrón
// que InternationalTransferNotice.tsx (mismo formulario público, mismo tipo
// de aviso al titular), pero el texto NO es fijo por país: se arma en el
// backend a partir de los campos reales del Treatment vinculado al
// CollectForm (ver buildGeolocationNotice en el backend) — si no hay
// Treatment vinculado, o el vinculado no trata geolocalización,
// notice.enabled es false y este componente no renderiza nada.
export default function InlineGeoNotice({ notice }: Props) {
  if (!notice?.enabled) return null;

  return (
    <div
      role="note"
      aria-label="Aviso de tratamiento de datos de geolocalización"
      className="flex items-start gap-3 rounded-xl border-2 border-amber-200 bg-amber-50 p-4"
    >
      <Icon
        icon="tabler:map-pin"
        className="mt-0.5 shrink-0 text-xl text-amber-700"
      />
      <div className="text-sm leading-relaxed text-amber-900">
        <p className="font-semibold">
          Este formulario recopila datos de geolocalización.
        </p>
        {notice.purpose && (
          <p className="mt-1">
            <span className="font-medium">Finalidad:</span> {notice.purpose}
          </p>
        )}
        {notice.duration && (
          <p className="mt-1">
            <span className="font-medium">Duración:</span> {notice.duration}
          </p>
        )}
        <p className="mt-1">
          {notice.sharedWithThirdParties ? (
            <>
              <span className="font-medium">Se comunica a terceros:</span>{" "}
              {notice.thirdPartiesIdentity ?? "sí, ver detalle en la política de tratamiento"}
            </>
          ) : (
            <>
              <span className="font-medium">Comunicación a terceros:</span> no se comunica
              a terceros.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
