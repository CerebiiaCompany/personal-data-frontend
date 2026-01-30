import { AnswerType, CollectForm } from "@/types/collectForm.types";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { FieldError, useForm } from "react-hook-form";
import * as z from "zod";
import Button from "../base/Button";
import RenderQuestionInput from "../forms/RenderQuestionInput";
import CustomCheckbox from "../forms/CustomCheckbox";
import { toast } from "sonner";
import { parseApiError } from "@/utils/parseApiError";
import {
  CollectFormResponseUser,
  CreateCollectFormResponse,
  UserGender,
  userGendersOptions,
} from "@/types/collectFormResponse.types";
import { DocType, docTypesOptions } from "@/types/user.types";
import { CustomSelectOption } from "@/types/forms.types";
import CustomInput from "../forms/CustomInput";
import CustomSelect from "../forms/CustomSelect";
import { registerCollectFormResponse } from "@/lib/collectFormResponse.api";
import CollectFormResponseSavedModal from "./CollectFormResponseSavedModal";
import { showDialog } from "@/utils/dialogs.utils";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { Icon } from "@iconify/react/dist/iconify.js";
import { generateOtpCode, validateOtpCode, resendOtpCodeByEmail } from "@/lib/oneTimeCode.api";
import { getPolicyTemplateFileUrl } from "@/lib/policyTemplate.api";
import LoadingCover from "../layout/LoadingCover";
import { CampaignDeliveryChannel } from "@/types/campaign.types";
import { useCompanyCreditsPricing } from "@/hooks/useCompanyCreditsPricing";

interface Props {
  data: CollectForm;
  initialValues?: { [key: string]: any };
}

// Opciones de códigos telefónicos de países
type PhoneCountryCode = "57" | "58" | "1" | "52" | "51" | "56" | "54" | "55" | "593" | "507";

const phoneCountryCodeOptions: CustomSelectOption<PhoneCountryCode>[] = [
  { value: "57", title: "+57" },
  { value: "58", title: "+58" },
  { value: "1", title: "+1" },
  { value: "52", title: "+52" },
  { value: "51", title: "+51" },
  { value: "56", title: "+56" },
  { value: "54", title: "+54" },
  { value: "55", title: "+55" },
  { value: "593", title: "+593" },
  { value: "507", title: "+507" },
];

const PublicCollectForm = ({ data, initialValues }: Props) => {
  const [pendingOtpId, setPendingOtpId] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>("");
  const [policyUrl, setPolicyUrl] = useState<string | null>(null);
  const [formKey, setFormKey] = useState<number>(0); // Para forzar el reseteo del formulario
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Estado de loading para el botón
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false); // Estado de loading para envío de OTP
  const [otpChannel, setOtpChannel] = useState<CampaignDeliveryChannel>("SMS");
  const [otpLastSentChannel, setOtpLastSentChannel] =
    useState<CampaignDeliveryChannel | null>(null);
  const otpPricing = useCompanyCreditsPricing();
  const fields: {
    [key: string]: {
      type: AnswerType;
      default: any;
    };
  } = {};

  data.questions.forEach(
    (question) =>
      (fields[question.title] = {
        type: question.answerType,
        default: question.answerType === "TEXT" ? "" : new Date(),
      })
  );

  // Build a dynamic Zod schema based on the inferred `fields`

  type FieldConfig = { type: AnswerType; default: any };

  function buildSchemaFromFields(fields: Record<string, FieldConfig>) {
    const shape: Record<string, z.ZodTypeAny> = {};

    for (const [key, cfg] of Object.entries(fields)) {
      switch (cfg.type) {
        case "TEXT":
          shape[key] = z.string().min(1, "Campo requerido");
          break;
        /* case "NUMBER":
          shape[key] = z.preprocess(
            (v) =>
              v === "" || v === null || v === undefined ? undefined : Number(v),
            z.number({ invalid_type_error: "Debe ser un número" })
          );
          break;
        case "BOOLEAN":
          shape[key] = z.boolean();
          break; */
        case "DATE":
          shape[key] = z.preprocess((v) => {
            if (typeof v === "string") {
              const parts = v.split("-").map(Number);

              if (
                parts.length === 3 &&
                !isNaN(parts[0]) &&
                !isNaN(parts[1]) &&
                !isNaN(parts[2])
              ) {
                const date = new Date(
                  Date.UTC(parts[0], parts[1] - 1, parts[2])
                );
                if (
                  date.getUTCFullYear() === parts[0] &&
                  date.getUTCMonth() === parts[1] - 1 &&
                  date.getUTCDate() === parts[2]
                ) {
                  return date;
                }
              }

              return null; // Return null to trigger an invalid_type_error
            }
          }, z.date({ error: "Fecha inválida" }));
          break;
        default:
          shape[key] = z.any();
          break;
      }
    }

    return z.object(shape);
  }

  // Memoize schema and default values from `fields`
  const schema = React.useMemo(() => buildSchemaFromFields(fields), [data]);

  const validationSchema = z.object({
    data: schema,
    user: z.object({
      docType: z.string<DocType>(),
      docNumber: z.preprocess(
        (v) => (v === "" ? undefined : v),
        z.coerce.number("Número de documento inválido")
      ),
      name: z.string().min(1, "Este campo es obligatorio"),
      lastName: z.string().min(1, "Este campo es obligatorio"),
      age: z.preprocess(
        (v) => (v === "" ? undefined : v),
        z.coerce.number("Este campo es obligatorio").int("Edad inválida")
      ),
      gender: z.string<UserGender>(),
      email: z.email("Correo inválido").min(1, "Este campo es obligatorio"),
      phone: z.preprocess(
        (v: string) =>
          typeof v === "string" ? v.replace(/[^\d]/g, "") : (v as string),
        z
          .string()
          .regex(/^\d{10}$/, "Ingresa 10 dígitos (solo números)")
      ),
      phoneCountryCode: z.string().min(1, "Código de país requerido"),
    }),
    dataProcessing: z.boolean().refine((val) => val === true, {
      error: "Debes aceptar el tratamiento de datos",
    }),
    otpCode: z.string().min(1, "El código OTP es obligatorio"),
    otpCodeId: z.string().optional(), // Se validará en el submit
  });

  const dynamicDefaultValues = React.useMemo(() => {
    return Object.fromEntries(
      Object.entries(fields).map(([k, v]) => [k, v.default])
    );
  }, [data]);

  // Extraer código de país del teléfono si existe en initialValues
  const getInitialPhoneData = React.useMemo(() => {
    if (initialValues?.user?.phone) {
      const phone = initialValues.user.phone as string;
      // Buscar si el teléfono comienza con algún código de país conocido
      for (const code of phoneCountryCodeOptions) {
        if (phone.startsWith(code.value)) {
          return {
            phone: phone.substring(code.value.length),
            phoneCountryCode: code.value,
          };
        }
      }
      // Si no se encuentra código, asumir que ya está en formato sin código y usar 57 por defecto
      return {
        phone: phone.length > 10 ? phone.substring(phone.length - 10) : phone,
        phoneCountryCode: "57",
      };
    }
    return { phone: "", phoneCountryCode: "57" };
  }, [initialValues]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      data:
        (initialValues?.data as typeof dynamicDefaultValues) ||
        dynamicDefaultValues,
      dataProcessing: initialValues ? true : false,
      user: initialValues?.user
        ? {
            ...(initialValues.user as CollectFormResponseUser),
            phone: getInitialPhoneData.phone,
            phoneCountryCode: getInitialPhoneData.phoneCountryCode,
          }
        : {
            docType: "CC",
            phoneCountryCode: "57",
          },
      otpCode: "",
      otpCodeId: "",
    },
  });

  // Función para limpiar el formulario
  const resetForm = () => {
    // Incrementar la clave para forzar el reseteo del formulario
    setFormKey(prev => prev + 1);
    // Restablecer el estado del formulario
    reset({
      data: dynamicDefaultValues,
      dataProcessing: false,
      user: {
        docType: "CC" as DocType,
        docNumber: undefined,
        phoneCountryCode: "57",
        phone: "",
        name: "",
        lastName: "",
        age: undefined,
        email: "",
        gender: undefined as UserGender | undefined,
      },
      otpCode: "",
      otpCodeId: "",
    });
    // Resetear estados de OTP
    setPendingOtpId(null);
    setIsSendingOtp(false);
    setOtpChannel("SMS");
    setOtpLastSentChannel(null);
  };

  async function onSubmit(formData: any) {
    // Prevenir múltiples envíos
    if (isSubmitting) return;
    
    // Validar que se haya enviado el OTP
    if (!pendingOtpId) {
      toast.error("Por favor, envía el código OTP primero");
      return;
    }

    // Validar que se haya ingresado el código OTP
    if (!formData.otpCode || formData.otpCode.trim() === "") {
      toast.error("Por favor, ingresa el código OTP recibido");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Concatenar código de país con el número de teléfono
      const phoneCountryCode = watch("user.phoneCountryCode") || "57";
      const fullPhoneNumber = `${phoneCountryCode}${formData.user.phone}`;

      // Validar el código OTP (ahora es obligatorio)
      const otpValidation = await validateOtpCode(pendingOtpId, formData.otpCode);

      if (otpValidation.error) {
        console.log(otpValidation.error);
        toast.error(parseApiError(otpValidation.error));
        setIsSubmitting(false);
        return;
      }

      toast.success("Código OTP validado");

      // Registrar respuesta con OTP validado
      const res = await registerCollectFormResponse(data._id, {
        ...formData,
        user: {
          ...formData.user,
          phone: fullPhoneNumber,
        },
        otpCode: formData.otpCode,
        otpCodeId: otpValidation.data.id,
      });

      if (res.error) {
        toast.error(parseApiError(res.error));
        setIsSubmitting(false);
        return;
      }

      toast.success("Respuesta registrada");
      setFullName(`${formData.user.name} ${formData.user.lastName}`);
      // No hacemos reset aquí, lo manejamos desde el modal
      showDialog(HTML_IDS_DATA.collectFormResponseSavedModal);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error al enviar formulario:", error);
      toast.error("Ocurrió un error al enviar el formulario. Por favor, intenta nuevamente.");
      setIsSubmitting(false);
    }
  }

  const formatPricing = (value?: number) => {
    if (typeof value !== "number" || Number.isNaN(value)) return "—";
    // Importante: en es-CO el separador decimal es ",".
    // Evitamos `toFixed` (que usa ".") porque visualmente parece miles (ej: 10.000).
    return new Intl.NumberFormat("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  async function createOtpCode(channel: CampaignDeliveryChannel) {
    const phone = watch("user.phone");
    const phoneCountryCode = watch("user.phoneCountryCode") || "57";
    const email = watch("user.email");
    
    setIsSendingOtp(true);

    try {
      if (channel === "SMS") {
        // Validar que el teléfono esté ingresado
        if (!phone || phone.trim() === "") {
          toast.error("Por favor ingresa tu número de teléfono primero");
          setIsSendingOtp(false);
          return;
        }

        // Concatenar código de país con el número
        const fullPhoneNumber = `${phoneCountryCode}${phone}`;

        const res = await generateOtpCode({
          collectFormId: data._id,
          recipientData: {
            address: fullPhoneNumber,
            channel: "SMS",
          },
        });

        if (res.error) {
          if (res.error.code === "otp/pending-code") {
            //? server returns otp id in the data
            const otpId = res.data.id;
            setPendingOtpId(otpId);
            setValue("otpCodeId", otpId);
            setOtpLastSentChannel("SMS");
            toast.info("Ya hay un código OTP pendiente. Por favor ingrésalo.");
            setIsSendingOtp(false);
            return;
          }
          toast.error(parseApiError(res.error));
          setIsSendingOtp(false);
          return;
        }

        const otpId = res.data.id;
        setPendingOtpId(otpId);
        setValue("otpCodeId", otpId);
        setOtpLastSentChannel("SMS");
        toast.success("Código enviado por SMS");
      } else {
        // Enviar por EMAIL (generando OTP o reenviando si ya existe uno pendiente)
        if (!email || email.trim() === "") {
          toast.error("Por favor ingresa tu correo electrónico primero");
          setIsSendingOtp(false);
          return;
        }

        // Si ya hay OTP pendiente, reenviar por email
        if (pendingOtpId) {
          const resend = await resendOtpCodeByEmail(pendingOtpId, email);
          if (resend.error) {
            toast.error(parseApiError(resend.error));
            setIsSendingOtp(false);
            return;
          }
          setOtpLastSentChannel("EMAIL");
          toast.success("Código enviado por correo electrónico");
          setIsSendingOtp(false);
          return;
        }

        // Si no hay OTP pendiente, generar uno nuevo por email
        const res = await generateOtpCode({
          collectFormId: data._id,
          recipientData: {
            address: email,
            channel: "EMAIL",
          },
        });

        if (res.error) {
          if (res.error.code === "otp/pending-code") {
            const otpId = res.data.id;
            setPendingOtpId(otpId);
            setValue("otpCodeId", otpId);
            // Con OTP pendiente, podemos reenviar por email explícitamente
            const resend = await resendOtpCodeByEmail(otpId, email);
            if (resend.error) {
              toast.error(parseApiError(resend.error));
              setIsSendingOtp(false);
              return;
            }
            setOtpLastSentChannel("EMAIL");
            toast.success("Código enviado por correo electrónico");
            setIsSendingOtp(false);
            return;
          }
          toast.error(parseApiError(res.error));
          setIsSendingOtp(false);
          return;
        }

        const otpId = res.data.id;
        setPendingOtpId(otpId);
        setValue("otpCodeId", otpId);
        setOtpLastSentChannel("EMAIL");
        toast.success("Código enviado por correo electrónico");
      }
    } catch (error) {
      console.error("Error al enviar OTP:", error);
      toast.error("Ocurrió un error al enviar el código. Por favor, intenta nuevamente.");
    } finally {
      setIsSendingOtp(false);
    }
  }

  useEffect(() => {
    // Obtener la URL del archivo de la plantilla de política usando el nuevo endpoint
    const fetchPolicyUrl = async () => {
      if (!data?.policyTemplateId || !data?.companyId) {
        console.warn("El formulario no tiene una plantilla de política asignada", {
          hasPolicyTemplateId: !!data?.policyTemplateId,
          hasCompanyId: !!data?.companyId,
        });
        return;
      }

      try {
        const res = await getPolicyTemplateFileUrl(
          data.companyId,
          data.policyTemplateId
        );

        if (res.error) {
          console.error("Error al obtener URL de la política:", res.error);
          toast.error(parseApiError(res.error));
          return;
        }

        if (!res.data?.url) {
          console.error("No se recibió URL en la respuesta:", res);
          toast.error("Error al obtener la URL del archivo");
          return;
        }

        setPolicyUrl(res.data.url);
      } catch (error) {
        console.error("Error al obtener URL de la política:", error);
        toast.error("Error al obtener la URL del archivo");
      }
    };

    if (data) {
      fetchPolicyUrl();
    }
  }, [data]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 max-w-2xl items-stretch w-full"
    >
      <CollectFormResponseSavedModal 
        fullName={fullName} 
        onNewRegistration={resetForm}
      />
      <h1 className="font-bold text-2xl text-primary-900">{data.name}</h1>

      <div className="rounded-xl border border-disabled p-10 flex flex-col items-stretch gap-5">
        <div className="flex gap-5">
          <CustomInput
            label="Nombres"
            {...register("user.name")}
            placeholder="Ej. Jhon"
            error={errors.user?.name}
          />
          <CustomInput
            label="Apellidos"
            {...register("user.lastName")}
            placeholder="Ej. Doe"
            error={errors.user?.lastName}
          />
        </div>
        <div className="flex gap-5">
          <div>
            <CustomSelect
              label="Tipo de documento"
              options={docTypesOptions}
              value={watch("user.docType")}
              onChange={(value) => setValue("user.docType", value)}
            />
          </div>
          <CustomInput
            label="Número de documento"
            {...register("user.docNumber")}
            error={errors.user?.docNumber as FieldError}
          />
        </div>

        <div className="flex gap-5">
          <CustomSelect
            label="Género"
            options={userGendersOptions}
            value={watch("user.gender")}
            onChange={(value) => setValue("user.gender", value)}
          />
          <CustomInput
            type="number"
            label="Edad"
            {...register("user.age")}
            error={errors.user?.age as FieldError}
          />
        </div>
        <div className="flex gap-5">
          <CustomInput
            label="Correo"
            type="email"
            placeholder="Ej. alguien@ejemplo.com"
            {...register("user.email")}
            error={errors.user?.email}
          />
          <div className="flex gap-2 flex-1">
            <div className="w-32 flex-shrink-0">
              <CustomSelect<PhoneCountryCode>
                label="Código"
                value={(watch("user.phoneCountryCode") || "57") as PhoneCountryCode}
                onChange={(value) => setValue("user.phoneCountryCode", value)}
                options={phoneCountryCodeOptions}
                unselectedText="Código"
              />
            </div>
            <div className="flex-1 min-w-0">
              <CustomInput
                label="Teléfono"
                {...register("user.phone")}
                placeholder="Ej. 7316939392"
                error={errors.user?.phone as FieldError}
              />
            </div>
          </div>
        </div>
      </div>

      {data.questions.length ? (
        <div className="rounded-xl border border-disabled p-10 flex flex-col items-stretch gap-5">
          {data.questions.map((question) => (
            <RenderQuestionInput
              key={question._id}
              {...register(`data.${question.title}`)}
              question={question}
              defaultValue={watch(`data.${question.title}`) as any}
              error={errors.data && (errors.data[question.title] as FieldError)}
            />
          ))}
        </div>
      ) : null}

      <div className="rounded-xl border border-disabled p-10 flex flex-col items-stretch gap-5">
        {/* Instrucciones para el cajero */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-2">
          <div className="flex items-start gap-3">
            <Icon 
              icon={"material-symbols:info-outline"} 
              className="text-2xl text-blue-600 flex-shrink-0 mt-0.5" 
            />
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold text-blue-900 text-base">
                Verificación por código OTP
              </h3>
              <p className="text-sm text-blue-800 leading-relaxed">
                Para continuar, debes enviar un código de verificación obligatorio. Elige el método de envío
                (SMS o correo electrónico), envía el código y luego ingrésalo en el campo correspondiente.
              </p>
            </div>
          </div>
        </div>

        {/* Método + Campo de código OTP + botón de envío */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="w-full sm:max-w-[260px]">
              <CustomSelect
                label="Método de envío *"
                options={[
                  { value: "SMS", title: "SMS", icon: "mdi:message-text-outline" },
                  { value: "EMAIL", title: "Correo", icon: "material-symbols:email-outline" },
                ]}
                value={otpChannel}
                onChange={(value) => setOtpChannel(value as CampaignDeliveryChannel)}
              />
            </div>
            <div className="flex-1 text-xs sm:text-sm text-stone-600 flex flex-col gap-1">
              <div>
                {otpChannel === "SMS"
                  ? "Se enviará un código al teléfono ingresado."
                  : "Se enviará un código al correo ingresado."}
              </div>

              {otpPricing.loading && (
                <div className="relative w-20 h-4">
                  <LoadingCover size="sm" />
                </div>
              )}

              {!otpPricing.loading && otpPricing.data && (
                <div className="text-xs text-stone-600">
                  <span className={otpChannel === "SMS" ? "font-semibold text-primary-900" : ""}>
                    SMS: COP {formatPricing(otpPricing.data.smsPricePerMessage)} / mensaje
                  </span>
                  <span className="mx-2 text-stone-400">·</span>
                  <span className={otpChannel === "EMAIL" ? "font-semibold text-primary-900" : ""}>
                    Correo: COP {formatPricing(otpPricing.data.emailPricePerMessage)} / mensaje
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <CustomInput
                label="Código de verificación (OTP) *"
                {...register("otpCode")}
                error={errors.otpCode}
                placeholder="XXX-XXX"
                disabled={!pendingOtpId}
              />
            </div>
            <Button
              type="button"
              onClick={() => createOtpCode(otpChannel)}
              className="h-fit min-w-[180px]"
              hierarchy="primary"
              loading={isSendingOtp}
              disabled={isSendingOtp}
              startContent={
                otpChannel === "SMS" ? (
                  <Icon icon={"tabler:send"} className="text-xl" />
                ) : (
                  <Icon icon={"material-symbols:email"} className="text-xl" />
                )
              }
            >
              {otpChannel === "SMS" ? "Enviar por SMS" : "Enviar por correo"}
            </Button>
          </div>

          {pendingOtpId && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
              <Icon icon={"material-symbols:check-circle"} className="text-lg" />
              <span className="font-medium">
                {otpLastSentChannel === "EMAIL"
                  ? "Código enviado por correo electrónico. Revisa tu bandeja de entrada y spam."
                  : otpLastSentChannel === "SMS"
                    ? "Código enviado por SMS. Verifica tu teléfono."
                    : "Código OTP generado. Ingresa el código recibido."}
              </span>
            </div>
          )}

          {/* Mensaje inicial si no se ha enviado OTP */}
          {!pendingOtpId && (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3">
              <Icon icon={"material-symbols:info-outline"} className="text-lg" />
              <span className="font-medium">
                Para continuar, primero debes enviar el código OTP (SMS o correo).
              </span>
            </div>
          )}
        </div>
        {policyUrl ? (
          <CustomCheckbox
            {...register("dataProcessing")}
            label={
              <p>
                Acepto la{" "}
                <a 
                  target="_blank" 
                  rel="noopener noreferrer"
                  href={policyUrl} 
                  className="underline text-primary-600 hover:text-primary-800 transition-colors font-medium"
                >
                  política de tratamiento de datos personales.
                </a>
              </p>
            }
            error={errors.dataProcessing as FieldError}
          />
        ) : data.policyTemplateFile ? (
          <div className="w-10 h-10 relative">
            <LoadingCover size="sm" />
          </div>
        ) : (
          <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3">
            <p className="font-medium">
              No hay política de tratamiento de datos disponible para este formulario.
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-8 justify-center">
        <Button 
          className="w-full max-w-lg" 
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting || !pendingOtpId || !watch("otpCode") || watch("otpCode")?.trim() === ""}
        >
          {isSubmitting ? "Enviando..." : "Enviar"}
        </Button>
      </div>
      
      {/* Mensaje informativo si falta el código OTP */}
      {(!pendingOtpId || !watch("otpCode") || watch("otpCode")?.trim() === "") && (
        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3 mt-4">
          <Icon icon={"material-symbols:warning-outline"} className="text-lg" />
          <span className="font-medium">
            {!pendingOtpId 
              ? "Debes enviar el código OTP primero para poder enviar el formulario."
              : "Debes ingresar el código OTP recibido para poder enviar el formulario."}
          </span>
        </div>
      )}
    </form>
  );
};

export default PublicCollectForm;
