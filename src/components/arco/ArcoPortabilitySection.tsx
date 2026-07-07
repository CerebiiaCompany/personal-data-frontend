"use client";

import ArcoPortabilityPreview from "@/components/arco/ArcoPortabilityPreview";
import Button from "@/components/base/Button";
import LoadingCover from "@/components/layout/LoadingCover";
import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import {
  downloadArcoPortabilityExport,
  fetchArcoPortabilityExportPreview,
} from "@/lib/arcoAdmin.api";
import { ArcoPortabilityExportPreview } from "@/types/arco.admin.types";
import { PortabilityExportFormat } from "@/types/arco.types";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useCallback, useEffect, useState } from "react";

interface Props {
  companyId: string;
  requestId: string;
  /**
   * Estado de la solicitud. Se usa para refrescar el preview cuando cambia
   * (p. ej. tras resolver, para mostrar el snapshot guardado en lugar del
   * preview generado al vuelo).
   */
  status?: string;
}

const ArcoPortabilitySection = ({ companyId, requestId, status }: Props) => {
  const [preview, setPreview] = useState<ArcoPortabilityExportPreview | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<PortabilityExportFormat | null>(
    null
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetchArcoPortabilityExportPreview(companyId, requestId);
    setLoading(false);
    if (res.error) {
      setError(res.error.message ?? "No se pudo cargar el export de portabilidad.");
      return;
    }
    setPreview(res.data ?? null);
  }, [companyId, requestId]);

  useEffect(() => {
    load();
  }, [load, status]);

  async function handleDownload(format: PortabilityExportFormat) {
    setDownloading(format);
    const res = await downloadArcoPortabilityExport(companyId, requestId, format);
    setDownloading(null);
    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
    }
  }

  const alreadyResolved = preview?.alreadyResolved === true;

  return (
    <section className="relative rounded-2xl border border-[#E8EDF7] bg-white p-5">
      {loading && <LoadingCover />}

      <div className="mb-4 flex flex-col gap-1">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1A2B5B]">
          <Icon icon="tabler:package-export" />
          Export de portabilidad
        </h2>
        <p className="text-xs text-[#64748B]">
          {alreadyResolved
            ? "Copia entregada al titular al resolver la solicitud."
            : "Vista previa de los datos que se exportarán al resolver. Se genera automáticamente; no requiere completar campos."}
        </p>
      </div>

      {error && !preview && (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-red-600">{error}</p>
          <Button
            type="button"
            hierarchy="secondary"
            onClick={load}
            startContent={<Icon icon="tabler:refresh" />}
            className="text-sm"
          >
            Reintentar
          </Button>
        </div>
      )}

      {preview && (
        <>
          <ArcoPortabilityPreview data={preview.portabilityExport} />

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              hierarchy="secondary"
              loading={downloading === "csv"}
              disabled={downloading !== null}
              onClick={() => handleDownload("csv")}
              startContent={<Icon icon="tabler:file-type-csv" />}
              className="text-sm"
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
              className="text-sm"
            >
              Descargar JSON
            </Button>
          </div>
        </>
      )}
    </section>
  );
};

export default ArcoPortabilitySection;
