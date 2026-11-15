import { ImageWithFallback } from "./figma/ImageWithFallback";
import JournalOverlay from "./JournalOverlay";
import { MailboxModal } from "./MailboxModal";
import { GuideTourModal } from "./GuideTourModal";
import { ShareModal } from "./ShareModal";
import { useDynamicLetterFont, type LetterFontStyle } from "./useDynamicLetterFont";
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Check, Share2, Sparkles, Heart, Eye, Edit3, X, Feather, Image as ImageIcon, ExternalLink, RotateCcw, ChevronDown, Trash2 } from "lucide-react";
import {
  createShareLink,
  loadCloudGiftProject,
  loadGiftProject,
  persistGiftProject,
  saveGiftProject,
  isSupabaseConfigured,
  type GiftProject,
  type CloudStatus,
} from "../giftStore";
import { preloadProjectAudios } from "../utils/audioPreloader";
import svgPaths from "../../imports/svg-mflmjqo28j";
import imgImage10 from "figma:asset/22caa5ad402836f5fe397bca16006c6983d5252d.png";
import imgLetterPaper from "../../imports/letter_paper.png";
import imgCake1 from "../../imports/cake1.png";
import imgCake2 from "../../imports/cake2.png";
import imgCake3 from "../../imports/cake3.png";
import imgCake4 from "../../imports/cake4.png";
import imgPinkDiary from "../../imports/Desktop3-1/53d3640202fee41fc49435adadaf40ec5c1b091b.png";
import imgLoveMailbox from "../../imports/love_mailbox.png";
import imgLoveEnvelope from "../../imports/love_envelope.png";

const cakeImageMap: Record<string, string> = {
  cake1: imgCake1,
  cake2: imgCake2,
  cake3: imgCake3,
  cake4: imgCake4,
  pink: imgCake1,
  butterfly: imgCake2,
  chocolate: imgCake3,
  decorated: imgCake4,
};

/* ── Curated Scenery Background Presets ── */
export interface BackgroundPreset {
  id: string;
  name: string;
  subtitle: string;
  src: string;
  thumbnail: string;
}

export const PRESET_BACKGROUNDS: BackgroundPreset[] = [
  {
    id: "default-stationery",
    name: "Vintage Letter Parchment",
    subtitle: "Original hand-painted aesthetic",
    src: imgImage10,
    thumbnail: imgImage10,
  },
  {
    id: "rose-petals",
    name: "Soft Rose Petals",
    subtitle: "Romantic pastel blooms",
    src: "https://images.unsplash.com/photo-1578972497170-bfc780c65f65?auto=format&fit=crop&w=1920&q=80",
    thumbnail: "https://images.unsplash.com/photo-1578972497170-bfc780c65f65?auto=format&fit=crop&w=260&q=70",
  },
  {
    id: "warm-bokeh",
    name: "Golden Fairy Bokeh",
    subtitle: "Warm magical twilight glow",
    src: "https://images.unsplash.com/photo-1770740830168-eedfa0126ad8?auto=format&fit=crop&w=1920&q=80",
    thumbnail: "https://images.unsplash.com/photo-1770740830168-eedfa0126ad8?auto=format&fit=crop&w=260&q=70",
  },
  {
    id: "dreamy-clouds",
    name: "Cotton Candy Sunset",
    subtitle: "Dreamy pastel sky & clouds",
    src: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1920&q=80",
    thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=260&q=70",
  },
  {
    id: "pastel-celebration",
    name: "Festive Confetti",
    subtitle: "Joyful celebration confetti",
    src: "https://images.unsplash.com/photo-1769443398678-411926888200?auto=format&fit=crop&w=1920&q=80",
    thumbnail: "https://images.unsplash.com/photo-1769443398678-411926888200?auto=format&fit=crop&w=260&q=70",
  },
  {
    id: "floral-watercolor",
    name: "Blossom Watercolor",
    subtitle: "Botanical painterly canvas",
    src: "https://images.unsplash.com/photo-1770977883066-4dbee15c84d2?auto=format&fit=crop&w=1920&q=80",
    thumbnail: "https://images.unsplash.com/photo-1770977883066-4dbee15c84d2?auto=format&fit=crop&w=260&q=70",
  },
  {
    id: "vintage-rose",
    name: "Vintage Garden Roses",
    subtitle: "Nostalgic antique pink florals",
    src: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80",
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=260&q=70",
  },
  {
    id: "starry-night",
    name: "Starlit Midnight",
    subtitle: "Deep celestial stars & wonder",
    src: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80",
    thumbnail: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=260&q=70",
  },
];

function formatUnsplashUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";

  const photoPageMatch = trimmed.match(/unsplash\.com\/photos\/(?:[\w-]+-)?([a-zA-Z0-9_-]{5,})/);
  if (photoPageMatch && photoPageMatch[1]) {
    const photoId = photoPageMatch[1];
    return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1920&q=80`;
  }

  if (trimmed.includes("images.unsplash.com")) {
    try {
      const urlObj = new URL(trimmed);
      urlObj.searchParams.set("auto", "format");
      urlObj.searchParams.set("fit", "crop");
      if (!urlObj.searchParams.has("w") || Number(urlObj.searchParams.get("w")) < 1200) {
        urlObj.searchParams.set("w", "1920");
      }
      if (!urlObj.searchParams.has("q")) {
        urlObj.searchParams.set("q", "80");
      }
      return urlObj.toString();
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

/* ── The 4 Main Interactive Components on WishPage (Identical Uniform Dimensions) ── */
const STICKER_SIZE = 300;

const stickers = [
  {
    id: "birthday-cake",
    src: imgCake1,
    alt: "Happy Birthday Cake",
    label: "🎂 Celebration Room & Cake",
    width: STICKER_SIZE,
    height: STICKER_SIZE,
    top: "14%",
    left: "11%",
    rotate: -12,
    imgStyle: "w-full h-full object-contain drop-shadow-xl select-none pointer-events-none",
    navigable: true,
  },
  {
    id: "pink-diary",
    src: imgPinkDiary,
    alt: "Pink Scrapbook Diary",
    label: "📖 Memory Scrapbook",
    width: STICKER_SIZE,
    height: STICKER_SIZE,
    top: "13%",
    right: "11%",
    rotate: 14,
    imgStyle: "w-full h-full object-contain drop-shadow-xl select-none pointer-events-none",
  },
  {
    id: "envelope",
    src: imgLoveEnvelope,
    alt: "Heartfelt Love Letter",
    label: "💌 Heartfelt Wish Letter",
    width: STICKER_SIZE,
    height: STICKER_SIZE,
    top: "53%",
    left: "11%",
    rotate: -10,
    imgStyle: "w-full h-full object-contain drop-shadow-xl select-none pointer-events-none",
  },
  {
    id: "mailbox",
    src: imgLoveMailbox,
    alt: "Love Mailbox",
    label: "📮 Love Mailbox & Notes",
    width: STICKER_SIZE,
    height: STICKER_SIZE,
    top: "53%",
    right: "11%",
    rotate: 8,
    imgStyle: "w-full h-full object-contain drop-shadow-xl select-none pointer-events-none",
  },
];

/* ── Refresh icon SVG ── */
function RefreshIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 36 36" fill="none">
      <path d={svgPaths.p989ca40} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d={svgPaths.p20483880} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d={svgPaths.p3d567300} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d={svgPaths.p14b99780} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

/* ── Interactive Sticker with hover rotation and tooltip ── */
function InteractiveSticker({
  sticker,
  onClick,
  isReceiver,
}: {
  sticker: (typeof stickers)[0];
  onClick?: () => void;
  isReceiver?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const posStyle: React.CSSProperties = {
    position: "absolute",
    top: sticker.top,
    left: "left" in sticker ? (sticker as any).left : undefined,
    right: "right" in sticker ? (sticker as any).right : undefined,
  };

  return (
    <motion.div
      style={posStyle}
      className="cursor-pointer group select-none z-20 pointer-events-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{
        rotate: isHovered ? sticker.rotate + 3 : sticker.rotate,
        scale: isHovered ? 1.07 : 1,
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
      onClick={onClick}
    >
      {/* Floating Action Badge on Hover */}
      <div className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-pink-600 shadow-lg whitespace-nowrap pointer-events-none border border-pink-200 z-30">
        {sticker.label}
      </div>

      {/* Receiver Subtle Bottom Label Pill */}
      {isReceiver && (
        <motion.div
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-2 sm:-bottom-3 left-1/2 -translate-x-1/2 opacity-85 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-pink-700 shadow-sm border border-pink-200/70 whitespace-nowrap pointer-events-none z-20 flex items-center gap-1"
        >
          <Sparkles size={11} className="text-pink-500" />
          <span>{sticker.label}</span>
        </motion.div>
      )}

      <div
        className="w-[230px] h-[230px] sm:w-[260px] sm:h-[260px] md:w-[280px] md:h-[280px] lg:w-[300px] lg:h-[300px] xl:w-[320px] xl:h-[320px] relative flex items-center justify-center pointer-events-none"
      >
        <img alt={sticker.alt} className={sticker.imgStyle} src={sticker.src} draggable={false} />
      </div>
    </motion.div>
  );
}

/* ── Front Card Greeting Wish Modal (Single-line / Short Quote) ── */
function FrontWishModal({
  isOpen,
  onClose,
  onSave,
  onOpenLetter,
  name,
  initialMessage,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (message: string) => void;
  onOpenLetter: () => void;
  name: string;
  initialMessage: string;
}) {
  const [message, setMessage] = useState(initialMessage);

  useEffect(() => {
    if (isOpen) {
      setMessage(initialMessage);
    }
  }, [isOpen, initialMessage]);

  const QUICK_SUGGESTIONS = [
    `Wishing you a day as radiant, magical, and wonderful as your smile! ✨`,
    `Happy Birthday ${name}! May all your sweetest dreams come true today and always! 🎂💖`,
    `Here's to celebrating the most special person in my universe! 🥂🌟`,
    `May this year bring you boundless happiness, gentle warmth, and endless laughter! 🌸`,
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

          <motion.div
            className="relative z-10 w-full max-w-[500px] rounded-3xl bg-white/95 backdrop-blur-xl border border-pink-100 shadow-[0_25px_70px_rgba(196,88,122,0.25)] p-6 sm:p-7 overflow-hidden text-[#3d2730]"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 320 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-pink-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="font-['Playfair_Display',serif] font-bold text-lg text-[#2e1820]">
                    Front Card Wish
                  </h3>
                  <p className="font-['Poppins',sans-serif] text-[11px] text-[#785460]">
                    A sweet 1–2 line quote or tagline shown on the main card
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Input Form */}
            <div className="mt-4">
              <label className="block font-['Poppins',sans-serif] text-xs font-semibold text-[#5a3a44] mb-1.5">
                Greeting Message (1–2 lines)
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a sweet single line wish, birthday quote, or tagline..."
                className="w-full px-3.5 py-2.5 text-sm sm:text-base font-['Caveat',cursive] rounded-2xl border border-pink-200 bg-pink-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all text-[#2d1b22] placeholder:text-gray-400 placeholder:font-['Poppins',sans-serif] placeholder:text-xs resize-none"
              />
              <p className="mt-1 text-[10px] text-gray-400 font-['Poppins',sans-serif] text-right">
                Keep it short & sweet for the front card
              </p>

              {/* Quick Inspiration suggestions */}
              <div className="mt-3">
                <span className="block font-['Poppins',sans-serif] text-[10px] uppercase font-bold tracking-wider text-[#8c6b77] mb-1.5">
                  Or pick a sweet line:
                </span>
                <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {QUICK_SUGGESTIONS.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMessage(sug)}
                      className="text-left text-xs font-['Caveat',cursive] text-lg text-[#5a3a44] hover:text-pink-700 p-2 rounded-xl bg-pink-50/50 hover:bg-pink-100/70 border border-pink-100/80 transition-colors cursor-pointer truncate"
                      title={sug}
                    >
                      "{sug}"
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3.5 border-t border-pink-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLetter();
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-pink-700 hover:text-pink-900 transition-colors cursor-pointer hover:underline"
              >
                <Feather size={13} />
                <span>Open Full Letter Paper 💌</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => onSave(message)}
                  className="px-5 py-2 text-xs font-bold rounded-full bg-gradient-to-r from-pink-500 to-[#c4587a] text-white shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer"
                >
                  Save Wish ✨
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Real Wish Letter on Floral Parchment Paper ── */
function WishModal({
  isOpen,
  onClose,
  onSave,
  name,
  relationship,
  initialWish,
  initialFontStyle,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (wish: string, fontStyle?: "caveat" | "dancing" | "playfair") => void;
  name: string;
  relationship?: string;
  initialWish: string;
  initialFontStyle?: "caveat" | "dancing" | "playfair";
}) {
  const [wish, setWish] = useState(initialWish);
  const [fontStyle, setFontStyle] = useState<LetterFontStyle>(
    (initialFontStyle as LetterFontStyle) || "caveat"
  );
  const [isPreview, setIsPreview] = useState(false);
  const writingAreaRef = useRef<HTMLDivElement>(null);
  const dynamicFont = useDynamicLetterFont(wish, fontStyle, writingAreaRef);

  useEffect(() => {
    if (isOpen) {
      setWish(initialWish);
      setFontStyle((initialFontStyle as LetterFontStyle) || "caveat");
      setIsPreview(false);
    }
  }, [isOpen, initialWish, initialFontStyle]);

  const wordCount = wish.trim() ? wish.trim().split(/\s+/).length : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

          {/* Letter Container - Proportioned to match 768x1024 paper */}
          <motion.div
            className="relative z-10 w-full max-h-[88vh] flex flex-col rounded-2xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.5),0_0_50px_rgba(244,114,182,0.25)] select-none border border-amber-200/40"
            style={{
              aspectRatio: "768/1024",
              maxWidth: "min(560px, calc(88vh * 768 / 1024))",
            }}
            initial={{ scale: 0.88, y: 35, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.88, y: 35, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
          >
            {/* Real Letter Paper Background */}
            <img
              src={imgLetterPaper}
              alt="Stationery letter paper"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            />

            {/* Top Toolbar Overlay */}
            <div className="relative z-20 flex items-center justify-between px-6 sm:px-8 pt-4 pb-1">
              {/* Pen Style Picker */}
              <div className="flex items-center gap-1 bg-white/75 backdrop-blur-md px-2 py-1 rounded-full border border-pink-200/60 shadow-xs">
                <Feather size={12} className="text-pink-600 ml-1 mr-0.5" />
                <button
                  type="button"
                  onClick={() => setFontStyle("caveat")}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                    fontStyle === "caveat"
                      ? "bg-pink-500 text-white shadow-xs"
                      : "text-[#5a3a44] hover:text-pink-600"
                  }`}
                >
                  Handwritten
                </button>
                <button
                  type="button"
                  onClick={() => setFontStyle("dancing")}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                    fontStyle === "dancing"
                      ? "bg-pink-500 text-white shadow-xs"
                      : "text-[#5a3a44] hover:text-pink-600"
                  }`}
                >
                  Cursive
                </button>
                <button
                  type="button"
                  onClick={() => setFontStyle("playfair")}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                    fontStyle === "playfair"
                      ? "bg-pink-500 text-white shadow-xs"
                      : "text-[#5a3a44] hover:text-pink-600"
                  }`}
                >
                  Vintage
                </button>
              </div>

              {/* Mode & Close buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsPreview((p) => !p)}
                  className="flex items-center gap-1 bg-white/75 hover:bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#5a3a44] border border-pink-200/60 shadow-xs cursor-pointer transition-colors"
                  title={isPreview ? "Switch to Edit" : "Preview how it reads"}
                >
                  {isPreview ? <Edit3 size={12} /> : <Eye size={12} />}
                  <span>{isPreview ? "Edit" : "Read"}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-7 h-7 rounded-full bg-white/75 hover:bg-white/95 backdrop-blur-md text-[#5a3a44] hover:text-black flex items-center justify-center border border-pink-200/60 shadow-xs cursor-pointer transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Letter Content Writing Area (Inside the gold border) */}
            <div className="relative z-10 flex-1 flex flex-col px-8 sm:px-12 pt-4 pb-7 overflow-hidden">
              {/* Salutation - indented to clear top-left lily */}
              <div className="mb-2 pl-6 sm:pl-10">
                <p className="font-['Alex_Brush',cursive] text-[34px] sm:text-[40px] text-[#2e1820] leading-tight select-none">
                  My Dearest {name},
                </p>
              </div>

              {/* Textarea or Preview (Auto-scaling font size for one-page fit) */}
              <div ref={writingAreaRef} className="flex-1 overflow-hidden flex flex-col relative">
                {!isPreview ? (
                  <textarea
                    value={wish}
                    onChange={(e) => setWish(e.target.value)}
                    placeholder="Write your heartfelt wish or letter here... Pour your love, memories, and birthday hopes into words (short note or long letter)."
                    style={{
                      fontSize: `${dynamicFont.fontSize}px`,
                      lineHeight: dynamicFont.lineHeight,
                      fontFamily: dynamicFont.fontFamily,
                      fontStyle: dynamicFont.isItalic ? "italic" : "normal",
                      caretColor: "#c4587a",
                    }}
                    className="w-full h-full bg-transparent resize-none outline-none border-none p-1 text-[#2d1b22] placeholder-[#a67c87] letter-scroll select-text"
                    autoFocus
                  />
                ) : (
                  <div
                    style={{
                      fontSize: `${dynamicFont.fontSize}px`,
                      lineHeight: dynamicFont.lineHeight,
                      fontFamily: dynamicFont.fontFamily,
                      fontStyle: dynamicFont.isItalic ? "italic" : "normal",
                    }}
                    className="w-full h-full overflow-y-auto letter-scroll p-1 text-[#2d1b22] whitespace-pre-wrap select-text"
                  >
                    {wish.trim() || "(Your letter is currently empty. Switch to Edit to write your heartfelt words.)"}
                  </div>
                )}
              </div>

              {/* Sign-off & Romantic Wax Seal */}
              <div className="pt-2 flex items-end justify-between select-none border-t border-[#dfc2c8]/40 mt-1">
                <div>
                  <p className="font-['Alex_Brush',cursive] text-[24px] sm:text-[28px] text-[#2e1820] leading-none">
                    Yours always,
                  </p>
                  <p className="font-['Poppins',sans-serif] text-[10px] sm:text-[11px] font-bold text-pink-700/90 tracking-wider mt-1 uppercase">
                    Prepared with heartfelt love for you
                  </p>
                </div>

                {/* Wax seal emblem */}
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#9e2a4b] to-[#d6456f] text-white flex items-center justify-center shadow-[0_3px_12px_rgba(158,42,75,0.4)] border border-rose-200/50">
                    <Heart size={16} className="fill-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action Footer Bar */}
            <div className="relative z-20 px-6 sm:px-8 py-3 bg-white/75 backdrop-blur-md border-t border-pink-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#785460] font-['Poppins',sans-serif]">
                  {wordCount} {wordCount === 1 ? "word" : "words"} · {wish.length} chars
                </span>
                {dynamicFont.isScaledDown && !dynamicFont.isMinLimit && (
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-pink-100/90 text-pink-700 text-[10px] font-bold border border-pink-200">
                    Auto-fit 1 page ({dynamicFont.scalePercent}%)
                  </span>
                )}
                {dynamicFont.isMinLimit && (
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100/90 text-amber-800 text-[10px] font-bold border border-amber-200">
                    1 page full · scroll enabled
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-full font-['Poppins',sans-serif] text-xs font-semibold text-[#785460] hover:bg-white/80 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    if (wish.trim()) {
                      onSave(wish, fontStyle);
                    } else {
                      onClose();
                    }
                  }}
                  className="px-6 py-2 rounded-full font-['Poppins',sans-serif] text-xs font-bold text-white shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                  style={{ background: "linear-gradient(135deg, #e8849c 0%, #c4587a 100%)" }}
                >
                  <Check size={14} strokeWidth={3} />
                  <span>Fold & Save Letter 💌</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Main Wish Page ── */
export default function WishPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state as { name?: string; occasion?: string; relationship?: string } | null;
  const [project, setProject] = useState<GiftProject>(() => {
    const loaded = loadGiftProject();
    const next = {
      ...loaded,
      recipient: routeState?.name || loaded.recipient,
      occasion: routeState?.occasion || loaded.occasion,
      relationship: routeState?.relationship || loaded.relationship,
    };
    return saveGiftProject(next);
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isMailboxOpen, setIsMailboxOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");
  const [cloudStatus, setCloudStatus] = useState<"loading" | "saved" | "error">("saved");
  const [hasSaved, setHasSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isFrontWishModalOpen, setIsFrontWishModalOpen] = useState(false);
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [headerInput, setHeaderInput] = useState(project.headerTitle || "");
  const [isBadgeDismissed, setIsBadgeDismissed] = useState(false);
  const headerInputRef = useRef<HTMLInputElement>(null);

  // Check if viewing via the receiver's link (gift token present without edit token, or sealed project)
  const searchParams = new URLSearchParams(location.search);
  const hashSearch =
    typeof window !== "undefined" && window.location.hash.includes("?")
      ? new URLSearchParams(window.location.hash.substring(window.location.hash.indexOf("?")))
      : null;
  const giftParam = searchParams.get("gift") || hashSearch?.get("gift");
  const editParam = searchParams.get("edit") || hashSearch?.get("edit");
  const viewParam = searchParams.get("view") || hashSearch?.get("view");
  const isReceiver = Boolean(
    (giftParam && !editParam) ||
      viewParam === "receiver" ||
      (!editParam && project.isSealed && !project.editToken)
  );

  useEffect(() => {
    if (project.headerTitle !== undefined) {
      setHeaderInput(project.headerTitle);
    }
  }, [project.headerTitle]);

  const handleSaveHeader = () => {
    setIsEditingHeader(false);
    updateProject({ headerTitle: headerInput.trim() });
  };
  const { recipient: name, occasion, relationship, backgroundIndex: bgIndex, wish: savedWish } = project;
  const frontWish = project.frontMessage?.trim() || "";
  const defaultFrontWish = `Wishing you a day as magical, bright, and wonderful as your smile! ✨`;
  const cleanFrontWish = (text: string) => {
    if (!text) return "";
    let cleaned = text.trim();
    if (
      (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith('“') && cleaned.endsWith('”'))
    ) {
      cleaned = cleaned.slice(1, -1).trim();
    }
    // Clean raw markdown asterisks if any were typed or pasted
    return cleaned.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1");
  };
  const displayFrontWish = cleanFrontWish(frontWish) || defaultFrontWish;

  const handleSaveFrontWish = (newFrontWish: string) => {
    updateProject({ frontMessage: newFrontWish.trim() });
    setIsFrontWishModalOpen(false);
  };

  // Automatically show user guide tour on first visit
  useEffect(() => {
    try {
      const storageKey = isReceiver ? "wish_receiver_guide_seen" : "wish_guide_dismissed";
      const dismissed = localStorage.getItem(storageKey);
      if (!dismissed) {
        const timer = setTimeout(() => setIsGuideOpen(true), 650);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, [isReceiver]);

  const handleCloseGuide = () => {
    setIsGuideOpen(false);
    try {
      const storageKey = isReceiver ? "wish_receiver_guide_seen" : "wish_guide_dismissed";
      localStorage.setItem(storageKey, "true");
    } catch {}
  };

  useEffect(() => {
    const handleCloudStatus = (event: Event) => {
      const status = (event as CustomEvent<CloudStatus>).detail;
      setCloudStatus(status === "syncing" ? "loading" : status === "saved" ? "saved" : "error");
    };
    window.addEventListener("wish-cloud-status", handleCloudStatus);
    return () => window.removeEventListener("wish-cloud-status", handleCloudStatus);
  }, []);

  useEffect(() => {
    const targetId =
      giftParam ||
      (project.projectId && /^[0-9a-f-]{30,40}$/i.test(project.projectId) ? project.projectId : null);
    if (!targetId || !isSupabaseConfigured()) return;
    setCloudStatus("loading");
    loadCloudGiftProject(targetId)
      .then((loaded) => {
        setProject(loaded);
        setCloudStatus("saved");
        preloadProjectAudios(loaded);
      })
      .catch(() => setCloudStatus("error"));
  }, [giftParam, project.projectId]);

  // Automatically start background retrieval/prefetching for all gift audio files
  // (Celebration room custom song, mailbox songs & voice memos) as soon as the sealed link is opened
  useEffect(() => {
    if (project) {
      preloadProjectAudios(project);
    }
  }, [project.customSongUrl, project.mailboxItems]);

  const projectRef = useRef(project);
  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  const updateProject = useCallback((changes: Partial<GiftProject>) => {
    setProject((current) => {
      const next = saveGiftProject({ ...current, ...changes });
      projectRef.current = next;
      return next;
    });
    setHasChanges(true);
  }, []);

  const saveChanges = async () => {
    setCloudStatus("loading");
    try {
      const toSave = projectRef.current || project;
      await persistGiftProject(toSave);
      setHasSaved(true);
      setHasChanges(false);
      setCloudStatus("saved");
      return true;
    } catch {
      setCloudStatus("error");
      return false;
    }
  };

  const [isBgDropdownOpen, setIsBgDropdownOpen] = useState(false);
  const [unsplashInput, setUnsplashInput] = useState("");
  const [unsplashError, setUnsplashError] = useState<string | null>(null);
  const bgDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    if (!isBgDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (bgDropdownRef.current && !bgDropdownRef.current.contains(e.target as Node)) {
        setIsBgDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isBgDropdownOpen]);

  const activeCustomBg = project.customBgUrl?.trim() || null;
  const activePresetBg = PRESET_BACKGROUNDS[bgIndex]?.src || PRESET_BACKGROUNDS[0].src;
  const activeBg = activeCustomBg || activePresetBg;
  const isUsingCustom = Boolean(activeCustomBg);

  const handleApplyCustomUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const formatted = formatUnsplashUrl(unsplashInput);
    if (!formatted) {
      setUnsplashError("Please paste an image or Unsplash link");
      return;
    }
    if (!formatted.startsWith("http://") && !formatted.startsWith("https://")) {
      setUnsplashError("Link must start with https://");
      return;
    }
    setUnsplashError(null);
    updateProject({ customBgUrl: formatted });
    setUnsplashInput("");
  };

  const handleSelectPreset = (index: number) => {
    updateProject({ customBgUrl: null, backgroundIndex: index });
  };

  const handleResetToDefault = () => {
    updateProject({ customBgUrl: null, backgroundIndex: 0 });
    setUnsplashInput("");
    setUnsplashError(null);
  };

  const handleSaveWish = (wish: string, fontStyle?: "caveat" | "dancing" | "playfair") => {
    updateProject({ wish, letterFont: fontStyle || project.letterFont || "caveat" });
    setIsModalOpen(false);
  };

  const shareGift = async () => {
    try {
      setCloudStatus("loading");
      await persistGiftProject(project).catch(() => {});
      setCloudStatus("saved");
      const url = createShareLink(project);
      if (navigator.share) {
        try {
          await navigator.share({ title: `A wish for ${name}`, text: `A little world was made for you, ${name}.`, url });
          setShareStatus("copied");
          window.setTimeout(() => setShareStatus("idle"), 1800);
        } catch {
          await navigator.clipboard.writeText(url).catch(() => {});
          setShareStatus("copied");
          window.setTimeout(() => setShareStatus("idle"), 1800);
        }
      } else {
        await navigator.clipboard.writeText(url);
        setShareStatus("copied");
        window.setTimeout(() => setShareStatus("idle"), 1800);
      }
    } catch {
      try {
        const url = createShareLink(project);
        await navigator.clipboard.writeText(url);
        setShareStatus("copied");
        window.setTimeout(() => setShareStatus("idle"), 1800);
      } catch {
        setCloudStatus("error");
      }
    }
  };

  const handleStickerClick = (stickerId: string) => {
    if (stickerId === "birthday-cake") {
      const search = giftParam ? `?gift=${giftParam}&view=receiver` : location.search;
      navigate(`/room${search}`, {
        state: {
          name,
          occasion,
          relationship,
          wish: savedWish,
          letterFont: project.letterFont || "caveat",
        },
      });
    } else if (stickerId === "pink-diary") {
      setIsJournalOpen(true);
    } else if (stickerId === "mailbox") {
      setIsMailboxOpen(true);
    } else if (stickerId === "envelope") {
      setIsModalOpen(true);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#f5ede8]">
      {/* Background with crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeBg}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {activeBg === imgImage10 ? (
            <img
              alt="Background"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              src={activeBg}
            />
          ) : (
            <ImageWithFallback
              alt="Background"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              src={activeBg}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Soft overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(245,237,232,0.3) 100%)",
        }}
      />

      {/* Change BG button & popover dropdown - SENDER ONLY */}
      {!isReceiver && (
        <div className="absolute top-[28px] left-[28px] z-40" ref={bgDropdownRef}>
          <motion.button
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full cursor-pointer border border-white/60 transition-all hover:bg-white/90 shadow-md backdrop-blur-md"
            style={{
              background: isBgDropdownOpen ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.72)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.5)",
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsBgDropdownOpen((prev) => !prev)}
          >
            <motion.div
              animate={{ rotate: isBgDropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.25 }}
              className="text-[#6b5e58]"
            >
              <ImageIcon size={16} className="text-[#c4587a]" />
            </motion.div>
            <span className="font-['Poppins',sans-serif] text-[13px] font-medium text-[#5a4e48]">
              {isUsingCustom ? "Custom bg active" : "Change bg"}
            </span>
            <ChevronDown
              size={14}
              className={`text-[#765762] transition-transform duration-200 ${isBgDropdownOpen ? "rotate-180" : ""}`}
            />
          </motion.button>

          {/* Dropdown Menu Popover */}
          <AnimatePresence>
            {isBgDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute left-0 top-full mt-2.5 w-[330px] sm:w-[380px] rounded-2xl bg-white/95 backdrop-blur-xl border border-pink-100 shadow-[0_20px_50px_rgba(70,30,50,0.2)] p-4 z-50 overflow-hidden text-[#4a3b32]"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-pink-100/70">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-pink-100/80 text-pink-600">
                      <Sparkles size={14} />
                    </span>
                    <div>
                      <h4 className="font-['Playfair_Display',serif] font-bold text-sm text-[#3d2730]">
                        Background Scenery
                      </h4>
                      <p className="font-['Poppins',sans-serif] text-[10px] text-[#8c6b77]">
                        Paste an Unsplash link or pick a preset
                      </p>
                    </div>
                  </div>
                  {(isUsingCustom || bgIndex !== 0) && (
                    <button
                      type="button"
                      onClick={handleResetToDefault}
                      className="flex items-center gap-1 text-[11px] font-medium text-pink-600 hover:text-pink-800 transition-colors bg-pink-50 hover:bg-pink-100 px-2 py-1 rounded-full cursor-pointer"
                      title="Reset to original stationery watercolor"
                    >
                      <RotateCcw size={11} />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                {/* Unsplash Input Section */}
                <div className="mt-3.5">
                  <label className="block font-['Poppins',sans-serif] text-[11px] font-semibold text-[#5a3a44] mb-1.5">
                    Paste Unsplash / Image Link
                  </label>
                  <form onSubmit={handleApplyCustomUrl} className="flex gap-1.5">
                    <div className="relative flex-1">
                      <input
                        type="url"
                        value={unsplashInput}
                        onChange={(e) => {
                          setUnsplashInput(e.target.value);
                          if (unsplashError) setUnsplashError(null);
                        }}
                        placeholder="https://unsplash.com/photos/..."
                        className="w-full px-3 py-2 text-xs rounded-xl border border-pink-200/80 bg-white/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all font-['Poppins',sans-serif] text-[#3d2730] placeholder:text-gray-400"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold font-['Poppins',sans-serif] bg-gradient-to-r from-pink-500 to-[#c4587a] text-white shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                    >
                      Apply
                    </button>
                  </form>

                  {unsplashError && (
                    <p className="mt-1 text-[11px] text-red-500 font-['Poppins',sans-serif]">
                      {unsplashError}
                    </p>
                  )}

                  {/* Helpful tip with link to Unsplash */}
                  <div className="flex items-center justify-between mt-1.5 text-[10px] text-[#8c6b77] font-['Poppins',sans-serif]">
                    <span>Paste any Unsplash photo or CDN image</span>
                    <a
                      href="https://unsplash.com"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-0.5 text-pink-600 hover:underline"
                    >
                      Browse Unsplash <ExternalLink size={9} />
                    </a>
                  </div>

                  {/* Active Custom Background Badge */}
                  {isUsingCustom && (
                    <div className="mt-2.5 flex items-center justify-between p-2 rounded-xl bg-pink-50/80 border border-pink-200/80">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={activeCustomBg}
                          alt="Current custom"
                          className="w-7 h-7 rounded-lg object-cover border border-pink-200 shrink-0"
                        />
                        <span className="font-['Poppins',sans-serif] text-[11px] text-pink-800 font-medium truncate">
                          Custom Unsplash active
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetToDefault}
                        className="text-pink-600 hover:text-red-600 p-1 rounded-md transition-colors shrink-0 cursor-pointer"
                        title="Remove custom image"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Presets Grid */}
                <div className="mt-4 pt-3 border-t border-pink-100/70">
                  <span className="block font-['Poppins',sans-serif] text-[11px] font-semibold text-[#5a3a44] mb-2">
                    Curated Scenery Presets
                  </span>
                  <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1">
                    {PRESET_BACKGROUNDS.map((preset, idx) => {
                      const isSelected = !isUsingCustom && bgIndex === idx;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleSelectPreset(idx)}
                          className={`group relative flex items-center gap-2 p-1.5 rounded-xl border text-left transition-all cursor-pointer overflow-hidden ${
                            isSelected
                              ? "bg-pink-100/70 border-pink-400 ring-2 ring-pink-300 shadow-xs"
                              : "bg-white/60 hover:bg-white border-pink-100/90 hover:border-pink-300"
                          }`}
                        >
                          <img
                            src={preset.thumbnail}
                            alt={preset.name}
                            className="w-9 h-9 rounded-lg object-cover shrink-0 border border-black/5"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-['Poppins',sans-serif] text-[11px] font-semibold text-[#3d2730] truncate group-hover:text-pink-700">
                              {preset.name}
                            </p>
                            <p className="font-['Poppins',sans-serif] text-[9px] text-[#8c6b77] truncate">
                              {preset.subtitle}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="shrink-0 w-4 h-4 rounded-full bg-pink-600 text-white flex items-center justify-center">
                              <Check size={10} strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Update button - SENDER ONLY */}
      {!isReceiver && (
        <motion.button
          className={`absolute bottom-6 left-7 z-30 flex items-center gap-2 rounded-full px-5 py-3 font-['Poppins',sans-serif] text-[13px] shadow-lg backdrop-blur-md ${
            hasChanges
              ? "bg-[#c4587a] text-white"
              : "border border-white/35 bg-white/65 text-[#765762]"
          }`}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={saveChanges}
        >
          {hasChanges ? <span className="size-2 rounded-full bg-white shadow-[0_0_8px_white]" /> : <Check size={15} />}
          {hasChanges ? (hasSaved ? "Save update" : "Save") : "Update"}
        </motion.button>
      )}

      {/* Cloud status - only shown for draft editor, not receiver */}
      {!isReceiver && (
        <div className="absolute bottom-6 right-7 z-30 rounded-full border border-white/30 bg-white/55 px-3 py-1.5 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.14em] text-[#765762] backdrop-blur-md">
          {cloudStatus === "loading" ? "Syncing to cloud…" : cloudStatus === "error" ? "Saved locally · cloud pending" : project.editToken ? "Saved to cloud" : "Shared view"}
        </div>
      )}

      {/* Top Action Buttons: Receiver sees ONLY the elegant Gift Guide; Sender sees Guide, Share & Back */}
      {isReceiver ? (
        <motion.button
          className="absolute right-[28px] top-[28px] z-30 flex items-center gap-2 rounded-full px-4 py-2.5 cursor-pointer border border-white/80 shadow-md backdrop-blur-md transition-all hover:bg-white/95"
          style={{
            background: "rgba(255, 255, 255, 0.78)",
            boxShadow: "0 4px 20px rgba(196,88,122,0.18), 0 0 0 1px rgba(255,255,255,0.7)",
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setIsGuideOpen(true)}
          title="Open Celebration Gift Guide ✨"
        >
          <Sparkles size={15} className="text-pink-600 animate-spin" style={{ animationDuration: "5s" }} />
          <span className="font-['Poppins',sans-serif] text-[13px] font-semibold text-[#5a3a44]">
            ✨ Gift Guide
          </span>
        </motion.button>
      ) : (
        <>
          {/* Guide button - Sender */}
          <motion.button
            className="absolute right-[215px] top-[28px] z-30 flex items-center gap-1.5 rounded-full border-none px-3.5 py-2.5 transition-colors hover:bg-white/85 cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsGuideOpen(true)}
            title="Open User Guide"
          >
            <Sparkles size={14} className="text-[#c4587a]" />
            <span className="font-['Poppins',sans-serif] text-[13px] text-[#5a4e48] hidden sm:inline">Guide</span>
          </motion.button>

          {/* Share button - Sender */}
          <motion.button
            className="absolute right-[112px] top-[28px] z-30 flex items-center gap-2 rounded-full border-none px-4 py-2.5 cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsShareModalOpen(true)}
          >
            <Share2 size={15} className={project.isSealed ? "text-[#c4587a]" : "text-[#6b5e58]"} />
            <span className="font-['Poppins',sans-serif] text-[13px] text-[#5a4e48]">
              {project.isSealed ? "Sealed 💌" : "Share"}
            </span>
          </motion.button>

          {/* Back button - Sender */}
          <motion.button
            className="absolute top-[28px] right-[28px] z-30 flex items-center gap-2 px-4 py-2.5 rounded-full cursor-pointer border-none"
            style={{
              background: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/")}
          >
            <span className="font-['Poppins',sans-serif] text-[14px] text-[#5a4e48]">Back</span>
          </motion.button>
        </>
      )}

      {/* Ambient Floating Accents filling whitespace */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {[
          { text: "✨", top: "27%", left: "49%", delay: 0 },
          { text: "🌸", top: "75%", left: "49%", delay: 1.5 },
          { text: "💕", top: "34%", left: "33%", delay: 0.8 },
          { text: "⭐", top: "34%", right: "33%", delay: 2.2 },
          { text: "🎀", top: "69%", left: "32%", delay: 1.2 },
          { text: "💫", top: "69%", right: "32%", delay: 1.8 },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            className="absolute text-xl sm:text-2xl select-none"
            style={{
              top: item.top,
              left: "left" in item ? (item as any).left : undefined,
              right: "right" in item ? (item as any).right : undefined,
            }}
            animate={{
              y: [-6, 6, -6],
              opacity: [0.35, 0.75, 0.35],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: item.delay,
            }}
          >
            {item.text}
          </motion.div>
        ))}
      </div>

      {/* Top Heading: Receiver sees customized title or celebration title; Sender can tap to edit */}
      <motion.div
        className="absolute top-[32px] sm:top-[42px] left-1/2 -translate-x-1/2 z-20 max-w-[94vw] text-center"
        whileHover={!isReceiver && !isEditingHeader ? { scale: 1.02 } : undefined}
      >
        {!isReceiver && isEditingHeader ? (
          <div className="flex flex-col items-center">
            <input
              ref={headerInputRef}
              type="text"
              value={headerInput}
              onChange={(e) => setHeaderInput(e.target.value)}
              onBlur={handleSaveHeader}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveHeader();
                } else if (e.key === "Escape") {
                  setHeaderInput(project.headerTitle || "");
                  setIsEditingHeader(false);
                }
              }}
              placeholder="Write Your Wish..."
              maxLength={65}
              className="font-['Alex_Brush',cursive] text-[42px] sm:text-[54px] lg:text-[64px] text-[#3a2a2a] text-center bg-white/85 backdrop-blur-md px-5 py-0.5 rounded-2xl border-2 border-pink-300 focus:border-pink-500 outline-none w-[92vw] max-w-[560px] leading-tight shadow-xl"
              autoFocus
            />
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-sans font-semibold text-pink-700/80">
                Press Enter or tap outside to save ✨
              </span>
              {headerInput.trim() && (
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setHeaderInput("");
                    updateProject({ headerTitle: "" });
                    setIsEditingHeader(false);
                  }}
                  className="text-[10px] font-sans font-semibold text-gray-500 hover:text-red-600 underline cursor-pointer"
                >
                  Reset to default
                </button>
              )}
            </div>
          </div>
        ) : (
          <div
            onClick={() => {
              if (isReceiver) return;
              setHeaderInput(project.headerTitle || "");
              setIsEditingHeader(true);
            }}
            className={`flex flex-col items-center select-none ${
              !isReceiver ? "cursor-pointer group" : ""
            }`}
            title={!isReceiver ? "Tap to write a line ✍️" : undefined}
          >
            <div className={`flex items-center justify-center gap-2 px-3 py-1 rounded-2xl transition-all ${!isReceiver ? "hover:bg-white/30 backdrop-blur-xs" : ""}`}>
              <p className={`font-['Alex_Brush',cursive] text-[48px] sm:text-[60px] lg:text-[68px] text-[#3a2a2a] select-none leading-none drop-shadow-sm transition-colors ${!isReceiver ? "group-hover:text-pink-900" : ""}`}>
                {isReceiver
                  ? (project.headerTitle && project.headerTitle.trim() && project.headerTitle.trim().toLowerCase() !== "write your wish"
                      ? project.headerTitle.trim()
                      : (name ? `A Celebration for ${name}` : "A Celebration for You"))
                  : (project.headerTitle?.trim() || "Write Your Wish")}
              </p>
              {!isReceiver && (
                <Edit3
                  size={16}
                  className="text-pink-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                />
              )}
            </div>
            <motion.div
              className="mx-auto mt-2 rounded-full"
              style={{
                width: "180px",
                height: "2.5px",
                background: "linear-gradient(90deg, transparent, rgba(196,88,122,0.5), transparent)",
              }}
              animate={{ scaleX: [0.6, 1.1, 0.6] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        )}
      </motion.div>

      {/* Centerpiece Greeting Card (Short 1-2 line wish / quote, distinct from the complete letter) */}
      <motion.div
        className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[460px] max-w-[86vw] cursor-pointer"
        whileHover={{ scale: 1.03, y: -4 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          if (isReceiver) {
            setIsModalOpen(true);
          } else {
            setIsFrontWishModalOpen(true);
          }
        }}
        title={isReceiver ? "Tap to read full heartfelt letter 💌" : "Tap to edit greeting wish ✍️"}
      >
        <div
          className="rounded-[24px] p-6 sm:p-7 relative overflow-hidden backdrop-blur-md transition-all duration-300 border border-amber-200/70 shadow-[0_20px_50px_rgba(196,88,122,0.18),0_6px_20px_rgba(0,0,0,0.06)] text-center"
        >
          {/* Real Letter Paper Texture */}
          <img
            src={imgLetterPaper}
            alt=""
            className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-90 select-none"
          />
          {/* Subtle translucent veil for crystal-clear readability */}
          <div className="absolute inset-0 bg-white/45 backdrop-blur-[1px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 mb-2 text-pink-700 text-[11px] font-bold tracking-widest uppercase">
              <Sparkles size={13} />
              <span>{frontWish ? "Special Wish" : `A Wish For ${name}`}</span>
              <Sparkles size={13} />
            </div>

            <p className="font-['Caveat',cursive] text-[24px] sm:text-[28px] leading-relaxed text-[#2d1b22] px-4 select-none">
              "{displayFrontWish}"
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stickers */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {stickers.map((sticker) => {
          const effectiveSrc =
            sticker.id === "birthday-cake" && project.cake && cakeImageMap[project.cake]
              ? cakeImageMap[project.cake]
              : sticker.src;
          return (
            <InteractiveSticker
              key={sticker.id}
              sticker={{ ...sticker, src: effectiveSrc }}
              onClick={() => handleStickerClick(sticker.id)}
              isReceiver={isReceiver}
            />
          );
        })}
      </div>

      {/* Name badge - hidden for recipient when viewing receiver link */}
      {!isReceiver && !isBadgeDismissed && (
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div
            className="px-6 py-3 rounded-full flex items-center gap-2"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)",
            }}
          >
            <span className="font-['Poppins',sans-serif] text-[13px] text-[#7a6068]">
              For <span className="text-[#c4587a]">{name}</span> — {occasion} · {relationship}
            </span>
            <button
              type="button"
              onClick={() => setIsBadgeDismissed(true)}
              className="text-[#a68690] hover:text-[#2d1b22] text-xs ml-1 cursor-pointer transition-colors"
              title="Hide badge"
            >
              <X size={12} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Front Card Wish Modal (Short single-line greeting wish) */}
      <FrontWishModal
        isOpen={isFrontWishModalOpen}
        onClose={() => setIsFrontWishModalOpen(false)}
        onSave={handleSaveFrontWish}
        onOpenLetter={() => {
          setIsFrontWishModalOpen(false);
          setIsModalOpen(true);
        }}
        name={name}
        initialMessage={project.frontMessage || ""}
      />

      {/* Complete Handwritten Wish Letter Modal (Stationery Floral Paper) */}
      <WishModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveWish}
        name={name}
        relationship={relationship}
        initialWish={savedWish}
        initialFontStyle={project.letterFont || "caveat"}
      />

      {/* Journal Overlay */}
      <JournalOverlay
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        name={name}
        pages={project.journalPages}
        onPagesChange={(journalPages) => updateProject({ journalPages })}
        onSave={saveChanges}
      />

      {/* Mailbox Modal (Putul Khela Stage & Dream Bubble Realm) */}
      <MailboxModal
        isOpen={isMailboxOpen}
        onClose={() => setIsMailboxOpen(false)}
        name={name}
        items={project.mailboxItems}
        onItemsChange={(mailboxItems) => updateProject({ mailboxItems })}
        theme={project.mailboxTheme}
        onThemeChange={(mailboxTheme) => updateProject({ mailboxTheme })}
        projectId={project.projectId}
        isReceiver={isReceiver}
      />

      {/* Interactive User Guide Tour Modal */}
      <GuideTourModal
        isOpen={isGuideOpen}
        onClose={handleCloseGuide}
        onAction={handleStickerClick}
        isReceiver={isReceiver}
        recipientName={name}
      />

      {/* Seal & Share Gift Modal (Receiver & Private Draft Links) */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        project={project}
        onProjectUpdate={setProject}
      />
    </div>
  );
}
