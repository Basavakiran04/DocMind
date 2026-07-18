import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

// Groq client for chat (unlimited free tier per minute)
export const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Solution 4: Multiple API Keys for embeddings
const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean) as string[];

if (API_KEYS.length === 0) {
  throw new Error("No Gemini API keys found!");
}

let currentKeyIndex = 0;

function getNextAPIKey(): string {
  const key = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return key;
}

export function getGeminiClient(): GoogleGenerativeAI {
  const key = getNextAPIKey();
  return new GoogleGenerativeAI(key);
}

// Solution 3: Larger chunks
export function chunkText(
  text: string,
  chunkSize = 3000,
  overlap = 500
): string[] {
  const chunks: string[] = [];
  let i = 0;
  const cleanText = text.replace(/\s+/g, " ").trim();
  while (i < cleanText.length) {
    const chunk = cleanText.slice(i, i + chunkSize);
    chunks.push(chunk);
    i += chunkSize - overlap;
  }
  return chunks;
}

// Solution 1: Batch processing
export async function processInBatches<T>(
  items: T[],
  batchSize: number,
  delayMs: number,
  processor: (item: T, index: number) => Promise<any>
): Promise<any[]> {
  const results = [];
  for (let i = 0; i < items.length; i++) {
    const result = await processor(items[i], i);
    results.push(result);
    if ((i + 1) % batchSize === 0 && i + 1 < items.length) {
      console.log(`⏳ Pausing ${delayMs}ms to respect rate limits...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return results;
}

export function getEmbeddingModel() {
  const client = getGeminiClient();
  return client.getGenerativeModel({
    model: "models/gemini-embedding-001",
  });
}