import { AnswerType, CollectForm } from "@/types/collectForm.types";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useRef, useState } from "react";
import { FieldError, useForm } from "react-hook-form";
import * as z from "zod";
import Button from "../base/Button";
import RenderQuestionInput from "../forms/RenderQuestionInput";
import CustomCheckbox from "../forms/CustomCheckbox";
import { toast } from "sonner";
import { parseApiError } from "@/utils/parseApiError";
import {
  CollectFormResponseUser,
  PersonKind,
  personKindOptions,
  UserGender,
  userGendersOptions,
} from "@/types/collectFormResponse.types";
import {
  buildCollectFormUserPayload,
  parseNitDocNumber,
} from "@/utils/collectFormUser.utils";
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
import { getPublicCollectFormPolicyUrl } from "@/lib/collectForm.api";
import LoadingCover from "../layout/LoadingCover";
import { CampaignDeliveryChannel } from "@/types/campaign.types";
import { useCompanyCreditsPricing } from "@/hooks/useCompanyCreditsPricing";
import { checkActiveSession } from "@/lib/auth.api";
import ReauthSessionModal from "../dialogs/ReauthSessionModal";

interface Props {
  data: CollectForm;
  initialValues?: { [key: string]: any };
}

// Genera una clave de idempotencia única para cada intento de registro.
// Se usa para que, ante reintentos por red lenta/inestable, el backend pueda
// deduplicar y no crear respuestas duplicadas.
function generateIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random()
    .toString(36)
    .slice(2)}`;
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
  const [personKind, setPersonKind] = useState<PersonKind>("NATURAL");
  const [pendingOtpId, setPendingOtpId] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>("");
  const [policyUrl, setPolicyUrl] = useState<string | null>(null);
  const [formKey, setFormKey] = useState<number>(0); // Para forzar el reseteo del formulario
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Estado de loading para el botón
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false); // Estado de loading para envío de OTP
  const [otpChannel, setOtpChannel] = useState<CampaignDeliveryChannel>("SMS");
  const [otpLastSentChannel, setOtpLastSentChannel] =
    useState<CampaignDeliveryChannel | null>(null);
  const [showReauthModal, setShowReauthModal] = useState(false);
  // Clave de idempotencia estable durante todo el ciclo de vida del registro
  // actual. Se mantiene igual entre reintentos (automáticos o manuales) para que
  // el backend deduplique, y se renueva solo al iniciar un nuevo registro.
  const idempotencyKeyRef = useRef<string>(generateIdempotencyKey());
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

  const naturalDocNumber = z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.coerce.number("Número de documento inválido")
  );

  const juridicaDocNumber = z.preprocess((v) => {
    if (v === "" || v === undefined || v === null) return undefined;
    const parsed = parseNitDocNumber(String(v));
    return Number.isNaN(parsed) ? undefined : parsed;
  }, z.number("Número de NIT inválido"));

  const sharedUserFields = {
    email: z.email("Correo inválido").min(1, "Este campo es obligatorio"),
    phone: z.preprocess(
      (v: string) =>
        typeof v === "string" ? v.replace(/[^\d]/g, "") : (v as string),
      z.string().regex(/^\d{10}$/, "Ingresa 10 dígitos (solo números)")
    ),
    phoneCountryCode: z.string().min(1, "Código de país requerido"),
  };

  const validationSchema = React.useMemo(() => {
    const userSchema =
      personKind === "JURIDICA"
        ? z.object({
            ...sharedUserFields,
            docNumber: juridicaDocNumber,
            docType: z.literal("NIT"),
            razonSocial: z.string().min(1, "Este campo es obligatorio"),
            name: z.string().min(1, "Este campo es obligatorio"),
            lastName: z.string().min(1, "Este campo es obligatorio"),
            age: z.any().optional(),
            gender: z.any().optional(),
          })
        : z.object({
            ...sharedUserFields,
            docNumber: naturalDocNumber,
            docType: z.enum(["CC", "TI", "OTHER"]),
            name: z.string().min(1, "Este campo es obligatorio"),
            lastName: z.string().min(1, "Este campo es obligatorio"),
            age: z.preprocess(
              (v) => (v === "" ? undefined : v),
              z.coerce.number("Este campo es obligatorio").int("Edad inválida")
            ),
            gender: z.string<UserGender>(),
            razonSocial: z.string().optional(),
          });

    return z.object({
      data: schema,
      user: userSchema,
      dataProcessing: z.boolean().refine((val) => val === true, {
        error: "Debes aceptar el tratamiento de datos",
      }),
      otpCode: z.string().min(1, "El código OTP es obligatorio"),
      otpCodeId: z.string().optional(),
    });
  }, [personKind, schema]);

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

  const resolver = React.useMemo(
    () => zodResolver(validationSchema),
    [validationSchema]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver,
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
            razonSocial: "",
          },
      otpCode: "",
      otpCodeId: "",
    },
  });

  const handlePersonKindChange = (kind: PersonKind) => {
    setPersonKind(kind);
    setPendingOtpId(null);
    setOtpLastSentChannel(null);
    setValue("otpCode", "");
    setValue("otpCodeId", "");

    if (kind === "JURIDICA") {
      setValue("user.docType", "NIT" as unknown as DocType);
      setValue("user.age", undefined as unknown as number);
      setValue("user.gender", undefined as UserGender | undefined);
    } else {
      setValue("user.docType", "CC");
      setValue("user.razonSocial", "");
    }
  };

  // Función para limpiar el formulario
  const resetForm = () => {
    setPersonKind("NATURAL");
    setFormKey((prev) => prev + 1);
    // Nuevo registro => nueva clave de idempotencia.
    idempotencyKeyRef.current = generateIdempotencyKey();
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
        razonSocial: "",
      },
      otpCode: "",
      otpCodeId: "",
    });
    setPendingOtpId(null);
    setIsSendingOtp(false);
    setOtpChannel("SMS");
    setOtpLastSentChannel(null);
  };

  async function ensureActiveSession() {
    const sessionCheck = await checkActiveSession();
    if (sessionCheck.error) {
      setShowReauthModal(true);
      toast.error("Tu sesion expiro, inicia sesion de nuevo");
      return false;
    }
    return true;
  }

  async function onSubmit(formData: any) {
    // Prevenir múltiples envíos
    if (isSubmitting) return;

    // Validaciones síncronas (baratas) ANTES de marcar loading, para no mostrar
    // "Enviando..." si falta el OTP.
    if (!pendingOtpId) {
      toast.error("Por favor, envía el código OTP primero");
      return;
    }
    if (!formData.otpCode || formData.otpCode.trim() === "") {
      toast.error("Por favor, ingresa el código OTP recibido");
      return;
    }

    // Activar loading de inmediato: la verificación de sesión es una llamada de
    // red (hasta 20s en conexiones lentas) y antes se ejecutaba ANTES de poner
    // el botón en "Enviando...", lo que hacía parecer que el clic no respondía.
    setIsSubmitting(true);

    const hasSession = await ensureActiveSession();
    if (!hasSession) {
      setIsSubmitting(false);
      return;
    }

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

      const otpRecipientChannel = otpLastSentChannel ?? otpChannel;
      const otpRecipientAddress =
        otpRecipientChannel === "SMS"
          ? fullPhoneNumber
          : (formData.user.email as string);

      const userPayload = buildCollectFormUserPayload(formData.user, personKind);

      const res = await registerCollectFormResponse(
        data._id,
        {
          data: formData.data,
          dataProcessing: formData.dataProcessing,
          user: userPayload,
          otpCode: formData.otpCode,
          otpCodeId: otpValidation.data.id,
          recipientData: {
            channel: otpRecipientChannel,
            address: otpRecipientAddress,
          },
        },
        idempotencyKeyRef.current
      );

      if (res.error) {
        toast.error(parseApiError(res.error));
        setIsSubmitting(false);
        return;
      }

      toast.success("Respuesta registrada");
      setFullName(
        personKind === "JURIDICA"
          ? `${formData.user.razonSocial} (${formData.user.name} ${formData.user.lastName})`
          : `${formData.user.name} ${formData.user.lastName}`
      );
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
    // Evitar doble envío si ya hay uno en curso.
    if (isSendingOtp) return;

    const phone = watch("user.phone");
    const phoneCountryCode = watch("user.phoneCountryCode") || "57";
    const email = watch("user.email");

    // Validaciones síncronas (baratas) ANTES de marcar loading, para no mostrar
    // el botón "Enviando..." si falta el dato requerido.
    if (channel === "SMS" && (!phone || phone.trim() === "")) {
      toast.error("Por favor ingresa tu número de teléfono primero");
      return;
    }
    if (channel === "EMAIL" && (!email || email.trim() === "")) {
      toast.error("Por favor ingresa tu correo electrónico primero");
      return;
    }

    // Activar loading de inmediato: la verificación de sesión es una llamada de
    // red (hasta 20s en conexiones lentas) y antes se ejecutaba ANTES de poner
    // el botón en estado de carga, lo que hacía parecer que el clic no respondía.
    setIsSendingOtp(true);

    const hasSession = await ensureActiveSession();
    if (!hasSession) {
      setIsSendingOtp(false);
      return;
    }

    try {
      if (channel === "SMS") {
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
    const fetchPolicyUrl = async () => {
      if (!data?._id) return;

      try {
        const res = await getPublicCollectFormPolicyUrl(data._id);

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
    <>
      <ReauthSessionModal isOpen={showReauthModal} />
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Icon
              icon="material-symbols:info-outline"
              className="text-2xl text-blue-600 flex-shrink-0 mt-0.5"
            />
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold text-blue-900 text-base">
                ¿Quién realiza este registro?
              </h3>
              <p className="text-sm text-blue-800 leading-relaxed">
                Indica si el titular es una{" "}
                <span className="font-semibold">persona natural</span> (ciudadano)
                o una{" "}
                <span className="font-semibold">persona jurídica</span> (empresa
                u organización). Los campos que verás a continuación dependen de
                esa elección.
              </p>
              {personKind === "NATURAL" ? (
                <p className="text-sm text-blue-800 leading-relaxed border-t border-blue-200/80 pt-2">
                  <span className="font-semibold text-blue-900">
                    Persona natural seleccionada:
                  </span>{" "}
                  completa tus nombres, apellidos, tipo y número de documento
                  (C.C., T.I., etc.), género y edad. Debes ser tú quien autoriza
                  el tratamiento de tus datos personales.
                </p>
              ) : (
                <p className="text-sm text-blue-800 leading-relaxed border-t border-blue-200/80 pt-2">
                  <span className="font-semibold text-blue-900">
                    Persona jurídica seleccionada:
                  </span>{" "}
                  ingresa la razón social y el NIT de la empresa, y los nombres
                  y apellidos del representante legal que registra el
                  consentimiento en nombre de la organización.
                </p>
              )}
            </div>
          </div>
        </div>

        <CustomSelect<PersonKind>
          label="Tipo de persona"
          options={personKindOptions}
          value={personKind}
          onChange={handlePersonKindChange}
        />

        {personKind === "NATURAL" ? (
          <>
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
          <div className="flex flex-col items-start gap-1 text-left flex-1 relative h-fit">
            <label className="font-medium w-full text-ellipsis pl-2 text-stone-500 text-sm">
              Género
            </label>
            <select
              value={watch("user.gender") || ""}
              onChange={(e) =>
                setValue("user.gender", e.target.value as UserGender, {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                })
              }
              className="rounded-lg gap-2 w-full text-primary-900 border border-primary-900 flex-1 relative px-3 py-2 bg-primary-50"
            >
              <option value="" disabled>
                Seleccionar opción
              </option>
              {userGendersOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.title}
                </option>
              ))}
            </select>
          </div>
          <CustomInput
            type="number"
            label="Edad"
            {...register("user.age")}
            error={errors.user?.age as FieldError}
          />
        </div>
          </>
        ) : (
          <>
            <CustomInput
              label="Razón social"
              {...register("user.razonSocial")}
              placeholder="Ej. Empresa XYZ S.A.S."
              error={
                errors.user && "razonSocial" in errors.user
                  ? (errors.user as { razonSocial?: FieldError }).razonSocial
                  : undefined
              }
            />
            <div className="flex gap-5">
              <CustomInput
                label="Nombres del representante legal"
                {...register("user.name")}
                placeholder="Ej. Juan"
                error={errors.user?.name}
              />
              <CustomInput
                label="Apellidos del representante legal"
                {...register("user.lastName")}
                placeholder="Ej. Pérez"
                error={errors.user?.lastName}
              />
            </div>
            <CustomInput
              label="NIT"
              {...register("user.docNumber")}
              placeholder="Ej. 900123456 o 900123456-7"
              error={errors.user?.docNumber as FieldError}
            />
            <p className="text-xs text-stone-500 -mt-2 pl-2">
              Ingresa el NIT con o sin dígito de verificación; se enviará solo
              el número principal.
            </p>
          </>
        )}

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
    </>
  );
};

export default PublicCollectForm;
