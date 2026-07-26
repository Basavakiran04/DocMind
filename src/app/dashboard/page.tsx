"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Navigation Bar */}
      <nav className="border-b border-white/5 bg-black/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold">
              Doc<span className="gradient-text">Mind</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                Welcome, {user?.firstName || "User"}
              </span>
              <UserButton
                appearance={{
                  elements: { avatarBox: "ring-1 ring-[#D4AF37]/30 rounded-full" },
                }}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <p className="text-[#D4AF37] text-xs font-medium tracking-wide mb-1">
            DASHBOARD
          </p>
          <h2 className="text-2xl font-bold">My Documents</h2>
          <p className="text-gray-500 text-sm mt-1">
            Upload a PDF and start chatting with it
          </p>
        </div>

        {/* Upload Area */}
        <UploadButton onUploadComplete={fetchFiles} />

        {/* Files List */}
        <div className="mt-10">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">Loading your documents...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-14 border border-dashed border-white/10 rounded-xl bg-[#0A0A0A]">
              <div className="text-4xl mb-3 opacity-70">📄</div>
              <p className="text-gray-500 text-sm">
                No documents yet. Upload your first PDF above.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-600 mb-4">
                {files.length} document{files.length !== 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file) => (
                  <div key={file.id} className="gradient-border-card group">
                    <div className="bg-[#0A0A0A] rounded-xl p-5 h-full flex flex-col transition-colors group-hover:bg-[#111111]">
                      {/* File Icon and Name */}
                      <div className="flex items-start gap-3 mb-5">
                        <div className="text-2xl">📄</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate text-sm">
                            {file.file_name}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {new Date(file.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Chat Button */}
                      <button
                        onClick={() => router.push(`/dashboard/${file.id}`)}
                        className="mt-auto w-full px-4 py-2.5 text-sm font-medium text-black bg-gradient-to-r from-[#D4AF37] to-[#F5D060] rounded-lg hover:opacity-90 transition-all"
                      >
                        Chat with PDF →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}