"use client";

import React, { useRef, useState } from "react";
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
import { Controller, FieldError, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseApiError } from "@/utils/parseApiError";
import { createCollectFormFromTemplate } from "@/lib/collectForm.api";
import { useSessionStore } from "@/store/useSessionStore";
import { CreateCollectFormFromTemplate } from "@/types/collectForm.types";
import { toast } from "sonner";
import { CollectFormResponseUser } from "@/types/collectFormResponse.types";
import { parseExcelTemplate } from "@/utils/parseExcelTemplate";

const acceptedFiletypes = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const formSchema = z.object({
  name: z.string().min(1, "Este campo es obligatorio"),
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
  } = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      marketingChannels: {
        EMAIL: false,
        SMS: false,
        WHATSAPP: false,
      },
      attachments: [],
    },
  });
  const [loading, setLoading] = useState<boolean>();
  const id = HTML_IDS_DATA.uploadExcelTemplateDialog;

  function handleClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if ((e.target as HTMLElement).id === id) {
      hideDialog(id);
    }
  }

  async function onSubmit(data: any) {
    const companyId = user?.companyUserData?.companyId;
    if (!companyId) return;

    // Parse excel file users data
    const responses: CollectFormResponseUser[] = [];

    const file: File | undefined = data.attachments?.[0];
    if (!file) {
      toast.error("Debes subir un archivo de Excel");
      return;
    }

    const { rows, errors } = await parseExcelTemplate(file);

    if (errors.length) {
      // Muestra los primeros errores, o podrías listarlos en un modal
      console.warn("Errores de parseo:", errors);
      toast.error(
        `Hay ${errors.length} fila(s) con errores. Corrige y vuelve a subir.`
      );
      return;
    }

    // Make request to server
    const res = await createCollectFormFromTemplate(companyId, {
      name: data.name,
      marketingChannels: data.marketingChannels,
      responses: rows,
    } as CreateCollectFormFromTemplate);

    if (res.error) {
      return toast.error(parseApiError(res.error));
    }
    console.log(res);

    toast.success("Plantilla importada");

    refresh();
    hideDialog(id);
  }

  return (
    /* Wrapper */
    <div
      onClick={handleClick}
      id={id}
      className="dialog-wrapper fixed hidden w-full top-0 left-0 h-full z-20 justify-center items-center bg-stone-900/50"
    >
      {/* Modal */}
      <div className="w-full animate-appear max-w-xl rounded-xl overflow-hidden bg-white flex flex-col max-h-[90%] gap-4">
        <header className="border-b justify-between border-b-disabled flex items-center p-4 gap-6">
          <div className="rounded-full ml-4 border border-disabled p-2">
            <Icon icon={"basil:cloud-upload-outline"} className="text-5xl" />
          </div>

          <div className="flex flex-col items-start text-left">
            <h3 className="font-bold text-xl text-left w-full">
              Importar datos de formulario
            </h3>
            <p>
              Sube la plantilla de excel para crear un formulario nuevo con los
              usuarios de la plantilla.
            </p>
          </div>

          <button
            onClick={() => hideDialog(id)}
            className="w-fit p-1 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <Icon icon={"tabler:x"} className="text-2xl" />
          </button>
        </header>
        <div className="flex-1 px-4 py-3 flex flex-col gap-4 h-full overflow-y-auto">
          {/* Modal body */}
          <div className="flex-1 overflow-y-auto pr-1 w-full h-full flex flex-col gap-4">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
            >
              <CustomInput
                placeholder="Nombre del formulario"
                {...register("name")}
                error={errors.name as FieldError}
              />

              <div className="flex flex-col items-start gap-2">
                <p className="font-semibold text-sm text-stone-500">
                  Ruta de envío
                </p>
                <div className="flex items-center gap-6">
                  <CustomCheckbox
                    label="SMS"
                    {...register("marketingChannels.SMS")}
                  />
                  <CustomCheckbox
                    label="Email"
                    {...register("marketingChannels.EMAIL")}
                  />{" "}
                  <CustomCheckbox
                    label="WhatsApp"
                    {...register("marketingChannels.WHATSAPP")}
                  />
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

              {/* End Actions */}
              <Button type="submit" className="w-full">
                Subir archivo
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadExcelTemplateDialog;
