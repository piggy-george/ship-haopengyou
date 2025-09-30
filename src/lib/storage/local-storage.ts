import { promises as fs } from 'fs';
import path from 'path';

/**
 * 本地存储工具 - 用于3D模型文件和多视图图片
 * 存储路径：storage/{type}/{user_uuid}/{record_uuid}/
 */

export class LocalStorage {
  private baseDir: string;

  constructor() {
    // 使用项目根目录下的 storage 文件夹
    this.baseDir = path.join(process.cwd(), 'storage');
  }

  /**
   * 保存多视图图片到本地
   * @param userUuid 用户UUID
   * @param recordUuid 记录UUID
   * @param viewType 视图类型 (left/right/back)
   * @param base64Data base64图片数据（不包含data:image前缀）
   * @returns 本地访问URL
   */
  async saveMultiViewImage(
    userUuid: string,
    recordUuid: string,
    viewType: 'left' | 'right' | 'back',
    base64Data: string
  ): Promise<string> {
    try {
      // 创建目录：storage/3d-multiview/{user_uuid}/{record_uuid}/
      const dirPath = path.join(this.baseDir, '3d-multiview', userUuid, recordUuid);
      await fs.mkdir(dirPath, { recursive: true });

      // 文件名：left.png, right.png, back.png
      const fileName = `${viewType}.png`;
      const filePath = path.join(dirPath, fileName);

      // 将base64转为Buffer并保存
      const buffer = Buffer.from(base64Data, 'base64');
      await fs.writeFile(filePath, buffer);

      // 返回API访问URL
      // 例如：/api/storage/multiview/{user_uuid}/{record_uuid}/left.png
      return `/api/storage/multiview/${userUuid}/${recordUuid}/${fileName}`;
    } catch (error) {
      console.error('Failed to save multiview image:', error);
      throw new Error('保存多视图图片失败');
    }
  }

  /**
   * 批量保存多视图图片
   * @param userUuid 用户UUID
   * @param recordUuid 记录UUID
   * @param images 多视图图片数组
   * @returns 带URL的视图数据
   */
  async saveMultiViewImages(
    userUuid: string,
    recordUuid: string,
    images: Array<{ viewType: 'left' | 'right' | 'back'; viewImageBase64: string }>
  ): Promise<Array<{ viewType: string; viewImageUrl: string }>> {
    const results = await Promise.all(
      images.map(async (img) => {
        const url = await this.saveMultiViewImage(
          userUuid,
          recordUuid,
          img.viewType,
          img.viewImageBase64
        );

        return {
          viewType: img.viewType,
          viewImageUrl: url
        };
      })
    );

    return results;
  }

  /**
   * 读取多视图图片
   * @param userUuid 用户UUID
   * @param recordUuid 记录UUID
   * @param fileName 文件名 (left.png/right.png/back.png)
   * @returns Buffer
   */
  async readMultiViewImage(
    userUuid: string,
    recordUuid: string,
    fileName: string
  ): Promise<Buffer> {
    const filePath = path.join(
      this.baseDir,
      '3d-multiview',
      userUuid,
      recordUuid,
      fileName
    );

    try {
      return await fs.readFile(filePath);
    } catch (error) {
      throw new Error('图片不存在或已过期');
    }
  }

  /**
   * 删除记录的所有多视图图片
   * @param userUuid 用户UUID
   * @param recordUuid 记录UUID
   */
  async deleteMultiViewImages(userUuid: string, recordUuid: string): Promise<void> {
    const dirPath = path.join(this.baseDir, '3d-multiview', userUuid, recordUuid);

    try {
      await fs.rm(dirPath, { recursive: true, force: true });
    } catch (error) {
      console.error('Failed to delete multiview images:', error);
    }
  }

  /**
   * 检查文件是否存在
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

// 导出单例
export const localStorage = new LocalStorage();
