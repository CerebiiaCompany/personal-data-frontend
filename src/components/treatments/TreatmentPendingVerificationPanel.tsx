"use client";

import Button from "@/components/base/Button";
import { showApiErrorToast } from "@/components/feedback/ApiErrorToast";
import { resolvePendingTreatment } from "@/lib/treatment.api";
import { Treatment } from "@/types/treatment.types";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  companyId: string;
  treatment: Treatment;
  onResolved: () => void;
  /** Abre el diálogo de archivado ya existente en la página de detalle. */
  onRequestArchive: () => void;
}

/** Quita rutas HTTP internas que no deben verse en la ficha. */
function toUserFacingPendingReason(reason: string): string {
  return reason
    .replace(/\s*\(ver\s+(?:GET|POST|PUT|PATCH|DELETE)\s+\/[^)]+\)\.?/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Item C-04/N-15 (mecanismo de "Incertidumbre") — hasta esta implementación
 * el backend podía marcar un Treatment como PENDING_VERIFICATION/
 * PENDING_DEACTIVATION (ver wizardTreatmentGeneration.ts) pero no existía
 * ninguna pantalla para verlo ni resolverlo: quedaba visible solo en la BD.
 *
 * PENDING_DEACTIVATION no archiva por sí solo (ver comentario del schema):
 * "sigue vigente" solo limpia la incertidumbre; "ya no aplica" delega al
 * flujo de archivado ya existente en la página (ArchiveTreatmentDialog) en
 * vez de duplicarlo aquí — el padre debe llamar resolve-pending después de
 * archivar para que la nota no quede huérfana (ver handleArchived).
 */
export default function TreatmentPendingVerificationPanel({
  companyId,
  treatment,
  onResolved,
  onRequestArchive,
}: Props) {
  const [resolutionNote, setResolutionNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (treatment.verificationStatus === "CONFIRMED") return null;

  const note = treatment.pendingNotes?.[0];
  const isDeactivation = treatment.verificationStatus === "PENDING_DEACTIVATION";
  const reasonText = note?.reasonText ? toUserFacingPendingReason(note.reasonText) : null;

  async function handleConfirm() {
    setSubmitting(true);
    const res = await resolvePendingTreatment(companyId, treatment.id, {
      resolutionNote: resolutionNote.trim() || undefined,
    });
    setSubmitting(false);
    if (res.error) {
      showApiErrorToast(res.error, res.error.status);
      return;
    }
    toast.success("Incertidumbre resuelta");
    setResolutionNote("");
    onResolved();
  }

  return (
    <section
      className={`rounded-2xl border p-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:p-6 ${
        isDeactivation ? "border-rose-200 bg-rose-50/60" : "border-orange-200 bg-orange-50/60"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isDeactivation ? "bg-rose-100 text-rose-600" : "bg-orange-100 text-orange-600"
          }`}
        >
          <Icon icon={isDeactivation ? "tabler:alert-triangle" : "tabler:help-circle"} className="text-xl" />
        </span>
        <div className="min-w-0 space-y-1.5">
          <h2 className={`text-sm font-semibold ${isDeactivation ? "text-rose-950" : "text-orange-950"}`}>
            {isDeactivation
              ? "Este tratamiento podría ya no aplicar"
              : "Este tratamiento necesita verificación"}
          </h2>
          <p className={`text-sm leading-relaxed ${isDeactivation ? "text-rose-900/90" : "text-orange-900/90"}`}>
            {reasonText ??
              (isDeactivation
                ? "Algo indica que esta actividad de tratamiento ya no se realiza, pero no se archivó automáticamente."
                : "El wizard generó este tratamiento a partir de una respuesta, pero nadie confirmó todavía que los datos inferidos son correctos.")}
          </p>
          {note?.sourceQuestionKey && (
            <p className="text-xs font-medium text-[#94A3B8]">
              Origen: pregunta {note.sourceQuestionKey} del wizard
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-xs font-medium text-[#64748B]">
          Nota de resolución (opcional)
        </label>
        <textarea
          rows={2}
          value={resolutionNote}
          onChange={(e) => setResolutionNote(e.target.value)}
          placeholder="Ej. Revisé con el área de RR.HH. y el tratamiento sigue vigente."
          className="w-full resize-y rounded-xl border border-[#E4EAF6] bg-white px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-900 focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          loading={submitting}
          onClick={handleConfirm}
          startContent={<Icon icon="tabler:circle-check" />}
          className="border-emerald-600! bg-emerald-600!"
        >
          {isDeactivation ? "Confirmar que sigue vigente" : "Confirmar tratamiento correcto"}
        </Button>
        {isDeactivation ? (
          <Button
            type="button"
            hierarchy="secondary"
            disabled={submitting}
            onClick={onRequestArchive}
            startContent={<Icon icon="tabler:archive" />}
            className="border-rose-300! text-rose-700!"
          >
            Ya no aplica — archivar
          </Button>
        ) : (
          <p className="text-xs text-orange-900/80">
            Si los datos son incorrectos, corrígelos con el botón <strong>Editar</strong> de
            arriba antes de confirmar.
          </p>
        )}
      </div>
    </section>
  );
}
