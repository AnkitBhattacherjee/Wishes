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
 * The default 'ntzwbdmeklynoxbczgch' was an ephemeral Figma Make demo project that expired.
 */
export function isSupabaseConfigured(): boolean {
  if (!projectId || !publicAnonKey) return false;
  // Ignore the expired Figma sandbox
  if (projectId === "ntzwbdmeklynoxbczgch") return false;
  // Ignore placeholder values
  if (projectId.includes("YOUR_") || publicAnonKey.includes("YOUR_")) return false;
  return true;
}

/**
 * Upload any File or Blob directly to Supabase Storage via standard REST API.
 * Tries 'wish-media' first, and falls back to 'wish-photos'.
 * 
 * Requirements on Supabase:
 * 1. A storage bucket named 'wish-media' or 'wish-photos'.
 * 2. Bucket set to "Public" so the receiver can view photos/listen to audio.
 * 3. An RLS insert policy allowing public uploads (or RLS disabled on storage.objects).
 */
export async function uploadToSupabaseStorage(
  file: File | Blob,
  preferredBucket = "wish-media",
  customFileName?: string
): Promise<string> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured with a valid project ID and key.");
  }

  const ext = customFileName
    ? customFileName.split(".").pop()
    : file instanceof File && file.name.includes(".")
    ? file.name.split(".").pop()
    : file.type.includes("webp")
    ? "webp"
    : file.type.includes("png")
    ? "png"
    : file.type.includes("audio") || file.type.includes("mpeg")
    ? "mp3"
    : "jpg";

  const randomId = crypto.randomUUID().slice(0, 12);
  const fileName = customFileName || `upload_${Date.now()}_${randomId}.${ext}`;
  const filePath = `${fileName}`;
  const baseUrl = getSupabaseBaseUrl();

  const candidateBuckets = [preferredBucket, preferredBucket === "wish-media" ? "wish-photos" : "wish-media"];

  let lastError: Error | null = null;

  for (const bucketName of candidateBuckets) {
    try {
      const uploadEndpoint = `${baseUrl}/storage/v1/object/${bucketName}/${filePath}`;
      const res = await fetch(uploadEndpoint, {
        method: "POST",
        headers: {
          apikey: publicAnonKey,
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": file.type || "application/octet-stream",
          "x-upsert": "true",
        },
        body: file,
      });

      if (res.ok) {
        // Return public permanent URL
        const publicUrl = `${baseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
        console.log(`Successfully uploaded to Supabase bucket [${bucketName}]:`, publicUrl);
        return publicUrl;
      }

      const errorText = await res.text().catch(() => "");
      lastError = new Error(`Supabase [${bucketName}] upload returned ${res.status}: ${errorText}`);
      // If bucket doesn't exist (404), continue loop to try the other candidate bucket
      if (res.status === 404 || errorText.toLowerCase().includes("not found")) {
        continue;
      }
      // If RLS blocked or other error, break and throw
      break;
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to upload to Supabase storage bucket.");
}
