import { useState, useRef, useId, useCallback } from "react";
import { Control, useController } from "react-hook-form";
import * as z from "zod";

export const MAX_FILES = 5; // max files allowed
export const MAX_SIZE_MB = 5; // max size per file

export function generateFileSchema(
  acceptedTypes: string[],
  maxSizeMB: number = MAX_SIZE_MB
) {
  return z
    .instanceof(File)
    .refine((f) => acceptedTypes.includes(f.type), {
      message: `Tipo no permitido. Usa: ${acceptedTypes.join(", ")}`,
    })
    .refine((f) => f.size <= maxSizeMB * 1024 * 1024, {
      message: `Archivo demasiado grande. Máximo ${maxSizeMB}MB por archivo`,
    });
}

// ---- Dropzone component integrated with RHF ----
interface FormDropzoneProps extends React.ComponentProps<"input"> {
  control: Control;
  label?: string;
  description?: string;
  maxFiles?: number;
  minFiles?: number;
  required?: boolean;
  maxSizeMB?: number;
  name: string;
}

export function CustomFileDropZone<T>({
  name,
  control,
  label = "Archivos",
  description,
  accept,
  maxFiles = MAX_FILES,
  minFiles,
  required,
  maxSizeMB = MAX_SIZE_MB,
}: FormDropzoneProps) {
  const { field, fieldState } = useController({
    name,
    control,
    defaultValue: [],
    rules: {
      validate: (value: File[] | undefined) => {
        if (!required || !minFiles) return true;
        const len = Array.isArray(value) ? value.length : 0;
        return len >= minFiles || `Sube al menos ${minFiles} archivo(s)`;
      },
    },
  });

  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dndId = useId();

  const onFilesAdded = useCallback(
    (files: FileList | File[]) => {
      const incoming = Array.from(files);
      // Enforce count early
      const current = (field.value ?? []) as File[];
      const spaceLeft = Math.max(0, maxFiles - current.length);
      const toAdd = incoming.slice(0, spaceLeft);

      // Filter by type/size here for instant UX; Zod will also validate on submit
      /* const filtered = toAdd.filter(
        (f) =>
          accept?.split(",").includes(f.type) &&
          f.size <= maxSizeMB * 1024 * 1024
      ); */

      field.onChange([...(current || []), ...toAdd]);
    },
    [field, accept, maxFiles, maxSizeMB]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer?.files?.length) {
        onFilesAdded(e.dataTransfer.files);
      }
    },
    [onFilesAdded]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onBrowseClick = useCallback(() => inputRef.current?.click(), []);

  const onPaste = useCallback(
    (e: React.ClipboardEvent) => {
      if (e.clipboardData?.files?.length) {
        onFilesAdded(e.clipboardData.files);
      }
    },
    [onFilesAdded]
  );

  const removeAt = (idx: number) => {
    const current = (field.value ?? []) as File[];
    const next = current.filter((_, i) => i !== idx);
    field.onChange(next);
  };

  const prettySize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <div className="w-full" onPaste={onPaste}>
      <label
        htmlFor={dndId}
        className="block text-sm font-medium text-gray-800 mb-2"
      >
        {label}
        {required && (
          <span className="ml-1 align-super text-xs text-red-600" aria-hidden>
            *
          </span>
        )}
      </label>

      <div
        id={dndId}
        role="group"
        aria-labelledby={`${dndId}-label`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onBrowseClick();
          }
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDragEnd={() => setIsDragging(false)}
        className={[
          "flex h-fit w-full cursor-pointer select-none items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all",
          isDragging
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-300 hover:border-gray-400",
        ].join(" ")}
        onClick={onBrowseClick}
      >
        <div>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Arrastra y suelta</span> tus archivos
            aquí
          </p>
          <p className="mt-1 text-xs text-gray-500">
            o presiona Enter/Espacio para explorar
          </p>
          <p className="mt-2 text-xs text-gray-400">
            Arrastra y suelta; o haz clic para seleccionar.
            {accept && `Tipos permitidos: ${accept}`}
            Tamaño máximo: {prettySize(maxSizeMB * 1024 * 1024)}
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        accept={accept}
        onChange={(e) => {
          const files = e.currentTarget.files;
          if (files && files.length) onFilesAdded(files);
          e.currentTarget.value = ""; // allow selecting same file again
        }}
      />

      {fieldState.error && (
        <p className="mt-2 text-sm text-red-600">{fieldState.error.message}</p>
      )}

      {/* File list */}
      {Array.isArray(field.value) && field.value.length > 0 && (
        <ul className="mt-4 divide-y divide-gray-200 rounded-xl border">
          {field.value.map((file: File, i: number) => (
            <li
              key={`${file.name}-${i}`}
              className="flex flex-col items-start p-3 gap-2"
            >
              <div className="flex items-center justify-between gap-3 w-full">
                <div className="min-w-0">
                  <p
                    className="truncate text-sm font-medium text-gray-800"
                    title={file.name}
                  >
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {file.type || "(sin tipo)"} · {prettySize(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  aria-label={`Eliminar ${file.name}`}
                >
                  Quitar
                </button>
              </div>
              {fieldState.error &&
                Array.isArray(fieldState.error) &&
                (fieldState.error as any)[i] && (
                  <p className="mt-0 text-xs text-red-600">
                    {(fieldState.error as any)[i].message}
                  </p>
                )}
            </li>
          ))}
        </ul>
      )}

      {/* Helper counts */}
      <p className="mt-2 text-xs text-gray-500">
        {Array.isArray(field.value)
          ? `${field.value.length}/${maxFiles} archivos`
          : `0/${maxFiles} archivos`}
      </p>
    </div>
  );
}
