"use client";

import Button from "@/components/base/Button";
import PersonasAnimateIn from "@/components/personas/PersonasAnimateIn";
import PersonasFlowStepper from "@/components/personas/PersonasFlowStepper";
import PersonasFormAside from "@/components/personas/PersonasFormAside";
import PersonasOtpChannelPicker from "@/components/personas/PersonasOtpChannelPicker";
import CustomInput from "@/components/forms/CustomInput";
import CustomSelect from "@/components/forms/CustomSelect";
import { personasTheme } from "@/constants/personasTheme";
import { arcoLookup } from "@/lib/arco.api";
import { usePersonasCountryContent } from "@/hooks/usePersonasCountryContent";
import { usePersonasCountryStore } from "@/store/usePersonasCountryStore";
import { ArcoOtpChannel } from "@/types/arco.types";
import { PersonasDocTypeId } from "@/types/personas.types";
import { mapPersonasDocTypeToArco } from "@/utils/arcoDocType.utils";
import {
  getMaskedDestinationFromLookup,
  isSmsChannelAvailableForCountry,
} from "@/utils/arcoOtp.utils";
import { showApiErrorToast, showPersonasMessageToast } from "@/components/feedback/ApiErrorToast";
import { savePersonasVerification } from "@/utils/personasSession";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const PersonasDocumentForm = () => {
  const router = useRouter();
  const content = usePersonasCountryContent();
  const country = usePersonasCountryStore((s) => s.country);
  const smsAvailable = isSmsChannelAvailableForCountry(country);
  const [channel, setChannel] = useState<ArcoOtpChannel>("EMAIL");

  const schema = z.object({
    docType: z.string(),
    docNumber: z
      .string()
      .min(1, "Ingresa tu número de documento")
      .regex(/^\d+$/, "Solo se permiten números"),
  });

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      docType: content.defaultDocType,
      docNumber: "",
    },
  });

  useEffect(() => {
    reset({
      docType: content.defaultDocType,
      docNumber: "",
    });
    setChannel("EMAIL");
  }, [country, content.defaultDocType, reset]);

  async function onSubmit(data: FormValues) {
    const res = await arcoLookup({
      docType: mapPersonasDocTypeToArco(data.docType as PersonasDocTypeId),
      docNumber: data.docNumber,
      channel,
    });

    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
      return;
    }

    if (!res.data?.sessionId) {
      showPersonasMessageToast("No se pudo iniciar la verificación", {
        title: "Error al enviar código",
        variant: "default",
      });
      return;
    }

    const resolvedChannel = res.data.channel ?? channel;

    savePersonasVerification({
      country,
      docType: data.docType as PersonasDocTypeId,
      docNumber: data.docNumber,
      sessionId: res.data.sessionId,
      channel: resolvedChannel,
      maskedEmail: res.data.maskedEmail,
      maskedPhone: res.data.maskedPhone,
    });

    const destination = getMaskedDestinationFromLookup(res.data);
    const channelLabel = resolvedChannel === "SMS" ? "SMS" : "correo";
    toast.success(`Código enviado por ${channelLabel} a ${destination}`);
    router.push("/personas/verificar");
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <PersonasAnimateIn delay={40}>
        <p className={clsx("mb-6 text-sm", personasTheme.body)}>
          Registro para{" "}
          <span className="font-semibold text-primary-900">
            {content.flag} {content.label}
          </span>
        </p>
      </PersonasAnimateIn>

      <PersonasAnimateIn delay={100}>
        <PersonasFlowStepper />
      </PersonasAnimateIn>

      <div className="grid gap-8 lg:grid-cols-[1fr_280px] lg:items-start">
        <div>
          <PersonasAnimateIn delay={160}>
            <div className="mb-8">
              <h1
                className={clsx(
                  "text-2xl font-semibold sm:text-3xl",
                  personasTheme.heading
                )}
              >
                Verificación de identidad
              </h1>
              <p
                className={clsx(
                  "mt-2 max-w-md text-sm sm:text-base",
                  personasTheme.body
                )}
              >
                {content.label}: ingresa el documento con el que te registraste y
                elige cómo recibir el código de verificación.
              </p>
            </div>
          </PersonasAnimateIn>

          <PersonasAnimateIn delay={220}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className={clsx(personasTheme.card, "p-6 sm:p-8")}
            >
              <div className="flex flex-col gap-5">
                <CustomSelect
                  label="Tipo de documento"
                  options={content.docTypeOptions}
                  value={watch("docType") as PersonasDocTypeId}
                  onChange={(value) =>
                    setValue("docType", value as PersonasDocTypeId)
                  }
                />

                <CustomInput
                  type="text"
                  inputMode="numeric"
                  label="Número de documento"
                  placeholder={
                    country === "CL"
                      ? "Ej. 12345678 (sin guión)"
                      : "Ej. 1020304050"
                  }
                  {...register("docNumber")}
                  error={errors.docNumber}
                />

                <PersonasOtpChannelPicker
                  value={channel}
                  onChange={setChannel}
                  smsAvailable={smsAvailable}
                />

                {!smsAvailable && (
                  <p className={clsx("text-xs", personasTheme.muted)}>
                    El envío por SMS está disponible para titulares con celular
                    colombiano registrado. En {content.label} usamos correo
                    electrónico.
                  </p>
                )}

                <Button
                  type="submit"
                  hierarchy="primary"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  className="w-full rounded-xl! py-3!"
                  endContent={<Icon icon="tabler:arrow-right" />}
                >
                  Enviar código
                </Button>

                <p className={clsx("text-center text-xs", personasTheme.muted)}>
                  Aplica políticas de {content.label} · {content.legalBadge}
                </p>
              </div>
            </form>
          </PersonasAnimateIn>
        </div>

        <PersonasAnimateIn delay={280}>
          <PersonasFormAside variant="ingresar" />
        </PersonasAnimateIn>
      </div>
    </div>
  );
};

export default PersonasDocumentForm;
