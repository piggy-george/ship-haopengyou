export interface Model3DParams {
  version: 'basic' | 'pro' | 'rapid';
  prompt?: string;
  imageUrl?: string;
  imageBase64?: string;
  multiViewImages?: Array<{
    viewType: 'left' | 'right' | 'back';
    viewImageUrl?: string;
    viewImageBase64?: string;
  }>;
  enablePBR?: boolean;
  resultFormat?: 'OBJ' | 'GLB' | 'STL' | 'USDZ' | 'FBX' | 'MP4';
  generateType?: 'Normal' | 'LowPoly' | 'Geometry' | 'Sketch';
  faceCount?: number;
}

export interface JobResult {
  jobId: string;
  requestId: string;
}

export interface File3D {
  type: string;
  url: string;
  previewImageUrl?: string;
}

export interface JobStatus {
  status: 'WAIT' | 'RUN' | 'FAIL' | 'DONE';
  errorCode?: string;
  errorMessage?: string;
  resultFiles?: File3D[];
  requestId: string;
}

export class Model3DService {
  private client: any;

  constructor() {
    // 动态导入腾讯云SDK
    const tencentcloud = require("tencentcloud-sdk-nodejs");
    const ai3d = tencentcloud.ai3d;
    const Ai3dClient = ai3d.v20250513.Client;

    // 创建客户端配置
    const clientConfig = {
      credential: {
        secretId: process.env.TENCENT_SECRET_ID,
        secretKey: process.env.TENCENT_SECRET_KEY,
      },
      region: process.env.TENCENT_REGION || 'ap-guangzhou',
      profile: {
        httpProfile: {
          endpoint: "ai3d.tencentcloudapi.com",
        },
      },
    };

    this.client = new Ai3dClient(clientConfig);
  }

  async generateModel(params: Model3DParams): Promise<JobResult> {
    try {
      const request = this.buildRequest(params);
      console.log(`[Model3DService] 生成请求 - 版本: ${params.version}, 参数:`, JSON.stringify(request, null, 2));
      
      let response;

      switch (params.version) {
        case 'basic':
          response = await this.client.SubmitHunyuanTo3DJob(request);
          break;
        case 'pro':
          console.log('[Model3DService] 调用专业版API: SubmitHunyuanTo3DProJob');
          response = await this.client.SubmitHunyuanTo3DProJob(request);
          break;
        case 'rapid':
          response = await this.client.SubmitHunyuanTo3DRapidJob(request);
          break;
        default:
          throw new Error('不支持的生成版本');
      }

      console.log(`[Model3DService] API响应成功 - JobId: ${response.JobId}`);
      return {
        jobId: response.JobId,
        requestId: response.RequestId
      };
    } catch (error: any) {
      console.error('[Model3DService] 生成请求失败:', {
        version: params.version,
        error: error,
        code: error.code,
        message: error.message
      });
      throw new Error(this.getUserFriendlyError(error));
    }
  }

  async queryStatus(jobId: string, version: string): Promise<JobStatus> {
    try {
      const request = { JobId: jobId };
      let response;

      switch (version) {
        case 'basic':
          response = await this.client.QueryHunyuanTo3DJob(request);
          break;
        case 'pro':
          response = await this.client.QueryHunyuanTo3DProJob(request);
          break;
        case 'rapid':
          response = await this.client.QueryHunyuanTo3DRapidJob(request);
          break;
        default:
          throw new Error('不支持的查询版本');
      }

      return {
        status: response.Status,
        errorCode: response.ErrorCode,
        errorMessage: response.ErrorMessage ? this.getUserFriendlyError({ code: response.ErrorCode }) : undefined,
        resultFiles: response.ResultFile3Ds,
        requestId: response.RequestId
      };
    } catch (error: any) {
      console.error('Status query failed:', error);
      throw new Error('状态查询失败');
    }
  }

  private buildRequest(params: Model3DParams): any {
    const request: any = {};

    if (params.prompt) request.Prompt = params.prompt;
    if (params.imageUrl) request.ImageUrl = params.imageUrl;
    if (params.imageBase64) request.ImageBase64 = params.imageBase64;
    if (params.multiViewImages?.length) {
      request.MultiViewImages = params.multiViewImages.map(img => {
        const viewImage: any = { ViewType: img.viewType };
        if (img.viewImageUrl) {
          viewImage.ViewImageUrl = img.viewImageUrl;
        }
        // 注意：腾讯云API不支持ViewImageBase64，只支持ViewImageUrl
        // viewImageBase64需要先上传到存储服务获得URL
        return viewImage;
      });
    }
    if (params.enablePBR !== undefined) request.EnablePBR = params.enablePBR;
    
    // ResultFormat 只有极速版和基础版支持，专业版不支持
    if (params.resultFormat && (params.version === 'rapid' || params.version === 'basic')) {
      request.ResultFormat = params.resultFormat;
    }

    // 专业版特有参数
    if (params.version === 'pro') {
      if (params.generateType) request.GenerateType = params.generateType;
      if (params.faceCount) request.FaceCount = params.faceCount;
    }

    return request;
  }

  private getUserFriendlyError(error: any): string {
    const errorMap: Record<string, string> = {
      'AuthFailure.SignatureFailure': '服务连接异常,请稍后重试',
      'InvalidParameter': '参数设置有误,请检查输入内容',
      'InvalidParameterValue': '输入参数不符合要求,请重新检查',
      'LimitExceeded': '当前服务繁忙,请稍后重试',
      'RequestLimitExceeded': '请求过于频繁,请稍后再试',
      'ResourceNotFound': '请求的资源不存在',
      'InternalError': '服务暂时不可用,我们正在修复中',
      'MissingParameter': '缺少必要信息,请完善后重试',
      'UnsupportedOperation': '当前操作暂不支持',
      'ResourceUnavailable': '服务暂时不可用,请稍后重试',
      'UnknownParameter': '参数配置错误,请检查版本设置'
    };

    const errorCode = error.code || error.message;
    return errorMap[errorCode] || '服务暂时不可用,我们正在努力修复中,请稍后重试';
  }

  calculateCredits(params: Model3DParams): number {
    if (params.version === 'rapid') {
      let credits = 10;
      if (params.enablePBR) credits += 5;
      return credits;
    }

    if (params.version === 'pro') {
      const baseCredits: Record<string, number> = {
        'Normal': 20,
        'LowPoly': 25,
        'Geometry': 15,
        'Sketch': 25
      };

      let credits = baseCredits[params.generateType || 'Normal'];
      if (params.multiViewImages?.length) credits += 10;
      if (params.enablePBR && params.generateType !== 'Geometry') credits += 10;
      if (params.faceCount) credits += 10;

      return credits;
    }

    return 0;
  }
}