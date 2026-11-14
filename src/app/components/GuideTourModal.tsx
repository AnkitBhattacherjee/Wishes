import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Share2,
  Heart,
  Music,
  Check,
} from "lucide-react";

import imgEnvelope from "../../imports/love_envelope.png";
import imgMailbox from "../../imports/love_mailbox.png";
import imgCake from "../../imports/birthday_cake.png";

interface GuideTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction?: (actionId: string) => void;
}

interface TourStep {
  tag: string;
  badgeEmoji: string;
  title: string;
  headingCalligraphy: string;
  description: string;
  featureList: string[];
  imageSrc?: string;
  isIconStep?: boolean;
}

const TOUR_STEPS: TourStep[] = [
  {
    tag: "WELCOME TOUR",
    badgeEmoji: "✨",
    headingCalligraphy: "Your Celebration World",
    title: "A magical space made with love",
    description:
      "Welcome! This interactive space is designed to create an unforgettable celebration experience with music, personal letters, and folk theatre.",
    featureList: [
      "✨ Ambient celebration theme with interactive stickers",
      "🎨 Customizable background scenes & personalized details",
      "💌 Instant sharing that works on any device with zero login",
    ],
  },
  {
    tag: "HEARTFELT LETTER",
    badgeEmoji: "💌",
    headingCalligraphy: "Stationery Letter",
    title: "Pour your heart into words",
    imageSrc: imgEnvelope,
    description:
      "Click the floating Envelope sticker or the 'Write Your Wish' heading to pen your deepest emotions on authentic floral parchment.",
    featureList: [
      "🖋️ Choice of elegant handwriting fonts (Caveat, Dancing Script, etc.)",
      "🌸 Real floral paper stationery styling with live preview",
      "💌 Fully editable at any time with a single click",
    ],
  },
  {
    tag: "PUTUL KHELA & MAILBOX",
    badgeEmoji: "🎭",
    headingCalligraphy: "Folk Puppet Theatre",
    title: "8 Marionettes & Royal Velvet Scrolls",
    imageSrc: imgMailbox,
    description:
      "Click the Love Mailbox to open the traditional Bengali Putul Khela theatre stage. Pull the marionette strings to unlock secrets!",
    featureList: [
      "📜 Royal Red Velvet & Gold Scroll popups with gold calligraphy",
      "🎵 In-app dedicated songs from YouTube or Suno AI (zero redirect!)",
      "🎙️ Personal voice notes whispered by the Moonbeam Boy puppet",
      "📸 Starlit photo moments & secret dream wishes",
    ],
  },
  {
    tag: "CELEBRATION ROOM",
    badgeEmoji: "🎂",
    headingCalligraphy: "Party & Cake Cutting",
    title: "Blow candles & play background songs",
    imageSrc: imgCake,
    description:
      "Click the Birthday Cake to step inside the 3D celebration room where you can customize cakes and blow candles with interactive effects.",
    featureList: [
      "🎂 Choose from artisanal cake designs (Butterflies, Floral, Chocolate)",
      "🕯️ Tap to make a wish and blow out the sparkling candles",
      "🎶 Plays your custom Suno AI song or celebration waltz in the room",
    ],
  },
  {
    tag: "SEAMLESS SHARING",
    badgeEmoji: "🚀",
    headingCalligraphy: "Share Everywhere",
    title: "Send your surprise with 1 click",
    isIconStep: true,
    description:
      "Click the 'Share' button at the top right to copy your unique gift link. Send it over WhatsApp, Telegram, or Instagram!",
    featureList: [
      "📱 Works directly on mobile browsers with zero sign-in required",
      "☁️ 2-Day automatic backup & auto-cleanup via Supabase",
      "⚡ Self-contained fallback ensures the gift never breaks",
    ],
  },
];

export function GuideTourModal({ isOpen, onClose, onAction }: GuideTourModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Keyboard navigation: Left/Right arrows to flip, Esc to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") {
        setCurrentStep((s) => Math.min(s + 1, TOUR_STEPS.length - 1));
      }
      if (e.key === "ArrowLeft") {
        setCurrentStep((s) => Math.max(s - 1, 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) setCurrentStep((s) => s - 1);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        {/* Ambient Darkened Backdrop with soft romantic blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/45 backdrop-blur-md transition-opacity"
        />

        {/* Glassmorphic Guide Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          className="relative w-full max-w-[520px] rounded-[28px] overflow-hidden border border-white/80 bg-white/85 backdrop-blur-2xl shadow-[0_24px_70px_rgba(196,88,122,0.25),0_0_0_1px_rgba(255,255,255,0.7)] z-10 flex flex-col"
        >
          {/* Top Decorative Header Strip */}
          <div className="h-1.5 w-full bg-gradient-to-r from-pink-400 via-rose-500 to-amber-300" />

          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 pt-5 pb-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center size-6 rounded-full bg-pink-100 text-pink-700 text-xs">
                {step.badgeEmoji}
              </span>
              <span className="font-['DM_Mono',monospace] text-[10px] font-bold tracking-widest uppercase text-pink-800/80">
                {step.tag} · STEP {currentStep + 1} OF {TOUR_STEPS.length}
              </span>
            </div>

            <button
              onClick={onClose}
              className="size-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-black/5 transition-colors cursor-pointer"
              title="Close Guide (Esc)"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body Content with smooth slide transitions */}
          <div className="px-6 py-3 flex-1 flex flex-col min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="flex flex-col flex-1"
              >
                {/* Visual Banner / Illustration */}
                <div className="flex items-center justify-center py-2 h-24">
                  {step.imageSrc ? (
                    <motion.img
                      animate={{ y: [-3, 3, -3], rotate: [-2, 2, -2] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                      src={step.imageSrc}
                      alt={step.title}
                      className="max-h-20 max-w-24 object-contain drop-shadow-lg select-none"
                    />
                  ) : step.isIconStep ? (
                    <motion.div
                      animate={{ scale: [0.95, 1.05, 0.95] }}
                      transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                      className="size-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-[0_10px_25px_rgba(244,114,182,0.4)]"
                    >
                      <Share2 size={28} />
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                      className="size-16 rounded-full bg-gradient-to-tr from-amber-200 via-pink-200 to-rose-300 flex items-center justify-center shadow-md"
                    >
                      <Sparkles size={28} className="text-pink-700" />
                    </motion.div>
                  )}
                </div>

                {/* Calligraphy Sub-heading */}
                <p className="font-['Alex_Brush',cursive] text-[34px] sm:text-[38px] text-[#42202b] text-center leading-none mt-1 select-none">
                  {step.headingCalligraphy}
                </p>

                {/* Main Step Title */}
                <h3 className="font-['Playfair_Display',serif] text-base sm:text-lg font-bold text-[#2d1b22] text-center mt-1">
                  {step.title}
                </h3>

                {/* Paragraph Description */}
                <p className="font-['Poppins',sans-serif] text-[12px] text-[#634a54] text-center mt-2 leading-relaxed px-2">
                  {step.description}
                </p>

                {/* Feature Bullet Points */}
                <div className="mt-3.5 space-y-1.5 px-3 py-2.5 rounded-xl bg-pink-50/60 border border-pink-100">
                  {step.featureList.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] font-['Poppins',sans-serif] text-[#553641]">
                      <span className="text-pink-500 font-bold shrink-0 mt-0.5">•</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Controls */}
          <div className="px-6 py-4 bg-white/50 border-t border-pink-100/60 flex items-center justify-between">
            {/* Skip Tour Button */}
            <button
              onClick={onClose}
              className="text-[12px] font-['Poppins',sans-serif] font-medium text-pink-700/70 hover:text-pink-900 hover:underline cursor-pointer transition-colors"
            >
              Skip Tour
            </button>

            {/* Pagination Dots */}
            <div className="flex items-center gap-1.5">
              {TOUR_STEPS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`size-2 rounded-full transition-all cursor-pointer ${
                    idx === currentStep
                      ? "w-6 bg-pink-600 shadow-[0_0_8px_rgba(219,39,119,0.5)]"
                      : "bg-pink-200 hover:bg-pink-300"
                  }`}
                  aria-label={`Jump to step ${idx + 1}`}
                />
              ))}
            </div>

            {/* Action Buttons: Prev & Next */}
            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  onClick={handlePrev}
                  className="px-3 py-1.5 rounded-full border border-pink-200 bg-white hover:bg-pink-50 text-pink-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={13} />
                  <span>Back</span>
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-semibold flex items-center gap-1 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>{isLast ? "Explore Now ✨" : "Next"}</span>
                {!isLast && <ChevronRight size={13} />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

