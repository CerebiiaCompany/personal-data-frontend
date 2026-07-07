"use client";

import ArcoPortabilityPreview from "@/components/arco/ArcoPortabilityPreview";
import Button from "@/components/base/Button";
import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import { personasTheme } from "@/constants/personasTheme";
import { arcoDownloadPortabilityExport } from "@/lib/arco.api";
import {
  PortabilityExportData,
  PortabilityExportFormat,
} from "@/types/arco.types";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import { useState } from "react";

interface Props {
  requestId: string;
  portabilityExport: PortabilityExportData;
}

const PersonasPortabilityPanel = ({ requestId, portabilityExport }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [downloading, setDownloading] = useState<PortabilityExportFormat | null>(
    null
  );

  async function handleDownload(format: PortabilityExportFormat) {
    setDownloading(format);
    const res = await arcoDownloadPortabilityExport(requestId, format);
    setDownloading(null);
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
          <Icon icon="tabler:package-export" className="text-lg" />
          Ver y descargar la copia de tus datos
        </span>
        <Icon
          icon={expanded ? "tabler:chevron-up" : "tabler:chevron-down"}
          className="text-lg"
        />
      </button>

      {expanded && (
        <div className={clsx(personasTheme.infoBox, "mt-2 p-4")}>
          <ArcoPortabilityPreview data={portabilityExport} />

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              hierarchy="primary"
              loading={downloading === "csv"}
              disabled={downloading !== null}
              onClick={() => handleDownload("csv")}
              startContent={<Icon icon="tabler:file-type-csv" />}
              className="w-full rounded-xl! sm:flex-1"
            >
              Descargar CSV
            </Button>
            <Button
              type="button"
              hierarchy="secondary"
              loading={downloading === "json"}
              disabled={downloading !== null}
              onClick={() => handleDownload("json")}
              startContent={<Icon icon="tabler:file-type-txt" />}
              className="w-full rounded-xl! text-primary-900! sm:flex-1"
            >
              Descargar JSON
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonasPortabilityPanel;
