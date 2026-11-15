import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  Share2,
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  RotateCcw,
  ArrowLeft,
  Heart,
  PartyPopper,
  Palette,
  Music,
  Play,
  Pause,
  Upload,
  Disc,
  Mail,
} from "lucide-react";
import {
  createShareLink,
  loadGiftProject,
  persistGiftProject,
  saveGiftProject,
  uploadGiftFile,
  loadCloudGiftProject,
  isSupabaseConfigured,
} from "../giftStore";
import { extractYouTubeId, extractSunoAudioUrl, isVideoMedia } from "../utils/audioUtils";
import { uploadAudioToCloud } from "../utils/audioCloudUpload";
import { saveAudioBlob, getAudioObjectUrl, resolveAudioPlaybackUrl } from "../utils/audioStorage";
import { preloadProjectAudios, getPreloadedAudioUrl } from "../utils/audioPreloader";
import { useDynamicLetterFont, type LetterFontStyle } from "./useDynamicLetterFont";
import { MailboxModal } from "./MailboxModal";
import { ShareModal } from "./ShareModal";

/* ── Real Room & Cake Assets ── */
import imgRoomEmpty from "../../imports/room1.png";
import imgLetterPaper from "../../imports/letter_paper.png";
import imgCake1 from "../../imports/cake1.png";
import imgCake2 from "../../imports/cake2.png";
import imgCake3 from "../../imports/cake3.png";
import imgCake4 from "../../imports/cake4.png";

import imgRoomCake1 from "../../imports/room1_cake1.png";
import imgRoomCake2 from "../../imports/room1_cake2.png";
import imgRoomCake3 from "../../imports/room1_cake3.png";
import imgRoomCake4 from "../../imports/room1_cake4.png";

/* ── Default Celebration Birthday Song ── */
import defaultBirthdaySong from "../../imports/birthday_celebration_custom.m4a";

type CakeKey = "cake1" | "cake2" | "cake3" | "cake4";

interface CakeOption {
  id: CakeKey;
  name: string;
  subtitle: string;
  tag: string;
  previewSrc: string;
  roomSrc: string;
  themeColor: string;
}

const cakes: CakeOption[] = [
  {
    id: "cake1",
    name: "Chocolate Fudge Celebration",
    subtitle: "Rich cocoa fudge with rainbow sprinkles & birthday candles",
    tag: "🍫 Classic & Festive",
    previewSrc: imgCake1,
    roomSrc: imgRoomCake1,
    themeColor: "#ff9770",
  },
  {
    id: "cake2",
    name: "Red Velvet Cream Rosette",
    subtitle: "Ruby red velvet layers & sweet piped cream cheese rosettes",
    tag: "🌹 Romantic & Sweet",
    previewSrc: imgCake2,
    roomSrc: imgRoomCake2,
    themeColor: "#ff70a6",
  },
  {
    id: "cake3",
    name: "Belgian Chocolate Mirror Glaze",
    subtitle: "Glossy dark ganache with gold ribbon & praline crunch",
    tag: "✨ Luxe & Modern",
    previewSrc: imgCake3,
    roomSrc: imgRoomCake3,
    themeColor: "#ffd166",
  },
  {
    id: "cake4",
    name: "Golden Caramel Birthday Crown",
    subtitle: "Caramel praline with golden celebration spheres & topper",
    tag: "👑 Royal & Elegant",
    previewSrc: imgCake4,
    roomSrc: imgRoomCake4,
    themeColor: "#f6c453",
  },
];

/* ── Confetti Particle Effect ── */
interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  shape: "rect" | "circle";
}

const CONFETTI_COLORS = [
  "#f6c453",
  "#ff70a6",
  "#ff9770",
  "#ffd670",
  "#e9ff70",
  "#70d6ff",
  "#c77dff",
  "#ffffff",
];

function ConfettiCannon({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    if (!active) return;

    const newParticles: ConfettiParticle[] = Array.from({ length: 75 }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / 75 + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * 550 + 200;
      return {
        id: Math.random(),
        x: 54, // Centered right around cake position
        y: 52,
        vx: Math.cos(angle) * (speed * 0.08),
        vy: (Math.sin(angle) * (speed * 0.08) - Math.random() * 12) * 0.9,
        size: Math.random() * 9 + 6,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
        shape: Math.random() > 0.4 ? "rect" : "circle",
      };
    });

    setParticles(newParticles);
    const timer = setTimeout(() => setParticles([]), 4000);
    return () => clearTimeout(timer);
  }, [active]);

  if (!particles.length) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: 1,
            scale: 0.2,
            rotate: p.rotation,
          }}
          animate={{
            left: `${p.x + p.vx * 3.5}%`,
            top: `${p.y + p.vy * 4 + 40}%`,
            opacity: 0,
            scale: 1,
            rotate: p.rotation + p.rotationSpeed * 40,
          }}
          transition={{ duration: 3.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.shape === "rect" ? p.size * 1.5 : p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === "circle" ? "50%" : "2px",
            boxShadow: `0 0 8px ${p.color}80`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Interactive Candle Flame Highlights ── */
function FlameOverlay({
  isLit,
  coords,
}: {
  isLit: boolean;
  coords: { x: number; y: number; delay: number }[];
}) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {coords.map((c, idx) => (
        <div
          key={idx}
          className="absolute flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${c.x}%`, top: `${c.y}%` }}
        >
          <AnimatePresence>
            {isLit ? (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [1, 1.15, 0.95, 1.08, 1],
                  opacity: [0.85, 1, 0.8, 0.95, 0.85],
                }}
                exit={{
                  scale: [1, 1.4, 0],
                  opacity: [1, 0.6, 0],
                  y: -10,
                  transition: { duration: 0.35 },
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  delay: c.delay,
                  ease: "easeInOut",
                }}
                className="w-4 h-6 rounded-full bg-amber-400/50 blur-[3px]"
                style={{
                  boxShadow: "0 0 16px rgba(255, 180, 50, 0.8), 0 0 30px rgba(255, 120, 0, 0.5)",
                }}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0.7, scale: 0.4, y: 0 }}
                animate={{ opacity: 0, scale: 2, y: -24 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="w-2.5 h-2.5 rounded-full bg-slate-200/50 blur-[2px]"
              />
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

/* ── Floating Musical Notes Particle Animation ── */
function FloatingMusicalNotes({ active }: { active: boolean }) {
  const notes = ["♪", "♫", "♩", "♬", "✨", "💖"];
  const [floatingNotes, setFloatingNotes] = useState<
    { id: number; symbol: string; left: number; delay: number; duration: number }[]
  >([]);

  useEffect(() => {
    if (!active) {
      setFloatingNotes([]);
      return;
    }

    const interval = setInterval(() => {
      setFloatingNotes((prev) => [
        ...prev.slice(-10),
        {
          id: Math.random(),
          symbol: notes[Math.floor(Math.random() * notes.length)],
          left: Math.random() * 40 + 30, // Between 30% and 70% width
          delay: 0,
          duration: Math.random() * 2 + 3,
        },
      ]);
    }, 900);

    return () => clearInterval(interval);
  }, [active]);

  if (!active || !floatingNotes.length) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {floatingNotes.map((n) => (
        <motion.div
          key={n.id}
          initial={{
            bottom: "22%",
            left: `${n.left}%`,
            opacity: 0,
            scale: 0.6,
            y: 0,
          }}
          animate={{
            bottom: "80%",
            opacity: [0, 0.9, 0.8, 0],
            scale: [0.6, 1.1, 1],
            x: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 60],
          }}
          transition={{ duration: n.duration, ease: "easeOut" }}
          className="absolute text-pink-300 font-bold text-lg select-none drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]"
        >
          {n.symbol}
        </motion.div>
      ))}
    </div>
  );
}

/* ═════════════════════════════════════════════
   Main Room Page Component
   ═════════════════════════════════════════════ */
export default function RoomPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState =
    (location.state as {
      name: string;
      occasion: string;
      relationship: string;
      wish: string;
      letterFont?: "caveat" | "dancing" | "playfair";
    }) || {};

  const [project, setProject] = useState(() => {
    const saved = loadGiftProject();
    return saveGiftProject({
      ...saved,
      recipient: routeState.name || saved.recipient,
      occasion: routeState.occasion || saved.occasion,
      relationship: routeState.relationship || saved.relationship,
      wish: routeState.wish || saved.wish,
      letterFont: routeState.letterFont || saved.letterFont || "caveat",
    });
  });

  const { recipient: name, occasion, relationship, wish } = project;

  // Determine if viewing as the receiver
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

  const projectRef = useRef(project);
  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  // Fetch latest project from Supabase on mount / page refresh (for both sender and receiver)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const hashQuery = typeof window !== "undefined" && window.location.hash.includes("?")
      ? new URLSearchParams(window.location.hash.substring(window.location.hash.indexOf("?")))
      : null;
    const targetId =
      searchParams.get("id") ||
      hashQuery?.get("id") ||
      giftParam ||
      (project.supabaseId || project.projectId);
    if (!targetId) return;
    loadCloudGiftProject(targetId)
      .then((loaded) => {
        setProject(loaded);
        projectRef.current = loaded;
        if (loaded.cake) {
          setSelectedCake(resolveCakeKey(loaded.cake));
        }
        preloadProjectAudios(loaded);
      })
      .catch(() => {});
  }, [giftParam, project.projectId, project.supabaseId, location.search, location.hash]);

  // Preload all audio assets into browser cache for seamless instant playback
  useEffect(() => {
    if (project) {
      preloadProjectAudios(project);
    }
  }, [project.customSongUrl, project.mailboxItems]);

  // Resolve cake ID from project
  const resolveCakeKey = (val: string | null): CakeKey => {
    if (val === "cake2" || val === "butterfly") return "cake2";
    if (val === "cake3" || val === "chocolate") return "cake3";
    if (val === "cake4" || val === "decorated") return "cake4";
    return "cake1";
  };

  const initialCake = resolveCakeKey(project.cake);
  const [selectedCake, setSelectedCake] = useState<CakeKey>(initialCake);
  const [hoveredCake, setHoveredCake] = useState<CakeKey | null>(null);
  const [isDecorating, setIsDecorating] = useState<boolean>(!project.cake && !isReceiver);

  useEffect(() => {
    if (project.cake) {
      setSelectedCake(resolveCakeKey(project.cake));
    }
  }, [project.cake]);

  const [isCandlesLit, setIsCandlesLit] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showWishCard, setShowWishCard] = useState(false);
  const [isMailboxOpen, setIsMailboxOpen] = useState(false);
  const [shared, setShared] = useState(false);

  // ── Auto-scaling letter font for single-page presentation ──
  const roomLetterContainerRef = useRef<HTMLDivElement>(null);
  const roomDynamicFont = useDynamicLetterFont(
    wish || "",
    (project.letterFont as LetterFontStyle) || "caveat",
    roomLetterContainerRef,
    showWishCard
  );

  // ── Birthday Song Audio/YouTube Player State ──
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytIframeRef = useRef<HTMLIFrameElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const defaultSongTitle = `Birthday Waltz for ${name}`;
  const [youtubeId, setYoutubeId] = useState<string | null>(project.customSongYoutubeId || null);
  const [youtubeInput, setYoutubeInput] = useState<string>("");
  const [songUrl, setSongUrl] = useState<string>(() => {
    if (project.customSongUrl && project.customSongUrl.startsWith("http")) {
      return project.customSongUrl;
    }
    if (project.customSongUrl && project.customSongUrl.startsWith("data:audio")) {
      return project.customSongUrl;
    }
    return defaultBirthdaySong;
  });
  const [songTitle, setSongTitle] = useState<string>(project.customSongName || defaultSongTitle);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState<boolean>(false);
  const [showMusicMenu, setShowMusicMenu] = useState<boolean>(false);
  const [isUploadingSong, setIsUploadingSong] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage((curr) => (curr === msg ? null : curr)), 5000);
  };

  // Active cake preview
  const activeCakeKey = hoveredCake || selectedCake;
  const currentCake = cakes.find((c) => c.id === activeCakeKey) || cakes[0];
  const currentRoomImage = currentCake.roomSrc;

  // Send command to background YouTube iframe via postMessage
  const sendYtCommand = (func: "playVideo" | "pauseVideo" | "mute" | "unMute") => {
    if (ytIframeRef.current?.contentWindow) {
      ytIframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func, args: [] }),
        "*"
      );
    }
  };

  // Play audio safely handling browser autoplay policies
  const startAudioPlayback = async () => {
    if (youtubeId) {
      sendYtCommand("unMute");
      sendYtCommand("playVideo");
      setIsPlaying(true);
      setIsAutoplayBlocked(false);
      setIsMuted(false);
      return;
    }
    const media = audioRef.current;
    if (!media) return;

    // If project has custom song, ensure media.src points to it
    if (project.customSongUrl) {
      const resolved = await resolveAudioPlaybackUrl(project.customSongUrl, "room_custom_song");
      if (resolved && media && media.src !== resolved) {
        media.src = resolved;
      }
    }

    media.muted = false;
    setIsMuted(false);
    try {
      await media.play();
      setIsPlaying(true);
      setIsAutoplayBlocked(false);
    } catch (err: any) {
      if (err?.name === "NotAllowedError") {
        setIsAutoplayBlocked(true);
      } else {
        const onCanPlay = () => {
          media.play()
            .then(() => {
              setIsPlaying(true);
              setIsAutoplayBlocked(false);
            })
            .catch(() => setIsAutoplayBlocked(true));
        };
        media.addEventListener("canplay", onCanPlay, { once: true });
      }
    }
  };

  // Synchronize song state whenever project custom song properties update or on refresh
  useEffect(() => {
    let isCancelled = false;

    if (project.customSongYoutubeId) {
      // YouTube/Suno link — handled by YouTube iframe
      setYoutubeId(project.customSongYoutubeId);
    } else if (project.customSongUrl) {
      // Resolve URL whether cloud URL, base64 data URL, or IndexedDB key
      resolveAudioPlaybackUrl(project.customSongUrl, "room_custom_song").then((resolved) => {
        if (!isCancelled && resolved) {
          const preloaded = getPreloadedAudioUrl(resolved);
          const finalUrl = preloaded || resolved;
          setSongUrl(finalUrl);
          setYoutubeId(null);
          if (audioRef.current && audioRef.current.src !== finalUrl) {
            audioRef.current.src = finalUrl;
            audioRef.current.load();
          }
        }
      });
    } else {
      setSongUrl(defaultBirthdaySong);
      setYoutubeId(null);
      if (audioRef.current && audioRef.current.src !== defaultBirthdaySong) {
        audioRef.current.src = defaultBirthdaySong;
        audioRef.current.load();
      }
    }

    if (project.customSongName) {
      setSongTitle(project.customSongName);
    }

    return () => {
      isCancelled = true;
    };
  }, [project.customSongUrl, project.customSongYoutubeId, project.customSongName]);

  useEffect(() => {
    if (youtubeId) {
      setTimeout(() => {
        sendYtCommand("unMute");
        sendYtCommand("playVideo");
        setIsPlaying(true);
      }, 1000);
      return;
    }
    const media = audioRef.current;
    if (!media) return;

    // Try playing
    media.muted = false;
    const playPromise = media.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsAutoplayBlocked(false);
        })
        .catch((err) => {
          if (err?.name === "NotAllowedError") {
            setIsAutoplayBlocked(true);
          } else {
            const onCanPlay = () => {
              media.play()
                .then(() => {
                  setIsPlaying(true);
                  setIsAutoplayBlocked(false);
                })
                .catch(() => setIsAutoplayBlocked(true));
            };
            media.addEventListener("canplay", onCanPlay, { once: true });
          }
        });
    }
  }, [songUrl, youtubeId]);

  // Global user gesture listener: first click anywhere starts audio if blocked
  useEffect(() => {
    if (!isAutoplayBlocked) return;

    const handleFirstUserInteraction = () => {
      startAudioPlayback();
    };

    window.addEventListener("pointerdown", handleFirstUserInteraction, { once: true });
    return () => {
      window.removeEventListener("pointerdown", handleFirstUserInteraction);
    };
  }, [isAutoplayBlocked, songUrl, youtubeId]);

  const togglePlay = () => {
    if (youtubeId) {
      if (isPlaying) {
        sendYtCommand("pauseVideo");
        setIsPlaying(false);
      } else {
        sendYtCommand("playVideo");
        setIsPlaying(true);
      }
      return;
    }
    const media = audioRef.current;
    if (!media) return;
    if (isPlaying) {
      media.pause();
      setIsPlaying(false);
    } else {
      startAudioPlayback();
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    if (youtubeId) {
      sendYtCommand(nextMute ? "mute" : "unMute");
      setIsMuted(nextMute);
      return;
    }
    const media = audioRef.current;
    if (!media) return;
    media.muted = nextMute;
    setIsMuted(nextMute);
  };

  // Upload Custom Song (MP3 / Audio) to Reliable Cloud Storage & IndexedDB (same architecture as scrapbook)
  const handleUploadCustomSong = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      showToast("⚠️ Audio file is larger than 25MB. Please select a smaller MP3 or audio file.");
      return;
    }

    setIsUploadingSong(true);
    const fileName = file.name.replace(/\.[^/.]+$/, "");

    try {
      // 1. Immediately save to IndexedDB for permanent local persistence
      await saveAudioBlob("room_custom_song", file);
      const localBlobUrl = URL.createObjectURL(file);
      setYoutubeId(null);
      setSongUrl(localBlobUrl);
      setSongTitle(fileName);
      setShowMusicMenu(true);

      // Play immediately so sender can hear it right away
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.load();
          audioRef.current.muted = false;
          setIsMuted(false);
          startAudioPlayback();
        }
      }, 100);

      // 2. Read as data URL fallback (up to 10MB) for direct Supabase KV embedding
      let base64Audio: string | null = null;
      if (file.size <= 10 * 1024 * 1024) {
        try {
          base64Audio = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(reader.error);
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        } catch (e) {
          console.warn("[Room Song] Base64 conversion deferred:", e);
        }
      }

      const initialProject = saveGiftProject({
        ...project,
        customSongYoutubeId: null,
        customSongUrl: base64Audio || "idb:room_custom_song",
        customSongName: fileName,
      });
      projectRef.current = initialProject;
      setProject(initialProject);
      persistGiftProject(initialProject).catch(() => {});

      showToast("Song selected! 🎵 Uploading to cloud...");
      setIsUploadingSong(false);

      // 3. Upload to cloud storage (Catbox / Litterbox / Supabase Storage) in background
      (async () => {
        try {
          let cloudUrl: string | null = null;
          try {
            cloudUrl = await uploadAudioToCloud(file, fileName);
          } catch (cloudErr) {
            console.warn("[Room Song] Cloud storage upload fallback to Supabase payload:", cloudErr);
          }

          const finalUrl = (cloudUrl && cloudUrl.startsWith("http")) ? cloudUrl : (base64Audio || "idb:room_custom_song");
          const currentProj = projectRef.current || initialProject;
          const updatedProject = saveGiftProject({
            ...currentProj,
            customSongYoutubeId: null,
            customSongUrl: finalUrl,
            customSongName: fileName,
          });
          projectRef.current = updatedProject;
          setProject(updatedProject);
          await persistGiftProject(updatedProject);
          showToast("🎉 Song saved & synced to cloud! Receiver can hear it too ✨");
          console.log("[Room Song] Successfully saved and synced to Supabase:", finalUrl.slice(0, 50));
        } catch (uploadErr) {
          console.warn("[Room Song] Background cloud upload deferred/failed:", uploadErr);
        }
      })();
    } catch (err) {
      console.error("Audio upload failed:", err);
      showToast("Could not process this audio file. Please try another MP3 or audio link.");
    } finally {
      setIsUploadingSong(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleApplySongLink = () => {
    const input = youtubeInput.trim();
    if (!input) return;

    // 1. Check if YouTube link
    const ytId = extractYouTubeId(input);
    if (ytId) {
      const title = `YouTube Song for ${name} 🎵`;
      setYoutubeId(ytId);
      setSongTitle(title);
      const next = saveGiftProject({
        ...project,
        customSongYoutubeId: ytId,
        customSongUrl: null,
        customSongName: title,
      });
      setProject(next);
      persistGiftProject(next).catch(() => {});
      setShowMusicMenu(true);
      setYoutubeInput("");
      showToast("🎉 YouTube song saved! Playing preview now... ✨");
      setTimeout(() => {
        sendYtCommand("unMute");
        sendYtCommand("playVideo");
        setIsPlaying(true);
      }, 500);
      return;
    }

    // 2. Check if Suno AI link
    const sunoDirect = extractSunoAudioUrl(input);
    if (sunoDirect) {
      const title = `Dedicated Suno Song for ${name} 🎵`;
      setYoutubeId(null);
      setSongUrl(sunoDirect);
      setSongTitle(title);
      const next = saveGiftProject({
        ...project,
        customSongYoutubeId: null,
        customSongUrl: sunoDirect,
        customSongName: title,
      });
      setProject(next);
      persistGiftProject(next).catch(() => {});
      setShowMusicMenu(true);
      setYoutubeInput("");
      showToast("🎉 Suno AI song saved! Playing preview now... ✨");
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.load();
          audioRef.current.muted = false;
          setIsMuted(false);
          startAudioPlayback();
        }
      }, 200);
      return;
    }

    // 3. Direct Audio URL (or Google Drive / Dropbox link)
    let audioLink = input;
    const gDriveMatch = input.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (gDriveMatch) {
      audioLink = `https://docs.google.com/uc?export=download&id=${gDriveMatch[1]}`;
    } else if (input.includes("dropbox.com")) {
      audioLink = input.replace("dl=0", "raw=1").replace("www.dropbox.com", "dl.dropboxusercontent.com");
    }

    if (/^https?:\/\//i.test(audioLink)) {
      const title = `Custom Audio for ${name} 🎵`;
      setYoutubeId(null);
      setSongUrl(audioLink);
      setSongTitle(title);
      const next = saveGiftProject({
        ...project,
        customSongYoutubeId: null,
        customSongUrl: audioLink,
        customSongName: title,
      });
      setProject(next);
      persistGiftProject(next).catch(() => {});
      setShowMusicMenu(true);
      setYoutubeInput("");
      showToast("🎉 Custom audio saved! Playing preview now... ✨");
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.load();
          audioRef.current.muted = false;
          setIsMuted(false);
          startAudioPlayback();
        }
      }, 200);
      return;
    }

    showToast("⚠️ Please enter a valid YouTube, Suno, or audio link (https://...).");
  };

  const handleResetSong = () => {
    setYoutubeId(null);
    setSongUrl(defaultBirthdaySong);
    setSongTitle(defaultSongTitle);
    const next = saveGiftProject({
      ...project,
      customSongYoutubeId: null,
      customSongUrl: null,
      customSongName: null,
    });
    setProject(next);
    persistGiftProject(next).catch(() => {});
    setShowMusicMenu(false);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.load();
        startAudioPlayback();
      }
    }, 150);
  };

  // Save cake selection & sync immediately to Supabase KV Store (same architecture as scrapbook)
  const handleSelectCake = async (cakeId: CakeKey) => {
    setSelectedCake(cakeId);
    setHoveredCake(null);
    setIsDecorating(false);
    const next = saveGiftProject({
      ...project,
      cake: cakeId,
    });
    setProject(next);
    projectRef.current = next;
    const cakeName = cakes.find((c) => c.id === cakeId)?.name || "Cake";
    showToast(`🎂 Selected ${cakeName}! Saved ✨`);

    try {
      await persistGiftProject(next);
      console.log("[Cake Selection] Synced to Supabase:", cakeId);
    } catch (err) {
      console.warn("[Cake Selection] Supabase sync deferred:", err);
    }
  };

  // Blow candles action
  const handleBlowCandles = () => {
    if (!isCandlesLit) return;
    setIsCandlesLit(false);
    setShowConfetti(true);

    // If audio was not playing yet, start it now
    if (!isPlaying) {
      startAudioPlayback();
    }

    setTimeout(() => {
      setShowWishCard(true);
    }, 550);
  };

  const handleRelight = () => {
    setIsCandlesLit(true);
    setShowWishCard(false);
  };

  const handleBurstMoreConfetti = () => {
    setShowConfetti(false);
    setTimeout(() => {
      setShowConfetti(true);
      if (!isPlaying) startAudioPlayback();
    }, 50);
  };

  const shareGift = async () => {
    try {
      await persistGiftProject(project).catch(() => {});
      const url = createShareLink(project);
      if (navigator.share) {
        try {
          await navigator.share({ title: `A birthday surprise for ${name}`, url });
          setShared(true);
          window.setTimeout(() => setShared(false), 2000);
        } catch {
          await navigator.clipboard.writeText(url).catch(() => {});
          setShared(true);
          window.setTimeout(() => setShared(false), 2000);
        }
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        window.setTimeout(() => setShared(false), 2000);
      }
    } catch {
      try {
        const url = createShareLink(project);
        await navigator.clipboard.writeText(url);
        setShared(true);
        window.setTimeout(() => setShared(false), 2000);
      } catch {
        setShared(false);
      }
    }
  };

  const handleReturnToWish = () => {
    navigate(`/wish${location.search}`, {
      state: {
        name,
        occasion,
        relationship,
        wish,
      },
    });
  };

  // Candle flame coordinates on cake 1 in room1_cake1.png
  const candleCoords = [
    { x: 48.2, y: 38.3, delay: 0.1 },
    { x: 50.6, y: 36.7, delay: 0.3 },
    { x: 55.0, y: 40.5, delay: 0 },
    { x: 59.0, y: 36.1, delay: 0.2 },
    { x: 63.3, y: 38.8, delay: 0.4 },
    { x: 65.0, y: 41.0, delay: 0.15 },
  ];

  return (
    <div className="relative w-full h-screen bg-[#1c1417] overflow-hidden select-none flex items-center justify-center">
      {/* ── Background Audio & YouTube Players (100% Zero-Redirect Cross-Browser Playback) ── */}
      {youtubeId ? (
        <iframe
          ref={ytIframeRef}
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&enablejsapi=1&playsinline=1&loop=1&playlist=${youtubeId}&controls=0`}
          title="Background Birthday Music"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          style={{ position: "fixed", top: -9999, left: -9999, width: 1, height: 1, opacity: 0.001, pointerEvents: "none" }}
          onLoad={() => {
            setTimeout(() => {
              sendYtCommand("unMute");
              sendYtCommand("playVideo");
              setIsPlaying(true);
            }, 800);
          }}
        />
      ) : (
        <audio
          ref={audioRef}
          src={songUrl}
          loop
          playsInline
          preload="auto"
          muted={isMuted}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}

      {/* Hidden file input for uploading custom MP3 to Supabase */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleUploadCustomSong}
        className="hidden"
      />

      {/* ── Audio Status Toast Banner (Non-blocking) ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2 rounded-full bg-black/90 border border-pink-400/60 text-white text-xs font-semibold shadow-2xl backdrop-blur-xl flex items-center gap-2 pointer-events-none"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Background Ambient Bloom ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={currentRoomImage}
          alt=""
          className="w-full h-full object-cover blur-3xl opacity-35 scale-110 pointer-events-none"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* ── Floating Musical Notes drifting up when song plays ── */}
      <FloatingMusicalNotes active={isPlaying} />

      {/* ── Main Viewport-Fitting Room Canvas ── */}
      <div className="relative w-full h-full max-w-[1400px] max-h-screen flex items-center justify-center">
        {/* Room Image with Smooth Crossfade */}
        <AnimatePresence mode="sync">
          <motion.img
            key={currentRoomImage}
            src={currentRoomImage}
            alt="Decorated birthday room"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.8 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-cover sm:object-contain object-center drop-shadow-2xl pointer-events-none"
          />
        </AnimatePresence>

        {/* ── Animated Candle Flame Highlights on Cake 1 ── */}
        {activeCakeKey === "cake1" && (
          <FlameOverlay isLit={isCandlesLit} coords={candleCoords} />
        )}

        {/* ── Interactive Heart Wish Card on the Table Hotspot ── */}
        <motion.div
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowWishCard(true)}
          className="absolute z-20 cursor-pointer group flex flex-col items-center"
          style={{ left: "73%", top: "64%" }}
          title="Click to open birthday wish card"
        >
          {/* Glowing pulse indicator */}
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-pink-400 opacity-60" />
            <div className="relative px-2.5 py-1 rounded-full bg-white/95 text-pink-600 border border-pink-200 shadow-md text-[11px] font-bold flex items-center gap-1 group-hover:bg-pink-500 group-hover:text-white transition-all">
              <Heart size={12} className="fill-current" />
              <span className="hidden sm:inline">Wish Card</span>
            </div>
          </div>
        </motion.div>

        {/* ── Interactive Cake Tap Hotspot (Center Table) ── */}
        <div
          onClick={handleBlowCandles}
          className="absolute z-20 cursor-pointer pointer-events-auto"
          style={{
            left: "42%",
            top: "36%",
            width: "25%",
            height: "26%",
          }}
          title={isCandlesLit ? "Tap cake to blow candles!" : "Candles are blown!"}
        />
      </div>

      {/* ── Confetti Particle Explosion ── */}
      <ConfettiCannon active={showConfetti} />

      {/* ── Top Header & Navigation Bar ── */}
      <div className="absolute top-5 left-5 right-5 z-30 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReturnToWish}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/55 hover:bg-black/75 border border-white/20 text-white/90 backdrop-blur-xl text-[11px] font-semibold shadow-md transition-all cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Wish Page</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMailboxOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pink-500/80 to-rose-400/80 hover:from-pink-500 hover:to-rose-400 border border-pink-300/40 text-white backdrop-blur-xl text-[11px] font-semibold shadow-[0_4px_18px_rgba(244,114,182,0.35)] transition-all cursor-pointer"
          >
            <Mail size={13} />
            <span>Love Mailbox 🫧</span>
          </motion.button>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-[11px] text-white">
            <span>Decorating room for:</span>
            <span className="font-bold text-pink-300">{name}</span>
          </div>
        </div>

        {/* Top Right: Music Player, Decorate & Share */}
        <div className="flex items-center gap-2">
          {/* ── Floating Birthday Song Controller Pill ── */}
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 border border-pink-400/40 text-white backdrop-blur-xl shadow-[0_4px_20px_rgba(244,114,182,0.25)] text-[11px] cursor-pointer transition-all"
            >
              {/* Play / Pause button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="w-5 h-5 rounded-full bg-pink-500 hover:bg-pink-600 flex items-center justify-center text-white shadow-sm transition-transform active:scale-95"
                title={isPlaying ? "Pause Song" : "Play Birthday Song"}
              >
                {isPlaying ? <Pause size={10} fill="white" /> : <Play size={10} fill="white" className="ml-0.5" />}
              </button>

              {/* Rotating vinyl icon & animated sound bars */}
              <div
                onClick={() => !isReceiver && setShowMusicMenu((m) => !m)}
                className={`flex items-center gap-1.5 pr-1 ${!isReceiver ? "cursor-pointer" : ""}`}
                title={!isReceiver ? "Song options & settings" : undefined}
              >
                <Disc
                  size={14}
                  className={`text-pink-300 transition-transform ${isPlaying ? "animate-spin" : ""
                    }`}
                  style={{ animationDuration: "3s" }}
                />

                <span className="max-w-[100px] sm:max-w-[130px] truncate font-medium text-white/95">
                  {songTitle}
                </span>

                {/* Equalizer bars animation when playing */}
                {isPlaying ? (
                  <div className="flex items-end gap-[2px] h-3">
                    <span className="w-[2px] bg-pink-400 rounded-full animate-[bounce_0.8s_infinite]" style={{ height: "60%" }} />
                    <span className="w-[2px] bg-pink-300 rounded-full animate-[bounce_0.6s_infinite_0.2s]" style={{ height: "100%" }} />
                    <span className="w-[2px] bg-pink-400 rounded-full animate-[bounce_0.9s_infinite_0.4s]" style={{ height: "75%" }} />
                  </div>
                ) : (
                  <span className="text-[10px] text-white/50">paused</span>
                )}
              </div>

              {/* Mute toggle button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                className="text-white/70 hover:text-white p-0.5 transition-colors cursor-pointer"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
              </button>
            </motion.div>

            {/* Song Options Dropdown Menu */}
            <AnimatePresence>
              {showMusicMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-72 rounded-2xl bg-black/90 border border-pink-400/35 p-3.5 backdrop-blur-2xl shadow-2xl z-50 flex flex-col gap-2.5 text-xs text-white"
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                    <span className="font-bold text-pink-300 flex items-center gap-1.5 text-xs">
                      <Music size={14} />
                      <span>Birthday Music</span>
                    </span>
                    <button
                      onClick={() => setShowMusicMenu(false)}
                      className="text-white/50 hover:text-white p-0.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {/* 1. Upload Music */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingSong}
                    className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500/20 to-rose-500/20 hover:from-pink-500/30 hover:to-rose-500/30 border border-pink-400/40 text-white font-semibold text-xs shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <Upload size={14} className="text-pink-300" />
                    <span>{isUploadingSong ? "Uploading... ⏳" : "Upload Music"}</span>
                  </button>

                  <div className="flex items-center gap-2 my-0.5">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-[9px] uppercase tracking-wider text-white/35 font-medium">OR</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  {/* 2. Paste YouTube Link */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-medium text-white/70">Paste YouTube Link</span>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="https://youtube.com/watch?v=..."
                        value={youtubeInput}
                        onChange={(e) => setYoutubeInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleApplySongLink();
                        }}
                        className="flex-1 min-w-0 px-2.5 py-2 rounded-xl bg-black/60 border border-white/20 text-xs text-white placeholder-white/35 outline-none focus:border-pink-400 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={handleApplySongLink}
                        className="px-3.5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-md transition-transform active:scale-95 cursor-pointer shrink-0"
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  {/* Reset to default song */}
                  {(youtubeId || project.customSongUrl) && (
                    <button
                      type="button"
                      onClick={handleResetSong}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/70 hover:text-white text-[11px] transition-colors cursor-pointer mt-1"
                    >
                      <RotateCcw size={12} />
                      <span>Reset to Default Music</span>
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Decorate / Change Cake Button */}
          {!isReceiver && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDecorating((d) => !d)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-xl shadow-lg transition-all ${
                  isDecorating
                    ? "bg-pink-500 text-white border-pink-400"
                    : "bg-black/55 hover:bg-black/75 text-white/90 border-white/20"
                }`}
              >
                <Palette size={13} />
                <span>{isDecorating ? "Close Dock" : "Change Cake"}</span>
              </motion.button>

              {/* Share button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold text-xs shadow-[0_4px_20px_rgba(244,114,182,0.4)] backdrop-blur-xl transition-all cursor-pointer"
              >
                <Share2 size={13} />
                <span>{project.isSealed ? "Sealed 💌" : "Share"}</span>
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* ── Autoplay Prompt for Recipient (If browser blocked audio before gesture) ── */}
      <AnimatePresence>
        {isAutoplayBlocked && !isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onClick={startAudioPlayback}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-40 cursor-pointer flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold shadow-[0_8px_30px_rgba(244,114,182,0.6)] border border-white/30 backdrop-blur-xl animate-bounce"
          >
            <Music size={15} className="animate-pulse" />
            <span>Tap to play {name}'s birthday song! 🎵</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom Controls: Blow Candles or Open Decorator ── */}
      {!isDecorating && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 pointer-events-auto">
          {isCandlesLit ? (
            <motion.button
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBlowCandles}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 text-white font-['Poppins',sans-serif] font-bold text-xs sm:text-sm shadow-[0_6px_25px_rgba(251,146,60,0.45)] border border-white/30 cursor-pointer"
            >
              <Flame size={16} className="animate-pulse" />
              <span>Make a Wish & Blow Candles! 🎂</span>
            </motion.button>
          ) : (
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRelight}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/65 hover:bg-black/80 border border-white/20 text-white font-medium text-xs backdrop-blur-xl shadow-md cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Relight Candles</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBurstMoreConfetti}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-medium text-xs shadow-[0_4px_16px_rgba(244,114,182,0.35)] cursor-pointer"
              >
                <PartyPopper size={13} />
                <span>More Confetti! 🎉</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowWishCard(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 text-white font-medium text-xs backdrop-blur-xl shadow-md cursor-pointer"
              >
                <Heart size={13} />
                <span>Read Wish</span>
              </motion.button>
            </div>
          )}
        </div>
      )}

      {/* ── Cake Decorating Drawer / Dock (Step: Decorating for Beloved One) ── */}
      <AnimatePresence>
        {isDecorating && (
          <motion.div
            initial={{ y: 220, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 220, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="absolute bottom-0 left-0 right-0 z-40 bg-black/75 backdrop-blur-2xl border-t border-white/20 px-6 pt-5 pb-6 pointer-events-auto"
          >
            <div className="max-w-5xl mx-auto flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-['Playfair_Display',serif] text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <span>Decorate Celebration Table for {name}</span>
                    <Sparkles size={16} className="text-pink-400" />
                  </h3>
                  <p className="font-['Poppins',sans-serif] text-xs text-white/70">
                    Hover or click a cake to place it on the table.
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelectCake(activeCakeKey)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold text-xs shadow-md hover:shadow-pink-500/40 transition-all cursor-pointer"
                >
                  <Check size={13} strokeWidth={3} />
                  <span>Place this Cake on Table</span>
                </motion.button>
              </div>

              {/* 4 Cake Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {cakes.map((cake) => {
                  const isSelected = selectedCake === cake.id;
                  const isHovered = hoveredCake === cake.id;
                  return (
                    <motion.div
                      key={cake.id}
                      onClick={() => handleSelectCake(cake.id)}
                      onMouseEnter={() => setHoveredCake(cake.id)}
                      onMouseLeave={() => setHoveredCake(null)}
                      whileHover={{ scale: 1.03, y: -3 }}
                      whileTap={{ scale: 0.97 }}
                      className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all p-3 flex flex-col items-center justify-between text-center ${
                        isSelected || isHovered
                          ? "border-pink-400 bg-white/15 shadow-[0_0_25px_rgba(244,114,182,0.4)]"
                          : "border-white/10 bg-white/5 hover:border-white/30"
                      }`}
                      style={{ height: 165 }}
                    >
                      {/* Checkmark */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-md">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}

                      {/* Cake Image */}
                      <div className="h-[90px] w-full flex items-center justify-center">
                        <img
                          src={cake.previewSrc}
                          alt={cake.name}
                          className="max-h-[85px] max-w-[85%] object-contain drop-shadow-md pointer-events-none"
                        />
                      </div>

                      {/* Cake Name & Subtitle */}
                      <div className="w-full">
                        <p className="font-['Poppins',sans-serif] text-xs font-bold text-white truncate">
                          {cake.name}
                        </p>
                        <p className="font-['Poppins',sans-serif] text-[10px] text-white/60 truncate">
                          {cake.tag}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Real Wish Letter on Floral Parchment Paper ── */}
      <AnimatePresence>
        {showWishCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-md pointer-events-auto"
            onClick={() => setShowWishCard(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 35 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ opacity: 0, scale: 0.88, y: 35 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-h-[88vh] flex flex-col rounded-2xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.6),0_0_50px_rgba(244,114,182,0.3)] select-none border border-amber-200/40"
              style={{
                aspectRatio: "768/1024",
                maxWidth: "min(540px, calc(88vh * 768 / 1024))",
              }}
            >
              {/* Real Letter Paper Background */}
              <img
                src={imgLetterPaper}
                alt="Floral letter paper"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
              />

              {/* Top Bar with Close Button */}
              <div className="relative z-20 flex items-center justify-between px-6 sm:px-8 pt-4 pb-1">
                <span className="bg-white/75 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-pink-700/80 border border-pink-200/60 shadow-xs flex items-center gap-1.5">
                  <Heart size={12} className="fill-current text-pink-600" />
                  <span>A Letter For {name}</span>
                </span>

                <button
                  onClick={() => setShowWishCard(false)}
                  className="w-6 h-6 rounded-full bg-white/75 hover:bg-white/95 backdrop-blur-md text-[#5a3a44] hover:text-black flex items-center justify-center border border-pink-200/60 shadow-xs cursor-pointer transition-colors text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Letter Content Area (Inside Gold Border) */}
              <div className="relative z-10 flex-1 flex flex-col px-8 sm:px-12 pt-4 pb-7 overflow-hidden text-left">
                {/* Salutation - indented to clear top-left lily */}
                <div className="mb-1.5 pl-6 sm:pl-10">
                  <p className="font-['Alex_Brush',cursive] text-[24px] sm:text-[28px] text-[#2e1820] leading-tight select-none">
                    My Dearest {name},
                  </p>
                </div>

                {/* Letter Body (Auto-scaled for one-page fit with scrollable fallback) */}
                <div
                  ref={roomLetterContainerRef}
                  className="flex-1 overflow-y-auto letter-scroll select-text p-1 pr-2"
                >
                  <p
                    style={{
                      fontSize: `${roomDynamicFont.fontSize}px`,
                      lineHeight: roomDynamicFont.lineHeight,
                      fontFamily: roomDynamicFont.fontFamily,
                      fontStyle: roomDynamicFont.isItalic ? "italic" : "normal",
                    }}
                    className="text-[#2d1b22] whitespace-pre-wrap"
                  >
                    {wish || `May this special day bring you as much happiness, warmth, and magic as you bring into my life every single day. Happy Birthday!`}
                  </p>
                </div>

                {/* Sign-off & Romantic Wax Seal */}
                <div className="pt-3 flex items-end justify-between select-none border-t border-[#dfc2c8]/40 mt-2">
                  <div>
                    <p className="font-['Alex_Brush',cursive] text-[18px] sm:text-[21px] text-[#2e1820] leading-none">
                      Yours always,
                    </p>
                  </div>

                  {/* Wax Seal Emblem */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#9e2a4b] to-[#d6456f] text-white flex items-center justify-center shadow-[0_3px_12px_rgba(158,42,75,0.4)] border border-rose-200/50">
                    <Heart size={16} className="fill-white" />
                  </div>
                </div>
              </div>

              {/* Footer Controls */}
              <div className="relative z-20 px-6 sm:px-8 py-2.5 bg-white/75 backdrop-blur-md border-t border-pink-200/60 flex items-center justify-between">
                <span className="text-[11px] text-[#785460] font-['Poppins',sans-serif]">
                  Cake: {currentCake.name}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReturnToWish}
                    className="px-3.5 py-1.5 rounded-full font-['Poppins',sans-serif] text-xs font-semibold text-[#785460] hover:bg-white/80 transition-colors cursor-pointer"
                  >
                    Back to Wish Page
                  </button>
                  {!isReceiver ? (
                    <button
                      onClick={() => {
                        setShowWishCard(false);
                        setIsShareModalOpen(true);
                      }}
                      className="px-4 py-1.5 rounded-full font-['Poppins',sans-serif] text-xs font-bold text-white shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                      style={{ background: "linear-gradient(135deg, #e8849c 0%, #c4587a 100%)" }}
                    >
                      <Share2 size={13} />
                      <span>{project.isSealed ? "Sealed 💌" : "Share Surprise 💌"}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowWishCard(false)}
                      className="px-4 py-1.5 rounded-full font-['Poppins',sans-serif] text-xs font-bold text-white shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                      style={{ background: "linear-gradient(135deg, #e8849c 0%, #c4587a 100%)" }}
                    >
                      <span>Fold Wish 💌</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Love Mailbox Modal (Putul Khela Stage & Dream Bubble Realm) ── */}
      <MailboxModal
        isOpen={isMailboxOpen}
        onClose={() => setIsMailboxOpen(false)}
        name={name}
        items={project.mailboxItems}
        onItemsChange={(mailboxItems) => {
          const next = saveGiftProject({ ...project, mailboxItems });
          setProject(next);
        }}
        theme={project.mailboxTheme}
        onThemeChange={(mailboxTheme) => {
          const next = saveGiftProject({ ...project, mailboxTheme });
          setProject(next);
        }}
        projectId={project.projectId}
        isReceiver={isReceiver}
        project={project}
        onProjectSync={(synced) => setProject(synced)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
      />

      {/* ── Seal & Share Modal ── */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        project={project}
        onProjectUpdate={setProject}
      />
    </div>
  );
}
