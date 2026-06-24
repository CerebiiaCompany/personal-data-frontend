"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";
import { FieldError, useForm } from "react-hook-form";

import Button from "@/components/base/Button";
import CustomInput from "@/components/forms/CustomInput";
import CustomSelect from "@/components/forms/CustomSelect";
import CustomCheckbox from "@/components/forms/CustomCheckbox";
import { updateCollectFormResponse } from "@/lib/collectFormResponse.api";
import { parseApiError } from "@/utils/parseApiError";
import {
  CollectFormResponse,
  getConsentStatusLabel,
  PersonKind,
  personKindOptions,
  UserGender,
  userGendersOptions,
} from "@/types/collectFormResponse.types";
import { DocType, docTypesOptions } from "@/types/user.types";
import {
  buildCollectFormResponseUpdatePayload,
  EditableCollectFormResponseFormValues,
  EditCollectFormFieldErrors,
  isMaskedPersonalData,
  responseToEditableFormValues,
  validateEditableCollectFormResponse,
} from "@/utils/collectFormResponse.utils";

type FormValues = EditableCollectFormResponseFormValues;

interface Props {
  companyId: string;
  collectFormId: string;
  response: CollectFormResponse;
  onUpdated?: () => void;
  onCancel?: () => void;
  variant?: "dialog" | "page";
}

function toFieldError(message?: string): FieldError | undefined {
  return message ? { type: "custom", message } : undefined;
}

const EditCollectFormResponseForm = ({
  companyId,
  collectFormId,
  response,
  onUpdated,
  onCancel,
  variant = "dialog",
}: Props) => {
  const [loading, setLoading] = useState(false);
  const initialValues = useMemo(
    () => responseToEditableFormValues(response),
    [response]
  );

  const { register, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: initialValues,
    mode: "onChange",
  });

  useEffect(() => {
    reset(initialValues, {
      keepErrors: false,
      keepDirty: false,
      keepTouched: false,
    });
  }, [initialValues, reset]);

  const formValues = watch();
  const currentValues = useMemo<EditableCollectFormResponseFormValues>(
    () => ({
      ...formValues,
      age: formValues.age == null ? "" : String(formValues.age),
      gender: formValues.gender || undefined,
    }),
    [formValues]
  );

  const validation = useMemo(
    () => validateEditableCollectFormResponse(currentValues, initialValues),
    [currentValues, initialValues]
  );

  const personKind = formValues.personKind;
  const withoutDocument = formValues.withoutDocument;
  const responseId = response._id || response.id || "";

  function fieldError(key: keyof EditCollectFormFieldErrors) {
    return toFieldError(validation.errors[key]);
  }

  function handlePersonKindChange(kind: PersonKind) {
    setValue("personKind", kind);
    if (kind === "JURIDICA") {
      setValue("docType", "NIT");
    } else if (formValues.docType === "NIT") {
      setValue("docType", "CC");
    }
  }

  async function onSubmit() {
    if (!companyId || !collectFormId || !responseId) return;
    if (!validation.canSave) return;

    const payload = buildCollectFormResponseUpdatePayload(
      currentValues,
      initialValues
    );

    if (!payload) {
      toast.info("No hay cambios para guardar");
      return;
    }

    setLoading(true);
    const res = await updateCollectFormResponse(
      companyId,
      collectFormId,
      responseId,
      payload
    );
    setLoading(false);

    if (res.error) {
      toast.error(parseApiError(res.error));
      return;
    }

    toast.success("Información actualizada correctamente");
    onUpdated?.();
  }

  const consentStatus = response.consent?.status;
  const saveDisabled = loading || !validation.canSave;

  function maskedFieldHint(value?: string) {
    if (!isMaskedPersonalData(value)) return undefined;
    return "Dato enmascarado. Escribe el valor completo solo si deseas modificarlo.";
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <div className="rounded-xl border border-[#BFDBFE] bg-[#F0F7FF] px-4 py-3 text-[12px] text-[#1E40AF] leading-relaxed">
        Solo se actualizan los datos personales recolectados. El estado de
        consentimiento ({getConsentStatusLabel(consentStatus)}) y la verificación
        OTP no se modifican. Los campos enmascarados no se envían al guardar
        salvo que los reemplaces por el valor completo.
      </div>

      <CustomSelect<PersonKind>
        label="Tipo de persona"
        options={personKindOptions}
        value={personKind}
        onChange={handlePersonKindChange}
      />

      <CustomCheckbox
        label="Sin documento de identidad"
        checked={withoutDocument}
        onChange={(e) => setValue("withoutDocument", e.target.checked)}
      />

      {!withoutDocument ? (
        personKind === "JURIDICA" ? (
          <>
            <CustomInput
              variant="bordered"
              label="NIT"
              placeholder="900123456"
              title={maskedFieldHint(formValues.docNumber)}
              {...register("docNumber")}
              error={fieldError("docNumber")}
            />
            <CustomInput
              variant="bordered"
              label="Razón social"
              placeholder="Empresa S.A.S"
              title={maskedFieldHint(formValues.razonSocial)}
              {...register("razonSocial")}
              error={fieldError("razonSocial")}
            />
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CustomSelect<DocType>
              label="Tipo de documento"
              options={docTypesOptions}
              value={(formValues.docType as DocType) || "CC"}
              onChange={(value) => setValue("docType", value)}
            />
            <CustomInput
              variant="bordered"
              label="Número de documento"
              placeholder="1234567890"
              title={maskedFieldHint(formValues.docNumber)}
              {...register("docNumber")}
              error={fieldError("docNumber")}
            />
          </div>
        )
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CustomInput
          variant="bordered"
          label={personKind === "JURIDICA" ? "Nombre representante" : "Nombres"}
          placeholder="Juan"
          title={maskedFieldHint(formValues.name)}
          {...register("name")}
          error={fieldError("name")}
        />
        <CustomInput
          variant="bordered"
          label="Apellidos"
          placeholder="Pérez"
          title={maskedFieldHint(formValues.lastName)}
          {...register("lastName")}
          error={fieldError("lastName")}
        />
      </div>

      {personKind === "NATURAL" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CustomInput
            variant="bordered"
            label="Edad (opcional)"
            type="text"
            inputMode="numeric"
            placeholder="32"
            {...register("age")}
            error={fieldError("age")}
          />
          <CustomSelect<UserGender>
            label="Género (opcional)"
            options={userGendersOptions}
            value={formValues.gender}
            unselectedText="Sin especificar"
            onChange={(value) => setValue("gender", value)}
          />
        </div>
      ) : null}

      <CustomInput
        variant="bordered"
        label="Correo electrónico"
        type="text"
        inputMode="email"
        autoComplete="off"
        placeholder="juan@example.com"
        title={maskedFieldHint(formValues.email)}
        {...register("email")}
        error={fieldError("email")}
      />

      <CustomInput
        variant="bordered"
        label="Teléfono"
        type="text"
        inputMode="tel"
        autoComplete="off"
        placeholder="3001234567"
        title={maskedFieldHint(formValues.phone)}
        {...register("phone")}
        error={fieldError("phone")}
      />

      <div className="flex flex-col gap-2 pt-2 border-t border-[#E8EDF7]">
        {!validation.hasChanges && !loading ? (
          <p className="text-[12px] text-[#64748B] text-right">
            Realiza un cambio para habilitar el guardado.
          </p>
        ) : null}
        {validation.hasChanges && !validation.valid ? (
          <p className="text-[12px] text-red-600 text-right font-medium">
            Corrige los campos marcados antes de guardar.
          </p>
        ) : null}

        <div className="flex justify-end gap-2">
          {onCancel ? (
            <Button
              type="button"
              hierarchy="secondary"
              onClick={onCancel}
              disabled={loading}
              className="rounded-xl!"
            >
              Cancelar
            </Button>
          ) : null}
          <Button
            type="submit"
            loading={loading}
            disabled={saveDisabled}
            className="rounded-xl!"
            startContent={
              !loading ? (
                <Icon icon="tabler:device-floppy" className="text-base" />
              ) : undefined
            }
          >
            Guardar cambios
          </Button>
        </div>
      </div>
    </form>
  );
};

export default EditCollectFormResponseForm;
