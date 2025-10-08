export async function createUploadIntent(opts: {
  mimeType: string;
  size: number;
  purpose?: string;
}) {
  const res = await fetch("/api/uploads/intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts),
  });

  if (!res.ok) throw new Error("Failed to create upload intent");
  return res.json() as Promise<{ key: string; url: string; expiresIn: number }>;
}

export async function uploadWithPresignedUrl(url: string, file: File) {
  // Note: fetch doesn’t expose progress; for progress use XHR or axios
  const put = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });
  if (!put.ok) throw new Error("Upload to S3 failed");
}

export async function finalizeUpload(opts: {
  key: string;
  expectedMime?: string;
}) {
  const res = await fetch("/api/uploads/finalize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts),
  });
  if (!res.ok) throw new Error("Failed to finalize upload");
  return res.json() as Promise<{ ok: true; key: string }>;
}
