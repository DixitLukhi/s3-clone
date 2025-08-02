import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.NEXT_PUBLIC_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key")!;
  const command = new GetObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_BUCKET_NAME!,
    Key: key,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 60 });
  return NextResponse.json({ url });
}
