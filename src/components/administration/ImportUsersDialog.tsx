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
} from "../forms/CustomFileDropZone";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseApiError } from "@/utils/parseApiError";
import { toast } from "sonner";
import clsx from "clsx";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { importCompanyUsers } from "@/lib/user.api";
import { ImportUsersResult } from "@/types/user.types";
import { useDialogBackdropClose } from "@/hooks/useDialogBackdropClose";

const ACCEPTED_FILE_TYPES = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const formSchema = z.object({
  attachments: z
    .array(generateFileSchema(ACCEPTED_FILE_TYPES))
    .min(1, "Sube la plantilla de Excel")
    .max(1, "Solo puedes subir un archivo"),
});

interface Props {
  refresh: () => void;
}

const ImportUsersDialog = ({ refresh }: Props) => {
  const companyId = useActiveCompanyId();
  const id = HTML_IDS_DATA.importUsersDialog;
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportUsersResult | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<{ attachments: File[] }>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: { attachments: [] },
  });

  const attachments = watch("attachments");
  const hasFile = Array.isArray(attachments) && attachments.length > 0;

  function handleClose() {
    if (loading) return;
    hideDialog(id);
    setTimeout(() => {
      reset();
      setResult(null);
    }, 200);
  }

  const backdropClose = useDialogBackdropClose(handleClose, {
    matchId: id,
    disabled: loading,
  });

  async function onSubmit(data: { attachments: File[] }) {
    if (loading || !companyId) return;

    const file = data.attachments?.[0];
    if (!file) {
      toast.error("Debes subir un archivo de Excel");
      return;
    }

    setLoading(true);
    try {
      const res = await importCompanyUsers(companyId, file);

      const payload = res.data as ImportUsersResult | undefined;

      // Si tenemos el detalle (resumen + errores por fila), lo mostramos en la
      // tarjeta SIEMPRE, aunque venga acompañado de un error de backend.
      if (payload?.summary) {
        setResult(payload);

        if (payload.summary.createdCount > 0) {
          toast.success(
            `${payload.summary.createdCount} usuario(s) importado(s) correctamente.`
          );
          refresh();
        }
        return;
      }

      // Sin detalle: error genérico del backend.
      if (res.error) {
        toast.error(parseApiError(res.error));
        return;
      }

      toast.error("No se recibió respuesta de la importación. Intenta de nuevo.");
    } catch {
      toast.error("Ocurrió un error al procesar el archivo. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  const hasErrors = (result?.summary.errorCount ?? 0) > 0;
  const createdCount = result?.summary.createdCount ?? 0;

  const resultHeader = (() => {
    if (!result) {
      return {
        icon: "basil:cloud-upload-outline",
        iconClass: "",
        title: "Importar usuarios desde Excel",
        subtitle: "Sube la plantilla con los datos de los usuarios a crear.",
      };
    }
    if (hasErrors && createdCount === 0) {
      return {
        icon: "tabler:alert-triangle",
        iconClass: "text-red-600",
        title: "No se importaron usuarios",
        subtitle: "Ninguna fila se pudo crear. Revisa los errores.",
      };
    }
    if (hasErrors && createdCount > 0) {
      return {
        icon: "tabler:alert-circle",
        iconClass: "text-amber-500",
        title: "Importación parcial",
        subtitle: "Algunas filas se crearon y otras tienen errores.",
      };
    }
    return {
      icon: "tabler:circle-check",
      iconClass: "text-green-600",
      title: "Importación completada",
      subtitle: "Todos los usuarios se importaron correctamente.",
    };
  })();

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
              icon={resultHeader.icon}
              className={clsx("text-5xl", resultHeader.iconClass)}
            />
          </div>
          <div className="flex flex-col items-start text-left flex-1 min-w-0">
            <h3 className="font-bold text-xl">{resultHeader.title}</h3>
            <p className="text-sm text-stone-500">{resultHeader.subtitle}</p>
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
          {result ? (
            /* ── Vista de resultado ─────────────────────────────────── */
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center gap-1 rounded-xl border border-stone-100 bg-stone-50 px-3 py-4">
                  <span className="text-3xl font-bold text-stone-700">
                    {result.summary.total}
                  </span>
                  <span className="text-xs font-medium text-stone-500 text-center">
                    Total filas
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-xl border border-green-100 bg-green-50 px-3 py-4">
                  <span className="text-3xl font-bold text-green-700">
                    {result.summary.createdCount}
                  </span>
                  <span className="text-xs font-medium text-green-600 text-center">
                    Creados
                  </span>
                </div>
                <div
                  className={clsx(
                    "flex flex-col items-center gap-1 rounded-xl border px-3 py-4",
                    hasErrors
                      ? "border-red-100 bg-red-50"
                      : "border-stone-100 bg-stone-50"
                  )}
                >
                  <span
                    className={clsx(
                      "text-3xl font-bold",
                      hasErrors ? "text-red-700" : "text-stone-400"
                    )}
                  >
                    {result.summary.errorCount}
                  </span>
                  <span
                    className={clsx(
                      "text-xs font-medium text-center",
                      hasErrors ? "text-red-600" : "text-stone-400"
                    )}
                  >
                    Con error
                  </span>
                </div>
              </div>

              {hasErrors && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                    <Icon
                      icon="tabler:alert-triangle"
                      className="shrink-0 text-lg text-red-500"
                    />
                    <p className="text-xs text-red-700">
                      Las siguientes filas no se pudieron importar. Corrígelas y
                      vuelve a subir el archivo (los usuarios válidos ya fueron
                      creados).
                    </p>
                  </div>

                  <div className="rounded-xl border border-stone-200 overflow-hidden">
                    <div className="grid grid-cols-[60px_140px_1fr] gap-2 bg-stone-100 px-3 py-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                        Fila
                      </span>
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                        Usuario
                      </span>
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                        Error
                      </span>
                    </div>
                    <div className="max-h-52 overflow-y-auto divide-y divide-stone-100">
                      {result.errors.map((e, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-[60px_140px_1fr] gap-2 px-3 py-2.5 text-sm hover:bg-stone-50"
                        >
                          <span className="font-mono text-xs font-semibold text-stone-600">
                            {e.row}
                          </span>
                          <span className="text-xs text-stone-600 truncate" title={e.username}>
                            {e.username || "—"}
                          </span>
                          <span className="text-xs font-medium text-red-600">
                            {e.error}
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
            /* ── Formulario ─────────────────────────────────────────── */
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <Icon
                  icon="tabler:info-circle"
                  className="mt-0.5 shrink-0 text-lg text-blue-600"
                />
                <p className="text-xs text-blue-800">
                  Usa la plantilla oficial. Los usuarios se crean con la
                  contraseña por defecto <strong>password</strong> y deberán
                  cambiarla en su primer acceso. Tamaño máximo: 5&nbsp;MB.
                </p>
              </div>

              <CustomFileDropZone
                label="Archivo de Excel"
                accept={ACCEPTED_FILE_TYPES.join(",")}
                control={control as never}
                maxFiles={1}
                minFiles={1}
                required
                name="attachments"
              />

              {(errors.attachments as { message?: string })?.message && (
                <p className="text-sm text-red-500 pl-2">
                  {(errors.attachments as { message?: string }).message}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={!hasFile || loading}
              >
                {loading ? "Importando..." : "Importar usuarios"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportUsersDialog;
