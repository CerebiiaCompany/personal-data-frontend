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
import { parseApiError } from "@/utils/parseApiError";
import { createCollectFormFromTemplate } from "@/lib/collectForm.api";
import { useSessionStore } from "@/store/useSessionStore";
import {
  CreateCollectFormFromTemplate,
  ImportTemplateResult,
} from "@/types/collectForm.types";
import { toast } from "sonner";
import { CollectFormResponseUser } from "@/types/collectFormResponse.types";
import { parseExcelTemplate } from "@/utils/parseExcelTemplate";
import { usePolicyTemplates } from "@/hooks/usePolicyTemplates";
import CustomSelect from "../forms/CustomSelect";
import clsx from "clsx";

const acceptedFiletypes = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const formSchema = z.object({
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
    .max(MAX_FILES, `Máximo ${MAX_FILES} archivos`)
    .default([]),
});

interface Props {
  refresh: () => void;
}

const UploadExcelTemplateDialog = ({ refresh }: Props) => {
  const user = useSessionStore((store) => store.user);
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
    defaultValues: {
      name: "",
      description: "",
      policyTemplateId: "",
      marketingChannels: { SMS: true, EMAIL: false, WHATSAPP: false },
      attachments: [],
    },
  });

  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportTemplateResult | null>(null);
  const id = HTML_IDS_DATA.uploadExcelTemplateDialog;

  const { data: policyTemplates, loading: loadingTemplates } = usePolicyTemplates({
    companyId: user?.companyUserData?.companyId,
  });

  const policyTemplateOptions = React.useMemo(() => {
    if (!policyTemplates || !Array.isArray(policyTemplates)) return [];
    return policyTemplates.map((t) => ({ value: t._id, title: t.name }));
  }, [policyTemplates]);

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).id === id) handleClose();
  }

  function handleClose() {
    hideDialog(id);
    // Reset after animation
    setTimeout(() => {
      reset();
      setImportResult(null);
    }, 200);
  }

  async function onSubmit(data: any) {
    const companyId = user?.companyUserData?.companyId;
    if (!companyId) return;

    const file: File | undefined = data.attachments?.[0];
    if (!file) {
      toast.error("Debes subir un archivo de Excel");
      return;
    }

    const { rows, errors: parseErrors } = await parseExcelTemplate(file);

    if (parseErrors.length) {
      toast.error(`Hay ${parseErrors.length} fila(s) con errores. Corrige y vuelve a subir.`);
      return;
    }

    setLoading(true);
    const res = await createCollectFormFromTemplate(companyId, {
      name: data.name,
      policyTemplateId: data.policyTemplateId,
      marketingChannels: data.marketingChannels,
      responses: rows,
    } as CreateCollectFormFromTemplate);
    setLoading(false);

    if (res.error) {
      toast.error(parseApiError(res.error));
      return;
    }

    refresh();
    setImportResult(res.data as ImportTemplateResult);
  }

  const hasSkipped = (importResult?.responsesSkipped ?? 0) > 0;

  return (
    <div
      onClick={handleBackdropClick}
      id={id}
      className="dialog-wrapper fixed hidden w-full top-0 left-0 h-full z-20 justify-center items-center bg-stone-900/50"
    >
      <div className="w-full animate-appear max-w-xl rounded-xl overflow-hidden bg-white flex flex-col max-h-[90%]">
        {/* Header */}
        <header className="border-b border-b-disabled flex items-center justify-between p-4 gap-6">
          <div className="rounded-full ml-4 border border-disabled p-2 shrink-0">
            <Icon
              icon={importResult ? "tabler:circle-check" : "basil:cloud-upload-outline"}
              className={clsx("text-5xl", importResult && "text-green-600")}
            />
          </div>
          <div className="flex flex-col items-start text-left flex-1 min-w-0">
            <h3 className="font-bold text-xl">
              {importResult ? "Importación completada" : "Importar datos de formulario"}
            </h3>
            <p className="text-sm text-stone-500">
              {importResult
                ? "Revisa el resumen de registros procesados."
                : "Sube la plantilla de Excel para crear un formulario con los usuarios."}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-fit p-1 rounded-lg hover:bg-stone-100 transition-colors shrink-0"
          >
            <Icon icon="tabler:x" className="text-2xl" />
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 px-5 py-4 flex flex-col gap-4 overflow-y-auto">
          {importResult ? (
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
                placeholder="Nombre del formulario"
                {...register("name")}
                error={errors.name as FieldError}
              />

              <div className="flex flex-col gap-1">
                <CustomSelect
                  label="Plantilla de política"
                  options={policyTemplateOptions}
                  value={watch("policyTemplateId")}
                  onChange={(value) => setValue("policyTemplateId", value)}
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
                  <CustomCheckbox label="SMS" {...register("marketingChannels.SMS")} />
                  <CustomCheckbox label="Email" {...register("marketingChannels.EMAIL")} />
                  <CustomCheckbox label="WhatsApp" {...register("marketingChannels.WHATSAPP")} />
                </div>
              </div>

              <CustomFileDropZone
                accept={acceptedFiletypes.join(",")}
                control={control}
                maxFiles={1}
                minFiles={1}
                required
                {...register("attachments")}
              />

              <Button type="submit" className="w-full" loading={loading}>
                Subir archivo
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadExcelTemplateDialog;
