import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Share2,
  Lock,
  Unlock,
  Check,
  Sparkles,
  Heart,
  Copy,
  Clock,
  ShieldCheck,
  Send,
  Eye,
  Music,
} from "lucide-react";
import {
  type GiftProject,
  createReceiverShareLink,
  createSenderEditLink,
  sealGiftProject,
  unsealGiftProject,
  persistGiftProject,
} from "../giftStore";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: GiftProject;
  onProjectUpdate: (project: GiftProject) => void;
}

export function ShareModal({
  isOpen,
  onClose,
  project,
  onProjectUpdate,
}: ShareModalProps) {
  const [copiedType, setCopiedType] = useState<"receiver" | "sender" | "wifi" | null>(null);
  const [isSealing, setIsSealing] = useState(false);

  if (!isOpen) return null;

  const isSealed = Boolean(project.isSealed);
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  // 1. Copy Receiver Link & Seal Gift
  const handleCopyReceiverLink = async (forceWifiIp = false) => {
    setIsSealing(true);
    // Automatically seal if not yet sealed
    const nextProject = isSealed ? project : sealGiftProject(project);
    if (!isSealed) onProjectUpdate(nextProject);

    let syncedProject = nextProject;
    // Ensure full project and all media are saved to public cloud storage before copying the link
    try {
      syncedProject = await persistGiftProject(nextProject, true);
      if (!syncedProject.supabaseId) {
        // Retry once if first attempt did not return an id
        syncedProject = await persistGiftProject(syncedProject, true);
      }
      onProjectUpdate(syncedProject);
    } catch (e) {
      console.warn("Could not sync sealed project to cloud before sharing:", e);
    } finally {
      setIsSealing(false);
    }

    let receiverUrl = createReceiverShareLink(syncedProject);
    if (forceWifiIp && isLocalhost) {
      receiverUrl = receiverUrl.replace("localhost", "192.168.0.102").replace("127.0.0.1", "192.168.0.102");
    }

    try {
      if (navigator.share && !isLocalhost) {
        try {
          await navigator.share({
            title: `A celebration surprise for ${nextProject.recipient}`,
            text: `A little magical world was made just for you, ${nextProject.recipient}. 🌸`,
            url: receiverUrl,
          });
          setCopiedType(forceWifiIp ? "wifi" : "receiver");
          setTimeout(() => setCopiedType(null), 3500);
          return;
        } catch {}
      }
      await navigator.clipboard.writeText(receiverUrl);
      setCopiedType(forceWifiIp ? "wifi" : "receiver");
      setTimeout(() => setCopiedType(null), 3500);
    } catch {
      await navigator.clipboard.writeText(receiverUrl).catch(() => {});
      setCopiedType(forceWifiIp ? "wifi" : "receiver");
      setTimeout(() => setCopiedType(null), 3500);
    }
  };

  // 2. Copy Sender Secret Draft Link (to edit later on any device)
  const handleCopySenderLink = async () => {
    const editUrl = createSenderEditLink(project);
    try {
      await navigator.clipboard.writeText(editUrl);
      setCopiedType("sender");
      setTimeout(() => setCopiedType(null), 3000);
    } catch {}
  };

  // 3. Unseal gift to continue editing
  const handleUnseal = () => {
    const unsealed = unsealGiftProject(project);
    onProjectUpdate(unsealed);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-[530px] rounded-[30px] overflow-hidden border border-white/80 bg-white/90 backdrop-blur-2xl shadow-[0_24px_70px_rgba(196,88,122,0.28)] z-10 flex flex-col"
        >
          {/* Top Decorative Header Accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-pink-400 via-rose-500 to-amber-300" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center size-6 rounded-full bg-pink-100 text-pink-700 text-xs">
                💌
              </span>
              <span className="font-['DM_Mono',monospace] text-[10px] font-bold tracking-widest uppercase text-pink-800/80">
                GIFT SHARING & DRAFTING
              </span>
            </div>

            <button
              onClick={onClose}
              className="size-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-black/5 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="px-6 py-2">
            <h2 className="font-['Playfair_Display',serif] text-xl sm:text-2xl font-bold text-[#2d1b22]">
              {isSealed ? "Your Gift is Sealed & Ready!" : "Seal & Share or Keep Drafting"}
            </h2>
            <p className="font-['Poppins',sans-serif] text-xs text-[#6e515d] mt-1">
              You can take as much time as you need to craft the perfect surprise over multiple days before sending.
            </p>

            {/* Status Pill */}
            <div className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-50 border border-pink-200/80 w-fit text-[11px] font-medium text-pink-900">
              {isSealed ? (
                <>
                  <Lock size={12} className="text-emerald-600" />
                  <span className="text-emerald-800 font-semibold">Sealed for Receiver</span>
                  <span className="text-pink-400">•</span>
                  <span className="text-pink-700/80">2-Day Recipient Backup Active</span>
                </>
              ) : (
                <>
                  <Unlock size={12} className="text-amber-600" />
                  <span className="text-amber-800 font-semibold">In Drafting Mode</span>
                  <span className="text-pink-400">•</span>
                  <span className="text-pink-700/80">Draft refreshes every time you update</span>
                </>
              )}
            </div>

            {/* Gift Content & Audio Confirmation Badge */}
            <div className="mt-2.5 p-3 rounded-2xl bg-amber-50/90 border border-amber-300/80 shadow-xs flex flex-col gap-1.5 text-xs text-[#4a2e37]">
              <div className="flex items-center justify-between font-bold text-amber-950">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-600" />
                  <span>Receiver Gift Contents</span>
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100/90 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check size={11} strokeWidth={3} />
                  <span>Encoded in Link</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#5c3a45]">
                <Music size={13} className="text-pink-600 shrink-0" />
                <span className="truncate">
                  <strong>Song:</strong>{" "}
                  {project.customSongYoutubeId
                    ? `YouTube Track (${project.customSongName || "Connected"})`
                    : project.customSongUrl && project.customSongUrl.startsWith("http")
                      ? `Cloud Stream (${project.customSongName || "Uploaded Audio"})`
                      : project.customSongName
                        ? project.customSongName
                        : "Birthday Waltz (Default Celebration Song)"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-emerald-700 font-medium">
                <ShieldCheck size={12} className="shrink-0" />
                <span>Plays automatically when your recipient opens the link! ✨</span>
              </div>
            </div>
          </div>

          {/* Two Distinct Sharing Paths */}
          <div className="px-6 py-3 flex flex-col gap-3.5">
            {/* PATH 1: Receiver Link (Sealed Gift) */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50/90 via-rose-50/50 to-amber-50/40 border-2 border-pink-300/80 shadow-xs flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-['Playfair_Display',serif] font-bold text-sm text-[#3b1a26]">
                  <Send size={15} className="text-pink-600" />
                  <span>1. Receiver Link (For Recipient)</span>
                </span>
                <span className="text-[10px] font-bold text-pink-700 bg-pink-100/90 px-2 py-0.5 rounded-full">
                  Read-Only Surprise
                </span>
              </div>

              <p className="font-['Poppins',sans-serif] text-[11px] text-[#634852] leading-relaxed">
                Locks all edit buttons and begins the 2-day backup so your recipient enjoys an enchanting, clean celebration experience.
              </p>

              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={handleCopyReceiverLink}
                  disabled={isSealing}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-['Poppins',sans-serif] font-semibold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer ${
                    isSealing ? "opacity-75 cursor-wait" : ""
                  }`}
                >
                  {isSealing ? (
                    <>
                      <Sparkles size={14} className="animate-spin" />
                      <span>Sealing & Syncing to Cloud... ⏳</span>
                    </>
                  ) : copiedType === "receiver" ? (
                    <>
                      <Check size={14} className="text-white" />
                      <span>Receiver Link Copied! 🎉</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={14} />
                      <span>{isSealed ? "Copy Receiver Link" : "Seal & Copy Receiver Link 💌"}</span>
                    </>
                  )}
                </button>

                {isSealed && (
                  <button
                    onClick={handleUnseal}
                    className="px-3 py-2.5 rounded-xl border border-pink-300 bg-white hover:bg-pink-50 text-pink-700 font-medium text-xs transition-colors cursor-pointer"
                    title="Unlock to make changes before recipient views"
                  >
                    Unseal 🔓
                  </button>
                )}
              </div>

              {/* Localhost / Same-WiFi Guidance Banner */}
              {isLocalhost && (
                <div className="mt-1 p-2.5 rounded-xl bg-amber-50/90 border border-amber-300/80 text-[11px] text-amber-950 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1 font-semibold text-amber-900 text-xs">
                    <span>📱</span>
                    <span>Opening on your phone or sending to someone nearby?</span>
                  </div>
                  <p className="text-[10.5px] text-amber-800/90 leading-snug">
                    Links containing <strong>localhost</strong> only open on this computer! To open on a phone or friend connected to the same Wi-Fi, copy the Wi-Fi link below.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopyReceiverLink(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-medium text-xs shadow-xs cursor-pointer transition-all"
                  >
                    {copiedType === "wifi" ? (
                      <>
                        <Check size={13} />
                        <span>Wi-Fi Link Copied! (192.168.0.102) 📱</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy Wi-Fi Link for Phone (192.168.0.102) 📱</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* PATH 2: Sender Secret Draft Link (Edit on another device or resume later) */}
            <div className="p-4 rounded-2xl bg-white/70 border border-gray-200/90 shadow-2xs flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-['Playfair_Display',serif] font-bold text-sm text-gray-800">
                  <Clock size={15} className="text-amber-600" />
                  <span>2. Private Draft Link (Keep Editing Later)</span>
                </span>
                <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                  For You Only
                </span>
              </div>

              <p className="font-['Poppins',sans-serif] text-[11px] text-gray-600 leading-relaxed">
                Want to think more and edit later? Bookmark or WhatsApp this private link to yourself. Opens in full edit mode with auto-saving on any laptop or phone.
              </p>

              <button
                onClick={handleCopySenderLink}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-['Poppins',sans-serif] font-medium text-xs transition-all cursor-pointer shadow-2xs"
              >
                {copiedType === "sender" ? (
                  <>
                    <Check size={13} className="text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Private Draft Link Copied! 💾</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy Secret Draft Link ✍️</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer Info */}
          <div className="px-6 py-3.5 bg-pink-50/40 border-t border-pink-100/60 flex items-center justify-between text-[11px] text-[#7a5966]">
            <span className="flex items-center gap-1">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>Zero receiver login required</span>
            </span>
            <button
              onClick={onClose}
              className="text-pink-700 hover:text-pink-900 font-medium hover:underline cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

