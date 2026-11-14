import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Heart,
  Plus,
  Mail,
  Sparkles,
  Trash2,
  Music,
  Mic,
  Camera,
  Play,
  Pause,
  RotateCcw,
  Upload,
  Check,
  Disc,
  ExternalLink,
  Edit3,
} from "lucide-react";
import {
  DEFAULT_MAILBOX_ITEMS,
  uploadGiftFile,
  imageFileToDataUrl,
  type MailboxBubbleItem,
  type MailboxBubbleType,
  type MailboxTheme,
} from "../giftStore";
import { uploadImageToCloud } from "../utils/imageCloudUpload";
import {
  extractYouTubeId,
  extractSunoAudioUrl,
  resolveSunoAudioUrl,
  isSunoUrl,
  isVideoMedia,
} from "../utils/audioUtils";
import {
  PutulKhelaStage,
  PUPPET_CATALOG,
  getPuppetForItem,
  type PuppetCatalogItem,
} from "./PutulKhelaStage";
import imgRoyalScroll from "../../imports/putulkhela/Royal Red Velvet Scroll.png";

/* ── Delicate, Whisper-Soft Bubble Pop Sound ── */
function playBubblePopSound(pitchOffset = 0) {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = "sine";
    const now = ctx.currentTime;

    const startFreq = Math.max(180, 420 + pitchOffset * 0.25);
    const endFreq = Math.max(120, 210 + pitchOffset * 0.1);

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.1);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(700, now);
    filter.frequency.exponentialRampToValueAtTime(350, now + 0.1);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.035, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0004, now + 0.1);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.11);
  } catch {}
}

/* ── Harmonious dynamic screen distribution for bubbles ── */
function getBubblePosition(index: number, total: number) {
  const presets: Array<{ x: number; y: number; size: number }> = [
    { x: 22, y: 28, size: 125 },
    { x: 58, y: 24, size: 130 },
    { x: 38, y: 52, size: 120 },
    { x: 74, y: 46, size: 125 },
    { x: 18, y: 64, size: 118 },
    { x: 52, y: 68, size: 122 },
    { x: 80, y: 26, size: 115 },
    { x: 28, y: 78, size: 118 },
    { x: 68, y: 74, size: 115 },
    { x: 46, y: 32, size: 125 },
    { x: 12, y: 44, size: 112 },
    { x: 84, y: 65, size: 115 },
  ];

  if (index < presets.length) {
    return presets[index];
  }

  const cols = 4;
  const rows = Math.ceil(total / cols);
  const row = Math.floor(index / cols);
  const col = index % cols;

  const baseX = 14 + (col * 72) / Math.max(1, cols - 1);
  const baseY = 20 + (row * 60) / Math.max(1, rows);

  const jitterX = ((index * 37) % 11) - 5;
  const jitterY = ((index * 43) % 9) - 4;
  const size = 110 + ((index * 19) % 25);

  return {
    x: Math.min(88, Math.max(10, baseX + jitterX)),
    y: Math.min(80, Math.max(18, baseY + jitterY)),
    size,
  };
}

export function MailboxModal({
  isOpen,
  onClose,
  name,
  items: rawItems,
  onUpdateItems,
  onItemsChange,
  theme = "putulkhela",
  onThemeChange,
  projectId,
  isReceiver = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  items?: MailboxBubbleItem[];
  onUpdateItems?: (items: MailboxBubbleItem[]) => void;
  onItemsChange?: (items: MailboxBubbleItem[]) => void;
  theme?: MailboxTheme;
  onThemeChange?: (theme: MailboxTheme) => void;
  projectId?: string;
  isReceiver?: boolean;
}) {
  const [internalItems, setInternalItems] = useState<MailboxBubbleItem[]>(() => {
    return rawItems && rawItems.length > 0 ? rawItems : DEFAULT_MAILBOX_ITEMS;
  });

  useEffect(() => {
    if (rawItems && rawItems.length > 0) {
      setInternalItems(rawItems);
    }
  }, [rawItems]);

  const items = internalItems;

  const updateItems = (newItems: MailboxBubbleItem[]) => {
    setInternalItems(newItems);
    if (onUpdateItems) {
      onUpdateItems(newItems);
    }
    if (onItemsChange) {
      onItemsChange(newItems);
    }
  };

  // State of revealed/popped items
  const [poppedTreasureIds, setPoppedTreasureIds] = useState<Set<string>>(new Set());
  const [burstingIds, setBurstingIds] = useState<Set<string>>(new Set());
  const [activeItem, setActiveItem] = useState<MailboxBubbleItem | null>(null);

  // Audio / YouTube Playback
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);
  const ytIframeRef = useRef<HTMLIFrameElement | null>(null);

  const getActiveMedia = (): HTMLMediaElement | null => {
    return isVideoMedia(activeItem?.audioUrl) ? videoPlayerRef.current : audioPlayerRef.current;
  };

  // Creator Modal State
  const [isAdding, setIsAdding] = useState(false);
  const [addTab, setAddTab] = useState<MailboxBubbleType>("song");
  const [newTitle, setNewTitle] = useState("");
  const [newSender, setNewSender] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newYoutubeUrl, setNewYoutubeUrl] = useState("");
  const [newArtist, setNewArtist] = useState("");
  const [newAudioUrl, setNewAudioUrl] = useState<string | null>(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState<string | null>(null);
  const [newPhotoCaption, setNewPhotoCaption] = useState("");
  const [newEmoji, setNewEmoji] = useState("💌");
  const [newHasPaper, setNewHasPaper] = useState(true);
  const [newPuppetId, setNewPuppetId] = useState<string>("musician");

  // Editing direct YouTube link on active card
  const [isEditingYtOnCard, setIsEditingYtOnCard] = useState(false);
  const [cardYtInput, setCardYtInput] = useState("");

  // Editing / uploading photo on active card
  const [isEditingPhotoOnCard, setIsEditingPhotoOnCard] = useState(false);
  const [isUploadingCardPhoto, setIsUploadingCardPhoto] = useState(false);
  const [cardPhotoUrlInput, setCardPhotoUrlInput] = useState("");
  const [cardPhotoCaptionInput, setCardPhotoCaptionInput] = useState("");
  const cardPhotoInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Universal Scroll Message Editing State (All Puppets / Messages)
  const [isEditingCardMessage, setIsEditingCardMessage] = useState(false);
  const [editCardTitle, setEditCardTitle] = useState("");
  const [editCardSender, setEditCardSender] = useState("");
  const [editCardMessage, setEditCardMessage] = useState("");
  const [editCardEmoji, setEditCardEmoji] = useState("💌");
  const [editCardPhotoUrl, setEditCardPhotoUrl] = useState("");
  const [isUploadingEditPhoto, setIsUploadingEditPhoto] = useState(false);
  const editCardPhotoInputRef = useRef<HTMLInputElement>(null);

  // Live Microphone Voice Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);

  // Soft toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  // Switch Theme
  const handleSwitchTheme = (newTheme: MailboxTheme) => {
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
    showToast(
      newTheme === "putulkhela"
        ? "🎭 Switched to Bengali Putul Khela (পুতুল খেলা)!"
        : "🫧 Switched to Dream Bubble Realm!"
    );
  };

  // Reset items to unrevealed state
  const handleResetItems = () => {
    setPoppedTreasureIds(new Set());
    setBurstingIds(new Set());
    setActiveItem(null);
    showToast(theme === "putulkhela" ? "Stage reset! Strings are ready to pull ✨" : "All bubbles blown fresh! 🫧");
  };

  // Popping a bubble or pulling puppet string
  const handlePopTreasure = (item: MailboxBubbleItem, clientX?: number, clientY?: number) => {
    if (theme === "bubble") {
      playBubblePopSound();
    }
    setBurstingIds((prev) => new Set([...prev, item.id]));

    const puppet = getPuppetForItem(item, 0);
    const toastText =
      theme === "putulkhela"
        ? `🎭 Pulled string on ${puppet.nameBn} (${puppet.nameEn})!`
        : `🫧 Memory popped!`;
    showToast(toastText);

    setTimeout(() => {
      setPoppedTreasureIds((prev) => new Set([...prev, item.id]));
      setBurstingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
      setActiveItem(item);
      setIsPlayingAudio(false);
      setIsEditingYtOnCard(false);
      setIsEditingPhotoOnCard(false);
      setIsUploadingCardPhoto(false);
      setIsEditingCardMessage(false);
      setEditCardTitle(item.title || "");
      setEditCardSender(item.sender || "");
      setEditCardMessage(item.message || item.photoCaption || "");
      setEditCardEmoji(item.stampEmoji || "💌");
      if (item.youtubeUrl) setCardYtInput(item.youtubeUrl);
      if (item.photoUrl) setCardPhotoUrlInput(item.photoUrl);
      setCardPhotoCaptionInput(item.photoCaption || item.message || "");
    }, 240);
  };

  // Handle YouTube or Suno AI URL change on active revealed card
  const handleSaveCardYt = async () => {
    if (!activeItem) return;
    const input = cardYtInput.trim();
    const ytId = extractYouTubeId(input);
    const sunoAudio = await resolveSunoAudioUrl(input);
    const isSuno = isSunoUrl(input);

    let updatedItem: MailboxBubbleItem;
    if (sunoAudio) {
      updatedItem = {
        ...activeItem,
        songSource: "suno" as const,
        sunoUrl: input,
        audioUrl: sunoAudio,
        youtubeUrl: undefined,
        youtubeId: undefined,
        artist: isSuno ? "Created with Suno AI 🎵" : (activeItem.artist || "Dedicated Audio Track"),
      };
    } else if (ytId) {
      updatedItem = {
        ...activeItem,
        songSource: "youtube" as const,
        youtubeUrl: input,
        youtubeId: ytId,
        sunoUrl: undefined,
        audioUrl: undefined,
        artist: activeItem.artist || "YouTube Dedicated Song",
      };
    } else {
      updatedItem = {
        ...activeItem,
        youtubeUrl: input,
        youtubeId: undefined,
      };
    }

    const exists = items.some(
      (i) => i.id === activeItem.id || (activeItem.puppetId && i.puppetId === activeItem.puppetId)
    );
    const updated = exists
      ? items.map((i) =>
          i.id === activeItem.id || (activeItem.puppetId && i.puppetId === activeItem.puppetId)
            ? updatedItem
            : i
        )
      : [...items, updatedItem];

    updateItems(updated);
    setActiveItem(updatedItem);
    setIsEditingYtOnCard(false);
    if (sunoAudio) {
      showToast("Suno AI song linked! Streaming directly in site 🎵");
    } else if (ytId) {
      showToast("YouTube link updated! Playing directly in site 🎵");
    } else {
      showToast("Song link updated! 🎵");
    }
  };

  // Handle direct photo file upload on active card
  const handleCardPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeItem) return;
    setIsUploadingCardPhoto(true);
    try {
      // 1. Immediate local preview for zero-lag UI response
      const localPreview = URL.createObjectURL(file);
      const tempItem: MailboxBubbleItem = {
        ...activeItem,
        photoUrl: localPreview,
      };
      setActiveItem(tempItem);

      // 2. Upload to public cloud image storage
      let finalUrl = "";
      try {
        finalUrl = await uploadImageToCloud(file);
      } catch (cloudErr) {
        console.warn("Cloud image upload fallback to local compression:", cloudErr);
        finalUrl = await imageFileToDataUrl(file);
      }

      const updatedItem: MailboxBubbleItem = {
        ...activeItem,
        photoUrl: finalUrl,
      };
      setActiveItem(updatedItem);

      const exists = items.some(
        (i) => i.id === activeItem.id || (activeItem.puppetId && i.puppetId === activeItem.puppetId)
      );
      const updated = exists
        ? items.map((i) =>
            i.id === activeItem.id || (activeItem.puppetId && i.puppetId === activeItem.puppetId)
              ? updatedItem
              : i
          )
        : [...items, updatedItem];
      updateItems(updated);
      showToast("Photo memory saved! 📸✨");
    } catch (err) {
      alert("Could not process this photo. Please choose another image.");
    } finally {
      setIsUploadingCardPhoto(false);
      if (e.target) e.target.value = "";
    }
  };

  // Handle photo file upload inside universal edit mode
  const handleEditPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingEditPhoto(true);
    try {
      const localPreview = URL.createObjectURL(file);
      setEditCardPhotoUrl(localPreview);
      const cloudUrl = await uploadImageToCloud(file);
      setEditCardPhotoUrl(cloudUrl);
      showToast("Photo attached to memory! 📸✨");
    } catch (err) {
      try {
        const compressed = await imageFileToDataUrl(file);
        setEditCardPhotoUrl(compressed);
        showToast("Photo attached! 📸");
      } catch {
        alert("Could not process this image.");
      }
    } finally {
      setIsUploadingEditPhoto(false);
      if (e.target) e.target.value = "";
    }
  };

  // Handle saving image URL or caption on active card
  const handleSaveCardPhoto = () => {
    if (!activeItem) return;
    const url = cardPhotoUrlInput.trim();
    const caption = cardPhotoCaptionInput.trim();

    const updatedItem: MailboxBubbleItem = {
      ...activeItem,
      photoUrl: url || activeItem.photoUrl,
      photoCaption: caption || activeItem.photoCaption,
    };
    setActiveItem(updatedItem);

    const exists = items.some(
      (i) => i.id === activeItem.id || (activeItem.puppetId && i.puppetId === activeItem.puppetId)
    );
    const updated = exists
      ? items.map((i) =>
          i.id === activeItem.id || (activeItem.puppetId && i.puppetId === activeItem.puppetId)
            ? updatedItem
            : i
        )
      : [...items, updatedItem];
    updateItems(updated);
    setIsEditingPhotoOnCard(false);
    showToast("Photo & caption saved! 📸");
  };

  // Handle universal message edit on active card (all puppet types)
  const handleSaveCardMessage = () => {
    if (!activeItem) return;
    const updatedTitle = editCardTitle.trim() || activeItem.title;
    const updatedSender = editCardSender.trim() || (activeItem.sender !== "Your Special Person" ? activeItem.sender : "") || "";
    const updatedMessage = editCardMessage.trim();
    const updatedEmoji = editCardEmoji || activeItem.stampEmoji || "💌";
    const updatedPhotoUrl = editCardPhotoUrl.trim() || undefined;

    const updatedItem: MailboxBubbleItem = {
      ...activeItem,
      title: updatedTitle,
      sender: updatedSender || undefined,
      message: updatedMessage,
      photoUrl: updatedPhotoUrl,
      photoCaption: activeItem.type === "photo" ? updatedMessage : activeItem.photoCaption,
      stampEmoji: updatedEmoji,
    };
    setActiveItem(updatedItem);

    const exists = items.some(
      (i) => i.id === activeItem.id || (activeItem.puppetId && i.puppetId === activeItem.puppetId)
    );
    const updated = exists
      ? items.map((i) =>
          i.id === activeItem.id || (activeItem.puppetId && i.puppetId === activeItem.puppetId)
            ? updatedItem
            : i
        )
      : [...items, updatedItem];

    updateItems(updated);
    setIsEditingCardMessage(false);
    showToast("Message updated! ✨");
  };

  // Handle deleting or clearing element from active card
  const handleDeleteCardMessage = () => {
    if (!activeItem) return;
    if (window.confirm("Are you sure you want to delete or clear this message?")) {
      const exists = items.some(
        (i) => i.id === activeItem.id || (activeItem.puppetId && i.puppetId === activeItem.puppetId)
      );

      let updated: MailboxBubbleItem[];
      if (exists) {
        if (activeItem.puppetId) {
          const cleared: MailboxBubbleItem = {
            ...activeItem,
            title: activeItem.title || "A Secret Memory",
            message: "",
            photoCaption: "",
            sender: "",
            photoUrl: undefined,
          };
          updated = items.map((i) =>
            i.id === activeItem.id || (activeItem.puppetId && i.puppetId === activeItem.puppetId)
              ? cleared
              : i
          );
          setActiveItem(cleared);
        } else {
          updated = items.filter((i) => i.id !== activeItem.id);
          setActiveItem(null);
        }
      } else {
        const cleared: MailboxBubbleItem = {
          ...activeItem,
          title: activeItem.title || "A Secret Memory",
          message: "",
          photoCaption: "",
          sender: "",
        };
        updated = [...items, cleared];
        setActiveItem(cleared);
      }
      updateItems(updated);
      setIsEditingCardMessage(false);
      showToast("Message cleared / deleted 🗑️");
    }
  };

  // Recording controls
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          setNewAudioUrl(base64);
          try {
            const publicUrl = await uploadGiftFile(audioBlob, "audio/webm");
            if (publicUrl) setNewAudioUrl(publicUrl);
          } catch {}
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      alert("Microphone access is needed to record a voice note.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setNewAudioUrl(base64);
        try {
          const publicUrl = await uploadGiftFile(file);
          if (publicUrl) setNewAudioUrl(publicUrl);
        } catch {}
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      const localPreview = URL.createObjectURL(file);
      setNewPhotoUrl(localPreview);
      try {
        const cloudUrl = await uploadImageToCloud(file);
        if (cloudUrl) setNewPhotoUrl(cloudUrl);
      } catch (uploadErr) {
        console.warn("Cloud photo upload deferred, stored locally", uploadErr);
        const compressed = await imageFileToDataUrl(file);
        setNewPhotoUrl(compressed);
      }
    } catch {
      alert("Could not process this image. Please choose another photo.");
    } finally {
      setIsUploadingPhoto(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleTabChange = (type: MailboxBubbleType) => {
    setAddTab(type);
    if (type === "song") setNewPuppetId("musician");
    else if (type === "voice") setNewPuppetId("moonboy");
    else if (type === "photo") setNewPuppetId("painter");
    else if (type === "dream") setNewPuppetId("telescope");
    else if (type === "note") setNewPuppetId("bride");
    else if (type === "surprise") setNewPuppetId("lantern");
  };

  const handleSaveNewItem = async () => {
    if (!newTitle.trim()) return;

    let newItem: MailboxBubbleItem;

    if (addTab === "song") {
      const input = newYoutubeUrl.trim();
      const ytId = extractYouTubeId(input);
      const sunoAudio = await resolveSunoAudioUrl(input);
      const isSuno = isSunoUrl(input);

      newItem = {
        id: `bubble-${Date.now()}`,
        type: "song",
        title: newTitle.trim(),
        sender: newSender.trim() || undefined,
        date: isSuno ? "Suno AI Track" : ytId ? "YouTube Track" : "Dedicated Track",
        message: newMessage.trim(),
        songSource: sunoAudio ? ("suno" as const) : ytId ? ("youtube" as const) : ("audio" as const),
        youtubeUrl: ytId ? input : undefined,
        youtubeId: ytId || undefined,
        sunoUrl: isSuno ? input : undefined,
        audioUrl: sunoAudio || newAudioUrl || undefined,
        artist: newArtist.trim() || (isSuno ? "Created with Suno AI 🎵" : ytId ? "YouTube Dedication" : "Special Dedication"),
        hasPaper: newHasPaper,
        puppetId: newPuppetId,
        stampEmoji: "🎵",
        color: "#fcf6e9",
      };
    } else if (addTab === "voice") {
      newItem = {
        id: `bubble-${Date.now()}`,
        type: "voice",
        title: newTitle.trim(),
        sender: newSender.trim() || "From My Heart",
        date: "Voice Note",
        message: newMessage.trim(),
        voiceUrl: newAudioUrl || undefined,
        voiceDuration: recordingSeconds || 8,
        hasPaper: newHasPaper,
        puppetId: newPuppetId,
        stampEmoji: "🎙️",
        color: "#fcf6e9",
      };
    } else if (addTab === "photo") {
      newItem = {
        id: `bubble-${Date.now()}`,
        type: "photo",
        title: newTitle.trim(),
        sender: newSender.trim() || "Special Moments",
        date: "Cherished Moment",
        photoUrl: newPhotoUrl || undefined,
        photoCaption: newPhotoCaption.trim() || newMessage.trim(),
        hasPaper: newHasPaper,
        puppetId: newPuppetId,
        stampEmoji: "📸",
        color: "#fcf6e9",
      };
    } else {
      newItem = {
        id: `bubble-${Date.now()}`,
        type: addTab,
        title: newTitle.trim(),
        sender: newSender.trim() || undefined,
        date: addTab === "dream" ? "Future Promise" : "Secret Love Note",
        message: newMessage.trim(),
        hasPaper: newHasPaper,
        puppetId: newPuppetId,
        stampEmoji: newEmoji,
        color: "#fcf6e9",
      };
    }

    const existingIndex = items.findIndex((i) => newItem.puppetId && i.puppetId === newItem.puppetId);
    let updatedList: MailboxBubbleItem[];
    if (existingIndex >= 0) {
      updatedList = [...items];
      updatedList[existingIndex] = newItem;
    } else {
      updatedList = [...items, newItem];
    }
    updateItems(updatedList);
    showToast(
      theme === "putulkhela"
        ? `🎭 Memory added to ${PUPPET_CATALOG[newPuppetId]?.nameBn || "puppet"}!`
        : `🫧 Memory bubble added!`
    );

    setNewTitle("");
    setNewSender("");
    setNewMessage("");
    setNewYoutubeUrl("");
    setNewArtist("");
    setNewAudioUrl(null);
    setNewPhotoUrl(null);
    setNewPhotoCaption("");
    setIsAdding(false);
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    updateItems(updated);
    if (activeItem?.id === id) setActiveItem(null);
  };

  const unlockedCount = items.filter((i) => poppedTreasureIds.has(i.id)).length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-hidden flex flex-col select-none"
        style={{
          background:
            theme === "putulkhela"
              ? "#06010a"
              : "radial-gradient(circle at 50% 25%, #24132e 0%, #13081a 55%, #08020c 100%)",
        }}
      >
        {/* ── Floating Glassmorphism Header Bar (Non-intrusive, no opaque stripes) ── */}
        <div className="absolute top-3 inset-x-4 z-40 flex items-center justify-between pointer-events-none">
          {/* Left Pill: Title & Dedication */}
          <div className="pointer-events-auto flex items-center gap-3 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-sm"
              style={{
                background:
                  theme === "putulkhela"
                    ? "linear-gradient(135deg, #d97706, #b45309)"
                    : "linear-gradient(135deg, #ec4899, #f43f5e)",
              }}
            >
              {theme === "putulkhela" ? <span className="text-sm">🎭</span> : <Mail size={13} />}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <h1 className="font-['Alex_Brush',cursive] text-xl sm:text-2xl text-amber-200 leading-none">
                  {theme === "putulkhela" ? "পুতুল খেলা (Putul Khela)" : "Dream Bubble Realm"}
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-amber-300 font-semibold border border-white/10">
                  For {name}
                </span>
              </div>
            </div>
          </div>

          {/* Right Pill: Glassmorphism Controls */}
          <div className="pointer-events-auto flex items-center gap-2">
            {/* Theme Switcher in Frosted Glass */}
            <div className="flex items-center bg-black/40 backdrop-blur-xl p-1 rounded-full border border-white/20 shadow-md">
              <button
                type="button"
                onClick={() => handleSwitchTheme("putulkhela")}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  theme === "putulkhela"
                    ? "bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-sm"
                    : "text-white/70 hover:text-white"
                }`}
                title="Switch to Bengali Puppet Theatre Stage"
              >
                <span>🎭</span>
                <span className="hidden sm:inline">Putul Khela</span>
              </button>
              <button
                type="button"
                onClick={() => handleSwitchTheme("bubble")}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  theme === "bubble"
                    ? "bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-sm"
                    : "text-white/70 hover:text-white"
                }`}
                title="Switch to Dream Bubble Realm"
              >
                <span>🫧</span>
                <span className="hidden sm:inline">Bubbles</span>
              </button>
            </div>

            {/* Score Pill */}
            <div className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 text-xs text-amber-200 shadow-md">
              <Sparkles size={11} className="text-amber-400" />
              <span>
                {unlockedCount} / {theme === "putulkhela" ? 8 : items.length} Revealed
              </span>
            </div>

            {/* Add Bubble Button in Glass (Only available in Bubble Realm; Puppets are a permanent cast) */}
            {theme === "bubble" && (
              <button
                onClick={() => {
                  handleTabChange("note");
                  setIsAdding(true);
                }}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-full text-white text-xs font-bold shadow-md border border-pink-300/40 backdrop-blur-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, rgba(236,72,153,0.9), rgba(244,63,94,0.9))",
                }}
              >
                <Plus size={13} strokeWidth={2.5} />
                <span>Add Bubble 🫧</span>
              </button>
            )}

            {/* Close Button in Glass */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center border border-white/20 backdrop-blur-xl cursor-pointer transition-colors shadow-md"
              title="Close"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── Main View: Switch between Putul Khela Stage & Dream Bubble Realm ── */}
        <div className="relative flex-1 overflow-hidden">
          {theme === "putulkhela" ? (
            /* ══════════════════════════════════════════════════════════════
               THEME 1: BENGALI PUTUL KHELA STAGE (পুতুল খেলা)
               ══════════════════════════════════════════════════════════════ */
            <PutulKhelaStage
              name={name}
              items={items}
              poppedIds={poppedTreasureIds}
              onPopItem={handlePopTreasure}
              onResetItems={handleResetItems}
            />
          ) : (
            /* ══════════════════════════════════════════════════════════════
               THEME 2: DREAM BUBBLE REALM (Floating Soap Bubbles)
               ══════════════════════════════════════════════════════════════ */
            <div className="relative w-full h-full overflow-hidden">
              {/* Soft Ambient Glows */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-pink-500/10 blur-3xl" />
                <div className="absolute top-1/2 right-10 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" />
              </div>

              {items.map((item, index) => {
                const isPopped = poppedTreasureIds.has(item.id);
                const isBursting = burstingIds.has(item.id);

                if (isPopped) return null;

                const coord = getBubblePosition(index, items.length);
                const carriesPaper =
                  item.hasPaper !== undefined
                    ? item.hasPaper
                    : item.type === "note" || item.type === "dream";

                return (
                  <motion.div
                    key={item.id}
                    onClick={(e) => handlePopTreasure(item, e.clientX, e.clientY)}
                    initial={{
                      scale: 0.2,
                      opacity: 0,
                      y: `${coord.y + 12}vh`,
                      x: `${coord.x}vw`,
                    }}
                    animate={{
                      x: [`${coord.x}vw`, `${coord.x + (index % 2 === 0 ? 3.5 : -3.5)}vw`],
                      y: [`${coord.y}vh`, `${coord.y - 4.5}vh`],
                      scale: isBursting ? 1.4 : 1,
                      opacity: isBursting ? 0 : 0.98,
                      rotate: [-3, 3, -3],
                    }}
                    transition={{
                      x: {
                        duration: isBursting ? 0.2 : 5 + (index % 3) * 0.8,
                        repeat: isBursting ? 0 : Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                      },
                      y: {
                        duration: isBursting ? 0.2 : 4.4 + (index % 3) * 0.7,
                        repeat: isBursting ? 0 : Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                      },
                      scale: { duration: isBursting ? 0.24 : 1.2, ease: "easeOut" },
                      opacity: { duration: isBursting ? 0.24 : 0.8 },
                    }}
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.94 }}
                    className="absolute cursor-pointer flex flex-col items-center justify-center select-none"
                    style={{
                      width: `${coord.size}px`,
                      height: `${coord.size}px`,
                      zIndex: 22,
                    }}
                    title="Tap to Pop! 🫧"
                  >
                    <div
                      className="relative w-full h-full rounded-full flex flex-col items-center justify-center transition-all duration-300"
                      style={{
                        background:
                          "radial-gradient(circle at 35% 25%, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.14) 28%, rgba(220,235,255,0.12) 60%, rgba(255,225,240,0.15) 85%, rgba(255,255,255,0.4) 100%)",
                        border: "1px solid rgba(255,255,255,0.55)",
                        boxShadow: "inset 0 0 16px rgba(255,255,255,0.38)",
                        backdropFilter: "blur(1.5px)",
                      }}
                    >
                      {/* Soap film rainbow rim */}
                      <div
                        className="absolute inset-1 rounded-full pointer-events-none opacity-45"
                        style={{
                          background:
                            "radial-gradient(circle at 65% 75%, transparent 60%, rgba(255,182,193,0.35) 75%, rgba(176,224,230,0.4) 90%, transparent 100%)",
                        }}
                      />

                      {/* Glossy highlight reflections */}
                      <div className="absolute top-3 left-4 w-6 h-3 rounded-full bg-white/75 -rotate-45 blur-[0.6px]" />
                      <div className="absolute bottom-3 right-4 w-3 h-2 rounded-full bg-white/45 -rotate-45" />

                      {/* Inside the Bubble: ONLY folded parchment paper if designated */}
                      {carriesPaper && (
                        <div
                          className="w-9 h-7 rounded-xs shadow-md border border-amber-300/70 flex flex-col items-center justify-center p-1 transform rotate-6 transition-transform group-hover:rotate-12"
                          style={{
                            background:
                              "linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)",
                          }}
                        >
                          <div className="w-5 h-[1.5px] bg-amber-400/80 mb-0.5 rounded-full" />
                          <div className="w-4 h-[1.5px] bg-amber-400/60 mb-0.5 rounded-full" />
                          <div className="w-3 h-[1.5px] bg-amber-400/50 rounded-full" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Soft Floating Glassmorphism Toast ── */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
            >
              <div className="px-5 py-2 rounded-full bg-black/60 backdrop-blur-2xl border border-amber-300/40 text-amber-100 text-xs font-semibold shadow-2xl flex items-center gap-2">
                <span>✨</span>
                <span>{toastMessage}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════════
            REVEALED ITEM MODAL: VINTAGE ROYAL RED & GOLD SCROLL
            ══════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {activeItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setActiveItem(null);
                setIsPlayingAudio(false);
              }}
              className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md pointer-events-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.88, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88, y: 30 }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-[490px] aspect-[768/1024] max-h-[92vh] flex flex-col items-center justify-center select-none"
                style={{
                  filter: "drop-shadow(0 25px 60px rgba(0,0,0,0.95))",
                }}
              >
                {/* ── Royal Red & Gold Scroll Background ── */}
                <img
                  src={imgRoyalScroll}
                  alt="Royal Red Velvet Scroll"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                  draggable={false}
                />

                {/* Close Button on Top Right Finial */}
                <button
                  onClick={() => {
                    setActiveItem(null);
                    setIsPlayingAudio(false);
                  }}
                  className="absolute top-1 right-2 sm:right-4 z-30 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-amber-300 border border-amber-400/60 backdrop-blur-md flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95 shadow-lg"
                  title="Close scroll"
                >
                  <X size={15} />
                </button>

                {/* ── Inner Scroll Content Area (Framed within inner gold filigree borders) ── */}
                <div
                  className="absolute inset-x-[15%] top-[12.5%] bottom-[13%] overflow-y-auto px-3 sm:px-4 py-2 sm:py-3 flex flex-col justify-between text-center select-text"
                  style={{
                    scrollbarWidth: "none",
                  }}
                >
                  {isEditingCardMessage ? (
                    /* ── EDIT MODE ON ROYAL SCROLL ── */
                    <div className="flex-1 flex flex-col justify-between py-1 w-full text-center">
                      {/* Edit Form Header */}
                      <div className="shrink-0 mb-1">
                        <span className="font-serif text-[10px] sm:text-[11px] font-bold text-amber-300/90 tracking-widest uppercase">
                          {theme === "putulkhela"
                            ? `${getPuppetForItem(activeItem, 0).nameBn} (${getPuppetForItem(activeItem, 0).nameEn})`
                            : "Puppet Memory"}
                        </span>
                        <h3 className="font-serif font-bold text-base sm:text-lg text-amber-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] mt-0.5">
                          Rewrite or Delete Memory ✍️
                        </h3>
                      </div>

                      {/* Form Fields */}
                      <div
                        className="flex-1 overflow-y-auto px-1 flex flex-col gap-2 text-left"
                        style={{ scrollbarWidth: "none" }}
                      >
                        {/* Title */}
                        <div>
                          <label className="text-[10px] font-serif font-bold text-amber-300/90 tracking-wider uppercase block mb-0.5">
                            Memory Title
                          </label>
                          <input
                            type="text"
                            value={editCardTitle}
                            onChange={(e) => setEditCardTitle(e.target.value)}
                            placeholder="e.g. Building Our Dreams"
                            className="w-full px-2.5 py-1 rounded-lg border border-amber-400/60 bg-black/60 text-amber-100 font-serif text-xs outline-none focus:border-amber-300"
                          />
                        </div>

                        {/* Sender */}
                        <div>
                          <label className="text-[10px] font-serif font-bold text-amber-300/90 tracking-wider uppercase block mb-0.5">
                            From (Sender Name)
                          </label>
                          <input
                            type="text"
                            value={editCardSender}
                            onChange={(e) => setEditCardSender(e.target.value)}
                            placeholder="e.g. Your Name (Optional)"
                            className="w-full px-2.5 py-1 rounded-lg border border-amber-400/60 bg-black/60 text-amber-100 font-serif text-xs outline-none focus:border-amber-300"
                          />
                        </div>

                        {/* Message Textarea (Height for at least 2 lines) */}
                        <div>
                          <label className="text-[10px] font-serif font-bold text-amber-300/90 tracking-wider uppercase block mb-0.5">
                            Secret Message / Words (At least 2 lines)
                          </label>
                          <textarea
                            rows={3}
                            style={{ minHeight: "72px" }}
                            value={editCardMessage}
                            onChange={(e) => setEditCardMessage(e.target.value)}
                            placeholder="Write your words, dreams, or wishes here..."
                            className="w-full min-h-[72px] px-3 py-2 rounded-xl border border-amber-400/70 bg-black/70 text-amber-100 font-['Caveat',cursive] text-lg sm:text-xl leading-relaxed outline-none focus:border-amber-300 resize-y"
                          />
                        </div>

                        {/* Stamp Emoji Selection */}
                        <div>
                          <label className="text-[10px] font-serif font-bold text-amber-300/90 tracking-wider uppercase block mb-1">
                            Stamp Emoji
                          </label>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {["💌", "💖", "🏛️", "🌟", "📖", "🏮", "🥂", "🌸", "✨", "🪆", "🎶", "🎭"].map((em) => (
                              <button
                                key={em}
                                type="button"
                                onClick={() => setEditCardEmoji(em)}
                                className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer ${
                                  editCardEmoji === em
                                    ? "bg-amber-400 text-amber-950 scale-110 shadow-md ring-2 ring-amber-300"
                                    : "bg-black/50 hover:bg-black/80 border border-amber-400/40 text-amber-100"
                                }`}
                              >
                                {em}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Attached Photo / Memory (File upload or Unsplash URL) */}
                        <div>
                          <label className="text-[10px] font-serif font-bold text-amber-300/90 tracking-wider uppercase block mb-1">
                            Photo Attachment (Optional)
                          </label>
                          {editCardPhotoUrl ? (
                            <div className="relative w-full max-h-36 aspect-[16/9] rounded-xl overflow-hidden border border-amber-400/60 mb-1.5 group bg-black/60">
                              <img
                                src={editCardPhotoUrl}
                                alt="Memory preview"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => setEditCardPhotoUrl("")}
                                className="absolute top-1.5 right-1.5 px-2 py-1 rounded-full bg-red-700/90 hover:bg-red-800 text-white text-[10px] font-serif font-bold flex items-center gap-1 cursor-pointer shadow-md transition-transform hover:scale-105 active:scale-95"
                                title="Remove this photo"
                              >
                                <Trash2 size={11} />
                                <span>Remove Photo</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => editCardPhotoInputRef.current?.click()}
                                disabled={isUploadingEditPhoto}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 text-[11px] font-serif font-semibold cursor-pointer shrink-0 transition-colors"
                              >
                                <Camera size={12} className="text-amber-400" />
                                <span>{isUploadingEditPhoto ? "Uploading..." : "Upload Photo"}</span>
                              </button>
                              <input
                                ref={editCardPhotoInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleEditPhotoUpload}
                                className="hidden"
                              />
                              <input
                                type="url"
                                placeholder="Or paste image / Unsplash URL"
                                value={editCardPhotoUrl}
                                onChange={(e) => setEditCardPhotoUrl(e.target.value)}
                                className="flex-1 px-2 py-1 rounded-lg border border-amber-400/40 bg-black/60 text-amber-100 font-serif text-[11px] placeholder-amber-400/40 outline-none"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons in Edit Mode */}
                      <div className="shrink-0 pt-2 border-t border-amber-400/30 flex flex-col items-center gap-2 mt-1">
                        <div className="flex items-center justify-center gap-2 w-full">
                          <button
                            type="button"
                            onClick={() => setIsEditingCardMessage(false)}
                            className="px-3.5 py-1 rounded-full text-[11px] font-serif font-semibold text-amber-200/80 bg-black/40 hover:bg-black/60 border border-amber-400/30 transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveCardMessage}
                            className="px-4 py-1 rounded-full text-[11px] font-serif font-bold text-amber-950 shadow-md border border-amber-200 cursor-pointer transition-all hover:scale-105 active:scale-95"
                            style={{
                              background: "linear-gradient(135deg, #fde047 0%, #f59e0b 50%, #d97706 100%)",
                            }}
                          >
                            Save Changes ✨
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={handleDeleteCardMessage}
                          className="flex items-center gap-1 text-[10px] font-serif text-rose-300/90 hover:text-rose-200 cursor-pointer transition-colors"
                        >
                          <Trash2 size={11} />
                          <span>Delete / Clear Message</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── VIEW MODE ON ROYAL SCROLL ── */
                    <>
                      {/* Top Header: Puppet info & Memory Title */}
                      <div className="flex flex-col items-center shrink-0">
                        <span className="font-serif text-[10px] sm:text-[11px] font-bold text-amber-300/90 tracking-widest uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                          {theme === "putulkhela"
                            ? `${getPuppetForItem(activeItem, 0).nameBn} (${getPuppetForItem(activeItem, 0).nameEn})`
                            : activeItem.date || "Secret Delivery"}
                        </span>

                        <h3 className="font-['Alex_Brush',cursive] text-2xl sm:text-3xl lg:text-4xl text-amber-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-tight mt-0.5">
                          {activeItem.title}
                        </h3>

                        {activeItem.sender && activeItem.sender !== "Your Special Person" && (
                          <p className="font-serif text-[10px] sm:text-[11px] text-amber-300/80 italic mt-0.5">
                            From: {activeItem.sender}
                          </p>
                        )}

                        {/* Ornate Gold Filigree Divider */}
                        <div className="flex items-center justify-center gap-2 text-amber-400/80 my-1 text-xs">
                          <span>❧</span>
                          <span className="w-12 h-[1px] bg-amber-400/40" />
                          <span>✦</span>
                          <span className="w-12 h-[1px] bg-amber-400/40" />
                          <span>☙</span>
                        </div>
                      </div>

                      {/* Body Content by Type */}
                      <div className="my-auto flex flex-col items-center justify-center py-1 w-full">
                        {/* 1. SONG: YouTube Player inside the Royal Scroll */}
                        {activeItem.type === "song" && (
                          <div className="w-full flex flex-col items-center gap-2">
                            {activeItem.youtubeId ? (
                              <div className="w-full aspect-video rounded-xl overflow-hidden border-2 border-amber-400/80 shadow-2xl bg-black relative">
                                <iframe
                                  ref={ytIframeRef}
                                  src={`https://www.youtube-nocookie.com/embed/${activeItem.youtubeId}?autoplay=1&enablejsapi=1&playsinline=1&rel=0&modestbranding=1`}
                                  title={activeItem.title}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="w-full h-full"
                                  onLoad={() => setIsPlayingAudio(true)}
                                />
                              </div>
                            ) : activeItem.audioUrl ? (
                              <div className="flex flex-col items-center gap-2.5 w-full py-2.5 px-3.5 rounded-2xl bg-black/50 border border-amber-400/50 shadow-inner">
                                {isVideoMedia(activeItem.audioUrl) ? (
                                  <video
                                    ref={videoPlayerRef}
                                    src={activeItem.audioUrl}
                                    loop
                                    autoPlay
                                    playsInline
                                    style={{ position: "fixed", top: -9999, left: -9999, width: 1, height: 1, opacity: 0.001, pointerEvents: "none" }}
                                    onPlay={() => setIsPlayingAudio(true)}
                                    onPause={() => setIsPlayingAudio(false)}
                                  />
                                ) : (
                                  <audio
                                    ref={audioPlayerRef}
                                    src={activeItem.audioUrl}
                                    loop
                                    autoPlay
                                    playsInline
                                    onPlay={() => setIsPlayingAudio(true)}
                                    onPause={() => setIsPlayingAudio(false)}
                                  />
                                )}

                                {/* Rotating Vinyl & Info */}
                                <div className="flex items-center gap-3 w-full">
                                  <motion.div
                                    animate={isPlayingAudio ? { rotate: 360 } : { rotate: 0 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="size-11 rounded-full bg-gradient-to-tr from-amber-700 via-amber-950 to-black border-2 border-amber-400/80 flex items-center justify-center shadow-lg shrink-0 relative"
                                  >
                                    <Disc size={24} className="text-amber-400/80" />
                                    <div className="absolute size-2.5 rounded-full bg-amber-400" />
                                  </motion.div>

                                  <div className="flex flex-col text-left flex-1 min-w-0">
                                    <span className="font-['Playfair_Display',serif] text-xs sm:text-sm text-amber-100 font-bold truncate">
                                      {activeItem.title}
                                    </span>
                                    <span className="text-[10px] text-amber-300/80 flex items-center gap-1 font-sans">
                                      <Sparkles size={10} className="text-amber-400 shrink-0" />
                                      <span className="truncate">
                                        {activeItem.songSource === "suno"
                                          ? "Suno AI Audio Track"
                                          : activeItem.artist || "Audio Track"}
                                      </span>
                                    </span>
                                  </div>

                                  {/* Play / Pause Toggle Button */}
                                  <button
                                    onClick={() => {
                                      const media = getActiveMedia();
                                      if (!media) return;
                                      if (isPlayingAudio) {
                                        media.pause();
                                        setIsPlayingAudio(false);
                                      } else {
                                        media.play().catch(() => {});
                                        setIsPlayingAudio(true);
                                      }
                                    }}
                                    className="size-8 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-amber-950 flex items-center justify-center font-bold shadow-md hover:scale-105 transition-transform cursor-pointer shrink-0"
                                  >
                                    {isPlayingAudio ? (
                                      <Pause size={13} fill="currentColor" />
                                    ) : (
                                      <Play size={13} fill="currentColor" className="ml-0.5" />
                                    )}
                                  </button>
                                </div>

                                {/* Soundwave Bars */}
                                <div className="flex items-center justify-center gap-1 h-3.5 w-full">
                                  {[0.3, 0.7, 1, 0.5, 0.9, 0.4, 0.8, 1, 0.6, 0.8, 0.4, 0.7].map((h, i) => (
                                    <motion.span
                                      key={i}
                                      className="w-1 rounded-full bg-amber-400/80"
                                      animate={
                                        isPlayingAudio
                                          ? { height: ["25%", `${Math.round(h * 100)}%`, "25%"] }
                                          : { height: "25%" }
                                      }
                                      transition={{
                                        duration: 0.5 + (i % 3) * 0.2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: i * 0.04,
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                            ) : null}

                            <div className="flex items-center gap-1.5 text-[11px] font-serif text-amber-200">
                              <Music size={12} className="text-amber-400" />
                              <span className="font-semibold">
                                {activeItem.songSource === "suno"
                                  ? "Suno AI Dedicated Track"
                                  : activeItem.artist || "Dedicated Song"}
                              </span>
                              <span>•</span>
                              <span className="text-emerald-400 font-medium">Plays in site with 0 redirect ✨</span>
                            </div>

                            {activeItem.message && (
                              <p className="font-['Caveat',cursive] text-base sm:text-lg text-amber-100/90 leading-snug px-1 mt-0.5">
                                "{activeItem.message}"
                              </p>
                            )}

                            {/* Quick Edit YouTube or Suno AI Link */}
                            <div className="w-full mt-1 pt-1 border-t border-amber-400/20 flex flex-col items-center">
                              {!isEditingYtOnCard ? (
                                <button
                                  onClick={() => setIsEditingYtOnCard(true)}
                                  className="flex items-center gap-1 text-[10px] font-serif font-semibold text-amber-300/80 hover:text-amber-200 cursor-pointer"
                                >
                                  <Edit3 size={11} />
                                  <span>{activeItem.youtubeId || activeItem.audioUrl ? "Change Song (YouTube or Suno AI)" : "Paste YouTube or Suno AI Link"}</span>
                                </button>
                              ) : (
                                <div className="w-full flex flex-col gap-1 mt-1">
                                  <input
                                    type="text"
                                    placeholder="Paste YouTube or Suno AI link: https://suno.com/song/..."
                                    value={cardYtInput}
                                    onChange={(e) => setCardYtInput(e.target.value)}
                                    className="w-full px-2.5 py-1 rounded-md border border-amber-400/60 bg-black/60 text-xs text-amber-100 placeholder-amber-400/50 outline-none"
                                  />
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => setIsEditingYtOnCard(false)}
                                      className="px-2 py-0.5 text-[10px] text-amber-300/70 hover:underline cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={handleSaveCardYt}
                                      className="px-2.5 py-0.5 rounded-md bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-[10px] cursor-pointer"
                                    >
                                      Save & Play
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 2. NOTE / DREAM: Handwritten Royal Letter */}
                        {(activeItem.type === "note" || activeItem.type === "dream") && (
                          <div
                            onClick={() => {
                              if (isReceiver) return;
                              setEditCardTitle(activeItem.title || "");
                              setEditCardSender(activeItem.sender && activeItem.sender !== "Your Special Person" ? activeItem.sender : "");
                              setEditCardMessage(activeItem.message || activeItem.photoCaption || "");
                              setEditCardEmoji(activeItem.stampEmoji || "💌");
                              setEditCardPhotoUrl(activeItem.photoUrl || "");
                              setIsEditingCardMessage(true);
                            }}
                            className={`flex flex-col items-center justify-center py-2 px-1 transition-all ${
                              !isReceiver ? "cursor-pointer hover:opacity-90" : ""
                            }`}
                            title={!isReceiver ? "Tap to edit message ✍️" : undefined}
                          >
                            <span className="text-2xl mb-1">{activeItem.stampEmoji || "💌"}</span>
                            {activeItem.photoUrl && (
                              <div className="w-full max-h-40 aspect-[16/9] rounded-xl overflow-hidden border border-amber-400/70 shadow-lg my-1.5 bg-black/50">
                                <img src={activeItem.photoUrl} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                            {activeItem.message ? (
                              <p className="font-['Caveat',cursive] text-2xl sm:text-3xl text-amber-100 leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] whitespace-pre-wrap">
                                "{activeItem.message}"
                              </p>
                            ) : (
                              <p className="font-serif italic text-xs text-amber-200/70 px-2 my-2">
                                (No message written yet. {!isReceiver ? "Tap to write one!" : ""})
                              </p>
                            )}
                          </div>
                        )}

                        {/* 3. VOICE NOTE */}
                        {activeItem.type === "voice" && (
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-700 text-amber-100 flex items-center justify-center shadow-lg border border-amber-300/50 mb-0.5">
                              <Mic size={22} className="animate-pulse" />
                            </div>
                            <p className="font-serif text-[11px] text-amber-200 font-bold uppercase tracking-wider">
                              Personal Voice Whisper (~{activeItem.voiceDuration || 8}s)
                            </p>

                            {activeItem.voiceUrl ? (
                              <div className="flex flex-col items-center gap-1.5 w-full">
                                <audio
                                  ref={audioPlayerRef}
                                  src={activeItem.voiceUrl}
                                  onPlay={() => setIsPlayingAudio(true)}
                                  onPause={() => setIsPlayingAudio(false)}
                                  onEnded={() => setIsPlayingAudio(false)}
                                />
                                <button
                                  onClick={() => {
                                    if (!audioPlayerRef.current) return;
                                    if (isPlayingAudio) {
                                      audioPlayerRef.current.pause();
                                      setIsPlayingAudio(false);
                                    } else {
                                      audioPlayerRef.current.play();
                                      setIsPlayingAudio(true);
                                    }
                                  }}
                                  className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-700 text-amber-100 font-serif font-bold text-xs shadow-md border border-amber-300/40 cursor-pointer"
                                >
                                  {isPlayingAudio ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
                                  <span>{isPlayingAudio ? "Pause Recording" : "Listen to Voice Note"}</span>
                                </button>
                              </div>
                            ) : (
                              <p className="font-serif italic text-xs text-amber-200/80 px-2">
                                "A little personal voice note recorded just for you."
                              </p>
                            )}

                            {activeItem.message && (
                              <p className="font-['Caveat',cursive] text-base sm:text-lg text-amber-100/90 leading-snug px-1 mt-1">
                                "{activeItem.message}"
                              </p>
                            )}
                          </div>
                        )}

                        {/* 4. PHOTO */}
                        {activeItem.type === "photo" && (
                          <div className="flex flex-col items-center gap-2 w-full">
                            {/* Clickable Photo Frame */}
                            <div
                              onClick={() => {
                                if (isReceiver) return;
                                cardPhotoInputRef.current?.click();
                              }}
                              className={`relative group w-full max-h-48 aspect-[4/3] rounded-xl overflow-hidden border-2 border-amber-400/80 shadow-2xl bg-black/50 transition-all ${
                                !isReceiver ? "cursor-pointer hover:border-amber-300" : ""
                              }`}
                              title={!isReceiver ? "Click to upload or change photo" : undefined}
                            >
                              {activeItem.photoUrl ? (
                                <img
                                  src={activeItem.photoUrl}
                                  alt={activeItem.title}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-amber-300 gap-2 p-4 text-center bg-gradient-to-b from-amber-950/60 to-black/80">
                                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                                    <Camera size={26} />
                                  </div>
                                  <span className="text-xs font-serif font-bold tracking-wide">
                                    {!isReceiver ? "Tap here to upload a photo 📸" : "A Cherished Moment"}
                                  </span>
                                  {!isReceiver && (
                                    <span className="text-[10px] text-amber-200/70">
                                      (Supports JPG, PNG, WEBP from phone or PC)
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Hover Overlay when photo already exists (only for sender) */}
                              {activeItem.photoUrl && !isReceiver && (
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-white p-2 text-center backdrop-blur-xs">
                                  <Camera size={22} className="text-amber-400" />
                                  <span className="text-xs font-semibold font-serif text-amber-200">
                                    Click to change photo
                                  </span>
                                </div>
                              )}

                              {/* Uploading Spinner */}
                              {isUploadingCardPhoto && (
                                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2 text-amber-300 z-10">
                                  <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                                  <span className="text-xs font-serif font-bold">Uploading photo... ✨</span>
                                </div>
                              )}
                            </div>

                            {/* Hidden Native File Input */}
                            <input
                              ref={cardPhotoInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleCardPhotoUpload}
                              className="hidden"
                            />

                            {/* Action Buttons & Link Editor (hidden for receiver) */}
                            {!isReceiver && (
                              <div className="w-full flex flex-col items-center gap-1">
                                {!isEditingPhotoOnCard ? (
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <button
                                      type="button"
                                      onClick={() => cardPhotoInputRef.current?.click()}
                                      className="flex items-center gap-1 text-[11px] font-serif font-semibold text-amber-300/90 hover:text-amber-100 transition-colors cursor-pointer bg-black/30 hover:bg-black/50 px-2.5 py-1 rounded-full border border-amber-400/40"
                                    >
                                      <Upload size={11} />
                                      <span>{activeItem.photoUrl ? "Change Photo File" : "Upload Photo File"}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCardPhotoUrlInput(activeItem.photoUrl || "");
                                        setCardPhotoCaptionInput(activeItem.photoCaption || activeItem.message || "");
                                        setIsEditingPhotoOnCard(true);
                                      }}
                                      className="flex items-center gap-1 text-[11px] font-serif font-semibold text-amber-300/80 hover:text-amber-100 transition-colors cursor-pointer"
                                    >
                                      <Edit3 size={11} />
                                      <span>Paste Link / Caption</span>
                                    </button>
                                  </div>
                                ) : (
                                  <div className="w-full flex flex-col gap-1.5 mt-1 p-2 rounded-xl bg-black/60 border border-amber-400/40">
                                    <input
                                      type="url"
                                      placeholder="Paste image or Unsplash link: https://..."
                                      value={cardPhotoUrlInput}
                                      onChange={(e) => setCardPhotoUrlInput(e.target.value)}
                                      className="w-full px-2.5 py-1 rounded-md border border-amber-400/50 bg-black/60 text-xs text-amber-100 placeholder-amber-400/40 outline-none"
                                    />
                                    <textarea
                                      rows={2}
                                      style={{ minHeight: "50px" }}
                                      placeholder="Write photo caption (at least 2 lines)..."
                                      value={cardPhotoCaptionInput}
                                      onChange={(e) => setCardPhotoCaptionInput(e.target.value)}
                                      className="w-full min-h-[50px] px-2.5 py-1 rounded-md border border-amber-400/50 bg-black/60 text-xs text-amber-100 placeholder-amber-400/40 outline-none resize-none font-['Caveat',cursive] text-base"
                                    />
                                    <div className="flex items-center justify-end gap-2 pt-0.5">
                                      <button
                                        type="button"
                                        onClick={() => setIsEditingPhotoOnCard(false)}
                                        className="px-2 py-0.5 text-[10px] text-amber-300/70 hover:underline cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        onClick={handleSaveCardPhoto}
                                        className="px-2.5 py-0.5 rounded-md bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-[10px] cursor-pointer"
                                      >
                                        Save Photo
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Displayed Caption */}
                            {(activeItem.photoCaption || activeItem.message) ? (
                              <p
                                onClick={() => {
                                  if (isReceiver) return;
                                  setEditCardTitle(activeItem.title || "");
                                  setEditCardSender(activeItem.sender && activeItem.sender !== "Your Special Person" ? activeItem.sender : "");
                                  setEditCardMessage(activeItem.message || activeItem.photoCaption || "");
                                  setEditCardEmoji(activeItem.stampEmoji || "💌");
                                  setEditCardPhotoUrl(activeItem.photoUrl || "");
                                  setIsEditingCardMessage(true);
                                }}
                                className={`font-['Caveat',cursive] text-xl text-amber-100 leading-snug px-2 text-center transition-all ${
                                  !isReceiver ? "cursor-pointer hover:opacity-90" : ""
                                }`}
                                title={!isReceiver ? "Tap to edit caption ✍️" : undefined}
                              >
                                "{activeItem.photoCaption || activeItem.message}"
                              </p>
                            ) : (
                              <p
                                onClick={() => {
                                  if (isReceiver) return;
                                  setEditCardTitle(activeItem.title || "");
                                  setEditCardSender(activeItem.sender && activeItem.sender !== "Your Special Person" ? activeItem.sender : "");
                                  setEditCardMessage(activeItem.message || activeItem.photoCaption || "");
                                  setEditCardEmoji(activeItem.stampEmoji || "💌");
                                  setEditCardPhotoUrl(activeItem.photoUrl || "");
                                  setIsEditingCardMessage(true);
                                }}
                                className={`font-serif italic text-xs text-amber-200/70 px-2 my-1 text-center ${
                                  !isReceiver ? "cursor-pointer hover:underline" : ""
                                }`}
                                title={!isReceiver ? "Tap to edit caption ✍️" : undefined}
                              >
                                (No caption yet. {!isReceiver ? "Tap to write one!" : ""})
                              </p>
                            )}
                          </div>
                        )}

                        {/* 5. SURPRISE */}
                        {activeItem.type === "surprise" && (
                          <div
                            onClick={() => {
                              if (isReceiver) return;
                              setEditCardTitle(activeItem.title || "");
                              setEditCardSender(activeItem.sender && activeItem.sender !== "Your Special Person" ? activeItem.sender : "");
                              setEditCardMessage(activeItem.message || activeItem.photoCaption || "");
                              setEditCardEmoji(activeItem.stampEmoji || "💌");
                              setEditCardPhotoUrl(activeItem.photoUrl || "");
                              setIsEditingCardMessage(true);
                            }}
                            className={`flex flex-col items-center justify-center gap-2 py-2 transition-all ${
                              !isReceiver ? "cursor-pointer hover:opacity-90" : ""
                            }`}
                            title={!isReceiver ? "Tap to edit message ✍️" : undefined}
                          >
                            <span className="text-3xl animate-bounce">✨</span>
                            {activeItem.photoUrl && (
                              <div className="w-full max-h-40 aspect-[16/9] rounded-xl overflow-hidden border border-amber-400/70 shadow-lg my-1 bg-black/50">
                                <img src={activeItem.photoUrl} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                            {activeItem.message ? (
                              <p className="font-['Caveat',cursive] text-2xl sm:text-3xl text-amber-100 leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                                "{activeItem.message}"
                              </p>
                            ) : (
                              <p className="font-serif italic text-xs text-amber-200/70 px-2 my-2">
                                (No surprise message yet. {!isReceiver ? "Tap to add one!" : ""})
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* ── Universal Edit & Delete Action Row for All Puppets / Cards (Hidden for receiver) ── */}
                      {!isReceiver && (
                        <div className="flex items-center justify-center gap-2 my-1 pt-1.5 border-t border-amber-400/25 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditCardTitle(activeItem.title || "");
                              setEditCardSender(activeItem.sender && activeItem.sender !== "Your Special Person" ? activeItem.sender : "");
                              setEditCardMessage(activeItem.message || activeItem.photoCaption || "");
                              setEditCardEmoji(activeItem.stampEmoji || "💌");
                              setEditCardPhotoUrl(activeItem.photoUrl || "");
                              setIsEditingCardMessage(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/45 hover:bg-black/70 text-amber-200 border border-amber-400/40 text-[11px] font-serif font-semibold shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                          >
                            <Edit3 size={12} className="text-amber-400" />
                            <span>Edit Message ✍️</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleDeleteCardMessage}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/40 hover:bg-rose-950/70 text-rose-300 border border-rose-400/35 text-[11px] font-serif font-semibold shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                            title="Delete or clear this message"
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}

                      {/* Bottom Footer inside Scroll */}
                      <div className="flex flex-col items-center shrink-0 mt-2">
                        <button
                          onClick={() => {
                            setActiveItem(null);
                            setIsPlayingAudio(false);
                          }}
                          className="mt-1.5 px-6 py-1 rounded-full text-[11px] font-serif font-bold text-amber-950 shadow-[0_4px_16px_rgba(251,191,36,0.4)] border border-amber-200 cursor-pointer backdrop-blur-md transition-all hover:scale-105 active:scale-95"
                          style={{
                            background: "linear-gradient(135deg, #fde047 0%, #f59e0b 50%, #d97706 100%)",
                          }}
                        >
                          Back to Stage 🎭
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════════
            CREATOR MODAL: ADD / CUSTOMIZE MEMORY (PUPPET OR BUBBLE)
            ══════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md pointer-events-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 25 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl w-full max-w-[530px] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-amber-200"
              >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-amber-50/60">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🪆</span>
                    <div>
                      <h3 className="font-serif font-bold text-gray-900 text-sm">
                        {theme === "putulkhela"
                          ? "Add Memory to Bengali Putul Khela"
                          : "Create Floating Memory Bubble"}
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        {theme === "putulkhela"
                          ? "Attach songs, voice notes, photos, or secret notes to puppets"
                          : "Sender adds surprise capsules for the receiver to pop"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsAdding(false)}
                    className="w-7 h-7 rounded-full bg-gray-200/80 hover:bg-gray-300 text-gray-700 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Category Selection Tabs */}
                <div className="grid grid-cols-6 gap-1 p-2 bg-gray-100/80 border-b border-gray-200 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => handleTabChange("song")}
                    className={`py-2 px-1 rounded-xl transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      addTab === "song"
                        ? "bg-white text-amber-700 shadow-xs border border-amber-200 font-bold"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <Music size={14} />
                    <span>Song 🎵</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabChange("voice")}
                    className={`py-2 px-1 rounded-xl transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      addTab === "voice"
                        ? "bg-white text-amber-700 shadow-xs border border-amber-200 font-bold"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <Mic size={14} />
                    <span>Voice 🎙️</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabChange("note")}
                    className={`py-2 px-1 rounded-xl transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      addTab === "note"
                        ? "bg-white text-amber-700 shadow-xs border border-amber-200 font-bold"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <Mail size={14} />
                    <span>Note 💌</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabChange("dream")}
                    className={`py-2 px-1 rounded-xl transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      addTab === "dream"
                        ? "bg-white text-amber-700 shadow-xs border border-amber-200 font-bold"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <Sparkles size={14} />
                    <span>Dream 💫</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabChange("photo")}
                    className={`py-2 px-1 rounded-xl transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      addTab === "photo"
                        ? "bg-white text-amber-700 shadow-xs border border-amber-200 font-bold"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <Camera size={14} />
                    <span>Photo 📸</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabChange("surprise")}
                    className={`py-2 px-1 rounded-xl transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      addTab === "surprise"
                        ? "bg-white text-amber-700 shadow-xs border border-amber-200 font-bold"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <Sparkles size={14} />
                    <span>Surprise ✨</span>
                  </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-3.5 text-xs text-[#3d202b]">
                  {/* Choose Puppet Character */}
                  {theme === "putulkhela" && (
                    <div>
                      <label className="font-bold text-amber-950 block mb-1">
                        Select Puppet Character for this Memory:
                      </label>
                      <div className="grid grid-cols-5 gap-1.5 p-2 bg-amber-50/70 rounded-2xl border border-amber-200/70">
                        {Object.values(PUPPET_CATALOG).map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setNewPuppetId(p.id)}
                            className={`flex flex-col items-center p-1 rounded-xl transition-all cursor-pointer ${
                              newPuppetId === p.id
                                ? "bg-white shadow-md border-2 border-amber-500 scale-105"
                                : "opacity-70 hover:opacity-100 hover:bg-white/60"
                            }`}
                          >
                            <img src={p.src} alt={p.nameEn} className="w-10 h-10 object-contain" />
                            <span className="text-[10px] font-bold text-gray-800 truncate max-w-[55px] mt-0.5">
                              {p.nameBn}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Title *</label>
                    <input
                      type="text"
                      placeholder={
                        addTab === "song"
                          ? "e.g. Our Dedicated Song"
                          : addTab === "voice"
                          ? "e.g. A Voice Note For Your Birthday"
                          : addTab === "photo"
                          ? "e.g. Sunset In The Hills"
                          : addTab === "surprise"
                          ? "e.g. A Sweet Hug"
                          : "e.g. A Secret Love Note"
                      }
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 focus:border-amber-400 outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">
                      From (Your Name or Signature)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Your Name (Optional)"
                      value={newSender}
                      onChange={(e) => setNewSender(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 focus:border-amber-400 outline-none text-xs"
                    />
                  </div>

                  {/* ── Prominent YouTube Song Link Section ── */}
                  {addTab === "song" && (
                    <div className="flex flex-col gap-3 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-300">
                      <div>
                        <label className="font-bold text-amber-950 flex items-center justify-between mb-1">
                          <span className="flex items-center gap-1.5">
                            <Music size={14} className="text-amber-600" />
                            <span>YouTube Song Link (Plays in App • Zero Redirect)</span>
                          </span>
                        </label>
                        <input
                          type="text"
                          placeholder="Paste YouTube link (e.g. https://www.youtube.com/watch?v=...)"
                          value={newYoutubeUrl}
                          onChange={(e) => setNewYoutubeUrl(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white focus:border-amber-500 outline-none text-xs"
                        />

                        {/* Live Suno AI Detection & Tip */}
                        {isSunoUrl(newYoutubeUrl) ? (
                          <div className="mt-2.5 p-2.5 rounded-xl bg-purple-50 border border-purple-300 flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-xs">
                              AI 🎵
                            </div>
                            <div className="flex flex-col text-left">
                              <p className="text-[11px] text-purple-900 font-bold flex items-center gap-1">
                                <Sparkles size={12} className="text-purple-600" />
                                <span>Suno AI Song</span>
                              </p>
                              <p className="text-[10px] text-purple-700 leading-snug">
                                💡 <span className="font-semibold">Recommended:</span> In Suno, click <span className="font-bold">...</span> ➔ <span className="font-bold">Download</span> ➔ <span className="font-bold">Audio</span>, then click "Upload MP3 or Audio" below to save it permanently in cloud storage!
                              </p>
                            </div>
                          </div>
                        ) : extractYouTubeId(newYoutubeUrl) ? (
                          <div className="mt-2.5 p-2 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center gap-3">
                            <img
                              src={`https://img.youtube.com/vi/${extractYouTubeId(newYoutubeUrl)}/mqdefault.jpg`}
                              alt="Thumbnail preview"
                              className="w-16 h-10 object-cover rounded-md border border-emerald-400/50 shadow-xs"
                            />
                            <div className="flex flex-col text-left">
                              <p className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                                <Check size={12} className="text-emerald-600" />
                                <span>YouTube Song Connected!</span>
                              </p>
                              <p className="text-[10px] text-emerald-700">
                                The receiver will hear this song directly in our site without being redirected to YouTube!
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[10px] text-amber-800 mt-1 italic">
                            Tip: Paste any Suno AI link (e.g. suno.com/song/...) or YouTube link — streams natively in background!
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-gray-400 text-[10px] uppercase font-bold my-0.5">
                        <span className="flex-1 h-[1px] bg-gray-200" />
                        <span>OR UPLOAD AUDIO FILE</span>
                        <span className="flex-1 h-[1px] bg-gray-200" />
                      </div>

                      <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-amber-300 bg-white hover:bg-amber-50 cursor-pointer transition-colors text-amber-800 font-semibold text-xs">
                        <Upload size={14} />
                        <span>{newAudioUrl ? "Audio File Loaded! ✅" : "Upload MP3 or Audio"}</span>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleAudioUpload}
                          className="hidden"
                        />
                      </label>

                      <div>
                        <label className="font-bold text-gray-700 block mb-1">
                          Artist Name / Dedication (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Arijit Singh / Rabindrasangeet"
                          value={newArtist}
                          onChange={(e) => setNewArtist(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-amber-200 focus:border-amber-400 outline-none text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {/* Voice Tab */}
                  {addTab === "voice" && (
                    <div className="flex flex-col gap-3 p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-center">
                      <p className="font-bold text-amber-900 text-xs">Record Live Voice Note</p>
                      <div className="flex flex-col items-center gap-2">
                        {!isRecording ? (
                          <button
                            type="button"
                            onClick={startRecording}
                            className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                          >
                            <Mic size={24} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={stopRecording}
                            className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg animate-pulse active:scale-95 transition-all cursor-pointer"
                          >
                            <span className="w-5 h-5 rounded-xs bg-white" />
                          </button>
                        )}

                        <span className="text-xs font-bold text-gray-700">
                          {isRecording
                            ? `Recording: 0:${recordingSeconds.toString().padStart(2, "0")} (Tap to Stop)`
                            : newAudioUrl
                            ? "Voice Note Recorded! ✅ Tap mic to re-record"
                            : "Tap mic to start recording"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-400 text-[10px] uppercase font-bold my-1">
                        <span className="flex-1 h-[1px] bg-gray-200" />
                        <span>OR UPLOAD AUDIO</span>
                        <span className="flex-1 h-[1px] bg-gray-200" />
                      </div>

                      <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-amber-300 bg-white hover:bg-amber-50 cursor-pointer text-amber-800 font-semibold text-xs">
                        <Upload size={13} />
                        <span>Upload Voice Audio File</span>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleAudioUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}

                  {/* Photo Tab */}
                  {addTab === "photo" && (
                    <div className="flex flex-col gap-3 p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/60">
                      <label className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-amber-300 bg-white hover:bg-amber-50 cursor-pointer text-amber-800 font-semibold text-xs transition-colors">
                        {newPhotoUrl ? (
                          <div className="relative group">
                            <img
                              src={newPhotoUrl}
                              alt="Preview"
                              className="max-h-36 object-contain rounded-lg shadow-sm"
                            />
                            <div className="absolute inset-0 bg-black/40 text-white text-[11px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-lg transition-opacity">
                              Click to choose a different photo
                            </div>
                          </div>
                        ) : isUploadingPhoto ? (
                          <div className="flex flex-col items-center gap-2 py-3">
                            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-amber-800 font-medium">Processing photo... ✨</span>
                          </div>
                        ) : (
                          <>
                            <Camera size={26} className="text-amber-500" />
                            <span>Select Photo File (Click to browse)</span>
                            <span className="text-[10px] text-amber-600/70">JPG, PNG, WEBP supported</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>

                      {/* Or paste direct image URL */}
                      <div>
                        <div className="flex items-center gap-2 text-gray-400 text-[10px] uppercase font-bold my-1">
                          <span className="flex-1 h-[1px] bg-gray-200" />
                          <span>OR PASTE IMAGE / UNSPLASH LINK</span>
                          <span className="flex-1 h-[1px] bg-gray-200" />
                        </div>
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/... or any photo link"
                          value={newPhotoUrl && newPhotoUrl.startsWith("http") ? newPhotoUrl : ""}
                          onChange={(e) => setNewPhotoUrl(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-amber-200 focus:border-amber-400 outline-none text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-gray-700 block mb-1">
                          Photo Caption (Vintage Polaroid style, at least 2 lines)
                        </label>
                        <textarea
                          rows={2}
                          style={{ minHeight: "50px" }}
                          placeholder="e.g. That magical evening under the festival lights ✨"
                          value={newPhotoCaption}
                          onChange={(e) => setNewPhotoCaption(e.target.value)}
                          className="w-full min-h-[50px] px-3 py-2 rounded-xl border border-amber-200 focus:border-amber-400 outline-none text-xs resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Message & Content */}
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">
                      {addTab === "note" || addTab === "dream"
                        ? "Special Note Message (At least 2 lines) *"
                        : addTab === "surprise"
                        ? "Surprise Pop Message (At least 2 lines) *"
                        : "Personal Message / Dedication (Optional, at least 2 lines)"}
                    </label>
                    <textarea
                      rows={3}
                      style={{ minHeight: "68px" }}
                      placeholder={
                        addTab === "note" || addTab === "dream"
                          ? "Write your secret love note, dream, or personal promise..."
                          : addTab === "surprise"
                          ? "e.g. Sending you 1,000 warm birthday hugs and sunshine today! 🤗💖"
                          : "Write a warm message to accompany this memory..."
                      }
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="w-full min-h-[68px] px-3.5 py-2.5 rounded-xl border border-amber-200 focus:border-amber-400 outline-none text-xs resize-y"
                    />
                  </div>

                  {/* Emoji selector for notes */}
                  {(addTab === "note" || addTab === "dream") && (
                    <div>
                      <label className="font-bold text-gray-700 block mb-1.5">Stamp Emoji</label>
                      <div className="flex items-center gap-2">
                        {["💌", "💖", "💫", "✨", "🌸", "🥂", "🏰", "🥐"].map((em) => (
                          <button
                            key={em}
                            type="button"
                            onClick={() => setNewEmoji(em)}
                            className={`w-8 h-8 rounded-full text-base flex items-center justify-center transition-all cursor-pointer ${
                              newEmoji === em
                                ? "bg-amber-500 text-white scale-110 shadow-sm"
                                : "bg-gray-100 hover:bg-amber-100"
                            }`}
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveNewItem}
                    disabled={!newTitle.trim()}
                    className="px-5 py-2 rounded-full text-white font-bold text-xs shadow-md hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
                    style={{
                      background:
                        theme === "putulkhela"
                          ? "linear-gradient(135deg, #d97706, #b45309)"
                          : "linear-gradient(135deg, #ec4899, #f43f5e)",
                    }}
                  >
                    <Sparkles size={14} />
                    <span>{theme === "putulkhela" ? "Add to Puppet Stage 🪆" : "Create Memory Bubble 🫧"}</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
