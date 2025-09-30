#!/usr/bin/env node

/**
 * 重置测试用户积分
 * 用于开发环境快速重置测试用户的积分额度
 */

const postgres = require('postgres');
const path = require('path');
const fs = require('fs');

// 加载环境变量 - 尝试多个文件
const envFiles = ['.env.local', '.env'];
let envLoaded = false;

for (const file of envFiles) {
  const envPath = path.join(process.cwd(), file);
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    console.log(`📄 已加载环境变量: ${file}\n`);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  require('dotenv').config();
}

async function resetTestUserCredits() {
  console.log('🔄 开始重置测试用户积分...\n');

  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ 未找到 DATABASE_URL 环境变量');
    console.error('💡 请确保 .env 或 .env.local 文件中配置了 DATABASE_URL');
    return;
  }

  console.log(`🔗 数据库连接: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}\n`);

  const sql = postgres(databaseUrl, {
    max: 1,
  });

  try {
    // 查询测试用户
    const testUsers = await sql`
      SELECT email, credits 
      FROM users 
      WHERE email = 'test@example.com'
    `;

    if (testUsers.length === 0) {
      console.log('❌ 未找到测试用户 (test@example.com)');
      console.log('💡 首次生成时会自动创建测试用户');
      await sql.end();
      return;
    }

    const testUser = testUsers[0];
    console.log('📊 当前测试用户信息：');
    console.log(`   Email: ${testUser.email}`);
    console.log(`   当前积分: ${testUser.credits}`);
    console.log('');

    // 重置积分
    const newCredits = 10000;
    await sql`
      UPDATE users 
      SET credits = ${newCredits} 
      WHERE email = 'test@example.com'
    `;

    console.log('✅ 积分已重置！');
    console.log(`   新积分余额: ${newCredits}`);
    console.log('');
    console.log('💡 现在可以继续测试3D模型生成了！');

  } catch (error) {
    console.error('❌ 重置失败:', error.message);
    if (error.code === '28P01') {
      console.error('💡 提示：数据库认证失败，请检查 DATABASE_URL 中的用户名和密码');
    }
  } finally {
    await sql.end();
  }
}

resetTestUserCredits().catch(console.error);