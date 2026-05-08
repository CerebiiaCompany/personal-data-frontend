"use client";

import Button from "@/components/base/Button";
import DataOfficerCard from "@/components/administration/DataOfficerCard";
import EditOwnCompanyDialog from "@/components/dialogs/EditOwnCompanyDialog";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { useOwnCompany } from "@/hooks/useOwnCompany";
import { showDialog } from "@/utils/dialogs.utils";
import { Icon } from "@iconify/react";
import Link from "next/link";
import clsx from "clsx";

const topCardClass =
  "bg-white border border-[#E8EDF7] rounded-2xl shadow-[0_2px_12px_rgba(15,35,70,0.04)]";

export default function AdministrationPage() {
  const { data, loading, error, refresh } = useOwnCompany();
  const quickAccessCards = [
    {
      title: "Usuarios",
      description: "Gestiona los usuarios de la compañía y sus accesos.",
      href: "/admin/administracion/usuarios",
      icon: "tabler:users-group",
    },
    {
      title: "Áreas",
      description: "Administra áreas organizacionales y su estructura.",
      href: "/admin/administracion/areas",
      icon: "tabler:building-community",
    },
    {
      title: "Roles",
      description: "Configura roles y permisos por módulo.",
      href: "/admin/administracion/roles",
      icon: "tabler:shield-lock",
    },
  ];

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col bg-[#F8FAFC]">
      <EditOwnCompanyDialog company={data} onUpdated={refresh} />
      <div className="w-full px-5 pt-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <section className={clsx(topCardClass, "px-5 py-5 sm:px-6 sm:py-6")}>
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
            <div className="min-w-0 flex-1 space-y-2">
              <nav className="flex flex-wrap items-center gap-2 text-sm text-[#64748B]">
                <Link href="/admin" className="hover:underline">
                  Inicio
                </Link>
                <Icon
                  icon="tabler:chevron-right"
                  className="text-base shrink-0 text-[#94A3B8]"
                />
                <span className="font-semibold text-[#1A2B5B]">Administración</span>
              </nav>
              <h1 className="text-[26px] font-bold leading-tight tracking-tight text-[#1A2B5B] sm:text-[28px]">
                Administración
              </h1>
              <p className="max-w-2xl text-[13px] leading-relaxed text-[#64748B] sm:text-sm">
                Centraliza la configuración de tu compañía, usuarios, áreas y
                roles desde un solo lugar.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pt-1">
              <Button
                type="button"
                href="/admin/administracion/perfil-empresa"
                className="rounded-xl! border-[#1A2B5B]! bg-[#1A2B5B]! px-5! py-2.5! text-[13px]! font-semibold! text-white!"
                startContent={
                  <Icon icon="tabler:building-community" className="text-lg" />
                }
              >
                Perfil de empresa
              </Button>
              <Button
                type="button"
                onClick={() => showDialog(HTML_IDS_DATA.editOwnCompanyDialog)}
                className="rounded-xl! px-5! py-2.5! text-[13px]! font-semibold!"
                hierarchy="secondary"
                startContent={
                  <Icon icon="material-symbols:edit-outline" className="text-lg" />
                }
              >
                Editar básico
              </Button>
            </div>
          </header>
        </section>
      </div>

      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col px-5 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8 xl:px-10 2xl:px-12">
        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-6 md:gap-8">
          <section className="rounded-2xl border border-[#E8EDF7] bg-white p-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:p-6">
            <h2 className="mb-4 text-[16px] font-bold text-[#1A2B5B]">
              Información de la compañía
            </h2>
            {loading ? (
              <div className="text-sm text-[#64748B]">Cargando información...</div>
            ) : error ? (
              <div className="text-sm text-red-600">{error}</div>
            ) : data ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-[#EAF0FA] bg-[#FAFCFF] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
                    Compañía
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#0B1737] break-words">
                    {data.name}
                  </p>
                </div>
                <div className="rounded-xl border border-[#EAF0FA] bg-[#FAFCFF] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
                    NIT
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#0B1737] break-words">
                    {data.nit}
                  </p>
                </div>
                <div className="rounded-xl border border-[#EAF0FA] bg-[#FAFCFF] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
                    Correo
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#0B1737] break-words">
                    {data.email}
                  </p>
                </div>
                <div className="rounded-xl border border-[#EAF0FA] bg-[#FAFCFF] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
                    Teléfono
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#0B1737] break-words">
                    {data.phone}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-sm text-[#64748B]">Sin información disponible.</div>
            )}
          </section>

          <DataOfficerCard />

          <section className="rounded-2xl border border-[#E8EDF7] bg-white p-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:p-6">
            <h2 className="mb-4 text-[16px] font-bold text-[#1A2B5B]">
              Accesos rápidos
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {quickAccessCards.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group rounded-xl border border-[#EAF0FA] bg-[#FAFCFF] p-4 transition hover:border-[#CFDBF2] hover:bg-white"
                >
                  <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E3EAF8] bg-white text-[#3357A5]">
                    <Icon icon={card.icon} className="text-lg" />
                  </span>
                  <p className="text-[15px] font-bold text-[#0B1737]">
                    {card.title}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#64748B]">
                    {card.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
