"use client";

import SectionHeader from "@/components/base/SectionHeader";
import CreateCampaignForm from "@/components/campaigns/CreateCampaignForm";

export default function CreateCampaignPage() {
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
