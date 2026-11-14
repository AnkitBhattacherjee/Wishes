/**
 * Reliable cloud image uploader — multiple free providers with automatic fallback.
 * All images are pre-compressed to WebP/JPEG before upload for faster transfer.
 *
 * Provider priority:
 * 1. Catbox.moe     — Permanent, direct URL, CORS-friendly
 * 2. 0x0.st         — Permanent, direct URL
 * 3. tmpfiles.org   — Fast, direct /dl/ link
 * 4. Litterbox      — 72-hour temporary
 * 5. Filebin.net    — Bin-based host
 * 6. Supabase       — Only if properly configured
 */

import { isSupabaseConfigured, uploadToSupabaseStorage } from "./supabaseStorage";

/**
 * Pre-compress image to WebP/JPEG Blob for fast upload
 */
export async function compressImageToBlob(
  file: File | Blob,
  maxDimension = 1200,
  quality = 0.82
): Promise<{ blob: Blob; fileName: string; previewUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to parse image data"));
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not initialize canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({
                blob,
                fileName: `photo_${Date.now()}.webp`,
                previewUrl: URL.createObjectURL(blob),
              });
            } else {
              canvas.toBlob(
                (jpegBlob) => {
                  if (jpegBlob) {
                    resolve({
                      blob: jpegBlob,
                      fileName: `photo_${Date.now()}.jpg`,
                      previewUrl: URL.createObjectURL(jpegBlob),
                    });
                  } else {
                    reject(new Error("Failed to create image blob"));
                  }
                },
                "image/jpeg",
                0.85
              );
            }
          },
          "image/webp",
          quality
        );
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

// ─── Provider 1: Catbox.moe (PERMANENT) ───
async function uploadToCatbox(blob: Blob, fileName: string): Promise<string> {
  console.log("[Image Cloud] 🔄 Trying Catbox.moe...");
  const formData = new FormData();
  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", blob, fileName);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);

  try {
    const res = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Catbox HTTP ${res.status}`);
    const text = (await res.text()).trim();
    if (text.startsWith("http")) {
      console.log("[Image Cloud] ✅ Catbox success:", text);
      return text;
    }
    throw new Error(`Catbox returned: ${text.slice(0, 100)}`);
  } finally {
    clearTimeout(timer);
  }
}

// ─── Provider 2: 0x0.st (PERMANENT) ───
async function uploadTo0x0(blob: Blob, fileName: string): Promise<string> {
  console.log("[Image Cloud] 🔄 Trying 0x0.st...");
  const formData = new FormData();
  formData.append("file", blob, fileName);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);

  try {
    const res = await fetch("https://0x0.st", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`0x0.st HTTP ${res.status}`);
    const url = (await res.text()).trim();
    if (url.startsWith("http")) {
      console.log("[Image Cloud] ✅ 0x0.st success:", url);
      return url;
    }
    throw new Error(`0x0.st returned: ${url.slice(0, 100)}`);
  } finally {
    clearTimeout(timer);
  }
}

// ─── Provider 3: tmpfiles.org ───
async function uploadToTmpFiles(blob: Blob, fileName: string): Promise<string> {
  console.log("[Image Cloud] 🔄 Trying tmpfiles.org...");
  const formData = new FormData();
  formData.append("file", blob, fileName);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

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
      console.log("[Image Cloud] ✅ tmpfiles success:", directUrl);
      return directUrl;
    }
    throw new Error("No URL in tmpfiles response");
  } finally {
    clearTimeout(timer);
  }
}

// ─── Provider 4: Litterbox (72h temp) ───
async function uploadToLitterbox(blob: Blob, fileName: string): Promise<string> {
  console.log("[Image Cloud] 🔄 Trying Litterbox...");
  const formData = new FormData();
  formData.append("reqtype", "fileupload");
  formData.append("time", "72h");
  formData.append("fileToUpload", blob, fileName);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch("https://litterbox.catbox.moe/resources/internals/api.php", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Litterbox HTTP ${res.status}`);
    const text = (await res.text()).trim();
    if (text.startsWith("http")) {
      console.log("[Image Cloud] ✅ Litterbox success:", text);
      return text;
    }
    throw new Error(`Litterbox returned: ${text.slice(0, 100)}`);
  } finally {
    clearTimeout(timer);
  }
}

// ─── Provider 5: Filebin.net ───
async function uploadToFilebin(blob: Blob, fileName: string): Promise<string> {
  console.log("[Image Cloud] 🔄 Trying Filebin.net...");
  const binId = "wish-img-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`https://filebin.net/${binId}/${cleanName}`, {
      method: "POST",
      headers: { "Content-Type": blob.type || "image/webp" },
      body: blob,
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Filebin HTTP ${res.status}`);
    const url = `https://filebin.net/${binId}/${cleanName}`;
    console.log("[Image Cloud] ✅ Filebin success:", url);
    return url;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Upload an image with pre-compression and multi-provider fallback.
 * Returns a permanent HTTPS URL, or a compact base64 data URL as last resort.
 */
export async function uploadImageToCloud(file: File | Blob): Promise<string> {
  const { blob, fileName } = await compressImageToBlob(file, 1200, 0.82);
  console.log(`[Image Cloud] 📸 Starting upload: "${fileName}" (${(blob.size / 1024).toFixed(1)}KB)`);

  const providers: { name: string; fn: () => Promise<string> }[] = [
    { name: "catbox", fn: () => uploadToCatbox(blob, fileName) },
    { name: "0x0.st", fn: () => uploadTo0x0(blob, fileName) },
    { name: "tmpfiles", fn: () => uploadToTmpFiles(blob, fileName) },
    { name: "litterbox", fn: () => uploadToLitterbox(blob, fileName) },
    { name: "filebin", fn: () => uploadToFilebin(blob, fileName) },
  ];

  if (isSupabaseConfigured()) {
    providers.push({
      name: "supabase",
      fn: () => uploadToSupabaseStorage(blob, "wish-media", fileName),
    });
  }

  const errors: string[] = [];

  for (const provider of providers) {
    try {
      const url = await provider.fn();
      if (url && url.startsWith("http")) {
        console.log(`[Image Cloud] 🎉 UPLOAD SUCCESS via ${provider.name}: ${url}`);
        return url;
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.warn(`[Image Cloud] ❌ ${provider.name} failed: ${msg}`);
      errors.push(`${provider.name}: ${msg}`);
    }
  }

  console.warn("[Image Cloud] ⚠️ All cloud providers failed, creating micro base64 fallback:", errors);

  // Last resort: ultra-compressed micro-WebP base64 (<20KB) that fits in share token
  const compact = await compressImageToBlob(file, 480, 0.55);
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(compact.blob);
  });
}
