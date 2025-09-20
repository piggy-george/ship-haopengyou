interface StorageConfig {
  endpoint: string;
  region: string;
  accessKey: string;
  secretKey: string;
}

export function newStorage(config?: StorageConfig) {
  return new Storage(config);
}

export class Storage {
  private endpoint: string;
  private accessKeyId: string;
  private secretAccessKey: string;
  private bucket: string;
  private region: string;

  constructor(config?: StorageConfig) {
    this.endpoint = config?.endpoint || process.env.STORAGE_ENDPOINT || "";
    this.accessKeyId =
      config?.accessKey || process.env.STORAGE_ACCESS_KEY || "";
    this.secretAccessKey =
      config?.secretKey || process.env.STORAGE_SECRET_KEY || "";
    this.bucket = process.env.STORAGE_BUCKET || "";
    this.region = config?.region || process.env.STORAGE_REGION || "auto";
  }

  async uploadFile({
    body,
    key,
    contentType,
    bucket,
    onProgress,
    disposition = "inline",
  }: {
    body: Buffer | Uint8Array;
    key: string;
    contentType?: string;
    bucket?: string;
    onProgress?: (progress: number) => void;
    disposition?: "inline" | "attachment";
  }) {
    const uploadBucket = bucket || this.bucket;
    if (!uploadBucket) {
      throw new Error("Bucket is required");
    }

    const bodyArray = body instanceof Buffer ? new Uint8Array(body) : body;

    const url = `${this.endpoint}/${uploadBucket}/${key}`;

    const { AwsClient } = await import("aws4fetch");

    const client = new AwsClient({
      accessKeyId: this.accessKeyId,
      secretAccessKey: this.secretAccessKey,
    });

    const headers: Record<string, string> = {
      "Content-Type": contentType || "application/octet-stream",
      "Content-Disposition": disposition,
      "Content-Length": bodyArray.length.toString(),
    };

    const request = new Request(url, {
      method: "PUT",
      headers,
      body: body instanceof Buffer ? body : new Uint8Array(body),
    });

    const response = await client.fetch(request);

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return {
      location: url,
      bucket: uploadBucket,
      key,
      filename: key.split("/").pop(),
      url: process.env.STORAGE_DOMAIN
        ? `${process.env.STORAGE_DOMAIN}/${key}`
        : url,
    };
  }

  async downloadAndUpload({
    url,
    key,
    bucket,
    contentType,
    disposition = "inline",
  }: {
    url: string;
    key: string;
    bucket?: string;
    contentType?: string;
    disposition?: "inline" | "attachment";
  }) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("No body in response");
    }

    const arrayBuffer = await response.arrayBuffer();
    const body = new Uint8Array(arrayBuffer);

    return this.uploadFile({
      body,
      key,
      bucket,
      contentType,
      disposition,
    });
  }
}

// 简化的上传函数
export async function uploadToStorage(file: File, folder: string = 'uploads', userId?: string): Promise<string> {
  const storage = newStorage()

  // 生成唯一文件名
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const fileExtension = file.name.split('.').pop()
  const fileName = `${timestamp}_${randomString}.${fileExtension}`

  // 构建存储路径
  const key = userId
    ? `${folder}/${userId}/${fileName}`
    : `${folder}/${fileName}`

  // 转换文件为Buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  // 上传文件
  const result = await storage.uploadFile({
    body: buffer,
    key,
    contentType: file.type,
    disposition: 'inline'
  })

  return result.url
}
