import { NextRequest, NextResponse } from "next/server";
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";

const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function POST(req: NextRequest) {
  try {
    const { key, expectedMime, maxSize = 10 * 1024 * 1024 } = await req.json();
    if (!key)
      return NextResponse.json({ error: "key required" }, { status: 400 });

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

    // → here you’d persist `key` into your DB along with the entity you’re creating
    // await db.something.insert({ ..., fileKey: key })

    return NextResponse.json({ ok: true, key });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Finalize failed" }, { status: 500 });
  }
}
