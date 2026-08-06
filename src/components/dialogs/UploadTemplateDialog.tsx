"use client";

import Button from "../base/Button";
import { Icon } from "@iconify/react/dist/iconify.js";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { hideDialog } from "@/utils/dialogs.utils";
import * as z from "zod";
import {
  CustomFileDropZone,
  generateFileSchema,
} from "../forms/CustomFileDropZone";
import { FieldError, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { toast } from "sonner";
import CustomInput from "../forms/CustomInput";
import { useState } from "react";
import { uploadFile } from "@/lib/upload.api";
import { parseApiError } from "@/utils/parseApiError";
import {
  createCompanyPolicyTemplate,
  downloadGeneratedPolicyPreviewPdf,
} from "@/lib/policyTemplate.api";
import LoadingCover from "../layout/LoadingCover";
import { useDialogBackdropClose } from "@/hooks/useDialogBackdropClose";
import type { PolicySourceType } from "@/types/policyTemplate.types";

const acceptedFiletypes = ["application/pdf"];

const maxSizeMB = 5;
const maxFiles = 1;

// Item 7: RAT_GENERATED no exige archivo (attachments queda opcional en ese
// modo — se valida a mano en onSubmit, distinto de STATIC_FILE que sigue
// exigiéndolo vía zod como antes).
const formSchema = z.object({
  name: z.string().min(1, "Este campo es obligatorio"),
  attachments: z
    .array(generateFileSchema(acceptedFiletypes, maxSizeMB))
    .max(maxFiles, `Máximo ${maxFiles} archivos`)
    .default([]),
});

interface Props {
  refresh: () => void;
}

const UploadTemplateDialog = ({ refresh }: Props) => {
  const companyId = useActiveCompanyId();
  const [loading, setLoading] = useState<boolean>(false);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [sourceType, setSourceType] = useState<PolicySourceType>("STATIC_FILE");
  const {
    formState: { errors },
    register,
    watch,
    handleSubmit,
    reset,
    control,
  } = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      attachments: [],
    },
  });
  const id = HTML_IDS_DATA.uploadTemplateDialog;
  const backdropClose = useDialogBackdropClose(() => hideDialog(id), {
    matchId: id,
    disabled: loading,
  });

  async function onSubmit(data: any) {
    console.log("📤 onSubmit called", { data, errors, sourceType });
    if (!companyId) {
      console.error("❌ No companyId found");
      toast.error("No se pudo obtener la información de la compañía");
      return;
    }

    // Item 7: modo "Generar desde el RAT" no sube archivo — crea la
    // plantilla directamente con sourceType RAT_GENERATED.
    if (sourceType === "RAT_GENERATED") {
      try {
        setLoading(true);
        const policyTemplateRes = await createCompanyPolicyTemplate(companyId, {
          name: data.name,
          sourceType: "RAT_GENERATED",
        });

        if (policyTemplateRes.error) {
          setLoading(false);
          return toast.error(parseApiError(policyTemplateRes.error));
        }

        toast.success("Plantilla generada desde el RAT creada");
        setLoading(false);
        refresh();
        reset();
        setSourceType("STATIC_FILE");
        hideDialog(id);
      } catch (error: any) {
        setLoading(false);
        toast.error("Error inesperado: " + (error?.message || "Error desconocido"));
      }
      return;
    }

    const file: File | undefined = data.attachments?.[0];
    console.log("📁 File:", file);
    if (!file) {
      toast.error("Debes cargar un archivo PDF");
      return;
    }

    try {
      setLoading(true);
      console.log("🔄 Iniciando proceso de subida...");
      console.log("📁 Archivo:", {
        name: file.name,
        size: file.size,
        type: file.type,
      });

      // 1. Subir archivo directamente al backend (el backend maneja S3)
      console.log("📤 Subiendo archivo al backend...");
      const uploadRes = await uploadFile(companyId, file, "templates");

      console.log("📥 Respuesta del upload:", uploadRes);

      if (uploadRes.error) {
        setLoading(false);
        const errorMessage = parseApiError(uploadRes.error);
        console.error("❌ Error al subir archivo:", uploadRes.error);
        return toast.error(errorMessage || "Error al subir el archivo");
      }

      const fileData = uploadRes.data;
      if (!fileData) {
        setLoading(false);
        console.error("❌ No se recibió data en la respuesta del upload");
        return toast.error("Error al subir el archivo: no se recibieron datos");
      }

      console.log("✅ Archivo subido correctamente:", fileData);

      // 2. Crear la plantilla de política vinculada al archivo
      console.log("📝 Creando plantilla de política...");
      const policyTemplateRes = await createCompanyPolicyTemplate(companyId, {
        fileId: fileData.id,
        name: data.name,
        sourceType: "STATIC_FILE",
      });

      console.log("📥 Respuesta de createCompanyPolicyTemplate:", policyTemplateRes);

      if (policyTemplateRes.error) {
        setLoading(false);
        return toast.error(parseApiError(policyTemplateRes.error));
      }

      console.log("✅ Plantilla creada exitosamente");
      toast.success("Plantilla de política creada");
      setLoading(false);
      refresh();
      reset();
      setSourceType("STATIC_FILE");
      hideDialog(id);
    } catch (error: any) {
      console.error("❌ Error general en onSubmit:", error);
      setLoading(false);
      toast.error("Error inesperado: " + (error?.message || "Error desconocido"));
    }
  }

  async function handlePreview() {
    if (!companyId) {
      toast.error("No se pudo obtener la información de la compañía");
      return;
    }
    setPreviewLoading(true);
    const res = await downloadGeneratedPolicyPreviewPdf(companyId);
    setPreviewLoading(false);
    if (res.error) {
      toast.error(parseApiError(res.error));
    }
  }

  return (
    /* Wrapper */
    <div
      {...backdropClose}
      id={id}
      className="dialog-wrapper fixed hidden w-full top-0 left-0 h-full z-20 justify-center items-center bg-stone-900/50"
    >
      {/* Modal */}
      <div className="w-full animate-appear max-w-xl rounded-xl overflow-hidden bg-white flex flex-col max-h-3/4 gap-4">
        <header className="border-b justify-between border-b-disabled flex items-center p-4 gap-6">
          <div className="rounded-full ml-4 border border-disabled p-2">
            <Icon icon={"basil:cloud-upload-outline"} className="text-5xl" />
          </div>

          <div className="flex flex-col items-start text-left">
            <h3 className="font-bold text-xl text-left w-full">
              Subir archivos
            </h3>
            <p>Selecciona y carga los archivos de tu elección</p>
          </div>

          <button
            onClick={() => !loading && hideDialog(id)}
            className="w-fit p-1 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <Icon icon={"tabler:x"} className="text-2xl" />
          </button>
        </header>
        <div className="flex-1 px-4 py-3 flex flex-col gap-4 h-full overflow-y-auto">
          {/* Modal body */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              console.log("📋 Form submit event triggered");
              console.log("📋 Current form values:", watch());
              console.log("📋 Form errors:", errors);
              console.log("📋 Form validation state:", {
                isValid: Object.keys(errors).length === 0,
                errorsCount: Object.keys(errors).length,
              });
              handleSubmit(
                (data) => {
                  console.log("✅ Form validation passed, calling onSubmit");
                  onSubmit(data);
                },
                (validationErrors) => {
                  console.error("❌ Form validation failed:", validationErrors);
                  toast.error("Por favor completa todos los campos correctamente");
                }
              )(e);
            }}
            className="flex flex-col gap-6"
          >
            {/* Item 7: fuente de la plantilla — archivo estático (default,
                comportamiento histórico) o generada en vivo desde el RAT. */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSourceType("STATIC_FILE")}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  sourceType === "STATIC_FILE"
                    ? "border-primary-900 bg-primary-50 text-primary-900"
                    : "border-disabled text-stone-500"
                }`}
              >
                Subir archivo
              </button>
              <button
                type="button"
                onClick={() => setSourceType("RAT_GENERATED")}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  sourceType === "RAT_GENERATED"
                    ? "border-primary-900 bg-primary-50 text-primary-900"
                    : "border-disabled text-stone-500"
                }`}
              >
                Generar desde el RAT
              </button>
            </div>

            <CustomInput
              placeholder="Nombre de la plantilla"
              {...register("name")}
              error={errors.name as FieldError}
            />

            {sourceType === "STATIC_FILE" ? (
              <CustomFileDropZone
                accept={acceptedFiletypes.join(",")}
                control={control}
                minFiles={1}
                maxFiles={maxFiles}
                maxSizeMB={maxSizeMB}
                required
                {...register("attachments")}
              />
            ) : (
              <div className="flex flex-col gap-3 rounded-lg border border-disabled bg-stone-50 p-4">
                <p className="text-sm text-stone-600">
                  Esta plantilla se generará automáticamente a partir de los
                  tratamientos activos del RAT de tu empresa — se actualiza
                  sola cuando el RAT cambia, no es un archivo fijo.
                </p>
                <Button
                  type="button"
                  hierarchy="secondary"
                  loading={previewLoading}
                  disabled={previewLoading}
                  onClick={handlePreview}
                  startContent={<Icon icon="tabler:file-search" className="text-lg" />}
                >
                  Previsualizar política (PDF)
                </Button>
              </div>
            )}

            {/* End Actions */}
            <Button
              disabled={loading}
              loading={loading}
              type="submit"
              className="w-full"
              onClick={() => console.log("🔘 Button clicked")}
            >
              {sourceType === "RAT_GENERATED" ? "Crear plantilla" : "Subir archivo"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadTemplateDialog;
