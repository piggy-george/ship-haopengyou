#!/usr/bin/env node

/**
 * 检查现有3D模型记录的状态
 * 显示URL格式、过期状态等信息
 */

async function main() {
  try {
    // 动态导入
    const { db } = await import('../dist/db/index.js');
    const { aiGenerationRecords, users } = await import('../dist/db/schema/index.js');
    const { eq, desc } = await import('drizzle-orm');

    console.log('\n========================================');
    console.log('🔍 检查现有3D模型记录');
    console.log('========================================\n');

    // 获取测试用户
    const userResult = await db.select().from(users)
      .where(eq(users.email, 'test@example.com'))
      .limit(1);

    if (!userResult[0]) {
      console.log('❌ 测试用户不存在');
      process.exit(1);
    }

    const user = userResult[0];
    console.log(`✅ 用户: ${user.email} (${user.uuid})\n`);

    // 获取用户的所有completed记录
    const records = await db.select()
      .from(aiGenerationRecords)
      .where(eq(aiGenerationRecords.user_uuid, user.uuid))
      .orderBy(desc(aiGenerationRecords.created_at))
      .limit(20);

    console.log(`📊 找到 ${records.length} 条记录\n`);

    if (records.length === 0) {
      console.log('⚠️ 没有找到任何记录');
      console.log('💡 请先生成一个新的3D模型\n');
      process.exit(0);
    }

    // 分析每条记录
    const now = new Date();
    let completedCount = 0;
    let expiredCount = 0;
    let failedCount = 0;
    let withLocalUrl = 0;
    let withCosUrl = 0;

    console.log('----------------------------------------');
    
    for (const record of records) {
      const isExpired = record.expires_at && new Date(record.expires_at) < now;
      const hasOutputUrls = record.output_urls && Array.isArray(record.output_urls) && record.output_urls.length > 0;
      
      console.log(`\n📦 记录: ${record.uuid}`);
      console.log(`   提示词: ${record.prompt?.substring(0, 50) || 'N/A'}...`);
      console.log(`   状态: ${record.status}`);
      console.log(`   创建时间: ${record.created_at?.toISOString() || 'N/A'}`);
      console.log(`   过期时间: ${record.expires_at?.toISOString() || 'N/A'}`);
      console.log(`   是否过期: ${isExpired ? '⚠️ 是' : '✅ 否'}`);
      
      if (record.status === 'completed') completedCount++;
      if (record.status === 'failed') failedCount++;
      if (isExpired) expiredCount++;

      if (hasOutputUrls) {
        console.log(`   输出文件: ${record.output_urls.length} 个`);
        
        for (let i = 0; i < record.output_urls.length; i++) {
          const file = record.output_urls[i];
          const url = file.url || '';
          const isLocal = url.startsWith('/api/storage/');
          const isCos = url.includes('tencentcos.cn') || url.includes('cos.ap-');
          
          if (isLocal) withLocalUrl++;
          if (isCos) withCosUrl++;
          
          console.log(`   文件 ${i + 1}:`);
          console.log(`     类型: ${file.type || 'N/A'}`);
          console.log(`     URL类型: ${isLocal ? '🟢 本地存储' : isCos ? '🔵 腾讯COS' : '⚪ 未知'}`);
          console.log(`     URL: ${url.substring(0, 80)}${url.length > 80 ? '...' : ''}`);
          
          if (file.size) {
            console.log(`     大小: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
          }
        }
      } else {
        console.log(`   输出文件: ❌ 无`);
      }
    }

    console.log('\n========================================');
    console.log('📊 统计信息');
    console.log('========================================');
    console.log(`总记录数: ${records.length}`);
    console.log(`已完成: ${completedCount}`);
    console.log(`已失败: ${failedCount}`);
    console.log(`已过期: ${expiredCount}`);
    console.log(`使用本地存储URL: ${withLocalUrl} 个文件`);
    console.log(`使用腾讯COS URL: ${withCosUrl} 个文件`);
    console.log('========================================\n');

    if (withCosUrl > 0) {
      console.log('💡 提示:');
      console.log('   - 现有模型使用的是腾讯COS URL（24小时有效）');
      console.log('   - 如果未过期，可以正常预览和下载');
      console.log('   - 如果已过期，会显示"模型链接已过期"');
      console.log('   - 新生成的模型会自动使用本地存储（7天有效）');
      console.log('');
      console.log('🔄 如需迁移现有模型到本地存储，请运行:');
      console.log('   node scripts/migrate-existing-models.js');
      console.log('');
    }

    if (withLocalUrl > 0) {
      console.log('✅ 部分模型已使用本地存储！');
      console.log('');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 检查失败:', error);
    process.exit(1);
  }
}

main();
