"use client";

import ArcoAccessReportPreview from "@/components/arco/ArcoAccessReportPreview";
import Button from "@/components/base/Button";
import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import { personasTheme } from "@/constants/personasTheme";
import { arcoDownloadAccessReportPdf } from "@/lib/arco.api";
import { ArcoAccessReportFull } from "@/types/arco.types";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import { useState } from "react";

interface Props {
  requestId: string;
  accessReport: ArcoAccessReportFull;
}

const PersonasAccessReportPanel = ({ requestId, accessReport }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  async function handleDownloadPdf() {
    setDownloadingPdf(true);
    const res = await arcoDownloadAccessReportPdf(requestId);
    setDownloadingPdf(false);
    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={clsx(
          "flex w-full items-center justify-between gap-2 rounded-xl border border-primary-200/80 bg-primary-50/50 px-3 py-2.5 text-left text-sm font-medium text-primary-900 transition-colors hover:bg-primary-50",
          personasTheme.link
        )}
      >
        <span className="flex items-center gap-2">
          <Icon icon="tabler:file-description" className="text-lg" />
          Ver los datos que la empresa te entregó
        </span>
        <Icon
          icon={expanded ? "tabler:chevron-up" : "tabler:chevron-down"}
          className="text-lg"
        />
      </button>
      {expanded && (
        <div className={clsx(personasTheme.infoBox, "mt-2 p-4")}>
          <ArcoAccessReportPreview report={accessReport} showOfficerSection />
          <Button
            type="button"
            hierarchy="primary"
            loading={downloadingPdf}
            onClick={handleDownloadPdf}
            startContent={<Icon icon="tabler:download" />}
            className="mt-4 w-full rounded-xl!"
          >
            Descargar informe PDF
          </Button>
        </div>
      )}
    </div>
  );
};

export default PersonasAccessReportPanel;
