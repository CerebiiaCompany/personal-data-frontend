"use client";

import Button from "@/components/base/Button";
import SectionSearchBar from "@/components/base/SectionSearchBar";
import CampaignsFilters, {
  StatusFilterTab,
  TypeFilterTab,
} from "@/components/campaigns/CampaignsFilters";
import CampaignsSummaryCards from "@/components/campaigns/CampaignsSummaryCards";
import CampaignsTable from "@/components/campaigns/CampaignsTable";
import CheckPermission from "@/components/checkers/CheckPermission";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { usePermissionCheck } from "@/hooks/usePermissionCheck";
import { Campaign } from "@/types/campaign.types";
import {
  asFiniteNumber,
  getCampaignInstanceCredits,
} from "@/utils/campaignCredits.utils";
import { useAppSetting } from "@/hooks/useAppSetting";
import { Icon } from "@iconify/react";
import Link from "next/link";
import clsx from "clsx";
import { useMemo, useState } from "react";

const topCardClass =
  "bg-white border border-[#E8EDF7] rounded-2xl shadow-[0_2px_12px_rgba(15,35,70,0.04)]";

const NAVY = "#1A2B5B";

function matchesStatusFilter(item: Campaign, tab: StatusFilterTab): boolean {
  if (tab === "ALL") return true;
  const st = item.status ?? "DRAFT";
  if (tab === "ACTIVE") return st === "ACTIVE" && item.active;
  if (tab === "SCHEDULED") return st === "SCHEDULED";
  if (tab === "PAUSED") return st === "ACTIVE" && !item.active;
  if (tab === "COMPLETED") return st === "COMPLETED" || st === "EXPIRED";
  return true;
}

export default function CampaignsPage() {
  const companyId = useActiveCompanyId();
  const { shouldFetch } = usePermissionCheck();
  const { search, debouncedValue, setSearch } = useDebouncedSearch();
  const [statusTab, setStatusTab] = useState<StatusFilterTab>("ALL");
  const [typeTab, setTypeTab] = useState<TypeFilterTab>("ALL");

  const { data, loading, error, refresh } = useCampaigns({
    companyId: companyId,
    search: debouncedValue,
    type: typeTab !== "ALL" ? typeTab : undefined,
    enabled: shouldFetch("campaigns.view"),
  });

  const trmCopSetting = useAppSetting("TRM_COP");
  const smsCampaignPriceSetting = useAppSetting(
    "SMS_CAMPAIGN_PRICE_PER_MESSAGE_MASIVAPP"
  );
  const emailCampaignPriceSetting = useAppSetting(
    "EMAIL_CAMPAIGN_PRICE_PER_MESSAGE"
  );

  const trmCop = asFiniteNumber(trmCopSetting.data?.value);
  const smsPrice = asFiniteNumber(smsCampaignPriceSetting.data?.value);
  const emailPrice = asFiniteNumber(emailCampaignPriceSetting.data?.value);

  const summaryMetrics = useMemo(() => {
    if (!data?.length) {
      return {
        activeCount: 0,
        totalCampaigns: 0,
        accumulatedReach: 0,
        creditsConsumed: 0,
        deliveryRatePct: null as number | null,
      };
    }
    let activeCount = 0;
    let accumulatedReach = 0;
    let creditsConsumed = 0;
    let deliveredSum = 0;
    let totalAudienceSum = 0;

    for (const c of data) {
      const st = c.status ?? "DRAFT";
      if (st === "ACTIVE" && c.active) activeCount += 1;

      const aud = c.audience.total ?? c.audience.count ?? 0;
      accumulatedReach += aud;

      const cr = getCampaignInstanceCredits({
        item: c,
        trmCop,
        smsCampaignPricePerMessage: smsPrice,
        emailCampaignPricePerMessage: emailPrice,
      });
      if (typeof cr === "number" && Number.isFinite(cr)) creditsConsumed += cr;

      const del = c.audience.delivered ?? 0;
      if (aud > 0) {
        deliveredSum += del;
        totalAudienceSum += aud;
      }
    }

    const deliveryRatePct =
      totalAudienceSum > 0 ? (deliveredSum / totalAudienceSum) * 100 : null;

    return {
      activeCount,
      totalCampaigns: data.length,
      accumulatedReach,
      creditsConsumed,
      deliveryRatePct,
    };
  }, [data, trmCop, smsPrice, emailPrice]);

  const filteredItems = useMemo(() => {
    if (!data) return null;
    return data
      .filter((item) => matchesStatusFilter(item, statusTab))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [data, statusTab]);

  /** Mostrar métricas cuando ya hubo respuesta (`[]` incluido) o mientras carga */
  const showSummaryRow = data !== null || loading;

  return (
    <div className="flex min-h-full w-full flex-col bg-[#F8FAFC]">
      <div className="w-full shrink-0 px-5 pt-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <section className={clsx(topCardClass, "px-5 py-5 sm:px-6 sm:py-6")}>
          <div className="flex flex-col gap-6">
            <SectionSearchBar
              variant="pill"
              search={search}
              onSearchChange={setSearch}
              placeholder="Buscar campañas..."
            />

            <header className="flex flex-col gap-4 border-t border-[#EEF2F8] pt-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
              <div className="min-w-0 flex-1 space-y-2">
                <nav className="flex flex-wrap items-center gap-2 text-sm text-[#64748B]">
                  <Link href="/admin" className="hover:underline">
                    Inicio
                  </Link>
                  <Icon
                    icon="tabler:chevron-right"
                    className="text-base shrink-0 text-[#94A3B8]"
                  />
                  <span className="font-semibold" style={{ color: NAVY }}>
                    Campañas
                  </span>
                </nav>
                <h1
                  className="text-[26px] font-bold leading-tight tracking-tight sm:text-[28px]"
                  style={{ color: NAVY }}
                >
                  Campañas
                </h1>
                <p className="max-w-2xl text-[13px] leading-relaxed text-[#64748B] sm:text-sm">
                  Envíos masivos segmentados por SMS, Email y WhatsApp.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pt-1">
                <CheckPermission group="campaigns" permission="create">
                  <Button
                    href="/admin/campanas/crear-programada"
                    className="rounded-xl! border-[#1A2B5B]! bg-[#1A2B5B]! px-5! py-2.5! text-[13px]! font-semibold! text-white!"
                    startContent={<Icon icon="tabler:plus" className="text-lg" />}
                  >
                    Crear campaña
                  </Button>
                </CheckPermission>
              </div>
            </header>
          </div>
        </section>
      </div>

      <div className="w-full px-5 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8 xl:px-10 2xl:px-12">
        <div className="flex w-full flex-col gap-6 md:gap-8">
          {showSummaryRow && (
            <CampaignsSummaryCards
              activeCount={summaryMetrics.activeCount}
              totalCampaigns={summaryMetrics.totalCampaigns}
              accumulatedReach={summaryMetrics.accumulatedReach}
              creditsConsumed={summaryMetrics.creditsConsumed}
              deliveryRatePct={summaryMetrics.deliveryRatePct}
              loading={loading && !data}
            />
          )}

          <div className="overflow-hidden rounded-2xl border border-[#E8EDF7] bg-white shadow-[0_2px_12px_rgba(15,35,70,0.04)]">
            <CampaignsFilters
              statusTab={statusTab}
              typeTab={typeTab}
              onStatusChange={setStatusTab}
              onTypeChange={setTypeTab}
              resultCount={filteredItems?.length ?? 0}
              totalCount={data?.length ?? 0}
              loading={loading && !data}
            />
            <CampaignsTable
              items={filteredItems}
              loading={loading}
              error={error}
              refresh={refresh}
              embedded
            />
          </div>
        </div>
      </div>
    </div>
  );
}
