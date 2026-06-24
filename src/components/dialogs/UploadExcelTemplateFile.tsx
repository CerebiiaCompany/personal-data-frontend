"use client";

import React, { useState } from "react";
import CustomInput from "../forms/CustomInput";
import Button from "../base/Button";
import { Icon } from "@iconify/react/dist/iconify.js";
import CustomCheckbox from "../forms/CustomCheckbox";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { hideDialog } from "@/utils/dialogs.utils";
import * as z from "zod";
import {
  CustomFileDropZone,
  generateFileSchema,
  MAX_FILES,
} from "../forms/CustomFileDropZone";
import { FieldError, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resolveCollectFormImportError } from "@/utils/parseApiError";
import { createCollectFormFromTemplate } from "@/lib/collectForm.api";
import {
  CreateCollectFormFromTemplate,
  ImportTemplateResult,
} from "@/types/collectForm.types";
import { toast } from "sonner";
import { CollectFormResponseUser } from "@/types/collectFormResponse.types";
import { parseExcelTemplate } from "@/utils/parseExcelTemplate";
import { usePolicyTemplates } from "@/hooks/usePolicyTemplates";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import CustomSelect from "../forms/CustomSelect";
import clsx from "clsx";
import { useDialogBackdropClose } from "@/hooks/useDialogBackdropClose";

const acceptedFiletypes = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const formSchema = z
  .object({
    name: z.string().min(1, "Este campo es obligatorio"),
    policyTemplateId: z.string().min(1, "Debes seleccionar una plantilla"),
    marketingChannels: z.object({
      SMS: z.boolean(),
      EMAIL: z.boolean(),
      WHATSAPP: z.boolean(),
    }),
    attachments: z
      .array(generateFileSchema(acceptedFiletypes))
      .min(1, "Sube la plantilla de excel")
      .max(MAX_FILES, `Máximo ${MAX_FILES} archivos`),
  })
  .refine(
    (data) =>
      data.marketingChannels.SMS ||
      data.marketingChannels.EMAIL ||
      data.marketingChannels.WHATSAPP,
    {
      message: "Selecciona al menos un canal de envío",
      path: ["marketingChannels"],
    }
  );

interface Props {
  refresh: () => void;
}

const UploadExcelTemplateDialog = ({ refresh }: Props) => {
  const companyId = useActiveCompanyId();
  const {
    formState: { errors },
    register,
    watch,
    handleSubmit,
    control,
    setValue,
    reset,
  } = useForm<any>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      policyTemplateId: "",
      marketingChannels: { SMS: true, EMAIL: true, WHATSAPP: true },
      attachments: [],
    },
  });

  const formName = watch("name");
  const policyTemplateId = watch("policyTemplateId");
  const attachments = watch("attachments");
  const marketingChannels = watch("marketingChannels");

  const hasAtLeastOneChannel = Boolean(
    marketingChannels?.SMS ||
      marketingChannels?.EMAIL ||
      marketingChannels?.WHATSAPP
  );
  const hasExcelFile = Array.isArray(attachments) && attachments.length > 0;
  const isFormComplete =
    Boolean(formName?.trim()) &&
    Boolean(policyTemplateId) &&
    hasExcelFile &&
    hasAtLeastOneChannel;

  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportTemplateResult | null>(null);
  const [errorView, setErrorView] = useState<{
    title: string;
    message: string;
    rows?: { row: number; messages: string[] }[];
  } | null>(null);
  const id = HTML_IDS_DATA.uploadExcelTemplateDialog;

  const { data: policyTemplates, loading: loadingTemplates } = usePolicyTemplates({
    companyId: companyId,
  });

  const policyTemplateOptions = React.useMemo(() => {
    if (!policyTemplates || !Array.isArray(policyTemplates)) return [];
    return policyTemplates.map((t) => ({ value: t._id, title: t.name }));
  }, [policyTemplates]);

  function handleClose() {
    if (loading) return;
    hideDialog(id);
    // Reset after animation
    setTimeout(() => {
      reset();
      setImportResult(null);
      setErrorView(null);
    }, 200);
  }

  const backdropClose = useDialogBackdropClose(handleClose, {
    matchId: id,
    disabled: loading,
  });

  async function onSubmit(data: any) {
    if (loading || !isFormComplete) return;

    if (!companyId) return;

    const file: File | undefined = data.attachments?.[0];
    if (!file) {
      toast.error("Debes subir un archivo de Excel");
      return;
    }

    setLoading(true);
    setErrorView(null);

    try {
      const { rows, errors: parseErrors } = await parseExcelTemplate(file);

      // Errores de validación local del Excel: se muestran en la tarjeta con el
      // detalle por fila, no como toast genérico.
      if (parseErrors.length) {
        setErrorView({
          title: "El archivo tiene filas con errores",
          message:
            "Corrige las siguientes filas en el Excel y vuelve a subir el archivo.",
          rows: parseErrors,
        });
        return;
      }

      const res = await createCollectFormFromTemplate(companyId, {
        name: data.name.trim(),
        policyTemplateId: data.policyTemplateId,
        marketingChannels: data.marketingChannels,
        responses: rows,
      } as CreateCollectFormFromTemplate);

      // Errores controlados del backend: tarjeta con mensaje específico.
      if (res.error) {
        setErrorView({
          title: "No se pudo importar el archivo",
          message: resolveCollectFormImportError(res.error),
        });
        return;
      }

      const result = res.data as ImportTemplateResult;
      refresh();
      setImportResult(result);

      if ((result?.responsesSkipped ?? 0) > 0) {
        toast.warning(
          `${result.responsesSkipped} cliente(s) ya existían y fueron omitidos.`
        );
      }
    } catch {
      setErrorView({
        title: "No se pudo procesar el archivo",
        message:
          "Ocurrió un error al leer el archivo. Verifica que sea la plantilla correcta e intenta de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleRetry() {
    setErrorView(null);
  }

  const hasSkipped = (importResult?.responsesSkipped ?? 0) > 0;

  return (
    <div
      {...backdropClose}
      id={id}
      className="dialog-wrapper fixed hidden w-full top-0 left-0 h-full z-20 justify-center items-center bg-stone-900/50"
    >
      <div className="w-full animate-appear max-w-xl rounded-xl overflow-hidden bg-white flex flex-col max-h-[90%]">
        {/* Header */}
        <header className="border-b border-b-disabled flex items-center justify-between p-4 gap-6">
          <div className="rounded-full ml-4 border border-disabled p-2 shrink-0">
            <Icon
              icon={
                errorView
                  ? "tabler:alert-triangle"
                  : importResult
                  ? "tabler:circle-check"
                  : "basil:cloud-upload-outline"
              }
              className={clsx(
                "text-5xl",
                errorView
                  ? "text-red-600"
                  : importResult
                  ? "text-green-600"
                  : ""
              )}
            />
          </div>
          <div className="flex flex-col items-start text-left flex-1 min-w-0">
            <h3 className="font-bold text-xl">
              {errorView
                ? errorView.title
                : importResult
                ? "Importación completada"
                : "Importar datos de formulario"}
            </h3>
            <p className="text-sm text-stone-500">
              {errorView
                ? "Revisa el detalle del error antes de volver a intentar."
                : importResult
                ? "Revisa el resumen de registros procesados."
                : "Sube la plantilla de Excel para crear un formulario con los usuarios."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className={clsx(
              "w-fit p-1 rounded-lg transition-colors shrink-0",
              loading ? "opacity-40 cursor-not-allowed" : "hover:bg-stone-100"
            )}
          >
            <Icon icon="tabler:x" className="text-2xl" />
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 px-5 py-4 flex flex-col gap-4 overflow-y-auto">
          {errorView ? (
            /* ── Vista de error ─────────────────────────────────────────── */
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <Icon
                  icon="tabler:alert-circle"
                  className="mt-0.5 shrink-0 text-xl text-red-600"
                />
                <p className="text-sm leading-relaxed text-red-800">
                  {errorView.message}
                </p>
              </div>

              {errorView.rows && errorView.rows.length > 0 && (
                <div className="rounded-xl border border-stone-200 overflow-hidden">
                  <div className="grid grid-cols-[70px_1fr] gap-2 bg-stone-100 px-3 py-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                      Fila
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                      Errores
                    </span>
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-stone-100">
                    {errorView.rows.map((r) => (
                      <div
                        key={r.row}
                        className="grid grid-cols-[70px_1fr] gap-2 px-3 py-2.5 text-sm hover:bg-stone-50"
                      >
                        <span className="font-mono text-xs font-semibold text-stone-600">
                          {r.row}
                        </span>
                        <ul className="flex flex-col gap-1">
                          {r.messages.map((m, i) => (
                            <li
                              key={i}
                              className="text-xs font-medium text-red-600"
                            >
                              {m}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                type="button"
                onClick={handleRetry}
                className="w-full mt-1"
                startContent={<Icon icon="tabler:arrow-left" />}
              >
                Volver a intentar
              </Button>
            </div>
          ) : importResult ? (
            /* ── Vista de resultado ─────────────────────────────────────── */
            <div className="flex flex-col gap-4">
              {/* Métricas */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center gap-1 rounded-xl border border-green-100 bg-green-50 px-4 py-4">
                  <span className="text-3xl font-bold text-green-700">
                    {importResult.responsesCreated}
                  </span>
                  <span className="text-xs font-medium text-green-600 text-center">
                    Registros creados
                  </span>
                </div>
                <div
                  className={clsx(
                    "flex flex-col items-center gap-1 rounded-xl border px-4 py-4",
                    hasSkipped
                      ? "border-amber-100 bg-amber-50"
                      : "border-stone-100 bg-stone-50"
                  )}
                >
                  <span
                    className={clsx(
                      "text-3xl font-bold",
                      hasSkipped ? "text-amber-700" : "text-stone-400"
                    )}
                  >
                    {importResult.responsesSkipped}
                  </span>
                  <span
                    className={clsx(
                      "text-xs font-medium text-center",
                      hasSkipped ? "text-amber-600" : "text-stone-400"
                    )}
                  >
                    Omitidos (ya existían)
                  </span>
                </div>
              </div>

              {/* Lista de omitidos */}
              {hasSkipped && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                    <Icon
                      icon="tabler:alert-triangle"
                      className="shrink-0 text-lg text-amber-500"
                    />
                    <p className="text-xs text-amber-700">
                      Los siguientes usuarios ya tienen un registro en algún
                      formulario de tu empresa y no fueron importados.
                    </p>
                  </div>

                  <div className="rounded-xl border border-stone-200 overflow-hidden">
                    {/* Tabla header */}
                    <div className="grid grid-cols-[80px_130px_1fr] gap-2 bg-stone-100 px-3 py-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                        Tipo Doc.
                      </span>
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                        Nº Documento
                      </span>
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                        Nombre
                      </span>
                    </div>

                    {/* Filas */}
                    <div className="max-h-52 overflow-y-auto divide-y divide-stone-100">
                      {importResult.skippedUsers.map((u, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-[80px_130px_1fr] gap-2 px-3 py-2.5 text-sm hover:bg-stone-50"
                        >
                          <span className="font-mono text-xs font-semibold text-stone-600">
                            {u.docType}
                          </span>
                          <span className="font-mono text-xs text-stone-500 truncate">
                            {u.docNumber}
                          </span>
                          <span className="text-xs font-medium text-stone-700 truncate">
                            {u.name} {u.lastName}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <Button type="button" onClick={handleClose} className="w-full mt-1">
                Cerrar
              </Button>
            </div>
          ) : (
            /* ── Formulario ─────────────────────────────────────────────── */
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <CustomInput
                label="Nombre del formulario"
                placeholder="Ej. Registro clientes marzo 2026"
                {...register("name")}
                error={errors.name as FieldError}
                disabled={loading}
              />

              <div className="flex flex-col gap-1">
                <CustomSelect
                  label="Plantilla de política"
                  options={policyTemplateOptions}
                  value={policyTemplateId}
                  onChange={(value) =>
                    setValue("policyTemplateId", value, { shouldValidate: true })
                  }
                  unselectedText={
                    loadingTemplates ? "Cargando..." : "Selecciona una plantilla"
                  }
                  className={errors.policyTemplateId ? "opacity-50" : ""}
                />
                {errors.policyTemplateId && (
                  <p className="text-sm text-red-500 pl-2">
                    {errors.policyTemplateId.message as string}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-start gap-2">
                <p className="font-semibold text-sm text-stone-500">
                  Ruta de envío
                </p>
                <div className="flex items-center gap-6">
                  <CustomCheckbox
                    label="SMS"
                    {...register("marketingChannels.SMS")}
                    disabled={loading}
                  />
                  <CustomCheckbox
                    label="Email"
                    {...register("marketingChannels.EMAIL")}
                    disabled={loading}
                  />
                  <CustomCheckbox
                    label="WhatsApp"
                    {...register("marketingChannels.WHATSAPP")}
                    disabled={loading}
                  />
                </div>
                {(errors.marketingChannels as FieldError)?.message && (
                  <p className="text-sm text-red-500 pl-2">
                    {(errors.marketingChannels as FieldError).message as string}
                  </p>
                )}
                {!hasAtLeastOneChannel && (
                  <p className="text-sm text-amber-600 pl-2">
                    Debes activar al menos un canal de envío.
                  </p>
                )}
              </div>

              <CustomFileDropZone
                accept={acceptedFiletypes.join(",")}
                control={control}
                maxFiles={1}
                minFiles={1}
                required
                {...register("attachments")}
              />

              {!isFormComplete && !loading && (
                <p className="text-xs text-stone-500 text-center leading-relaxed">
                  Completa el nombre, la plantilla de política, al menos un canal
                  y el archivo Excel para habilitar la subida.
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={!isFormComplete || loading}
              >
                {loading ? "Subiendo archivo..." : "Subir archivo"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadExcelTemplateDialog;
