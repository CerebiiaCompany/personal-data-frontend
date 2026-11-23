"use client";

import React, { useState } from "react";
import Button from "../base/Button";
import { Icon } from "@iconify/react/dist/iconify.js";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { hideDialog } from "@/utils/dialogs.utils";
import * as z from "zod";
import {
  CustomFileDropZone,
  generateFileSchema,
  MAX_FILES,
} from "../forms/CustomFileDropZone";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import clsx from "clsx";
import { parseExcelTemplate } from "@/utils/parseExcelTemplate";
import { downloadExcelTemplate } from "@/utils/downloadExcelTemplate";
import { createAdminCollectFormResponses } from "@/lib/collectFormResponse.api";
import {
  AdminCollectFormRecordInput,
  CreateAdminCollectFormResponsesResult,
} from "@/types/collectFormResponse.types";
import { parseApiError } from "@/utils/parseApiError";
import { useDialogBackdropClose } from "@/hooks/useDialogBackdropClose";

const acceptedFiletypes = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const formSchema = z.object({
  attachments: z
    .array(generateFileSchema(acceptedFiletypes))
    .min(1, "Sube la plantilla de Excel")
    .max(MAX_FILES, `Máximo ${MAX_FILES} archivos`),
});

/** Filas por petición (el backend acepta JSON de hasta 1 MB). */
const CHUNK_SIZE = 500;

type ImportSummary = Required<
  Pick<CreateAdminCollectFormResponsesResult, "created" | "skipped" | "invalid">
> & {
  skippedRecords: NonNullable<CreateAdminCollectFormResponsesResult["skippedRecords"]>;
  invalidRecords: NonNullable<CreateAdminCollectFormResponsesResult["invalidRecords"]>;
  /** Filas enviadas pero no confirmadas porque falló una petición a mitad. */
  failedChunkError?: string;
  emailOnly: number;
  completed: number;
};

interface Props {
  companyId: string;
  collectFormId: string;
  formName?: string;
  countryCode?: string;
  onImported: () => void;
}

/**
 * Carga masiva de personas desde la plantilla de Excel DENTRO de un
 * formulario de recolección existente (sin crear un formulario nuevo).
 * Usa la misma plantilla y el mismo parser que "Importar" del listado de
 * formularios. Basta con el correo (o el teléfono): el resto de datos se
 * puede completar después editando el registro.
 */
const ImportExcelToCollectFormDialog = ({
  companyId,
  collectFormId,
  formName,
  countryCode,
  onImported,
}: Props) => {
  const id = HTML_IDS_DATA.importExcelToCollectFormDialog;
  const { register, watch, handleSubmit, control, reset } = useForm<any>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: { attachments: [] },
  });

  const attachments = watch("attachments");
  const hasExcelFile = Array.isArray(attachments) && attachments.length > 0;

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [errorView, setErrorView] = useState<{
    title: string;
    message: string;
    rows?: { row: number; messages: string[] }[];
  } | null>(null);

  function handleClose() {
    if (loading) return;
    hideDialog(id);
    setTimeout(() => {
      reset();
      setSummary(null);
      setErrorView(null);
    }, 200);
  }

  const backdropClose = useDialogBackdropClose(handleClose, {
    matchId: id,
    disabled: loading,
  });

  async function onSubmit(data: any) {
    if (loading) return;
    const file: File | undefined = data.attachments?.[0];
    if (!file) {
      toast.error("Debes subir un archivo de Excel");
      return;
    }

    setLoading(true);
    setErrorView(null);

    try {
      const { rows, errors: parseErrors } = await parseExcelTemplate(file);

      if (parseErrors.length) {
        setErrorView({
          title: "El archivo tiene filas con errores",
          message: "Corrige las siguientes filas en el Excel y vuelve a subir el archivo.",
          rows: parseErrors,
        });
        return;
      }
      if (!rows.length) {
        setErrorView({
          title: "El archivo no tiene registros",
          message:
            "No encontramos filas con datos. Recuerda borrar las filas de ejemplo y dejar al menos un correo o teléfono por fila.",
        });
        return;
      }

      const records = rows as unknown as AdminCollectFormRecordInput[];
      const result: ImportSummary = {
        created: 0,
        skipped: 0,
        invalid: 0,
        skippedRecords: [],
        invalidRecords: [],
        completed: 0,
        emailOnly: records.filter((r) => !r.docType || r.docNumber === undefined).length,
      };

      for (let i = 0; i < records.length; i += CHUNK_SIZE) {
        const chunk = records.slice(i, i + CHUNK_SIZE);
        const res = await createAdminCollectFormResponses(companyId, collectFormId, {
          records: chunk,
          source: "excel_import",
        });
        if (res.error || !res.data) {
          // Las tandas previas ya quedaron guardadas: se informa el parcial.
          result.failedChunkError =
            (res.error && parseApiError(res.error)) ||
            "No se pudo guardar una parte del archivo.";
          break;
        }
        result.created += res.data.created ?? 0;
        result.completed += res.data.completed ?? 0;
        result.skipped += res.data.skipped ?? 0;
        result.invalid += res.data.invalid ?? 0;
        result.skippedRecords.push(...(res.data.skippedRecords ?? []));
        result.invalidRecords.push(...(res.data.invalidRecords ?? []));
      }

      if (result.created > 0 || result.completed > 0) onImported();

      if (result.failedChunkError && result.created === 0 && result.completed === 0) {
        setErrorView({
          title: "No se pudo importar el archivo",
          message: result.failedChunkError,
        });
        return;
      }
      setSummary(result);
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

  const hasSkipped = (summary?.skipped ?? 0) > 0;
  const hasInvalid = (summary?.invalid ?? 0) > 0;

  return (
    <div
      {...backdropClose}
      id={id}
      className="dialog-wrapper fixed hidden w-full top-0 left-0 h-full z-20 justify-center items-center bg-stone-900/50"
    >
      <div className="w-full animate-appear max-w-xl rounded-xl overflow-hidden bg-white flex flex-col max-h-[90%]">
        <header className="border-b border-b-disabled flex items-center justify-between p-4 gap-6">
          <div className="rounded-full ml-4 border border-disabled p-2 shrink-0">
            <Icon
              icon={
                errorView
                  ? "tabler:alert-triangle"
                  : summary
                    ? "tabler:circle-check"
                    : "tabler:file-spreadsheet"
              }
              className={clsx(
                "text-5xl",
                errorView ? "text-red-600" : summary ? "text-green-600" : ""
              )}
            />
          </div>
          <div className="flex flex-col items-start text-left flex-1 min-w-0">
            <h3 className="font-bold text-xl">
              {errorView
                ? errorView.title
                : summary
                  ? "Importación completada"
                  : "Importar personas desde Excel"}
            </h3>
            <p className="text-sm text-stone-500">
              {errorView
                ? "Revisa el detalle del error antes de volver a intentar."
                : summary
                  ? "Revisa el resumen de registros procesados."
                  : `Agrega personas a "${formName ?? "este formulario"}" con la plantilla de Excel.`}
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

        <div className="flex-1 px-5 py-4 flex flex-col gap-4 overflow-y-auto">
          {errorView ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <Icon icon="tabler:alert-circle" className="mt-0.5 shrink-0 text-xl text-red-600" />
                <p className="text-sm leading-relaxed text-red-800">{errorView.message}</p>
              </div>

              {errorView.rows && errorView.rows.length > 0 && (
                <div className="rounded-xl border border-stone-200 overflow-hidden">
                  <div className="grid grid-cols-[70px_1fr] gap-2 bg-stone-100 px-3 py-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Fila</span>
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Errores</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-stone-100">
                    {errorView.rows.map((r) => (
                      <div key={r.row} className="grid grid-cols-[70px_1fr] gap-2 px-3 py-2.5 text-sm">
                        <span className="font-mono text-xs font-semibold text-stone-600">{r.row}</span>
                        <ul className="flex flex-col gap-1">
                          {r.messages.map((m, i) => (
                            <li key={i} className="text-xs font-medium text-red-600">{m}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                type="button"
                onClick={() => setErrorView(null)}
                className="w-full mt-1"
                startContent={<Icon icon="tabler:arrow-left" />}
              >
                Volver a intentar
              </Button>
            </div>
          ) : summary ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center gap-1 rounded-xl border border-green-100 bg-green-50 px-3 py-4">
                  <span className="text-3xl font-bold text-green-700">{summary.created}</span>
                  <span className="text-xs font-medium text-green-600 text-center">Agregados</span>
                </div>
                <div
                  className={clsx(
                    "flex flex-col items-center gap-1 rounded-xl border px-3 py-4",
                    hasSkipped ? "border-amber-100 bg-amber-50" : "border-stone-100 bg-stone-50"
                  )}
                >
                  <span className={clsx("text-3xl font-bold", hasSkipped ? "text-amber-700" : "text-stone-400")}>
                    {summary.skipped}
                  </span>
                  <span className={clsx("text-xs font-medium text-center", hasSkipped ? "text-amber-600" : "text-stone-400")}>
                    Omitidos (ya existían)
                  </span>
                </div>
                <div
                  className={clsx(
                    "flex flex-col items-center gap-1 rounded-xl border px-3 py-4",
                    hasInvalid ? "border-red-100 bg-red-50" : "border-stone-100 bg-stone-50"
                  )}
                >
                  <span className={clsx("text-3xl font-bold", hasInvalid ? "text-red-700" : "text-stone-400")}>
                    {summary.invalid}
                  </span>
                  <span className={clsx("text-xs font-medium text-center", hasInvalid ? "text-red-600" : "text-stone-400")}>
                    Con documento inválido
                  </span>
                </div>
              </div>

              {summary.failedChunkError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                  <Icon icon="tabler:alert-circle" className="mt-0.5 shrink-0 text-lg text-red-600" />
                  <p className="text-xs text-red-700">
                    La importación se detuvo a mitad: {summary.failedChunkError} Los registros
                    agregados arriba sí quedaron guardados; vuelve a subir el archivo para
                    completar el resto (los que ya existen se omiten).
                  </p>
                </div>
              )}

              {summary.completed > 0 && (
                <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                  <Icon icon="tabler:user-check" className="mt-0.5 shrink-0 text-lg text-green-600" />
                  <p className="text-xs text-green-800">
                    {summary.completed} persona(s) ya estaban en el formulario solo con correo o teléfono:
                    se completaron con el documento y los datos del archivo, sin duplicarlas.
                  </p>
                </div>
              )}

              {summary.emailOnly > 0 && (
                <div className="flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2">
                  <Icon icon="tabler:info-circle" className="mt-0.5 shrink-0 text-lg text-sky-600" />
                  <p className="text-xs text-sky-800">
                    {summary.emailOnly} fila(s) del archivo venían sin documento de identidad. Las
                    nuevas se guardaron con un identificador temporal; puedes completar sus datos
                    después editando cada registro.
                  </p>
                </div>
              )}

              {(hasSkipped || hasInvalid) && (
                <div className="rounded-xl border border-stone-200 overflow-hidden">
                  <div className="grid grid-cols-[1fr_1fr_1.2fr] gap-2 bg-stone-100 px-3 py-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Documento</span>
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Contacto</span>
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Motivo</span>
                  </div>
                  <div className="max-h-52 overflow-y-auto divide-y divide-stone-100">
                    {summary.invalidRecords.map((r, i) => (
                      <div key={`inv-${i}`} className="grid grid-cols-[1fr_1fr_1.2fr] gap-2 px-3 py-2.5">
                        <span className="font-mono text-xs text-stone-600 truncate">{r.docType} {r.docNumber}</span>
                        <span className="text-xs text-stone-600 truncate">{r.email ?? "—"}</span>
                        <span className="text-xs font-medium text-red-600">{r.reason}</span>
                      </div>
                    ))}
                    {summary.skippedRecords.map((r, i) => (
                      <div key={`sk-${i}`} className="grid grid-cols-[1fr_1fr_1.2fr] gap-2 px-3 py-2.5">
                        <span className="font-mono text-xs text-stone-600 truncate">
                          {r.docType && r.docNumber ? `${r.docType} ${r.docNumber}` : "—"}
                        </span>
                        <span className="text-xs text-stone-600 truncate">{r.email ?? r.phone ?? "—"}</span>
                        <span className="text-xs font-medium text-amber-600">
                          {r.docType && r.docNumber
                            ? "Ya registrado en la empresa"
                            : "Ya registrado en este formulario"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button type="button" onClick={handleClose} className="w-full mt-1">
                Cerrar
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <div className="flex items-start justify-between gap-3 rounded-xl border border-[#E3E9F4] bg-[#F8FAFC] px-4 py-3">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-stone-700">1. Descarga la plantilla</p>
                  <p className="text-xs leading-relaxed text-stone-500">
                    Solo el <b>correo</b> (o el teléfono) es obligatorio. Documento, nombre y demás
                    datos son opcionales y se pueden completar después.
                  </p>
                </div>
                <Button
                  type="button"
                  hierarchy="secondary"
                  className="shrink-0 rounded-xl! text-[13px]! px-3! py-2!"
                  onClick={() => downloadExcelTemplate(countryCode)}
                  startContent={<Icon icon="tabler:download" className="text-base" />}
                >
                  Plantilla
                </Button>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-stone-700">2. Sube el archivo diligenciado</p>
                <CustomFileDropZone
                  accept={acceptedFiletypes.join(",")}
                  control={control}
                  maxFiles={1}
                  minFiles={1}
                  required
                  {...register("attachments")}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={!hasExcelFile || loading}
              >
                {loading ? "Importando..." : "Importar personas"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportExcelToCollectFormDialog;
