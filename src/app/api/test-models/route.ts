import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );
    const data = await response.json();

    // Filter chat models
    const chatModels = data.models?.filter((model: any) =>
      model.supportedGenerationMethods?.includes("generateContent")
    );

    // Filter embedding models
    const embeddingModels = data.models?.filter((model: any) =>
      model.supportedGenerationMethods?.includes("embedContent")
    );

    return NextResponse.json({
      chatModels: chatModels?.map((m: any) => m.name),
      embeddingModels: embeddingModels?.map((m: any) => m.name),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}