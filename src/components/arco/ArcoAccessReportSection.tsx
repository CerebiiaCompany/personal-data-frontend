"use client";

import ArcoAccessReportPreview from "@/components/arco/ArcoAccessReportPreview";
import Button from "@/components/base/Button";
import LoadingCover from "@/components/layout/LoadingCover";
import { fetchArcoAccessReport } from "@/lib/arcoAdmin.api";
import { ArcoAccessReportFull } from "@/types/arco.admin.types";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useCallback, useEffect, useState } from "react";

interface Props {
  companyId: string;
  requestId: string;
  embeddedReport?: ArcoAccessReportFull;
}

const ArcoAccessReportSection = ({
  companyId,
  requestId,
  embeddedReport,
}: Props) => {
  const [report, setReport] = useState<ArcoAccessReportFull | null>(
    embeddedReport ?? null
  );
  const [loading, setLoading] = useState(!embeddedReport);
  const [expanded, setExpanded] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchArcoAccessReport(companyId, requestId);
    setLoading(false);
    const resolved =
      res.data?.accessReport ?? res.data?.savedReport ?? null;
    if (resolved) {
      setReport(resolved);
    }
  }, [companyId, requestId]);

  useEffect(() => {
    if (embeddedReport) {
      setReport(embeddedReport);
      setLoading(false);
      return;
    }
    if (expanded && !report) {
      load();
    }
  }, [embeddedReport, expanded, report, load]);

  if (embeddedReport) {
    return (
      <section className="rounded-2xl border border-[#E8EDF7] bg-white p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#1A2B5B]">
          <Icon icon="tabler:file-description" />
          Informe de acceso entregado
        </h2>
        <ArcoAccessReportPreview report={embeddedReport} />
      </section>
    );
  }

  return (
    <section className="relative rounded-2xl border border-[#E8EDF7] bg-white p-5">
      {loading && expanded && <LoadingCover />}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1A2B5B]">
          <Icon icon="tabler:file-description" />
          Informe de acceso
        </h2>
        {!expanded && (
          <Button
            type="button"
            hierarchy="tertiary"
            onClick={() => setExpanded(true)}
            startContent={<Icon icon="tabler:eye" />}
            className="text-sm"
          >
            Ver informe completo
          </Button>
        )}
      </div>
      {expanded && report && (
        <div className="mt-4">
          <ArcoAccessReportPreview report={report} />
        </div>
      )}
      {expanded && !loading && !report && (
        <p className="mt-3 text-sm text-[#64748B]">
          No se encontró el informe de acceso para esta solicitud.
        </p>
      )}
    </section>
  );
};

export default ArcoAccessReportSection;
