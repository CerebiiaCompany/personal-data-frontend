"use client";

import React, { useRef, useState } from "react";
import CustomInput from "../forms/CustomInput";
import Button from "../base/Button";
import { Icon } from "@iconify/react/dist/iconify.js";
import CustomCheckbox from "../forms/CustomCheckbox";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { hideDialog } from "@/utils/dialogs.utils";
import Image from "next/image";
import SquareLogo from "@public/logo-collapsed.svg";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseApiError } from "@/utils/parseApiError";
import { toast } from "sonner";
import { loginUser, updatePassword } from "@/lib/auth.api";

const schema = z
  .object({
    password: z.string().min(8, "La contraseña debe tener mínimo 8 caracteres"),
    confirmPassword: z
      .string()
      .min(8, "La confirmación debe tener mínimo 8 caracteres"),
  })
  .refine((data) => data.confirmPassword === data.password, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

const UpdatePasswordDialog = () => {
  const id = HTML_IDS_DATA.updatePasswordDialog;
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  function handleClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if ((e.target as HTMLElement).id === id) {
      hideDialog(id);
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: any) {
    setLoading(true);

    const loginRes = await updatePassword(data.password);

    if (loginRes.error) {
      return toast.error(parseApiError(loginRes.error));
    }

    /* const session = await getSession();

    setUser(session.data); */
    toast.success(`Clave actualizada`);

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
      <div className="w-full animate-appear max-w-xl rounded-xl overflow-hidden bg-white flex flex-col max-h-3/4 gap-4 p-8 items-center text-center">
        <Image
          src={SquareLogo}
          alt="Logo Cerebiia Cuadrado"
          width={100}
          className="h-auto w-12"
        />
        <h6 className="text-primary-900 font-bold text-lg">Cambiar Clave</h6>
        <p className="text-stone-500">
          Recuerda que tu clave debe tener como mínimo 8 caracteres
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6 w-full max-w-sm mt-10"
        >
          <div className="flex flex-col items-start gap-1 text-left w-full">
            <div className="w-full relative">
              <input
                id="passwordField"
                type={showPassword ? "text" : "password"}
                placeholder="Escribe tu nueva clave"
                {...register("password")}
                className="gap-2 w-full text-primary-900 flex-1 relative px-3 py-2 pr-12 border border-disabled rounded-lg"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-stone-500 hover:bg-stone-100 transition-colors"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <Icon
                  icon={showPassword ? "tabler:eye-off" : "tabler:eye"}
                  className="text-lg"
                />
              </button>
            </div>
            {errors.password && (
              <span className="text-red-400 text-sm font-semibold">
                {errors.password.message}
              </span>
            )}
          </div>

          <div className="flex flex-col items-start gap-1 text-left w-full">
            <div className="w-full relative">
              <input
                id="confirmPasswordField"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirma tu nueva clave"
                {...register("confirmPassword")}
                className="gap-2 w-full text-primary-900 flex-1 relative px-3 py-2 pr-12 border border-disabled rounded-lg"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-stone-500 hover:bg-stone-100 transition-colors"
                aria-label={
                  showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                title={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <Icon
                  icon={showConfirmPassword ? "tabler:eye-off" : "tabler:eye"}
                  className="text-lg"
                />
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="text-red-400 text-sm font-semibold">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          <div className="flex justify-center gap-3 mt-5">
            <Button
              hierarchy="secondary"
              type="button"
              onClick={(_) => hideDialog(id)}
            >
              Cancelar
            </Button>
            <Button hierarchy="primary" type="submit">
              Cambiar clave
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePasswordDialog;
