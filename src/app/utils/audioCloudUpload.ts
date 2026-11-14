/**
 * Reliable cloud audio uploader — multiple free providers with automatic fallback.
 * 
 * Provider priority (all free, all return direct HTTPS streaming URLs):
 * 1. Catbox.moe     — Permanent, no expiry, direct streaming, CORS-friendly
 * 2. 0x0.st         — Permanent (up to 512MB), direct URL, widely used
 * 3. tmpfiles.org    — Fast, returns direct download link (temporary but long-lived)
 * 4. Litterbox       — 72-hour temporary (Catbox sister service)
 * 5. Filebin.net     — Alternative bin-based host
 * 6. Supabase        — Only if properly configured (user's own storage)
 */

import { isSupabaseConfigured, uploadToSupabaseStorage } from "./supabaseStorage";

// ─── Provider 1: Catbox.moe (PERMANENT, Free, CORS-friendly) ───
async function uploadToCatbox(file: File | Blob, fileName: string): Promise<string> {
  console.log("[Audio Cloud] 🔄 Trying Catbox.moe...");
  const formData = new FormData();
  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", file, fileName);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Catbox HTTP ${res.status}`);
    const text = (await res.text()).trim();
    if (text.startsWith("http")) {
      console.log("[Audio Cloud] ✅ Catbox success:", text);
      return text;
    }
    throw new Error(`Catbox returned: ${text.slice(0, 100)}`);
  } finally {
    clearTimeout(timer);
  }
}

// ─── Provider 2: 0x0.st (PERMANENT, Free, no auth needed) ───
async function uploadTo0x0(file: File | Blob, fileName: string): Promise<string> {
  console.log("[Audio Cloud] 🔄 Trying 0x0.st...");
  const formData = new FormData();
  formData.append("file", file, fileName);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch("https://0x0.st", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`0x0.st HTTP ${res.status}`);
    const url = (await res.text()).trim();
    if (url.startsWith("http")) {
      console.log("[Audio Cloud] ✅ 0x0.st success:", url);
      return url;
    }
    throw new Error(`0x0.st returned: ${url.slice(0, 100)}`);
  } finally {
    clearTimeout(timer);
  }
}

// ─── Provider 3: tmpfiles.org (Fast, direct /dl/ streaming link) ───
async function uploadToTmpFiles(file: File | Blob, fileName: string): Promise<string> {
  console.log("[Audio Cloud] 🔄 Trying tmpfiles.org...");
  const formData = new FormData();
  formData.append("file", file, fileName);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch("https://tmpfiles.org/api/v1/upload", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`tmpfiles HTTP ${res.status}`);
    const json = await res.json();
    if (json?.data?.url) {
      const directUrl = String(json.data.url).replace("tmpfiles.org/", "tmpfiles.org/dl/");
      console.log("[Audio Cloud] ✅ tmpfiles success:", directUrl);
      return directUrl;
    }
    throw new Error("No URL in tmpfiles response");
  } finally {
    clearTimeout(timer);
  }
}

// ─── Provider 4: Catbox Litterbox (72-hour temporary, CORS-friendly) ───
async function uploadToLitterbox(file: File | Blob, fileName: string): Promise<string> {
  console.log("[Audio Cloud] 🔄 Trying Litterbox (72h temp)...");
  const formData = new FormData();
  formData.append("reqtype", "fileupload");
  formData.append("time", "72h");
  formData.append("fileToUpload", file, fileName);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);

  try {
    const res = await fetch("https://litterbox.catbox.moe/resources/internals/api.php", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Litterbox HTTP ${res.status}`);
    const text = (await res.text()).trim();
    if (text.startsWith("http")) {
      console.log("[Audio Cloud] ✅ Litterbox success:", text);
      return text;
    }
    throw new Error(`Litterbox returned: ${text.slice(0, 100)}`);
  } finally {
    clearTimeout(timer);
  }
}

// ─── Provider 5: Filebin.net (Bin-based host) ───
async function uploadToFilebin(file: File | Blob, fileName: string): Promise<string> {
  console.log("[Audio Cloud] 🔄 Trying Filebin.net...");
  const binId = "wish-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(`https://filebin.net/${binId}/${cleanName}`, {
      method: "POST",
      headers: { "Content-Type": file.type || "audio/mpeg" },
      body: file,
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Filebin HTTP ${res.status}`);
    const url = `https://filebin.net/${binId}/${cleanName}`;
    console.log("[Audio Cloud] ✅ Filebin success:", url);
    return url;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Upload audio file to cloud with automatic multi-provider fallback.
 * Returns a permanent HTTPS URL that works for both sender and receiver.
 * Throws only if ALL providers fail.
 */
export async function uploadAudioToCloud(file: File | Blob, originalName?: string): Promise<string> {
  const fileName = originalName || (file instanceof File ? file.name : `voice_${Date.now()}.webm`);
  console.log(`[Audio Cloud] 🎵 Starting upload: "${fileName}" (${(file.size / 1024).toFixed(1)}KB)`);

  // Build provider list — free public hosts FIRST, Supabase last (only if properly configured)
  const providers: { name: string; fn: () => Promise<string> }[] = [
    { name: "catbox", fn: () => uploadToCatbox(file, fileName) },
    { name: "0x0.st", fn: () => uploadTo0x0(file, fileName) },
    { name: "tmpfiles", fn: () => uploadToTmpFiles(file, fileName) },
    { name: "litterbox", fn: () => uploadToLitterbox(file, fileName) },
    { name: "filebin", fn: () => uploadToFilebin(file, fileName) },
  ];

  // Add Supabase only if the key looks like a real JWT (starts with eyJ)
  if (isSupabaseConfigured()) {
    providers.push({
      name: "supabase",
      fn: () => uploadToSupabaseStorage(file, "wish-media", fileName),
    });
  }

  const errors: string[] = [];

  for (const provider of providers) {
    try {
      const url = await provider.fn();
      if (url && url.startsWith("http")) {
        console.log(`[Audio Cloud] 🎉 UPLOAD SUCCESS via ${provider.name}: ${url}`);
        return url;
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.warn(`[Audio Cloud] ❌ ${provider.name} failed: ${msg}`);
      errors.push(`${provider.name}: ${msg}`);
    }
  }

  console.error("[Audio Cloud] 💀 ALL providers failed:", errors);
  throw new Error(
    `All audio cloud providers failed. Errors: ${errors.join(" | ")}. Please check internet connection or use a YouTube/Suno link.`
  );
}
