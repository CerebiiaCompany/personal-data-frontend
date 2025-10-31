"use client";

import SectionHeader from "@/components/base/SectionHeader";
import CreateScheduledCampaignForm from "@/components/campaigns/CreateScheduledCampaignForm";

export default function CreateScheduledCampaignPage() {
  return (
    <div className="flex flex-col relative">
      <SectionHeader />

      {/* Content */}
      <div className="px-8 py-6 flex flex-col gap-6 items-center">
        <h4 className="font-bold text-xl text-primary-900">Crear Campaña Programada</h4>
        <CreateScheduledCampaignForm />
      </div>
    </div>
  );
}

