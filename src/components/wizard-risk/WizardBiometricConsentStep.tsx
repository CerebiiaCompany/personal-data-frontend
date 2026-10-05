"use client";

import { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Button from "@/components/base/Button";
import { WizardTreatment } from "@/types/wizardRisk.types";
import { acceptedBiometricConsentTreatments } from "@/utils/wizardBiometricConsent";
import ValidationMessage from "./ValidationMessage";
import WizardStepShell from "./WizardStepShell";
import WizardStickyNav from "./WizardStickyNav";

interface Props {
  treatments: WizardTreatment[];
  isLoading?: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

/**
 * Bloque 5 — paso C-01/D-01: el titular confirma con OTP (medio tecnológico
 * equivalente, Art. 16). No se exige FEA ni firma en papel. Los envíos reales
 * se hacen después de activar el plan, desde cada tratamiento biométrico.
 */
export default function WizardBiometricConsentStep({ treatments, isLoading = false, onPrevious, onNext }: Props) {
  const biometricTreatments = acceptedBiometricConsentTreatments(treatments);
  const applies = biometricTreatments.length > 0;
  const [acknowledged, setAcknowledged] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);

  function handleNext() {
    if (applies && !acknowledged) {
      setShowValidationError(true);
      return;
    }
    setShowValidationError(false);
    onNext();
  }

  return (
    <>
      <WizardStepShell>
        <h2 className="text-xl font-bold tracking-tight text-[#1A2B5B] sm:text-2xl">Consentimiento biométrico</h2>
        <p className="mt-2 text-sm text-[#64748B]">
          La Ley 21.719 (Art. 16) exige consentimiento expreso para datos biométricos. CEREBIIA lo recaba con un
          documento y un código de verificación por correo — un medio tecnológico equivalente. No se requiere Firma
          Electrónica Avanzada ni firma en papel.
        </p>

        {applies ? (
          <>
            <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50/70 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <Icon icon="tabler:fingerprint" className="text-xl" />
                </span>
                <div className="min-w-0 space-y-2">
                  <p className="text-sm font-semibold text-violet-950">
                    {biometricTreatments.length} tratamiento
                    {biometricTreatments.length === 1 ? "" : "s"} requiere
                    {biometricTreatments.length === 1 ? "" : "n"} consentimiento OTP
                  </p>
                  <ul className="space-y-1.5 text-sm text-violet-900/90">
                    {biometricTreatments.map((row) => (
                      <li key={row.id} className="flex items-start gap-2">
                        <Icon icon="tabler:point-filled" className="mt-1 shrink-0 text-[8px]" />
                        <span>{row.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <ol className="mt-5 space-y-3 text-sm text-[#475569]">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EEF3FB] text-xs font-bold text-[#1A2B5B]">
                  1
                </span>
                <span>Al activar el plan, esos tratamientos quedarán en borrador con categoría biométrica.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EEF3FB] text-xs font-bold text-[#1A2B5B]">
                  2
                </span>
                <span>
                  Desde cada ficha enviarás a los titulares un correo con el documento T04/T07 y un código OTP de 6
                  dígitos.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EEF3FB] text-xs font-bold text-[#1A2B5B]">
                  3
                </span>
                <span>
                  Cuando el titular confirma, el PDF queda respaldado con hash SHA-256 en el log de auditoría — evidencia
                  verificable sin costo de firma avanzada.
                </span>
              </li>
            </ol>

            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-[#E4EAF6] bg-[#F8FAFC] p-4">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => {
                  setAcknowledged(e.target.checked);
                  if (e.target.checked) setShowValidationError(false);
                }}
                className="mt-1 h-4 w-4 rounded border-[#CBD5E1]"
              />
              <span className="text-sm text-[#334155]">
                Entiendo que debo enviar el consentimiento OTP a cada titular antes de activar el tratamiento
                biométrico en producción.
              </span>
            </label>
            {showValidationError && (
              <ValidationMessage message="Confirma que entiendes el proceso de consentimiento biométrico para continuar." />
            )}
          </>
        ) : (
          <div className="mt-5 rounded-2xl border border-[#E4EAF6] bg-[#F8FAFC] p-4 text-sm text-[#64748B]">
            Según tus respuestas, no hay tratamientos biométricos en este diagnóstico. Puedes continuar con la
            designación del DPO.
          </div>
        )}
      </WizardStepShell>

      <WizardStickyNav
        onPrevious={onPrevious}
        onNext={handleNext}
        nextLabel={applies ? "Continuar al DPO" : "Siguiente"}
        isLoading={isLoading}
      />
    </>
  );
}
