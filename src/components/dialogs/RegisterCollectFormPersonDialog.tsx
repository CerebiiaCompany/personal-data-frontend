"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import Button from "@/components/base/Button";
import CustomInput from "@/components/forms/CustomInput";
import CustomSelect from "@/components/forms/CustomSelect";
import CustomCheckbox from "@/components/forms/CustomCheckbox";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { createAdminCollectFormResponses } from "@/lib/collectFormResponse.api";
import { hideDialog } from "@/utils/dialogs.utils";
import { parseApiError } from "@/utils/parseApiError";
import {
  AdminCollectFormRecordInput,
  CreateAdminCollectFormResponsesResult,
  PersonKind,
  personKindOptions,
} from "@/types/collectFormResponse.types";
import { DocType, docTypesOptions } from "@/types/user.types";
import { parseNitDocNumber } from "@/utils/collectFormUser.utils";
import { useDialogBackdropClose } from "@/hooks/useDialogBackdropClose";

const formSchema = z
  .object({
    personKind: z.enum(["NATURAL", "JURIDICA"]),
    withoutDocument: z.boolean(),
    docType: z.string().optional(),
    docNumber: z.string().optional(),
    name: z.string().optional(),
    lastName: z.string().optional(),
    razonSocial: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const email = (data.email || "").trim();
    const phone = (data.phone || "").replace(/\D/g, "");
    const hasDoc =
      !data.withoutDocument &&
      Boolean((data.docType || "").trim()) &&
      Boolean((data.docNumber || "").trim());
    const hasContact = Boolean(email) || Boolean(phone);

    if (!hasDoc && !hasContact) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Indica documento o al menos un correo electrónico o teléfono de contacto",
        path: ["email"],
      });
    }

    if (data.personKind === "JURIDICA" && !data.withoutDocument) {
      if (!(data.razonSocial || "").trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La razón social es obligatoria",
          path: ["razonSocial"],
        });
      }
    }
  });

type FormValues = z.infer<typeof formSchema>;

interface Props {
  companyId: string;
  collectFormId: string;
  formName?: string;
  onRegistered?: () => void;
}

function buildRecordPayload(values: FormValues): AdminCollectFormRecordInput {
  const record: AdminCollectFormRecordInput = {};

  const name = (values.name || "").trim();
  const lastName = (values.lastName || "").trim();
  const email = (values.email || "").trim();
  const phone = (values.phone || "").replace(/\D/g, "");

  if (name) record.name = name;
  if (lastName) record.lastName = lastName;
  if (email) record.email = email;
  if (phone) record.phone = phone;

  if (!values.withoutDocument) {
    if (values.personKind === "JURIDICA") {
      record.docType = "NIT";
      record.docNumber = parseNitDocNumber(values.docNumber || "");
      const razonSocial = (values.razonSocial || "").trim();
      if (razonSocial) record.razonSocial = razonSocial;
    } else {
      const docType = (values.docType || "CC") as DocType;
      record.docType = docType;
      record.docNumber = Number(String(values.docNumber || "").replace(/\D/g, ""));
    }
  }

  return record;
}

const defaultValues: FormValues = {
  personKind: "NATURAL",
  withoutDocument: false,
  docType: "CC",
  docNumber: "",
  name: "",
  lastName: "",
  razonSocial: "",
  email: "",
  phone: "",
};

const RegisterCollectFormPersonDialog = ({
  companyId,
  collectFormId,
  formName,
  onRegistered,
}: Props) => {
  const id = HTML_IDS_DATA.registerCollectFormPersonDialog;
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CreateAdminCollectFormResponsesResult | null>(
    null
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  });

  const personKind = watch("personKind");
  const withoutDocument = watch("withoutDocument");

  function handleClose() {
    if (loading) return;
    hideDialog(id);
    setTimeout(() => {
      reset(defaultValues);
      setResult(null);
    }, 200);
  }

  const backdropClose = useDialogBackdropClose(handleClose, {
    matchId: id,
    disabled: loading,
  });

  function handlePersonKindChange(kind: PersonKind) {
    setValue("personKind", kind);
    if (kind === "JURIDICA") {
      setValue("docType", "NIT");
    } else if (watch("docType") === "NIT") {
      setValue("docType", "CC");
    }
  }

  async function onSubmit(values: FormValues) {
    if (!companyId || !collectFormId) return;

    setLoading(true);
    const payload = buildRecordPayload(values);
    const res = await createAdminCollectFormResponses(
      companyId,
      collectFormId,
      payload
    );
    setLoading(false);

    if (res.error) {
      toast.error(parseApiError(res.error));
      return;
    }

    const data = res.data;
    if (!data) {
      toast.error("No se recibió respuesta del servidor");
      return;
    }

    setResult(data);

    if (data.created > 0) {
      toast.success(
        data.skipped > 0
          ? "Persona registrada. Algunos registros ya existían."
          : "Persona registrada correctamente"
      );
      onRegistered?.();
    } else if (data.skipped > 0) {
      toast.warning("Esta persona ya está registrada en el formulario");
    } else {
      toast.error("No se pudo registrar la persona. Verifica los datos ingresados.");
    }
  }

  return (
    <div
      {...backdropClose}
      id={id}
      className="dialog-wrapper fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E8EDF7] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-[#EEF2FF] rounded-lg shrink-0">
              <Icon icon="tabler:user-plus" className="text-xl text-[#1A2B5B]" />
            </div>
            <div className="min-w-0">
              <h5 className="font-semibold text-base text-[#0B1737]">
                Registrar persona
              </h5>
              {formName ? (
                <p className="text-[12px] text-[#64748B] truncate">{formName}</p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors shrink-0"
            disabled={loading}
          >
            <Icon icon="tabler:x" className="text-xl text-stone-600" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0">
          {result ? (
            <div className="flex flex-col gap-4">
              <div
                className={`rounded-xl border px-4 py-4 ${
                  result.created > 0
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-amber-200 bg-amber-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    icon={
                      result.created > 0
                        ? "tabler:circle-check"
                        : "tabler:alert-circle"
                    }
                    className={`text-2xl shrink-0 ${
                      result.created > 0 ? "text-emerald-600" : "text-amber-600"
                    }`}
                  />
                  <div>
                    <p className="font-semibold text-[#0B1737]">
                      {result.created > 0
                        ? "Registro completado"
                        : "No se creó el registro"}
                    </p>
                    <p className="text-[13px] text-[#64748B] mt-1">
                      {result.created > 0
                        ? "La persona quedó con consentimiento pendiente. Puedes enviar la campaña de consentimiento cuando lo necesites."
                        : "Ya existe una persona activa con el mismo documento en este formulario."}
                    </p>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-[13px]">
                      <div>
                        <dt className="text-[#94A3B8]">Creados</dt>
                        <dd className="font-bold text-[#0B1737]">{result.created}</dd>
                      </div>
                      <div>
                        <dt className="text-[#94A3B8]">Omitidos</dt>
                        <dd className="font-bold text-[#0B1737]">{result.skipped}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>

              {result.skippedRecords && result.skippedRecords.length > 0 ? (
                <div className="rounded-xl border border-[#E8EDF7] bg-[#F8FAFC] px-4 py-3 text-[12px] text-[#64748B]">
                  <p className="font-semibold text-[#334155] mb-2">
                    Registros omitidos
                  </p>
                  <ul className="space-y-1">
                    {result.skippedRecords.map((item, index) => (
                      <li key={index}>
                        {item.docType && item.docNumber
                          ? `${item.docType} ${item.docNumber}`
                          : item.name || item.email || item.phone || "Sin identificar"}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  hierarchy="secondary"
                  onClick={handleClose}
                  className="rounded-xl!"
                >
                  Cerrar
                </Button>
                {result.created > 0 ? (
                  <Button
                    onClick={() => {
                      reset(defaultValues);
                      setResult(null);
                    }}
                    className="rounded-xl!"
                  >
                    Registrar otra
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="rounded-xl border border-[#BFDBFE] bg-[#F0F7FF] px-4 py-3 text-[12px] text-[#1E40AF] leading-relaxed">
                El registro se crea sin verificación OTP. La persona quedará con
                consentimiento <strong>pendiente</strong> hasta que acepte la política
                de tratamiento.
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
                      {...register("docNumber")}
                      error={errors.docNumber}
                    />
                    <CustomInput
                      variant="bordered"
                      label="Razón social"
                      placeholder="Empresa S.A.S"
                      {...register("razonSocial")}
                      error={errors.razonSocial}
                    />
                  </>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <CustomSelect<DocType>
                      label="Tipo de documento"
                      options={docTypesOptions}
                      value={(watch("docType") as DocType) || "CC"}
                      onChange={(value) => setValue("docType", value)}
                    />
                    <CustomInput
                      variant="bordered"
                      label="Número de documento"
                      placeholder="1234567890"
                      {...register("docNumber")}
                      error={errors.docNumber}
                    />
                  </div>
                )
              ) : null}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <CustomInput
                  variant="bordered"
                  label={personKind === "JURIDICA" ? "Nombre representante" : "Nombres"}
                  placeholder="Juan"
                  {...register("name")}
                  error={errors.name}
                />
                <CustomInput
                  variant="bordered"
                  label="Apellidos"
                  placeholder="Pérez"
                  {...register("lastName")}
                  error={errors.lastName}
                />
              </div>

              <CustomInput
                variant="bordered"
                label="Correo electrónico"
                type="email"
                placeholder="juan@example.com"
                {...register("email")}
                error={errors.email}
              />

              <CustomInput
                variant="bordered"
                label="Teléfono"
                placeholder="3001234567"
                {...register("phone")}
                error={errors.phone}
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E8EDF7]">
                <Button
                  type="button"
                  hierarchy="secondary"
                  onClick={handleClose}
                  disabled={loading}
                  className="rounded-xl!"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  className="rounded-xl!"
                  startContent={
                    !loading ? (
                      <Icon icon="tabler:user-plus" className="text-base" />
                    ) : undefined
                  }
                >
                  Registrar
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterCollectFormPersonDialog;
