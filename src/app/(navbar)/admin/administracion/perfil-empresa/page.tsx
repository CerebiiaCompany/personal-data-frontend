"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";

import { useSessionStore } from "@/store/useSessionStore";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";

import IdentificationSection from "@/components/company-profile/IdentificationSection";
import LegalRepresentativeSection from "@/components/company-profile/LegalRepresentativeSection";
import DataProtectionOfficerSection from "@/components/company-profile/DataProtectionOfficerSection";
import AuthorizedPersonnelSection from "@/components/company-profile/AuthorizedPersonnelSection";
import EconomicActivitySection from "@/components/company-profile/EconomicActivitySection";
import PersonalDataCollectedSection from "@/components/company-profile/PersonalDataCollectedSection";
import ProcessingPurposesSection from "@/components/company-profile/ProcessingPurposesSection";
import InternationalTransfersSection from "@/components/company-profile/InternationalTransfersSection";
import RightsAttentionSection from "@/components/company-profile/RightsAttentionSection";
import InternalRegulationsSection from "@/components/company-profile/InternalRegulationsSection";
import SpecialObservationsSection from "@/components/company-profile/SpecialObservationsSection";

const topCardClass =
  "bg-white border border-[#E8EDF7] rounded-2xl shadow-[0_2px_12px_rgba(15,35,70,0.04)]";

export default function CompanyProfilePage() {
  const user = useSessionStore((s) => s.user);
  const companyId = user?.company?._id;

  const { data: profile, loading, error } = useCompanyProfile(companyId);

  if (loading) {
    return (
      <div className="flex min-h-0 w-full flex-1 items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 text-[#64748B]">
          <span className="inline-block h-8 w-8 rounded-full border-2 border-[#3357A5] border-t-transparent animate-spin" />
          <p className="text-sm">Cargando perfil de la empresa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-0 w-full flex-1 items-center justify-center py-20">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="flex min-h-0 w-full flex-1 items-center justify-center py-20">
        <p className="text-sm text-[#64748B]">No se encontró la empresa.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col bg-[#F8FAFC]">
      {/* Header */}
      <div className="w-full px-5 pt-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <section className={`${topCardClass} px-5 py-5 sm:px-6 sm:py-6`}>
          <div className="min-w-0 flex-1 space-y-2">
            <nav className="flex flex-wrap items-center gap-2 text-sm text-[#64748B]">
              <Link href="/admin" className="hover:underline">
                Inicio
              </Link>
              <Icon
                icon="tabler:chevron-right"
                className="text-base shrink-0 text-[#94A3B8]"
              />
              <Link href="/admin/administracion" className="hover:underline">
                Administración
              </Link>
              <Icon
                icon="tabler:chevron-right"
                className="text-base shrink-0 text-[#94A3B8]"
              />
              <span className="font-semibold text-[#1A2B5B]">
                Perfil de empresa
              </span>
            </nav>
            <h1 className="text-[26px] font-bold leading-tight tracking-tight text-[#1A2B5B] sm:text-[28px]">
              Perfil de empresa
            </h1>
            <p className="max-w-2xl text-[13px] leading-relaxed text-[#64748B] sm:text-sm">
              Completa y mantén actualizada la información de tu empresa para el
              cumplimiento de la Ley 1581 de Protección de Datos.
            </p>
          </div>
        </section>
      </div>

      {/* Sections */}
      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col px-5 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8 xl:px-10 2xl:px-12">
        <div className="flex flex-col gap-6">
          <IdentificationSection companyId={companyId} profile={profile} />
          <LegalRepresentativeSection companyId={companyId} profile={profile} />
          <DataProtectionOfficerSection />
          <AuthorizedPersonnelSection companyId={companyId} profile={profile} />
          <EconomicActivitySection companyId={companyId} profile={profile} />
          <PersonalDataCollectedSection
            companyId={companyId}
            profile={profile}
          />
          <ProcessingPurposesSection companyId={companyId} profile={profile} />
          <InternationalTransfersSection
            companyId={companyId}
            profile={profile}
          />
          <RightsAttentionSection companyId={companyId} profile={profile} />
          <InternalRegulationsSection companyId={companyId} profile={profile} />
          <SpecialObservationsSection companyId={companyId} profile={profile} />
        </div>
      </div>
    </div>
  );
}
