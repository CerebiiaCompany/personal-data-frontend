"use client";

import {
  brandColorForTextOnWhite,
  readableTextColorOn,
} from "@/utils/emailBrandingColors";

interface Props {
  primaryColor: string;
  headerStyle: "LIGHT" | "SOLID";
  titleColor: string | null;
  logoUrl?: string | null;
  companyName: string;
}

/**
 * Vista previa del encabezado/cuerpo de los correos con la marca elegida.
 * Reproduce la plantilla real (consentCampaignEmail.ts del backend).
 */
export default function EmailBrandingPreview({
  primaryColor,
  headerStyle,
  titleColor,
  logoUrl,
  companyName,
}: Props) {
  const isSolid = headerStyle === "SOLID";
  const onAccent = readableTextColorOn(primaryColor);
  const accentText = brandColorForTextOnWhite(primaryColor);
  const title = titleColor ?? (isSolid ? onAccent : "#0f172a");
  const kicker = isSolid ? onAccent : accentText;

  return (
    <div className="rounded-xl bg-[#f1f5f9] p-4 sm:p-5">
      <div className="mx-auto max-w-[460px] overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-sm">
        {!isSolid && <div className="h-1.5" style={{ backgroundColor: primaryColor }} />}
        <div
          className="px-7 pb-2 pt-7"
          style={isSolid ? { backgroundColor: primaryColor, paddingBottom: 24 } : undefined}
        >
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="mb-5 h-8 w-auto max-w-[140px] object-contain" />
          )}
          <p
            className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em]"
            style={{ color: kicker, opacity: isSolid ? 0.85 : 1 }}
          >
            Mensaje de {companyName}
          </p>
          <p className="text-xl font-extrabold leading-tight tracking-tight" style={{ color: title }}>
            ¡Nuevos productos esta semana!
          </p>
        </div>
        <div className="px-7 pb-5 pt-4">
          <p className="text-[13px] leading-relaxed text-[#334155]">
            Hola, te contamos las novedades de este mes. Así se verá el texto principal de tus
            campañas.
          </p>
          <span
            className="mt-4 inline-block rounded-lg px-5 py-2.5 text-[13px] font-bold"
            style={{ backgroundColor: primaryColor, color: onAccent }}
          >
            Ver más →
          </span>
          <div className="mt-5 border-t border-[#eef2f7] pt-3 text-[10px] leading-relaxed text-[#94a3b8]">
            <strong className="text-[#64748b]">{companyName}</strong> · Mensaje automático, por favor
            no respondas a este correo.
          </div>
        </div>
      </div>
    </div>
  );
}
