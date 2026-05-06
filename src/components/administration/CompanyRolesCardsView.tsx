"use client";

import LoadingCover from "@/components/layout/LoadingCover";
import SectionSearchBar from "@/components/base/SectionSearchBar";
import Button from "@/components/base/Button";
import Pagination from "@/components/base/Pagination";
import RolePermissionsDrawer from "@/components/administration/RolePermissionsDrawer";
import { useCompanyUsers } from "@/hooks/useCompanyUsers";
import { deleteCompanyRole } from "@/lib/companyRole.api";
import { useSessionStore } from "@/store/useSessionStore";
import type { APIResponse } from "@/types/api.types";
import type { CompanyRole } from "@/types/companyRole.types";
import type { SessionUser } from "@/types/user.types";
import { parseApiError } from "@/utils/parseApiError";
import {
  formatRelativeEs,
  maxUpdatedAt,
  summarizeRolePermissions,
} from "@/utils/companyRolePermissions.utils";
import { Icon } from "@iconify/react";
import Link from "next/link";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const topCardClass =
  "bg-white border border-[#E8EDF7] rounded-2xl shadow-[0_2px_12px_rgba(15,35,70,0.04)]";
const NAVY = "#1A2B5B";
const CONFIGURABLE_MODULES = 6;

function initials(u: SessionUser) {
  const a = (u.name ?? "").trim()[0] ?? "";
  const b = (u.lastName ?? "").trim()[0] ?? "";
  return `${a}${b}`.toUpperCase() || "?";
}

function avatarColor(seed: string) {
  const hues = [210, 250, 280, 160, 30, 340];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h += seed.charCodeAt(i);
  return hues[h % hues.length];
}

function buildRoleUserMaps(users: SessionUser[] | null) {
  const counts = new Map<string, number>();
  const samples = new Map<string, SessionUser[]>();
  if (!users) return { counts, samples };
  for (const u of users) {
    const rid = u.companyUserData?.companyRole?._id;
    if (!rid) continue;
    counts.set(rid, (counts.get(rid) ?? 0) + 1);
    const arr = samples.get(rid) ?? [];
    if (arr.length < 4) arr.push(u);
    samples.set(rid, arr);
  }
  return { counts, samples };
}

interface Props {
  items: CompanyRole[] | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  meta: APIResponse["meta"] | null;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
  scrollAnchorId?: string;
}

export default function CompanyRolesCardsView({
  items,
  loading,
  error,
  refresh,
  meta,
  onPageChange,
  onPageSizeChange,
  scrollAnchorId = "roles-cards-container",
}: Props) {
  const user = useSessionStore((s) => s.user);
  const companyId = user?.companyUserData?.companyId;
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CompanyRole | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: usersData } = useCompanyUsers({
    companyId,
    page: 1,
    pageSize: 500,
  });

  const { counts: usersPerRole, samples: userSamples } = useMemo(
    () => buildRoleUserMaps(usersData ?? null),
    [usersData]
  );

  const usersWithRoleTotal = useMemo(() => {
    if (!usersData) return 0;
    return usersData.filter((u) => u.companyUserData?.companyRole?._id)
      .length;
  }, [usersData]);

  const filteredItems = useMemo(() => {
    if (!items) return null;
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (r) =>
        r.position.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
  }, [items, search]);

  const lastEditLabel = useMemo(() => {
    if (!items?.length) return null;
    const iso = maxUpdatedAt(items);
    return iso ? formatRelativeEs(iso) : null;
  }, [items]);

  async function handleDelete(e: React.MouseEvent, role: CompanyRole) {
    e.stopPropagation();
    if (!companyId) return;
    if (
      !window.confirm(
        `¿Eliminar el rol "${role.position}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }
    const res = await deleteCompanyRole(companyId, role._id);
    if (res.error) {
      toast.error(parseApiError(res.error));
      return;
    }
    toast.success("Rol eliminado");
    if (selected?._id === role._id) {
      setDrawerOpen(false);
      setSelected(null);
    }
    refresh();
  }

  const totalRoles = meta?.totalCount ?? items?.length ?? 0;
  const displayCount = filteredItems?.length ?? 0;

  return (
    <>
      <div className="w-full shrink-0 px-5 pt-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <section className={clsx(topCardClass, "px-5 py-5 sm:px-6 sm:py-6")}>
          <header className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
              <div className="min-w-0 flex-1 space-y-3">
                <nav className="flex flex-wrap items-center gap-2 text-sm text-[#64748B]">
                  <Link href="/admin" className="hover:underline">
                    Inicio
                  </Link>
                  <Icon
                    icon="tabler:chevron-right"
                    className="text-base shrink-0 text-[#94A3B8]"
                  />
                  <Link
                    href="/admin/administracion"
                    className="hover:underline"
                  >
                    Administración
                  </Link>
                  <Icon
                    icon="tabler:chevron-right"
                    className="text-base shrink-0 text-[#94A3B8]"
                  />
                  <span className="font-semibold" style={{ color: NAVY }}>
                    Roles
                  </span>
                </nav>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-violet-800">
                  <Icon icon="tabler:shield" className="text-sm" />
                  Control de acceso
                </span>
                <h1
                  className="font-sans text-[26px] font-bold leading-tight tracking-tight sm:text-[28px]"
                  style={{ color: NAVY }}
                >
                  Roles
                </h1>
                <p className="max-w-2xl text-[13px] leading-relaxed text-[#64748B] sm:text-sm">
                  Define cargos y permisos para controlar qué puede hacer cada
                  usuario en la plataforma. Cada rol agrupa accesos por módulo de
                  forma granular.
                </p>
              </div>
              <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center lg:w-auto lg:max-w-md lg:flex-col lg:items-stretch xl:max-w-lg">
                <SectionSearchBar
                  search={search}
                  onSearchChange={setSearch}
                  placeholder="Buscar roles..."
                  variant="pill"
                />
                <Button
                  href="/admin/administracion/roles/crear"
                  className="shrink-0 rounded-xl! border-primary-900! bg-primary-900! px-5! py-2.5! text-[13px]! font-semibold! text-white! hover:bg-primary-700!"
                  startContent={
                    <Icon icon="tabler:shield-plus" className="text-lg" />
                  }
                >
                  Crear rol
                </Button>
              </div>
            </div>

            <div className="grid gap-3 border-t border-[#EEF2F8] pt-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="font-sans text-2xl font-bold tabular-nums text-[#1A2B5B]">
                  {totalRoles}
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                  Roles activos
                </p>
              </div>
              <div>
                <p className="font-sans text-2xl font-bold tabular-nums text-[#1A2B5B]">
                  {usersWithRoleTotal}
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                  Usuarios asignados
                </p>
              </div>
              <div>
                <p className="font-sans text-2xl font-bold tabular-nums text-[#1A2B5B]">
                  {CONFIGURABLE_MODULES}
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                  Módulos configurables
                </p>
              </div>
              <div>
                <p className="font-sans text-lg font-bold text-[#1A2B5B]">
                  {lastEditLabel ?? "—"}
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                  Última edición
                </p>
              </div>
            </div>
          </header>
        </section>
      </div>

      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col px-5 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8 xl:px-10 2xl:px-12">
        <section
          id={scrollAnchorId}
          className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#E8EDF7] bg-white shadow-[0_2px_12px_rgba(15,35,70,0.04)]"
        >
          <div className="relative min-h-0 flex-1 overflow-auto p-4 sm:p-5">
            {loading && <LoadingCover />}

            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <p className="font-sans text-lg font-bold text-[#1A2B5B] sm:text-xl">
                {displayCount}{" "}
                {displayCount === 1 ? "rol" : "roles"}
                {search.trim() ? " (filtrados en esta página)" : ""}
              </p>
              <p className="text-xs text-[#94A3B8]">
                Haz clic en una tarjeta para ver el detalle de permisos
              </p>
            </div>

            {error && (
              <p className="py-8 text-center text-sm text-red-500">
                Error: {error}
              </p>
            )}

            {!error &&
              !loading &&
              filteredItems &&
              filteredItems.length === 0 && (
                <p className="py-12 text-center text-sm text-[#64748B]">
                  {!items || items.length === 0
                    ? "No hay roles creados todavía."
                    : "Ningún rol coincide con la búsqueda en esta página."}
                </p>
              )}

            {!error && filteredItems && filteredItems.length > 0 && (
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredItems.map((role) => (
                  <RoleCard
                    key={role._id}
                    role={role}
                    userCount={usersPerRole.get(role._id) ?? 0}
                    sampleUsers={userSamples.get(role._id) ?? []}
                    onOpen={() => {
                      setSelected(role);
                      setDrawerOpen(true);
                    }}
                    onDelete={(e) => handleDelete(e, role)}
                  />
                ))}
              </ul>
            )}
          </div>

          {meta ? (
            <div className="shrink-0 border-t border-[#EEF2F8] px-4 py-3 sm:px-5">
              <Pagination
                meta={meta}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
              />
            </div>
          ) : null}
        </section>
      </div>

      <RolePermissionsDrawer
        role={selected}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelected(null);
        }}
        userCount={selected ? (usersPerRole.get(selected._id) ?? 0) : 0}
      />
    </>
  );
}

function RoleCard({
  role,
  userCount,
  sampleUsers,
  onOpen,
  onDelete,
}: {
  role: CompanyRole;
  userCount: number;
  sampleUsers: SessionUser[];
  onOpen: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const summary = summarizeRolePermissions(role.permissions);
  const activeModules = summary.modules.filter((m) => m.active > 0);
  const shown = activeModules.slice(0, 4);
  const hidden = activeModules.length - shown.length;

  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen();
          }
        }}
        className="flex h-full w-full cursor-pointer flex-col rounded-2xl border border-[#E8EDF7] bg-white p-4 text-left shadow-[0_1px_8px_rgba(15,35,70,0.05)] transition hover:border-primary-300/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      >
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
            <Icon icon="tabler:shield" className="text-xl" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-sans text-base font-bold leading-snug text-[#1A2B5B] sm:text-lg">
              {role.position}
            </h2>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#64748B] sm:text-[13px]">
              {role.description}
            </p>
          </div>
        </div>

        <div className="mt-4 border-t border-[#EEF2F8] pt-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
            Cobertura de permisos
          </p>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="font-sans text-2xl font-bold tabular-nums text-[#1A2B5B]">
              {summary.active}/{summary.total}
            </span>
            <span className="text-xs font-medium text-primary-700">
              {summary.percent}% activo
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#EEF2F8]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-700 transition-all"
              style={{ width: `${summary.percent}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-[#64748B]">
            <span>{summary.modulesWithAccess} módulos</span>
            <span className="tabular-nums">{summary.percent}% cobertura</span>
          </div>
        </div>

        <div className="mt-3 min-h-0 flex-1 space-y-1.5">
          {shown.map((m) => (
            <div
              key={m.key}
              className="flex items-center gap-2 text-[11px] text-[#475569] sm:text-xs"
            >
              <span
                className={clsx(
                  "h-2 w-2 shrink-0 rounded-full",
                  m.isComplete ? "bg-emerald-500" : "bg-amber-500"
                )}
              />
              <span className="min-w-0 flex-1 truncate">{m.title}</span>
              <span className="shrink-0 tabular-nums text-[#94A3B8]">
                {m.active}/{m.total}
              </span>
            </div>
          ))}
          {hidden > 0 ? (
            <p className="text-[11px] font-medium text-[#94A3B8]">
              +{hidden} más
            </p>
          ) : null}
        </div>

        <div
          className="mt-4 flex items-center justify-between border-t border-[#EEF2F8] pt-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex -space-x-2">
              {sampleUsers.slice(0, 3).map((u, i) => (
                <span
                  key={u._id}
                  className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white"
                  style={{
                    backgroundColor: `hsl(${avatarColor(u._id)} 55% 42%)`,
                    zIndex: 3 - i,
                  }}
                  title={`${u.name} ${u.lastName}`}
                >
                  {initials(u)}
                </span>
              ))}
            </div>
            <span className="flex items-center gap-1 truncate text-xs text-[#64748B]">
              <Icon icon="tabler:users" className="shrink-0 text-base" />
              {userCount}{" "}
              {userCount === 1 ? "usuario" : "usuarios"}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <Link
              href={`/admin/administracion/roles/${role._id}`}
              onClick={(e) => e.stopPropagation()}
              className="rounded-lg p-2 text-[#475569] hover:bg-slate-100"
              aria-label="Editar rol"
            >
              <Icon icon="material-symbols:edit-outline" className="text-xl" />
            </Link>
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg p-2 text-red-400 hover:bg-red-50"
              aria-label="Eliminar rol"
            >
              <Icon icon="bx:trash" className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
