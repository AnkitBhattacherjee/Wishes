/* ── Audio Stream Extractors for YouTube, Suno AI, and Direct Audio ── */

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
 * Checks if the media URL is an MP4/video stream (such as Suno AI's CDN)
 * which requires a video container element for 100% native hardware audio decoding.
 */
export function isVideoMedia(url: string | null | undefined): boolean {
  if (!url) return false;
  return /\.mp4(?:\?.*)?$/i.test(url) || /cdn\d*\.suno\.ai/i.test(url);
}

/**
 * Converts a Suno AI song URL (or direct CDN/audio URL) into a direct,
 * cross-origin playable audio stream that requires NO login and NO redirect.
 *
 * NOTE: Suno returns 403 Forbidden on direct .mp3 links, but serves the full
 * pristine audio stream with open CORS on its corresponding .mp4 stream!
 */
export function extractSunoAudioUrl(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Any Suno 36-char UUID (found in suno.com/song/[UUID], suno.com/create?song=[UUID], etc.)
  const uuidMatch = trimmed.match(/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/i);
  if (uuidMatch && uuidMatch[1]) {
    // Return direct MP4 stream which contains full audio and open CORS (200 OK)
    return `https://cdn1.suno.ai/${uuidMatch[1]}.mp4`;
  }

  // Already a direct Suno CDN mp4 link
  if (/^https?:\/\/(?:cdn\d*|audiopipe)\.suno\.ai\/.+\.mp4$/i.test(trimmed)) {
    return trimmed;
  }

  // If user pasted a cdn1.suno.ai/...mp3 link, convert to .mp4 to avoid 403 Forbidden
  const cdnMp3Match = trimmed.match(/^https?:\/\/(?:cdn\d*|audiopipe)\.suno\.ai\/(.+)\.mp3$/i);
  if (cdnMp3Match && cdnMp3Match[1]) {
    return `https://cdn1.suno.ai/${cdnMp3Match[1]}.mp4`;
  }

  // Any direct audio stream link (.mp3, .wav, .ogg, .m4a, .mp4)
  if (/^https?:\/\/.+\.(mp3|wav|ogg|m4a|mp4)(?:\?.*)?$/i.test(trimmed)) {
    return trimmed;
  }

  return null;
}
