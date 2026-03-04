import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// 懒加载 S3Client 避免构建期报错（如果 env 未备齐）
function getS3Client() {
  if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_ENDPOINT_URL) {
    throw new Error("Cloudflare R2 credentials (R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT_URL) are missing in .env");
  }

  return new S3Client({
    region: 'auto', // Cloudflare R2 always uses 'auto'
    endpoint: process.env.R2_ENDPOINT_URL,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    }
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const bucketName = process.env.R2_BUCKET_NAME;
    const publicUrl = process.env.R2_PUBLIC_URL; // eg: https://pub-xxxxxx.r2.dev

    if (!bucketName || !publicUrl) {
      return NextResponse.json({ success: false, error: 'Cloudflare R2 bucket name or public URL is missing in .env' }, { status: 500 });
    }

    const s3 = getS3Client();

    // 将上传的文件转换为 Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 为防止重名碰撞或中文乱码，使用时间戳+安全字符处理文件名
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueKey = `uploads/${Date.now()}-${safeFilename}`;

    // 使用 AWS SDK 将文件流上传到 R2
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: uniqueKey,
      Body: buffer,
      ContentType: file.type,
      // 如果需要在公开前台访问，确保 R2 桶策略允许公开访问，通常此处不需要配置 ACL
    });

    await s3.send(command);

    // 返回拼接好的前台公网可访问 CDN 链接
    const finalUrl = `${publicUrl.replace(/\/$/, '')}/${uniqueKey}`;

    return NextResponse.json({ 
      success: true, 
      url: finalUrl 
    });
  } catch (error: any) {
    console.error("R2 Upload Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
