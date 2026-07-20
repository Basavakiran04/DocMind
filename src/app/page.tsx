"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Typing animation questions
const typingTexts = [
  "What is the conclusion of this report?",
  "Summarize this research paper for me",
  "What methods are used in this document?",
  "Explain the key findings simply",
  "What are the main recommendations?",
];

// Fixed particle positions
const particles = [
  { x: 5, y: 10, size: 2, delay: 0 },
  { x: 15, y: 25, size: 1.5, delay: 0.5 },
  { x: 25, y: 8, size: 2.5, delay: 1 },
  { x: 35, y: 30, size: 1, delay: 1.5 },
  { x: 45, y: 15, size: 2, delay: 0.3 },
  { x: 55, y: 35, size: 1.5, delay: 0.8 },
  { x: 65, y: 12, size: 2, delay: 1.2 },
  { x: 75, y: 28, size: 1, delay: 0.6 },
  { x: 85, y: 18, size: 2.5, delay: 1.8 },
  { x: 92, y: 5, size: 1.5, delay: 0.4 },
  { x: 10, y: 40, size: 1, delay: 1.1 },
  { x: 50, y: 45, size: 2, delay: 0.7 },
  { x: 80, y: 42, size: 1.5, delay: 1.4 },
  { x: 30, y: 48, size: 1, delay: 0.9 },
  { x: 70, y: 50, size: 2, delay: 1.6 },
];

// Typing hook
function useTypingAnimation(
  texts: string[],
  typingSpeed = 60,
  deleteSpeed = 30,
  pauseTime = 2000
) {
  const [displayText, setDisplayText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const currentText = texts[textIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      if (displayText.length < currentText.length) {
        timeout = setTimeout(
          () => setDisplayText(currentText.slice(0, displayText.length + 1)),
          typingSpeed
        );
      } else {
        timeout = setTimeout(() => setIsDeleting(true), pauseTime);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(
          () => setDisplayText(displayText.slice(0, -1)),
          deleteSpeed
        );
      } else {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % texts.length);
      }
    }
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, textIndex, mounted, texts, typingSpeed, deleteSpeed, pauseTime]);

  return { displayText, mounted };
}

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const { displayText, mounted } = useTypingAnimation(typingTexts);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex justify-between items-center px-6 py-4 border-b border-white/5 bg-black/80 backdrop-blur-md">
        <h1 className="text-xl font-bold tracking-tight">
          <span className="text-white">Doc</span>
          <span className="gradient-text">Mind</span>
        </h1>
        <div className="flex items-center gap-3">
          {!isSignedIn ? (
            <>
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 text-sm text-black bg-gradient-to-r from-[#D4AF37] to-[#F5D060] rounded-lg hover:opacity-90 transition-opacity font-medium">
                  Get Started Free
                </button>
              </SignUpButton>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm text-black bg-gradient-to-r from-[#D4AF37] to-[#F5D060] rounded-lg hover:opacity-90 font-medium"
              >
                Dashboard
              </Link>
              <UserButton />
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-20 pb-16 overflow-hidden">
        {/* Golden Orb Mesh */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#D4AF37]/15 rounded-full blur-[100px] animate-orb-float" />
          <div className="absolute top-[20%] left-[35%] w-[350px] h-[350px] bg-[#F5D060]/10 rounded-full blur-[80px] animate-orb-float-reverse" />
          <div
            className="absolute top-[5%] left-[60%] w-[250px] h-[250px] bg-amber-500/10 rounded-full blur-[60px] animate-orb-float"
            style={{ animationDelay: "3s" }}
          />
          {particles.map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-[#D4AF37] animate-particle-flicker"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <motion.div
          className="relative z-10 text-center max-w-3xl"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.span
            variants={fadeInUp}
            className="inline-block px-4 py-1.5 text-xs font-medium text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full mb-8"
          >
            ✨ AI-Powered PDF Intelligence
          </motion.span>

          <motion.h2
            variants={fadeInUp}
            className="text-5xl md:text-6xl font-bold leading-tight mb-6 tracking-tight"
          >
            Your documents,
            <br />
            <span className="gradient-text">answered instantly</span>
          </motion.h2>

          <motion.div variants={fadeInUp} className="mb-10">
            <p className="text-gray-500 text-sm mb-2">Try asking:</p>
            <div className="h-8 flex items-center justify-center">
              <span className="text-lg text-[#D4AF37]/80 font-mono">
                &quot;{mounted ? displayText : ""}&quot;
              </span>
              <span className="ml-1 w-0.5 h-5 bg-[#D4AF37] animate-blink" />
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex gap-4 justify-center">
            {!isSignedIn ? (
              <>
                <SignUpButton mode="modal">
                  <button className="px-8 py-3 text-black bg-gradient-to-r from-[#D4AF37] to-[#F5D060] rounded-lg font-medium hover:opacity-90 transition-all hover:shadow-lg hover:shadow-[#D4AF37]/20 animate-gold-pulse">
                    Get Started Free →
                  </button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button className="px-8 py-3 text-gray-300 bg-white/5 border border-white/10 rounded-lg font-medium hover:bg-white/10 transition-all">
                    Sign In
                  </button>
                </SignInButton>
              </>
            ) : (
              <Link
                href="/dashboard"
                className="px-8 py-3 text-black bg-gradient-to-r from-[#D4AF37] to-[#F5D060] rounded-lg font-medium hover:opacity-90 transition-all hover:shadow-lg hover:shadow-[#D4AF37]/20"
              >
                Open Dashboard →
              </Link>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* Product Preview - Connected to hero */}
      <section className="px-4 pb-16">
        <motion.div
          className="max-w-3xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={scaleIn}
        >
          <div className="gradient-border-card">
            <div className="bg-[#0A0A0A] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                <span className="text-xs text-gray-600 ml-2">
                  DocMind — Chat with PDF
                </span>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2 bg-[#1A1A1A] rounded-lg p-4 border border-white/5">
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-700/50 rounded w-full" />
                    <div className="h-3 bg-gray-700/50 rounded w-4/5" />
                    <div className="h-3 bg-gray-700/50 rounded w-full" />
                    <div className="h-3 bg-gray-700/50 rounded w-3/5" />
                    <div className="h-3 bg-gray-700/50 rounded w-full mt-4" />
                    <div className="h-3 bg-gray-700/50 rounded w-4/5" />
                  </div>
                </div>
                <div className="w-1/2 flex flex-col gap-3">
                  <div className="bg-[#1A1A1A] rounded-lg p-3 border border-white/5">
                    <p className="text-xs text-[#D4AF37] mb-1">🤖 DocMind AI</p>
                    <p className="text-xs text-gray-400">
                      This document discusses machine learning approaches...
                    </p>
                  </div>
                  <div className="bg-[#D4AF37]/10 rounded-lg p-3 ml-8 border border-[#D4AF37]/20">
                    <p className="text-xs text-gray-300">
                      What are the key methods used?
                    </p>
                  </div>
                  <div className="bg-[#1A1A1A] rounded-lg p-3 border border-white/5">
                    <p className="text-xs text-[#D4AF37] mb-1">🤖 DocMind AI</p>
                    <p className="text-xs text-gray-400">
                      The paper uses Random Forest, SVM, and Neural Networks...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Divider line with glow */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
      </div>

      {/* How It Works */}
      <section className="px-4 py-16">
        <motion.div
          className="max-w-4xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          <motion.p
            variants={fadeInUp}
            className="text-[#D4AF37] text-sm font-medium text-center mb-2"
          >
            HOW IT WORKS
          </motion.p>
          <motion.h3
            variants={fadeInUp}
            className="text-3xl font-bold text-center mb-10"
          >
            Three steps to{" "}
            <span className="gradient-text">instant answers</span>
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                icon: "📄",
                title: "Upload Your PDF",
                desc: "Drag and drop any PDF document. We support research papers, reports, and textbooks.",
              },
              {
                step: "02",
                icon: "🧠",
                title: "AI Reads It",
                desc: "Google Gemini creates intelligent embeddings using a RAG pipeline for deep understanding.",
              },
              {
                step: "03",
                icon: "💬",
                title: "Chat & Ask",
                desc: "Ask questions in natural language. Get accurate, context-aware answers in seconds.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.step}
                variants={i === 0 ? fadeInLeft : i === 2 ? fadeInRight : fadeInUp}
                className="gradient-border-card group"
              >
                <div className="bg-[#0A0A0A] rounded-xl p-6 h-full transition-colors group-hover:bg-[#111111]">
                  <span className="text-xs text-[#D4AF37] font-mono tracking-wider">
                    STEP {feature.step}
                  </span>
                  <div className="text-3xl my-4">{feature.icon}</div>
                  <h4 className="font-semibold text-white mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Gold divider */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
      </div>

      {/* Features */}
      <section className="px-4 py-16">
        <motion.div
          className="max-w-4xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          <motion.p
            variants={fadeInUp}
            className="text-[#D4AF37] text-sm font-medium text-center mb-2"
          >
            FEATURES
          </motion.p>
          <motion.h3
            variants={fadeInUp}
            className="text-3xl font-bold text-center mb-10"
          >
            Built for <span className="gradient-text">serious work</span>
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: "🧠",
                title: "Smart AI Engine",
                desc: "Uses RAG pipeline to find the exact paragraph that answers your question.",
              },
              {
                icon: "⚡",
                title: "Lightning Fast",
                desc: "Powered by Groq Llama 3. Get accurate answers in under 3 seconds.",
              },
              {
                icon: "🔒",
                title: "Secure & Private",
                desc: "Enterprise-grade authentication. Your documents stay private always.",
              },
              {
                icon: "📊",
                title: "Any Document",
                desc: "Research papers, reports, textbooks, contracts — any PDF up to 5MB.",
              },
              {
                icon: "🎯",
                title: "No Hallucinations",
                desc: "Answers based ONLY on your document. No made-up information.",
              },
              {
                icon: "💰",
                title: "100% Free",
                desc: "No credit card required. No hidden fees. Start chatting immediately.",
              },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                className="gradient-border-card group"
              >
                <div className="bg-[#0A0A0A] rounded-xl p-5 h-full transition-colors group-hover:bg-[#111111]">
                  <div className="text-2xl mb-3">{feature.icon}</div>
                  <h4 className="font-semibold text-white mb-1 text-sm">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Gold divider */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
      </div>

      {/* Example Questions */}
      <section className="px-4 py-16">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          <motion.p
            variants={fadeInUp}
            className="text-[#D4AF37] text-sm font-medium mb-2"
          >
            EXAMPLE QUESTIONS
          </motion.p>
          <motion.h3 variants={fadeInUp} className="text-3xl font-bold mb-8">
            Ask anything about your{" "}
            <span className="gradient-text">documents</span>
          </motion.h3>

          <div className="space-y-3">
            {[
              "Summarize this 50-page annual report",
              "What are the key findings of this research?",
              "Explain the methodology in simple terms",
              "What recommendations does the author make?",
              "Compare the results from Chapter 3 and Chapter 5",
            ].map((q, i) => (
              <motion.div
                key={i}
                variants={i % 2 === 0 ? fadeInLeft : fadeInRight}
                className="gradient-border-card group"
              >
                <div className="bg-[#0A0A0A] rounded-xl px-6 py-3.5 flex items-center gap-3 transition-colors group-hover:bg-[#111111]">
                  <span className="text-[#D4AF37] text-sm">💬</span>
                  <span className="text-gray-300 text-sm">
                    &quot;{q}&quot;
                  </span>
                  <span className="ml-auto text-gray-600 text-xs group-hover:text-[#D4AF37] transition-colors">
                    Try it →
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Gold divider */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
      </div>

      {/* Tech Stack */}
      <section className="px-4 py-16">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          <motion.p
            variants={fadeInUp}
            className="text-[#D4AF37] text-sm font-medium mb-2"
          >
            TECH STACK
          </motion.p>
          <motion.h3 variants={fadeInUp} className="text-3xl font-bold mb-3">
            Built with <span className="gradient-text">industry-grade</span>{" "}
            tools
          </motion.h3>
          <motion.p variants={fadeInUp} className="text-gray-500 text-sm mb-8">
            The same technologies used by leading tech companies
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap justify-center gap-3"
          >
            {[
              "Next.js",
              "TypeScript",
              "Tailwind CSS",
              "Supabase",
              "PostgreSQL",
              "pgvector",
              "Google Gemini",
              "Groq Llama 3",
              "Clerk Auth",
              "Framer Motion",
              "Vercel",
            ].map((tech) => (
              <motion.span
                key={tech}
                variants={scaleIn}
                className="px-4 py-2 text-xs font-medium text-gray-300 bg-white/5 border border-[#D4AF37]/20 rounded-full hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors cursor-default"
              >
                {tech}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Gold divider */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
      </div>

      {/* Final CTA */}
      <section className="px-4 py-16">
        <motion.div
          className="max-w-xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h3
            variants={fadeInUp}
            className="text-3xl font-bold mb-4"
          >
            Ready to chat with your{" "}
            <span className="gradient-text">PDFs</span>?
          </motion.h3>
          <motion.p
            variants={fadeInUp}
            className="text-gray-500 text-sm mb-8"
          >
            Upload your first document and get instant answers. No credit card
            required.
          </motion.p>
          <motion.div variants={fadeInUp}>
            {!isSignedIn ? (
              <SignUpButton mode="modal">
                <button className="px-8 py-3 text-black bg-gradient-to-r from-[#D4AF37] to-[#F5D060] rounded-lg font-medium hover:opacity-90 transition-all hover:shadow-lg hover:shadow-[#D4AF37]/20">
                  Get Started Free →
                </button>
              </SignUpButton>
            ) : (
              <Link
                href="/dashboard"
                className="px-8 py-3 text-black bg-gradient-to-r from-[#D4AF37] to-[#F5D060] rounded-lg font-medium hover:opacity-90 transition-all"
              >
                Open Dashboard →
              </Link>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-5">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Built by{" "}
            <a
              href="https://github.com/Basavakiran04"
              target="_blank"
              className="text-[#D4AF37] hover:underline"
            >
              Basavakiran
            </a>
          </p>
          <a
            href="https://github.com/Basavakiran04/docmind"
            target="_blank"
            className="text-sm text-gray-600 hover:text-[#D4AF37] transition-colors"
          >
            GitHub ↗
          </a>
        </div>
      </footer>
    </div>
  );
}