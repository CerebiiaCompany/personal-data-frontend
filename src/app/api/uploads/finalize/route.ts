import { NextRequest, NextResponse } from "next/server";
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";

// Validar variables de entorno
if (!process.env.AWS_REGION) {
  console.error("❌ AWS_REGION no está definida en finalize route");
}

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined,
});

export async function POST(req: NextRequest) {
  try {
    const { key, expectedMime, maxSize = 10 * 1024 * 1024 } = await req.json();
    console.log("🔍 Finalize request:", { key, expectedMime, maxSize });
    
    if (!key)
      return NextResponse.json({ error: "key required" }, { status: 400 });
    
    if (!process.env.S3_BUCKET) {
      console.error("❌ S3_BUCKET no está definida");
      return NextResponse.json(
        { error: "S3_BUCKET not configured" },
        { status: 500 }
      );
    }

    const head = await s3.send(
      new HeadObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
      })
    );

    // Validate size/type if you want strict checks
    if (!head.ContentLength || head.ContentLength > maxSize) {
      return NextResponse.json({ error: "Invalid file size" }, { status: 400 });
    }
    if (
      expectedMime &&
      head.ContentType &&
      !head.ContentType.startsWith(expectedMime)
    ) {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 400 }
      );
    }

    // → here you'd persist `key` into your DB along with the entity you're creating
    // await db.something.insert({ ..., fileKey: key })
    
    console.log("✅ File validated successfully:", key);

    return NextResponse.json({ ok: true, key });
  } catch (err: any) {
    console.error("❌ Error in finalize:", err);
    console.error("Error details:", {
      message: err.message,
      code: err.code,
      name: err.name,
    });
    return NextResponse.json(
      { error: `Finalize failed: ${err.message}` },
      { status: 500 }
    );
  }
}
