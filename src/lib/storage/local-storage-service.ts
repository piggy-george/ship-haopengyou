/**
 * 本地文件存储服务
 * 用于管理3D模型文件的本地存储
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// 存储根目录：项目根目录/storage/3d-models
const STORAGE_ROOT = path.join(process.cwd(), 'storage', '3d-models');

/**
 * 确保存储根目录存在
 */
async function ensureStorageRoot() {
  try {
    await mkdir(STORAGE_ROOT, { recursive: true });
  } catch (error) {
    console.error('[LocalStorage] Failed to create storage root:', error);
    throw error;
  }
}

/**
 * 文件类型到扩展名的映射
 */
const FILE_TYPE_EXTENSIONS: Record<string, string> = {
  'GLB': 'glb',
  'OBJ': 'obj',
  'FBX': 'fbx',
  'STL': 'stl',
  'GLTF': 'gltf',
  'USDZ': 'usdz',
  'MP4': 'mp4',
  'JPG': 'jpg',
  'PNG': 'png',
};

/**
 * 文件类型到Content-Type的映射
 */
export const CONTENT_TYPES: Record<string, string> = {
  'glb': 'model/gltf-binary',
  'gltf': 'model/gltf+json',
  'obj': 'text/plain',
  'fbx': 'application/octet-stream',
  'stl': 'application/sla',
  'usdz': 'model/vnd.usdz+zip',
  'mp4': 'video/mp4',
  'jpg': 'image/jpeg',
  'png': 'image/png',
  'json': 'application/json',
};

/**
 * 获取用户模型目录路径
 */
function getUserModelDir(userUuid: string, recordUuid: string): string {
  return path.join(STORAGE_ROOT, userUuid, recordUuid);
}

/**
 * 获取文件完整路径
 */
function getFilePath(userUuid: string, recordUuid: string, filename: string): string {
  return path.join(getUserModelDir(userUuid, recordUuid), filename);
}

/**
 * 从URL下载文件到本地
 */
export async function downloadFileFromUrl(
  url: string,
  userUuid: string,
  recordUuid: string,
  fileType: string
): Promise<{ localPath: string; filename: string; size: number }> {
  await ensureStorageRoot();

  // 创建用户和记录目录
  const modelDir = getUserModelDir(userUuid, recordUuid);
  await mkdir(modelDir, { recursive: true });

  // 确定文件扩展名
  const extension = FILE_TYPE_EXTENSIONS[fileType.toUpperCase()] || fileType.toLowerCase();
  const filename = `model.${extension}`;
  const localPath = getFilePath(userUuid, recordUuid, filename);

  try {
    console.log(`[LocalStorage] Downloading ${fileType} from ${url}`);
    
    // 从URL下载文件
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
    }

    // 获取文件内容
    const buffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // 保存到本地
    await writeFile(localPath, uint8Array);

    const fileSize = uint8Array.length;
    console.log(`[LocalStorage] ✅ Saved ${filename} (${(fileSize / 1024 / 1024).toFixed(2)} MB) to ${localPath}`);

    return {
      localPath,
      filename,
      size: fileSize,
    };
  } catch (error) {
    console.error(`[LocalStorage] ❌ Failed to download ${fileType}:`, error);
    throw error;
  }
}

/**
 * 下载预览图
 */
export async function downloadPreviewImage(
  url: string,
  userUuid: string,
  recordUuid: string
): Promise<{ localPath: string; filename: string }> {
  await ensureStorageRoot();

  const modelDir = getUserModelDir(userUuid, recordUuid);
  await mkdir(modelDir, { recursive: true });

  // 从URL判断扩展名
  const urlExt = url.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg';
  const filename = `preview.${urlExt}`;
  const localPath = getFilePath(userUuid, recordUuid, filename);

  try {
    console.log(`[LocalStorage] Downloading preview image from ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download preview: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    await writeFile(localPath, new Uint8Array(buffer));

    console.log(`[LocalStorage] ✅ Saved preview image to ${localPath}`);

    return { localPath, filename };
  } catch (error) {
    console.error(`[LocalStorage] Failed to download preview image:`, error);
    // 预览图失败不影响主流程
    return { localPath: '', filename: '' };
  }
}

/**
 * 保存元数据
 */
export async function saveMetadata(
  userUuid: string,
  recordUuid: string,
  metadata: any
): Promise<void> {
  const modelDir = getUserModelDir(userUuid, recordUuid);
  await mkdir(modelDir, { recursive: true });

  const metadataPath = getFilePath(userUuid, recordUuid, 'metadata.json');
  await writeFile(metadataPath, JSON.stringify(metadata, null, 2));

  console.log(`[LocalStorage] ✅ Saved metadata to ${metadataPath}`);
}

/**
 * 读取文件
 */
export async function readLocalFile(
  userUuid: string,
  recordUuid: string,
  filename: string
): Promise<Buffer> {
  const filePath = getFilePath(userUuid, recordUuid, filename);
  
  try {
    // 检查文件是否存在
    await stat(filePath);
    
    // 读取文件
    const buffer = await readFile(filePath);
    return buffer;
  } catch (error) {
    console.error(`[LocalStorage] Failed to read file ${filePath}:`, error);
    throw new Error('File not found');
  }
}

/**
 * 删除用户的某个记录的所有文件
 */
export async function deleteRecordFiles(
  userUuid: string,
  recordUuid: string
): Promise<void> {
  const modelDir = getUserModelDir(userUuid, recordUuid);

  try {
    // 读取目录中的所有文件
    const files = await readdir(modelDir);

    // 删除所有文件
    await Promise.all(
      files.map(file => unlink(path.join(modelDir, file)))
    );

    // 删除目录
    await promisify(fs.rmdir)(modelDir);

    console.log(`[LocalStorage] ✅ Deleted all files for record ${recordUuid}`);
  } catch (error) {
    console.error(`[LocalStorage] Failed to delete record files:`, error);
    // 不抛出错误，继续执行
  }
}

/**
 * 获取文件的Content-Type
 */
export function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return CONTENT_TYPES[ext] || 'application/octet-stream';
}

/**
 * 生成文件访问URL
 * 格式：/api/storage/3d-models/{recordUuid}/{filename}
 */
export function generateFileUrl(recordUuid: string, filename: string): string {
  return `/api/storage/3d-models/${recordUuid}/${filename}`;
}

/**
 * 检查存储空间使用情况
 */
export async function getStorageStats(): Promise<{
  totalSize: number;
  fileCount: number;
  userCount: number;
}> {
  await ensureStorageRoot();

  let totalSize = 0;
  let fileCount = 0;
  const users = new Set<string>();

  async function scanDirectory(dir: string) {
    try {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // 记录用户UUID（第一层目录）
          if (dir === STORAGE_ROOT) {
            users.add(entry.name);
          }
          await scanDirectory(fullPath);
        } else if (entry.isFile()) {
          const stats = await stat(fullPath);
          totalSize += stats.size;
          fileCount++;
        }
      }
    } catch (error) {
      console.error(`[LocalStorage] Error scanning directory ${dir}:`, error);
    }
  }

  await scanDirectory(STORAGE_ROOT);

  return {
    totalSize,
    fileCount,
    userCount: users.size,
  };
}
