"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface Message {
  role: "user" | "ai";
  content: string;
}

interface FileInfo {
  id: string;
  file_name: string;
  file_url: string;
}

export default function ChatPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const fileId = params.fileId as string;

  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content:
        "Hello! I have read your PDF document. Ask me anything about it!",
    },
  ]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingFile, setFetchingFile] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  // Fetch file info
  useEffect(() => {
    const fetchFile = async () => {
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("id", fileId)
        .single();

      if (error || !data) {
        router.push("/dashboard");
        return;
      }

      setFileInfo(data);
      setFetchingFile(false);
    };

    if (fileId) fetchFile();
  }, [fileId]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAskQuestion = async () => {
    if (!question.trim() || loading) return;

    const userQuestion = question.trim();
    setQuestion("");

    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userQuestion },
    ]);

    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userQuestion,
          fileId: fileId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get answer");
      }

      // Add AI response to chat
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: data.answer },
      ]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Allow pressing Enter to send message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  if (!isLoaded || fetchingFile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation Bar */}
      <nav className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ← Back
              </button>
              <h1 className="text-xl font-bold text-blue-600">DocMind</h1>
            </div>
            <p className="text-sm text-gray-500 truncate max-w-xs">
              📄 {fileInfo?.file_name}
            </p>
          </div>
        </div>
      </nav>

      {/* Main Layout: PDF Viewer + Chat */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: PDF Viewer */}
        <div className="w-1/2 border-r bg-white overflow-auto p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            📄 Document Preview
          </h2>
          {fileInfo?.file_url && (
            <iframe
              src={fileInfo.file_url}
              className="w-full h-[calc(100vh-140px)] rounded-lg border"
              title="PDF Preview"
            />
          )}
        </div>

        {/* Right Side: Chat Interface */}
        <div className="w-1/2 flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-200 text-gray-800 shadow-sm"
                  }`}
                >
                  {/* Role Label */}
                  <p className={`text-xs font-semibold mb-1 ${
                    message.role === "user"
                      ? "text-blue-100"
                      : "text-blue-600"
                  }`}>
                    {message.role === "user" ? "You" : "🤖 DocMind AI"}
                  </p>
                  {/* Message Content */}
                  <p className="leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}

            {/* Loading Animation */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold text-blue-600 mb-1">
                    🤖 DocMind AI
                  </p>
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t bg-white p-4">
            <div className="flex gap-2">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your PDF... (Press Enter to send)"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                rows={2}
                disabled={loading}
              />
              <button
                onClick={handleAskQuestion}
                disabled={loading || !question.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {loading ? "..." : "Send"}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Powered by Google Gemini AI • Answers based on your document only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}