"use client";

import Button from "@/components/base/Button";
import CustomInput from "@/components/forms/CustomInput";
import CompanyUserMultiSelect from "@/components/company-profile/CompanyUserMultiSelect";
import LoadingCover from "@/components/layout/LoadingCover";
import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import { fetchArcoOfficers, updateArcoOfficers } from "@/lib/arcoAdmin.api";
import { useCompanyUsers } from "@/hooks/useCompanyUsers";
import { ArcoOfficerUser } from "@/types/arco.admin.types";
import { CompanyUserSummary } from "@/types/company.types";
import {
  formatArcoOfficerName,
  mergeUsersWithOfficers,
} from "@/utils/arcoOfficers.utils";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 50;

interface Props {
  companyId: string;
  canEdit: boolean;
}

function officerInitials(officer: { name: string; lastName?: string }) {
  const a = officer.name?.[0] ?? "";
  const b = officer.lastName?.[0] ?? "";
  return (a + b).toUpperCase() || "?";
}

function OfficerChip({ officer }: { officer: ArcoOfficerUser }) {
  return (
    <span
      className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#D4DEEE] bg-[#F8FAFF] py-1 pl-1 pr-3 text-sm text-[#1A2B5B]"
      title={formatArcoOfficerName(officer)}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#3357A5] text-[11px] font-semibold text-white">
        {officerInitials(officer)}
      </span>
      <span className="truncate font-medium">{formatArcoOfficerName(officer)}</span>
    </span>
  );
}

const ArcoOfficersManager = ({ companyId, canEdit }: Props) => {
  const [loadingOfficers, setLoadingOfficers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [officers, setOfficers] = useState<ArcoOfficerUser[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [phoneLine, setPhoneLine] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [allUsers, setAllUsers] = useState<CompanyUserSummary[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!isEditing) return;
    setPage(1);
    setAllUsers([]);
  }, [debouncedSearch, isEditing]);

  const { data: pageData, loading, meta } = useCompanyUsers<CompanyUserSummary[]>({
    companyId: canEdit && isEditing ? companyId : undefined,
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
  });

  useEffect(() => {
    if (!pageData || !isEditing) return;
    setAllUsers((prev) => (page === 1 ? pageData : [...prev, ...pageData]));
  }, [pageData, page, isEditing]);

  const loadOfficers = useCallback(async () => {
    setLoadingOfficers(true);
    const res = await fetchArcoOfficers(companyId);
    setLoadingOfficers(false);
    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
      return;
    }
    const list = res.data?.officers ?? [];
    setOfficers(list);
    setSelectedIds(list.map((o) => o.userId));
    setPhoneLine(res.data?.phoneLine ?? "");
  }, [companyId]);

  useEffect(() => {
    loadOfficers();
  }, [loadOfficers]);

  const selectableUsers = useMemo(
    () => mergeUsersWithOfficers(allUsers, officers),
    [allUsers, officers]
  );

  const hasMore = !!meta && (meta.page ?? 1) < (meta.totalPages ?? 1);
  const isInitialLoading = loading && allUsers.length === 0;
  const isLoadingMore = loading && allUsers.length > 0;

  function openEditor() {
    setSearch("");
    setPage(1);
    setAllUsers([]);
    setIsEditing(true);
  }

  function cancelEditor() {
    setSearch("");
    setIsEditing(false);
    loadOfficers();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit) return;
    setSaving(true);
    const res = await updateArcoOfficers(companyId, {
      userIds: selectedIds,
      phoneLine: phoneLine.trim() || undefined,
    });
    setSaving(false);
    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
      return;
    }
    toast.success("Responsables ARCO actualizados");
    setIsEditing(false);
    loadOfficers();
  }

  if (loadingOfficers) {
    return (
      <div className="relative min-h-[72px]">
        <LoadingCover />
      </div>
    );
  }

  if (isEditing && canEdit) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-[#1A2B5B]">
            Gestionar responsables
          </p>
          <button
            type="button"
            onClick={cancelEditor}
            className="text-xs font-medium text-[#64748B] hover:text-[#1A2B5B]"
          >
            Cancelar
          </button>
        </div>

        <CustomInput
          label="Línea telefónica"
          placeholder="Ej. 6011234567"
          value={phoneLine}
          onChange={(e) => setPhoneLine(e.target.value)}
        />

        <div className="rounded-xl border border-[#E8EDF7] bg-[#FAFBFD] p-3">
          <CompanyUserMultiSelect
            users={selectableUsers}
            loading={isInitialLoading}
            loadingMore={isLoadingMore}
            selectedIds={selectedIds}
            onChange={setSelectedIds}
            search={search}
            onSearchChange={setSearch}
            totalCount={meta?.totalCount}
            hasMore={hasMore}
            onLoadMore={() => setPage((p) => p + 1)}
          />
        </div>

        <p className="text-xs text-[#94A3B8]">
          Al guardar se reemplaza la lista completa de responsables.
        </p>

        <div className="flex justify-end">
          <Button hierarchy="primary" type="submit" loading={saving}>
            Guardar cambios
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          {officers.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {officers.map((officer) => (
                <OfficerChip key={officer.userId} officer={officer} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#64748B]">Sin responsables asignados</p>
          )}

          {phoneLine && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-[#334155]">
              <Icon icon="tabler:phone" className="shrink-0 text-base text-[#3357A5]" />
              <span>{phoneLine}</span>
            </p>
          )}
        </div>

        {canEdit && (
          <Button
            type="button"
            hierarchy="secondary"
            onClick={openEditor}
            startContent={<Icon icon="tabler:pencil" />}
            className="shrink-0 text-sm"
          >
            Gestionar
          </Button>
        )}
      </div>

      {!canEdit && officers.length === 0 && !phoneLine && (
        <p className="text-xs text-[#94A3B8]">
          Solo un administrador puede modificar los responsables.
        </p>
      )}
    </div>
  );
};

export default ArcoOfficersManager;
