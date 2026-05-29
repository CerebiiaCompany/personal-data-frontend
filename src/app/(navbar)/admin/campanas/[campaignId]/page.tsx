"use client";

import Button from "@/components/base/Button";
import CampaignDeliveriesSection from "@/components/campaigns/CampaignDeliveriesSection";
import CampaignDetailOverview from "@/components/campaigns/CampaignDetailOverview";
import LoadingCover from "@/components/layout/LoadingCover";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { fetchCampaigns } from "@/lib/campaign.api";
import { Campaign } from "@/types/campaign.types";
import { parseApiError } from "@/utils/parseApiError";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CampaignDetailPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const companyId = useActiveCompanyId();

  const [data, setData] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!companyId || !campaignId) return;
      setLoading(true);
      setError(null);
      const res = await fetchCampaigns({ companyId, id: campaignId });
      if (res.error) {
        setError(parseApiError(res.error));
        setLoading(false);
        return;
      }
      setData(res.data as Campaign);
      setLoading(false);
    })();
  }, [companyId, campaignId]);

  if (loading && !data) {
    return (
      <div className="relative min-h-[50vh]">
        <LoadingCover wholePage />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col bg-[#F8FAFC]">
      <div className="w-full px-5 pt-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <header className="rounded-2xl border border-[#E8EDF7] bg-white px-5 py-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:px-6 sm:py-6">
          <nav className="mb-3 flex flex-wrap items-center gap-2 text-sm text-[#64748B]">
            <Link href="/admin" className="hover:underline">
              Inicio
            </Link>
            <Icon icon="tabler:chevron-right" className="text-base" />
            <Link href="/admin/campanas" className="hover:underline">
              Campañas
            </Link>
            <Icon icon="tabler:chevron-right" className="text-base" />
            <span className="line-clamp-1 font-semibold text-[#1A2B5B]">
              {data?.name ?? "Detalle"}
            </span>
          </nav>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-[26px] font-bold tracking-tight text-[#1A2B5B] sm:text-[28px]">
                {data?.name ?? "Detalle de campaña"}
              </h1>
              <p className="max-w-2xl text-sm text-[#64748B]">
                Revisa la configuración de la campaña y el historial de envíos a cada
                titular de la lista del formulario.
              </p>
            </div>
            <Link href="/admin/campanas" className="shrink-0">
              <Button
                hierarchy="tertiary"
                startContent={<Icon icon="tabler:arrow-left" />}
              >
                Volver
              </Button>
            </Link>
          </div>
        </header>
      </div>

      <div className="flex min-h-0 w-full flex-1 flex-col gap-6 px-5 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {data && companyId && (
          <>
            <CampaignDetailOverview campaign={data} />
            <CampaignDeliveriesSection
              companyId={companyId}
              campaignId={campaignId}
              audienceTotal={data.audience.total ?? data.audience.count}
              audienceDelivered={data.audience.delivered}
            />
          </>
        )}
      </div>
    </div>
  );
}
