import { projectId as supabaseProjectId, publicAnonKey } from "../../utils/supabase/info";
import { uploadAudioToCloud } from "./utils/audioCloudUpload";
import { uploadImageToCloud } from "./utils/imageCloudUpload";
import { getAudioBlob } from "./utils/audioStorage";
import {
  isSupabaseConfigured,
  saveProjectJsonToSupabaseStorage,
  loadProjectJsonFromSupabaseStorage,
  saveProjectJsonToCatbox,
  loadProjectJsonFromUrl,
} from "./utils/supabaseStorage";
export {
  isSupabaseConfigured,
  saveProjectJsonToSupabaseStorage,
  loadProjectJsonFromSupabaseStorage,
  saveProjectJsonToCatbox,
  loadProjectJsonFromUrl,
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
  isSealed?: boolean;
  sealedAt?: number;
  updatedAt: number;
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
  updatedAt: Date.now(),
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
  } catch {}

  const targetId = idParam || (shared && /^[0-9a-f-]{30,40}$/i.test(shared) ? shared : null);

  // If viewing local project that matches targetId (or sender testing their own link in the same browser)
  if (localSaved && (!targetId || localSaved.projectId === targetId)) {
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
      } catch {}
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
          // Strip oversized photo base64 (keep if it's a cloud https:// URL)
          if (updated.photoUrl && updated.photoUrl.startsWith("data:") && updated.photoUrl.length > 150000) {
            updated.photoUrl = "";
            console.warn("[saveGiftProject] Photo data URL too large for localStorage, stripped.");
          }
          // Strip oversized voice/audio base64
          if (updated.voiceUrl && updated.voiceUrl.startsWith("data:") && updated.voiceUrl.length > 200000) {
            updated.voiceUrl = "";
            console.warn("[saveGiftProject] Voice data URL too large for localStorage, stripped.");
          }
          if (updated.audioUrl && updated.audioUrl.startsWith("data:") && updated.audioUrl.length > 200000) {
            updated.audioUrl = "";
            console.warn("[saveGiftProject] Audio data URL too large for localStorage, stripped.");
          }
          return updated;
        });
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    } catch {
      console.warn("Storage quota full, project preserved in memory");
    }
  }
  if (next.editToken) {
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      persistGiftProject(next).catch(() => {
        // Local storage is the offline fallback. A later edit retries automatically.
      });
    }, 650);
  }
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
  const sealed = { ...project, isSealed: true, sealedAt: project.sealedAt || Date.now() };
  if (typeof window === "undefined") {
    return `#/wish?gift=${project.projectId}&view=receiver`;
  }
  const origin = window.location.origin;
  let pathname = window.location.pathname || "";
  if (/\.html$/i.test(pathname)) {
    pathname = pathname.substring(0, pathname.lastIndexOf("/"));
  }
  pathname = pathname.replace(/\/+$/, "");

  const token = encodeSharedProject(sealed);
  const isCompact = token && token.length > 20 && token.length <= 7000 && !/^[0-9a-f-]{30,40}$/i.test(token);
  const cloudPart = project.cloudUrl ? `&cloud=${encodeURIComponent(project.cloudUrl)}` : "";

  if (isCompact) {
    return `${origin}${pathname}/#/wish?gift=${token}${cloudPart}&id=${project.projectId}&view=receiver`;
  }
  return `${origin}${pathname}/#/wish?gift=${project.projectId}${cloudPart}&id=${project.projectId}&view=receiver`;
}

export function createSenderEditLink(project: GiftProject): string {
  if (typeof window === "undefined") {
    return `#/wish?gift=${project.projectId}&edit=${project.editToken}`;
  }
  const origin = window.location.origin;
  let pathname = window.location.pathname || "";
  if (/\.html$/i.test(pathname)) {
    pathname = pathname.substring(0, pathname.lastIndexOf("/"));
  }
  pathname = pathname.replace(/\/+$/, "");
  return `${origin}${pathname}/#/wish?gift=${project.projectId}&edit=${project.editToken}`;
}

export function createShareLink(project: GiftProject): string {
  return createReceiverShareLink(project);
}

export function imageFileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Could not read image"));
      image.onload = () => {
        const maxSide = 640;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          try {
            resolve(canvas.toDataURL("image/webp", 0.72));
            return;
          } catch {}
          resolve(canvas.toDataURL("image/jpeg", 0.75));
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
export async function ensureMediaCloudUrls(project: GiftProject): Promise<GiftProject> {
  const updated = { ...project };
  let hasChanges = false;

  // 1. Ensure custom background is a cloud URL
  if (updated.customBgUrl && (updated.customBgUrl.startsWith("data:") || updated.customBgUrl.startsWith("blob:"))) {
    try {
      const res = await fetch(updated.customBgUrl);
      const blob = await res.blob();
      const cloudUrl = await uploadImageToCloud(blob);
      if (cloudUrl && cloudUrl.startsWith("http")) {
        updated.customBgUrl = cloudUrl;
        hasChanges = true;
      }
    } catch (e) {
      console.warn("[ensureMediaCloudUrls] Failed to upload custom background to cloud:", e);
    }
  }

  // 2. Ensure custom song is a cloud URL
  if (updated.customSongUrl && !updated.customSongYoutubeId) {
    if (updated.customSongUrl.startsWith("idb:") || updated.customSongUrl.startsWith("blob:") || updated.customSongUrl.startsWith("data:")) {
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
          const cloudUrl = await uploadAudioToCloud(blob, updated.customSongName || "custom-song.mp3");
          if (cloudUrl && cloudUrl.startsWith("http")) {
            updated.customSongUrl = cloudUrl;
            hasChanges = true;
          }
        }
      } catch (e) {
        console.warn("[ensureMediaCloudUrls] Failed to upload custom song to cloud:", e);
      }
    }
  }

  // 3. Ensure scrapbook photos are cloud URLs
  if (Array.isArray(updated.journalPages)) {
    const nextPages = await Promise.all(
      updated.journalPages.map(async (page) => {
        const nextData = { ...(page.data || {}) };
        let pageChanged = false;

        for (const [key, val] of Object.entries(nextData)) {
          if (typeof val === "string" && (val.startsWith("data:image") || val.startsWith("blob:"))) {
            try {
              const res = await fetch(val);
              const blob = await res.blob();
              const cloudUrl = await uploadImageToCloud(blob);
              if (cloudUrl && cloudUrl.startsWith("http")) {
                nextData[key] = cloudUrl;
                pageChanged = true;
                hasChanges = true;
              }
            } catch (e) {
              console.warn(`[ensureMediaCloudUrls] Failed to upload page photo [${key}]:`, e);
            }
          }
        }

        const nextPhotos = await Promise.all(
          (page.photos || []).map(async (photo) => {
            if (typeof photo === "string" && (photo.startsWith("data:image") || photo.startsWith("blob:"))) {
              try {
                const res = await fetch(photo);
                const blob = await res.blob();
                const cloudUrl = await uploadImageToCloud(blob);
                if (cloudUrl && cloudUrl.startsWith("http")) {
                  pageChanged = true;
                  hasChanges = true;
                  return cloudUrl;
                }
              } catch (e) {
                console.warn("[ensureMediaCloudUrls] Failed to upload page photo array item:", e);
              }
            }
            return photo;
          })
        );

        if (pageChanged) {
          return { ...page, data: nextData, photos: nextPhotos };
        }
        return page;
      })
    );
    if (hasChanges) {
      updated.journalPages = nextPages;
    }
  }

  // 4. Ensure mailbox items (voice, song, photo) are cloud URLs
  if (Array.isArray(updated.mailboxItems)) {
    const nextMailbox = await Promise.all(
      updated.mailboxItems.map(async (item) => {
        const nextItem = { ...item };
        let itemChanged = false;

        // Voice URL
        if (nextItem.voiceUrl && (nextItem.voiceUrl.startsWith("idb:") || nextItem.voiceUrl.startsWith("blob:") || nextItem.voiceUrl.startsWith("data:"))) {
          try {
            let blob: Blob | null = null;
            if (nextItem.voiceUrl.startsWith("idb:")) {
              const key = nextItem.voiceUrl.replace("idb:", "");
              blob = await getAudioBlob(key);
            } else {
              const res = await fetch(nextItem.voiceUrl);
              blob = await res.blob();
            }
            if (blob) {
              const cloudUrl = await uploadAudioToCloud(blob, `voice_${item.id}.mp3`);
              if (cloudUrl && cloudUrl.startsWith("http")) {
                nextItem.voiceUrl = cloudUrl;
                itemChanged = true;
                hasChanges = true;
              }
            }
          } catch (e) {
            console.warn(`[ensureMediaCloudUrls] Failed to upload mailbox voice [${item.id}]:`, e);
          }
        }

        // Audio URL
        if (nextItem.audioUrl && (nextItem.audioUrl.startsWith("idb:") || nextItem.audioUrl.startsWith("blob:") || nextItem.audioUrl.startsWith("data:"))) {
          try {
            let blob: Blob | null = null;
            if (nextItem.audioUrl.startsWith("idb:")) {
              const key = nextItem.audioUrl.replace("idb:", "");
              blob = await getAudioBlob(key);
            } else {
              const res = await fetch(nextItem.audioUrl);
              blob = await res.blob();
            }
            if (blob) {
              const cloudUrl = await uploadAudioToCloud(blob, `audio_${item.id}.mp3`);
              if (cloudUrl && cloudUrl.startsWith("http")) {
                nextItem.audioUrl = cloudUrl;
                itemChanged = true;
                hasChanges = true;
              }
            }
          } catch (e) {
            console.warn(`[ensureMediaCloudUrls] Failed to upload mailbox audio [${item.id}]:`, e);
          }
        }

        // Photo URL
        if (nextItem.photoUrl && (nextItem.photoUrl.startsWith("blob:") || nextItem.photoUrl.startsWith("data:image"))) {
          try {
            const res = await fetch(nextItem.photoUrl);
            const blob = await res.blob();
            const cloudUrl = await uploadImageToCloud(blob);
            if (cloudUrl && cloudUrl.startsWith("http")) {
              nextItem.photoUrl = cloudUrl;
              itemChanged = true;
              hasChanges = true;
            }
          } catch (e) {
            console.warn(`[ensureMediaCloudUrls] Failed to upload mailbox photo [${item.id}]:`, e);
          }
        }

        return itemChanged ? nextItem : item;
      })
    );
    if (hasChanges) {
      updated.mailboxItems = nextMailbox;
    }
  }

  if (hasChanges) {
    saveGiftProject(updated);
  }
  return updated;
}

export async function persistGiftProject(project: GiftProject): Promise<GiftProject> {
  reportCloudStatus("syncing");

  // 1. Ensure all media are converted to public cloud URLs
  let next = { ...project };
  try {
    next = await ensureMediaCloudUrls(project);
  } catch (err) {
    console.warn("[persistGiftProject] ensureMediaCloudUrls partial error:", err);
  }
  next.updatedAt = Date.now();

  // 2. Upload full project JSON to Catbox (free, instant, permanent, CORS *)
  let catboxUrl: string | null = null;
  try {
    catboxUrl = await saveProjectJsonToCatbox(next.projectId, next);
    if (catboxUrl) {
      next.cloudUrl = catboxUrl;
    }
  } catch (catboxErr) {
    console.warn("[persistGiftProject] Catbox JSON save failed:", catboxErr);
  }

  // 3. Save to Supabase Storage if configured
  if (isSupabaseConfigured()) {
    try {
      await saveProjectJsonToSupabaseStorage(next.projectId, next);
    } catch (supabaseErr) {
      console.warn("[persistGiftProject] Supabase Storage save failed:", supabaseErr);
    }
  }

  saveGiftProject(next);
  reportCloudStatus("saved");
  return next;
}

export async function loadCloudGiftProject(id: string, cloudUrl?: string): Promise<GiftProject> {
  if (!id && !cloudUrl) return loadGiftProject();
  reportCloudStatus("syncing");

  let projectData: any = null;

  // 1. If explicit cloudUrl is provided, fetch it directly!
  if (cloudUrl && cloudUrl.startsWith("http")) {
    try {
      projectData = await loadProjectJsonFromUrl(cloudUrl);
    } catch (e) {
      console.warn("[loadCloudGiftProject] Failed to fetch project from cloudUrl:", e);
    }
  }

  // 2. Primary: Load project JSON directly from Supabase Storage
  if (!projectData && isSupabaseConfigured() && id) {
    try {
      projectData = await loadProjectJsonFromSupabaseStorage(id);
    } catch (e) {
      console.warn("[loadCloudGiftProject] Supabase Storage fetch failed:", e);
    }
  }

  // 3. Fallback: Edge Function endpoint if available
  if (!projectData && isSupabaseConfigured() && id) {
    try {
      const response = await fetch(`${API_URL}/projects/${id}`, { headers });
      if (response.ok) {
        const body = await response.json();
        projectData = body?.project;
      }
    } catch {}
  }

  // 4. Fallback: Check local storage
  const local = loadGiftProject();
  if (!projectData) {
    if (local && (local.projectId === id || !id)) {
      reportCloudStatus("saved");
      return local;
    }
    reportCloudStatus("offline");
    return local || emptyProject();
  }

  let urlEditToken = "";
  if (typeof window !== "undefined") {
    const searchParams = new URLSearchParams(window.location.search);
    urlEditToken = searchParams.get("edit") || "";
    if (!urlEditToken && window.location.hash.includes("?")) {
      const hashQuery = window.location.hash.substring(window.location.hash.indexOf("?"));
      urlEditToken = new URLSearchParams(hashQuery).get("edit") || "";
    }
  }
  const editToken = (local.projectId === id && local.editToken) ? local.editToken : (urlEditToken || local.editToken || "");

  // Smart merge: if cloud has custom song URL, use it; otherwise retain local song
  const mergedSongUrl = (projectData.customSongUrl && typeof projectData.customSongUrl === "string" && projectData.customSongUrl.startsWith("http"))
    ? projectData.customSongUrl
    : (local.projectId === id && local.customSongUrl ? local.customSongUrl : projectData.customSongUrl || null);

  const mergedSongName = projectData.customSongName || (local.projectId === id ? local.customSongName : null);
  const mergedSongYt = projectData.customSongYoutubeId !== undefined ? projectData.customSongYoutubeId : (local.projectId === id ? local.customSongYoutubeId : null);

  // Merge mailbox items to keep any newly uploaded URLs
  let mergedMailboxItems = projectData.mailboxItems;
  if (Array.isArray(projectData.mailboxItems) && Array.isArray(local.mailboxItems) && local.projectId === id) {
    mergedMailboxItems = projectData.mailboxItems.map((item: any) => {
      const localMatch = local.mailboxItems?.find((li: any) => li.id === item.id || (item.puppetId && li.puppetId === item.puppetId));
      if (!localMatch) return item;
      return {
        ...localMatch,
        ...item,
        audioUrl: item.audioUrl || localMatch.audioUrl,
        voiceUrl: item.voiceUrl || localMatch.voiceUrl,
        photoUrl: item.photoUrl || localMatch.photoUrl,
      };
    });
  }

  const next = normalize({
    ...projectData,
    projectId: id,
    editToken,
    customSongUrl: mergedSongUrl,
    customSongName: mergedSongName,
    customSongYoutubeId: mergedSongYt,
    mailboxItems: mergedMailboxItems || projectData.mailboxItems,
    cloudUrl: cloudUrl || projectData.cloudUrl || local.cloudUrl || null,
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}

  reportCloudStatus("saved");
  return next;
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
