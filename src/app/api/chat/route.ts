import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { prisma } from '@/lib/prisma'
import { NextApiResponse } from 'next'

// 创建 DeepSeek 兼容实例
const deepseek = createOpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: 'https://api.deepseek.com', // DeepSeek 标准 API 地址
})

export async function POST(req: Request, response: NextApiResponse) {
  try {
    const { messages } = await req.json()

    const result = streamText({
      model: deepseek('deepseek-v3'),
      messages,
    })

    return result.toUIMessageStreamResponse()
  } catch (error: any) {
    console.error('Chat API Fatal Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
