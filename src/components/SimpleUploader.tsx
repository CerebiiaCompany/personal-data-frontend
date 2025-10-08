"use client";

import { useState } from "react";
import {
  createUploadIntent,
  uploadWithPresignedUrl,
  finalizeUpload,
} from "@/lib/uploadToS3";

export default function SimpleUploader({
  purpose = "avatar",
}: {
  purpose?: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const onUpload = async () => {
    if (!file) return;

    try {
      setStatus("Creating upload intent...");
      const intent = await createUploadIntent({
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        purpose,
      });

      setStatus("Uploading to S3...");
      await uploadWithPresignedUrl(intent.url, file);

      setStatus("Finalizing...");
      await finalizeUpload({
        key: intent.key,
        expectedMime: file.type.split("/")[0],
      }); // e.g. "image"

      setStatus("Done! Stored key: " + intent.key);
      // Now send `intent.key` as part of your real "create" flow, e.g. POST /api/things { fileKey: intent.key, ... }
    } catch (err: any) {
      console.error(err);
      setStatus("Error: " + err.message);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <input type="file" onChange={onSelect} />
      <button
        className="px-3 py-2 rounded bg-primary-500 text-white disabled:opacity-50"
        onClick={onUpload}
        disabled={!file}
      >
        Upload
      </button>
      <p className="text-sm text-stone-600">{status}</p>
    </div>
  );
}
