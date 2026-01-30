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
import { updateMe } from "@/lib/user.api";
import { useSessionStore } from "@/store/useSessionStore";
import { hideDialog } from "@/utils/dialogs.utils";
import { parseApiError } from "@/utils/parseApiError";
import { SessionUser } from "@/types/user.types";

const schema = z.object({
  name: z.string().min(1, "Nombre obligatorio"),
  companyUserData: z.object({
    phone: z.string().min(1, "Teléfono obligatorio"),
    personalEmail: z.string().email("Correo inválido").min(1, "Correo obligatorio"),
  }),
});

type FormValues = z.infer<typeof schema>;

const EditProfileDialog = () => {
  const id = HTML_IDS_DATA.editProfileDialog;
  const { user, setUser } = useSessionStore();
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
      companyUserData: {
        phone: "",
        personalEmail: "",
      },
    },
  });

  useEffect(() => {
    if (!user?.companyUserData) return;
    reset({
      name: user.name ?? "",
      companyUserData: {
        phone: user.companyUserData.phone ?? "",
        personalEmail: user.companyUserData.personalEmail ?? "",
      },
    });
  }, [user, reset]);

  function handleClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if ((e.target as HTMLElement).id === id && !loading) {
      hideDialog(id);
    }
  }

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const res = await updateMe(values);
    setLoading(false);

    if (res.error) {
      return toast.error(parseApiError(res.error));
    }

    const fallbackUpdatedUser: SessionUser | undefined = user
      ? ({
          ...user,
          name: values.name,
          companyUserData: user.companyUserData
            ? {
                ...user.companyUserData,
                phone: values.companyUserData.phone,
                personalEmail: values.companyUserData.personalEmail,
              }
            : undefined,
        } as SessionUser)
      : undefined;

    setUser((res.data as SessionUser) ?? fallbackUpdatedUser);
    toast.success("Perfil actualizado");
    hideDialog(id);
  }

  return (
    <div
      onClick={handleClick}
      id={id}
      className="dialog-wrapper fixed hidden w-full top-0 left-0 h-full z-20 justify-center items-center"
    >
      <div className="w-full animate-appear max-w-xl rounded-xl overflow-hidden bg-white flex flex-col max-h-[85vh] gap-4 p-6 sm:p-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-disabled p-2">
              <Icon icon={"mynaui:user-solid"} className="text-2xl" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-bold text-xl text-primary-900">
                Editar perfil
              </h3>
              <p className="text-stone-500 text-sm">
                Actualiza tu nombre, teléfono y correo personal.
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
              placeholder="Ej. Ana"
              {...register("name")}
              error={errors.name}
            />
            <CustomInput
              label="Teléfono"
              placeholder="Ej. 3001234567"
              {...register("companyUserData.phone")}
              error={errors.companyUserData?.phone}
            />
            <CustomInput
              label="Correo personal"
              type="email"
              placeholder="Ej. ana@correo.com"
              {...register("companyUserData.personalEmail")}
              error={errors.companyUserData?.personalEmail}
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

export default EditProfileDialog;

