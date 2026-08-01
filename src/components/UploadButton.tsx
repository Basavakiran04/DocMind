"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

interface UploadButtonProps {
  onUploadComplete?: () => void;
}

export default function UploadButton({ onUploadComplete }: UploadButtonProps) {
  const { user } = useUser();
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file || file.type !== "application/pdf") {
        setError("Please upload a PDF file only.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB.");
        return;
      }

      try {
        setUploading(true);
        setError(null);
        setAiStatus("Step 1/3: Uploading PDF to cloud...");

        // 1. Upload PDF file to Supabase Storage
        const fileName = `${user?.id}/${Date.now()}_${file.name}`;
        const { data: storageData, error: storageError } =
          await supabase.storage.from("pdfs").upload(fileName, file);

        if (storageError) throw storageError;

        // 2. Get the public URL of the uploaded file
        const { data: urlData } = supabase.storage
          .from("pdfs")
          .getPublicUrl(storageData.path);

        setAiStatus("Step 2/3: Registering document...");

        // 3. Save file info to our database and get the generated ID
        const res = await fetch("/api/files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file_name: file.name,
            file_url: urlData.publicUrl,
          }),
        });

        const { file: dbData, error: dbErrorMsg } = await res.json();
        if (!res.ok) throw new Error(dbErrorMsg);
        setAiStatus("Step 3/3: Gemini AI is reading & embedding your PDF...");

        // 4. Call our Gemini AI Backend Route to process the PDF
        const response = await fetch("/api/process-pdf", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileId: dbData.id,
            fileUrl: urlData.publicUrl,
          }),
        });

        const apiResult = await response.json();

        if (!response.ok) {
          throw new Error(apiResult.error || "AI processing failed");
        }

        setUploadSuccess(true);
        if (onUploadComplete) onUploadComplete();
        setTimeout(() => setUploadSuccess(false), 3000);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong. Please try again.");
      } finally {
        setUploading(false);
        setAiStatus(null);
      }
    },
    [user]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`rounded-xl p-10 text-center cursor-pointer transition-colors border
          ${
            isDragActive
              ? "border-[#D4AF37]/60 bg-[#D4AF37]/5"
              : "border-[#D4AF37]/50 border-dashed bg-[#0A0A0A] hover:border-[#D4AF37]/80 hover:bg-[#0A0A0A]/80"
          }`}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="text-3xl animate-pulse">⏳</div>
            <p className="text-[#D4AF37] font-medium text-sm">Processing File</p>
            <p className="text-gray-500 text-xs">{aiStatus}</p>
          </div>
        ) : uploadSuccess ? (
          <div className="flex flex-col items-center gap-3">
            <div className="text-3xl">✅</div>
            <p className="text-[#D4AF37] font-medium text-sm">
              PDF processed by Gemini AI
            </p>
            <p className="text-gray-500 text-xs">Ready to chat</p>
          </div>
        ) : isDragActive ? (
          <div className="flex flex-col items-center gap-3">
            <div className="text-3xl">📂</div>
            <p className="text-[#D4AF37] font-medium text-sm">Drop your PDF here</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="text-4xl opacity-80">📄</div>
            <p className="text-gray-300 font-medium text-sm">
              Drag and drop your PDF here
            </p>
            <p className="text-gray-600 text-xs">or</p>
            <button className="px-4 py-2 text-xs font-medium text-black bg-gradient-to-r from-[#D4AF37] to-[#F5D060] rounded-lg hover:opacity-90 transition-all">
              Browse Files
            </button>
            <p className="text-gray-600 text-xs mt-1">
              PDF files only • Max 5MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}