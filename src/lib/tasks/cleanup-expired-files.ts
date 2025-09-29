import { db } from '@/db';
import { aiGenerationRecords } from '@/db/schema';
import { lt, and, eq } from 'drizzle-orm';

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

    console.log(`Found ${expiredRecords.length} expired 3D model records`);

    for (const record of expiredRecords) {
      await db.update(aiGenerationRecords)
        .set({
          output_urls: null,
          status: 'expired'
        })
        .where(eq(aiGenerationRecords.uuid, record.uuid));
    }

    console.log(`Cleaned up ${expiredRecords.length} expired files`);

    return {
      success: true,
      cleanedCount: expiredRecords.length
    };

  } catch (error) {
    console.error('Cleanup task failed:', error);
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