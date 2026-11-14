import { isSupabaseConfigured, uploadToSupabaseStorage } from "./supabaseStorage";

/**
 * Fast & reliable cloud audio uploader for custom user songs and audio files.
 * Uses user's personal Supabase Storage if configured; falls back to fast direct streaming audio providers.
 */

// Provider 1: tmpfiles.org (Fast upload, returns direct download/stream link)
async function uploadToTmpFiles(file: File | Blob, fileName: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file, fileName);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch("https://tmpfiles.org/api/v1/upload", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`tmpfiles status ${res.status}`);
    const json = await res.json();
    if (json?.data?.url) {
      // Direct streaming URL replaces tmpfiles.org/ with tmpfiles.org/dl/
      return String(json.data.url).replace("tmpfiles.org/", "tmpfiles.org/dl/");
    }
    throw new Error("No URL in tmpfiles response");
  } finally {
    clearTimeout(timer);
  }
}

// Provider 2: Catbox Permanent (Free direct audio streaming host)
async function uploadToCatbox(file: File | Blob, fileName: string): Promise<string> {
  const formData = new FormData();
  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", file, fileName);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 16000);

  try {
    const res = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`catbox status ${res.status}`);
    const text = (await res.text()).trim();
    if (text.startsWith("http")) {
      return text;
    }
    throw new Error("Invalid response from catbox");
  } finally {
    clearTimeout(timer);
  }
}

// Provider 3: Catbox Litterbox (72-hour direct audio streaming link)
async function uploadToLitterbox(file: File | Blob, fileName: string): Promise<string> {
  const formData = new FormData();
  formData.append("reqtype", "fileupload");
  formData.append("time", "72h");
  formData.append("fileToUpload", file, fileName);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch("https://litterbox.catbox.moe/resources/internals/api.php", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`litterbox status ${res.status}`);
    const text = (await res.text()).trim();
    if (text.startsWith("http")) {
      return text;
    }
    throw new Error("Invalid response from litterbox");
  } finally {
    clearTimeout(timer);
  }
}

// Provider 4: Filebin (Alternative streaming host)
async function uploadToFilebin(file: File | Blob, fileName: string): Promise<string> {
  const binId = "wish-" + Math.random().toString(36).substring(2, 10);
  const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`https://filebin.net/${binId}/${cleanName}`, {
      method: "POST",
      headers: {
        "Content-Type": file.type || "audio/mpeg",
      },
      body: file,
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`filebin status ${res.status}`);
    return `https://filebin.net/${binId}/${cleanName}`;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Upload an audio file with automatic multi-provider fallback.
 */
export async function uploadAudioToCloud(file: File | Blob, originalName?: string): Promise<string> {
  const fileName =
    originalName ||
    (file instanceof File ? file.name : "custom-birthday-song.mp3");

  const providers: { name: string; fn: () => Promise<string> }[] = [];

  if (isSupabaseConfigured()) {
    providers.push({
      name: "supabase-storage",
      fn: () => uploadToSupabaseStorage(file, "wish-media", fileName),
    });
  }

  providers.push(
    { name: "tmpfiles", fn: () => uploadToTmpFiles(file, fileName) },
    { name: "catbox", fn: () => uploadToCatbox(file, fileName) },
    { name: "litterbox", fn: () => uploadToLitterbox(file, fileName) },
    { name: "filebin", fn: () => uploadToFilebin(file, fileName) },
  );

  for (const provider of providers) {
    try {
      const url = await provider.fn();
      if (url && url.startsWith("http")) {
        return url;
      }
    } catch (err) {
      console.warn(`Audio upload via ${provider.name} failed, trying next provider...`, err);
    }
  }

  throw new Error("Unable to upload audio to cloud storage. Please check your internet connection or use a YouTube/audio link.");
}
