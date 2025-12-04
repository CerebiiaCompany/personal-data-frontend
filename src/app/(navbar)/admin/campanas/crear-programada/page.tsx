"use client";

import SectionHeader from "@/components/base/SectionHeader";
import CreateScheduledCampaignForm from "@/components/campaigns/CreateScheduledCampaignForm";

export default function CreateScheduledCampaignPage() {
  return (
    <div className="flex flex-col relative">
      <SectionHeader />

      {/* Content */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6 flex flex-col gap-4 sm:gap-5 md:gap-6 items-center">
        <h4 className="font-bold text-lg sm:text-xl text-primary-900 text-center sm:text-left w-full">Crear Campaña Programada</h4>
        <CreateScheduledCampaignForm />
      </div>
    </div>
  );
}

