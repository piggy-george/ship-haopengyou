'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Download, 
  Eye, 
  Smartphone, 
  Calendar, 
  Clock, 
  FileText, 
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface DigitalAsset {
  id: string;
  type: 'text23d' | 'img23d' | 'text2img' | 'img2img';
  prompt?: string;
  outputUrls: Array<{
    type: string;
    url: string;
    previewImageUrl?: string;
  }>;
  creditsUsed: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
  createdAt: string;
  expiresAt?: string;
  version?: string;
  params?: any;
}

interface DigitalAssetsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onPreview?: (url: string) => void;
  onARPreview?: (url: string) => void;
}

export function DigitalAssetsManager({
  isOpen,
  onClose,
  onPreview,
  onARPreview
}: DigitalAssetsManagerProps) {
  const [assets, setAssets] = useState<DigitalAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // 加载用户的数字资产
  const loadAssets = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/digital-assets');
      if (response.ok) {
        const data = await response.json();
        if (process.env.NODE_ENV === 'development') {
          console.log('[DigitalAssetsManager] API Response:', data);
        }
        setAssets(data.assets || []);
      } else {
        toast.error('加载数字资产失败');
      }
    } catch (error) {
      console.error('加载数字资产错误:', error);
      toast.error('加载数字资产失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAssets();
    }
  }, [isOpen]);

  // 过滤资产
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = !searchTerm || 
      asset.prompt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || asset.type === filterType;
    const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // 获取资产类型显示名称
  const getTypeDisplayName = (type: string) => {
    const typeMap: Record<string, string> = {
      'text23d': '文生3D',
      'img23d': '图生3D',
      'text2img': '文生图',
      'img2img': '图生图'
    };
    return typeMap[type] || type;
  };

  // 获取版本显示名称
  const getVersionDisplayName = (version?: string) => {
    const versionMap: Record<string, string> = {
      'basic': '基础版',
      'pro': '专业版',
      'rapid': '极速版'
    };
    return version ? versionMap[version] || version : '未知版本';
  };

  // 判断是否为多视图生成
  const isMultiViewGeneration = (asset: DigitalAsset) => {
    return asset.params?.multiViewImages && asset.params.multiViewImages.length > 0;
  };

  // 获取生成方式描述
  const getGenerationMethod = (asset: DigitalAsset) => {
    if (asset.type === 'text23d') {
      return '文本描述生成';
    } else if (asset.type === 'img23d') {
      return isMultiViewGeneration(asset) ? '多视图生成' : '单图生成';
    }
    return '未知方式';
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 计算剩余天数
  const getRemainingDays = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const expires = new Date(expiresAt);
    const now = new Date();
    const diffTime = expires.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // 下载文件
  const handleDownload = (url: string, fileType?: string, assetId?: string) => {
    try {
      console.log('[DigitalAssetsManager] 开始下载:', { url, fileType, assetId });
      
      // 生成合适的文件名
      const extension = fileType?.toLowerCase() || 'glb';
      const timestamp = new Date().getTime();
      const filename = `model_${assetId || timestamp}.${extension}`;
      
      // 使用下载API，确保文件正确下载
      const downloadUrl = `/api/download/3d-model?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`开始下载 ${filename}`);
    } catch (error) {
      console.error('下载失败:', error);
      toast.error('下载失败，请重试');
    }
  };

  // 删除资产（仅前端移除）
  const handleDelete = (assetId: string) => {
    setAssets(prev => prev.filter(asset => asset.id !== assetId));
    toast.success('已从列表中移除');
  };

  // 获取文件URL（兼容大小写）
  const getFileUrl = (file: any): string | null => {
    return file?.url || file?.Url || null;
  };

  // 获取文件类型（兼容大小写）
  const getFileType = (file: any): string | null => {
    return file?.type || file?.Type || null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            我的数字资产
          </DialogTitle>
          <DialogDescription>
            管理您生成的3D模型，支持预览、下载和AR体验
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* 搜索和过滤 */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="搜索提示词或ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="text23d">文生3D</SelectItem>
                <SelectItem value="img23d">图生3D</SelectItem>
                <SelectItem value="text2img">文生图</SelectItem>
                <SelectItem value="img2img">图生图</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="failed">已失败</SelectItem>
                <SelectItem value="expired">已过期</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadAssets} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {/* 资产列表 */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>暂无数字资产</p>
                <p className="text-sm">开始创建您的第一个AI作品吧！</p>
                <p className="text-xs mt-2 text-gray-400">
                  生成成功的3D模型将在这里显示，包含预览和下载功能
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAssets.map((asset) => (
                  <Card key={asset.id} className="relative">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-wrap items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {getTypeDisplayName(asset.type)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {getVersionDisplayName(asset.version)}
                          </Badge>
                          <Badge className={`${getStatusColor(asset.status)} text-xs`}>
                            {asset.status === 'completed' ? '已完成' : 
                             asset.status === 'failed' ? '失败' : 
                             asset.status === 'expired' ? '已过期' :
                             asset.status === 'pending' ? '等待中' :
                             asset.status === 'processing' ? '生成中' : '未知'}
                          </Badge>
                        </div>
                        <Button
                          onClick={() => handleDelete(asset.id)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <CardTitle className="text-sm font-medium line-clamp-2 mt-2">
                        {asset.prompt || `${getTypeDisplayName(asset.type)} - ${asset.id.slice(0, 8)}`}
                      </CardTitle>
                      <p className="text-xs text-gray-500 mt-1">
                        {getGenerationMethod(asset)}
                        {asset.type === 'img23d' && isMultiViewGeneration(asset) && 
                          ` (${asset.params.multiViewImages.length}张图片)`
                        }
                      </p>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* 预览图 */}
                      {asset.outputUrls?.[0]?.previewImageUrl && (
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={asset.outputUrls[0].previewImageUrl}
                            alt="预览"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* 基本信息 */}
                      <div className="space-y-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(asset.createdAt).toLocaleDateString('zh-CN')}
                        </div>
                        {asset.expiresAt && asset.status === 'completed' && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getRemainingDays(asset.expiresAt)}天后过期
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span>积分消耗: {asset.creditsUsed}</span>
                          {getFileType(asset.outputUrls?.[0]) && (
                            <span className="font-medium">{getFileType(asset.outputUrls[0])}格式</span>
                          )}
                        </div>
                      </div>

                      {/* 调试信息 */}
                      {process.env.NODE_ENV === 'development' && (
                        <div className="text-xs text-blue-500 bg-blue-50 p-2 rounded mb-2">
                          状态: {asset.status} | 文件数: {asset.outputUrls?.length || 0} | 
                          下载链接: {getFileUrl(asset.outputUrls?.[0]) ? '有效' : '无效'}
                          {asset.outputUrls?.[0] && (
                            <div className="mt-1">
                              <div>文件结构: {JSON.stringify(asset.outputUrls[0], null, 2)}</div>
                            </div>
                          )}
                          {getFileUrl(asset.outputUrls?.[0]) && (
                            <div className="mt-1 break-all">URL: {getFileUrl(asset.outputUrls[0])}</div>
                          )}
                        </div>
                      )}

                      {/* 操作按钮 - 成功完成的资产显示按钮 */}
                      {asset.status === 'completed' && (
                        <div className="space-y-2">
                          {/* 主要操作按钮 */}
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                const url = getFileUrl(asset.outputUrls?.[0]);
                                const fileType = getFileType(asset.outputUrls?.[0]);
                                if (url) {
                                  handleDownload(url, fileType || undefined, asset.id);
                                } else {
                                  toast.error('文件链接不可用，可能已过期或生成异常');
                                }
                              }}
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              disabled={!getFileUrl(asset.outputUrls?.[0])}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              {getFileUrl(asset.outputUrls?.[0]) ? '下载模型' : '文件不可用'}
                            </Button>
                            
                            {(asset.type === 'text23d' || asset.type === 'img23d') && onPreview && (
                              <Button
                                onClick={() => {
                                  const url = getFileUrl(asset.outputUrls?.[0]);
                                  if (url) {
                                    onPreview(url);
                                  } else {
                                    toast.error('预览链接不可用，可能已过期或生成异常');
                                  }
                                }}
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                disabled={!getFileUrl(asset.outputUrls?.[0])}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                {getFileUrl(asset.outputUrls?.[0]) ? '3D预览' : '无法预览'}
                              </Button>
                            )}
                          </div>

                          {/* AR预览按钮 */}
                          {(asset.type === 'text23d' || asset.type === 'img23d') && onARPreview && getFileUrl(asset.outputUrls?.[0]) && (
                            <Button
                              onClick={() => {
                                const url = getFileUrl(asset.outputUrls?.[0]);
                                if (url) {
                                  onARPreview(url);
                                } else {
                                  toast.error('AR预览链接不可用');
                                }
                              }}
                              variant="secondary"
                              size="sm"
                              className="w-full"
                            >
                              <Smartphone className="w-3 h-3 mr-1" />
                              AR体验
                            </Button>
                          )}
                        </div>
                      )}

                      {/* 失败和异常状态 */}
                      {asset.status === 'failed' && (
                        <div className="text-xs text-red-500 text-center py-3 bg-red-50 rounded border border-red-200">
                          <div className="font-medium">生成失败</div>
                          <div className="mt-1">请检查参数后重新尝试</div>
                        </div>
                      )}

                      {asset.status === 'expired' && (
                        <div className="text-xs text-gray-500 text-center py-3 bg-gray-50 rounded border border-gray-200">
                          <div className="font-medium">文件已过期</div>
                          <div className="mt-1">请重新生成获取新文件</div>
                        </div>
                      )}

                      {/* 处理中状态 */}
                      {(asset.status === 'pending' || asset.status === 'processing') && (
                        <div className="text-xs text-blue-500 text-center py-3 bg-blue-50 rounded border border-blue-200">
                          <div className="font-medium">
                            {asset.status === 'pending' ? '等待处理中' : '正在生成中'}
                          </div>
                          <div className="mt-1">请耐心等待...</div>
                        </div>
                      )}

                      {/* 无文件状态 */}
                      {asset.status === 'completed' && (!asset.outputUrls || asset.outputUrls.length === 0 || !getFileUrl(asset.outputUrls[0])) && (
                        <div className="text-xs text-orange-500 text-center py-3 bg-orange-50 rounded border border-orange-200">
                          <div className="font-medium">文件链接不可用</div>
                          <div className="mt-1">
                            {!asset.outputUrls || asset.outputUrls.length === 0 
                              ? '生成记录异常，请联系支持' 
                              : '文件可能已过期或正在处理中'}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
