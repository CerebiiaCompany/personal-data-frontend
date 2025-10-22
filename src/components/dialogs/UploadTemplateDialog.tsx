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
import { useSessionStore } from "@/store/useSessionStore";
import { toast } from "sonner";
import CustomInput from "../forms/CustomInput";
import { useState } from "react";
import {
  createUploadIntent,
  finalizeUpload,
  uploadWithPresignedUrl,
} from "@/lib/uploadToS3";
import { createCompanyFile } from "@/lib/file.api";
import { parseApiError } from "@/utils/parseApiError";
import { createCompanyPolicyTemplate } from "@/lib/policyTemplate.api";
import LoadingCover from "../layout/LoadingCover";

const acceptedFiletypes = ["application/pdf"];

const maxSizeMB = 5;
const maxFiles = 1;

const formSchema = z.object({
  name: z.string().min(1, "Este campo es obligatorio"),
  attachments: z
    .array(generateFileSchema(acceptedFiletypes, maxSizeMB))
    .min(1, "Sube la plantilla en PDF")
    .max(maxFiles, `Máximo ${maxFiles} archivos`)
    .default([]),
});

interface Props {
  refresh: () => void;
}

const UploadTemplateDialog = ({ refresh }: Props) => {
  const user = useSessionStore((store) => store.user);
  const [loading, setLoading] = useState<boolean>(false);
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

  function handleClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (loading) return;
    if ((e.target as HTMLElement).id === id) {
      hideDialog(id);
    }
  }

  async function onSubmit(data: any) {
    console.log("📤 onSubmit called", { data, errors });
    const companyId = user?.companyUserData?.companyId;
    if (!companyId) {
      console.error("❌ No companyId found");
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
      const filePromise = new Promise<{ key: string }>((res, rej) => {
        createUploadIntent({
          mimeType: file.type || "application/octet-stream",
          size: file.size,
          purpose: "company-templates",
        })
          .then((intent) => {
            uploadWithPresignedUrl(intent.url, file)
              .then((_) => {
                finalizeUpload({
                  key: intent.key,
                  expectedMime: file.type.split("/")[0],
                }).then((e) => res({ key: intent.key }));
              })
              .catch((error) => {
                setLoading(false);
                rej(error);
              });
          })
          .catch((error) => {
            setLoading(false);
            rej(error);
          });
      });

      toast.promise(filePromise, {
        loading: "Subiendo archivo...",
        success: "Plantilla subida",
        error: "Error al subir la plantilla",
      });

      const intent = await filePromise;

      //? send file data to api to create File Model
      const fileRes = await createCompanyFile(companyId, {
        key: intent.key,
        contentType: file.type, //? mimetype
        size: file.size,
        originalName: file.name,
      });

      if (fileRes.error) {
        setLoading(false);
        return toast.error(parseApiError(fileRes.error));
      }

      toast.success("Modelo de archivo creado");

      //? send template data to api to create PolicyTemplate
      const policyTemplateRes = await createCompanyPolicyTemplate(companyId, {
        fileId: fileRes.data.id,
        name: data.name,
      });

      if (policyTemplateRes.error) {
        setLoading(false);
        return toast.error(parseApiError(policyTemplateRes.error));
      }

      toast.success("Plantilla de política creada");
      setLoading(false);
      refresh();
      reset();
      hideDialog(id);

      // Now send `intent.key` as part of your real "create" flow, e.g. POST /api/things { fileKey: intent.key, ... }
    } catch (error: any) {
      console.error(error);
    }
  }

  return (
    /* Wrapper */
    <div
      onClick={handleClick}
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
              console.log("📋 Form submit event triggered");
              console.log("📋 Errors:", errors);
              handleSubmit(onSubmit)(e);
            }}
            className="flex flex-col gap-6"
          >
            <CustomInput
              placeholder="Nombre de la plantilla"
              {...register("name")}
              error={errors.name as FieldError}
            />

            <CustomFileDropZone
              accept={acceptedFiletypes.join(",")}
              control={control}
              minFiles={1}
              maxFiles={maxFiles}
              maxSizeMB={maxSizeMB}
              required
              {...register("attachments")}
            />

            {/* End Actions */}
            <Button
              disabled={loading}
              loading={loading}
              type="submit"
              className="w-full"
              onClick={() => console.log("🔘 Button clicked")}
            >
              Subir archivo
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadTemplateDialog;
