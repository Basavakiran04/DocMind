"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";

// ============================================
// DATA
// ============================================
const typingTexts = [
  "What is the conclusion of this report?",
  "Summarize this research paper for me",
  "What methods are used in this document?",
  "Explain the key findings simply",
  "What are the main recommendations?",
];

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

const steps = [
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
];

const features = [
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
];

const techStack = [
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
];

const exampleQuestions = [
  "Summarize this 50-page annual report",
  "What are the key findings of this research?",
  "Explain the methodology in simple terms",
  "What recommendations does the author make?",
  "Compare the results from Chapter 3 and Chapter 5",
];

// ============================================
// ANIMATION VARIANTS
// ============================================
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
// ============================================
// FADE ANIMATION HOOK
// ============================================
function useFadeAnimation(texts: string[], interval = 3000) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }, interval);
    return () => clearInterval(timer);
  }, [mounted, texts, interval]);

  return { currentText: texts[currentIndex], currentIndex, mounted };
}
// ============================================
// TYPING HOOK
// ============================================
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
  }, [
    displayText,
    isDeleting,
    textIndex,
    mounted,
    texts,
    typingSpeed,
    deleteSpeed,
    pauseTime,
  ]);

  return { displayText, mounted };
}
// ============================================
// ANIMATED PRODUCT PREVIEW
// ============================================
function ProductPreview() {
  const previewMessages = [
    {
      type: "ai",
      text: "This document discusses machine learning approaches for predictive analysis...",
    },
    {
      type: "user",
      text: "What are the key methods used?",
    },
    {
      type: "ai",
      text: "The paper uses 3 primary methods: Random Forest, SVM, and Neural Networks...",
    },
    {
      type: "ai",
      text: "Based on the results, Random Forest achieved the highest accuracy of 94.2%...",
    },
    {
      type: "user",
      text: "Summarize the conclusion",
    },
    {
      type: "ai",
      text: "The authors conclude that ensemble methods outperform single classifiers...",
    },
  ];

  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  const [typingText, setTypingText] = useState("");
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (currentMessageIndex >= previewMessages.length) {
      // Reset after all messages are shown
      const resetTimeout = setTimeout(() => {
        setVisibleMessages([]);
        setCurrentMessageIndex(0);
        setTypingText("");
      }, 3000);
      return () => clearTimeout(resetTimeout);
    }

    const currentMsg = previewMessages[currentMessageIndex];
    setIsTyping(true);
    setTypingText("");

    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (charIndex < currentMsg.text.length) {
        setTypingText(currentMsg.text.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        setVisibleMessages((prev) => [...prev, currentMessageIndex]);
        // Wait before showing next message
        setTimeout(() => {
          setCurrentMessageIndex((prev) => prev + 1);
        }, 1000);
      }
    }, 30);

    return () => clearInterval(typeInterval);
  }, [currentMessageIndex, mounted]);

  return (
    <div className="gradient-border-card">
      <div className="bg-[#0A0A0A] rounded-xl p-6">
        {/* Window Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
          <span className="text-xs text-gray-600 ml-2">
            DocMind — Chat with PDF
          </span>
        </div>

        <div className="flex gap-4">
          {/* Fake PDF Side */}
          <div className="w-1/2 bg-[#1A1A1A] rounded-lg p-4 border border-white/5">
            <div className="space-y-2">
              <div className="h-3 bg-gray-700/50 rounded w-full" />
              <div className="h-3 bg-gray-700/50 rounded w-4/5" />
              <div className="h-3 bg-gray-700/50 rounded w-full" />
              <div className="h-3 bg-gray-700/50 rounded w-3/5" />
              <div className="h-3 bg-gray-700/30 rounded w-full mt-4" />
              <div className="h-3 bg-gray-700/30 rounded w-4/5" />
              <div className="h-3 bg-gray-700/30 rounded w-full" />
              <div className="h-3 bg-gray-700/30 rounded w-2/3" />
            </div>
          </div>

          {/* Animated Chat Side */}
          <div className="w-1/2 flex flex-col gap-2 max-h-[220px] overflow-hidden">
            {/* Already typed messages */}
            {visibleMessages.map((msgIndex) => {
              const msg = previewMessages[msgIndex];
              return (
                <motion.div
                  key={msgIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`rounded-lg p-2.5 ${
                    msg.type === "ai"
                      ? "bg-[#1A1A1A] border border-white/5"
                      : "bg-[#D4AF37]/10 border border-[#D4AF37]/20 ml-6"
                  }`}
                >
                  {msg.type === "ai" && (
                    <p className="text-[10px] text-[#D4AF37] mb-0.5">
                      🤖 DocMind AI
                    </p>
                  )}
                  <p
                    className={`text-[11px] leading-relaxed ${
                      msg.type === "ai" ? "text-gray-400" : "text-gray-300"
                    }`}
                  >
                    {msg.text}
                  </p>
                </motion.div>
              );
            })}

            {/* Currently typing message */}
            {isTyping && currentMessageIndex < previewMessages.length && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-lg p-2.5 ${
                  previewMessages[currentMessageIndex].type === "ai"
                    ? "bg-[#1A1A1A] border border-white/5"
                    : "bg-[#D4AF37]/10 border border-[#D4AF37]/20 ml-6"
                }`}
              >
                {previewMessages[currentMessageIndex].type === "ai" && (
                  <p className="text-[10px] text-[#D4AF37] mb-0.5">
                    🤖 DocMind AI
                  </p>
                )}
                <p
                  className={`text-[11px] leading-relaxed ${
                    previewMessages[currentMessageIndex].type === "ai"
                      ? "text-gray-400"
                      : "text-gray-300"
                  }`}
                >
                  {typingText}
                  <span className="inline-block w-0.5 h-3 bg-[#D4AF37] ml-0.5 animate-blink" />
                </p>
              </motion.div>
            )}

            {/* Empty state before first message */}
            {visibleMessages.length === 0 && !isTyping && (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-gray-600">Starting conversation...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
// ============================================
// GOLD DIVIDER
// ============================================
function GoldDivider() {
  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
    </div>
  );
}

// ============================================
// HOW IT WORKS - V2 INTERACTIVE CARDS
// ============================================
function HowItWorks() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const [progress, setProgress] = useState(0);

  const ROTATE_INTERVAL = 3000;
  const PROGRESS_STEP = 50;

  const startProgress = useCallback(() => {
    setProgress(0);
    if (progressRef.current) clearInterval(progressRef.current);
    let current = 0;
    progressRef.current = setInterval(() => {
      current += (PROGRESS_STEP / ROTATE_INTERVAL) * 100;
      if (current >= 100) current = 0;
      setProgress(current);
    }, PROGRESS_STEP);
  }, []);

  const stopProgress = useCallback(() => {
    if (progressRef.current) clearInterval(progressRef.current);
  }, []);

  const startAutoRotate = useCallback(() => {
    if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    autoRotateRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3);
      setProgress(0);
    }, ROTATE_INTERVAL);
    startProgress();
  }, [startProgress]);

  const stopAutoRotate = useCallback(() => {
    if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    stopProgress();
  }, [stopProgress]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startAutoRotate();
        } else {
          stopAutoRotate();
          setActiveIndex(0);
          setProgress(0);
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      observer.disconnect();
      stopAutoRotate();
    };
  }, [startAutoRotate, stopAutoRotate]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      stopAutoRotate();
      if (e.deltaY > 0 || e.deltaX > 0) {
        setActiveIndex((prev) => Math.min(prev + 1, 2));
      } else {
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      }
      setProgress(0);
      setTimeout(() => startAutoRotate(), 3000);
    },
    [startAutoRotate, stopAutoRotate]
  );

  const handleCardClick = useCallback(
    (index: number) => {
      stopAutoRotate();
      setActiveIndex(index);
      setProgress(0);
      setTimeout(() => startAutoRotate(), 3000);
    },
    [startAutoRotate, stopAutoRotate]
  );

  const getCardAnimation = (index: number) => {
    const isActive = activeIndex === index;
    const isLeft = index < activeIndex;
    return {
      scale: isActive ? 1.06 : 0.88,
      opacity: isActive ? 1 : 0.2,
      y: isActive ? -10 : 4,
      x: isActive ? 0 : isLeft ? -15 : 15,
    };
  };

  return (
    <motion.div
      ref={sectionRef}
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-80px" }}
      transition={{ duration: 0.6 }}
    >
      {/* Section Label */}
      <p className="text-[#D4AF37] text-sm font-medium text-center mb-2">
        HOW IT WORKS
      </p>
      <h3 className="text-3xl font-bold text-center mb-8">
        Three steps to{" "}
        <span className="gradient-text">instant answers</span>
      </h3>

      {/* Progress Dots */}
      <div className="flex justify-center gap-3 mb-6">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            onClick={() => handleCardClick(i)}
            className="relative h-1.5 rounded-full overflow-hidden transition-all duration-300"
            style={{ width: activeIndex === i ? "48px" : "16px" }}
          >
            <div className="absolute inset-0 rounded-full bg-white/10" />
            {activeIndex === i && (
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F5D060]"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.05, ease: "linear" }}
              />
            )}
            {i < activeIndex && (
              <div className="absolute inset-0 rounded-full bg-[#D4AF37]/60" />
            )}
          </button>
        ))}
      </div>

      {/* Step Label */}
      <motion.div
        key={activeIndex}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-8"
      >
        <span className="text-[#D4AF37]/50 text-xs font-mono tracking-[0.3em]">
          STEP {steps[activeIndex].step} OF 03
        </span>
      </motion.div>

      {/* Cards Grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        onWheel={handleWheel}
      >
        {steps.map((feature, i) => {
          const isActive = activeIndex === i;
          return (
            <motion.div
              key={feature.step}
              onClick={() => handleCardClick(i)}
              animate={getCardAnimation(i)}
              whileHover={{ scale: isActive ? 1.08 : 0.92 }}
              transition={{
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className={`relative rounded-2xl cursor-pointer select-none ${
                isActive ? "z-10" : "z-0"
              }`}
            >
              {/* Active Effects */}
              <AnimatePresence>
                {isActive && (
                  <>
                    {/* Outer glow */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute -inset-4 rounded-3xl bg-[#D4AF37]/8 blur-2xl -z-10"
                    />
                    {/* Gold border */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-[#F5D060]/70 via-[#D4AF37]/15 to-[#D4AF37]/70"
                    />
                    {/* Bottom reflection */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className="absolute -bottom-6 left-4 right-4 h-8 bg-[#D4AF37]/10 blur-xl rounded-full -z-10"
                    />
                  </>
                )}
              </AnimatePresence>

              {/* Card Body */}
              <div
                className={`relative rounded-2xl p-6 h-full border transition-all duration-500 ${
                  isActive
                    ? "bg-[linear-gradient(180deg,rgba(212,175,55,0.12),rgba(10,10,10,0.95)_30%,rgba(10,10,10,1))] border-[#D4AF37]/40"
                    : "bg-[#060606] border-white/[0.03]"
                }`}
              >
                {/* Header Row */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-xs font-mono tracking-[0.2em] transition-colors duration-500 ${
                      isActive ? "text-[#D4AF37]" : "text-gray-800"
                    }`}
                  >
                    STEP {feature.step}
                  </span>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                    />
                  )}
                </div>

                {/* Icon */}
                <div
                  className={`text-4xl mb-4 transition-all duration-500 ${
                    isActive
                      ? "opacity-100 scale-100"
                      : "opacity-20 scale-90 grayscale"
                  }`}
                >
                  {feature.icon}
                </div>

                {/* Title */}
                <h4
                  className={`font-semibold text-lg mb-2 transition-colors duration-500 ${
                    isActive ? "text-white" : "text-gray-700"
                  }`}
                >
                  {feature.title}
                </h4>

                {/* Description - only visible on active */}
                <motion.p
                  animate={{
                    opacity: isActive ? 1 : 0,
                    y: isActive ? 0 : 8,
                    height: isActive ? "auto" : 0,
                  }}
                  transition={{ duration: 0.4 }}
                  className="text-sm text-gray-400 leading-relaxed overflow-hidden"
                >
                  {feature.desc}
                </motion.p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ============================================
// MAIN PAGE
// ============================================
export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const { currentText, currentIndex, mounted } = useFadeAnimation(typingTexts, 3000);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">

      {/* ── Navbar ── */}
       <nav className="fixed top-0 left-0 right-0 z-[999] flex justify-between items-center px-6 py-4 border-b border-white/5 bg-black/90 backdrop-blur-md">
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
                <button className="px-4 py-2 text-sm text-black bg-gradient-to-r from-[#D4AF37] to-[#F5D060] rounded-lg hover:opacity-90 font-medium">
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

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-32 pb-16 overflow-hidden">
        {/* Orbs + Particles */}
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
            <div className="h-8 flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="text-lg text-[#D4AF37]/80 font-mono"
                >
                  &quot;{mounted ? currentText : ""}&quot;
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="flex gap-4 justify-center"
          >
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
                Upload PDF →
              </Link>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Product Preview (Animated) ── */}
      <section className="px-4 pb-16">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.8 }}
        >
          <ProductPreview />
        </motion.div>
      </section>

      <GoldDivider />

      {/* ── How It Works V2 ── */}
      <section className="px-4 py-16">
        <HowItWorks />
      </section>

      <GoldDivider />

      {/* ── Features ── */}
      <section className="px-4 py-16">
        <motion.div
          className="max-w-4xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-80px" }}
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
            {features.map((feature) => (
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

      <GoldDivider />

      {/* ── Example Questions ── */}
      <section className="px-4 py-16">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-80px" }}
          variants={staggerContainer}
        >
          <motion.p
            variants={fadeInUp}
            className="text-[#D4AF37] text-sm font-medium mb-2"
          >
            EXAMPLE QUESTIONS
          </motion.p>
          <motion.h3
            variants={fadeInUp}
            className="text-3xl font-bold mb-8"
          >
            Ask anything about your{" "}
            <span className="gradient-text">documents</span>
          </motion.h3>

          <div className="space-y-3">
            {exampleQuestions.map((q, i) => (
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

      <GoldDivider />

      {/* ── Tech Stack ── */}
      <section className="px-4 py-16">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-80px" }}
          variants={staggerContainer}
        >
          <motion.p
            variants={fadeInUp}
            className="text-[#D4AF37] text-sm font-medium mb-2"
          >
            TECH STACK
          </motion.p>
          <motion.h3
            variants={fadeInUp}
            className="text-3xl font-bold mb-3"
          >
            Built with{" "}
            <span className="gradient-text">industry-grade</span> tools
          </motion.h3>
          <motion.p
            variants={fadeInUp}
            className="text-gray-500 text-sm mb-8"
          >
            The same technologies used by leading tech companies
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap justify-center gap-3"
          >
            {techStack.map((tech) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                whileHover={{
                  scale: 1.2,
                  y: -5,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 10,
                  },
                }}
                className="px-4 py-2 text-xs font-medium text-gray-300 bg-white/5 border border-[#D4AF37]/20 rounded-full hover:border-[#D4AF37]/50 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-colors cursor-default"
              >
                {tech}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <GoldDivider />

      {/* ── Final CTA ── */}
      <section className="px-4 py-16">
        <motion.div
          className="max-w-xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
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
                Upload PDF →
              </Link>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
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