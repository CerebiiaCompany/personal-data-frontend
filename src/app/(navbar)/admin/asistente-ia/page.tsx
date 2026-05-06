"use client";

import { Icon } from "@iconify/react";
import clsx from "clsx";

const conversations = [
  { title: "Política tratamiento - retail", date: "Hoy" },
  { title: "Autorización imagen marketing", date: "Ayer" },
  { title: "Consentimiento WhatsApp B2C", date: "Hace 3 días" },
];

const templates = [
  {
    title: "Política de tratamiento de datos",
    description:
      "Genera una política de tratamiento de datos personales conforme a la ley 1581 de 2012.",
    icon: "tabler:shield-lock",
    iconClass: "bg-[#1D4ED8]",
  },
  {
    title: "Autorización de uso de imagen",
    description:
      "Crea una autorización de uso de imagen y video para campañas de marketing digital.",
    icon: "tabler:camera",
    iconClass: "bg-[#C026D3]",
  },
  {
    title: "Consentimiento marketing",
    description:
      "Redacta un consentimiento de marketing digital para sitio web, SMS, email y WhatsApp.",
    icon: "tabler:message-dots",
    iconClass: "bg-[#059669]",
  },
  {
    title: "Aviso de privacidad corto",
    description:
      "Genera un aviso de privacidad resumido para mostrar en formularios de captura.",
    icon: "tabler:file-text",
    iconClass: "bg-[#EA580C]",
  },
];

export default function AsistenteIAPage() {
  return (
    <div className="flex min-h-0 w-full flex-1 bg-[#F8FAFC]">
      <aside className="hidden w-[300px] shrink-0 border-r border-[#E8EDF5] bg-white px-5 py-5 lg:flex lg:flex-col">
        <button
          type="button"
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#173D86] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
        >
          <Icon icon="tabler:plus" className="text-base" />
          Nueva conversación
        </button>

        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
          Historial
        </p>

        <ul className="flex flex-col gap-2">
          {conversations.map((item) => (
            <li key={item.title}>
              <button
                type="button"
                className="w-full rounded-lg px-2.5 py-2 text-left transition hover:bg-[#F1F5FF]"
              >
                <p className="line-clamp-1 text-[13px] font-semibold text-[#0F172A]">
                  {item.title}
                </p>
                <p className="mt-0.5 text-[11px] text-[#94A3B8]">{item.date}</p>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="flex min-h-0 flex-1 flex-col px-5 py-5 md:px-8">
        <div className="mx-auto w-full max-w-[980px]">
          <nav className="mb-1 flex flex-wrap items-center gap-2 text-xs text-[#94A3B8]">
            <span>Inicio</span>
            <Icon icon="tabler:chevron-right" className="text-sm" />
            <span className="font-semibold text-[#64748B]">Asistente IA</span>
          </nav>

          <h1 className="text-[28px] font-bold leading-tight tracking-tight text-[#0B1737]">
            Asistente IA · Plantillas legales
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Genera políticas, autorizaciones y consentimientos conformes a la
            Ley 1581 de 2012.
          </p>
        </div>

        <div className="mx-auto mt-8 flex w-full max-w-[980px] flex-1 flex-col items-center justify-center pb-8">
          <div className="mb-5 grid h-12 w-12 place-content-center rounded-xl bg-[linear-gradient(180deg,#1D4ED8_0%,#173D86_100%)] text-white shadow-sm">
            <Icon icon="tabler:sparkles" className="text-2xl" />
          </div>

          <h2 className="text-center text-[30px] font-bold leading-tight text-[#0B1737]">
            ¿Qué plantilla necesitas hoy?
          </h2>
          <p className="mt-2 text-center text-sm text-[#64748B]">
            Describe lo que necesitas y la IA generará una plantilla legal lista
            para usar.
          </p>

          <div className="mt-6 grid w-full grid-cols-1 gap-3 md:grid-cols-2">
            {templates.map((template) => (
              <button
                key={template.title}
                type="button"
                className="flex min-h-[112px] flex-col items-start rounded-xl border border-[#E8EDF5] bg-white p-4 text-left shadow-sm transition hover:border-[#CBD7EE]"
              >
                <div
                  className={clsx(
                    "mb-3 grid h-7 w-7 place-content-center rounded-md text-white",
                    template.iconClass
                  )}
                >
                  <Icon icon={template.icon} className="text-sm" />
                </div>
                <p className="text-[14px] font-semibold text-[#0F172A]">
                  {template.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#64748B]">
                  {template.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-[980px]">
          <div className="flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-4 py-2.5 shadow-sm">
            <input
              type="text"
              disabled
              placeholder="Describe la plantilla que necesitas..."
              className="w-full bg-transparent text-sm text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
            />
            <button
              type="button"
              className="grid h-8 w-8 place-content-center rounded-full bg-[#E2E8F0] text-[#94A3B8]"
            >
              <Icon icon="tabler:send" className="text-sm" />
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-[#94A3B8]">
            La IA puede cometer errores. Revisa siempre la plantilla antes de
            usarla.
          </p>
        </div>
      </section>
    </div>
  );
}
