import Link from "next/link";
import { Icon } from "@iconify/react";
import clsx from "clsx";
import type { ReactNode } from "react";

const topCardClass =
  "bg-white border border-[#E8EDF7] rounded-2xl shadow-[0_2px_12px_rgba(15,35,70,0.04)]";

const NAVY = "#1A2B5B";

interface Props {
  title: string;
  description?: string;
  backHref: string;
  backLabel?: string;
  breadcrumbCurrent: string;
  children: ReactNode;
  headerEnd?: ReactNode;
}

export default function AdministrationFormPageLayout({
  title,
  description,
  backHref,
  backLabel = "Volver",
  breadcrumbCurrent,
  children,
  headerEnd,
}: Props) {
  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col bg-[#F8FAFC]">
      <div className="w-full shrink-0 px-5 pt-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <section className={clsx(topCardClass, "px-5 py-5 sm:px-6 sm:py-6")}>
          <nav className="flex flex-wrap items-center gap-2 text-sm text-[#64748B]">
            <Link href="/admin" className="hover:underline">
              Inicio
            </Link>
            <Icon
              icon="tabler:chevron-right"
              className="text-base shrink-0 text-[#94A3B8]"
            />
            <Link href="/admin/administracion" className="hover:underline">
              Administración
            </Link>
            <Icon
              icon="tabler:chevron-right"
              className="text-base shrink-0 text-[#94A3B8]"
            />
            <span className="font-semibold" style={{ color: NAVY }}>
              {breadcrumbCurrent}
            </span>
          </nav>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="min-w-0 flex-1 space-y-1.5">
              <h1
                className="text-[24px] font-bold leading-tight tracking-tight sm:text-[26px]"
                style={{ color: NAVY }}
              >
                {title}
              </h1>
              {description ? (
                <p className="max-w-2xl text-[13px] leading-relaxed text-[#64748B] sm:text-sm">
                  {description}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Link
                href={backHref}
                className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#1A2B5B] shadow-sm transition hover:bg-[#F8FAFC]"
              >
                <Icon icon="tabler:arrow-left" className="text-lg" />
                {backLabel}
              </Link>
              {headerEnd}
            </div>
          </div>
        </section>
      </div>

      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col px-5 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8 xl:px-10 2xl:px-12">
        <div className="mx-auto w-full max-w-[900px]">{children}</div>
      </div>
    </div>
  );
}
