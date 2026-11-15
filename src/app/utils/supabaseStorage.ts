import { projectId, publicAnonKey } from "../../../utils/supabase/info";

/**
 * Resolves the Supabase base URL whether the user provides a project ID or a full URL.
 */
export function getSupabaseBaseUrl(): string {
  const raw = (projectId || "").trim();
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw.replace(/\/+$/, "");
  }
  const cleanId = raw.replace(".supabase.co", "").trim();
  return `https://${cleanId}.supabase.co`;
}

/**
 * Checks if a real, user-configured Supabase project is set.
 */
export function isSupabaseConfigured(): boolean {
  if (!projectId || !publicAnonKey) return false;
  if (projectId === "ntzwbdmeklynoxbczgch") return false;
  if (projectId.includes("YOUR_") || publicAnonKey.includes("YOUR_")) return false;
  return true;
}

let cachedBuckets: string[] | null = null;
let lastBucketCheck = 0;

/**
 * Fetch available storage buckets from the user's Supabase project.
 * Uses 30-second in-memory cache to keep requests fast and prevent redundant calls.
 */
export async function getAvailableBuckets(): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  if (cachedBuckets && Date.now() - lastBucketCheck < 30000) {
    return cachedBuckets;
  }
  try {
    const baseUrl = getSupabaseBaseUrl();
    const res = await fetch(`${baseUrl}/storage/v1/bucket`, {
      method: "GET",
      headers: {
        apikey: publicAnonKey,
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        cachedBuckets = data.map((b: any) => b.name || b.id).filter(Boolean);
        lastBucketCheck = Date.now();
        return cachedBuckets;
      }
    }
  } catch (e) {
    console.warn("[Supabase Storage] Could not query bucket list:", e);
  }
  return [];
}

/**
 * Upload any File or Blob directly to Supabase Storage via standard REST API.
 * Uses a unique timestamped filename so uploads are always unique INSERTS and never
 * conflict with existing files or require UPDATE RLS policies.
 */
export async function uploadToSupabaseStorage(
  file: File | Blob,
  preferredBucket = "wish-photos",
  customFileName?: string
): Promise<string> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured with a valid project ID and key.");
  }

  const rawExt = customFileName
    ? customFileName.split(".").pop()
    : file instanceof File && file.name.includes(".")
    ? file.name.split(".").pop()
    : file.type.includes("webp")
    ? "webp"
    : file.type.includes("png")
    ? "png"
    : file.type.includes("audio") || file.type.includes("mpeg")
    ? "mp3"
    : file.type.includes("webm")
    ? "webm"
    : "jpg";

  const cleanExt = (rawExt || "jpg").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  const isAudio =
    (file.type && file.type.startsWith("audio/")) ||
    cleanExt === "mp3" ||
    cleanExt === "webm" ||
    cleanExt === "wav" ||
    cleanExt === "m4a" ||
    cleanExt === "ogg";

  const prefix = isAudio ? "audio" : "photo";
  const uniqueId = `${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
  // Always unique path - guarantees INSERT (never UPDATE), avoiding RLS update restrictions
  const filePath = customFileName ? customFileName : `${prefix}_${uniqueId}.${cleanExt}`;
  const baseUrl = getSupabaseBaseUrl();

  // Dynamically check buckets that actually exist in the user's project
  const existingBuckets = await getAvailableBuckets();

  const candidateBuckets = existingBuckets.length > 0
    ? existingBuckets
    : Array.from(
        new Set([
          preferredBucket,
          "wish-photos",
          "wish-media",
          "photos",
          "images",
          "media",
          "public",
        ])
      );

  let lastError: Error | null = null;

  for (const bucketName of candidateBuckets) {
    try {
      const uploadEndpoint = `${baseUrl}/storage/v1/object/${bucketName}/${filePath}`;
      console.log(`[Supabase Storage] Attempting upload to bucket [${bucketName}]:`, filePath);

      const res = await fetch(uploadEndpoint, {
        method: "POST",
        headers: {
          apikey: publicAnonKey,
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": file.type || (isAudio ? "audio/mpeg" : "image/webp"),
          "x-upsert": "true",
        },
        body: file,
      });

      if (res.ok) {
        const publicUrl = `${baseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
        console.log(`[Supabase Storage] ✅ Upload succeeded [${bucketName}]:`, publicUrl);
        return publicUrl;
      }

      const errorText = await res.text().catch(() => "");
      console.warn(`[Supabase Storage] ❌ [${bucketName}] HTTP ${res.status}: ${errorText}`);

      lastError = new Error(`Supabase [${bucketName}] upload returned ${res.status}: ${errorText}`);
      if (res.status === 404 || errorText.toLowerCase().includes("not found")) {
        continue;
      }
      break;
    } catch (err: any) {
      console.warn(`[Supabase Storage] ❌ Network error for [${bucketName}]:`, err?.message || err);
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error("Failed to upload to Supabase storage bucket.");
}

/**
 * Saves full project JSON to Supabase Storage bucket so any recipient can fetch it by projectId.
 */
export async function saveProjectJsonToSupabaseStorage(
  projectId: string,
  projectData: any
): Promise<string> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }
  const baseUrl = getSupabaseBaseUrl();
  const filePath = `projects/project_${projectId}.json`;
  const jsonBlob = new Blob([JSON.stringify(projectData)], { type: "application/json" });

  const existingBuckets = await getAvailableBuckets();
  const candidateBuckets = existingBuckets.length > 0
    ? existingBuckets
    : ["wish-photos", "wish-media", "photos", "public"];

  let lastError: Error | null = null;
  for (const bucketName of candidateBuckets) {
    try {
      const uploadEndpoint = `${baseUrl}/storage/v1/object/${bucketName}/${filePath}`;
      const res = await fetch(uploadEndpoint, {
        method: "POST",
        headers: {
          apikey: publicAnonKey,
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json",
          "x-upsert": "true",
        },
        body: jsonBlob,
      });

      if (res.ok) {
        const publicUrl = `${baseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
        console.log(`[Supabase Storage] ✅ Saved project JSON [${bucketName}]:`, publicUrl);
        return publicUrl;
      }
      const errText = await res.text().catch(() => "");
      console.warn(`[Supabase Storage] Failed saving project JSON to [${bucketName}]:`, errText);
      lastError = new Error(errText);
    } catch (e: any) {
      lastError = e;
    }
  }
  throw lastError || new Error("Failed to save project JSON to Supabase Storage");
}

/**
 * Loads full project JSON from Supabase Storage by projectId.
 */
export async function loadProjectJsonFromSupabaseStorage(
  projectId: string
): Promise<any> {
  if (!isSupabaseConfigured() || !projectId) return null;
  const baseUrl = getSupabaseBaseUrl();
  const filePath = `projects/project_${projectId}.json`;

  const existingBuckets = await getAvailableBuckets();
  const candidateBuckets = existingBuckets.length > 0
    ? existingBuckets
    : ["wish-photos", "wish-media", "photos", "public"];

  for (const bucketName of candidateBuckets) {
    try {
      // 1. Try public URL with cache-busting timestamp
      const publicUrl = `${baseUrl}/storage/v1/object/public/${bucketName}/${filePath}?t=${Date.now()}`;
      const res = await fetch(publicUrl);
      if (res.ok) {
        const data = await res.json();
        if (data && (data.recipient || data.projectId)) {
          console.log(`[Supabase Storage] ✅ Loaded project JSON from public [${bucketName}]`);
          return data;
        }
      }

      // 2. Try authenticated download with apikey in case bucket is private
      const authUrl = `${baseUrl}/storage/v1/object/${bucketName}/${filePath}?t=${Date.now()}`;
      const authRes = await fetch(authUrl, {
        headers: {
          apikey: publicAnonKey,
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      if (authRes.ok) {
        const data = await authRes.json();
        if (data && (data.recipient || data.projectId)) {
          console.log(`[Supabase Storage] ✅ Loaded project JSON with apikey from [${bucketName}]`);
          return data;
        }
      }
    } catch (err) {
      console.warn(`[Supabase Storage] Could not fetch project from [${bucketName}]:`, err);
    }
  }
  return null;
}

const SCRAPBOOK_API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-8601d715/scrapbooks`;

/**
 * Saves scrapbook pages and wish project metadata directly to Supabase Edge Function KV Store.
 * Returns the generated 12-character ID.
 */
export async function saveScrapbookToSupabase(pages: any[]): Promise<{ id: string; expiresAt: number }> {
  const res = await fetch(SCRAPBOOK_API_URL, {
    method: "POST",
    headers: {
      apikey: publicAnonKey,
      Authorization: `Bearer ${publicAnonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pages }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Supabase Edge Function save failed (${res.status}): ${errText}`);
  }

  const result = await res.json();
  console.log(`[Supabase Edge Function] ✅ Saved scrapbook with ID:`, result.id);
  return result;
}

/**
 * Loads scrapbook pages and wish project metadata from Supabase Edge Function KV Store by 12-char ID.
 */
export async function loadScrapbookFromSupabase(id: string): Promise<any> {
  if (!id || !/^[a-z0-9]{12}$/i.test(id)) return null;

  try {
    const res = await fetch(`${SCRAPBOOK_API_URL}/${encodeURIComponent(id)}`, {
      headers: {
        apikey: publicAnonKey,
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`[Supabase Edge Function] ✅ Loaded scrapbook [${id}] with ${data.pages?.length || 0} pages`);
      return data;
    }
  } catch (err) {
    console.warn(`[Supabase Edge Function] Could not fetch scrapbook [${id}]:`, err);
  }
  return null;
}

/**
 * Saves project JSON to Catbox (free, permanent, zero-auth, CORS *).
 */
export async function saveProjectJsonToCatbox(
  projectId: string,
  projectData: any
): Promise<string> {
  const jsonBlob = new Blob([JSON.stringify(projectData)], { type: "application/json" });
  const formData = new FormData();
  formData.append("reqtype", "fileupload");
  formData.append("userhash", "");
  formData.append("fileToUpload", jsonBlob, `project_${projectId}.json`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Catbox status ${res.status}`);
    const text = (await res.text()).trim();
    if (text.startsWith("http")) {
      console.log(`[Catbox Storage] ✅ Saved project JSON:`, text);
      return text;
    }
    throw new Error("Invalid response from Catbox");
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Loads project JSON directly from a cloud URL (Catbox or any HTTPS URL).
 */
export async function loadProjectJsonFromUrl(url: string): Promise<any> {
  if (!url || !url.startsWith("http")) return null;
  try {
    const separator = url.includes("?") ? "&" : "?";
    const fetchUrl = `${url}${separator}t=${Date.now()}`;
    const res = await fetch(fetchUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && (data.recipient || data.projectId)) {
        console.log(`[Cloud Storage] ✅ Loaded project JSON from URL:`, url);
        return data;
      }
    }
  } catch (err) {
    console.warn(`[Cloud Storage] Could not fetch project from URL [${url}]:`, err);
  }
  return null;
}
