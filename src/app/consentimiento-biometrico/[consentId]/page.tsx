"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";
import LogoCerebiia from "@public/logo.svg";
import Button from "@/components/base/Button";
import { confirmPublicConsent, getPublicConsentDocumentUrl } from "@/lib/biometricConsent.api";

/**
 * Item D-01/N-02/N-04 — pantalla pública (sin autenticación) a la que llega
 * el titular desde el enlace del correo de solicitud de consentimiento
 * biométrico. Antes de esto, ese enlace apuntaba a una ruta que ya existía
 * para un flujo completamente distinto (aceptación de CollectForm) y le
 * habría mostrado un error — encontrado en auditoría, ver
 * biometricConsentEmail.ts.
 */
export default function BiometricConsentPage() {
  const params = useParams();
  const consentId = params.consentId as string;

  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ confirmedAt: string; documentSha256: string } | null>(null);

  // API_BASE_URL resuelve distinto en servidor (URL absoluta) y en el
  // navegador (proxy same-origin) — calcularlo en el primer render causaría
  // un hydration mismatch en el src/href de abajo. Se difiere a un efecto
  // para que el HTML del servidor y el primer render del cliente coincidan.
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  useEffect(() => {
    setDocumentUrl(getPublicConsentDocumentUrl(consentId));
  }, [consentId]);

  async function handleConfirm() {
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Ingresa el código que recibiste por correo.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const res = await confirmPublicConsent(consentId, trimmed);
    setSubmitting(false);

    if (res.error || !res.data) {
      setError(res.error?.message ?? "No se pudo confirmar el consentimiento.");
      return;
    }
    setResult({ confirmedAt: res.data.confirmedAt, documentSha256: res.data.documentSha256 });
  }

  return (
    <div className="flex flex-1 flex-col gap-8">
      <header className="flex h-16 w-full items-center justify-between rounded-b-xl border border-stone-100 bg-primary-50 p-3 shadow-md">
        <Image src={LogoCerebiia} width={200} alt="Logo de Plataforma de Datos de Cerebiia" priority className="h-full w-auto" />
      </header>

      <div className="flex justify-center px-4 pb-10">
        <div className="w-full max-w-2xl">
          {result ? (
            <div className="flex flex-col items-center gap-5 rounded-2xl border border-emerald-100 bg-white px-6 py-10 text-center shadow-md">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Icon icon="tabler:circle-check" className="text-4xl text-green-600" />
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold text-[#0B1737]">¡Consentimiento confirmado!</h2>
                <p className="text-sm leading-relaxed text-[#64748B]">
                  Te enviamos por correo una copia del documento firmado — consérvala, es la
                  evidencia de tu autorización.
                </p>
                <p className="mt-2 font-mono text-xs text-[#64748B]">
                  Evidencia SHA-256: {result.documentSha256}
                </p>
              </div>
              <p className="text-xs text-[#94A3B8]">Ya puedes cerrar esta ventana.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5 rounded-2xl border border-stone-100 bg-white p-5 shadow-md sm:p-8">
              <div>
                <h1 className="text-lg font-bold text-[#0B1737] sm:text-xl">
                  Confirma tu consentimiento biométrico
                </h1>
                <p className="mt-1 text-sm text-[#64748B]">
                  Revisa el documento y luego ingresa el código de verificación que recibiste por
                  correo (Art. 16, Ley 21.719).
                </p>
              </div>

              <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
                {documentUrl && (
                  <iframe src={documentUrl} title="Documento de consentimiento" className="h-[420px] w-full" />
                )}
              </div>
              {documentUrl && (
                <a
                  href={documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-primary-700 hover:underline"
                >
                  <Icon icon="tabler:external-link" />
                  Abrir el documento en una pestaña nueva
                </a>
              )}

              <div className="flex flex-col gap-2">
                <label htmlFor="otpCode" className="text-sm font-medium text-[#1A2B5B]">
                  Código de verificación
                </label>
                <input
                  id="otpCode"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  inputMode="numeric"
                  maxLength={8}
                  className="w-full rounded-xl border border-[#D8E0EF] bg-[#F8FAFC] px-4 py-3 text-center text-2xl font-bold tracking-[0.3em] text-primary-900 outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/15"
                />
              </div>

              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              <Button onClick={handleConfirm} loading={submitting} className="w-full">
                Confirmar consentimiento
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
