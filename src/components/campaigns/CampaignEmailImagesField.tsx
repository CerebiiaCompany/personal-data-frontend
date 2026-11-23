"use client";

import { useRef, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import { toast } from "sonner";
import { uploadCampaignEmailImage } from "@/lib/campaign.api";
import { EMAIL_IMAGE_MAX_MB, EMAIL_MAX_IMAGES } from "@/types/campaign.types";
import { parseApiError } from "@/utils/parseApiError";

const NAVY = "#1A2B5B";
const ACCEPTED = ["image/png", "image/jpeg", "image/gif", "image/webp"];

interface Props {
  companyId?: string;
  value: string[];
  onChange: (urls: string[]) => void;
}

/**
 * Imágenes del cuerpo de una campaña de EMAIL. Cada imagen se sube al
 * backend apenas se elige (devuelve una URL pública estable) y en el correo
 * se muestran debajo del texto, en el orden de esta lista.
 */
export default function CampaignEmailImagesField({ companyId, value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);

  const remaining = EMAIL_MAX_IMAGES - value.length - uploading;

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || !companyId) return;
    const files = Array.from(fileList);
    if (inputRef.current) inputRef.current.value = "";

    if (files.length > remaining) {
      toast.warning(`Puedes agregar máximo ${EMAIL_MAX_IMAGES} imágenes por correo.`);
    }
    const toUpload = files.slice(0, Math.max(0, remaining)).filter((f) => {
      if (!ACCEPTED.includes(f.type)) {
        toast.error(`"${f.name}": formato no permitido. Usa PNG, JPG, GIF o WEBP.`);
        return false;
      }
      if (f.size > EMAIL_IMAGE_MAX_MB * 1024 * 1024) {
        toast.error(`"${f.name}" supera el máximo de ${EMAIL_IMAGE_MAX_MB} MB.`);
        return false;
      }
      return true;
    });
    if (!toUpload.length) return;

    setUploading((n) => n + toUpload.length);
    const uploaded: string[] = [];
    for (const file of toUpload) {
      const res = await uploadCampaignEmailImage(companyId, file);
      if (res.data?.url) uploaded.push(res.data.url);
      else toast.error(`"${file.name}": ${res.error ? parseApiError(res.error) : "no se pudo subir"}`);
      setUploading((n) => n - 1);
    }
    if (uploaded.length) onChange([...value, ...uploaded]);
  }

  function move(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-bold" style={{ color: NAVY }}>
          Imágenes <span className="font-normal text-[#94A3B8]">(opcional)</span>
        </span>
        <span className="text-xs text-[#94A3B8]">
          {value.length} / {EMAIL_MAX_IMAGES}
        </span>
      </div>

      {value.length > 0 && (
        <ul className="flex flex-col gap-2">
          {value.map((url, i) => (
            <li
              key={url}
              className="flex items-center gap-3 rounded-lg border border-[#E2E8F0] bg-white p-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Imagen ${i + 1}`}
                className="h-16 w-24 shrink-0 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] object-cover"
              />
              <span className="flex-1 text-xs text-[#64748B]">Imagen {i + 1}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label="Subir imagen"
                  className="rounded-md p-1.5 text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-30"
                >
                  <Icon icon="tabler:arrow-up" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === value.length - 1}
                  aria-label="Bajar imagen"
                  className="rounded-md p-1.5 text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-30"
                >
                  <Icon icon="tabler:arrow-down" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label="Quitar imagen"
                  className="rounded-md p-1.5 text-red-500 hover:bg-red-50"
                >
                  <Icon icon="tabler:trash" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={remaining <= 0 || !companyId}
        className={clsx(
          "flex items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-4 text-sm font-semibold transition",
          remaining <= 0
            ? "cursor-not-allowed border-[#E2E8F0] text-[#94A3B8]"
            : "border-[#CBD5E1] text-[#1A2B5B] hover:border-[#1A2B5B] hover:bg-[#F8FAFC]"
        )}
      >
        <Icon
          icon={uploading > 0 ? "svg-spinners:180-ring" : "tabler:photo-plus"}
          className="text-lg"
        />
        {uploading > 0
          ? `Subiendo ${uploading} imagen(es)…`
          : remaining <= 0
            ? "Llegaste al máximo de imágenes"
            : "Agregar imágenes"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        multiple
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />
      <p className="text-xs text-[#94A3B8]">
        PNG, JPG, GIF o WEBP · máx. {EMAIL_IMAGE_MAX_MB} MB c/u · se muestran debajo del texto, en este
        orden. Recomendado: 600 px de ancho.
      </p>
    </div>
  );
}
