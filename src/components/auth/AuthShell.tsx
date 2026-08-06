"use client";

import Image from "next/image";
import { Icon } from "@iconify/react/dist/iconify.js";
import LogoSquaredLight from "@public/logo-squared-light.svg";

interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const FEATURES = [
  {
    icon: "tabler:shield-lock",
    title: "Cumplimiento normativo",
    description: "Gestiona tratamientos y consentimientos con trazabilidad.",
  },
  {
    icon: "tabler:file-check",
    title: "Derechos ARCO claros",
    description: "Atiende solicitudes de titulares de forma ordenada.",
  },
  {
    icon: "tabler:building",
    title: "Control empresarial",
    description: "Administra usuarios, roles y perfil de tu organización.",
  },
] as const;

/**
 * Layout split-screen para autenticación:
 * panel de marca a la izquierda + formulario en tarjeta blanca a la derecha.
 */
export default function AuthShell({ title, subtitle, children }: Props) {
  return (
    <div className="auth-shell flex min-h-0 w-full flex-1 flex-col lg:flex-row">
      {/* Panel de marca */}
      <aside className="relative flex min-h-[280px] flex-col justify-between overflow-hidden bg-gradient-to-b from-primary-500 via-primary-700 to-primary-900 px-8 py-8 text-white sm:px-10 lg:min-h-0 lg:w-[46%] lg:px-12 lg:py-12 xl:w-[48%] xl:px-14">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="auth-shell-orb auth-shell-orb--a absolute -top-16 -left-10 size-56 rounded-full bg-white/10 blur-2xl" />
          <div className="auth-shell-orb auth-shell-orb--b absolute top-1/3 -right-20 size-72 rounded-full bg-primary-300/20 blur-3xl" />
          <div className="absolute -bottom-24 left-1/4 size-80 rounded-full border border-white/10" />
          <div className="absolute top-24 right-16 size-28 rounded-3xl border border-white/10 rotate-12" />
          <div className="absolute bottom-32 left-10 size-16 rounded-full border border-white/10" />
        </div>

        <div className="relative z-10 flex flex-col gap-8">
          <div className="auth-shell-brand flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-content-center rounded-xl bg-white/10 ring-1 ring-white/20">
                <Image
                  src={LogoSquaredLight}
                  alt="Cerebiia"
                  width={28}
                  height={28}
                  className="h-auto"
                  priority
                  loading="eager"
                />
              </div>
              <div className="leading-tight">
                <p className="text-lg font-bold tracking-tight">Cerebiia</p>
                <p className="text-xs font-medium text-white/70">Data</p>
              </div>
            </div>
            <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium text-white/90 ring-1 ring-white/20">
              Plataforma de protección de datos
            </span>
          </div>

          <div className="max-w-md space-y-3">
            <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.6rem]">
              Tus datos, bajo control.
            </h2>
            <p className="text-sm leading-relaxed text-white/75 sm:text-[15px]">
              Centraliza consentimientos, tratamientos y derechos de los
              titulares en una sola plataforma pensada para tu empresa.
            </p>
          </div>

          <ul className="hidden flex-col gap-4 sm:flex">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-9 shrink-0 place-content-center rounded-xl bg-white/12 ring-1 ring-white/15">
                  <Icon icon={feature.icon} className="text-lg text-white" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{feature.title}</p>
                  <p className="text-xs leading-relaxed text-white/65">
                    {feature.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 mt-8 text-xs text-white/45 lg:mt-0">
          © {new Date().getFullYear()} Cerebiia — Todos los derechos reservados.
        </p>
      </aside>

      {/* Panel del formulario */}
      <section className="relative flex flex-1 items-center justify-center bg-[#F4F7FB] px-4 py-10 sm:px-8 lg:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.35]"
        >
          <div className="absolute top-16 left-10 size-24 rotate-12 border border-[#C9D6EA]" />
          <div className="absolute top-28 left-20 size-16 rounded-full border border-[#C9D6EA]" />
          <div className="absolute right-16 bottom-24 size-20 rotate-45 border border-[#C9D6EA]" />
          <div className="absolute right-28 top-20 size-14 rounded-lg border border-[#C9D6EA]" />
          <div className="absolute bottom-36 left-1/3 size-10 rounded-full border border-[#C9D6EA]" />
        </div>

        <div className="auth-shell-card relative z-10 w-full max-w-[420px] rounded-2xl border border-[#E4EAF6] bg-white px-7 py-9 shadow-[0_18px_50px_rgba(15,35,70,0.08)] sm:px-9 sm:py-10">
          <div className="mb-7 flex flex-col gap-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-primary-900">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm leading-relaxed text-[#64748B]">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}
