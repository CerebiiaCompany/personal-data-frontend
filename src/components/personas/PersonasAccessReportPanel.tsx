"use client";

import ArcoAccessReportPreview from "@/components/arco/ArcoAccessReportPreview";
import { personasTheme } from "@/constants/personasTheme";
import { ArcoAccessReportFull } from "@/types/arco.types";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import { useState } from "react";

interface Props {
  accessReport: ArcoAccessReportFull;
}

const PersonasAccessReportPanel = ({ accessReport }: Props) => {
  const [expanded, setExpanded] = useState(false);

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
          Ver informe de acceso entregado
        </span>
        <Icon
          icon={expanded ? "tabler:chevron-up" : "tabler:chevron-down"}
          className="text-lg"
        />
      </button>
      {expanded && (
        <div className={clsx(personasTheme.infoBox, "mt-2 p-4")}>
          <ArcoAccessReportPreview report={accessReport} showOfficerSection />
        </div>
      )}
    </div>
  );
};

export default PersonasAccessReportPanel;
