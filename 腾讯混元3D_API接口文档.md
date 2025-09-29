# 腾讯混元3D API接口完整文档

## 概述

腾讯混元3D是基于腾讯混元大模型的3D生成服务，可通过文本描述或图片智能生成3D模型。本文档详细介绍了6个核心API接口的使用方法。

**通用信息：**
- **接口域名**: `ai3d.tencentcloudapi.com`
- **API版本**: `2025-05-13`
- **任务ID有效期**: 24小时
- **支持图片格式**: JPG、PNG、JPEG、WEBP
- **图片大小限制**: 不超过8M，分辨率128-5000像素
- **支持的输出格式**: OBJ、GLB、STL、USDZ、FBX、MP4

---

## 1. 提交混元生3D任务 (基础版)

### 接口信息
- **接口名称**: `SubmitHunyuanTo3DJob`
- **文档链接**: https://cloud.tencent.com/document/product/1804/120826
- **最近更新**: 2025-09-12 01:07:39
- **并发数**: 1个
- **功能**: 基于混元大模型，根据输入的文本描述或图片智能生成3D模型

### 请求参数

| 参数名称 | 必选 | 类型 | 描述 |
|---------|------|------|------|
| Action | 是 | String | 公共参数，本接口取值：SubmitHunyuanTo3DJob |
| Version | 是 | String | 公共参数，本接口取值：2025-05-13 |
| Region | 是 | String | 公共参数，详见产品支持的地域列表 |
| Prompt | 否 | String | 文生3D，3D内容的描述，中文正向提示词。最多支持1024个utf-8字符。与ImageBase64/ImageUrl必填其一，且不能同时存在。示例：一只小猫 |
| ImageBase64 | 否 | String | 输入图Base64数据。大小：单边分辨率要求不小于128，不大于5000。大小不超过8m。格式：jpg，png，jpeg，webp。与Prompt/ImageUrl必填其一，且不能同时存在。 |
| ImageUrl | 否 | String | 输入图Url。大小：单边分辨率要求不小于128，不大于5000。大小不超过8m。格式：jpg，png，jpeg，webp。与Prompt/ImageBase64必填其一，且不能同时存在。示例：https://cos.ap-guangzhou.myqcloud.com/image.jpg |
| MultiViewImages.N | 否 | Array of ViewImage | 多视角的模型图片，视角参考值：left：左视图；right：右视图；back：后视图；每个视角仅限制一张图片 |
| ResultFormat | 否 | String | 生成模型的格式，仅限制生成一种格式。默认返回obj格式。可选值：OBJ，GLB，STL，USDZ，FBX，MP4。示例：OBJ |
| EnablePBR | 否 | Boolean | 是否开启PBR材质生成，默认false。示例：false |

### 返回参数

| 参数名称 | 类型 | 描述 |
|---------|------|------|
| JobId | String | 任务ID（有效期24小时）。示例：1315932989749215232 |
| RequestId | String | 唯一请求ID，由服务端生成，每次请求都会返回 |

### 请求示例

```http
POST / HTTP/1.1
Host: ai3d.tencentcloudapi.com
Content-Type: application/json
X-TC-Action: SubmitHunyuanTo3DJob
<公共请求参数>

{
    "ImageUrl": "https://***.cos.ap-guangzhou.myqcloud.com/***.png"
}
```

### 返回示例

```json
{
    "Response": {
        "JobId": "1315932989749215232",
        "RequestId": "1efb4823-902e-4809-9656-aea168410e54"
    }
}
```

---

## 2. 查询混元生3D任务 (基础版)

### 接口信息
- **接口名称**: `QueryHunyuanTo3DJob`
- **文档链接**: https://cloud.tencent.com/document/product/1804/120827
- **最近更新**: 2025-09-12 01:07:39
- **并发数**: 1个
- **功能**: 查询基础版3D生成任务状态和结果

### 请求参数

| 参数名称 | 必选 | 类型 | 描述 |
|---------|------|------|------|
| Action | 是 | String | 公共参数，本接口取值：QueryHunyuanTo3DJob |
| Version | 是 | String | 公共参数，本接口取值：2025-05-13 |
| Region | 是 | String | 公共参数，详见产品支持的地域列表 |
| JobId | 否 | String | 任务ID。示例：1315932989749215232 |

### 返回参数

| 参数名称 | 类型 | 描述 |
|---------|------|------|
| Status | String | 任务状态。WAIT：等待中，RUN：执行中，FAIL：任务失败，DONE：任务成功。示例：RUN |
| ErrorCode | String | 错误码。示例：InvalidParameter |
| ErrorMessage | String | 错误信息。示例：参数错误 |
| ResultFile3Ds | Array of File3D | 生成的3D文件数组 |
| RequestId | String | 唯一请求ID，由服务端生成，每次请求都会返回 |

### 请求示例

```http
POST / HTTP/1.1
Host: ai3d.tencentcloudapi.com
Content-Type: application/json
X-TC-Action: QueryHunyuanTo3DJob
<公共请求参数>

{
    "JobId": "1315932989749215232"
}
```

### 返回示例

```json
{
    "Response": {
        "ErrorCode": "",
        "ErrorMessage": "",
        "RequestId": "cfbcde8e-dc35-47ec-adda-0fa6d5db1dd2",
        "ResultFile3Ds": [
            {
                "Type": "STL",
                "Url": "https://xxx.cos.ap-guangzhou.tencentcos.cn/xxx.stl",
                "PreviewImageUrl": "https://xxx.cos.ap-guangzhou.tencentcos.cn/xxx.png"
            }
        ],
        "Status": "DONE"
    }
}
```

---

## 3. 提交混元生3D专业版任务

### 接口信息
- **接口名称**: `SubmitHunyuanTo3DProJob`
- **文档链接**: https://cloud.tencent.com/document/product/1804/123447
- **最近更新**: 2025-09-24 10:47:33
- **并发数**: 3个
- **功能**: 专业版3D生成，支持更多高级参数和更高质量的模型

### 请求参数

| 参数名称 | 必选 | 类型 | 描述 |
|---------|------|------|------|
| Action | 是 | String | 公共参数，本接口取值：SubmitHunyuanTo3DProJob |
| Version | 是 | String | 公共参数，本接口取值：2025-05-13 |
| Region | 是 | String | 公共参数，详见产品支持的地域列表 |
| Prompt | 否 | String | 文生3D，3D内容的描述，中文正向提示词。最多支持1024个utf-8字符。与ImageBase64/ImageUrl必填其一，且不能同时存在 |
| ImageBase64 | 否 | String | 输入图Base64数据。大小：单边分辨率要求不小于128，不大于5000。大小不超过8m。格式：jpg，png，jpeg，webp。与Prompt/ImageUrl必填其一，且不能同时存在 |
| ImageUrl | 否 | String | 输入图Url。大小：单边分辨率要求不小于128，不大于5000。大小不超过8m。格式：jpg，png，jpeg，webp。与Prompt/ImageBase64必填其一，且不能同时存在 |
| MultiViewImages.N | 否 | Array of ViewImage | 多视角的模型图片，视角参考值：left：左视图；right：右视图；back：后视图；每个视角仅限制一张图片 |
| EnablePBR | 否 | Boolean | 是否开启PBR材质生成，默认false。示例：true |
| FaceCount | 否 | Integer | 生成3D模型的面数，默认值为500000。可支持生成面数范围：40000-500000。示例：400000 |
| GenerateType | 否 | String | 生成任务类型，默认Normal。可选值：<br>• Normal：可生成带纹理的几何模型<br>• LowPoly：可生成智能减面后的模型<br>• Geometry：可生成不带纹理的几何模型（白模），选择此任务时，EnablePBR参数不生效<br>• Sketch：可输入草图或线稿图生成模型，此模式下prompt和ImageUrl/ImageBase64可一起输入。示例：Normal |

### 返回参数

| 参数名称 | 类型 | 描述 |
|---------|------|------|
| JobId | String | 任务ID（有效期24小时）。示例：1357237233311637504 |
| RequestId | String | 唯一请求ID，由服务端生成，每次请求都会返回 |

### 请求示例

```http
POST / HTTP/1.1
Host: ai3d.tencentcloudapi.com
Content-Type: application/json
X-TC-Action: SubmitHunyuanTo3DProJob
<公共请求参数>

{
    "ImageUrl": "https://cos.ap-guangzhou.myqcloud.com/input.png"
}
```

### 返回示例

```json
{
    "Response": {
        "JobId": "1357237233311637504",
        "RequestId": "173f8c3b-d559-4e17-aac7-4e42303773ac"
    }
}
```

---

## 4. 查询混元生3D专业版任务

### 接口信息
- **接口名称**: `QueryHunyuanTo3DProJob`
- **文档链接**: https://cloud.tencent.com/document/product/1804/123448
- **最近更新**: 2025-09-24 10:47:34
- **并发数**: 3个
- **功能**: 查询专业版3D生成任务状态和结果

### 请求参数

| 参数名称 | 必选 | 类型 | 描述 |
|---------|------|------|------|
| Action | 是 | String | 公共参数，本接口取值：QueryHunyuanTo3DProJob |
| Version | 是 | String | 公共参数，本接口取值：2025-05-13 |
| Region | 是 | String | 公共参数，详见产品支持的地域列表 |
| JobId | 是 | String | 任务ID。示例：1357237233311637504 |

### 返回参数

| 参数名称 | 类型 | 描述 |
|---------|------|------|
| Status | String | 任务状态。WAIT：等待中，RUN：执行中，FAIL：任务失败，DONE：任务成功。示例：DONE |
| ErrorCode | String | 错误码。示例：InvalidParameter |
| ErrorMessage | String | 错误信息。示例：参数错误 |
| ResultFile3Ds | Array of File3D | 生成的3D文件数组 |
| RequestId | String | 唯一请求ID，由服务端生成，每次请求都会返回 |

### 请求示例

```http
POST / HTTP/1.1
Host: ai3d.tencentcloudapi.com
Content-Type: application/json
X-TC-Action: QueryHunyuanTo3DProJob
<公共请求参数>

{
    "JobId": "1357237233311637504"
}
```

### 返回示例

```json
{
    "Response": {
        "ErrorCode": "",
        "ErrorMessage": "",
        "RequestId": "e4de438f-acca-44f9-9f29-7df547c81680",
        "ResultFile3Ds": [
            {
                "PreviewImageUrl": "https://cos.ap-guangzhou.tencentcos.cn/xxx.png",
                "Type": "GLB",
                "Url": "https://cos.ap-guangzhou.tencentcos.cn/xxx.glb"
            }
        ],
        "Status": "DONE"
    }
}
```

---

## 5. 提交混元生3D极速版任务

### 接口信息
- **接口名称**: `SubmitHunyuanTo3DRapidJob`
- **文档链接**: https://cloud.tencent.com/document/product/1804/123463
- **最近更新**: 2025-09-23 01:07:40
- **并发数**: 1个
- **功能**: 极速版3D生成，快速生成但功能相对简化

### 请求参数

| 参数名称 | 必选 | 类型 | 描述 |
|---------|------|------|------|
| Action | 是 | String | 公共参数，本接口取值：SubmitHunyuanTo3DRapidJob |
| Version | 是 | String | 公共参数，本接口取值：2025-05-13 |
| Region | 是 | String | 公共参数，详见产品支持的地域列表 |
| Prompt | 否 | String | 文生3D，3D内容的描述，中文正向提示词。**最多支持200个utf-8字符**（比基础版少）。与ImageBase64/ImageUrl必填其一，且不能同时存在。示例：一只小猫 |
| ImageBase64 | 否 | String | 输入图Base64数据。大小：单边分辨率要求不小于128，不大于5000。大小不超过8m。格式：jpg，png，jpeg，webp。与Prompt/ImageUrl必填其一，且不能同时存在 |
| ImageUrl | 否 | String | 输入图Url。大小：单边分辨率要求不小于128，不大于5000。大小不超过8m。格式：jpg，png，jpeg，webp。与Prompt/ImageBase64必填其一，且不能同时存在 |
| ResultFormat | 否 | String | 生成模型的格式，仅限制生成一种格式。默认返回obj格式。可选值：OBJ，GLB，STL，USDZ，FBX，MP4。示例：OBJ |
| EnablePBR | 否 | Boolean | 是否开启PBR材质生成，默认false。示例：false |

### 返回参数

| 参数名称 | 类型 | 描述 |
|---------|------|------|
| JobId | String | 任务ID（有效期24小时）。示例：1315932989749215232 |
| RequestId | String | 唯一请求ID，由服务端生成，每次请求都会返回 |

### 请求示例

```http
POST / HTTP/1.1
Host: ai3d.tencentcloudapi.com
Content-Type: application/json
X-TC-Action: SubmitHunyuanTo3DRapidJob
<公共请求参数>

{
    "ImageUrl": "https://***.cos.ap-guangzhou.myqcloud.com/***.jpg"
}
```

### 返回示例

```json
{
    "Response": {
        "JobId": "1335141824121323520",
        "RequestId": "5f84f1df-7a29-4f93-8dc0-d9e6dea6bff9"
    }
}
```

---

## 6. 查询混元生3D极速版任务

### 接口信息
- **接口名称**: `QueryHunyuanTo3DRapidJob`
- **文档链接**: https://cloud.tencent.com/document/product/1804/123464
- **最近更新**: 2025-09-23 01:07:41
- **并发数**: 1个
- **功能**: 查询极速版3D生成任务状态和结果

### 请求参数

| 参数名称 | 必选 | 类型 | 描述 |
|---------|------|------|------|
| Action | 是 | String | 公共参数，本接口取值：QueryHunyuanTo3DRapidJob |
| Version | 是 | String | 公共参数，本接口取值：2025-05-13 |
| Region | 是 | String | 公共参数，详见产品支持的地域列表 |
| JobId | 否 | String | 任务ID。示例：1315932989749215232 |

### 返回参数

| 参数名称 | 类型 | 描述 |
|---------|------|------|
| Status | String | 任务状态。WAIT：等待中，RUN：执行中，FAIL：任务失败，DONE：任务成功。示例：RUN |
| ErrorCode | String | 错误码。示例：InvalidParameter |
| ErrorMessage | String | 错误信息。示例：参数错误 |
| ResultFile3Ds | Array of File3D | 生成的3D文件数组 |
| RequestId | String | 唯一请求ID，由服务端生成，每次请求都会返回 |

### 请求示例

```http
POST / HTTP/1.1
Host: ai3d.tencentcloudapi.com
Content-Type: application/json
X-TC-Action: QueryHunyuanTo3DRapidJob
<公共请求参数>

{
    "JobId": "1336255233494892544"
}
```

### 返回示例

```json
{
    "Response": {
        "ErrorCode": "",
        "ErrorMessage": "",
        "RequestId": "3020cd6c-4ad6-4df3-8560-c233f35d6221",
        "ResultFile3Ds": [
            {
                "PreviewImageUrl": "https://xxx.cos.ap-guangzhou.tencentcos.cn/xxx.png",
                "Type": "OBJ",
                "Url": "https://xxx.cos.ap-guangzhou.tencentcos.cn/xxx.zip"
            }
        ],
        "Status": "DONE"
    }
}
```

---

## 数据结构

### File3D
3D文件结构，被查询接口返回使用：`QueryHunyuanTo3DJob`、`QueryHunyuanTo3DProJob`、`QueryHunyuanTo3DRapidJob`

| 名称 | 类型 | 必选 | 描述 |
|------|------|------|------|
| Type | String | 否 | 文件格式。示例值：OBJ |
| Url | String | 否 | 文件的Url（有效期24小时）。示例值：https://cos.ap-guangzhou.myqcloud.com/obj.obj |
| PreviewImageUrl | String | 否 | 预览图片Url。示例值：https://cos.ap-guangzhou.myqcloud.com/image.png |

### ViewImage
多视角图片结构，被提交接口使用：`SubmitHunyuanTo3DJob`、`SubmitHunyuanTo3DProJob`

| 名称 | 类型 | 必选 | 描述 |
|------|------|------|------|
| ViewType | String | 否 | 视角类型。取值：back、left、right。示例值：back |
| ViewImageUrl | String | 否 | 图片Url地址。示例值：https://cos.ap-guangzhou.myqcloud.com/image.jpg |

---

## 错误码

### 功能说明
如果返回结果中存在 Error 字段，则表示调用 API 接口失败。例如：

```json
{
    "Response": {
        "Error": {
            "Code": "AuthFailure.SignatureFailure",
            "Message": "The provided credentials could not be validated. Please check your signature is correct."
        },
        "RequestId": "ed93f3cb-f35e-473f-b9f3-0d451b8b79c6"
    }
}
```

Error 中的 Code 表示错误码，Message 表示该错误的具体信息。

### 公共错误码列表

| 错误码 | 说明 |
|--------|------|
| ActionOffline | 接口已下线 |
| AuthFailure.InvalidAuthorization | 请求头部的 Authorization 不符合腾讯云标准 |
| AuthFailure.InvalidSecretId | 密钥非法（不是云 API 密钥类型） |
| AuthFailure.MFAFailure | MFA 错误 |
| AuthFailure.SecretIdNotFound | 密钥不存在。请在控制台检查密钥是否已被删除或者禁用 |
| AuthFailure.SignatureExpire | 签名过期。Timestamp 和服务器时间相差不得超过五分钟 |
| AuthFailure.SignatureFailure | 签名错误。签名计算错误，请对照调用方式中的签名方法文档检查签名计算过程 |
| AuthFailure.TokenFailure | token 错误 |
| AuthFailure.UnauthorizedOperation | 请求未授权。请参考 CAM 文档对鉴权的说明 |
| DryRunOperation | DryRun 操作，代表请求将会是成功的，只是多传了 DryRun 参数 |
| FailedOperation | 操作失败 |
| InternalError | 内部错误 |
| InvalidAction | 接口不存在 |
| InvalidParameter | 参数错误（包括参数格式、类型等错误） |
| InvalidParameterValue | 参数取值错误 |
| InvalidRequest | 请求 body 的 multipart 格式错误 |
| IpInBlacklist | IP 地址在黑名单中 |
| IpNotInWhitelist | IP 地址不在白名单中 |
| LimitExceeded | 超过配额限制 |
| MissingParameter | 缺少参数 |
| NoSuchProduct | 产品不存在 |
| NoSuchVersion | 接口版本不存在 |
| RequestLimitExceeded | 请求的次数超过了频率限制 |
| RequestLimitExceeded.GlobalRegionUinLimitExceeded | 主账号超过频率限制 |
| RequestLimitExceeded.IPLimitExceeded | IP 限频 |
| RequestLimitExceeded.UinLimitExceeded | 主账号限频 |
| RequestSizeLimitExceeded | 请求包超过限制大小 |
| ResourceInUse | 资源被占用 |
| ResourceInsufficient | 资源不足 |
| ResourceNotFound | 资源不存在 |
| ResourceUnavailable | 资源不可用 |
| ResponseSizeLimitExceeded | 返回包超过限制大小 |
| ServiceUnavailable | 当前服务暂时不可用 |
| UnauthorizedOperation | 未授权操作 |
| UnknownParameter | 未知参数错误，用户多传未定义的参数会导致错误 |
| UnsupportedOperation | 操作不支持 |
| UnsupportedProtocol | http(s) 请求协议错误，只支持 GET 和 POST 请求 |
| UnsupportedRegion | 接口不支持所传地域 |

---

## 计费说明（积分）

> **重要提示**：积分计费**仅适用于混元生3D（专业版）、混元生3D（极速版）**服务。基础版的计费方式请咨询腾讯云官方。

### 免费额度
首次开通腾讯混元生3D服务后，可在控制台领取免费调用额度：

| 产品系列 | 计费接口名称 | 免费额度 | 有效期 |
|----------|--------------|----------|--------|
| 混元生3D | 混元生3D（专业版） | 100积分/用户（需在控制台手动领取） | 1年有效期 |
| 混元生3D | 混元生3D（极速版） | 100积分/用户（需在控制台手动领取） | 1年有效期 |

### 计费模式

#### 1. 积分资源包（预付费）
- **有效期**：1年，自购买日起1年内若资源包积分数未使用完，则过期作废
- **退款政策**：购买后未使用，支持7天内无理由退款
- **使用限制**：资源包只能抵扣购买之后产生的调用量
- **并发限制**：调用积分计费模式下，并发限制为3

| 积分数量 | 价格 | 积分单价（元/积分） |
|----------|------|-------------------|
| 1,000 | 100元 | 0.11 |
| 10,000 | 980元 | 0.098 |
| 50,000 | 4,750元 | 0.095 |
| 100,000 | 9,000元 | 0.09 |

#### 2. 后付费（按积分）
- **结算方式**：按日结算，每日会对上一日用量输出账单并扣费
- **积分单价**：0.1元/积分
- **并发限制**：调用积分计费模式下，并发限制为3

### 积分扣减详细说明

#### 混元生3D（专业版）积分消耗

**基础消耗**：默认为文/图生3D，普通贴图模式，**一次消耗20积分**

**【生成任务类型】** - GenerateType参数（必选项，默认Normal）

| 生成任务类型 | 功能描述 | 消耗积分 |
|-------------|----------|----------|
| Normal | 可生成带纹理的几何模型 | 20.00 |
| LowPoly | 可生成智能减面后带纹理的几何模型 | 25.00 |
| Geometry | 可生成不带纹理的几何模型（白模） | 15.00 |
| Sketch | 可输入草图或线稿图生成带纹理的几何模型 | 25.00 |

**【附加参数】** - 可多选，积分叠加消耗

| 附加参数 | 功能描述 | 额外消耗积分 |
|----------|----------|-------------|
| MultiViewImages | 通过多视图生成3D模型 | 10.00 |
| EnablePBR | 生成带PBR材质的3D模型（含金属度、粗糙度、法线贴图） | 10.00 |
| FaceCount | 生成自定义面数的3D模型 | 10.00 |

#### 混元生3D（极速版）积分消耗

**基础消耗**：默认为文/图生3D，普通贴图模式，**一次消耗10积分**

| 生成参数 | 功能描述 | 消耗积分 |
|----------|----------|----------|
| Prompt | 通过文字生成3D模型 | 10.00 |
| ImageUrl/ImageBase64 | 通过图片生成3D模型 | 10.00 |

**【附加参数】** - 可选择，积分叠加消耗

| 附加参数 | 功能描述 | 额外消耗积分 |
|----------|----------|-------------|
| EnablePBR | 生成带PBR材质的3D模型（含金属度、粗糙度、法线贴图） | 5.00 |

### 计费与结算方式
**结算顺序**：赠送的免费资源包 → 购买的预付费资源包 → 后付费

- 按量计费模式下，按接口用量（积分）计费
- **调用接口失败不计费**（任何原因导致的失败均不扣费，包含因内容风控策略导致的失败）
- 默认情况下，免费资源包和预付费资源包耗尽或到期后，不会自动转入后付费
- 如需使用后付费模式结算，请前往控制台开通后付费

### 费用计算示例

#### 预付费资源包示例
**示例一**：用户使用"LowPoly"生成模式，并开启PBR参数
- 消耗积分：25（LowPoly）+ 10（PBR）= **35积分**

**示例二**：预计一年内累计调用30,000积分
- 购买方案：3个10,000积分规格的积分包
- 总费用：980 × 3 = **2,940元**

#### 后付费示例
用户当日累计调用1000积分，免费额度剩余100积分
- 计费积分：1000 - 100 = 900积分
- 总费用：900 × 0.1 = **90元**

---

## 积分消耗搭配详解

> **重要说明**：基础版不使用积分计费，采用传统计费方式，具体费用请咨询腾讯云官方。

### 🔍 **基础版 (SubmitHunyuanTo3DJob)**
**计费方式**：传统计费（非积分）
- 支持参数：Prompt、ImageBase64/ImageUrl、MultiViewImages、ResultFormat、EnablePBR
- 并发数：1个
- **费用**：不使用积分，具体计费方式需咨询官方

---

### 💎 **专业版 (SubmitHunyuanTo3DProJob) 积分搭配**

#### **基础消耗（GenerateType参数，必选）**
| 生成类型 | 功能描述 | 基础积分 | 费用(0.1元/积分) |
|---------|----------|----------|------------------|
| Normal | 带纹理几何模型 | **20积分** | **2.0元** |
| LowPoly | 智能减面+纹理模型 | **25积分** | **2.5元** |
| Geometry | 白模（无纹理） | **15积分** | **1.5元** |
| Sketch | 草图线稿生成+纹理 | **25积分** | **2.5元** |

#### **附加参数（可多选，积分叠加）**
| 附加功能 | 描述 | 额外积分 | 额外费用 |
|---------|------|----------|----------|
| MultiViewImages | 多视图生成 | **+10积分** | **+1.0元** |
| EnablePBR | PBR材质 | **+10积分** | **+1.0元** |
| FaceCount | 自定义面数 | **+10积分** | **+1.0元** |

#### **专业版完整积分搭配组合**

##### **🔸 Normal模式 (20积分基础)**
| 搭配组合 | 总积分 | 总费用 |
|---------|--------|--------|
| Normal | **20积分** | **2.0元** |
| Normal + MultiView | **30积分** | **3.0元** |
| Normal + PBR | **30积分** | **3.0元** |
| Normal + FaceCount | **30积分** | **3.0元** |
| Normal + MultiView + PBR | **40积分** | **4.0元** |
| Normal + MultiView + FaceCount | **40积分** | **4.0元** |
| Normal + PBR + FaceCount | **40积分** | **4.0元** |
| Normal + MultiView + PBR + FaceCount | **50积分** | **5.0元** |

##### **🔸 LowPoly模式 (25积分基础)**
| 搭配组合 | 总积分 | 总费用 |
|---------|--------|--------|
| LowPoly | **25积分** | **2.5元** |
| LowPoly + MultiView | **35积分** | **3.5元** |
| LowPoly + PBR | **35积分** | **3.5元** |
| LowPoly + FaceCount | **35积分** | **3.5元** |
| LowPoly + MultiView + PBR | **45积分** | **4.5元** |
| LowPoly + MultiView + FaceCount | **45积分** | **4.5元** |
| LowPoly + PBR + FaceCount | **45积分** | **4.5元** |
| LowPoly + MultiView + PBR + FaceCount | **55积分** | **5.5元** |

##### **🔸 Geometry模式 (15积分基础)**
| 搭配组合 | 总积分 | 总费用 |
|---------|--------|--------|
| Geometry | **15积分** | **1.5元** |
| Geometry + MultiView | **25积分** | **2.5元** |
| Geometry + FaceCount | **25积分** | **2.5元** |
| Geometry + MultiView + FaceCount | **35积分** | **3.5元** |

> **注意**：Geometry模式下EnablePBR参数不生效（生成白模时不支持材质）

##### **🔸 Sketch模式 (25积分基础)**
| 搭配组合 | 总积分 | 总费用 |
|---------|--------|--------|
| Sketch | **25积分** | **2.5元** |
| Sketch + MultiView | **35积分** | **3.5元** |
| Sketch + PBR | **35积分** | **3.5元** |
| Sketch + FaceCount | **35积分** | **3.5元** |
| Sketch + MultiView + PBR | **45积分** | **4.5元** |
| Sketch + MultiView + FaceCount | **45积分** | **4.5元** |
| Sketch + PBR + FaceCount | **45积分** | **4.5元** |
| Sketch + MultiView + PBR + FaceCount | **55积分** | **5.5元** |

**专业版积分范围：15-55积分/次 (1.5-5.5元/次)**

---

### ⚡ **极速版 (SubmitHunyuanTo3DRapidJob) 积分搭配**

#### **基础消耗（必选其一）**
| 输入方式 | 功能描述 | 基础积分 | 费用 |
|---------|----------|----------|------|
| Prompt | 文字生成3D | **10积分** | **1.0元** |
| ImageUrl/ImageBase64 | 图片生成3D | **10积分** | **1.0元** |

#### **附加参数（可选）**
| 附加功能 | 描述 | 额外积分 | 额外费用 |
|---------|------|----------|----------|
| EnablePBR | PBR材质 | **+5积分** | **+0.5元** |

#### **极速版完整积分搭配组合**

##### **🔸 文字生成搭配**
| 搭配组合 | 总积分 | 总费用 |
|---------|--------|--------|
| Prompt | **10积分** | **1.0元** |
| Prompt + PBR | **15积分** | **1.5元** |

##### **🔸 图片生成搭配**
| 搭配组合 | 总积分 | 总费用 |
|---------|--------|--------|
| ImageUrl/ImageBase64 | **10积分** | **1.0元** |
| ImageUrl/ImageBase64 + PBR | **15积分** | **1.5元** |

**极速版积分范围：10-15积分/次 (1.0-1.5元/次)**

---

### 📊 **三版本成本对比分析**

| 版本 | 计费方式 | 最低成本 | 最高成本 | 推荐场景 |
|------|----------|----------|----------|----------|
| **基础版** | 传统计费 | 咨询官方 | 咨询官方 | 常规3D生成需求 |
| **专业版** | 积分计费 | **1.5元**(Geometry) | **5.5元**(全功能LowPoly) | 高质量专业需求 |
| **极速版** | 积分计费 | **1.0元**(基础) | **1.5元**(+PBR) | 快速原型制作 |

### 💡 **经济性使用建议**

#### **成本优先**
- **测试阶段**：极速版基础调用 (**1.0元/次**)
- **批量生成**：专业版Geometry模式 (**1.5元/次**)

#### **质量平衡**
- **常规需求**：专业版Normal模式 (**2.0元/次**)
- **带材质**：极速版+PBR (**1.5元/次**)

#### **高端需求**
- **专业制作**：专业版LowPoly+全功能 (**5.5元/次**)
- **多视角建模**：专业版Normal+MultiView+PBR (**4.0元/次**)

### 📈 **批量使用成本预估（后付费0.1元/积分）**

#### **每月1000次调用成本对比**
| 使用模式 | 单次积分 | 单次费用 | 月度费用 |
|---------|----------|----------|----------|
| 极速版基础 | 10积分 | 1.0元 | **1,000元** |
| 专业版Normal | 20积分 | 2.0元 | **2,000元** |
| 专业版LowPoly+PBR | 35积分 | 3.5元 | **3,500元** |
| 专业版全功能 | 55积分 | 5.5元 | **5,500元** |

> **资源包优惠**：如使用预付费资源包，积分单价可低至0.09-0.11元，成本可降低10-20%

---

## 输出格式支持详解

### 📁 **支持的3D格式类型**
腾讯混元3D支持多种主流3D文件格式，满足不同应用场景需求：

| 格式 | 全称 | 特点 | 主要用途 |
|------|------|------|---------|
| **OBJ** | Wavefront OBJ | 通用格式，简单易用 | 3D建模软件、通用交换 |
| **GLB** | GL Transmission Format Binary | 支持纹理、材质、动画 | Web3D、AR/VR应用 |
| **STL** | Stereolithography | 网格数据，适合打印 | 3D打印、快速原型 |
| **USDZ** | Universal Scene Description | Apple生态支持 | iOS AR应用、苹果设备 |
| **FBX** | Filmbox | 功能完整，业界标准 | 游戏引擎、动画制作 |
| **MP4** | MPEG-4 Video | 视频预览格式 | 模型展示、动画预览 |

### 🔧 **各版本格式支持对比**

| 版本 | ResultFormat参数 | 格式选择权 | 支持格式 | 默认格式 |
|------|------------------|------------|----------|----------|
| **基础版** | ✅ 支持 | 用户控制 | OBJ, GLB, STL, USDZ, FBX, MP4 | OBJ |
| **专业版** | ❌ 不支持 | 系统控制 | 未明确说明（系统自动选择） | 系统决定 |
| **极速版** | ✅ 支持 | 用户控制 | OBJ, GLB, STL, USDZ, FBX, MP4 | OBJ |

### 🔍 **专业版格式特殊说明**

**专业版无法用户自定义输出格式**，系统可能根据生成类型自动选择最适合的格式：

| 生成类型 | 推测输出格式 | 原因 |
|---------|-------------|------|
| Normal | GLB/FBX | 支持完整纹理和材质 |
| LowPoly | OBJ/GLB | 适合减面模型 |
| Geometry | STL/OBJ | 白模无纹理，适合几何体 |
| Sketch | GLB/FBX | 支持从线稿生成的纹理 |

> **注意**：专业版的具体输出格式需要实际测试确认，以上为基于功能特性的推测。

### 💡 **格式选择建议**

#### **按应用场景选择**
- **3D打印**：选择 **STL** 格式（基础版/极速版）
- **Web3D/AR应用**：选择 **GLB** 格式
- **游戏开发**：选择 **FBX** 格式
- **iOS AR应用**：选择 **USDZ** 格式
- **通用建模**：选择 **OBJ** 格式
- **预览展示**：选择 **MP4** 格式

#### **按版本选择策略**
- **需要特定格式**：选择基础版或极速版，可精确控制输出格式
- **专业质量优先**：选择专业版，接受系统自动选择的最优格式
- **格式灵活性**：避免选择专业版，其不支持格式自定义

### 📋 **格式控制示例**

#### **基础版/极速版格式指定**
```json
{
    "ImageUrl": "https://example.com/image.jpg",
    "ResultFormat": "GLB"  // 指定输出GLB格式
}
```

#### **专业版无格式控制**
```json
{
    "ImageUrl": "https://example.com/image.jpg",
    "GenerateType": "Normal"
    // 无ResultFormat参数，系统自动选择格式
}
```

---

## API调用方式详解

### 调用方式概述

腾讯云混元3D API采用腾讯云API 3.0标准，支持多种编程语言和签名方法，具备完善的参数验证和错误处理机制。

---

## 1. 请求结构

### 服务地址
腾讯云API支持就近地域接入（例如在广州地区调用云服务器，可以选择广州地域的域名），也支持指定地域接入（例如广州地域的产品，也可以选择通过北京地域的域名调用）。

**推荐使用就近地域接入**：

| 产品 | 就近地域接入域名 | 指定地域接入域名 |
|------|------------------|------------------|
| 混元生3D | ai3d.tencentcloudapi.com | ai3d.ap-beijing.tencentcloudapi.com（北京地域）<br>ai3d.ap-guangzhou.tencentcloudapi.com（广州地域） |

**注意事项**：
- 对时延敏感的业务，建议指定带地域的域名
- 域名是API的接入点，并不代表产品或者接口实际提供服务的地域
- 服务地域由公共参数Region决定

### 通信协议
腾讯云API的所有接口都通过HTTPS进行通信，提供高安全性的通信通道。

### 请求方法
支持HTTP POST请求，不支持GET请求。

### 字符编码
统一使用UTF-8编码。

### API版本
混元生3D的当前版本为：**2025-05-13**

---

## 2. 公共参数

公共参数是用于标识用户和接口鉴权目的的参数，每次请求都需要携带这些参数。

### 签名方法 v3 (TC3-HMAC-SHA256) 的公共参数

在使用签名方法 v3 的时候，公共参数需要放到HTTP Header中：

| 参数名称 | 类型 | 必选 | 描述 |
|---------|------|------|------|
| X-TC-Action | String | 是 | 操作的接口名称。取值参考接口文档中输入参数公共参数Action的说明 |
| X-TC-Region | String | 是 | 地域参数，用来标识希望操作哪个地域的数据 |
| X-TC-Timestamp | Integer | 是 | 当前UNIX时间戳，可记录发起API请求的时间 |
| X-TC-Version | String | 是 | 操作的API的版本。取值参考接口文档中入参公共参数Version的说明 |
| Authorization | String | 是 | HTTP标准身份认证头部字段，例如：TC3-HMAC-SHA256 Credential=AKIDEXAMPLE/Date/service/tc3_request |

### 签名方法 v1 (HmacSHA1/HmacSHA256) 的公共参数

在使用签名方法 v1 (HmacSHA1/HmacSHA256) 的时候，公共参数需要放到请求参数中：

| 参数名称 | 类型 | 必选 | 描述 |
|---------|------|------|------|
| Action | String | 是 | 操作的接口名称。取值参考接口文档中输入参数公共参数Action的说明 |
| Region | String | 是 | 地域参数，用来标识希望操作哪个地域的数据 |
| Timestamp | Integer | 是 | 当前UNIX时间戳，可记录发起API请求的时间 |
| Nonce | Integer | 是 | 随机正整数，与Timestamp联合起来, 用于防止重放攻击 |
| SecretId | String | 是 | 在云API密钥上申请的标识身份的 SecretId，一个SecretId对应唯一的SecretKey |
| Signature | String | 是 | 请求签名，用来验证此次请求的合法性，需要用户根据实际的输入参数计算得出 |
| Version | String | 是 | 操作的API的版本。取值参考接口文档中入参公共参数Version的说明 |
| SignatureMethod | String | 否 | 签名方式，目前支持HmacSHA256和HmacSHA1。只有指定此参数为HmacSHA256时，才使用HmacSHA256算法验证签名，其他情况均使用HmacSHA1验证签名 |
| Token | String | 否 | 临时证书所用的Token，需要结合临时密钥一起使用。临时密钥和Token需要到访问管理的控制台上获取。长期密钥不需要Token |

### 地域列表

由于各个产品支持地域不同，具体详情请参考各产品文档中的地域信息。
混元生3D支持的地域包括：

| 地域 | 取值 |
|------|------|
| 华北地区(北京) | ap-beijing |
| 华南地区(广州) | ap-guangzhou |
| 华东地区(上海) | ap-shanghai |
| 西南地区(成都) | ap-chengdu |

---

## 3. 签名方法 v3 (TC3-HMAC-SHA256)

### 简介
TC3-HMAC-SHA256签名方法是腾讯云API 3.0推荐的安全性更高、功能更完善的签名方法。使用该签名方法时，公共参数需要放到HTTP Header中。

### 签名步骤

#### 第1步：拼接规范请求串
```
HTTPRequestMethod + '\n' +
CanonicalURI + '\n' +
CanonicalQueryString + '\n' +
CanonicalHeaders + '\n' +
SignedHeaders + '\n' +
HashedRequestPayload
```

#### 第2步：拼接待签名字符串
```
StringToSign =
    Algorithm + \n +
    RequestTimestamp + \n +
    CredentialScope + \n +
    HashedCanonicalRequest
```

#### 第3步：计算签名
```
SecretKey = "Gu5t9xGARNpq86cd98joQYCN3*******"
SecretSigning = HmacSHA256("TC3" + SecretKey, Date)
SecretService = HmacSHA256(SecretSigning, Service)
SecretToken = HmacSHA256(SecretService, "tc3_request")
Signature = HexEncode(HmacSHA256(SecretToken, StringToSign))
```

#### 第4步：拼接Authorization
```
Authorization =
    Algorithm + ' ' +
    'Credential=' + SecretId + '/' + CredentialScope + ', ' +
    'SignedHeaders=' + SignedHeaders + ', ' +
    'Signature=' + Signature
```

### 代码示例 (Python)
```python
# -*- coding: utf-8 -*-
import hashlib
import hmac
import json
import os
import sys
import time
from datetime import datetime

def sign(key, msg):
    return hmac.new(key, msg.encode('utf-8'), hashlib.sha256).digest()

def getSignatureKey(key, dateStamp, regionName, serviceName):
    kDate = sign(('TC3' + key).encode('utf-8'), dateStamp)
    kRegion = sign(kDate, regionName)
    kService = sign(kRegion, serviceName)
    kSigning = sign(kService, 'tc3_request')
    return kSigning

if __name__ == '__main__':
    secret_id = "AKIDz8krbsJ5yKBZQpn74WFkmLPx3*******"
    secret_key = "Gu5t9xGARNpq86cd98joQYCN3*******"

    service = 'ai3d'
    host = 'ai3d.tencentcloudapi.com'
    region = 'ap-beijing'
    action = 'SubmitHunyuanTo3DJob'
    version = '2025-05-13'
    algorithm = 'TC3-HMAC-SHA256'
    timestamp = int(time.time())
    date = datetime.utcfromtimestamp(timestamp).strftime('%Y-%m-%d')
    params = {"ImageUrl": "https://cos.ap-guangzhou.myqcloud.com/image.jpg"}

    # ************* 步骤 1：拼接规范请求串 *************
    http_request_method = "POST"
    canonical_uri = "/"
    canonical_querystring = ""
    ct = "application/json; charset=utf-8"
    payload = json.dumps(params)
    canonical_headers = "content-type:%s\nhost:%s\nx-tc-action:%s\nx-tc-timestamp:%s\nx-tc-version:%s\n" % (
        ct, host, action.lower(), timestamp, version)
    signed_headers = "content-type;host;x-tc-action;x-tc-timestamp;x-tc-version"
    hashed_request_payload = hashlib.sha256(payload.encode('utf-8')).hexdigest()
    canonical_request = (http_request_method + "\n" +
                         canonical_uri + "\n" +
                         canonical_querystring + "\n" +
                         canonical_headers + "\n" +
                         signed_headers + "\n" +
                         hashed_request_payload)

    # ************* 步骤 2：拼接待签名字符串 *************
    credential_scope = date + "/" + service + "/" + "tc3_request"
    hashed_canonical_request = hashlib.sha256(canonical_request.encode('utf-8')).hexdigest()
    string_to_sign = (algorithm + "\n" +
                      str(timestamp) + "\n" +
                      credential_scope + "\n" +
                      hashed_canonical_request)

    # ************* 步骤 3：计算签名 *************
    signature_key = getSignatureKey(secret_key, date, service, "tc3_request")
    signature = hmac.new(signature_key, string_to_sign.encode('utf-8'), hashlib.sha256).hexdigest()

    # ************* 步骤 4：拼接 Authorization *************
    authorization = (algorithm + " " +
                     "Credential=" + secret_id + "/" + credential_scope + ", " +
                     "SignedHeaders=" + signed_headers + ", " +
                     "Signature=" + signature)

    print(authorization)
```

---

## 4. 签名方法 v1 (HmacSHA1/HmacSHA256)

### 签名步骤

#### 第1步：排序参数
对所有请求参数按参数名做字典序升序排列。

#### 第2步：拼接请求字符串
```
请求字符串 := 请求方法 + 请求主机 + 请求路径 + ? + 请求字符串
```

#### 第3步：拼接签名原文字符串
```
签名原文字符串 := 请求方法 + & + encode(请求主机) + & + encode(请求字符串)
```

#### 第4步：生成签名串
使用HMAC-SHA1或HMAC-SHA256算法对签名原文字符串进行签名。

### 代码示例 (Python)
```python
# -*- coding: utf-8 -*-
import base64
import hashlib
import hmac
import time
from urllib.parse import urlencode

def make_signature(params, secret_key, method="HmacSHA256"):
    s = urlencode(sorted(params.items()))
    s = "GET&ai3d.tencentcloudapi.com%2F&" + s.replace('&', '%26').replace('=', '%3D')

    if method == "HmacSHA256":
        digest = hmac.new(secret_key.encode('utf-8'), s.encode('utf-8'), hashlib.sha256).digest()
    else:
        digest = hmac.new(secret_key.encode('utf-8'), s.encode('utf-8'), hashlib.sha1).digest()

    signature = base64.b64encode(digest)
    return signature.decode('utf-8')

if __name__ == '__main__':
    secret_id = "AKIDz8krbsJ5yKBZQpn74WFkmLPx3*******"
    secret_key = "Gu5t9xGARNpq86cd98joQYCN3*******"

    params = {
        'Action': 'SubmitHunyuanTo3DJob',
        'ImageUrl': 'https://cos.ap-guangzhou.myqcloud.com/image.jpg',
        'Nonce': 11886,
        'Region': 'ap-beijing',
        'SecretId': secret_id,
        'SignatureMethod': 'HmacSHA256',
        'Timestamp': int(time.time()),
        'Version': '2025-05-13'
    }

    signature = make_signature(params, secret_key)
    params['Signature'] = signature

    print(urlencode(params))
```

---

## 5. 返回结果

### 正确返回结果

腾讯云API 3.0接口调用成功后，会返回JSON格式的数据。以下以云服务器的接口查看实例状态列表(DescribeInstancesStatus)为例：

```json
{
    "Response": {
        "TotalCount": 0,
        "InstanceStatusSet": [],
        "RequestId": "b5b41468-520d-4192-b42f-595cc34b6c1c"
    }
}
```

- **Response及其内部的RequestId**是固定的字段，无论请求成功与否，只要API处理了，则必定会返回
- **RequestId**用于一个API请求的唯一标识，如果API出现异常，可以联系腾讯云客服或提交工单，并提供该ID来解决问题
- 除了固定的字段外，其余均为具体接口定义的字段

### 错误返回结果

若调用失败，其返回值示例如下：

```json
{
    "Response": {
        "Error": {
            "Code": "AuthFailure.SignatureFailure",
            "Message": "The provided credentials could not be validated. Please check your signature is correct."
        },
        "RequestId": "ed93f3cb-f35e-473f-b9f3-0d451b8b79c6"
    }
}
```

- **Error的出现**代表着该请求调用失败
- **Error字段连同其内部的Code和Message字段**在调用失败时是必定返回的
- **Code**表示具体出错的错误码，当请求出错时可以先根据该错误码在公共错误码和当前接口对应的错误码列表里面查找对应原因和解决方案
- **Message**显示出了这个错误发生的具体原因，随着业务发展或体验优化，此文本可能会经常保持变更或更新，用户不应依赖这个返回值

### 数据限制

- **返回JSON数据**：云API 3.0接口默认返回JSON数据，返回非JSON格式的接口会在文档中做出说明
- **数据大小限制**：返回JSON数据时最大限制为50MB，如果返回的数据超过最大限制，请求会失败并返回内部错误
- **状态码说明**：目前只要请求被服务端正常处理了，响应的HTTP状态码均为200。例如返回的消息体里的错误码是签名失败，但HTTP状态码是200，而不是401

### 处理建议

请根据接口文档中给出的过滤功能（例如时间范围）或者分页功能，控制返回数据不要过大。

---

## 6. 参数类型

### 支持的数据格式

腾讯云API 3.0输入参数和输出参数支持以下数据格式：

| 数据类型 | 描述 | 示例值 |
|---------|------|--------|
| **String** | 字符串 | "一只小猫" |
| **Integer** | 整型，上限为无符号64位整数 | 123456 |
| **Boolean** | 布尔型 | true / false |
| **Float** | 浮点型 | 3.14 |
| **Double** | 双精度浮点型 | 3.141592653589793 |
| **Date** | 字符串，日期格式 | "2022-01-01" |
| **Timestamp** | 字符串，时间格式 | "2022-01-01 00:00:00" |
| **Timestamp ISO8601** | ISO 8601国际标准时间格式 | "2022-01-01T00:00:00+08:00" |
| **Binary** | 二进制内容，需要以特定协议请求和解析 | Base64编码的二进制数据 |

### SDK注意事项

**Integer类型限制**：
- 上限为无符号64位整数
- SDK 3.0不同编程语言支持的类型有所差异
- 建议以所使用编程语言的最大整型定义，例如Golang的uint64

**Timestamp ISO8601说明**：
- ISO 8601是由国际标准化组织(ISO)发布的关于日期和时间格式的国际标准
- 对应国标《GB/T 7408-2005数据元和交换格式信息交换日期和时间表示法》
- 建议以所使用编程语言的标准库进行格式解析

**Binary类型处理**：
- 二进制内容需要以特定协议请求和解析
- 通常使用Base64编码进行传输
- 图片参数(如ImageBase64)就是Binary类型的典型应用

---

## 版本对比总结

| 特性 | 基础版 | 专业版 | 极速版 |
|------|--------|--------|--------|
| **并发数** | 1个 | 3个 | 1个 |
| **Prompt字符限制** | 1024个 | 1024个 | 200个 |
| **面数控制** | ❌ | ✅ (40K-500K) | ❌ |
| **生成类型** | ❌ | ✅ (Normal/LowPoly/Geometry/Sketch) | ❌ |
| **多视角输入** | ✅ | ✅ | ❌ |
| **处理速度** | 中等 | 较慢（高质量） | 最快 |
| **计费方式** | 传统计费（具体咨询官方） | 积分计费 | 积分计费 |
| **基础积分消耗** | - | 20积分/次 | 10积分/次 |
| **输出格式控制** | ✅ 用户可选 | ❌ 系统决定 | ✅ 用户可选 |
| **支持格式** | 6种全部 | 系统自选 | 6种全部 |
| **高级功能** | 基础功能 | 多种生成类型+附加参数 | 基础功能+PBR材质 |
| **适用场景** | 常规3D生成 | 专业高质量需求 | 快速原型制作 |

## 开发者资源

### SDK支持
- **Python**: Tencent Cloud SDK 3.0 for Python
- **Java**: Tencent Cloud SDK 3.0 for Java
- **PHP**: Tencent Cloud SDK 3.0 for PHP
- **Go**: Tencent Cloud SDK 3.0 for Go
- **Node.js**: Tencent Cloud SDK 3.0 for Node.js
- **.NET**: Tencent Cloud SDK 3.0 for .NET
- **C++**: Tencent Cloud SDK 3.0 for C++
- **Ruby**: Tencent Cloud SDK 3.0 for Ruby

### 工具支持
- **API Explorer**: 在线调用、签名验证、SDK代码生成
- **API Inspector**: 控制台操作API调用情况查看
- **Tencent Cloud CLI 3.0**: 命令行工具

### 错误处理
所有接口暂无业务逻辑相关的错误码，其他错误码详见[公共错误码文档](https://cloud.tencent.com/document/api/common)。

---

**文档生成时间**: 2025-09-26
**文档版本**: v1.0
**API版本**: 2025-05-13