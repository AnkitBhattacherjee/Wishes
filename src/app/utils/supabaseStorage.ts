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

/**
 * Upload any File or Blob directly to Supabase Storage via standard REST API.
 * Uses a unique timestamped filename so uploads are always INSERTS and never
 * conflict with existing files or require UPDATE RLS policies.
 */
export async function uploadToSupabaseStorage(
  file: File | Blob,
  preferredBucket = "wish-media",
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
  const filePath = `${prefix}_${uniqueId}.${cleanExt}`;
  const baseUrl = getSupabaseBaseUrl();

  const candidateBuckets = Array.from(
    new Set([
      preferredBucket,
      "wish-media",
      "wish-photos",
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

      // If bucket 404, try quick auto-creation in case anon key has permission
      if (res.status === 404 || errorText.toLowerCase().includes("not found")) {
        try {
          await fetch(`${baseUrl}/storage/v1/bucket`, {
            method: "POST",
            headers: {
              apikey: publicAnonKey,
              Authorization: `Bearer ${publicAnonKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: bucketName, name: bucketName, public: true }),
          });
        } catch {}
      }

      lastError = new Error(`Supabase [${bucketName}] upload returned ${res.status}: ${errorText}`);
      continue;
    } catch (err: any) {
      console.warn(`[Supabase Storage] ❌ Network error for [${bucketName}]:`, err?.message || err);
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error("Failed to upload to Supabase storage bucket.");
}
