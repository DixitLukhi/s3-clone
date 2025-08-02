import { NextRequest, NextResponse } from "next/server";
import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.NEXT_PUBLIC_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});

export async function DELETE(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key")!;
  const isFolder = key.endsWith("/");

  if (isFolder) {
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.NEXT_PUBLIC_BUCKET_NAME!,
      Prefix: key,
    });

    const data = await s3.send(listCommand);

    if (!data.Contents || data.Contents.length === 0) {
      return NextResponse.json({ status: "No files to delete" });
    }

    const deleteCommand = new DeleteObjectsCommand({
      Bucket: process.env.NEXT_PUBLIC_BUCKET_NAME!,
      Delete: {
        Objects: data.Contents.map((item) => ({ Key: item.Key! })),
      },
    });

    await s3.send(deleteCommand);
  } else {
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: process.env.NEXT_PUBLIC_BUCKET_NAME!,
        Delete: { Objects: [{ Key: key }] },
      })
    );
  }

  return NextResponse.json({ status: "Deleted" });
}
