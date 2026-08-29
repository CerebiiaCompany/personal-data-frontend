"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Button from "@/components/base/Button";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Suspense, useEffect, useState } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { getSession, loginUser, getPermissions } from "@/lib/auth.api";
import { UserPermissionsResponse } from "@/types/user.types";
import { parseApiError } from "@/utils/parseApiError";
import AccountActivationForm from "@/components/auth/AccountActivationForm";
import AuthShell from "@/components/auth/AuthShell";

const schema = z.object({
  username: z.string().min(1, "Ingresa tu usuario"),
  password: z.string().min(1, "Ingresa tu clave"),
  tyc: z.boolean().refine((val) => val === true, {
    error: "Debes aceptar los términos y condiciones",
  }),
});

const inputClassName =
  "w-full rounded-xl border border-[#D8E0EF] bg-[#F8FAFC] px-4 py-3.5 pl-11 text-sm font-medium text-primary-900 placeholder:text-[#94A3B8] outline-none transition-all focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/15";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callback_url");

  const router = useRouter();
  const { loading, setUser, setError, setLoading, setPermissions } =
    useSessionStore();
  const [shownPassword, setShownPassword] = useState<boolean>(false);
  const [mode, setMode] = useState<"login" | "activate">("login");

  useEffect(() => {
    setError(undefined);
  }, [setError]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      password: "",
      tyc: false,
    },
  });

  // Item CHK-127 (sprint pre go-live 2026-08-28): extraído de onSubmit para
  // reutilizarlo tras la activación de cuenta (AccountActivationForm) — el
  // usuario recién activado ya tiene username+password válidos (los acaba
  // de definir), así que "auto-login" es simplemente ejecutar este mismo
  // flujo de login normal en vez de mandarlo a /login a escribirlos de
  // nuevo. Devuelve `true` si el login+redirect fue exitoso.
  async function performLogin(
    username: string,
    password: string,
    options?: { successMessage?: (name?: string) => string }
  ): Promise<boolean> {
    setLoading(true);
    setError(undefined);

    const loginRes = await loginUser(username, password);

    if (loginRes.error) {
      const parsedError = parseApiError(loginRes.error);
      setError(parsedError);
      setLoading(false);
      toast.error(parsedError);
      return false;
    }

    const session = await getSession();

    if (session.error) {
      const parsedError = parseApiError(session.error);
      setError(parsedError);
      setLoading(false);
      toast.error(parsedError);
      return false;
    }

    setUser(session.data);

    const permissionsRes = await getPermissions();

    if (permissionsRes.error) {
      console.error("Error al obtener permisos:", permissionsRes.error);
      toast.warning("No se pudieron cargar los permisos del usuario");
    } else if (permissionsRes.data) {
      const raw = (permissionsRes.data as UserPermissionsResponse)
        .permissions as any;

      const normalizedPermissions = (() => {
        if (!raw) return permissionsRes.data.permissions;
        if (raw._doc) return raw._doc;
        if (raw.$__parent?.permissions) return raw.$__parent.permissions;
        return raw;
      })();

      setPermissions({
        ...(permissionsRes.data as UserPermissionsResponse),
        permissions: normalizedPermissions,
      });
    }

    setLoading(false);
    const successMessage = options?.successMessage
      ? options.successMessage(session.data?.name)
      : `Bienvenid@ ${session.data?.name}`;
    toast.success(successMessage);

    let redirectUrl: string;
    const userRole = session.data?.role || "USER";

    if (callbackUrl) {
      if (callbackUrl.includes("/superadmin")) {
        redirectUrl = userRole === "SUPERADMIN" ? callbackUrl : "/admin";
      } else if (callbackUrl.includes("/admin")) {
        redirectUrl = ["SUPERADMIN", "COMPANY_ADMIN"].includes(userRole)
          ? callbackUrl
          : "/admin";
      } else {
        redirectUrl = callbackUrl;
      }
    } else {
      redirectUrl = userRole === "SUPERADMIN" ? "/superadmin" : "/admin";
    }

    router.push(redirectUrl);
    return true;
  }

  async function onSubmit(data: any) {
    await performLogin(data.username, data.password);
  }

  // Item CHK-127: tras completar la activación (email + password ya
  // definidos por el propio usuario en ese formulario), inicia sesión
  // automáticamente y lo lleva a /admin — InitialSetupGate.tsx (montado en
  // (navbar)/layout.tsx) ya intercepta ahí y muestra ONB-01 si
  // initialSetupCompletedAt es null (CHK-128, ya implementado).
  async function handleActivationLogin(username: string, password: string) {
    return performLogin(username, password, {
      successMessage: () => "Cuenta activada. Iniciando sesión...",
    });
  }

  if (mode === "activate") {
    return (
      <AccountActivationForm
        onBackToLogin={() => setMode("login")}
        onActivated={handleActivationLogin}
      />
    );
  }

  return (
    <AuthShell
      title="Bienvenido de nuevo"
      subtitle="Ingresa con tu usuario y contraseña."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="username"
            className="text-xs font-semibold text-[#475569]"
          >
            Usuario
          </label>
          <div className="relative">
            <Icon
              icon="tabler:user"
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-lg text-[#94A3B8]"
            />
            <input
              id="username"
              placeholder="Tu usuario"
              type="text"
              autoComplete="username"
              className={inputClassName}
              {...register("username")}
            />
          </div>
          {errors.username && (
            <span className="text-sm font-medium text-red-500">
              {errors.username.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-xs font-semibold text-[#475569]"
          >
            Contraseña
          </label>
          <div className="relative">
            <Icon
              icon="tabler:lock"
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-lg text-[#94A3B8]"
            />
            <input
              id="password"
              placeholder="Tu contraseña"
              type={shownPassword ? "text" : "password"}
              autoComplete="current-password"
              className={`${inputClassName} pr-12`}
              {...register("password")}
            />
            <button
              onClick={() => setShownPassword(!shownPassword)}
              type="button"
              aria-label={
                shownPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              className="absolute top-1/2 right-2.5 grid size-9 -translate-y-1/2 place-content-center rounded-lg text-[#94A3B8] transition-colors hover:bg-[#EEF2F8] hover:text-primary-700"
            >
              <Icon
                icon={shownPassword ? "tabler:eye" : "tabler:eye-closed"}
                className="text-xl"
              />
            </button>
          </div>
          {errors.password && (
            <span className="text-sm font-medium text-red-500">
              {errors.password.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="custom-checkbox">
            <input
              {...register("tyc")}
              className="peer hidden"
              type="checkbox"
            />
            <div className="checkbox-visual peer-checked:bg-primary-900! after:border-white! peer-checked:border-primary-900!"></div>
            <span className="text-sm! text-[#475569]">
              Acepto los términos y condiciones
            </span>
          </label>
          {errors.tyc && (
            <span className="text-sm font-medium text-red-500">
              {errors.tyc.message}
            </span>
          )}
        </div>

        <Button
          type="submit"
          hierarchy="primary"
          className="mt-1 h-12 rounded-xl! bg-primary-900! text-white shadow-[0_10px_24px_rgba(0,11,80,0.22)] transition-transform hover:scale-[1.01] hover:bg-primary-700! active:scale-[0.99]"
          loading={isSubmitting || loading}
          disabled={isSubmitting || loading}
        >
          Ingresar
        </Button>

        <button
          type="button"
          onClick={() => setMode("activate")}
          className="inline-flex items-center justify-center gap-2 pt-1 text-sm font-medium text-primary-700 transition-colors hover:text-primary-500"
        >
          <Icon icon="tabler:key" className="text-base" />
          ¿Primera vez? Activar cuenta
        </button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthShell title="Bienvenido de nuevo" subtitle="Cargando…">
          <div className="flex flex-col gap-4">
            <div className="h-12 animate-pulse rounded-xl bg-[#EEF2F8]" />
            <div className="h-12 animate-pulse rounded-xl bg-[#EEF2F8]" />
            <div className="mt-2 h-12 animate-pulse rounded-xl bg-[#E2E8F0]" />
          </div>
        </AuthShell>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
