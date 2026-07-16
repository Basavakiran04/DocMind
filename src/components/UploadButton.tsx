"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

export default function UploadButton() {
  const { user } = useUser();
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Only accept PDF files
      const file = acceptedFiles[0];
      if (!file || file.type !== "application/pdf") {
        setError("Please upload a PDF file only.");
        return;
      }

      // File size limit: 5MB for free users
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB.");
        return;
      }

      try {
        setUploading(true);
        setError(null);

        // Step 1: Upload PDF file to Supabase Storage
        const fileName = `${user?.id}/${Date.now()}_${file.name}`;
        const { data: storageData, error: storageError } =
          await supabase.storage.from("pdfs").upload(fileName, file);

        if (storageError) throw storageError;

        // Step 2: Get the public URL of the uploaded file
        const { data: urlData } = supabase.storage
          .from("pdfs")
          .getPublicUrl(storageData.path);

        // Step 3: Save file info to our database
        const { error: dbError } = await supabase.from("files").insert({
          user_id: user?.id,
          file_name: file.name,
          file_url: urlData.publicUrl,
        });

        if (dbError) throw dbError;

        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      } catch (err) {
        console.error(err);
        setError("Something went wrong. Please try again.");
      } finally {
        setUploading(false);
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
      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
          ${isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50"
          }`}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="text-4xl animate-bounce">⏳</div>
            <p className="text-blue-600 font-medium">Uploading your PDF...</p>
          </div>
        ) : uploadSuccess ? (
          <div className="flex flex-col items-center gap-3">
            <div className="text-4xl">✅</div>
            <p className="text-green-600 font-medium">
              PDF uploaded successfully!
            </p>
          </div>
        ) : isDragActive ? (
          <div className="flex flex-col items-center gap-3">
            <div className="text-4xl">📂</div>
            <p className="text-blue-600 font-medium">Drop your PDF here!</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="text-6xl">📄</div>
            <p className="text-gray-700 font-medium text-lg">
              Drag and drop your PDF here
            </p>
            <p className="text-gray-400 text-sm">or</p>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
              Browse Files
            </button>
            <p className="text-gray-400 text-xs mt-2">
              PDF files only • Max 5MB
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}