import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "node:crypto";

export const runtime = "nodejs"; // ensure Node runtime (not edge)

const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function POST(req: NextRequest) {
  try {
    const { mimeType, size, purpose = "generic" } = await req.json();

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
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      ContentType: mimeType,
      // Server-side encryption (optional, recommended)
      // ServerSideEncryption: "AES256",
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 }); // 5 minutes

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
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create upload intent" },
      { status: 500 }
    );
  }
}
