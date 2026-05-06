"use client";

import Button from "@/components/base/Button";
import UploadTemplateDialog from "@/components/dialogs/UploadTemplateDialog";
import LoadingCover from "@/components/layout/LoadingCover";
import CheckPermission from "@/components/checkers/CheckPermission";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { usePolicyTemplates } from "@/hooks/usePolicyTemplates";
import { deletePolicyTemplate } from "@/lib/policyTemplate.api";
import { getPolicyTemplateFileUrl } from "@/lib/policyTemplate.api";
import { useSessionStore } from "@/store/useSessionStore";
import { parseApiError } from "@/utils/parseApiError";
import { showDialog } from "@/utils/dialogs.utils";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { usePermissionCheck } from "@/hooks/usePermissionCheck";
import { useConfirm } from "@/components/dialogs/ConfirmProvider";
import Link from "next/link";
import clsx from "clsx";
import type { PolicyTemplate } from "@/types/policyTemplate.types";

function formatTemplateFileMeta(file: PolicyTemplate["file"]): string {
  const ext = (file.originalName.split(".").pop() || "pdf").toUpperCase();
  const kb = Math.max(1, Math.round(Number(file.size) / 1024));
  return `${ext} - ${kb} KB`;
}

const topCardClass =
  "bg-white border border-[#E8EDF7] rounded-2xl shadow-[0_2px_10px_rgba(15,35,70,0.03)]";

export default function TemplatesPage() {
  const user = useSessionStore((store) => store.user);
  const { can } = usePermissionCheck();
  const confirm = useConfirm();
  const { data, loading, error, refresh } = usePolicyTemplates({
    companyId: user?.companyUserData?.companyId,
  });

  async function viewInWeb(policyTemplateId: string, download?: string) {
    const companyId = user?.companyUserData?.companyId;
    if (!companyId) {
      toast.error("No se pudo obtener la información de la compañía");
      return;
    }

    try {
      const res = await getPolicyTemplateFileUrl(companyId, policyTemplateId);

      if (res.error) {
        return toast.error(parseApiError(res.error));
      }

      if (!res.data?.url) {
        return toast.error("Error al obtener la URL del archivo");
      }

      const a = document.createElement("a");
      a.href = res.data.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      if (download) {
        a.download = download;
      }

      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      toast.error("Error al obtener la URL del archivo");
      console.error(e);
    }
  }

  async function deleteTemplate(policyId: string) {
    const confirmed = await confirm({
      title: "⚠️ Eliminar Plantilla",
      description: (
        <div className="space-y-3">
          <p className="font-semibold text-primary-900">
            Esta acción es irreversible y puede causar pérdida de datos.
          </p>
          <p className="text-stone-600">Al eliminar esta plantilla:</p>
          <ul className="list-disc list-inside text-sm text-stone-600 space-y-1 ml-2">
            <li>Se eliminará permanentemente del sistema</li>
            <li>Los formularios que la usan podrían verse afectados</li>
            <li>No podrás recuperar esta información</li>
          </ul>
          <p className="text-sm font-medium text-red-600 mt-3">
            ¿Estás seguro de que deseas continuar?
          </p>
        </div>
      ),
      confirmText: "Sí, eliminar plantilla",
      cancelText: "Cancelar",
      danger: true,
    });

    if (!confirmed) return;

    const companyId = user?.companyUserData?.companyId;
    if (!companyId) return;

    const res = await deletePolicyTemplate(companyId, policyId);

    if (res.error) {
      return toast.error(parseApiError(res.error));
    }

    toast.success("Plantilla eliminada");
    refresh();
  }

  return (
    <div className="flex flex-col h-full min-h-0 min-w-0 w-full bg-[#F9FBFF]">
      <UploadTemplateDialog refresh={refresh} />

      {/* Tarjeta superior (mismo patrón que /admin/recoleccion) */}
      <div className="px-5 md:px-6 pt-4 shrink-0">
        <div className="max-w-[1200px] mx-auto w-full">
          <section className={clsx(topCardClass, "px-5 md:px-6 py-4 md:py-5")}>
            <header className="w-full flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-2">
                <nav className="flex flex-wrap items-center gap-2 text-sm text-[#7384A6]">
                  <Link href="/admin" className="hover:underline">
                    Inicio
                  </Link>
                  <Icon
                    icon="tabler:chevron-right"
                    className="text-base shrink-0"
                  />
                  <span className="text-[#1D2E56] font-semibold">Plantillas</span>
                </nav>
                <h1 className="text-[24px] sm:text-[26px] leading-tight font-bold text-[#0B1737]">
                  Plantillas
                </h1>
                <p className="text-[#6F7F9F] text-[13px] max-w-2xl leading-relaxed mt-1">
                  Gestiona tus documentos legales y plantillas de formularios.
                </p>
              </div>

              <CheckPermission group="templates" permission="create">
                <div className="flex flex-wrap items-center gap-2 lg:gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      showDialog(HTML_IDS_DATA.uploadTemplateDialog)
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-[#E3E9F4] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#334155] hover:bg-[#F4F7FE] transition-colors"
                  >
                    <Icon icon="tabler:upload" className="text-lg" />
                    Subir archivo
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      toast.info(
                        "La creación de plantillas con IA estará disponible próximamente."
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-[13px] font-semibold text-white hover:brightness-95 transition-all shadow-[0_4px_14px_rgba(37,99,235,0.35)]"
                  >
                    <Icon icon="tabler:sparkles" className="text-lg" />
                    Crear con IA
                  </button>
                </div>
              </CheckPermission>
            </header>
          </section>
        </div>
      </div>

      {/* Rejilla de plantillas */}
      <div className="px-5 md:px-6 py-4 md:py-5 flex-1 flex flex-col min-h-0 min-w-0">
        <div className="max-w-[1200px] mx-auto w-full flex-1 min-w-0">
          {error && (
            <p className="text-red-600 text-sm font-medium mb-4">{error}</p>
          )}

          <div
            className={clsx(
              "w-full grid gap-5",
              can("templates.create")
                ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            )}
          >
            <CheckPermission group="templates" permission="create">
              {!loading && (
                <button
                  type="button"
                  onClick={() =>
                    toast.info(
                      "La creación de plantillas con IA estará disponible próximamente."
                    )
                  }
                  className={clsx(
                    "w-full min-h-[220px] rounded-2xl border-2 border-dashed border-[#93C5FD]",
                    "bg-gradient-to-b from-[#EFF6FF] to-white",
                    "flex flex-col items-center justify-center gap-3 px-6 py-8 text-center",
                    "transition-[box-shadow,transform] hover:shadow-md hover:border-[#60A5FA]"
                  )}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-lg shadow-blue-500/25">
                    <Icon icon="tabler:sparkles" className="text-2xl" />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-[#0B1737]">
                      Crear plantilla con IA
                    </p>
                    <p className="text-[13px] text-[#64748B] mt-1 max-w-[240px] mx-auto leading-snug">
                      Genera políticas y consentimientos automáticamente
                    </p>
                  </div>
                </button>
              )}
            </CheckPermission>

            {loading && (
              <div className="col-span-full relative min-h-[200px] rounded-2xl border border-[#E8EDF7] bg-white">
                <LoadingCover />
              </div>
            )}

            {data && data.length > 0
              ? data.map((policyTemplate) => (
                  <article
                    key={policyTemplate._id}
                    className={clsx(
                      "flex flex-col rounded-2xl border border-[#E8EDF7] bg-white p-5 sm:p-6",
                      "shadow-[0_2px_12px_rgba(15,35,70,0.06)] min-h-[220px]"
                    )}
                  >
                    <div className="flex gap-4 min-w-0">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#E8F1FE] text-[#2563EB]">
                        <Icon icon="tabler:file-text" className="text-2xl" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-[13px] sm:text-sm font-bold text-[#0B1737] uppercase tracking-wide leading-snug line-clamp-3">
                          {policyTemplate.name}
                        </h2>
                        <p className="text-[12px] text-[#94A3B8] mt-2">
                          {formatTemplateFileMeta(policyTemplate.file)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex gap-3 items-stretch">
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <Button
                          onClick={() => viewInWeb(policyTemplate._id)}
                          startContent={
                            <Icon
                              icon="tabler:external-link"
                              className="text-base"
                            />
                          }
                          className="w-full! rounded-xl! border-[#E3E9F4]! text-[13px]! py-2.5! justify-center"
                          hierarchy="secondary"
                        >
                          Ver en la web
                        </Button>
                        <Button
                          onClick={() =>
                            viewInWeb(
                              policyTemplate._id,
                              `${policyTemplate.name}.${policyTemplate.file.originalName.split(".").pop()}`
                            )
                          }
                          startContent={
                            <Icon icon="tabler:download" className="text-base" />
                          }
                          className="w-full! rounded-xl! border-[#E3E9F4]! text-[13px]! py-2.5! justify-center"
                          hierarchy="secondary"
                        >
                          Descargar
                        </Button>
                      </div>
                      <CheckPermission group="templates" permission="delete">
                        <button
                          type="button"
                          onClick={() => deleteTemplate(policyTemplate._id)}
                          className="flex h-[88px] w-11 shrink-0 items-center justify-center self-stretch rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          aria-label="Eliminar plantilla"
                        >
                          <Icon icon="tabler:trash" className="text-xl" />
                        </button>
                      </CheckPermission>
                    </div>
                  </article>
                ))
              : null}

            {!loading && data && data.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#CBD5E1] bg-white/80 py-14 px-4">
                <p className="text-center text-[#64748B] text-sm font-medium">
                  No hay plantillas para mostrar
                </p>
                <CheckPermission group="templates" permission="create">
                  <p className="text-center text-[#94A3B8] text-xs mt-2 max-w-sm">
                    Sube un archivo o crea una plantilla con IA para empezar.
                  </p>
                </CheckPermission>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
