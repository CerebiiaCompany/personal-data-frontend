"use server";

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function getPresignedUrl(key: string, download?: string) {
  const s3 = new S3Client({ region: process.env.AWS_REGION });

  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    ResponseContentDisposition: download
      ? `attachment; filename="${download}"`
      : "inline",
  });

  const presignedUrl = await getSignedUrl(s3, command, {
    expiresIn: 3600,
  });

  return presignedUrl;
}
