"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import ProfileSectionCard from "./ProfileSectionCard";
import CompanyUserMultiSelect from "./CompanyUserMultiSelect";
import { updateCompanyAuthorizedPersonnel } from "@/lib/company.api";
import { CompanyProfile, CompanyUserSummary } from "@/types/company.types";
import { useCompanyUsers } from "@/hooks/useCompanyUsers";
import { parseApiError } from "@/utils/parseApiError";

interface Props {
  companyId: string;
  profile: CompanyProfile | null;
}

const PAGE_SIZE = 50;

const AuthorizedPersonnelSection = ({ companyId, profile }: Props) => {
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [allUsers, setAllUsers] = useState<CompanyUserSummary[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
    setAllUsers([]);
  }, [debouncedSearch]);

  const {
    data: pageData,
    loading,
    meta,
  } = useCompanyUsers<CompanyUserSummary[]>({
    companyId,
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
  });

  useEffect(() => {
    if (!pageData) return;
    setAllUsers((prev) => (page === 1 ? pageData : [...prev, ...pageData]));
  }, [pageData]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!profile?.authorizedPersonnel) return;
    setSelectedIds(profile.authorizedPersonnel.map((u) => u._id));
  }, [profile]);

  const hasMore = !!meta && (meta.page ?? 1) < (meta.totalPages ?? 1);
  const isInitialLoading = loading && allUsers.length === 0;
  const isLoadingMore = loading && allUsers.length > 0;

  function handleLoadMore() {
    setPage((p) => p + 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await updateCompanyAuthorizedPersonnel(companyId, {
      user_ids: selectedIds,
    });
    setSaving(false);
    if (res.error) return toast.error(parseApiError(res.error));
    toast.success("Personal autorizado actualizado");
  }

  return (
    <ProfileSectionCard
      icon="tabler:users"
      title="Personal autorizado"
      description="Usuarios de la organización autorizados para tratar datos personales."
      onSubmit={handleSubmit}
      loading={saving}
    >
      <CompanyUserMultiSelect
        users={allUsers}
        loading={isInitialLoading}
        loadingMore={isLoadingMore}
        selectedIds={selectedIds}
        onChange={setSelectedIds}
        search={search}
        onSearchChange={setSearch}
        totalCount={meta?.totalCount}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
      />
      {selectedIds.length > 0 && (
        <p className="text-xs text-[#64748B]">
          {selectedIds.length} usuario{selectedIds.length !== 1 ? "s" : ""}{" "}
          seleccionado{selectedIds.length !== 1 ? "s" : ""}
        </p>
      )}
    </ProfileSectionCard>
  );
};

export default AuthorizedPersonnelSection;
