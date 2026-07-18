import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getEmbeddingModel, chunkText, processInBatches } from "@/lib/gemini";
import PDFParser from "pdf2json";

// Extract text from PDF buffer
function extractTextFromPDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new (PDFParser as any)(null, 1);
    pdfParser.on("pdfParser_dataError", (errData: any) => {
      reject(new Error(errData.parserError));
    });
    pdfParser.on("pdfParser_dataReady", () => {
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

    console.log("📄 Parsing PDF...");

    // 2. Extract text
    const rawText = await extractTextFromPDF(buffer);

    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json(
        { error: "PDF has no extractable text" },
        { status: 400 }
      );
    }

    console.log(`✂️ Extracted ${rawText.length} characters.`);

    // Solution 3: Larger chunks = fewer API calls
    const textChunks = chunkText(rawText);
    console.log(`📦 Split into ${textChunks.length} chunks`);

    console.log(`🧠 Sending chunks to Gemini AI...`);

    // Solution 1 + 4: Batch processing with rotating API keys
    const embeddingRecords: any[] = [];

    await processInBatches(
      textChunks,
      5,    // Process 5 chunks at a time
      1500, // Wait 1.5 seconds between batches
      async (chunk: string, index: number) => {
        console.log(`🔄 Processing chunk ${index + 1}/${textChunks.length}`);

        // Solution 4: Gets a fresh rotating API key each time
        const model = getEmbeddingModel();
        const embedResult = await model.embedContent(chunk);
        const vector = embedResult.embedding.values;

        embeddingRecords.push({
          file_id: fileId,
          content: chunk,
          embedding: vector,
        });
      }
    );

    console.log("💾 Saving vectors to Supabase...");

    // Save all embeddings to Supabase
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