import { useEffect, useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  PlusCircle,
  Save,
  Trash2,
  Sparkles,
  Check,
} from "lucide-react";
import html2canvas from "html2canvas";
import coverImage from "../../../imports/Desktop3-1/53d3640202fee41fc49435adadaf40ec5c1b091b.png";
import tableBg from "../../../imports/Desktop3-1/a8965c19509cbe3d414f37b2897af043cac1a180.png";
import watermarkLogo from "../../../imports/Desktop4-2/32cdde58a4bf80b47367c4020374c471774cc347.png";
import type { ScrapbookPage } from "../../giftStore";
import { DiaryContainer } from "./DiaryContainer";
import { Spread1 } from "./Spread1";
import { Spread2 } from "./Spread2";
import { Spread3 } from "./Spread3";
import { StickerProvider, useStickers } from "./StickerContext";
import { StickerModal } from "./StickerModal";
import { CustomStickerLayer } from "./CustomStickerLayer";

const MAX_PAGES = 5;

function AddStickerButton() {
  const stickers = useStickers();
  return (
    <button
      onClick={() => stickers?.openPickerForNewSticker()}
      className="flex items-center gap-1.5 border-l-2 border-pink-100 pl-4 font-semibold text-pink-500 hover:text-pink-600 transition-colors cursor-pointer"
      title="Add stickers or scraps to this page"
    >
      <Sparkles size={17} /> Add Sticker
    </button>
  );
}

function PageCanvas({ children }: { children: React.ReactNode }) {
  const stickers = useStickers();
  return (
    <div
      id="scrapbook-page-to-save"
      className="relative flex size-full items-center justify-center select-none"
      onClick={() => stickers?.setSelectedStickerId(null)}
    >
      {children}
    </div>
  );
}

export default function OriginalScrapbookApp({
  visible,
  onExit,
  pages,
  onPagesChange,
  onSave,
  onOpenShareModal,
  isReceiver,
}: {
  visible: boolean;
  onExit: () => void;
  pages: ScrapbookPage[];
  onPagesChange: (pages: ScrapbookPage[]) => void;
  onSave: () => Promise<boolean>;
  onOpenShareModal?: () => void;
  isReceiver?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [dirty, setDirty] = useState(false);
  const pagesRef = useRef(pages);
  pagesRef.current = pages;
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) return;
    setIsOpen(false);
    setCurrentPage(0);
    setIsAddingPage(false);
  }, [visible]);

  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    setDirty(true);
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        await onSave();
        setDirty(false);
      } catch (err) {
        console.error("Auto-save failed:", err);
      } finally {
        setIsSaving(false);
      }
    }, 2500);
  }, [onSave]);

  const updateData = (key: string, value: string) => {
    const currentList = pagesRef.current;
    const next = currentList.map((page, index) =>
      index === currentPage ? { ...page, data: { ...page.data, [key]: value } } : page
    );
    pagesRef.current = next;
    onPagesChange(next);
    triggerAutoSave();
  };

  const addPage = (style: 1 | 2 | 3) => {
    if (pages.length >= MAX_PAGES) return;
    const next = [
      ...pagesRef.current,
      {
        id: crypto.randomUUID(),
        style,
        data: {},
        photos: Array(5).fill(""),
        texts: {},
      },
    ];
    pagesRef.current = next;
    onPagesChange(next);
    setCurrentPage(next.length - 1);
    setIsAddingPage(false);
    triggerAutoSave();
  };

  const deletePage = () => {
    if (pages.length <= 1) return;
    const next = pagesRef.current.filter((_, index) => index !== currentPage);
    pagesRef.current = next;
    onPagesChange(next);
    setCurrentPage(Math.max(0, currentPage - 1));
    triggerAutoSave();
  };

  const save = async () => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    setIsSaving(true);
    const saved = await onSave();
    setIsSaving(false);
    if (saved) setDirty(false);
    return saved;
  };

  const handleCloseDiary = async () => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    if (dirty) {
      await onSave();
      setDirty(false);
    }
    setIsOpen(false);
  };

  const handleExit = async () => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    if (dirty) {
      await onSave();
      setDirty(false);
    }
    onExit();
  };

  const saveToDevice = async () => {
    const element = document.getElementById("scrapbook-page-to-save");
    if (!element) return;
    setIsSavingImage(true);
    try {
      const canvas = await html2canvas(element, { backgroundColor: null, scale: 2, useCORS: true });
      const link = document.createElement("a");
      link.download = `scrapbook-page-${currentPage + 1}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setIsSavingImage(false);
    }
  };

  const renderSpread = () => {
    const page = pages[currentPage];
    if (!page) return null;
    const props = { data: page.data || {}, onUpdate: updateData, isViewerMode: Boolean(isReceiver) };
    if (page.style === 2) return <Spread2 {...props} />;
    if (page.style === 3) return <Spread3 {...props} />;
    return <Spread1 {...props} />;
  };

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden font-sans"
      style={{
        backgroundImage: !isOpen ? `url(${tableBg})` : "none",
        backgroundColor: isOpen ? "#fce4ec" : "transparent",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="cover"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotateY: 90 }}
            transition={{ duration: 0.6 }}
            className="relative flex min-h-screen w-full flex-col items-center justify-center"
          >
            <motion.h1
              className="absolute top-[6%] z-10 w-full px-4 text-center text-3xl tracking-wide text-white drop-shadow-md md:text-4xl lg:top-[8%] lg:text-[48px]"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              {isReceiver ? "Someone shared their memories with you" : "Share your memories with someone special"}
            </motion.h1>
            <motion.div
              className="group relative mt-10 flex w-full max-w-[620px] cursor-pointer flex-col items-center justify-center px-6 lg:mt-14"
              onClick={() => setIsOpen(true)}
              whileHover="hover"
            >
              <motion.div
                className="relative z-10 flex w-full justify-center"
                variants={{ hover: { rotate: -2, scale: 1.02 } }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="relative flex h-[640px] w-[480px] items-center justify-center overflow-hidden pointer-events-none scale-[0.82] origin-center">
                  <img
                    src={coverImage}
                    alt="My Scrapbook Diary"
                    className="absolute h-[130%] max-w-none object-contain drop-shadow-2xl pointer-events-auto"
                  />
                </div>
              </motion.div>
              <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                <motion.button
                  className="pointer-events-auto rounded-full bg-pink-400 px-5 py-2.5 text-sm font-bold text-white shadow-xl"
                  variants={{ hover: { opacity: 1, y: 0, scale: 1.05 } }}
                  initial={{ opacity: 0, y: 20, scale: 1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Open me, I’m full of you ✨
                </motion.button>
              </div>
            </motion.div>
            <button
              onClick={handleExit}
              className="absolute right-5 top-5 rounded-full bg-black/25 px-3.5 py-1.5 text-[11px] text-white/80 backdrop-blur-md hover:bg-black/40 transition cursor-pointer"
            >
              Back to wish
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="open-diary"
            initial={{ opacity: 0, scale: 0.9, rotateY: -90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="relative flex h-full w-full flex-col items-center justify-center p-4"
          >
            <StickerProvider
              data={pages[currentPage]?.data || {}}
              onUpdate={updateData}
              isViewerMode={Boolean(isReceiver)}
            >
            <div className="fixed left-0 right-0 top-4 z-50 flex justify-between px-8">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCloseDiary}
                  className="rounded-full bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-pink-600 shadow-sm backdrop-blur transition hover:bg-white cursor-pointer"
                >
                  Close Diary
                </button>
                {!isReceiver && pages.length > 1 && (
                  <button
                    onClick={deletePage}
                    className="flex items-center gap-1.5 rounded-full bg-red-100/80 px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm backdrop-blur transition hover:bg-red-100 cursor-pointer"
                  >
                    <Trash2 size={14} /> Delete Page
                  </button>
                )}
                {isReceiver && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={saveToDevice}
                      disabled={isSavingImage}
                      className="flex items-center gap-1.5 bg-pink-100 text-pink-600 px-3.5 py-1.5 rounded-full shadow-sm text-xs font-bold hover:bg-pink-200 transition disabled:opacity-50 cursor-pointer"
                    >
                      {isSavingImage ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      {isSavingImage ? "Saving..." : "Save to device"}
                    </button>
                    <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold text-pink-700 shadow-xs backdrop-blur">
                      📖 Page {currentPage + 1} of {pages.length}
                    </span>
                  </div>
                )}
              </div>
              {!isReceiver && (
                <div className="flex items-center gap-2.5">
                  <select
                    className="cursor-pointer rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm outline-none backdrop-blur transition hover:bg-white"
                    onChange={(event) =>
                      document.documentElement.style.setProperty("--font-family", event.target.value)
                    }
                  >
                    <option value="'Judson', serif">Font: Judson</option>
                    <option value="'Caveat', serif">Font: Caveat</option>
                    <option value="'Dancing Script', cursive">Font: Dancing Script</option>
                    <option value="'Pacifico', cursive">Font: Pacifico</option>
                    <option value="'Quicksand', cursive">Font: Quicksand</option>
                  </select>
                  <button
                    onClick={save}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-xs font-bold text-pink-600 shadow-sm transition hover:bg-white disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : dirty ? <Save size={14} /> : <Check size={14} />}
                    {isSaving ? "Saving..." : dirty ? "Save" : "Saved ✓"}
                  </button>
                  {onOpenShareModal && (
                    <button
                      onClick={async () => {
                        await save();
                        onOpenShareModal();
                      }}
                      className="flex items-center gap-1.5 rounded-full bg-pink-500 hover:bg-pink-600 active:scale-95 px-4 py-1.5 text-xs font-bold text-white shadow-md transition cursor-pointer"
                    >
                      <Sparkles size={14} />
                      <span>Seal & Share 💌</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="relative flex h-[80vh] w-full max-w-[1400px] items-center justify-center">
              {currentPage > 0 && (
                <button
                  onClick={() => setCurrentPage((page) => page - 1)}
                  className="absolute left-1 z-20 rounded-full bg-white/85 p-2 text-pink-500 shadow-md backdrop-blur transition-all hover:scale-105 hover:bg-white cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft size={22} />
                </button>
              )}
              <DiaryContainer>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPage}
                    initial={{ opacity: 0, x: 50, rotateY: -20 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    exit={{ opacity: 0, x: -50, rotateY: 20 }}
                    transition={{ duration: 0.5 }}
                    className="flex size-full items-center justify-center overflow-visible"
                    style={{ transformStyle: "preserve-3d", transformOrigin: "center" }}
                  >
                    <PageCanvas>
                      {renderSpread()}
                      <CustomStickerLayer />
                    </PageCanvas>
                  </motion.div>
                </AnimatePresence>
              </DiaryContainer>
              {currentPage < pages.length - 1 && (
                <button
                  onClick={() => setCurrentPage((page) => page + 1)}
                  className="absolute right-1 z-20 rounded-full bg-white/85 p-2 text-pink-500 shadow-md backdrop-blur transition-all hover:scale-105 hover:bg-white cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight size={22} />
                </button>
              )}
            </div>

            <div className="fixed bottom-5 z-50 flex items-center gap-3 rounded-full bg-white/85 px-4 py-2 shadow-md backdrop-blur text-xs">
              <div className="flex gap-1.5">
                {pages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index)}
                    className={`size-2.5 rounded-full transition-all ${index === currentPage ? "scale-125 bg-pink-500" : "bg-pink-200 hover:bg-pink-300"}`}
                    title={`Page ${index + 1}`}
                  />
                ))}
              </div>
              {!isReceiver && pages.length < MAX_PAGES && (
                <div className="relative border-l-2 border-pink-100 pl-3">
                  <button
                    onClick={() => setIsAddingPage((value) => !value)}
                    className="flex items-center gap-1 font-semibold text-pink-500 transition hover:text-pink-600 text-xs"
                  >
                    <PlusCircle size={15} /> Add Page
                  </button>
                  <AnimatePresence>
                    {isAddingPage && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full left-1/2 mb-3 flex w-[280px] -translate-x-1/2 gap-2 rounded-xl bg-white p-2 shadow-xl"
                      >
                        <button onClick={() => addPage(1)} className="flex-1 rounded-lg bg-pink-50 px-2.5 py-1.5 text-xs text-pink-700 hover:bg-pink-100">Layout A</button>
                        <button onClick={() => addPage(2)} className="flex-1 rounded-lg bg-pink-50 px-2.5 py-1.5 text-xs text-pink-700 hover:bg-pink-100">Layout B</button>
                        <button onClick={() => addPage(3)} className="flex-1 rounded-lg bg-pink-50 px-2.5 py-1.5 text-xs text-pink-700 hover:bg-pink-100">Layout C</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              {!isReceiver && <AddStickerButton />}
              <button
                onClick={saveToDevice}
                disabled={isSavingImage}
                className={`flex items-center gap-1 font-semibold text-pink-500 text-xs ${!isReceiver ? "border-l-2 border-pink-100 pl-3" : ""}`}
              >
                {isSavingImage ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save to device
              </button>
            </div>

            <StickerModal />
            </StickerProvider>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none fixed bottom-0 right-0 z-[100] flex flex-col items-start">
        <p className="whitespace-nowrap font-['Inter',sans-serif] text-[12px] font-normal leading-[normal] text-black">Created by</p>
        <div className="relative h-[31px] w-[62px] overflow-hidden">
          <img alt="Flamingo logo" className="absolute h-[207.25%] left-[-25.27%] max-w-none top-[-49.28%] w-[152.67%]" src={watermarkLogo} />
        </div>
      </div>

    </div>
  );
}
