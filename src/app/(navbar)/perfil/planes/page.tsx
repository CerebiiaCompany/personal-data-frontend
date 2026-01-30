"use client";

import { useSessionStore } from "@/store/useSessionStore";
import { useRouter } from "next/navigation";
import { useCompanyPayments } from "@/hooks/useCompanyPayments";
import { Icon } from "@iconify/react/dist/iconify.js";
import { usePlans } from "@/hooks/usePlans";
import { priceFormatter } from "@/utils/formatters";
import Button from "@/components/base/Button";
import { useOwnCompanyStore } from "@/store/useOwnCompanyStore";
import clsx from "clsx";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppSetting } from "@/hooks/useAppSetting";
import LoadingCover from "@/components/layout/LoadingCover";
import { useCompanyCampaignsDeliveries } from "@/hooks/useCompanyCampaignsDeliveries";
import { useCompanyOtpCodes } from "@/hooks/useCompanyOtpCodes";

export default function ProfilePlansPage() {
  const user = useSessionStore((store) => store.user);
  const router = useRouter();
  const { data, loading, error } = usePlans({});
  const company = useOwnCompanyStore((store) => store.company);

  const campaignsDeliveries = useCompanyCampaignsDeliveries({
    companyId: user?.companyUserData?.companyId,
    /* startDate: new Date().toISOString(), */
  });

  const companyOtpCodes = useCompanyOtpCodes({
    companyId: user?.companyUserData?.companyId,
    /* startDate: new Date().toISOString(), */
  });

  const [creditsConsumed, setCreditsConsumed] = useState<number | null>(null);
  const pricePerSMS = useAppSetting("SMS_PRICE_PER_MESSAGE");

  useEffect(() => {
    if (!pricePerSMS.data) return;
    let totalCredits = 0;
    // Calc total creditsConsumed
    if (campaignsDeliveries.data) {
      totalCredits +=
        campaignsDeliveries.data.length * (pricePerSMS.data.value as number);
    }

    if (companyOtpCodes.data) {
      totalCredits +=
        companyOtpCodes.data.length * (pricePerSMS.data.value as number);
    }

    setCreditsConsumed(totalCredits);
  }, [campaignsDeliveries.data, companyOtpCodes.data, pricePerSMS.data]);

  if (!company) {
    return (
      <div className="w-full h-full relative">
        <LoadingCover />
      </div>
    );
  }

  const planData = company.plan;
  const currentPlanCredits = planData?.monthlyCredits ?? 0;

  return (
    <div className="flex-1 flex h-full flex-col gap-4 max-h-full overflow-y-auto">
      <h6 className="font-bold text-xl text-primary-900 mb-2">Planes</h6>

      {/* Mensaje de construcción */}
      <div className="w-full bg-amber-50 border border-amber-200 rounded-lg p-6 flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-amber-100 p-4">
          <Icon icon={"mdi:hammer-wrench"} className="text-5xl text-amber-600" />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-lg text-amber-900">
            Página en construcción
          </h3>
          <p className="text-sm text-amber-700">
            Estamos trabajando en mejorar esta sección. Pronto podrás gestionar tus planes desde aquí.
          </p>
        </div>
      </div>

      <article className="border border-disabled rounded-md py-5 px-10 flex items-center gap-1 text-center flex-col text-primary-900">
        <h6 className="font-bold leading-tight text-lg">Plan vigente</h6>
        <p className="text-stone-500">
          <b>{planData?.name ?? "Sin plan"}</b> adquirido, total de créditos vigentes{" "}
          {currentPlanCredits} créditos.
        </p>
        <div className="flex justify-between w-full mt-4">
          <p className="font-bold text-lg text-left leading-none">
            {creditsConsumed != null
              ? `${creditsConsumed} Créditos`
              : "Calculando..."}
            <br />
            <span className="text-sm font-normal">Consumidos</span>
          </p>
          <p className="font-bold text-lg text-right leading-none">
            {creditsConsumed != null && currentPlanCredits > 0
              ? `${currentPlanCredits - creditsConsumed} Créditos`
              : "Calculando..."}
            <br />
            <span className="text-sm font-normal">Por consumir</span>
          </p>
        </div>

        <div
          className={`relative w-full bg-stone-200 h-3 overflow-hidden rounded-full mt-1`}
          role="progressbar"
        >
          {creditsConsumed != null && currentPlanCredits > 0 && (
            <div
              className={`h-full rounded-full transition-[width] duration-500 ease-out bg-primary-500`}
              style={{
                width: `${(creditsConsumed / currentPlanCredits) * 100}%`,
              }}
            />
          )}
        </div>
      </article>

      <article className="flex flex-col gap-4 mt-3">
        <h6 className="text-lg font-bold flex gap-2 items-center justify-center text-primary-900">
          <Icon icon={"mdi:sparkles-outline"} className="text-2xl" />
          Mejorar Plan
        </h6>

        <p className="font-normal text-center leading-tight">
          Mejora tu plan y accede a más beneficios, funciones exclusivas y
          mejores resultados. ¡Actualiza hoy!
        </p>
      </article>

      <article className="w-fill gap-x-6 gap-y-4 justify-center flex flex-wrap items-start">
        {loading && (
          <div className="relative h-20 w-full">
            <LoadingCover />
          </div>
        )}
        {data ? (
          data.length ? (
            data.map((plan) => {
              const isCurrentPlan = planData?._id === plan._id;

              return (
                <div
                  className={clsx([
                    "p-4 rounded-md border border-disabled flex flex-col items-start justify-between min-h-72 flex-1 max-w-xs min-w-[200px] gap-2",
                    isCurrentPlan && "border-primary-500",
                  ])}
                  key={plan._id}
                >
                  <h4 className="font-bold text-xl text-primary-900">
                    {plan.name}
                  </h4>
                  {/* Content */}
                  <div className="flex-1">
                    <p className="text-stone-500 text-sm border border-primary-500/40 rounded-sm p-2">
                      <b className="text-primary-500 text-lg">
                        {priceFormatter.format(plan.monthlyCredits)}
                      </b>{" "}
                      Créditos para enviar campañas, códigos e importar
                      usuarios.
                    </p>
                  </div>

                  <p className="text-lg font-bold text-primary-900">
                    <span className="text-sm">$</span>
                    {priceFormatter.format(plan.prices.MONTHLY)} {plan.currency}
                    <span className="text-sm font-normal">/mes</span>
                  </p>

                  <Button
                    disabled={isCurrentPlan}
                    hierarchy={isCurrentPlan ? "secondary" : "primary"}
                    className={clsx([
                      "py-1! w-full",
                      isCurrentPlan && "border-primary-500 text-primary-500",
                    ])}
                  >
                    {isCurrentPlan ? "Plan Actual" : "Mejorar Plan"}
                  </Button>
                </div>
              );
            })
          ) : (
            <p className="text-stone-500">
              No hay planes disponibles para mostrar
            </p>
          )
        ) : null}
      </article>
    </div>
  );
}
