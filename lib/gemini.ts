import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '@/lib/env'

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)

export const embeddingModel = genAI.getGenerativeModel({
  model: 'models/gemini-embedding-001',
})

export const chatModel = genAI.getGenerativeModel({
  model: 'gemini-3.1-flash-lite',
})