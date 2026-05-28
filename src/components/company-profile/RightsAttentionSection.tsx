"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import CustomInput from "@/components/forms/CustomInput";
import ProfileSectionCard from "./ProfileSectionCard";
import CompanyUserMultiSelect from "./CompanyUserMultiSelect";
import { fetchArcoOfficers, updateArcoOfficers } from "@/lib/arcoAdmin.api";
import { CompanyProfile, CompanyUserSummary } from "@/types/company.types";
import { useCompanyUsers } from "@/hooks/useCompanyUsers";
import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";

interface Props {
  companyId: string;
  profile: CompanyProfile | null;
}

const PAGE_SIZE = 50;

const RightsAttentionSection = ({ companyId, profile }: Props) => {
  const [saving, setSaving] = useState(false);
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
    setPage(1);
    setAllUsers([]);
  }, [debouncedSearch]);

  const { data: pageData, loading, meta } = useCompanyUsers<CompanyUserSummary[]>({
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
    if (!profile) return;
    setSelectedIds((profile.rightsAttentionUsers ?? []).map((u) => u._id));
    setPhoneLine(profile.rightsAttentionPhoneLine ?? "");
  }, [profile]);

  useEffect(() => {
    if (!companyId) return;
    fetchArcoOfficers(companyId).then((res) => {
      if (res.data?.officers?.length) {
        setSelectedIds(res.data.officers.map((o) => o.userId));
      }
      if (res.data?.phoneLine) {
        setPhoneLine(res.data.phoneLine);
      }
    });
  }, [companyId]);

  const hasMore = !!meta && (meta.page ?? 1) < (meta.totalPages ?? 1);
  const isInitialLoading = loading && allUsers.length === 0;
  const isLoadingMore = loading && allUsers.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await updateArcoOfficers(companyId, {
      userIds: selectedIds,
      phoneLine: phoneLine.trim() || undefined,
    });
    setSaving(false);
    if (res.error) return showApiErrorToast(res.error, res.error.status);
    toast.success("Atención de derechos ARCO actualizada");
  }

  return (
    <ProfileSectionCard
      icon="tabler:help-circle"
      title="Atención de derechos ARCO"
      description="Usuarios designados como encargados ARCO. Deben tener el permiso «Solicitudes ARCO» en su rol y figurar aquí."
      onSubmit={handleSubmit}
      loading={saving}
    >
      <div className="flex flex-col gap-1">
        <p className="font-medium pl-2 text-stone-500 text-sm">
          Responsables (usuarios de la organización)
        </p>
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
          onLoadMore={() => setPage((p) => p + 1)}
        />
        {selectedIds.length > 0 && (
          <p className="text-xs text-[#64748B]">
            {selectedIds.length} responsable{selectedIds.length !== 1 ? "s" : ""}{" "}
            seleccionado{selectedIds.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <CustomInput
        label="Línea telefónica ARCO"
        placeholder="Ej. 018000123456"
        value={phoneLine}
        onChange={(e) => setPhoneLine(e.target.value)}
      />
    </ProfileSectionCard>
  );
};

export default RightsAttentionSection;
