import { NextRequest, NextResponse } from "next/server";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.NEXT_PUBLIC_REGION_LD!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_LD!,
    secretAccessKey: process.env.AWS_SECRET_KEY_LD!,
  },
});

export async function GET(req: NextRequest) {
  const folderPath = req.nextUrl.searchParams.get("path") || "";

  const command = new ListObjectsV2Command({
    Bucket: process.env.NEXT_PUBLIC_BUCKET_NAME_LD!,
    Prefix: folderPath,
    Delimiter: "/",
  });

  const data = await s3.send(command);

  const files = (data.Contents || [])
    .filter((item) => item.Key !== folderPath)
    .map((item) => ({
      key: item.Key!,
      lastModified: item.LastModified!,
      size: item.Size!,
    }));

  const folders = (data.CommonPrefixes || []).map((prefix) => ({
    prefix: prefix.Prefix!,
  }));

  return NextResponse.json({ files, folders });
}
