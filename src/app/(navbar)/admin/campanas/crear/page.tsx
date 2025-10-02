"use client";

import AdministrationPageSelector from "@/components/administration/AdministrationPageSelector";
import CompanyUsersTable from "@/components/administration/CompanyUsersTable";
import CreateCompanyUserForm from "@/components/administration/CreateCompanyUserForm";
import Button from "@/components/base/Button";
import SectionHeader from "@/components/base/SectionHeader";
import CreateCampaignForm from "@/components/campaigns/CreateCampaignForm";
import { useCompanyUsers } from "@/hooks/useCompanyUsers";
import { useSessionStore } from "@/store/useSessionStore";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateCampaignPage() {
  const user = useSessionStore((store) => store.user);
  const router = useRouter();

  return (
    <div className="flex flex-col relative">
      <SectionHeader />

      {/* Content */}
      <div className="px-8 py-6 flex flex-col gap-6 items-center">
        <h4 className="font-bold text-xl text-primary-900">Crear Campaña</h4>
        <CreateCampaignForm />
      </div>
    </div>
  );
}
