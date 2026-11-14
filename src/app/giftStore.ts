import { projectId as supabaseProjectId, publicAnonKey } from "../../utils/supabase/info";
import { uploadAudioToCloud } from "./utils/audioCloudUpload";

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
    sender: "Your Special Person",
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
    sender: "Your Special Person",
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
    const json = JSON.stringify(safeProject);
    const bytes = new TextEncoder().encode(json);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch {
    return project.projectId;
  }
}

function decodeSharedProject(value: string): GiftProject | null {
  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return normalize(JSON.parse(new TextDecoder().decode(bytes)));
  } catch {
    return null;
  }
}

export function loadGiftProject(): GiftProject {
  let shared: string | null = null;
  let editParam: string | null = null;
  if (typeof window !== "undefined") {
    const searchParams = new URLSearchParams(window.location.search);
    shared = searchParams.get("gift");
    editParam = searchParams.get("edit");
    if (window.location.hash.includes("?")) {
      const hashQuery = window.location.hash.substring(window.location.hash.indexOf("?"));
      const hashParams = new URLSearchParams(hashQuery);
      if (!shared) shared = hashParams.get("gift");
      if (!editParam) editParam = hashParams.get("edit");
    }
  }

  if (shared) {
    const looksLikeId = /^[0-9a-f-]{30,40}$/i.test(shared);
    if (!looksLikeId) {
      const decoded = decodeSharedProject(shared);
      if (decoded) {
        if (editParam) {
          decoded.editToken = editParam;
        }
        return decoded;
      }
    }
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      const parsed = cached ? normalize(JSON.parse(cached)) : null;
      if (parsed?.projectId === shared) {
        if (editParam && !parsed.editToken) {
          parsed.editToken = editParam;
        }
        return parsed;
      }
    } catch {
      // Continue with a public cloud placeholder.
    }
    return { ...emptyProject(), projectId: shared, editToken: editParam || "" };
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? normalize(JSON.parse(saved)) : emptyProject();
  } catch {
    return emptyProject();
  }
}

export function saveGiftProject(project: GiftProject) {
  const next = { ...project, updatedAt: Date.now() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // If localStorage quota is reached, strip oversized data URLs so settings are never lost
    try {
      const sanitized = { ...next };
      if (sanitized.customSongUrl && sanitized.customSongUrl.startsWith("data:")) {
        sanitized.customSongUrl = "idb:room_custom_song";
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
  const token = encodeSharedProject(sealed);
  if (typeof window === "undefined") {
    return `#/wish?gift=${token}`;
  }
  const origin = window.location.origin;
  let pathname = window.location.pathname || "";
  if (/\.html$/i.test(pathname)) {
    pathname = pathname.substring(0, pathname.lastIndexOf("/"));
  }
  pathname = pathname.replace(/\/+$/, "");
  return `${origin}${pathname}/#/wish?gift=${token}`;
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
        const maxSide = 960;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          try {
            resolve(canvas.toDataURL("image/webp", 0.82));
            return;
          } catch {}
          resolve(canvas.toDataURL("image/jpeg", 0.85));
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

export async function persistGiftProject(project: GiftProject) {
  if (!project.editToken) return project;
  if (Date.now() < cloudUnavailableUntil) {
    reportCloudStatus("offline");
    throw new Error("Cloud sync is temporarily unavailable");
  }
  reportCloudStatus("syncing");
  try {
    const response = await fetch(`${API_URL}/projects/${project.projectId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ editToken: project.editToken, project }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || body.message || "Save failed");
    }
    cloudUnavailableUntil = 0;
    reportCloudStatus("saved");
    return project;
  } catch (error) {
    cloudUnavailableUntil = Date.now() + 30_000;
    reportCloudStatus("offline");
    throw error;
  }
}

export async function loadCloudGiftProject(id: string): Promise<GiftProject> {
  reportCloudStatus("syncing");
  try {
    const response = await fetch(`${API_URL}/projects/${id}`, { headers });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || body.message || "Gift not found");
    }
    const { project } = await response.json();
    const local = loadGiftProject();
    const editToken = local.projectId === id ? local.editToken : "";
    const next = normalize({ ...project, projectId: id, editToken });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    reportCloudStatus("saved");
    return next;
  } catch (error) {
    reportCloudStatus("offline");
    throw error;
  }
}

export async function uploadGiftPhoto(file: File): Promise<string> {
  return uploadGiftFile(file);
}

export async function uploadGiftFile(file: File | Blob, customMime?: string): Promise<string> {
  // If it's an audio file, upload to cloud audio storage directly
  const isAudio =
    (file instanceof File && file.type.startsWith("audio/")) ||
    (customMime && customMime.startsWith("audio/"));

  if (isAudio) {
    try {
      const cloudUrl = await uploadAudioToCloud(file);
      return cloudUrl;
    } catch (err) {
      console.warn("Cloud audio upload failed, falling back to local processing:", err);
    }
  }

  const project = loadGiftProject();
  let dataUrl: string;

  if (file instanceof File && file.type.startsWith("image/")) {
    dataUrl = await imageFileToDataUrl(file);
  } else {
    dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(file);
    });
  }

  if (!project.editToken) return dataUrl;
  await persistGiftProject(project).catch(() => {});

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(`${API_URL}/projects/${project.projectId}/files`, {
      method: "POST",
      headers,
      body: JSON.stringify({ editToken: project.editToken, dataUrl }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));
    if (!response.ok) return dataUrl;
    const body = await response.json();
    return body.url || dataUrl;
  } catch {
    return dataUrl;
  }
}
