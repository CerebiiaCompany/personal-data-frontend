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
import { generateOtpCode, validateOtpCode } from "@/lib/oneTimeCode.api";
import { getPresignedUrl } from "@/lib/server/getPresignedUrl";
import LoadingCover from "../layout/LoadingCover";

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
    otpCode: z.string().optional(),
    otpCodeId: z.string().optional(),
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

  async function onSubmit(formData: any) {
    // Concatenar código de país con el número de teléfono
    const phoneCountryCode = watch("user.phoneCountryCode") || "57";
    const fullPhoneNumber = `${phoneCountryCode}${formData.user.phone}`;

    // Si hay un OTP pendiente y se ingresó un código, validarlo
    if (pendingOtpId && formData.otpCode && formData.otpCode.trim() !== "") {
      const otpValidation = await validateOtpCode(pendingOtpId, formData.otpCode);

      if (otpValidation.error) {
        console.log(otpValidation.error);
        return toast.error(parseApiError(otpValidation.error));
      }

      toast.success("Código OTP validado");

      //? register user response con OTP validado
      const res = await registerCollectFormResponse(data._id, {
        ...formData,
        user: {
          ...formData.user,
          phone: fullPhoneNumber,
        },
        otpCode: formData.otpCode || "",
        otpCodeId: otpValidation.data.id,
      });

      if (res.error) {
        return toast.error(parseApiError(res.error));
      }

      toast.success("Respuesta registrada");
      setFullName(`${formData.user.name} ${formData.user.lastName}`);
      showDialog(HTML_IDS_DATA.collectFormResponseSavedModal);
      reset();
    } else {
      // Enviar sin validación OTP
      const res = await registerCollectFormResponse(data._id, {
        ...formData,
        user: {
          ...formData.user,
          phone: fullPhoneNumber,
        },
        otpCode: "",
        otpCodeId: "", // Sin OTP
      });

      if (res.error) {
        return toast.error(parseApiError(res.error));
      }

      toast.success("Respuesta registrada");
      setFullName(`${formData.user.name} ${formData.user.lastName}`);
      showDialog(HTML_IDS_DATA.collectFormResponseSavedModal);
      reset();
    }
  }

  async function createOtpCode() {
    const phone = watch("user.phone");
    const phoneCountryCode = watch("user.phoneCountryCode") || "57";
    
    // Validar que el teléfono esté ingresado
    if (!phone || phone.trim() === "") {
      return toast.error("Por favor ingresa tu número de teléfono primero");
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

    console.log(res);

    if (res.error) {
      if (res.error.code === "otp/pending-code") {
        //? server returns otp id in the data
        setPendingOtpId(res.data.id);
      }
      return toast.error(parseApiError(res.error));
    }

    setPendingOtpId(res.data.id);

    toast.success("Código enviado");
  }

  useEffect(() => {
    if (data.policyTemplateFile) {
      (async () => {
        const presignedUrl = await getPresignedUrl(data.policyTemplateFile.key);
        setPolicyUrl(presignedUrl);
      })();
    }
  }, []);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 max-w-2xl items-stretch w-full"
    >
      <CollectFormResponseSavedModal fullName={fullName} />
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
                Para continuar, debe enviar un código de verificación al número de teléfono 
                del cliente ingresado arriba. Haga clic en el botón <strong>"Enviar código OTP"</strong> 
                para que el cliente reciba el código por SMS. Una vez recibido, ingrese el código 
                en el campo correspondiente.
              </p>
            </div>
          </div>
        </div>

        {/* Campo de código OTP y botón de envío */}
        <div className="flex flex-col gap-3">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <CustomInput
                label="Código de verificación (OTP)"
                {...register("otpCode")}
                error={errors.otpCode}
                placeholder="XXX-XXX"
              />
            </div>
            <Button
              type="button"
              onClick={createOtpCode}
              className="h-fit min-w-[180px]"
              hierarchy="primary"
              startContent={<Icon icon={"tabler:send"} className="text-xl" />}
            >
              Enviar código OTP
            </Button>
          </div>
          {pendingOtpId && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md p-3">
              <Icon icon={"material-symbols:check-circle"} className="text-lg" />
              <span className="font-medium">
                Código enviado exitosamente. El cliente recibirá un SMS con el código de verificación.
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
                <a target="_blank" href={policyUrl} className="underline">
                  política de tratamiento de datos personales.
                </a>
              </p>
            }
            error={errors.dataProcessing as FieldError}
          />
        ) : (
          <div className="w-10 h-10 relative">
            <LoadingCover size="sm" />
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-8 justify-center">
        <Button className="w-full max-w-lg" type="submit">
          Enviar
        </Button>
      </div>
    </form>
  );
};

export default PublicCollectForm;
