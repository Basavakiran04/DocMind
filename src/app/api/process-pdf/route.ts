import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
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
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId, fileUrl } = await req.json();

    if (!fileId || !fileUrl) {
      return NextResponse.json(
        { error: "Missing file credentials" },
        { status: 400 }
      );
    }

    // Verify this file actually belongs to the logged-in user before processing it
    const { data: fileRecord, error: ownershipError } = await supabaseAdmin
      .from("files")
      .select("id")
      .eq("id", fileId)
      .eq("user_id", userId)
      .single();

    if (ownershipError || !fileRecord) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
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

    const textChunks = chunkText(rawText);
    console.log(`📦 Split into ${textChunks.length} chunks`);

    console.log(`🧠 Sending chunks to Gemini AI...`);

    const embeddingRecords: any[] = [];

    await processInBatches(
      textChunks,
      5,    // Process 5 chunks at a time
      1500, // Wait 1.5 seconds between batches
      async (chunk: string, index: number) => {
        console.log(`🔄 Processing chunk ${index + 1}/${textChunks.length}`);

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

    const { error: dbError } = await supabaseAdmin
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