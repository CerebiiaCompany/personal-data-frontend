"use client";

import React from "react";
import clsx from "clsx";
import { Icon } from "@iconify/react";
import { CompanyUserSummary } from "@/types/company.types";

interface Props {
  users: CompanyUserSummary[];
  loading: boolean;
  loadingMore: boolean;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  search: string;
  onSearchChange: (value: string) => void;
  totalCount?: number;
  hasMore: boolean;
  onLoadMore: () => void;
}

function getUserPosition(u: CompanyUserSummary): string {
  return u.companyUserData?.position ?? "—";
}

const CompanyUserMultiSelect = ({
  users,
  loading,
  loadingMore,
  selectedIds,
  onChange,
  search,
  onSearchChange,
  totalCount,
  hasMore,
  onLoadMore,
}: Props) => {
  const loadedIds = users.map((u) => u._id);
  const allLoadedSelected =
    loadedIds.length > 0 && loadedIds.every((id) => selectedIds.includes(id));
  const someLoadedSelected = loadedIds.some((id) => selectedIds.includes(id));

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((s) => s !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  function selectAll() {
    onChange(Array.from(new Set([...selectedIds, ...loadedIds])));
  }

  function deselectAll() {
    const loadedSet = new Set(loadedIds);
    onChange(selectedIds.filter((id) => !loadedSet.has(id)));
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Search + bulk actions */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <div className="relative flex-1">
          <Icon
            icon="tabler:search"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-[#94A3B8]"
          />
          <input
            type="text"
            placeholder="Buscar por nombre o usuario..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-[#E2E8F0] bg-white py-2 pl-9 pr-3 text-sm text-[#0B1737] placeholder:text-[#94A3B8] focus:border-[#3357A5] focus:outline-none focus:ring-1 focus:ring-[#3357A5]"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
            >
              <Icon icon="tabler:x" className="text-sm" />
            </button>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={selectAll}
            disabled={allLoadedSelected || loadedIds.length === 0}
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#3357A5] transition hover:border-[#3357A5] hover:bg-[#EEF3FF] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Seleccionar todos
          </button>
          <button
            type="button"
            onClick={deselectAll}
            disabled={!someLoadedSelected}
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#64748B] transition hover:border-[#94A3B8] hover:bg-[#F1F5F9] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Deseleccionar todos
          </button>
        </div>
      </div>

      {/* Counter */}
      {totalCount !== undefined && !loading && (
        <p className="text-xs text-[#94A3B8]">
          Mostrando {users.length} de {totalCount} usuario
          {totalCount !== 1 ? "s" : ""}
          {search && " con ese filtro"}
        </p>
      )}

      {/* List */}
      <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
        {loading ? (
          <div className="flex flex-col gap-2 py-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-[56px] w-full animate-pulse rounded-xl border border-[#EAF0FA] bg-[#F1F5F9]"
              />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Icon
              icon="tabler:users-group"
              className="text-3xl text-[#CBD5E1]"
            />
            <p className="text-sm text-[#94A3B8]">
              {search
                ? `Sin resultados para "${search}"`
                : "No hay usuarios en la organización."}
            </p>
          </div>
        ) : (
          <>
            {users.map((user) => {
              const selected = selectedIds.includes(user._id);
              return (
                <label
                  key={user._id}
                  className={clsx(
                    "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors",
                    selected
                      ? "border-[#3357A5] bg-[#EEF3FF]"
                      : "border-[#EAF0FA] bg-[#FAFCFF] hover:border-[#CFDBF2]"
                  )}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={selected}
                    onChange={() => toggle(user._id)}
                  />
                  <div
                    className={clsx(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                      selected
                        ? "border-[#3357A5] bg-[#3357A5]"
                        : "border-[#C4CDD8] bg-white"
                    )}
                  >
                    {selected && (
                      <Icon
                        icon="tabler:check"
                        className="text-xs text-white"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#0B1737]">
                      {user.name} {user.lastName}
                    </p>
                    <p className="truncate text-xs text-[#64748B]">
                      {getUserPosition(user)} · {user.username}
                    </p>
                  </div>
                </label>
              );
            })}

            {/* Load more */}
            {(hasMore || loadingMore) && (
              <button
                type="button"
                onClick={onLoadMore}
                disabled={loadingMore}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#CBD5E1] py-3 text-xs font-semibold text-[#64748B] transition hover:border-[#3357A5] hover:bg-[#F8FAFF] hover:text-[#3357A5] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingMore ? (
                  <>
                    <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-[#3357A5] border-t-transparent animate-spin" />
                    Cargando más...
                  </>
                ) : (
                  <>
                    <Icon icon="tabler:chevrons-down" className="text-base" />
                    Cargar más usuarios
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CompanyUserMultiSelect;
