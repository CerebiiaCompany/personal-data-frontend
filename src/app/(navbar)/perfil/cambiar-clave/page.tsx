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
            <CustomInput
              {...register("password")}
              placeholder="Escribe tu nueva clave"
              error={errors.password}
            />
            <CustomInput
              {...register("confirmPassword")}
              placeholder="Confirma tu nueva clave"
              error={errors.confirmPassword}
            />

            <div className="flex justify-center gap-3 mt-5">
              <Button hierarchy="primary" type="submit">
                Cambiar clave
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
