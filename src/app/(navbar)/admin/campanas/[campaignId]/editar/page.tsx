"use client";

import AdministrationPageSelector from "@/components/administration/AdministrationPageSelector";
import CompanyUsersTable from "@/components/administration/CompanyUsersTable";
import CreateCompanyUserForm from "@/components/administration/CreateCompanyUserForm";
import Button from "@/components/base/Button";
import SectionHeader from "@/components/base/SectionHeader";
import CreateCampaignForm from "@/components/campaigns/CreateCampaignForm";
import LoadingCover from "@/components/layout/LoadingCover";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useCompanyUsers } from "@/hooks/useCompanyUsers";
import { useSessionStore } from "@/store/useSessionStore";
import { Campaign } from "@/types/campaign.types";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function EditCampaignPage() {
  const user = useSessionStore((store) => store.user);
  const router = useRouter();
  const campaignId = useParams().campaignId?.toString();
  const { data, loading, error } = useCampaigns<Campaign>({
    companyId: user?.companyUserData?.companyId,
    id: campaignId,
  });

  return (
    <div className="flex flex-col relative">
      <SectionHeader dynamicEndpoint={data?.name} />

      {/* Content */}
      <div className="px-8 py-6 flex flex-col gap-6 items-center">
        <header className="w-full flex gap-2 justify-between items-center">
          <div className="flex gap-2">
            <Link
              href={"/admin/campanas"}
              className="flex items-center gap-2 text-primary-900 font-medium text-sm"
            >
              <div className="w-fit bg-primary-900 rounded-md text-white p-1">
                <Icon icon={"tabler:chevron-left"} className="text-2xl" />
              </div>
              Volver
            </Link>
          </div>
          <h4 className="font-semibold text-xl text-primary-900 w-full text-center">
            Actualizar Campaña
          </h4>
        </header>

        {loading && (
          <div className="relative min-h-20 w-full">
            <LoadingCover />
          </div>
        )}
        {error && <p>{error}</p>}
        {data && (
          <CreateCampaignForm
            initialValues={{
              name: data.name,
              active: data.active,
              goal: data.goal,
              scheduling: {
                startDate:
                  data.scheduling?.startDate ||
                  data.scheduling?.scheduledDateTime ||
                  data.scheduledFor ||
                  new Date().toISOString(),
                endDate:
                  data.scheduling?.endDate ||
                  data.scheduling?.scheduledDateTime ||
                  data.scheduledFor ||
                  new Date().toISOString(),
                ocurrences:
                  typeof data.scheduling?.ocurrences === "number"
                    ? data.scheduling!.ocurrences
                    : 1,
              },
              sourceFormIds: data.sourceFormIds || [],
              deliveryChannel: data.deliveryChannel,
              audience: {
                minAge: data.audience.minAge,
                maxAge: data.audience.maxAge,
                gender: data.audience.gender,
                count:
                  (data.audience as any).count ?? data.audience.total ?? 0,
              },
              content: {
                name: data.content?.name || "",
                bodyText: data.content?.bodyText || "",
                link: data.content?.link,
                imageUrl: data.content?.imageUrl,
              },
            }}
          />
        )}
      </div>
    </div>
  );
}
