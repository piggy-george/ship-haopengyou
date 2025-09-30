# 本地3D模型存储目录

## 📁 目录结构

```
storage/
└── 3d-models/
    └── {user_uuid}/           # 按用户分类
        └── {record_uuid}/     # 按生成记录分类
            ├── model.glb      # GLB格式模型
            ├── model.obj      # OBJ格式模型
            ├── model.fbx      # FBX格式模型
            ├── model.stl      # STL格式模型
            ├── preview.jpg    # 预览图
            └── metadata.json  # 元数据
```

## 🔄 工作流程

### 1. 文件生成
当用户成功生成3D模型后：
- ✅ 系统自动从腾讯混元COS下载文件
- ✅ 保存到本地存储 `/storage/3d-models/{user_uuid}/{record_uuid}/`
- ✅ 数据库保存本地URL：`/api/storage/3d-models/{record_uuid}/model.glb`
- ✅ 设置7天过期时间

### 2. 文件访问
用户访问文件时：
- 🔒 验证用户身份和权限
- ⏰ 检查是否过期
- 📦 返回文件内容
- 🚀 支持浏览器缓存（24小时）

### 3. 文件清理
定时任务自动清理：
- 🗑️ 删除过期文件（expires_at < 当前时间）
- 🧹 更新数据库状态为 'expired'
- 📊 生成清理统计报告

## 🛠️ 使用方法

### 手动运行清理任务
```bash
# 清理过期文件
pnpm cleanup

# 或直接运行脚本
node scripts/cleanup-expired-models.js
```

### 设置定时任务（推荐）
编辑 crontab：
```bash
crontab -e
```

添加每天凌晨2点执行清理：
```
0 2 * * * cd /home/ubuntu/ship-haopengyou && node scripts/cleanup-expired-models.js >> logs/cleanup.log 2>&1
```

### 查看存储使用情况
```bash
# 查看总大小
du -sh storage/3d-models/

# 查看文件数量
find storage/3d-models/ -type f | wc -l

# 查看各用户占用空间
du -h --max-depth=1 storage/3d-models/
```

## 📊 存储估算

### 单个模型大小（参考）
- GLB: 2-10 MB
- OBJ: 1-5 MB
- FBX: 3-15 MB
- STL: 1-8 MB
- 预览图: 100-500 KB

### 容量规划
- 每个生成记录: 平均 5-20 MB
- 100个模型: 约 0.5-2 GB
- 1000个模型: 约 5-20 GB

### 清理策略
- ✅ 7天后自动过期
- ✅ 用户可手动删除
- ✅ 定时任务自动清理
- ✅ 保留expired状态记录（数据库）

## 🔒 安全措施

### 权限控制
- ✅ 验证用户登录状态
- ✅ 只能访问自己的文件
- ✅ 检查文件是否过期
- ✅ 防止路径遍历攻击

### 存储隔离
- ✅ 按用户UUID分类存储
- ✅ 不同用户文件完全隔离
- ✅ 文件名标准化，避免冲突

## 🚀 性能优化

### 缓存策略
- 浏览器缓存: 24小时
- CDN加速: 可选（未来）

### 文件压缩
- GLB已压缩（推荐格式）
- OBJ/FBX较大（按需）

## 📝 元数据示例

`metadata.json`:
```json
{
  "recordUuid": "abc-123-def",
  "userUuid": "user-456-xyz",
  "generatedAt": "2025-09-30T10:00:00.000Z",
  "files": [
    {
      "type": "GLB",
      "filename": "model.glb",
      "size": 5242880,
      "url": "/api/storage/3d-models/abc-123-def/model.glb"
    }
  ],
  "totalSize": 5242880,
  "expiresAt": "2025-10-07T10:00:00.000Z",
  "prompt": "一只可爱的小猫",
  "version": "rapid"
}
```

## ⚠️ 注意事项

1. **备份重要**: 定期备份整个 `storage/` 目录
2. **磁盘监控**: 监控磁盘使用率，避免空间不足
3. **权限设置**: 确保 Node.js 进程有读写权限
4. **日志记录**: 清理任务日志用于排查问题
5. **迁移计划**: 如需迁移到云存储，保持API接口不变

## 🔧 故障排查

### 文件找不到
```bash
# 检查文件是否存在
ls -la storage/3d-models/{user_uuid}/{record_uuid}/

# 检查权限
ls -ld storage/3d-models/
```

### 空间不足
```bash
# 检查磁盘空间
df -h

# 手动清理过期文件
pnpm cleanup
```

### 访问被拒绝
- 检查数据库中的 user_uuid 是否匹配
- 检查文件的 expires_at 是否过期
- 检查登录状态

## 📚 相关文件

- 存储服务: `src/lib/storage/local-storage-service.ts`
- 访问API: `src/app/api/storage/3d-models/[...path]/route.ts`
- 清理任务: `src/lib/tasks/cleanup-expired-models.ts`
- 队列处理: `src/lib/queue/model3d-queue.ts`
