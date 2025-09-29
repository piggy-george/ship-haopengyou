'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useAppContext } from '@/contexts/app';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Wand2, Upload, Image, Images, FileText } from 'lucide-react';
import { ProgressModal } from '@/components/ai-tools/ProgressModal';
import { CompletionModal } from '@/components/ai-tools/CompletionModal';
import { Model3DViewer } from '@/components/ai-tools/Model3DViewer';
import { ARViewer } from '@/components/ai-tools/ARViewer';
import { ErrorModal } from '@/components/ai-tools/ErrorModal';
import { DigitalAssetsManager } from '@/components/ai-tools/DigitalAssetsManager';

// 临时测试开关 - 测试完成后设置为 true
const REQUIRE_LOGIN = false; // TODO: 测试完成后改为 true

export default function TextTo3DPage() {
  const { data: session } = useSession();
  const { setShowSignModal } = useAppContext();

  // 通用状态
  const [loading, setLoading] = useState(false);
  const [recordId, setRecordId] = useState<string | null>(null);
  const [queueStatus, setQueueStatus] = useState<any>(null);
  const [generatedModel, setGeneratedModel] = useState<any>(null);

  // 弹窗状态
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [progressStatus, setProgressStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const [completionData, setCompletionData] = useState<any>(null);
  const [errorData, setErrorData] = useState<any>(null);
  const [show3DViewer, setShow3DViewer] = useState(false);
  const [showARViewer, setShowARViewer] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string>('');
  const [queueInfo, setQueueInfo] = useState<any>(null);
  const [showAssetsManager, setShowAssetsManager] = useState(false);

  // 文生3D状态
  const [prompt, setPrompt] = useState('');
  const [textVersion, setTextVersion] = useState('rapid');
  const [textEnablePBR, setTextEnablePBR] = useState(false);
  const [textResultFormat, setTextResultFormat] = useState('GLB');
  const [textGenerateType, setTextGenerateType] = useState('Normal');

  // 图生3D状态
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [multiViewImages, setMultiViewImages] = useState<{ file: File; preview: string; viewType: string }[]>([]);
  const [imageVersion, setImageVersion] = useState('rapid');
  const [imageEnablePBR, setImageEnablePBR] = useState(false);
  const [imageResultFormat, setImageResultFormat] = useState('GLB');
  const [imageGenerateType, setImageGenerateType] = useState('Normal');

  // 处理单张图片上传
  const handleSingleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件格式
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validFormats.includes(file.type)) {
      toast.error('请上传JPG、PNG、JPEG或WEBP格式的图片');
      return;
    }

    // 验证文件大小（8MB）
    if (file.size > 8 * 1024 * 1024) {
      toast.error('图片大小不能超过8MB');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 处理多视图图片上传
  const handleMultiViewUpload = (e: React.ChangeEvent<HTMLInputElement>, viewType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件格式
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validFormats.includes(file.type)) {
      toast.error('请上传JPG、PNG、JPEG或WEBP格式的图片');
      return;
    }

    // 验证文件大小（8MB）
    if (file.size > 8 * 1024 * 1024) {
      toast.error('图片大小不能超过8MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = reader.result as string;
      setMultiViewImages(prev => {
        const filtered = prev.filter(img => img.viewType !== viewType);
        return [...filtered, { file, preview, viewType }];
      });
    };
    reader.readAsDataURL(file);
  };

  // 文生3D生成
  const handleTextGenerate = async () => {
    if (REQUIRE_LOGIN && !session) {
      setShowSignModal(true);
      toast.error('请先登录后再生成');
      return;
    }

    if (!prompt) {
      toast.error('请输入文本描述');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate/text-to-3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          version: textVersion,
          enablePBR: textEnablePBR,
          resultFormat: textResultFormat,
          generateType: textVersion === 'pro' ? textGenerateType : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '生成失败');

      setRecordId(data.recordId);
      setQueueStatus(data.queue);

      // 设置队列信息
      setQueueInfo({
        position: data.queue?.position,
        totalInQueue: data.queue?.total,
        estimatedTime: data.queue?.estimatedTime,
        isPeakPeriod: data.queue?.isPeakPeriod
      });

      // 显示进度弹窗
      setProgressStatus('pending');
      setShowProgressModal(true);

      pollStatus(data.recordId);
    } catch (error: any) {
      setLoading(false);
      setShowProgressModal(false);

      // 显示错误弹窗
      setErrorData({
        code: error.code || 'API_ERROR',
        message: error.message || '生成失败',
        details: error.details
      });
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // 图生3D生成
  const handleImageGenerate = async () => {
    if (REQUIRE_LOGIN && !session) {
      setShowSignModal(true);
      toast.error('请先登录后再生成');
      return;
    }

    if (!imageFile && multiViewImages.length === 0) {
      toast.error('请上传至少一张图片');
      return;
    }

    setLoading(true);
    try {
      // 将图片转换为base64
      const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const base64 = reader.result as string;
            resolve(base64.split(',')[1]); // 移除data:image/...;base64,前缀
          };
          reader.onerror = reject;
        });
      };

      let imageBase64 = '';
      let multiViewData = [];

      if (imageFile) {
        imageBase64 = await fileToBase64(imageFile);
      }

      if (multiViewImages.length > 0) {
        for (const img of multiViewImages) {
          const base64 = await fileToBase64(img.file);
          multiViewData.push({
            viewType: img.viewType,
            viewImageBase64: base64
          });
        }
      }

      const response = await fetch('/api/ai/generate/text-to-3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          multiViewImages: multiViewData.length > 0 ? multiViewData : undefined,
          version: imageVersion,
          enablePBR: imageEnablePBR,
          resultFormat: imageResultFormat,
          generateType: imageVersion === 'pro' ? imageGenerateType : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '生成失败');

      setRecordId(data.recordId);
      setQueueStatus(data.queue);

      // 设置队列信息
      setQueueInfo({
        position: data.queue?.position,
        totalInQueue: data.queue?.total,
        estimatedTime: data.queue?.estimatedTime,
        isPeakPeriod: data.queue?.isPeakPeriod
      });

      // 显示进度弹窗
      setProgressStatus('pending');
      setShowProgressModal(true);

      pollStatus(data.recordId);
    } catch (error: any) {
      setLoading(false);
      setShowProgressModal(false);

      // 显示错误弹窗
      setErrorData({
        code: error.code || 'API_ERROR',
        message: error.message || '生成失败',
        details: error.details
      });
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // 轮询任务状态
  const pollStatus = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/ai/generate/text-to-3d/status?recordId=${id}`);
        const data = await response.json();

        // 更新进度状态
        if (data.status === 'processing') {
          setProgressStatus('processing');
        }

        if (data.status === 'completed') {
          clearInterval(interval);
          toast.success('3D模型生成完成!');
          setQueueStatus(null);
          setGeneratedModel(data.outputUrls);

          // 关闭进度弹窗，显示完成弹窗
          setShowProgressModal(false);
          setCompletionData({
            recordId: id,
            files: data.outputUrls?.map((url: any) => ({
              type: url.Type || url.type || 'GLB',
              url: url.Url || url.url,
              previewImageUrl: url.PreviewImageUrl || url.previewImageUrl
            })),
            creditsUsed: 10, // TODO: 从响应中获取实际消耗的积分
            expiresAt: data.expiresAt
          });
          setShowCompletionModal(true);

        } else if (data.status === 'failed') {
          clearInterval(interval);
          setQueueStatus(null);
          setShowProgressModal(false);

          // 显示错误弹窗
          setErrorData({
            code: data.errorCode || 'GENERATION_FAILED',
            message: data.errorMessage || '3D模型生成失败',
            details: data.errorDetails
          });
          setShowErrorModal(true);
        } else {
          // 更新队列信息
          setQueueStatus(data.queue);
          setQueueInfo({
            position: data.queue?.position,
            totalInQueue: data.queue?.total,
            estimatedTime: data.queue?.estimatedTime,
            isPeakPeriod: data.queue?.isPeakPeriod
          });
        }
      } catch (error) {
        console.error('Poll error:', error);
      }
    }, 5000);

    setTimeout(() => clearInterval(interval), 600000);
  };

  // 计算积分消耗
  const calculateCredits = (version: string, generateType: string, enablePBR: boolean, hasMultiView: boolean) => {
    if (version === 'rapid') {
      return 10 + (enablePBR ? 5 : 0);
    }
    if (version === 'pro') {
      const baseCredits: Record<string, number> = {
        'Normal': 20,
        'LowPoly': 25,
        'Geometry': 15,
        'Sketch': 25
      };
      let credits = baseCredits[generateType] || 20;
      if (enablePBR && generateType !== 'Geometry') credits += 10;
      if (hasMultiView) credits += 10;
      return credits;
    }
    return 0;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">AI 3D模型生成</h1>
            <p className="text-gray-600">使用AI技术将文本或图片转换为3D模型</p>
          </div>
          <Button
            onClick={() => setShowAssetsManager(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            我的数字资产
          </Button>
        </div>

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">文生3D</TabsTrigger>
            <TabsTrigger value="image">图生3D</TabsTrigger>
          </TabsList>

          {/* 文生3D */}
          <TabsContent value="text">
            <Card>
              <CardHeader>
                <CardTitle>文本生成3D模型</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="prompt">文本描述</Label>
                  <Textarea
                    id="prompt"
                    placeholder="例如: 一只可爱的小猫咪，毛茸茸的，蓝色的眼睛..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {textVersion === 'rapid' ? '最多200个字符' : '最多1024个字符'}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>生成版本</Label>
                    <Select value={textVersion} onValueChange={setTextVersion}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rapid">极速版 (10积分)</SelectItem>
                        <SelectItem value="pro">专业版 (15-55积分)</SelectItem>
                        <SelectItem value="basic">基础版</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {textVersion === 'pro' && (
                    <div>
                      <Label>生成类型</Label>
                      <Select value={textGenerateType} onValueChange={setTextGenerateType}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Normal">标准模型 (20积分)</SelectItem>
                          <SelectItem value="LowPoly">智能减面 (25积分)</SelectItem>
                          <SelectItem value="Geometry">白模 (15积分)</SelectItem>
                          <SelectItem value="Sketch">草图生成 (25积分)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label>输出格式</Label>
                    {textVersion === 'pro' ? (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <strong>专业版</strong>：系统自动选择最优格式，通常为GLB或FBX格式
                        </p>
                      </div>
                    ) : (
                      <Select value={textResultFormat} onValueChange={setTextResultFormat}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GLB">GLB (推荐)</SelectItem>
                          <SelectItem value="OBJ">OBJ</SelectItem>
                          <SelectItem value="STL">STL (3D打印)</SelectItem>
                          <SelectItem value="USDZ">USDZ (iOS AR)</SelectItem>
                          <SelectItem value="FBX">FBX</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                {textGenerateType !== 'Geometry' && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="textPBR"
                      checked={textEnablePBR}
                      onChange={(e) => setTextEnablePBR(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="textPBR">
                      启用PBR材质 (+{textVersion === 'rapid' ? '5' : '10'}积分)
                    </Label>
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-semibold">预计消耗积分: {calculateCredits(textVersion, textGenerateType, textEnablePBR, false)}</p>
                </div>

                <Button
                  onClick={handleTextGenerate}
                  disabled={loading || !prompt}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      生成3D模型
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 图生3D */}
          <TabsContent value="image">
            <Card>
              <CardHeader>
                <CardTitle>图片生成3D模型</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="single" className="w-full">
                  <TabsList>
                    <TabsTrigger value="single">单张图片</TabsTrigger>
                    <TabsTrigger value="multi">多视图(2-4张)</TabsTrigger>
                  </TabsList>

                  <TabsContent value="single" className="space-y-4">
                    <div>
                      <Label>上传图片</Label>
                      <div className="mt-2">
                        <label className="block">
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleSingleImageUpload}
                            className="hidden"
                          />
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400">
                            {imagePreview ? (
                              <div>
                                <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto mb-4" />
                                <p className="text-sm text-gray-600">点击重新上传</p>
                              </div>
                            ) : (
                              <div>
                                <Image className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-600">点击上传图片</p>
                                <p className="text-xs text-gray-500 mt-1">支持JPG、PNG、JPEG、WEBP，最大8MB</p>
                              </div>
                            )}
                          </div>
                        </label>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="multi" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { type: 'front', label: '正面/主视图' },
                        { type: 'left', label: '左侧视图' },
                        { type: 'right', label: '右侧视图' },
                        { type: 'back', label: '背面/后视图' }
                      ].map((view) => (
                        <div key={view.type}>
                          <Label className="text-sm font-medium mb-2 block">{view.label}</Label>
                          <label className="block">
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              onChange={(e) => handleMultiViewUpload(e, view.type)}
                              className="hidden"
                            />
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors">
                              {multiViewImages.find(img => img.viewType === view.type) ? (
                                <div className="relative">
                                  <img
                                    src={multiViewImages.find(img => img.viewType === view.type)?.preview}
                                    alt={view.label}
                                    className="h-40 w-full object-contain rounded"
                                  />
                                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-2">点击重新上传</p>
                                </div>
                              ) : (
                                <div className="h-40 flex flex-col items-center justify-center">
                                  <Upload className="h-10 w-10 text-gray-400 mb-3" />
                                  <p className="text-sm font-medium text-gray-600">{view.label}</p>
                                  <p className="text-xs text-gray-400 mt-1">点击上传</p>
                                </div>
                              )}
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-700">
                        <strong>提示：</strong>上传同一物体的不同视角（2-4张），可以显著提高3D模型生成质量。建议上传清晰、背景简单的图片。
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>生成版本</Label>
                    <Select value={imageVersion} onValueChange={setImageVersion}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rapid">极速版 (10积分)</SelectItem>
                        <SelectItem value="pro">专业版 (15-55积分)</SelectItem>
                        <SelectItem value="basic">基础版</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {imageVersion === 'pro' && (
                    <div>
                      <Label>生成类型</Label>
                      <Select value={imageGenerateType} onValueChange={setImageGenerateType}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Normal">标准模型 (20积分)</SelectItem>
                          <SelectItem value="LowPoly">智能减面 (25积分)</SelectItem>
                          <SelectItem value="Geometry">白模 (15积分)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label>输出格式</Label>
                    {imageVersion === 'pro' ? (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <strong>专业版</strong>：系统自动选择最优格式，通常为GLB或FBX格式
                        </p>
                      </div>
                    ) : (
                      <Select value={imageResultFormat} onValueChange={setImageResultFormat}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GLB">GLB (推荐)</SelectItem>
                          <SelectItem value="OBJ">OBJ</SelectItem>
                          <SelectItem value="STL">STL (3D打印)</SelectItem>
                          <SelectItem value="USDZ">USDZ (iOS AR)</SelectItem>
                          <SelectItem value="FBX">FBX</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                {imageGenerateType !== 'Geometry' && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="imagePBR"
                      checked={imageEnablePBR}
                      onChange={(e) => setImageEnablePBR(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="imagePBR">
                      启用PBR材质 (+{imageVersion === 'rapid' ? '5' : '10'}积分)
                    </Label>
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-semibold">
                    预计消耗积分: {calculateCredits(imageVersion, imageGenerateType, imageEnablePBR, multiViewImages.length > 0)}
                  </p>
                </div>

                <Button
                  onClick={handleImageGenerate}
                  disabled={loading || (!imageFile && multiViewImages.length === 0)}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      生成3D模型
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 队列状态 */}
        {queueStatus && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <p className="font-semibold text-blue-900">{queueStatus.message}</p>
              </div>
              {queueStatus.position > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  预计等待时间: {Math.ceil(queueStatus.estimatedWaitTime / 60)} 分钟
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* 生成结果 */}
        {generatedModel && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>生成完成！</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generatedModel.map((file: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded">
                    <span>{file.Type || file.type} 格式</span>
                    <Button
                      onClick={() => window.open(file.Url || file.url, '_blank')}
                      size="sm"
                    >
                      下载
                    </Button>
                  </div>
                ))}
                <p className="text-sm text-gray-500">文件将在7天后自动过期，请及时下载</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 进度弹窗 */}
      <ProgressModal
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        onCancel={() => {
          setShowProgressModal(false);
          setLoading(false);
        }}
        status={progressStatus}
        queueInfo={queueInfo}
      />

      {/* 完成弹窗 */}
      <CompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        modelData={completionData || {
          recordId: recordId || '',
          files: [],
          creditsUsed: 0
        }}
        onPreview={(url) => {
          setViewerUrl(url);
          setShow3DViewer(true);
        }}
        onARPreview={(url) => {
          setViewerUrl(url);
          setShowARViewer(true);
        }}
      />

      {/* 3D预览器 */}
      {show3DViewer && (
        <Model3DViewer
          modelUrl={viewerUrl}
          onClose={() => setShow3DViewer(false)}
        />
      )}

      {/* AR预览器 */}
      {showARViewer && (
        <ARViewer
          modelUrl={viewerUrl}
          onClose={() => setShowARViewer(false)}
        />
      )}

      {/* 错误弹窗 */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        onRetry={() => {
          setShowErrorModal(false);
          // 根据当前激活的标签页重试
          if (prompt) {
            handleTextGenerate();
          } else if (imageFile || multiViewImages.length > 0) {
            handleImageGenerate();
          }
        }}
        error={errorData || { message: '未知错误' }}
      />

      {/* 数字资产管理器 */}
      <DigitalAssetsManager
        isOpen={showAssetsManager}
        onClose={() => setShowAssetsManager(false)}
        onPreview={(url) => {
          setViewerUrl(url);
          setShow3DViewer(true);
        }}
        onARPreview={(url) => {
          setViewerUrl(url);
          setShowARViewer(true);
        }}
      />
    </div>
  );
}