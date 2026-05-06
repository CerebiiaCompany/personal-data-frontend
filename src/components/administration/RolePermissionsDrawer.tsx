"use client";

import type { CompanyRole } from "@/types/companyRole.types";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect } from "react";
import clsx from "clsx";
import {
  ACTION_SHORT_LABELS,
  formatRelativeEs,
  ROLE_MODULE_ORDER,
  ROLE_MODULE_TITLES,
  summarizeRolePermissions,
} from "@/utils/companyRolePermissions.utils";

const ACTION_ORDER = ["view", "create", "edit", "delete", "send"] as const;

interface Props {
  role: CompanyRole | null;
  open: boolean;
  onClose: () => void;
  userCount: number;
}

export default function RolePermissionsDrawer({
  role,
  open,
  onClose,
  userCount,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || !role) return null;

  const summary = summarizeRolePermissions(role.permissions);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] transition-opacity"
        aria-label="Cerrar panel"
        onClick={onClose}
      />
      <aside
        className="relative flex h-full w-full max-w-lg flex-col border-l border-[#E8EDF7] bg-white shadow-2xl"
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <header className="shrink-0 border-b border-[#EEF2F8] px-5 pb-5 pt-6 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                <Icon icon="tabler:shield-check" className="text-2xl" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-sans text-xl font-bold leading-snug text-[#1A2B5B] sm:text-2xl">
                  {role.position}
                </h2>
                <p className="mt-1 text-xs text-[#64748B]">
                  Actualizado {formatRelativeEs(role.updatedAt)}
                  {userCount > 0 ? (
                    <>
                      {" "}
                      · {userCount} usuario{userCount === 1 ? "" : "s"}
                    </>
                  ) : null}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#475569]">
                  {role.description}
                </p>
              </div>
            </div>
          </header>

          <div className="shrink-0 px-5 py-4 sm:px-6">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-[#E8EDF7] bg-[#FAFBFF] px-3 py-2.5 text-center">
                <p className="text-lg font-semibold tabular-nums text-[#1A2B5B]">
                  {summary.modulesWithAccess}
                </p>
                <p className="text-[10px] font-medium uppercase tracking-wide text-[#64748B]">
                  Módulos
                </p>
              </div>
              <div className="rounded-xl border border-[#E8EDF7] bg-[#FAFBFF] px-3 py-2.5 text-center">
                <p className="text-lg font-semibold tabular-nums text-[#1A2B5B]">
                  {summary.active}/{summary.total}
                </p>
                <p className="text-[10px] font-medium uppercase tracking-wide text-[#64748B]">
                  Permisos
                </p>
              </div>
              <div className="rounded-xl border border-[#E8EDF7] bg-[#FAFBFF] px-3 py-2.5 text-center">
                <p className="text-lg font-semibold tabular-nums text-primary-700">
                  {summary.percent}%
                </p>
                <p className="text-[10px] font-medium uppercase tracking-wide text-[#64748B]">
                  Cobertura
                </p>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 px-5 pb-6 sm:px-6">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Permisos por módulo
            </h3>
            <ul className="flex flex-col gap-4">
              {ROLE_MODULE_ORDER.map((moduleKey) => {
                const block = role.permissions[moduleKey] as Record<
                  string,
                  boolean
                >;
                const entries = ACTION_ORDER.filter((k) => k in block).map(
                  (k) => [k, block[k]] as const
                );
                const active = entries.filter(([, v]) => v).length;
                const total = entries.length;

                return (
                  <li
                    key={moduleKey}
                    className="rounded-xl border border-[#E8EDF7] bg-[#FAFBFF] p-3 sm:p-4"
                  >
                    <div className="mb-2.5 flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-[#1A2B5B]">
                        {ROLE_MODULE_TITLES[moduleKey]}
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-[#64748B]">
                        {active}/{total}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {entries.map(([action, on]) => {
                        const label =
                          ACTION_SHORT_LABELS[action] ?? action;
                        return (
                          <span
                            key={action}
                            className={clsx(
                              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
                              on
                                ? "border-primary-500/30 bg-primary-50 text-primary-900"
                                : "border-slate-200 bg-white text-slate-400"
                            )}
                          >
                            {on ? (
                              <Icon
                                icon="tabler:check"
                                className="text-sm text-primary-600"
                              />
                            ) : (
                              <Icon
                                icon="tabler:minus"
                                className="text-sm text-slate-300"
                              />
                            )}
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <footer className="shrink-0 border-t border-[#EEF2F8] bg-white px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="order-2 rounded-xl border border-[#E4EAF6] bg-white px-4 py-2.5 text-sm font-semibold text-[#475569] hover:bg-slate-50 sm:order-1"
            >
              Cerrar
            </button>
            <Link
              href={`/admin/administracion/roles/${role._id}`}
              onClick={onClose}
              className="order-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 sm:order-2"
            >
              <Icon icon="tabler:pencil" className="text-lg" />
              Editar permisos
            </Link>
          </div>
        </footer>
      </aside>
    </div>
  );
}
