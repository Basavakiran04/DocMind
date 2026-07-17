"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import UploadButton from "@/components/UploadButton";
import { supabase } from "@/lib/supabase";

interface PDFFile {
  id: string;
  file_name: string;
  file_url: string;
  created_at: string;
}

export default function Dashboard() {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  // Fetch user's uploaded files from Supabase
  const fetchFiles = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setFiles(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchFiles();
    }
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation Bar */}
      <nav className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-blue-600">DocMind</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.firstName || "User"} 👋
              </span>
              <UserButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Documents</h2>
          <p className="text-gray-500 text-sm mt-1">
            Upload a PDF and start chatting with it
          </p>
        </div>

        {/* Upload Area */}
        <UploadButton onUploadComplete={fetchFiles} />

        {/* Files List */}
        <div className="mt-8">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading your documents...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-white">
              <div className="text-5xl mb-3">📄</div>
              <p className="text-gray-500">No documents yet. Upload your first PDF!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* File Icon and Name */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="text-3xl">📄</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {file.file_name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Chat Button */}
                  <button
                    onClick={() => router.push(`/dashboard/${file.id}`)}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    💬 Chat with PDF
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}