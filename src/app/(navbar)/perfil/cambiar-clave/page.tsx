"use client";

import Button from "@/components/base/Button";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { updatePassword } from "@/lib/auth.api";
import { useSessionStore } from "@/store/useSessionStore";
import { parseUserRoleToString } from "@/types/user.types";
import { hideDialog, showDialog } from "@/utils/dialogs.utils";
import { parseApiError } from "@/utils/parseApiError";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import SquareLogo from "@public/logo-collapsed.svg";
import CustomInput from "@/components/forms/CustomInput";

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

export default function ProfileUpdatePasswordPage() {
  const user = useSessionStore((store) => store.user);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const router = useRouter();

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
      setLoading(false);
      return toast.error(parseApiError(loginRes.error));
    }

    /* const session = await getSession();

    setUser(session.data); */

    toast.success(`Clave actualizada`);
    router.push("/perfil");
  }

  return (
    <div className="flex-1 flex h-full flex-col gap-3 max-h-full overflow-y-auto">
      <h6 className="font-bold text-xl text-primary-900 mb-2">Cambiar Clave</h6>

      {user && (
        <div className="flex flex-col items-center justify-center h-full">
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
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
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
                    showConfirmPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                  title={
                    showConfirmPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
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
                hierarchy="primary"
                type="submit"
                loading={loading}
                disabled={loading}
              >
                Cambiar clave
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
