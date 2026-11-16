import { projectId as supabaseProjectId, publicAnonKey } from "../../utils/supabase/info";
import { uploadAudioToCloud } from "./utils/audioCloudUpload";
import { uploadImageToCloud } from "./utils/imageCloudUpload";
import { getAudioBlob } from "./utils/audioStorage";
import {
  isSupabaseConfigured,
  saveScrapbookToSupabase,
  loadScrapbookFromSupabase,
  saveProjectJsonToSupabaseStorage,
  loadProjectJsonFromSupabaseStorage,
  saveProjectJsonToCatbox,
  loadProjectJsonFromUrl,
} from "./utils/supabaseStorage";
import {
  saveProjectLocalCache,
  getProjectLocalCacheSync,
  getProjectLocalCache,
  cacheAllProjectMedia,
  useCachedMediaUrl,
  resolveCachedMediaUrl,
  CachedImage,
} from "./utils/mediaCache";
export {
  isSupabaseConfigured,
  saveScrapbookToSupabase,
  loadScrapbookFromSupabase,
  saveProjectJsonToSupabaseStorage,
  loadProjectJsonFromSupabaseStorage,
  saveProjectJsonToCatbox,
  loadProjectJsonFromUrl,
  saveProjectLocalCache,
  getProjectLocalCacheSync,
  getProjectLocalCache,
  cacheAllProjectMedia,
  useCachedMediaUrl,
  resolveCachedMediaUrl,
  CachedImage,
};

export type ScrapbookPage = {
  id: string;
  photos: string[];
  style: 1 | 2 | 3;
  texts: Record<string, string>;
  data: Record<string, string>;
};

export type MailboxBubbleType = "song" | "voice" | "photo" | "dream" | "note" | "surprise";
export type MailboxTheme = "putulkhela" | "bubble";

export interface MailboxBubbleItem {
  id: string;
  type: MailboxBubbleType;
  title: string;
  sender?: string;
  date?: string;
  hasPaper?: boolean; // When true, folded paper is visible inside bubble before popping
  puppetId?: string; // Puppet character ID for Putul Khela theme
  // For 'dream' / 'note' / 'surprise'
  message?: string;
  color?: string;
  stampEmoji?: string;
  // For 'song'
  songSource?: "youtube" | "audio" | "suno";
  youtubeUrl?: string;
  youtubeId?: string;
  sunoUrl?: string;
  audioUrl?: string;
  artist?: string;
  // For 'voice'
  voiceUrl?: string;
  voiceDuration?: number;
  // For 'photo'
  photoUrl?: string;
  photoCaption?: string;
}

export const DEFAULT_MAILBOX_ITEMS: MailboxBubbleItem[] = [
  {
    id: "bubble-note-1",
    type: "note",
    title: "A Secret Love Note 💌",
    sender: "",
    date: "From the Heart",
    message: "Every day with you feels like a quiet blessing. Thank you for bringing so much gentle light, warmth, and laughter into my life.",
    hasPaper: true, // Special note carries the folded paper!
    puppetId: "bride",
    stampEmoji: "💌",
    color: "#fff0f5",
  },
  {
    id: "bubble-song-1",
    type: "song",
    title: "Our Dedicated Song 🎵",
    artist: "Selected with Love",
    sender: "",
    date: "Dedicated Track",
    message: "I picked this melody especially for you. Whenever this plays, remember how much you mean to me.",
    songSource: "youtube",
    youtubeUrl: "https://www.youtube.com/watch?v=0yW7w8F2TVA",
    youtubeId: "0yW7w8F2TVA",
    hasPaper: false, // Pure crystal bubble - no paper!
    puppetId: "musician",
    stampEmoji: "🎵",
    color: "#fff0f5",
  },
  {
    id: "bubble-voice-1",
    type: "voice",
    title: "A Voice Whispered Just For You 🎙️",
    sender: "From My Heart",
    date: "Personal Audio Memo",
    message: "A little personal voice note recorded just for you. Listen with headphones for all the warmth!",
    hasPaper: false, // Pure crystal bubble - no paper!
    puppetId: "moonboy",
    voiceDuration: 6,
    stampEmoji: "🎙️",
    color: "#fbf3ff",
  },
  {
    id: "bubble-photo-1",
    type: "photo",
    title: "A Starlit Memory 📸",
    sender: "Special Moments",
    date: "Under the Stars",
    photoCaption: "Every starry night reminds me of the magic and laughter we share together.",
    hasPaper: false, // Pure crystal bubble - no paper!
    puppetId: "painter",
    stampEmoji: "📸",
    color: "#f0f8ff",
  },
  {
    id: "bubble-dream-1",
    type: "dream",
    title: "My Secret Dream For Us 💫",
    sender: "Yours Always",
    date: "Future Promise",
    message: "My dream is that no matter how many years pass, we continue exploring new places, laughing till our stomachs hurt, and celebrating every single victory together.",
    hasPaper: true, // Special note carries the folded paper!
    puppetId: "telescope",
    stampEmoji: "💖",
    color: "#fff8f0",
  },
];

export type GiftProject = {
  projectId: string;
  editToken: string;
  recipient: string;
  occasion: string;
  relationship: string;
  backgroundIndex: number;
  customBgUrl?: string | null;
  headerTitle?: string;
  frontMessage?: string;
  wish: string;
  journalPages: ScrapbookPage[];
  roomStyle: "gold" | "colorful" | "banner" | "neon" | null;
  cake: "pink" | "butterfly" | "chocolate" | "decorated" | "cake1" | "cake2" | "cake3" | "cake4" | null;
  letterFont?: "caveat" | "dancing" | "playfair" | null;
  customSongUrl?: string | null;
  customSongName?: string | null;
  customSongYoutubeId?: string | null;
  mailboxTheme?: MailboxTheme;
  mailboxItems?: MailboxBubbleItem[];
  cloudUrl?: string | null;
  supabaseId?: string | null;
  isSealed?: boolean;
  sealedAt?: number;
  updatedAt: number;
  isHydrated?: boolean;
};

const STORAGE_KEY = "make-a-wish-project-v1";
const API_URL = `https://${supabaseProjectId}.supabase.co/functions/v1/make-server-c194f93d`;
const EMPTY_PHOTOS = () => Array(5).fill("");
let saveTimer: number | undefined;
let cloudUnavailableUntil = 0;

export type CloudStatus = "syncing" | "saved" | "offline";

const reportCloudStatus = (status: CloudStatus) => {
  window.dispatchEvent(new CustomEvent<CloudStatus>("wish-cloud-status", { detail: status }));
};

const newToken = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
};

export const emptyProject = (): GiftProject => ({
  projectId: crypto.randomUUID(),
  editToken: newToken(),
  recipient: "Someone",
  occasion: "Birthday",
  relationship: "Special Person",
  backgroundIndex: 0,
  customBgUrl: null,
  headerTitle: "",
  frontMessage: "",
  wish: "",
  journalPages: [{ id: crypto.randomUUID(), photos: EMPTY_PHOTOS(), style: 1, texts: {}, data: {} }],
  roomStyle: null,
  cake: null,
  letterFont: "caveat",
  customSongUrl: null,
  customSongName: null,
  mailboxTheme: "putulkhela",
  mailboxItems: DEFAULT_MAILBOX_ITEMS,
  cloudUrl: null,
  supabaseId: null,
  updatedAt: Date.now(),
  isHydrated: false,
});

function normalize(project: Partial<GiftProject>): GiftProject {
  const base = emptyProject();
  return {
    ...base,
    ...project,
    mailboxTheme: project.mailboxTheme || "putulkhela",
    mailboxItems: project.mailboxItems?.length ? project.mailboxItems : DEFAULT_MAILBOX_ITEMS,
    journalPages:
      project.journalPages?.length
        ? project.journalPages.map((page) => {
          const style = page.style || 1;
          const photos = [...(page.photos || []), ...EMPTY_PHOTOS()].slice(0, 5);
          const data = { ...(page.data || {}) };
          const photoKeys =
            style === 1
              ? ["left_pink", "left_orange", "left_yellow", "right_bottom_yellow", "right_top_pink"]
              : style === 2
                ? ["left_yellow", "left_pink", "right_bottom_yellow", "right_top_pink", "right_top_yellow"]
                : ["left_yellow", "right_yellow"];
          photoKeys.forEach((key, index) => {
            if (!data[key] && photos[index]) data[key] = photos[index];
          });
          const texts = page.texts || {};
          if (!data.left_text_blue && texts.leftNote) data.left_text_blue = texts.leftNote;
          if (!data.right_text_red && texts.rightNote) data.right_text_red = texts.rightNote;
          return {
            id: page.id || crypto.randomUUID(),
            photos,
            style,
            texts,
            data,
          };
        })
        : base.journalPages,
  };
}

export function encodeSharedProject(project: GiftProject): string {
  try {
    const { editToken, ...safeProject } = project;

    // Clean mailboxItems for receiver share token:
    // - Ephemeral blob: URLs NEVER work across devices/browsers, strip them
    // - Clean permanent HTTPS URLs (Supabase, Catbox, etc.) are small (~80 chars) and ALWAYS preserved!
    if (safeProject.mailboxItems) {
      safeProject.mailboxItems = safeProject.mailboxItems.map((item) => {
        const cleaned = { ...item };
        if (cleaned.photoUrl && (cleaned.photoUrl.startsWith("blob:") || cleaned.photoUrl.startsWith("idb:"))) cleaned.photoUrl = "";
        if (cleaned.voiceUrl && (cleaned.voiceUrl.startsWith("blob:") || cleaned.voiceUrl.startsWith("idb:"))) cleaned.voiceUrl = "";
        if (cleaned.audioUrl && (cleaned.audioUrl.startsWith("blob:") || cleaned.audioUrl.startsWith("idb:"))) cleaned.audioUrl = "";

        if (cleaned.photoUrl && cleaned.photoUrl.startsWith("data:") && cleaned.photoUrl.length > 50000) {
          cleaned.photoUrl = "";
        }
        if (cleaned.voiceUrl && cleaned.voiceUrl.startsWith("data:") && cleaned.voiceUrl.length > 50000) {
          cleaned.voiceUrl = "";
        }
        if (cleaned.audioUrl && cleaned.audioUrl.startsWith("data:") && cleaned.audioUrl.length > 50000) {
          cleaned.audioUrl = "";
        }
        return cleaned;
      });
    }

    // Clean journalPages for receiver share token: preserve cloud URLs, omit oversized data URLs
    if (safeProject.journalPages) {
      safeProject.journalPages = safeProject.journalPages.map((page) => ({
        ...page,
        photos: (page.photos || []).map((p) => (p && p.startsWith("data:") && p.length > 50000 ? "" : p)),
        data: Object.fromEntries(
          Object.entries(page.data || {}).map(([k, v]) => [
            k,
            typeof v === "string" && v.startsWith("data:") && v.length > 50000 ? "" : v,
          ])
        ),
      }));
    }

    // Strip song blob:, sender-only idb:, or oversized data: URLs
    if (safeProject.customSongUrl && (safeProject.customSongUrl.startsWith("blob:") || safeProject.customSongUrl.startsWith("idb:"))) {
      safeProject.customSongUrl = null;
    }
    if (safeProject.customSongUrl && safeProject.customSongUrl.startsWith("data:") && safeProject.customSongUrl.length > 50000) {
      safeProject.customSongUrl = null;
    }

    const json = JSON.stringify(safeProject);
    const bytes = new TextEncoder().encode(json);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    const token = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return token.length > 7000 ? project.projectId : token;
  } catch {
    return project.projectId;
  }
}

function decodeSharedProject(value: string): GiftProject | null {
  try {
    let base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return normalize(JSON.parse(new TextDecoder().decode(bytes)));
  } catch {
    return null;
  }
}

export function loadGiftProject(): GiftProject {
  let shared: string | null = null;
  let idParam: string | null = null;
  let editParam: string | null = null;
  let cloudParam: string | null = null;
  let isReceiverView = false;

  if (typeof window !== "undefined") {
    const searchParams = new URLSearchParams(window.location.search);
    shared = searchParams.get("gift");
    idParam = searchParams.get("id");
    editParam = searchParams.get("edit");
    cloudParam = searchParams.get("cloud");
    isReceiverView = searchParams.get("view") === "receiver" || (Boolean(shared) && !editParam);

    if (window.location.hash.includes("?")) {
      const hashQuery = window.location.hash.substring(window.location.hash.indexOf("?"));
      const hashParams = new URLSearchParams(hashQuery);
      if (!shared) shared = hashParams.get("gift");
      if (!idParam) idParam = hashParams.get("id");
      if (!editParam) editParam = hashParams.get("edit");
      if (!cloudParam) cloudParam = hashParams.get("cloud");
      if (!isReceiverView) isReceiverView = hashParams.get("view") === "receiver" || (Boolean(shared) && !editParam);
    }
  }

  // Load existing local project if present
  let localSaved: GiftProject | null = null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) localSaved = normalize(JSON.parse(saved));
  } catch { }

  const targetId = idParam || (shared && /^[a-zA-Z0-9_-]{10,40}$/i.test(shared) ? shared : null);

  // 1. Check persistent local cache by targetId first (supports multi-project caching)
  if (targetId) {
    const cachedById = getProjectLocalCacheSync(targetId);
    if (cachedById && cachedById.isHydrated) {
      const normalizedCached = normalize(cachedById);
      if (isReceiverView || normalizedCached.isSealed) {
        return { ...normalizedCached, isSealed: true };
      }
      return normalizedCached;
    }
  }

  // 2. If viewing local project that matches targetId (or sender testing their own link in the same browser)
  if (localSaved && (!targetId || localSaved.projectId === targetId || localSaved.supabaseId === targetId)) {
    if (isReceiverView) {
      return { ...localSaved, isSealed: true };
    }
    return localSaved;
  }

  // If a self-contained base64 token is present in the link, decode it immediately
  if (shared && !/^[0-9a-f-]{30,40}$/i.test(shared)) {
    const decoded = decodeSharedProject(shared);
    if (decoded) {
      if (editParam) decoded.editToken = editParam;
      if (cloudParam) decoded.cloudUrl = cloudParam;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(decoded));
      } catch { }
      return decoded;
    }
  }

  // If creator has a local saved project and no explicit other ID was requested
  if (localSaved && !targetId) {
    return localSaved;
  }

  // Return initial skeleton with targetId and cloudUrl so loadCloudGiftProject can hydrate
  return {
    ...emptyProject(),
    projectId: targetId || (shared && /^[0-9a-f-]{30,40}$/i.test(shared) ? shared : crypto.randomUUID()),
    editToken: editParam || "",
    cloudUrl: cloudParam || null,
    isSealed: isReceiverView,
    isHydrated: false,
  };
}

export function saveGiftProject(project: GiftProject) {
  const next = { ...project, updatedAt: Date.now() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // If localStorage quota is reached, strip oversized data URLs so settings are never lost
    try {
      const sanitized = { ...next };
      if (sanitized.customSongUrl && sanitized.customSongUrl.startsWith("data:audio")) {
        // Audio data URL too big for localStorage — fall back to idb marker
        sanitized.customSongUrl = "idb:room_custom_song";
        console.warn("[saveGiftProject] Audio data URL too large for localStorage, falling back to IndexedDB marker");
      } else if (sanitized.customSongUrl && sanitized.customSongUrl.startsWith("data:")) {
        sanitized.customSongUrl = "idb:room_custom_song";
      }
      if (sanitized.mailboxItems) {
        sanitized.mailboxItems = sanitized.mailboxItems.map((item) => {
          const updated = { ...item };
          // Preserve oversized voice/audio base64 as idb marker if too large for localStorage
          if (updated.voiceUrl && updated.voiceUrl.startsWith("data:") && updated.voiceUrl.length > 200000) {
            updated.voiceUrl = `idb:voice_note_${item.id || item.puppetId || "memo"}`;
          }
          if (updated.audioUrl && updated.audioUrl.startsWith("data:") && updated.audioUrl.length > 200000) {
            updated.audioUrl = `idb:puppet_audio_${item.id || item.puppetId || "track"}`;
          }
          return updated;
        });
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    } catch {
      console.warn("Storage quota full, project preserved in memory");
    }
  }
  void saveProjectLocalCache(next);
  return next;
}

export function sealGiftProject(project: GiftProject): GiftProject {
  const next = {
    ...project,
    isSealed: true,
    sealedAt: Date.now(),
    updatedAt: Date.now(),
  };
  return saveGiftProject(next);
}

export function unsealGiftProject(project: GiftProject): GiftProject {
  const next = {
    ...project,
    isSealed: false,
    updatedAt: Date.now(),
  };
  return saveGiftProject(next);
}

export function createReceiverShareLink(project: GiftProject): string {
  if (typeof window === "undefined") {
    return `#/wish?id=${project.supabaseId || project.projectId}&view=receiver`;
  }
  const origin = window.location.origin;
  let pathname = window.location.pathname || "";
  if (/\.html$/i.test(pathname)) {
    pathname = pathname.substring(0, pathname.lastIndexOf("/"));
  }
  pathname = pathname.replace(/\/+$/, "");

  const targetId = project.supabaseId || project.projectId;
  return `${origin}${pathname}/#/wish?id=${targetId}&view=receiver`;
}

export function createSenderEditLink(project: GiftProject): string {
  if (typeof window === "undefined") {
    return `#/wish?id=${project.supabaseId || project.projectId}&edit=${project.editToken}`;
  }
  const origin = window.location.origin;
  let pathname = window.location.pathname || "";
  if (/\.html$/i.test(pathname)) {
    pathname = pathname.substring(0, pathname.lastIndexOf("/"));
  }
  pathname = pathname.replace(/\/+$/, "");
  const targetId = project.supabaseId || project.projectId;
  return `${origin}${pathname}/#/wish?id=${targetId}&edit=${project.editToken}`;
}

export function createShareLink(project: GiftProject): string {
  return createReceiverShareLink(project);
}

export function imageFileToDataUrl(
  file: File | Blob,
  maxDimension = 1400,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Could not read image"));
      image.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          try {
            resolve(canvas.toDataURL("image/jpeg", quality));
            return;
          } catch { }
          resolve(String(reader.result));
        } else {
          resolve(String(reader.result));
        }
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${publicAnonKey}`,
};

/**
 * Ensures all media (photos, audio files, voice recordings, and custom backgrounds)
 * in the project are hosted on public cloud URLs (e.g. Catbox/Supabase) rather than
 * local IndexedDB markers or massive base64 data URLs.
 * This ensures receivers on any device or fresh session can load all media flawlessly.
 */
/**
 * Prepares all media before sealing and sharing to Supabase.
 * Resolves any local IndexedDB audio markers (custom song, voice notes)
 * into standalone playable data URLs or HTTPS URLs so that receivers
 * on any device or fresh session get full playback with zero missing files.
 */
export async function ensureMediaCloudUrls(project: GiftProject): Promise<GiftProject> {
  const updated = { ...project };
  let hasChanges = false;

  // 1. Ensure custom song is resolved from IndexedDB
  if (updated.customSongUrl && !updated.customSongYoutubeId) {
    if (updated.customSongUrl.startsWith("idb:") || updated.customSongUrl.startsWith("blob:")) {
      try {
        let blob: Blob | null = null;
        if (updated.customSongUrl.startsWith("idb:")) {
          const key = updated.customSongUrl.replace("idb:", "");
          blob = await getAudioBlob(key);
        } else {
          const res = await fetch(updated.customSongUrl);
          blob = await res.blob();
        }
        if (blob) {
          // 1. First try cloud storage upload for a clean public HTTPS URL
          let cloudUrl: string | null = null;
          try {
            cloudUrl = await uploadAudioToCloud(blob, updated.customSongName || "custom-song.mp3");
          } catch { }

          if (cloudUrl && cloudUrl.startsWith("http")) {
            updated.customSongUrl = cloudUrl;
            hasChanges = true;
          } else if (blob.size <= 12 * 1024 * 1024) {
            // 2. Direct base64 data URL embed into Supabase KV payload
            const dataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
            updated.customSongUrl = dataUrl;
            hasChanges = true;
          }
        }
      } catch (e) {
        console.warn("[ensureMediaCloudUrls] Failed to resolve custom song:", e);
      }
    }
  }

  // 2. Ensure mailbox items (voice recording, audio dedication, photo) are resolved
  if (Array.isArray(updated.mailboxItems)) {
    const nextMailbox = await Promise.all(
      updated.mailboxItems.map(async (item) => {
        const nextItem = { ...item };
        let itemChanged = false;

        // Resolve voice note (microphone recording or uploaded memo)
        const voiceSrc = nextItem.voiceUrl || (nextItem.type === "voice" ? nextItem.audioUrl : null);
        if (voiceSrc && (voiceSrc.startsWith("idb:") || voiceSrc.startsWith("blob:"))) {
          try {
            let blob: Blob | null = null;
            if (voiceSrc.startsWith("idb:")) {
              const key = voiceSrc.replace("idb:", "");
              blob = await getAudioBlob(key);
            } else {
              const res = await fetch(voiceSrc);
              blob = await res.blob();
            }
            if (blob) {
              // 1. Try public cloud upload first for clean streaming HTTPS URL
              let cloudUrl: string | null = null;
              try {
                cloudUrl = await uploadAudioToCloud(blob, `${nextItem.id || nextItem.puppetId || "voice"}.mp3`);
              } catch { }

              if (cloudUrl && cloudUrl.startsWith("http")) {
                nextItem.voiceUrl = cloudUrl;
                if (nextItem.audioUrl) nextItem.audioUrl = cloudUrl;
                itemChanged = true;
                hasChanges = true;
              } else if (blob.size <= 10 * 1024 * 1024) {
                // 2. Fallback: Base64 data URL embedded directly into Supabase KV payload
                const dataUrl = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(reader.result as string);
                  reader.onerror = reject;
                  reader.readAsDataURL(blob);
                });
                nextItem.voiceUrl = dataUrl;
                if (nextItem.audioUrl) nextItem.audioUrl = dataUrl;
                itemChanged = true;
                hasChanges = true;
              }
            }
          } catch (e) {
            console.warn(`[ensureMediaCloudUrls] Failed to resolve mailbox voice [${item.id}]:`, e);
          }
        }

        // Also resolve dedicated audio file on puppet song card if different from voice
        const songSrc = nextItem.audioUrl;
        if (songSrc && songSrc !== nextItem.voiceUrl && (songSrc.startsWith("idb:") || songSrc.startsWith("blob:"))) {
          try {
            let blob: Blob | null = null;
            if (songSrc.startsWith("idb:")) {
              const key = songSrc.replace("idb:", "");
              blob = await getAudioBlob(key);
            } else {
              const res = await fetch(songSrc);
              blob = await res.blob();
            }
            if (blob) {
              let cloudUrl: string | null = null;
              try {
                cloudUrl = await uploadAudioToCloud(blob, `${nextItem.id || nextItem.puppetId || "song"}.mp3`);
              } catch { }

              if (cloudUrl && cloudUrl.startsWith("http")) {
                nextItem.audioUrl = cloudUrl;
                itemChanged = true;
                hasChanges = true;
              } else if (blob.size <= 10 * 1024 * 1024) {
                const dataUrl = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(reader.result as string);
                  reader.onerror = reject;
                  reader.readAsDataURL(blob);
                });
                nextItem.audioUrl = dataUrl;
                itemChanged = true;
                hasChanges = true;
              }
            }
          } catch (e) {
            console.warn(`[ensureMediaCloudUrls] Failed to resolve mailbox audio [${item.id}]:`, e);
          }
        }

        // Resolve photoUrl if blob: or local image
        if (nextItem.photoUrl && nextItem.photoUrl.startsWith("blob:")) {
          try {
            const res = await fetch(nextItem.photoUrl);
            const imgBlob = await res.blob();
            let cloudImgUrl: string | null = null;
            try {
              cloudImgUrl = await uploadImageToCloud(imgBlob);
            } catch { }

            if (cloudImgUrl && cloudImgUrl.startsWith("http")) {
              nextItem.photoUrl = cloudImgUrl;
              itemChanged = true;
              hasChanges = true;
            } else {
              const compressed = await imageFileToDataUrl(imgBlob);
              nextItem.photoUrl = compressed;
              itemChanged = true;
              hasChanges = true;
            }
          } catch (e) {
            console.warn(`[ensureMediaCloudUrls] Failed to resolve mailbox photo [${item.id}]:`, e);
          }
        }

        return itemChanged ? nextItem : item;
      })
    );
    if (hasChanges) {
      updated.mailboxItems = nextMailbox;
    }
  }

  return updated;
}

/**
 * Lightweight cloud sync — just uploads project JSON to Catbox, skipping
 * the heavy ensureMediaCloudUrls step. Use this after individual media
 * uploads where the cloud URL is already set on the item.
 */
export async function syncProjectToCloud(project: GiftProject): Promise<GiftProject> {
  return persistGiftProject(project);
}

export async function persistGiftProject(project: GiftProject, forceMediaResolution = false): Promise<GiftProject> {
  reportCloudStatus("syncing");

  let next = { ...project };
  if (forceMediaResolution || next.isSealed) {
    try {
      next = await ensureMediaCloudUrls(project);
    } catch (err) {
      console.warn("[persistGiftProject] ensureMediaCloudUrls error:", err);
    }
  }
  next.updatedAt = Date.now();
  next.isHydrated = true;

  // Primary: Save directly to Supabase Edge Function KV Store (like scrapbook/project1)
  try {
    const rawPages = (next.journalPages && next.journalPages.length > 0)
      ? next.journalPages.slice(0, 5)
      : [{ id: "page_1", style: 1 as const, photos: [], texts: {}, data: {} }];

    const supabasePages = rawPages.map((p, idx) => {
      const style = (p.style === 2 || p.style === 3) ? p.style : 1;
      const cleanData: Record<string, string> = {};
      if (p.data && typeof p.data === "object") {
        for (const [k, v] of Object.entries(p.data)) {
          if (typeof v === "string") cleanData[k] = v;
        }
      }
      // Embed full project settings into page 0
      if (idx === 0) {
        const meta = {
          projectId: next.projectId,
          supabaseId: next.supabaseId,
          editToken: next.editToken,
          recipient: next.recipient,
          occasion: next.occasion,
          relationship: next.relationship,
          backgroundIndex: next.backgroundIndex,
          customBgUrl: next.customBgUrl,
          headerTitle: next.headerTitle,
          frontMessage: next.frontMessage,
          wish: next.wish,
          roomStyle: next.roomStyle,
          cake: next.cake,
          letterFont: next.letterFont,
          customSongUrl: next.customSongUrl,
          customSongName: next.customSongName,
          customSongYoutubeId: next.customSongYoutubeId,
          mailboxTheme: next.mailboxTheme,
          mailboxItems: next.mailboxItems,
          isSealed: next.isSealed,
          sealedAt: next.sealedAt,
        };
        cleanData.__giftProject = JSON.stringify(meta);
      }
      return {
        id: p.id || `page_${idx + 1}`,
        style,
        data: cleanData,
      };
    });

    const result = await saveScrapbookToSupabase(supabasePages);
    if (result && result.id) {
      next.supabaseId = result.id;
      next.projectId = result.id;
      console.log(`[Supabase Storage] ✅ Persisted project to Supabase KV with ID:`, result.id);
    }
  } catch (supabaseErr) {
    console.warn("[persistGiftProject] Supabase save error:", supabaseErr);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch { }
  await saveProjectLocalCache(next);
  void cacheAllProjectMedia(next);
  reportCloudStatus("saved");
  return next;
}

export async function loadCloudGiftProject(id: string, cloudUrl?: string): Promise<GiftProject> {
  if (!id && !cloudUrl) return loadGiftProject();

  // 1. Check local persistent cache first (RAM -> localStorage -> IndexedDB)
  const cached = await getProjectLocalCache(id);

  const isReceiverView = typeof window !== "undefined" && (
    window.location.search.includes("view=receiver") ||
    window.location.hash.includes("view=receiver") ||
    Boolean(cached?.isSealed)
  );

  // Check if we already have an ACTUALLY hydrated project in local cache
  const isActuallyHydrated = Boolean(
    cached &&
    cached.isHydrated &&
    (cached.recipient !== "Someone" || cached.wish || cached.cake || (cached.mailboxItems && cached.mailboxItems.length > 0))
  );

  if (isActuallyHydrated && cached) {
    console.log(`[Local Cache] ✅ Found hydrated project [${id}] in local storage/IndexedDB. Instant reload with zero network delay.`);
    reportCloudStatus("saved");

    // Ensure all media files are cached locally in IndexedDB in the background
    void cacheAllProjectMedia(cached);

    if (isReceiverView || cached.isSealed) {
      // Sealed receiver view is locked and final: NEVER query network again!
      return { ...cached, isSealed: true };
    }

    // For sender: return cached immediately so UI loads with 0ms delay!
    return cached;
  }

  reportCloudStatus("syncing");
  const local = loadGiftProject();

  // 2. Primary: Load from Supabase Edge Function KV Store
  if (id) {
    try {
      const data = await loadScrapbookFromSupabase(id);
      if (data && Array.isArray(data.pages) && data.pages.length > 0) {
        let meta: any = {};
        const firstData = data.pages[0]?.data || {};
        if (firstData.__giftProject) {
          try {
            meta = JSON.parse(firstData.__giftProject);
          } catch { }
        }

        const restoredPages: ScrapbookPage[] = data.pages.map((p: any, idx: number) => {
          const pageData = { ...(p.data || {}) };
          delete pageData.__giftProject;
          return {
            id: p.id || `page_${idx + 1}`,
            style: (p.style === 2 || p.style === 3) ? p.style : 1,
            photos: Array(5).fill(""),
            texts: {},
            data: pageData,
          };
        });

        let urlEditToken = "";
        if (typeof window !== "undefined") {
          const searchParams = new URLSearchParams(window.location.search);
          urlEditToken = searchParams.get("edit") || "";
          if (!urlEditToken && window.location.hash.includes("?")) {
            const hashQuery = window.location.hash.substring(window.location.hash.indexOf("?"));
            urlEditToken = new URLSearchParams(hashQuery).get("edit") || "";
          }
        }
        const editToken = (local.projectId === id && local.editToken)
          ? local.editToken
          : (urlEditToken || meta.editToken || local.editToken || "");

        const mergedSongUrl = meta.customSongUrl || (local.projectId === id ? local.customSongUrl : null);
        const mergedSongName = meta.customSongName || (local.projectId === id ? local.customSongName : null);
        const mergedSongYt = meta.customSongYoutubeId !== undefined ? meta.customSongYoutubeId : (local.projectId === id ? local.customSongYoutubeId : null);

        const next = normalize({
          ...meta,
          projectId: id,
          supabaseId: id,
          editToken,
          cake: meta.cake !== undefined ? meta.cake : (local.projectId === id ? local.cake : null),
          customBgUrl: meta.customBgUrl !== undefined ? meta.customBgUrl : local.customBgUrl,
          backgroundIndex: typeof meta.backgroundIndex === "number" ? meta.backgroundIndex : local.backgroundIndex,
          customSongUrl: mergedSongUrl,
          customSongName: mergedSongName,
          customSongYoutubeId: mergedSongYt,
          mailboxItems: meta.mailboxItems || local.mailboxItems,
          journalPages: restoredPages.length > 0 ? restoredPages : local.journalPages,
          isHydrated: true,
        });

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch { }

        // Save immediately to local persistent cache & IndexedDB!
        await saveProjectLocalCache(next);
        void cacheAllProjectMedia(next);

        reportCloudStatus("saved");
        return next;
      }
    } catch (e) {
      console.warn("[loadCloudGiftProject] Supabase load failed:", e);
    }
  }

  // 2. Fallback: Check local storage
  if (local && (local.projectId === id || local.supabaseId === id || !id)) {
    reportCloudStatus("saved");
    return local;
  }
  reportCloudStatus("offline");
  return local || emptyProject();
}

export async function uploadGiftPhoto(file: File): Promise<string> {
  return uploadGiftFile(file);
}

export async function uploadGiftFile(file: File | Blob, customMime?: string): Promise<string> {
  const isAudio =
    (file instanceof File && file.type.startsWith("audio/")) ||
    (customMime && customMime.startsWith("audio/")) ||
    (file.type && file.type.startsWith("audio/"));

  if (isAudio) {
    return uploadAudioToCloud(file);
  } else {
    return uploadImageToCloud(file);
  }
}
