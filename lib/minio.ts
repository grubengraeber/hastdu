import * as Minio from 'minio';

const isConfigured = Boolean(
  process.env.MINIO_ENDPOINT &&
  process.env.MINIO_ACCESS_KEY &&
  process.env.MINIO_SECRET_KEY
);

export const minioClient = isConfigured
  ? new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT!,
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY!,
      secretKey: process.env.MINIO_SECRET_KEY!,
    })
  : null;

export const BUCKET_NAME = process.env.MINIO_BUCKET || 'hastdu-images';

export async function ensureBucketExists() {
  if (!minioClient) {
    console.warn('Minio client not configured');
    return;
  }
  
  const exists = await minioClient.bucketExists(BUCKET_NAME);
  if (!exists) {
    await minioClient.makeBucket(BUCKET_NAME);
    // Set public read policy
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
        },
      ],
    };
    await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
  }
}

export async function uploadFile(file: Buffer, fileName: string, contentType: string): Promise<string> {
  if (!minioClient) {
    throw new Error('Minio client not configured');
  }
  
  await ensureBucketExists();
  const key = `${Date.now()}-${fileName}`;
  await minioClient.putObject(BUCKET_NAME, key, file, file.length, {
    'Content-Type': contentType,
  });
  return key;
}

export async function deleteFile(key: string): Promise<void> {
  if (!minioClient) {
    console.warn('Minio client not configured, skipping delete');
    return;
  }
  
  await minioClient.removeObject(BUCKET_NAME, key);
}

export function getPublicUrl(key: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
  if (baseUrl) {
    return `${baseUrl}/${key}`;
  }
  const ssl = process.env.MINIO_USE_SSL === 'true';
  const protocol = ssl ? 'https' : 'http';
  return `${protocol}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${BUCKET_NAME}/${key}`;
}
