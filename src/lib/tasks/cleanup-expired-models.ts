/**
 * 定时清理过期的3D模型文件
 * 
 * 功能：
 * 1. 查找所有过期的记录（expires_at < 当前时间）
 * 2. 删除本地存储的文件
 * 3. 更新数据库状态
 * 4. 记录清理统计信息
 * 
 * 使用方法：
 * - 手动运行：node scripts/cleanup-expired-models.js
 * - 定时任务：cron job 每天凌晨运行
 */

// 加载环境变量
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { db } from '@/db';
import { aiGenerationRecords } from '@/db/schema';
import { eq, and, lt } from 'drizzle-orm';
import { deleteRecordFiles, getStorageStats } from '@/lib/storage/local-storage-service';

export interface CleanupStats {
  totalChecked: number;
  totalDeleted: number;
  totalSize: number;
  errors: number;
  duration: number;
}

/**
 * 执行清理过期模型
 */
export async function cleanupExpiredModels(): Promise<CleanupStats> {
  const startTime = Date.now();
  
  console.log('\n========================================');
  console.log('🧹 开始清理过期的3D模型文件...');
  console.log('========================================\n');

  const stats: CleanupStats = {
    totalChecked: 0,
    totalDeleted: 0,
    totalSize: 0,
    errors: 0,
    duration: 0,
  };

  try {
    // 1. 查询所有已过期的completed记录
    const now = new Date();
    console.log(`[Cleanup] 当前时间: ${now.toISOString()}`);
    
    const expiredRecords = await db.select()
      .from(aiGenerationRecords)
      .where(
        and(
          eq(aiGenerationRecords.status, 'completed'),
          lt(aiGenerationRecords.expires_at, now)
        )
      );

    stats.totalChecked = expiredRecords.length;
    console.log(`[Cleanup] 找到 ${stats.totalChecked} 个过期记录\n`);

    if (expiredRecords.length === 0) {
      console.log('✅ 没有需要清理的过期记录');
      stats.duration = Date.now() - startTime;
      return stats;
    }

    // 2. 逐个删除文件
    for (const record of expiredRecords) {
      try {
        console.log(`[Cleanup] 处理记录: ${record.uuid}`);
        console.log(`  - 提示词: ${record.prompt?.substring(0, 50) || 'N/A'}...`);
        console.log(`  - 过期时间: ${record.expires_at?.toISOString() || 'N/A'}`);

        // 计算文件大小
        let recordSize = 0;
        if (record.output_urls && Array.isArray(record.output_urls)) {
          for (const file of record.output_urls) {
            if (file.size) {
              recordSize += file.size;
            }
          }
        }
        stats.totalSize += recordSize;

        // 删除本地文件
        await deleteRecordFiles(record.user_uuid, record.uuid);

        // 更新数据库状态
        await db.update(aiGenerationRecords)
          .set({
            status: 'expired',
            output_urls: [], // 清空URL列表
          })
          .where(eq(aiGenerationRecords.uuid, record.uuid));

        stats.totalDeleted++;
        console.log(`  ✅ 已删除 (${(recordSize / 1024 / 1024).toFixed(2)} MB)\n`);
      } catch (error) {
        stats.errors++;
        console.error(`  ❌ 删除失败:`, error);
        console.log('');
      }
    }

    // 3. 输出统计信息
    stats.duration = Date.now() - startTime;

    console.log('\n========================================');
    console.log('📊 清理统计信息');
    console.log('========================================');
    console.log(`检查记录数: ${stats.totalChecked}`);
    console.log(`成功删除: ${stats.totalDeleted}`);
    console.log(`删除失败: ${stats.errors}`);
    console.log(`释放空间: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`耗时: ${(stats.duration / 1000).toFixed(2)} 秒`);
    console.log('========================================\n');

    // 4. 输出当前存储状态
    try {
      const storageStats = await getStorageStats();
      console.log('📦 当前存储状态:');
      console.log(`  - 总文件数: ${storageStats.fileCount}`);
      console.log(`  - 总大小: ${(storageStats.totalSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  - 用户数: ${storageStats.userCount}`);
      console.log('');
    } catch (error) {
      console.error('获取存储统计信息失败:', error);
    }

    return stats;
  } catch (error) {
    console.error('❌ 清理任务执行失败:', error);
    stats.duration = Date.now() - startTime;
    throw error;
  }
}

/**
 * 清理指定天数之前的过期记录
 * @param days 保留天数（默认7天）
 */
export async function cleanupOldExpiredRecords(days: number = 7): Promise<void> {
  console.log(`\n🗑️  开始清理 ${days} 天前的过期记录...\n`);

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  // 查找并删除old expired records
  const oldExpiredRecords = await db.select()
    .from(aiGenerationRecords)
    .where(
      and(
        eq(aiGenerationRecords.status, 'expired'),
        lt(aiGenerationRecords.expires_at, cutoffDate)
      )
    );

  console.log(`找到 ${oldExpiredRecords.length} 个 ${days} 天前的过期记录`);

  let deleted = 0;
  for (const record of oldExpiredRecords) {
    try {
      // 确保文件已删除
      await deleteRecordFiles(record.user_uuid, record.uuid);

      // 从数据库删除记录
      await db.delete(aiGenerationRecords)
        .where(eq(aiGenerationRecords.uuid, record.uuid));

      deleted++;
    } catch (error) {
      console.error(`删除记录 ${record.uuid} 失败:`, error);
    }
  }

  console.log(`✅ 成功删除 ${deleted} 条过期记录\n`);
}

/**
 * 预览即将过期的记录（用于提醒用户）
 * @param days 提前几天提醒（默认1天）
 */
export async function getExpiringRecords(days: number = 1): Promise<any[]> {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);

  const expiringRecords = await db.select()
    .from(aiGenerationRecords)
    .where(
      and(
        eq(aiGenerationRecords.status, 'completed'),
        lt(aiGenerationRecords.expires_at, endDate)
      )
    );

  return expiringRecords.filter(
    record => record.expires_at && new Date(record.expires_at) > startDate
  );
}

/**
 * 主函数：当直接运行此文件时执行
 */
if (require.main === module) {
  (async () => {
    try {
      console.log('🚀 启动3D模型清理任务...\n');
      
      // 1. 清理过期的模型文件
      const stats = await cleanupExpiredModels();
      
      // 2. 清理7天前的expired记录
      await cleanupOldExpiredRecords(7);
      
      console.log('\n✅ 所有清理任务完成！');
      process.exit(0);
    } catch (error) {
      console.error('\n❌ 清理任务执行失败:', error);
      process.exit(1);
    }
  })();
}
