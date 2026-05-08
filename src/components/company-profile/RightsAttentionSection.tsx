"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import CustomInput from "@/components/forms/CustomInput";
import ProfileSectionCard from "./ProfileSectionCard";
import CompanyUserMultiSelect from "./CompanyUserMultiSelect";
import { updateCompanyRightsAttention } from "@/lib/company.api";
import { CompanyProfile, CompanyUserSummary } from "@/types/company.types";
import { useCompanyUsers } from "@/hooks/useCompanyUsers";
import { parseApiError } from "@/utils/parseApiError";

interface Props {
  companyId: string;
  profile: CompanyProfile | null;
}

const RightsAttentionSection = ({ companyId, profile }: Props) => {
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [phoneLine, setPhoneLine] = useState("");

  const { data: users, loading: usersLoading } = useCompanyUsers<
    CompanyUserSummary[]
  >({
    companyId,
    page: 1,
    pageSize: 200,
  });

  useEffect(() => {
    if (!profile) return;
    setSelectedIds((profile.rightsAttentionUsers ?? []).map((u) => u._id));
    setPhoneLine(profile.rightsAttentionPhoneLine ?? "");
  }, [profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await updateCompanyRightsAttention(companyId, {
      user_ids: selectedIds,
      phone_line: phoneLine,
    });
    setLoading(false);

    if (res.error) return toast.error(parseApiError(res.error));
    toast.success("Atención de derechos ARCO actualizada");
  }

  return (
    <ProfileSectionCard
      icon="tabler:help-circle"
      title="Atención de derechos ARCO"
      description="Responsables de atender solicitudes de acceso, rectificación, cancelación u oposición."
      onSubmit={handleSubmit}
      loading={loading}
    >
      <div className="flex flex-col gap-1">
        <p className="font-medium pl-2 text-stone-500 text-sm">
          Responsables (usuarios de la organización)
        </p>
        <CompanyUserMultiSelect
          users={users ?? []}
          loading={usersLoading}
          selectedIds={selectedIds}
          onChange={setSelectedIds}
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
