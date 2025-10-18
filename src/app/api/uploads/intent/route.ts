import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "node:crypto";

export const runtime = "nodejs"; // ensure Node runtime (not edge)

// Validar que las variables de entorno estén configuradas
if (!process.env.AWS_REGION) {
  console.error("❌ AWS_REGION no está definida");
  console.error("Variables disponibles:", {
    AWS_REGION: process.env.AWS_REGION,
    S3_BUCKET: process.env.S3_BUCKET,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? "***definida***" : "undefined",
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? "***definida***" : "undefined",
  });
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
    const { mimeType, size, purpose = "generic" } = await req.json();
    
    // Log para debugging
    console.log("📤 Upload intent request:", { mimeType, size, purpose });

    // Validar que S3_BUCKET esté configurado
    if (!process.env.S3_BUCKET) {
      console.error("❌ S3_BUCKET no está definida");
      return NextResponse.json(
        { error: "S3_BUCKET not configured" },
        { status: 500 }
      );
    }

    // 1) Basic validation — tune per your needs
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (!mimeType || typeof size !== "number") {
      return NextResponse.json(
        { error: "mimeType and size required" },
        { status: 400 }
      );
    }
    if (size <= 0 || size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large or invalid size" },
        { status: 413 }
      );
    }

    // 2) Build a namespaced, unique key
    // If you have auth, inject tenant/user IDs here from your session
    const key = `uploads/${purpose}/${crypto.randomUUID()}`;

    // 3) Presign PUT
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      ContentType: mimeType,
      // Server-side encryption (optional, recommended)
      // ServerSideEncryption: "AES256",
    });
    
    console.log("🔑 Generating signed URL for bucket:", process.env.S3_BUCKET);

    const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 }); // 5 minutes
    
    console.log("✅ Signed URL generated successfully");

    return NextResponse.json({
      key,
      url,
      expiresIn: 300,
      constraints: {
        maxSize: MAX_SIZE,
        mimeTypes: ["image/", "application/pdf"], // example policy
      },
    });
  } catch (err: any) {
    console.error("❌ Error in upload intent:", err);
    console.error("Error details:", {
      message: err.message,
      code: err.code,
      name: err.name,
    });
    return NextResponse.json(
      { error: `Failed to create upload intent: ${err.message}` },
      { status: 500 }
    );
  }
}
