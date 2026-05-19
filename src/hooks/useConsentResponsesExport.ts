"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { ConsentExportRequest } from "@/types/consentExport.types";
import {
  handleConsentExportCompleted,
  runConsentResponsesExport,
} from "@/utils/consentExport.utils";

export function useConsentResponsesExport(companyId?: string) {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [activeCollectFormId, setActiveCollectFormId] = useState<
    string | null | undefined
  >(undefined);
  const toastIdRef = useRef<string | number | undefined>(undefined);

  const startExport = useCallback(
    async (params?: ConsentExportRequest) => {
      if (!companyId) {
        toast.error("No se encontró la empresa asociada a tu sesión.");
        return;
      }
      if (exporting) return;

      setExporting(true);
      setProgress(0);
      setActiveCollectFormId(params?.collectFormId ?? null);

      toastIdRef.current = toast.loading("Preparando exportación...");

      try {
        const job = await runConsentResponsesExport(
          companyId,
          params,
          (value) => {
            setProgress(value);
            if (toastIdRef.current !== undefined) {
              toast.loading(`Exportando... ${value}%`, {
                id: toastIdRef.current,
              });
            }
          }
        );

        const result = handleConsentExportCompleted(job);

        if (result.downloaded) {
          toast.success(result.message, { id: toastIdRef.current });
        } else {
          toast.info(result.message, { id: toastIdRef.current });
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Ocurrió un error al exportar los datos.";
        toast.error(message, { id: toastIdRef.current });
      } finally {
        setExporting(false);
        setProgress(null);
        setActiveCollectFormId(undefined);
        toastIdRef.current = undefined;
      }
    },
    [companyId, exporting]
  );

  const isExportingForm = useCallback(
    (collectFormId: string) =>
      exporting && activeCollectFormId === collectFormId,
    [exporting, activeCollectFormId]
  );

  return {
    startExport,
    exporting,
    progress,
    activeCollectFormId,
    isExportingForm,
  };
}
