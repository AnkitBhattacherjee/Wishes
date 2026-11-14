import { ImageWithFallback } from "./figma/ImageWithFallback";
import JournalOverlay from "./JournalOverlay";
import { MailboxModal } from "./MailboxModal";
import { GuideTourModal } from "./GuideTourModal";
import { ShareModal } from "./ShareModal";
import { useDynamicLetterFont, type LetterFontStyle } from "./useDynamicLetterFont";
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Check, Share2, Sparkles, Heart, Eye, Edit3, X, Feather } from "lucide-react";
import {
  createShareLink,
  loadCloudGiftProject,
  loadGiftProject,
  persistGiftProject,
  saveGiftProject,
  type GiftProject,
  type CloudStatus,
} from "../giftStore";
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

/* ── Background sets per theme ── */
const backgrounds: Record<string, string[]> = {
  default: [
    imgImage10,
    "https://images.unsplash.com/photo-1770977883066-4dbee15c84d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0ZWwlMjBmbG9yYWwlMjB2aW50YWdlJTIwd2F0ZXJjb2xvciUyMHRleHR1cmV8ZW58MXx8fHwxNzcyNDQxNjQ3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1578972497170-bfc780c65f65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaW5rJTIwcm9zZSUyMHBldGFscyUyMHJvbWFudGljJTIwc29mdCUyMGJhY2tncm91bmR8ZW58MXx8fHwxNzcyNDQxNjQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1769443398678-411926888200?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXJ0aGRheSUyMGNlbGVicmF0aW9uJTIwcGFzdGVsJTIwY29uZmV0dGklMjBiYWxsb29uc3xlbnwxfHx8fDE3NzI0NDE2NDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1770740830168-eedfa0126ad8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXJtJTIwZ29sZGVuJTIwYm9rZWglMjByb21hbnRpYyUyMGxpZ2h0c3xlbnwxfHx8fDE3NzI0NDE2NDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  ],
};

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
}: {
  sticker: (typeof stickers)[0];
  onClick?: () => void;
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

      <div
        className="w-[230px] h-[230px] sm:w-[260px] sm:h-[260px] md:w-[280px] md:h-[280px] lg:w-[300px] lg:h-[300px] xl:w-[320px] xl:h-[320px] relative flex items-center justify-center pointer-events-none"
      >
        <img alt={sticker.alt} className={sticker.imgStyle} src={sticker.src} draggable={false} />
      </div>
    </motion.div>
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
                    Prepared with love by your special person
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
  const { recipient: name, occasion, relationship, backgroundIndex: bgIndex, wish: savedWish } = project;

  // Automatically show user guide tour on first visit
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem("wish_guide_dismissed");
      if (!dismissed) {
        const timer = setTimeout(() => setIsGuideOpen(true), 750);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const handleCloseGuide = () => {
    setIsGuideOpen(false);
    try {
      localStorage.setItem("wish_guide_dismissed", "true");
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
    const sharedId = new URLSearchParams(location.search).get("gift");
    if (!sharedId || !/^[0-9a-f-]{30,40}$/i.test(sharedId) || project.editToken) return;
    setCloudStatus("loading");
    loadCloudGiftProject(sharedId)
      .then((loaded) => {
        setProject(loaded);
        setCloudStatus("saved");
      })
      .catch(() => setCloudStatus("error"));
  }, [location.search, project.editToken]);

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

  const bgList = backgrounds.default;
  const currentBg = bgList[bgIndex];

  const cycleBg = () => {
    updateProject({ backgroundIndex: (bgIndex + 1) % bgList.length });
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
      navigate("/room", {
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
          key={bgIndex}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {bgIndex === 0 ? (
            <img
              alt="Background"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              src={currentBg}
            />
          ) : (
            <ImageWithFallback
              alt="Background"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              src={currentBg}
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

      {/* Change BG button */}
      <motion.button
        className="absolute top-[28px] left-[28px] z-30 flex items-center gap-2 px-4 py-2.5 rounded-full cursor-pointer border-none transition-colors hover:bg-white/85"
        style={{
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        onClick={cycleBg}
      >
        <motion.div
          animate={{ rotate: 0 }}
          whileHover={{ rotate: -180 }}
          transition={{ duration: 0.4 }}
          className="text-[#6b5e58]"
        >
          <RefreshIcon />
        </motion.div>
        <span className="font-['Poppins',sans-serif] text-[14px] text-[#5a4e48]">Change bg</span>
      </motion.button>

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

      <div className="absolute bottom-6 right-7 z-30 rounded-full border border-white/30 bg-white/55 px-3 py-1.5 font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.14em] text-[#765762] backdrop-blur-md">
        {cloudStatus === "loading" ? "Syncing to cloud…" : cloudStatus === "error" ? "Saved locally · cloud pending" : project.editToken ? "Saved to cloud" : "Shared view"}
      </div>

      {/* Guide button */}
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

      {/* Back button */}
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

      {/* Top Heading */}
      <motion.div
        className="absolute top-[40px] sm:top-[50px] left-1/2 -translate-x-1/2 z-20 cursor-pointer max-w-[90%] text-center"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsModalOpen(true)}
      >
        <p className="font-['Alex_Brush',cursive] text-[52px] sm:text-[62px] lg:text-[70px] text-[#3a2a2a] select-none leading-none drop-shadow-sm">
          Write Your Wish
        </p>
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
      </motion.div>

      {/* Centerpiece Wish Note Card - Real Floral Stationery Letter Preview */}
      <motion.div
        className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[450px] max-w-[84vw] cursor-pointer"
        whileHover={{ scale: 1.03, y: -4 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsModalOpen(true)}
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
            <div className="flex items-center justify-center gap-2 mb-1.5 text-pink-700 text-[11px] font-bold tracking-widest uppercase">
              <Sparkles size={13} />
              <span>{savedWish ? "Heartfelt Letter" : `A Letter For ${name}`}</span>
              <Sparkles size={13} />
            </div>

            {savedWish ? (
              <p className="font-['Caveat',cursive] text-[24px] sm:text-[27px] leading-relaxed text-[#2d1b22] line-clamp-3 px-4 select-none">
                "{savedWish}"
              </p>
            ) : (
              <div className="py-2 select-none">
                <p className="font-['Alex_Brush',cursive] text-[36px] sm:text-[44px] text-[#2e1820] leading-tight">
                  My Dearest {name}
                </p>
                <p className="font-['Poppins',sans-serif] text-[12px] sm:text-[13px] text-pink-800/80 mt-1 font-medium">
                  Tap to write your stationery letter 💌
                </p>
              </div>
            )}

            <div className="mt-3 pt-2.5 border-t border-[#dfc2c8]/60 w-full flex items-center justify-between text-[11px] font-medium text-[#785460] select-none px-2">
              <span className="font-bold tracking-wider uppercase text-pink-700/80 text-[10px]">
                By your special person
              </span>
              <span className="text-pink-600 font-semibold hover:underline">
                {savedWish ? "Click to edit letter ✍️" : "Click to write ✍️"}
              </span>
            </div>
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
            />
          );
        })}
      </div>

      {/* Name badge */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <div
          className="px-6 py-3 rounded-full"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)",
          }}
        >
          <span className="font-['Poppins',sans-serif] text-[13px] text-[#7a6068]">
            For <span className="text-[#c4587a]">{name}</span> — {occasion} · {relationship}
          </span>
        </div>
      </motion.div>

      {/* Wish Modal */}
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
      />

      {/* Interactive User Guide Tour Modal */}
      <GuideTourModal
        isOpen={isGuideOpen}
        onClose={handleCloseGuide}
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
