"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-blue-600">DocuMind</h1>

            <div className="flex items-center gap-4">
              {!isSignedIn ? (
                <>
                  <SignInButton mode="modal">
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                      Sign In
                    </button>
                  </SignInButton>

                  <SignUpButton mode="modal">
                    <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                      Sign Up
                    </button>
                  </SignUpButton>
                </>
              ) : (
                <UserButton />
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-3xl">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Chat with Your PDFs
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Upload any PDF and ask questions. Our AI will answer based on the
            document content.
          </p>

          {!isSignedIn ? (
            <SignUpButton mode="modal">
              <button className="px-8 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                Get Started Free
              </button>
            </SignUpButton>
          ) : (
            <Link
              href="/dashboard"
              className="px-8 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 inline-block"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}