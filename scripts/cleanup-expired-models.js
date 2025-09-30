#!/usr/bin/env node

/**
 * 手动运行清理过期模型任务
 * 
 * 使用方法：
 * node scripts/cleanup-expired-models.js
 * 
 * 或添加到 package.json：
 * "scripts": {
 *   "cleanup": "node scripts/cleanup-expired-models.js"
 * }
 * 然后运行：pnpm cleanup
 */

// 加载环境变量
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// 使用 tsx 运行 TypeScript 文件
const { spawn } = require('child_process');
const path = require('path');

const tsFile = path.join(__dirname, '../src/lib/tasks/cleanup-expired-models.ts');

// 检查是否安装了 tsx
const useTsx = true;

if (useTsx) {
  // 使用 tsx 直接运行 TypeScript，并传递环境变量
  const child = spawn('npx', ['tsx', tsFile], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: process.env  // 传递所有环境变量
  });

  child.on('close', (code) => {
    process.exit(code);
  });
} else {
  // 旧的方式：从编译后的 dist 目录导入
  async function main() {
    try {
      const { cleanupExpiredModels, cleanupOldExpiredRecords } = await import('../dist/lib/tasks/cleanup-expired-models.js');

      await cleanupExpiredModels();
      await cleanupOldExpiredRecords(7);

      console.log('✅ 清理任务完成！');
      process.exit(0);
    } catch (error) {
      console.error('❌ 清理任务失败:', error);
      process.exit(1);
    }
  }

  main();
}
