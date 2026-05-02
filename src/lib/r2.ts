import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from './env';

let cached: S3Client | null = null;

function getR2(): S3Client {
  if (!env.hasR2()) {
    throw new Error('R2 is not configured');
  }
  if (cached) return cached;
  cached = new S3Client({
    region: 'auto',
    endpoint: env.r2Endpoint(),
    credentials: {
      accessKeyId: env.r2AccessKeyId(),
      secretAccessKey: env.r2SecretAccessKey(),
    },
  });
  return cached;
}

export async function presignUpload(
  key: string,
  contentType: string,
  expiresInSeconds = 60 * 5,
): Promise<string> {
  const cmd = new PutObjectCommand({
    Bucket: env.r2Bucket(),
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(getR2(), cmd, { expiresIn: expiresInSeconds });
}

export async function presignDownload(key: string, expiresInSeconds = 60 * 60): Promise<string> {
  const cmd = new GetObjectCommand({ Bucket: env.r2Bucket(), Key: key });
  return getSignedUrl(getR2(), cmd, { expiresIn: expiresInSeconds });
}

export async function deleteObject(key: string): Promise<void> {
  await getR2().send(new DeleteObjectCommand({ Bucket: env.r2Bucket(), Key: key }));
}

// For public-bucket cases (e.g. blog hero images served from a custom domain).
export function publicUrl(key: string): string | null {
  const base = env.r2PublicBaseUrl();
  if (!base) return null;
  return `${base.replace(/\/$/, '')}/${key.replace(/^\//, '')}`;
}
