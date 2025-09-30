import { db } from '@/db';
import { aiGenerationRecords } from '@/db/schema';
import { lt, and, eq } from 'drizzle-orm';
import { deleteRecordFiles } from '@/lib/storage/local-storage-service';

export async function cleanupExpiredFiles() {
  try {
    const now = new Date();

    const expiredRecords = await db.select()
      .from(aiGenerationRecords)
      .where(
        and(
          lt(aiGenerationRecords.expires_at, now),
          eq(aiGenerationRecords.status, 'completed')
        )
      );

    console.log(`[Cleanup] 🔍 Found ${expiredRecords.length} expired 3D model records`);

    let successCount = 0;
    let failCount = 0;

    for (const record of expiredRecords) {
      try {
        console.log(`[Cleanup] 🗑️  Cleaning record: ${record.uuid}`);
        
        // 1. 删除本地文件
        await deleteRecordFiles(record.user_uuid, record.uuid);
        console.log(`[Cleanup] ✅ Deleted local files for ${record.uuid}`);

        // 2. 更新数据库记录
        await db.update(aiGenerationRecords)
          .set({
            output_urls: null,
            status: 'expired'
          })
          .where(eq(aiGenerationRecords.uuid, record.uuid));
        
        console.log(`[Cleanup] ✅ Updated database record ${record.uuid}`);
        successCount++;
        
      } catch (error) {
        console.error(`[Cleanup] ❌ Failed to cleanup record ${record.uuid}:`, error);
        failCount++;
        // 继续处理其他记录
      }
    }

    console.log(`[Cleanup] 📊 Summary: ${successCount} succeeded, ${failCount} failed`);

    return {
      success: true,
      cleanedCount: successCount,
      failedCount: failCount,
      totalFound: expiredRecords.length
    };

  } catch (error) {
    console.error('[Cleanup] ❌ Cleanup task failed:', error);
    throw error;
  }
}

if (require.main === module) {
  cleanupExpiredFiles()
    .then(result => {
      console.log('Cleanup completed:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('Cleanup failed:', error);
      process.exit(1);
    });
}