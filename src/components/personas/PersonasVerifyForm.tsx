"use client";

import Button from "@/components/base/Button";
import PersonasAnimateIn from "@/components/personas/PersonasAnimateIn";
import PersonasFlowStepper from "@/components/personas/PersonasFlowStepper";
import PersonasFormAside from "@/components/personas/PersonasFormAside";
import CustomInput from "@/components/forms/CustomInput";
import { PERSONAS_COUNTRY_CONTENT } from "@/constants/personasCountryContent";
import { personasTheme } from "@/constants/personasTheme";
import { arcoLookup, arcoVerify } from "@/lib/arco.api";
import { usePersonasCountryContent } from "@/hooks/usePersonasCountryContent";
import { usePersonasCountryStore } from "@/store/usePersonasCountryStore";
import { ArcoOtpChannel } from "@/types/arco.types";
import { mapPersonasDocTypeToArco } from "@/utils/arcoDocType.utils";
import {
  getMaskedDestinationFromLookup,
  getMaskedDestinationFromSession,
  getOtpChannelIcon,
} from "@/utils/arcoOtp.utils";
import { showApiErrorToast, showPersonasMessageToast } from "@/components/feedback/ApiErrorToast";
import {
  getPersonasVerification,
  isArcoSessionValid,
  savePersonasVerification,
} from "@/utils/personasSession";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const schema = z.object({
  otpCode: z
    .string()
    .min(6, "El código debe tener 6 dígitos")
    .max(6, "El código debe tener 6 dígitos")
    .regex(/^\d+$/, "Solo números"),
});

type FormValues = z.infer<typeof schema>;

const PersonasVerifyForm = () => {
  const router = useRouter();
  const content = usePersonasCountryContent();
  const setCountry = usePersonasCountryStore((s) => s.setCountry);
  const [docLabel, setDocLabel] = useState("");
  const [maskedDestination, setMaskedDestination] = useState("");
  const [otpChannel, setOtpChannel] = useState<ArcoOtpChannel>("EMAIL");
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { otpCode: "" },
  });

  useEffect(() => {
    const verification = getPersonasVerification();
    if (!verification) {
      router.replace("/personas/ingresar");
      return;
    }
    if (isArcoSessionValid()) {
      router.replace("/personas/portal");
      return;
    }
    if (!verification.sessionId) {
      router.replace("/personas/ingresar");
      return;
    }

    if (verification.country) {
      setCountry(verification.country);
    }

    setOtpChannel(verification.channel ?? "EMAIL");
    setMaskedDestination(getMaskedDestinationFromSession(verification));

    const countryContent =
      PERSONAS_COUNTRY_CONTENT[verification.country] ?? content;
    const docTypeTitle =
      countryContent.docTypeOptions.find((o) => o.value === verification.docType)
        ?.title ?? verification.docType;
    setDocLabel(`${docTypeTitle} · ${verification.docNumber}`);
  }, [router, content, setCountry]);

  async function onSubmit(data: FormValues) {
    const verification = getPersonasVerification();
    if (!verification?.sessionId) {
      router.replace("/personas/ingresar");
      return;
    }

    const res = await arcoVerify({
      sessionId: verification.sessionId,
      code: data.otpCode,
    });

    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
      return;
    }

    if (!res.data?.sessionToken) {
      showPersonasMessageToast("No se pudo completar la verificación", {
        title: "Verificación fallida",
        variant: "default",
      });
      return;
    }

    savePersonasVerification({
      ...verification,
      sessionToken: res.data.sessionToken,
      tokenExpiresAt: res.data.expiresAt,
      verifiedAt: new Date().toISOString(),
    });

    toast.success("Identidad verificada correctamente");
    router.push("/personas/portal");
  }

  async function handleResendCode() {
    const verification = getPersonasVerification();
    if (!verification) {
      router.replace("/personas/ingresar");
      return;
    }

    const channel = verification.channel ?? "EMAIL";

    setResending(true);
    const res = await arcoLookup({
      docType: mapPersonasDocTypeToArco(verification.docType),
      docNumber: verification.docNumber,
      channel,
    });
    setResending(false);

    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
      return;
    }

    if (res.data) {
      const resolvedChannel = res.data.channel ?? channel;
      savePersonasVerification({
        ...verification,
        sessionId: res.data.sessionId,
        channel: resolvedChannel,
        maskedEmail: res.data.maskedEmail,
        maskedPhone: res.data.maskedPhone,
      });
      setOtpChannel(resolvedChannel);
      setMaskedDestination(getMaskedDestinationFromLookup(res.data));
      const channelLabel = resolvedChannel === "SMS" ? "SMS" : "correo";
      toast.success(
        `Nuevo código enviado por ${channelLabel} a ${getMaskedDestinationFromLookup(res.data)}`
      );
    }
  }

  const channelHint =
    otpChannel === "SMS"
      ? "Revisa los mensajes de texto en tu celular."
      : "Revisa tu bandeja de entrada y la carpeta de spam.";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <PersonasAnimateIn delay={80}>
        <PersonasFlowStepper />
      </PersonasAnimateIn>

      <div className="grid gap-8 lg:grid-cols-[1fr_280px] lg:items-start">
        <div>
          <PersonasAnimateIn delay={140}>
            <div className="mb-8">
              <h1
                className={clsx(
                  "text-2xl font-semibold sm:text-3xl",
                  personasTheme.heading
                )}
              >
                Código de verificación
              </h1>
              <p className={clsx("mt-2", personasTheme.body)}>
                {content.flag} {content.label} — {channelHint}
              </p>
              {maskedDestination && (
                <p className={clsx("mt-2 text-sm font-medium text-primary-600")}>
                  Enviado por {otpChannel === "SMS" ? "SMS" : "correo"} a{" "}
                  {maskedDestination}
                </p>
              )}
              {docLabel && (
                <p
                  className={clsx(
                    "mt-4 inline-flex items-center gap-2 text-sm font-medium",
                    personasTheme.infoBox,
                    personasTheme.heading
                  )}
                >
                  <Icon icon="tabler:id" className={personasTheme.icon} />
                  {docLabel}
                </p>
              )}
            </div>
          </PersonasAnimateIn>

          <PersonasAnimateIn delay={200}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className={clsx(personasTheme.card, "p-6 sm:p-8")}
            >
              <div className={clsx(personasTheme.infoBox, "mb-6 flex gap-3")}>
                <Icon
                  icon={getOtpChannelIcon(otpChannel)}
                  className={clsx("text-xl shrink-0", personasTheme.icon)}
                />
                <p className="text-sm text-zinc-600">
                  Ingresa el código de 6 dígitos enviado a{" "}
                  <span className="font-medium text-primary-900">
                    {maskedDestination}
                  </span>
                  . Máximo 5 intentos fallidos.
                </p>
              </div>

              <div className="flex flex-col gap-5">
                <CustomInput
                  type="text"
                  label="Código de verificación"
                  placeholder="000000"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  {...register("otpCode")}
                  error={errors.otpCode}
                />

                <Button
                  type="submit"
                  hierarchy="primary"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  className="w-full rounded-xl! py-3!"
                >
                  Verificar y continuar
                </Button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resending}
                  className={clsx(
                    "text-center text-sm",
                    personasTheme.link,
                    resending && "opacity-50"
                  )}
                >
                  {resending
                    ? "Reenviando..."
                    : `Reenviar código por ${otpChannel === "SMS" ? "SMS" : "correo"}`}
                </button>
              </div>
            </form>
          </PersonasAnimateIn>
        </div>

        <PersonasAnimateIn delay={260}>
          <PersonasFormAside variant="verificar" />
        </PersonasAnimateIn>
      </div>
    </div>
  );
};

export default PersonasVerifyForm;
