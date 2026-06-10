"use client";

import { arcoGetCompanyRightsAttention } from "@/lib/arco.api";
import { ArcoRightsAttentionPublic } from "@/types/arco.types";
import { formatArcoOfficerName } from "@/utils/arcoOfficers.utils";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useEffect, useState } from "react";

interface Props {
  companyId: string;
}

const PersonasRightsAttentionCard = ({ companyId }: Props) => {
  const [data, setData] = useState<ArcoRightsAttentionPublic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    arcoGetCompanyRightsAttention(companyId).then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (res.error || !res.data) {
        setData(null);
        return;
      }
      setData(res.data);
    });
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  const hasOfficers = (data?.officers?.length ?? 0) > 0;
  const hasPhone = Boolean(data?.phoneLine?.trim());

  if (loading || (!hasOfficers && !hasPhone)) {
    return null;
  }

  return (
    <p className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
      <span className="inline-flex items-center gap-1 font-medium text-zinc-600">
        <Icon icon="tabler:headset" className="text-sm" />
        Atención de derechos
      </span>
      {hasPhone && (
        <>
          <span aria-hidden>·</span>
          <a
            href={`tel:${data!.phoneLine!.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-1 hover:text-primary-900"
          >
            <Icon icon="tabler:phone" className="text-sm" />
            {data!.phoneLine}
          </a>
        </>
      )}
      {hasOfficers &&
        data!.officers!.map((officer, index) => (
          <span key={`${officer.email ?? officer.name}-${index}`} className="contents">
            <span aria-hidden>·</span>
            {officer.email ? (
              <a
                href={`mailto:${officer.email}`}
                className="hover:text-primary-900"
                title={officer.position}
              >
                {formatArcoOfficerName(officer)}
              </a>
            ) : (
              <span title={officer.position}>
                {formatArcoOfficerName(officer)}
              </span>
            )}
          </span>
        ))}
    </p>
  );
};

export default PersonasRightsAttentionCard;
