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
          .regex(/^57\d{10}$/, "Usa el formato 57XXXXXXXXXX (solo números)")
      ),
    }),
    dataProcessing: z.boolean().refine((val) => val === true, {
      error: "Debes aceptar el tratamiento de datos",
    }),
    otpCode: z.string(),
    otpCodeId: z.string(),
  });

  const dynamicDefaultValues = React.useMemo(() => {
    return Object.fromEntries(
      Object.entries(fields).map(([k, v]) => [k, v.default])
    );
  }, [data]);

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
      user: (initialValues?.user as CollectFormResponseUser) || {
        docType: "CC",
      },
      otpCode: "",
      otpCodeId: "",
    },
  });

  async function onSubmit(formData: CreateCollectFormResponse) {
    if (!pendingOtpId) return toast.warning("No has generado un código OTP");
    const otpValidation = await validateOtpCode(pendingOtpId, formData.otpCode);

    if (otpValidation.error) {
      console.log(otpValidation.error);
      return toast.error(parseApiError(otpValidation.error));
    }

    toast.success("Código OTP validado");

    //? register user response
    const res = await registerCollectFormResponse(data._id, {
      ...formData,
      otpCodeId: otpValidation.data.id,
    });

    if (res.error) {
      return toast.error(parseApiError(res.error));
    }

    toast.success("Respuesta registrada");
    setFullName(`${formData.user.name} ${formData.user.lastName}`);
    showDialog(HTML_IDS_DATA.collectFormResponseSavedModal);
    reset();
  }

  async function createOtpCode() {
    const phone = watch("user.phone");
    
    // Validar que el teléfono esté ingresado
    if (!phone || phone.trim() === "") {
      return toast.error("Por favor ingresa tu número de teléfono primero");
    }

    const res = await generateOtpCode({
      collectFormId: data._id,
      recipientData: {
        address: phone,
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
          <CustomInput
            label="Teléfono"
            {...register("user.phone")}
            placeholder="Ej. 57XXXXXXXXXX"
            error={errors.user?.phone as FieldError}
          />
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
        <div className="flex items-end gap-2">
          <CustomInput
            label="Código OTP"
            {...register("otpCode")}
            error={errors.otpCode}
            placeholder="XXX-XXX"
          />
          <Button
            type="button"
            onClick={createOtpCode}
            className="h-fit"
            hierarchy="secondary"
          >
            <Icon icon={"tabler:send"} className="text-2xl" />
          </Button>
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
