"use client";

import React, { useEffect, useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";

import Button from "@/components/base/Button";
import CustomInput from "@/components/forms/CustomInput";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { hideDialog } from "@/utils/dialogs.utils";
import { parseApiError } from "@/utils/parseApiError";
import { updateOwnCompany } from "@/lib/company.api";
import { Company } from "@/types/company.types";

const schema = z.object({
  name: z.string().min(1, "Nombre obligatorio"),
  nit: z.string().min(1, "NIT obligatorio"),
  email: z.string().email("Correo inválido").min(1, "Correo obligatorio"),
  phone: z.string().min(1, "Teléfono obligatorio"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  company: Company | null;
  onUpdated?: () => void;
}

const EditOwnCompanyDialog = ({ company, onUpdated }: Props) => {
  const id = HTML_IDS_DATA.editOwnCompanyDialog;
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      nit: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (!company) return;
    reset({
      name: company.name ?? "",
      nit: company.nit ?? "",
      email: company.email ?? "",
      phone: company.phone ?? "",
    });
  }, [company, reset]);

  function handleClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if ((e.target as HTMLElement).id === id && !loading) {
      hideDialog(id);
    }
  }

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const res = await updateOwnCompany(values);
    setLoading(false);

    if (res.error) {
      const isDuplicate =
        res.error.code === "db/duplicate-key" || res.error.code === "http/conflict";
      return toast.error(
        isDuplicate
          ? "El NIT o el correo ya existen"
          : parseApiError(res.error)
      );
    }

    toast.success("Datos de la compañía actualizados");
    hideDialog(id);
    onUpdated?.();
  }

  return (
    <div
      onClick={handleClick}
      id={id}
      className="dialog-wrapper fixed hidden w-full top-0 left-0 h-full z-20 justify-center items-center bg-stone-900/50"
    >
      <div className="w-full animate-appear max-w-xl rounded-xl overflow-hidden bg-white flex flex-col max-h-[85vh] gap-4 p-6 sm:p-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-disabled p-2">
              <Icon icon={"material-symbols:edit-outline"} className="text-2xl" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-bold text-xl text-primary-900">
                Editar datos de la compañía
              </h3>
              <p className="text-stone-500 text-sm">
                Solo puedes editar nombre, NIT, correo y teléfono.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => !loading && hideDialog(id)}
            className="w-fit p-1 rounded-lg hover:bg-stone-100 transition-colors"
            aria-label="Cerrar"
          >
            <Icon icon={"tabler:x"} className="text-2xl" />
          </button>
        </header>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 flex-1 min-h-0"
        >
          <div className="flex flex-col gap-5 flex-1 min-h-0 overflow-y-auto pr-1">
            <CustomInput
              label="Nombre"
              placeholder="Ej. Frontera Celular"
              {...register("name")}
              error={errors.name}
            />
            <CustomInput
              label="NIT"
              placeholder="Ej. 820507899-5"
              {...register("nit")}
              error={errors.nit}
            />
            <CustomInput
              label="Correo"
              placeholder="Ej. nuevo@correo.com"
              {...register("email")}
              error={errors.email}
            />
            <CustomInput
              label="Teléfono"
              placeholder="Ej. 3001234567"
              {...register("phone")}
              error={errors.phone}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-disabled bg-white">
            <Button
              hierarchy="secondary"
              type="button"
              onClick={() => hideDialog(id)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button hierarchy="primary" type="submit" loading={loading}>
              Guardar cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOwnCompanyDialog;

