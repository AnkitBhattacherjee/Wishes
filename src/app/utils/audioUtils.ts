/* ── Audio Stream Extractors for YouTube, Suno AI, and Direct Audio ── */
import { projectId as supabaseProjectId, publicAnonKey } from "../../../utils/supabase/info";

const RESOLVER_API_URL = `https://${supabaseProjectId}.supabase.co/functions/v1/make-server-c194f93d/resolve-suno`;

/**
 * Extracts YouTube Video ID from any standard YouTube URL
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  );
  return match ? match[1] : null;
}

/**
 * Checks if a URL is a Suno AI song link
 */
export function isSunoUrl(url: string): boolean {
  if (!url) return false;
  return /(?:suno\.com|suno\.ai)/i.test(url);
}

/**
 * Checks if the media URL is an MP4/video stream
 */
export function isVideoMedia(url: string | null | undefined): boolean {
  if (!url) return false;
  return /\.mp4(?:\?.*)?$/i.test(url);
}

/**
 * Converts a Suno AI song URL (or direct CDN/audio URL) synchronously
 * into a direct playable audio stream that requires NO login and NO redirect.
 *
 * NOTE: Suno serves pristine AAC audio streams on its official CloudFront CDN:
 * https://d2lwuy8qc234o3.cloudfront.net/1/clip/[UUID].m4a
 */
export function extractSunoAudioUrl(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Any Suno 36-char UUID (found in suno.com/song/[UUID], suno.com/create?song=[UUID], etc.)
  const uuidMatch = trimmed.match(/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/i);
  if (uuidMatch && uuidMatch[1]) {
    return `https://d2lwuy8qc234o3.cloudfront.net/1/clip/${uuidMatch[1]}.m4a`;
  }

  // Already a direct CloudFront Suno m4a link
  if (/^https?:\/\/d2lwuy8qc234o3\.cloudfront\.net\/1\/clip\/.+\.m4a$/i.test(trimmed)) {
    return trimmed;
  }

  // Already a direct Suno CDN mp4 link
  if (/^https?:\/\/(?:cdn\d*|audiopipe)\.suno\.ai\/.+\.mp4$/i.test(trimmed)) {
    return trimmed;
  }

  // If user pasted a cdn1.suno.ai/...mp3 link, convert to .m4a to avoid 403 Forbidden
  const cdnMp3Match = trimmed.match(/^https?:\/\/(?:cdn\d*|audiopipe)\.suno\.ai\/([0-9a-fA-F-]{32,36})\.mp3$/i);
  if (cdnMp3Match && cdnMp3Match[1]) {
    return `https://d2lwuy8qc234o3.cloudfront.net/1/clip/${cdnMp3Match[1]}.m4a`;
  }

  // Any direct audio stream link (.mp3, .wav, .ogg, .m4a, .mp4)
  if (/^https?:\/\/.+\.(mp3|wav|ogg|m4a|mp4)(?:\?.*)?$/i.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Resolves any Suno link (including short links like suno.com/s/[CODE])
 * by following the redirect on the server and returning the direct stream.
 */
export async function resolveSunoAudioUrl(input: string): Promise<string | null> {
  if (!input) return null;
  const direct = extractSunoAudioUrl(input);
  if (direct) return direct;

  const trimmed = input.trim();
  // If it's a short link or Suno URL without explicit UUID:
  if (isSunoUrl(trimmed)) {
    try {
      const res = await fetch(`${RESOLVER_API_URL}?url=${encodeURIComponent(trimmed)}`, {
        headers: {
          apikey: publicAnonKey,
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.streamUrl) return data.streamUrl;
      }
    } catch (err) {
      console.warn("Server-side Suno resolution failed:", err);
    }
  }

  return null;
}
