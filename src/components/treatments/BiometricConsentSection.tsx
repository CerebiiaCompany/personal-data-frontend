"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import Button from "@/components/base/Button";
import CustomInput from "@/components/forms/CustomInput";
import CustomSelect from "@/components/forms/CustomSelect";
import {
  downloadConsentDocument,
  fetchConsentRequests,
  sendConsentRequests,
} from "@/lib/biometricConsent.api";
import {
  CONSENT_CODE_STATUS_LABELS,
  ConsentRequestListItem,
  ConsentRequestTitularInput,
} from "@/types/biometricConsent.types";
import { DocType } from "@/types/user.types";
import { parseDocTypeToString } from "@/types/user.types";

interface Props {
  companyId: string;
  treatmentId: string;
}

const sectionClass =
  "rounded-2xl border border-[#E8EDF7] bg-white p-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:p-6";

const DOC_TYPE_OPTIONS: { value: DocType; title: string }[] = (
  ["RUT", "CI", "PASSPORT", "OTHER"] as DocType[]
).map((value) => ({ value, title: parseDocTypeToString(value) }));

const EMPTY_DRAFT: ConsentRequestTitularInput = { name: "", docType: "RUT", docNumber: "", email: "" };

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-CL", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/**
 * Item D-01/N-02/N-03/N-04/N-09 — Panel de Consentimiento Biométrico. Solo se
 * muestra en tratamientos con dataCategories incluyendo BIOMETRIC (ver
 * gating en la página de detalle). El backend ya hace todo el trabajo
 * pesado (OTP, hash SHA-256, envío por correo) — este panel es la única
 * forma de disparar el envío y ver el estado por titular, que antes no
 * existía en ninguna pantalla.
 */
export default function BiometricConsentSection({ companyId, treatmentId }: Props) {
  const [requests, setRequests] = useState<ConsentRequestListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<ConsentRequestTitularInput[]>([]);
  const [draft, setDraft] = useState<ConsentRequestTitularInput>(EMPTY_DRAFT);
  const [sending, setSending] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetchConsentRequests(companyId, treatmentId);
    setLoading(false);
    if (res.data) setRequests(res.data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, treatmentId]);

  function addToPending() {
    if (!draft.name.trim() || !draft.docNumber.trim() || !draft.email.trim()) {
      toast.error("Nombre, documento y correo son obligatorios");
      return;
    }
    setPending((prev) => [...prev, { ...draft, name: draft.name.trim(), docNumber: draft.docNumber.trim(), email: draft.email.trim().toLowerCase() }]);
    setDraft(EMPTY_DRAFT);
  }

  function removePending(index: number) {
    setPending((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSend() {
    if (pending.length === 0) {
      toast.error("Agrega al menos un titular antes de enviar");
      return;
    }
    setSending(true);
    const res = await sendConsentRequests(companyId, treatmentId, pending);
    setSending(false);
    if (res.error) {
      toast.error(res.error.message ?? "No se pudo enviar la solicitud de consentimiento");
      return;
    }
    const failed = res.data?.sent.filter((s) => !s.emailSent).length ?? 0;
    if (failed > 0) {
      toast.warning(`Se registró la solicitud, pero ${failed} correo(s) no se pudieron enviar — puedes reintentar agregando el titular de nuevo.`);
    } else {
      toast.success("Solicitud de consentimiento enviada");
    }
    setPending([]);
    load();
  }

  async function handleDownload(consentId: string) {
    setDownloadingId(consentId);
    const res = await downloadConsentDocument(companyId, treatmentId, consentId);
    setDownloadingId(null);
    if (res.error) {
      toast.error(res.error.message ?? "No se pudo descargar el documento");
    }
  }

  return (
    <section className={sectionClass}>
      <h2 className="mb-1 text-sm font-semibold text-[#1A2B5B]">Consentimiento biométrico</h2>
      <p className="mb-4 text-xs text-[#64748B]">
        Este tratamiento involucra datos biométricos (Art. 16, Ley 21.719). Envía a cada titular un
        correo con el documento de consentimiento y un código de verificación — la confirmación
        queda registrada con hash SHA-256 en el Log de Auditoría, sin necesidad de firma en papel.
      </p>

      <div className="flex flex-col gap-4">
        {loading ? (
          <p className="text-xs text-[#94A3B8]">Cargando solicitudes…</p>
        ) : requests.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {requests.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E4EAF6] bg-[#F8FAFC] px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1A2B5B]">
                    {r.titularName}{" "}
                    <span className="font-normal text-[#64748B]">
                      ({parseDocTypeToString(r.titularDocType)} {r.titularDocNumber})
                    </span>
                  </p>
                  <p className="text-xs text-[#64748B]">{r.titularEmail}</p>
                  {r.codeStatus === "VERIFIED" && r.documentSha256 && (
                    <p className="mt-1 break-all font-mono text-[10px] text-emerald-800/90" title="Hash SHA-256 del PDF confirmado">
                      SHA-256: {r.documentSha256}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      r.codeStatus === "VERIFIED"
                        ? "bg-emerald-50 text-emerald-700"
                        : r.codeStatus === "EXPIRED"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    <Icon icon={r.codeStatus === "VERIFIED" ? "tabler:circle-check" : r.codeStatus === "EXPIRED" ? "tabler:clock-x" : "tabler:clock-hour-4"} className="text-xs" />
                    {CONSENT_CODE_STATUS_LABELS[r.codeStatus]}
                    {r.codeStatus === "VERIFIED" && r.verifiedAt ? ` · ${formatDateTime(r.verifiedAt)}` : ""}
                  </span>
                  {r.codeStatus === "VERIFIED" && (
                    <button
                      type="button"
                      onClick={() => handleDownload(r.id)}
                      disabled={downloadingId === r.id}
                      className="inline-flex items-center justify-center rounded-lg p-1.5 text-[#1A2B5B] hover:bg-[#EEF3FB] disabled:opacity-50"
                      aria-label={`Descargar consentimiento de ${r.titularName}`}
                    >
                      <Icon icon="tabler:download" className="text-lg" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-[#94A3B8]">Todavía no se envió ninguna solicitud de consentimiento.</p>
        )}

        <div className="rounded-xl border border-[#EAF0FA] bg-[#FAFCFF] p-4">
          <p className="mb-3 text-sm font-medium text-[#1A2B5B]">Agregar titulares para enviar</p>

          {pending.length > 0 && (
            <ul className="mb-3 flex flex-col gap-1.5">
              {pending.map((t, i) => (
                <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-xs text-[#475569] ring-1 ring-[#E4EAF6]">
                  <span className="truncate">
                    {t.name} — {parseDocTypeToString(t.docType)} {t.docNumber} — {t.email}
                  </span>
                  <button type="button" onClick={() => removePending(i)} className="shrink-0 text-red-500 hover:text-red-700" aria-label="Quitar">
                    <Icon icon="tabler:x" className="text-sm" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <CustomInput
              label="Nombre completo"
              name="titularName"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="Nombre del titular"
            />
            <CustomSelect
              label="Tipo de documento"
              options={DOC_TYPE_OPTIONS}
              value={draft.docType}
              onChange={(v) => setDraft((d) => ({ ...d, docType: v }))}
            />
            <CustomInput
              label="Número de documento"
              name="titularDocNumber"
              value={draft.docNumber}
              onChange={(e) => setDraft((d) => ({ ...d, docNumber: e.target.value }))}
              placeholder="Ej. 12345678-9"
            />
            <CustomInput
              label="Correo electrónico"
              name="titularEmail"
              type="email"
              value={draft.email}
              onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
              placeholder="titular@correo.cl"
            />
            <div className="sm:col-span-2">
              <Button type="button" hierarchy="secondary" onClick={addToPending} startContent={<Icon icon="tabler:plus" className="text-lg" />}>
                Agregar a la lista
              </Button>
            </div>
          </div>

          {pending.length > 0 && (
            <div className="mt-3">
              <Button type="button" loading={sending} onClick={handleSend} startContent={<Icon icon="tabler:send" className="text-lg" />}>
                Enviar solicitud a {pending.length} titular{pending.length === 1 ? "" : "es"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
