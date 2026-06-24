"use client";

import React, { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Icon } from "@iconify/react";
import LoadingCover from "@/components/layout/LoadingCover";
import { useCollectFormResponses } from "@/hooks/useCollectFormResponses";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { CollectForm } from "@/types/collectForm.types";
import {
  ConsentStatus,
  consentStatusOptions,
  getConsentStatusChipClass,
  getConsentStatusLabel,
  isJuridicaDocType,
  parseCollectFormDocTypeToString,
} from "@/types/collectFormResponse.types";
import { CollectFormResponse } from "@/types/collectFormResponse.types";

interface Props {
  companyId: string;
  sourceFormIds: string[];
  collectForms?: CollectForm[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  error?: string;
}

function formatPersonLabel(response: CollectFormResponse): string {
  const user = response.user;
  if (!user) return "Sin nombre";
  if (isJuridicaDocType(user.docType) && user.razonSocial) {
    return user.razonSocial;
  }
  return [user.name, user.lastName].filter(Boolean).join(" ") || "Sin nombre";
}

function PersonRowCheckbox({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className="custom-checkbox inline-flex shrink-0 cursor-pointer"
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="hidden"
      />
      <div className="checkbox-visual !mr-0" />
    </label>
  );
}

export default function CampaignAudiencePicker({
  companyId,
  sourceFormIds,
  collectForms,
  selectedIds,
  onChange,
  error,
}: Props) {
  const { debouncedValue, search, setSearch } = useDebouncedSearch();
  const [consentStatus, setConsentStatus] = useState<ConsentStatus | "ALL">(
    "ACTIVE"
  );
  const [activeFormId, setActiveFormId] = useState(sourceFormIds[0] || "");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    if (!sourceFormIds.length) {
      setActiveFormId("");
      return;
    }
    if (!sourceFormIds.includes(activeFormId)) {
      setActiveFormId(sourceFormIds[0]);
    }
  }, [sourceFormIds, activeFormId]);

  useEffect(() => {
    setPage(1);
  }, [debouncedValue, consentStatus, activeFormId]);

  const apiSearch = useMemo(() => {
    const value = debouncedValue.trim();
    if (!value) return "";
    const digits = value.replace(/\D/g, "");
    if (digits.length >= 4) return digits;
    return value;
  }, [debouncedValue]);

  const { data, loading, meta } = useCollectFormResponses({
    companyId,
    id: activeFormId,
    search: apiSearch,
    page,
    pageSize,
    consentStatus: consentStatus === "ALL" ? undefined : consentStatus,
  });

  const responses = data?.responses ?? [];
  const totalCount = meta?.totalCount ?? responses.length;
  const totalPages =
    meta?.totalPages ?? Math.max(1, Math.ceil(totalCount / pageSize));

  const activeFormName =
    collectForms?.find((f) => f._id === activeFormId)?.name ?? "Formulario";

  const pageIds = responses.map((r) => r._id || r.id || "").filter(Boolean);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
  const somePageSelected =
    pageIds.some((id) => selectedIds.includes(id)) && !allPageSelected;

  function togglePerson(id: string) {
    if (!id) return;
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  function toggleAllOnPage() {
    if (allPageSelected) {
      onChange(selectedIds.filter((id) => !pageIds.includes(id)));
      return;
    }
    const merged = new Set([...selectedIds, ...pageIds]);
    onChange(Array.from(merged));
  }

  function clearSelection() {
    onChange([]);
  }

  const selectionLabel =
    selectedIds.length === 1
      ? "1 persona seleccionada"
      : `${selectedIds.length} personas seleccionadas`;

  if (!sourceFormIds.length) {
    return (
      <p className="text-sm text-[#64748B]">
        Selecciona al menos un formulario en el paso anterior.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_200px]">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#475569]">
            Buscar persona
          </label>
          <div className="relative">
            <Icon
              icon="tabler:search"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[#94A3B8]"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nombre, documento, correo..."
              className="w-full rounded-lg border border-[#E2E8F0] bg-white py-2.5 pl-10 pr-3 text-sm text-[#0F172A] outline-none transition-colors focus:border-[#1A2B5B] focus:ring-2 focus:ring-[#1A2B5B]/15"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#475569]">
            Consentimiento
          </label>
          <select
            value={consentStatus}
            onChange={(e) =>
              setConsentStatus(e.target.value as ConsentStatus | "ALL")
            }
            className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-[#0F172A] outline-none transition-colors focus:border-[#1A2B5B] focus:ring-2 focus:ring-[#1A2B5B]/15"
          >
            <option value="ALL">Todos</option>
            {consentStatusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {sourceFormIds.length > 1 ? (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#475569]">Formulario</label>
          <select
            value={activeFormId}
            onChange={(e) => setActiveFormId(e.target.value)}
            className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#1A2B5B]"
          >
            {sourceFormIds.map((formId) => {
              const name =
                collectForms?.find((f) => f._id === formId)?.name ?? formId;
              return (
                <option key={formId} value={formId}>
                  {name}
                </option>
              );
            })}
          </select>
        </div>
      ) : (
        <div className="inline-flex items-center gap-2 rounded-lg bg-[#F1F5F9] px-3 py-2 text-xs text-[#475569]">
          <Icon icon="tabler:forms" className="text-base text-[#64748B]" />
          <span>
            Mostrando personas de{" "}
            <span className="font-semibold text-[#1A2B5B]">{activeFormName}</span>
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-gradient-to-r from-[#F8FAFC] to-[#F0F4FF] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#1A2B5B] px-2 text-sm font-bold tabular-nums text-white">
            {selectedIds.length}
          </span>
          <span className="text-sm font-semibold text-[#1A2B5B]">
            {selectionLabel}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={toggleAllOnPage}
            disabled={!responses.length}
            className="text-xs font-semibold text-[#2563EB] hover:underline disabled:opacity-40"
          >
            {allPageSelected ? "Quitar página" : "Seleccionar página"}
          </button>
          {selectedIds.length > 0 ? (
            <button
              type="button"
              onClick={clearSelection}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#64748B] hover:text-[#475569]"
            >
              <Icon icon="tabler:x" className="text-sm" />
              Limpiar todo
            </button>
          ) : null}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
        {loading ? <LoadingCover /> : null}

        {!loading && responses.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-[#64748B]">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F5F9]">
              <Icon icon="tabler:users-minus" className="text-2xl" />
            </div>
            <p className="text-sm font-medium">No hay personas con estos filtros</p>
            <p className="text-xs text-center max-w-sm">
              Prueba otro término de búsqueda o cambia el filtro de consentimiento.
            </p>
          </div>
        ) : (
          <div className="max-h-[380px] overflow-y-auto overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead className="sticky top-0 z-10 bg-[#F4F6FA]">
                <tr>
                  <th className="w-12 border-b border-[#E3E8F2] px-3 py-3 text-left">
                    <label
                      className={clsx(
                        "custom-checkbox inline-flex cursor-pointer",
                        somePageSelected && "opacity-70"
                      )}
                      title={allPageSelected ? "Quitar página" : "Seleccionar página"}
                    >
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = somePageSelected;
                        }}
                        onChange={toggleAllOnPage}
                        className="hidden"
                      />
                      <div className="checkbox-visual !mr-0" />
                    </label>
                  </th>
                  <th className="border-b border-[#E3E8F2] px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-[#7A869D]">
                    Persona
                  </th>
                  <th className="border-b border-[#E3E8F2] px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-[#7A869D]">
                    Documento
                  </th>
                  <th className="border-b border-[#E3E8F2] px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-[#7A869D]">
                    Contacto
                  </th>
                  <th className="border-b border-[#E3E8F2] px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-[#7A869D]">
                    Consentimiento
                  </th>
                </tr>
              </thead>
              <tbody>
                {responses.map((item) => {
                  const id = item._id || item.id || "";
                  const user = item.user;
                  const checked = selectedIds.includes(id);
                  const personName = formatPersonLabel(item);
                  const docLabel = user?.docType
                    ? `${parseCollectFormDocTypeToString(user.docType)} ${user.docNumber ?? ""}`.trim()
                    : "—";
                  const email = user?.email?.trim() || "";
                  const phone = user?.phone?.trim() || "";
                  const consent = item.consent?.status;

                  return (
                    <tr
                      key={id}
                      onClick={() => togglePerson(id)}
                      className={clsx(
                        "cursor-pointer border-b border-[#EEF2F8] transition-colors last:border-b-0",
                        checked
                          ? "bg-[#EFF6FF] hover:bg-[#E0EDFF]"
                          : "bg-white hover:bg-[#F8FAFC]"
                      )}
                    >
                      <td className="px-3 py-3 align-middle">
                        <PersonRowCheckbox
                          checked={checked}
                          onToggle={() => togglePerson(id)}
                        />
                      </td>
                      <td className="px-3 py-3 align-middle">
                        <div className="flex items-center gap-2.5 min-w-[140px]">
                          <span
                            className={clsx(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                              checked
                                ? "bg-[#1A2B5B] text-white"
                                : "bg-[#E8EDF7] text-[#475569]"
                            )}
                          >
                            {personName.charAt(0).toUpperCase()}
                          </span>
                          <span className="text-sm font-semibold text-[#0F172A] truncate max-w-[180px]">
                            {personName}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 align-middle">
                        <span className="text-sm text-[#334155] whitespace-nowrap">
                          {docLabel}
                        </span>
                      </td>
                      <td className="px-3 py-3 align-middle">
                        <div className="flex flex-col gap-0.5 text-xs text-[#64748B] min-w-[120px]">
                          {email ? (
                            <span className="inline-flex items-center gap-1 truncate max-w-[200px]">
                              <Icon
                                icon="tabler:mail"
                                className="shrink-0 text-sm text-[#94A3B8]"
                              />
                              {email}
                            </span>
                          ) : null}
                          {phone ? (
                            <span className="inline-flex items-center gap-1">
                              <Icon
                                icon="tabler:phone"
                                className="shrink-0 text-sm text-[#94A3B8]"
                              />
                              {phone}
                            </span>
                          ) : null}
                          {!email && !phone ? (
                            <span className="text-[#94A3B8]">—</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 py-3 align-middle">
                        <span
                          className={clsx(
                            "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap",
                            getConsentStatusChipClass(consent)
                          )}
                        >
                          {getConsentStatusLabel(consent)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && responses.length > 0 ? (
          <div className="flex items-center justify-between border-t border-[#EEF2F8] bg-[#FAFBFC] px-4 py-2.5 text-xs text-[#64748B]">
            <span>
              Mostrando {responses.length} de{" "}
              {totalCount.toLocaleString("es-CO")} registros
            </span>
            {totalPages > 1 ? (
              <span className="tabular-nums">
                Página {page} de {totalPages}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#334155] transition-colors hover:bg-[#F8FAFC] disabled:opacity-40"
          >
            <Icon icon="tabler:chevron-left" />
            Anterior
          </button>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#334155] transition-colors hover:bg-[#F8FAFC] disabled:opacity-40"
          >
            Siguiente
            <Icon icon="tabler:chevron-right" />
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="text-sm font-medium text-red-600">{error}</p>
      ) : null}

      <p className="text-xs leading-relaxed text-[#64748B]">
        Solo se enviará la campaña a las personas marcadas. Puedes combinar
        registros de distintos formularios cambiando el selector de formulario.
      </p>
    </div>
  );
}
