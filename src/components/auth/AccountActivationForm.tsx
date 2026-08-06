"use client";

import { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { toast } from "sonner";
import Button from "@/components/base/Button";
import AuthShell from "@/components/auth/AuthShell";
import { parseApiError } from "@/utils/parseApiError";
import {
  requestActivationCode,
  verifyActivationCode,
  completeActivation,
} from "@/lib/accountActivation.api";

type Step = "email" | "code" | "password" | "done";

interface Props {
  onBackToLogin: () => void;
}

const inputClassName =
  "w-full rounded-xl border border-[#D8E0EF] bg-[#F8FAFC] px-4 py-3.5 text-sm font-medium text-primary-900 placeholder:text-[#94A3B8] outline-none transition-all focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/15";

const stepCopy: Record<Step, { title: string; subtitle: string }> = {
  email: {
    title: "Activar cuenta",
    subtitle: "Ingresa el correo configurado al crear tu empresa.",
  },
  code: {
    title: "Verifica tu correo",
    subtitle: "Ingresa el código de 6 dígitos que enviamos a tu correo.",
  },
  password: {
    title: "Crea tu contraseña",
    subtitle: "Define la contraseña con la que iniciarás sesión.",
  },
  done: {
    title: "Cuenta activada",
    subtitle: "Tu cuenta ya está lista. Puedes iniciar sesión.",
  },
};

export default function AccountActivationForm({ onBackToLogin }: Props) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [shownPassword, setShownPassword] = useState(false);

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error("Ingresa el correo configurado al crear la empresa");
      return;
    }

    setLoading(true);
    const res = await requestActivationCode(trimmedEmail);
    setLoading(false);

    if (res.error) {
      toast.error(parseApiError(res.error));
      return;
    }

    toast.success(
      res.data?.message ??
        "Si el correo corresponde a una cuenta pendiente de activación, se envió un código."
    );
    setStep("code");
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    const trimmedCode = code.trim();
    if (trimmedCode.length !== 6 || !/^\d{6}$/.test(trimmedCode)) {
      toast.error("Ingresa el código de 6 dígitos que enviamos a tu correo");
      return;
    }

    setLoading(true);
    const res = await verifyActivationCode(email.trim(), trimmedCode);
    setLoading(false);

    if (res.error || !res.data?.valid) {
      toast.error(
        res.error ? parseApiError(res.error) : "Código inválido o expirado"
      );
      return;
    }

    setStep("password");
  }

  async function handleComplete(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    const res = await completeActivation(email.trim(), code.trim(), password);
    setLoading(false);

    if (res.error) {
      toast.error(parseApiError(res.error));
      return;
    }

    toast.success("Cuenta activada. Ya puedes iniciar sesión.");
    setStep("done");
  }

  const { title, subtitle } = stepCopy[step];

  return (
    <AuthShell title={title} subtitle={subtitle}>
      {step === "email" && (
        <form onSubmit={handleRequestCode} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="activation-email"
              className="text-xs font-semibold text-[#475569]"
            >
              Correo de la empresa
            </label>
            <input
              id="activation-email"
              placeholder="contacto@empresa.com"
              type="email"
              className={inputClassName}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <Button
            type="submit"
            hierarchy="primary"
            className="h-12 rounded-xl! bg-primary-900! text-white shadow-[0_10px_24px_rgba(0,11,80,0.22)]"
            loading={loading}
            disabled={loading}
          >
            Enviar código
          </Button>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={handleVerifyCode} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="activation-code"
              className="text-xs font-semibold text-[#475569]"
            >
              Código de verificación
            </label>
            <input
              id="activation-code"
              placeholder="000000"
              type="text"
              inputMode="numeric"
              maxLength={6}
              className={`${inputClassName} tracking-[0.35em]`}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              autoFocus
            />
          </div>
          <Button
            type="submit"
            hierarchy="primary"
            className="h-12 rounded-xl! bg-primary-900! text-white shadow-[0_10px_24px_rgba(0,11,80,0.22)]"
            loading={loading}
            disabled={loading}
          >
            Verificar código
          </Button>
          <button
            type="button"
            onClick={() => setStep("email")}
            className="text-sm font-medium text-[#64748B] transition-colors hover:text-primary-700"
          >
            ¿Correo incorrecto? Volver atrás
          </button>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={handleComplete} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="activation-password"
              className="text-xs font-semibold text-[#475569]"
            >
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                id="activation-password"
                placeholder="Mínimo 8 caracteres"
                type={shownPassword ? "text" : "password"}
                className={`${inputClassName} pr-12`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShownPassword(!shownPassword)}
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
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="activation-confirm"
              className="text-xs font-semibold text-[#475569]"
            >
              Confirmar contraseña
            </label>
            <input
              id="activation-confirm"
              placeholder="Repite tu contraseña"
              type={shownPassword ? "text" : "password"}
              className={inputClassName}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            hierarchy="primary"
            className="h-12 rounded-xl! bg-primary-900! text-white shadow-[0_10px_24px_rgba(0,11,80,0.22)]"
            loading={loading}
            disabled={loading}
          >
            Activar cuenta
          </Button>
        </form>
      )}

      {step === "done" && (
        <Button
          type="button"
          hierarchy="primary"
          className="h-12 w-full rounded-xl! bg-primary-900! text-white shadow-[0_10px_24px_rgba(0,11,80,0.22)]"
          onClick={onBackToLogin}
        >
          Ir a iniciar sesión
        </Button>
      )}

      {step !== "done" && (
        <button
          type="button"
          onClick={onBackToLogin}
          className="mt-6 flex w-full items-center justify-center gap-2 text-sm font-medium text-[#64748B] transition-colors hover:text-primary-700"
        >
          <Icon icon="tabler:arrow-left" className="text-base" />
          Volver al inicio de sesión
        </button>
      )}
    </AuthShell>
  );
}
