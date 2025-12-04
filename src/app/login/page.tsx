"use client";

import Image from "next/image";
import LogoSquaredLight from "@public/logo-squared-light.svg";
import CustomInput from "@/components/forms/CustomInput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Button from "@/components/base/Button";
import CustomCheckbox from "@/components/forms/CustomCheckbox";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Suspense, useEffect, useState } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { getSession, loginUser } from "@/lib/auth.api";
import { parseApiError } from "@/utils/parseApiError";

const schema = z.object({
  username: z.string().min(1, "Ingresa tu usuario"),
  password: z.string().min(1, "Ingresa tu clave"),
  tyc: z.boolean().refine((val) => val === true, {
    error: "Debes aceptar los términos y condiciones",
  }),
});

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callback_url");

  const router = useRouter();
  const { user, loading, error, setUser, setError, setLoading } =
    useSessionStore();
  const [shownPassword, setShownPassword] = useState<boolean>(false);

  // Limpiar errores cuando se monta el componente de login
  useEffect(() => {
    setError(undefined);
  }, [setError]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      password: "",
      tyc: false,
    },
  });

  async function onSubmit(data: any) {
    setLoading(true);
    setError(undefined); // Limpiar errores previos

    const loginRes = await loginUser(data.username, data.password);

    if (loginRes.error) {
      const parsedError = parseApiError(loginRes.error);
      setError(parsedError);
      setLoading(false);
      return toast.error(parsedError);
    }

    const session = await getSession();

    setUser(session.data);
    setLoading(false); // ✅ Importante: desactivar loading después del login exitoso
    toast.success(`Bienvenid@ ${session.data?.name}`);

    // Redirigir solo después de login exitoso
    router.push(
      callbackUrl || session.data?.role === "SUPERADMIN"
        ? "/superadmin"
        : "/admin"
    );
  }

  return (
    <div className="flex flex-col p-8 bg-[linear-gradient(180deg,#301AAC_0.96%,#150668_48.56%,#030014_100%)] w-full flex-1 justify-center items-center">
      <div className="w-full max-w-md bg-white/20 px-12 py-20 rounded-xl flex flex-col gap-10">
        <div className="flex flex-col items-center gap-3">
          <Image
            src={LogoSquaredLight}
            alt="Logo cerebiia cuadrado"
            width={75}
            className="h-auto"
          />
          <h6 className="font-bold text-lg text-white">Iniciar Sesión</h6>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="flex flex-col items-left w-full gap-1">
            <input
              placeholder="Usuario"
              type="text"
              className="px-5 text-white font-medium py-3 bg-white/30 rounded-lg placeholder:text-white/80"
              {...register("username")}
            />
            {errors.username && (
              <span className="text-red-400 text-sm font-semibold">
                {errors.username.message}
              </span>
            )}
          </div>
          <div className="flex flex-col items-left w-full gap-1">
            <div className="w-full flex items-center gap-2">
              <input
                placeholder="Clave"
                type={shownPassword ? "text" : "password"}
                className="px-5 flex-1 min-w-0 text-white font-medium py-3 bg-white/30 rounded-lg placeholder:text-white/80"
                {...register("password")}
              />

              <button
                onClick={(_) => setShownPassword(!shownPassword)}
                type="button"
                className="h-11 w-11 bg-white/30 rounded-lg grid place-content-center flex-shrink-0"
              >
                <Icon
                  icon={shownPassword ? "tabler:eye" : "tabler:eye-closed"}
                  className="text-2xl text-white"
                />
              </button>
            </div>
            {errors.password && (
              <span className="text-red-400 text-sm font-semibold">
                {errors.password.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1 items-start">
            {/* <CustomCheckbox
              {...register("tyc")}
              className="text-white"
              label="Acepto los términos y condiciones"
            /> */}
            <label className={"custom-checkbox"}>
              <input
                {...register("tyc")}
                className="peer hidden"
                type="checkbox"
              />
              <div className="checkbox-visual peer-checked:bg-white! after:border-primary-900! peer-checked:border-white!"></div>
              <span className="text-white text-sm!">
                Acepto los términos y condiciones
              </span>
            </label>
            {errors.tyc && (
              <span className="text-red-400 text-sm font-semibold">
                {errors.tyc.message}
              </span>
            )}
          </div>

          <Button
            type="submit"
            hierarchy="secondary"
            className="bg-white text-primary-900 mt-5"
            loading={isSubmitting || loading}
            disabled={isSubmitting || loading}
          >
            Ingresar
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col p-8 bg-[linear-gradient(180deg,#301AAC_0.96%,#150668_48.56%,#030014_100%)] w-full flex-1 justify-center items-center">
          <div className="w-full max-w-md bg-white/20 px-12 py-20 rounded-xl flex flex-col gap-10">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-pulse bg-white/30 rounded-lg h-20 w-20"></div>
              <div className="animate-pulse bg-white/30 rounded h-6 w-32"></div>
            </div>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
