interface StableDiffusionParams {
  prompt: string
  negative_prompt?: string
  width?: number
  height?: number
  num_outputs?: number
  guidance_scale?: number
  num_inference_steps?: number
}

interface GenerationResult {
  images: string[]
  seed?: number
  cost?: number
}

export async function generateWithStableDiffusion(params: StableDiffusionParams): Promise<string[]> {
  const apiKey = process.env.STABLE_DIFFUSION_API_KEY
  const apiUrl = process.env.STABLE_DIFFUSION_API_URL || 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image'

  if (!apiKey) {
    throw new Error('Stable Diffusion API key not configured')
  }

  const requestBody = {
    text_prompts: [
      {
        text: params.prompt,
        weight: 1
      }
    ],
    cfg_scale: params.guidance_scale || 7.5,
    height: params.height || 512,
    width: params.width || 512,
    samples: params.num_outputs || 1,
    steps: params.num_inference_steps || 30,
  }

  if (params.negative_prompt) {
    requestBody.text_prompts.push({
      text: params.negative_prompt,
      weight: -1
    })
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Stable Diffusion API error: ${errorData.message || response.statusText}`)
    }

    const result = await response.json()

    // 处理返回的图片数据，通常是base64或URL
    const images: string[] = result.artifacts?.map((artifact: any) => {
      if (artifact.base64) {
        // 如果是base64，需要上传到存储服务并返回URL
        return uploadBase64Image(artifact.base64)
      }
      return artifact.url
    }) || []

    return images
  } catch (error) {
    console.error('Stable Diffusion generation failed:', error)
    throw new Error('图片生成失败，请重试')
  }
}

async function uploadBase64Image(base64Data: string): Promise<string> {
  // TODO: 实现上传到Supabase Storage的逻辑
  // 这里暂时返回一个模拟URL
  const fileName = `generated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`

  try {
    // 实际项目中应该上传到Supabase Storage
    // const { data, error } = await supabase.storage
    //   .from('ai-creations')
    //   .upload(fileName, base64ToBlob(base64Data))

    // 暂时返回一个模拟URL
    return `https://storage.example.com/ai-creations/${fileName}`
  } catch (error) {
    console.error('Failed to upload generated image:', error)
    throw new Error('图片上传失败')
  }
}

function base64ToBlob(base64: string): Blob {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }

  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: 'image/png' })
}