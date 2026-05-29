"use client";

import Image from "next/image";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";
import LogoCerebiia from "@public/logo.svg";

type ConsentState = "success" | "already";

/**
 * El backend redirige aquí tras un consentimiento "de un clic"
 * (GET /public/quick-consent). Puede pasar opcionalmente:
 *   - status / estado: "already" si la persona ya había aceptado.
 *   - company / empresa: nombre de la empresa para personalizar el mensaje.
 */
function resolveState(raw: string | null): ConsentState {
  if (!raw) return "success";
  const value = raw.toLowerCase();
  if (["already", "already_registered", "registrado", "duplicado"].includes(value)) {
    return "already";
  }
  return "success";
}

function ConsentConfirmedContent() {
  const searchParams = useSearchParams();
  const state = resolveState(
    searchParams.get("status") ?? searchParams.get("estado")
  );
  const company =
    searchParams.get("company") ?? searchParams.get("empresa") ?? null;

  const content =
    state === "already"
      ? {
          icon: "tabler:circle-check",
          iconWrapper: "bg-blue-100",
          iconColor: "text-blue-600",
          title: "Ya habías confirmado tu consentimiento",
          message:
            "Tu autorización para el tratamiento de datos ya estaba registrada. No necesitas hacer nada más.",
        }
      : {
          icon: "tabler:circle-check",
          iconWrapper: "bg-green-100",
          iconColor: "text-green-600",
          title: "¡Consentimiento confirmado!",
          message: company
            ? `Gracias. Tu autorización para el tratamiento de datos con ${company} quedó registrada correctamente.`
            : "Gracias. Tu autorización para el tratamiento de datos quedó registrada correctamente.",
        };

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-5 px-4 py-10 text-center">
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full ${content.iconWrapper}`}
      >
        <Icon icon={content.icon} className={`text-4xl ${content.iconColor}`} />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-[#0B1737]">{content.title}</h2>
        <p className="text-sm leading-relaxed text-[#64748B]">
          {content.message}
        </p>
      </div>
      <p className="mt-2 text-xs text-[#94A3B8]">
        Ya puedes cerrar esta ventana.
      </p>
    </div>
  );
}

export default function ConsentConfirmedPage() {
  return (
    <div className="flex-1 flex flex-col gap-8">
      <header className="w-full h-16 bg-primary-50 rounded-b-xl shadow-md border border-stone-100 flex items-center justify-between p-3">
        <Image
          src={LogoCerebiia}
          width={200}
          alt="Logo de Plataforma de Datos de Cerebiia"
          priority
          className="h-full w-auto"
        />
      </header>

      <div className="flex justify-center pb-10 px-4">
        <Suspense
          fallback={
            <div className="flex w-full max-w-md flex-col items-center gap-5 px-4 py-10 text-center">
              <div className="h-16 w-16 animate-pulse rounded-full bg-stone-100" />
            </div>
          }
        >
          <ConsentConfirmedContent />
        </Suspense>
      </div>
    </div>
  );
}
