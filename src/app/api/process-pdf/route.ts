import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { GoogleGenerativeAI } from "@google/generative-ai";
import PDFParser from "pdf2json";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Helper function to split text into chunks
function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
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

// Extract text from PDF buffer using pdf2json
function extractTextFromPDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new (PDFParser as any)(null, 1);

    pdfParser.on("pdfParser_dataError", (errData: any) => {
      reject(new Error(errData.parserError));
    });

    pdfParser.on("pdfParser_dataReady", () => {
      // getRawTextContent() returns plain text from the PDF
      const rawText = pdfParser.getRawTextContent();
      resolve(rawText);
    });

    pdfParser.parseBuffer(buffer);
  });
}

export async function POST(req: NextRequest) {
  try {
    const { fileId, fileUrl } = await req.json();

    if (!fileId || !fileUrl) {
      return NextResponse.json(
        { error: "Missing file credentials" },
        { status: 400 }
      );
    }

    console.log("📥 Downloading PDF from:", fileUrl);

    // 1. Download PDF from Supabase Storage
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("📄 Parsing PDF with pdf2json...");

    // 2. Extract text from PDF
    const rawText = await extractTextFromPDF(buffer);

    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json(
        { error: "PDF has no extractable text" },
        { status: 400 }
      );
    }

    console.log(`✂️ Extracted ${rawText.length} characters. Chunking...`);

    // 3. Chunk the text
    const textChunks = chunkText(rawText);

    console.log(`🧠 Sending ${textChunks.length} chunks to Gemini AI...`);

    // 4. Generate embeddings with Gemini
    const model = genAI.getGenerativeModel({ model: "models/gemini-embedding-001" });
    const embeddingRecords = [];

    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      console.log(`🔄 Processing chunk ${i + 1}/${textChunks.length}`);
      const embedResult = await model.embedContent(chunk);
      const vector = embedResult.embedding.values;
      embeddingRecords.push({
        file_id: fileId,
        content: chunk,
        embedding: vector,
      });
    }

    console.log("💾 Saving vectors to Supabase...");

    // 5. Save embeddings to Supabase
    const { error: dbError } = await supabase
      .from("file_embeddings")
      .insert(embeddingRecords);

    if (dbError) throw dbError;

    console.log("✅ PDF processing complete!");

    return NextResponse.json({
      success: true,
      chunksCount: textChunks.length,
    });

  } catch (error: any) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process PDF" },
      { status: 500 }
    );
  }
}