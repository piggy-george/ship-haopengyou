import { db } from '@/db';
import { model3dQueue, aiGenerationRecords } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { Model3DService, type Model3DParams } from '@/lib/ai/model3d-service';
import { 
  downloadFileFromUrl, 
  downloadPreviewImage,
  saveMetadata,
  generateFileUrl 
} from '@/lib/storage/local-storage-service';

export interface QueueStats {
  position: number;
  totalInQueue: number;
  estimatedWaitTime: number;
  message: string;
}

export class SmartQueueManager {
  private static instance: SmartQueueManager;
  private processingJobs = new Set<string>();
  private readonly MAX_CONCURRENT = 3;
  private readonly PEAK_HOUR_START = 9;
  private readonly PEAK_HOUR_END = 22;
  private model3dService: Model3DService;

  private constructor() {
    this.model3dService = new Model3DService();
  }

  static getInstance(): SmartQueueManager {
    if (!this.instance) {
      this.instance = new SmartQueueManager();
    }
    return this.instance;
  }

  async addToQueue(recordUuid: string, version: string): Promise<void> {
    const record = await this.getGenerationRecord(recordUuid);
    if (!record) throw new Error('生成记录不存在');

    const isPeakPeriod = this.isPeakHour();
    const estimatedTime = this.calculateEstimatedTime(version, isPeakPeriod);

    await db.insert(model3dQueue).values({
      record_uuid: recordUuid,
      user_uuid: record.user_uuid,
      version,
      status: 'waiting',
      priority: 0,
      peak_period: isPeakPeriod,
      estimated_time: estimatedTime
    });

    this.processQueue();
  }

  private isPeakHour(): boolean {
    const hour = new Date().getHours();
    return hour >= this.PEAK_HOUR_START && hour <= this.PEAK_HOUR_END;
  }

  private async processQueue(): Promise<void> {
    const currentLoad = this.processingJobs.size;
    const isPeak = this.isPeakHour();

    const maxConcurrent = isPeak ? Math.max(1, this.MAX_CONCURRENT - 1) : this.MAX_CONCURRENT;

    if (currentLoad >= maxConcurrent) {
      return;
    }

    const waitingJobs = await db.select().from(model3dQueue)
      .where(eq(model3dQueue.status, 'waiting'))
      .orderBy(asc(model3dQueue.created_at))
      .limit(maxConcurrent - currentLoad);

    for (const job of waitingJobs) {
      if (this.processingJobs.size >= maxConcurrent) break;

      this.processingJobs.add(job.record_uuid);
      this.processJob(job).finally(() => {
        this.processingJobs.delete(job.record_uuid);
        setTimeout(() => this.processQueue(), 2000);
      });
    }
  }

  private async processJob(job: any): Promise<void> {
    try {
      await db.update(model3dQueue)
        .set({ status: 'processing', started_at: new Date() })
        .where(eq(model3dQueue.record_uuid, job.record_uuid));

      await db.update(aiGenerationRecords)
        .set({ status: 'processing', processing_started_at: new Date() })
        .where(eq(aiGenerationRecords.uuid, job.record_uuid));

      const record = await this.getGenerationRecord(job.record_uuid);
      if (!record) throw new Error('生成记录不存在');

      const params = record.params as Model3DParams;
      params.version = job.version as 'basic' | 'pro' | 'rapid';

      const result = await this.model3dService.generateModel(params);

      await db.update(aiGenerationRecords)
        .set({ cloud_job_id: result.jobId })
        .where(eq(aiGenerationRecords.uuid, job.record_uuid));

      await this.pollJobStatus(job.record_uuid, result.jobId, job.version);

    } catch (error: any) {
      console.error('Job processing failed:', error);
      await this.handleJobFailure(job.record_uuid, error.message);
    }
  }

  private async pollJobStatus(recordUuid: string, jobId: string, version: string): Promise<void> {
    const maxAttempts = 60;
    let attempts = 0;

    const pollInterval = setInterval(async () => {
      try {
        attempts++;

        const status = await this.model3dService.queryStatus(jobId, version);

        if (status.status === 'DONE') {
          clearInterval(pollInterval);
          await this.handleJobSuccess(recordUuid, status.resultFiles || []);
        } else if (status.status === 'FAIL') {
          clearInterval(pollInterval);
          await this.handleJobFailure(recordUuid, status.errorMessage || '生成失败');
        } else if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          await this.handleJobFailure(recordUuid, '生成超时,请重试');
        }

      } catch (error: any) {
        console.error('Poll status error:', error);
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          await this.handleJobFailure(recordUuid, '状态查询失败');
        }
      }
    }, 5000);
  }

  private async handleJobSuccess(recordUuid: string, resultFiles: any[]): Promise<void> {
    console.log(`[Model3DQueue] ✅ Job success for: ${recordUuid}`);
    console.log(`[Model3DQueue] Result files count: ${resultFiles.length}`);

    try {
      // 获取记录信息
      const record = await this.getGenerationRecord(recordUuid);
      if (!record) {
        throw new Error('生成记录不存在');
      }

      const userUuid = record.user_uuid;

      // 1️⃣ 立即下载所有文件到本地存储
      console.log(`[Model3DQueue] 🔽 开始下载文件到本地存储...`);
      
      const localFiles: any[] = [];
      let totalSize = 0;

      for (const file of resultFiles) {
        try {
          // 下载模型文件
          const downloadResult = await downloadFileFromUrl(
            file.Url,
            userUuid,
            recordUuid,
            file.Type
          );

          totalSize += downloadResult.size;

          // 生成本地访问URL
          const localUrl = generateFileUrl(recordUuid, downloadResult.filename);

          localFiles.push({
            type: file.Type,
            url: localUrl,  // ⭐ 保存本地URL，而不是腾讯COS URL
            filename: downloadResult.filename,
            size: downloadResult.size,
            localPath: downloadResult.localPath,
            originalUrl: file.Url, // 保留原始URL用于备份
            previewImageUrl: file.PreviewImageUrl
          });

          console.log(`[Model3DQueue] ✅ Downloaded ${file.Type}: ${downloadResult.filename} (${(downloadResult.size / 1024 / 1024).toFixed(2)} MB)`);
        } catch (error) {
          console.error(`[Model3DQueue] ❌ Failed to download ${file.Type}:`, error);
          // 继续处理其他文件，不中断流程
        }
      }

      // 2️⃣ 下载预览图（如果有）
      if (resultFiles[0]?.PreviewImageUrl) {
        try {
          const previewResult = await downloadPreviewImage(
            resultFiles[0].PreviewImageUrl,
            userUuid,
            recordUuid
          );

          if (previewResult.filename) {
            const previewUrl = generateFileUrl(recordUuid, previewResult.filename);
            // 更新第一个文件的预览图URL
            if (localFiles[0]) {
              localFiles[0].previewImageUrl = previewUrl;
            }
            console.log(`[Model3DQueue] ✅ Downloaded preview image: ${previewResult.filename}`);
          }
        } catch (error) {
          console.error(`[Model3DQueue] Failed to download preview image (non-critical):`, error);
        }
      }

      // 3️⃣ 保存元数据
      try {
        const metadata = {
          recordUuid,
          userUuid,
          generatedAt: new Date().toISOString(),
          files: localFiles.map(f => ({
            type: f.type,
            filename: f.filename,
            size: f.size,
            url: f.url
          })),
          totalSize,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          prompt: record.prompt,
          version: record.params?.version || 'unknown'
        };

        await saveMetadata(userUuid, recordUuid, metadata);
        console.log(`[Model3DQueue] ✅ Saved metadata`);
      } catch (error) {
        console.error(`[Model3DQueue] Failed to save metadata (non-critical):`, error);
      }

      // 4️⃣ 更新数据库记录
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await db.update(aiGenerationRecords)
        .set({
          status: 'completed',
          output_urls: localFiles,  // ⭐ 保存本地URL
          completed_at: new Date(),
          expires_at: expiresAt
        })
        .where(eq(aiGenerationRecords.uuid, recordUuid));

      await db.update(model3dQueue)
        .set({ status: 'completed', completed_at: new Date() })
        .where(eq(model3dQueue.record_uuid, recordUuid));

      console.log(`[Model3DQueue] ✅✅ All files downloaded and saved successfully!`);
      console.log(`[Model3DQueue] Total storage used: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`[Model3DQueue] Expires at: ${expiresAt.toISOString()}`);
    } catch (error) {
      console.error(`[Model3DQueue] ❌ Error in handleJobSuccess:`, error);
      // 如果下载失败，标记任务为失败
      await this.handleJobFailure(recordUuid, '文件下载到本地存储失败');
    }
  }

  private async handleJobFailure(recordUuid: string, errorMessage: string): Promise<void> {
    await db.update(aiGenerationRecords)
      .set({
        status: 'failed',
        error_message: errorMessage,
        completed_at: new Date()
      })
      .where(eq(aiGenerationRecords.uuid, recordUuid));

    await db.update(model3dQueue)
      .set({ status: 'failed', completed_at: new Date() })
      .where(eq(model3dQueue.record_uuid, recordUuid));

    const record = await this.getGenerationRecord(recordUuid);
    if (record && record.credits_used > 0) {
      await this.refundCredits(record.user_uuid, record.credits_used, recordUuid);
    }
  }

  async getQueueStatus(recordUuid: string): Promise<QueueStats> {
    const queueItem = await db.select().from(model3dQueue)
      .where(eq(model3dQueue.record_uuid, recordUuid))
      .limit(1);

    if (!queueItem[0]) {
      throw new Error('队列项目不存在');
    }

    if (queueItem[0].status === 'processing') {
      return {
        position: 0,
        totalInQueue: 0,
        estimatedWaitTime: 0,
        message: '正在生成中,请耐心等待...'
      };
    }

    if (queueItem[0].status === 'completed') {
      return {
        position: 0,
        totalInQueue: 0,
        estimatedWaitTime: 0,
        message: '生成已完成'
      };
    }

    const position = await this.calculatePosition(queueItem[0]);
    const totalInQueue = await this.getTotalInQueue();

    return {
      position: position + 1,
      totalInQueue,
      estimatedWaitTime: this.calculateWaitTime(position, queueItem[0].version),
      message: `排队中,前面还有 ${position} 个任务`
    };
  }

  private calculateEstimatedTime(version: string, isPeakPeriod: boolean): number {
    const baseTimes: Record<string, number> = {
      rapid: 60,
      basic: 120,
      pro: 180
    };

    const baseTime = baseTimes[version] || 120;
    return isPeakPeriod ? Math.floor(baseTime * 1.5) : baseTime;
  }

  private calculateWaitTime(position: number, version: string): number {
    const avgTime = this.calculateEstimatedTime(version, this.isPeakHour());
    return Math.ceil(position * avgTime / this.MAX_CONCURRENT);
  }

  private async calculatePosition(job: any): Promise<number> {
    const result = await db.select().from(model3dQueue)
      .where(eq(model3dQueue.status, 'waiting'))
      .orderBy(asc(model3dQueue.created_at));

    return result.findIndex(j => j.record_uuid === job.record_uuid);
  }

  private async getTotalInQueue(): Promise<number> {
    const result = await db.select().from(model3dQueue)
      .where(eq(model3dQueue.status, 'waiting'));
    return result.length;
  }

  private async getGenerationRecord(uuid: string): Promise<any> {
    const result = await db.select().from(aiGenerationRecords)
      .where(eq(aiGenerationRecords.uuid, uuid))
      .limit(1);
    return result[0];
  }

  private async refundCredits(userUuid: string, credits: number, recordUuid: string): Promise<void> {
    const { users, creditTransactions } = await import('@/db/schema');
    const { v4: uuidv4 } = await import('uuid');

    await db.update(users)
      .set({ credits: credits })
      .where(eq(users.uuid, userUuid));

    await db.insert(creditTransactions).values({
      uuid: uuidv4(),
      user_uuid: userUuid,
      type: 'refunded',
      amount: credits,
      reason: 'ai_generation_failed',
      description: '3D生成失败,积分已退还',
      related_uuid: recordUuid
    });
  }
}