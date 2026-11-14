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
 * Converts a Suno AI song URL (or direct CDN/audio URL) into a direct,
 * cross-origin playable MP3 audio stream that requires NO login and NO redirect.
 */
export function extractSunoAudioUrl(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Already a direct Suno CDN link
  if (/^https?:\/\/(?:cdn1|audiopipe)\.suno\.ai\/.+\.mp3$/i.test(trimmed)) {
    return trimmed;
  }

  // Standard Suno song share link: https://suno.com/song/[UUID] or https://app.suno.ai/song/[UUID]
  const songMatch = trimmed.match(/(?:suno\.com|suno\.ai)\/song\/([0-9a-fA-F-]{32,36})/i);
  if (songMatch && songMatch[1]) {
    return `https://cdn1.suno.ai/${songMatch[1]}.mp3`;
  }

  // Short Suno share link: https://suno.com/s/[SHORT-ID]
  const shortMatch = trimmed.match(/(?:suno\.com|suno\.ai)\/s\/([a-zA-Z0-9_-]+)/i);
  if (shortMatch && shortMatch[1]) {
    return `https://cdn1.suno.ai/${shortMatch[1]}.mp3`;
  }

  // Any direct audio stream link (.mp3, .wav, .ogg, .m4a)
  if (/^https?:\/\/.+\.(mp3|wav|ogg|m4a)(?:\?.*)?$/i.test(trimmed)) {
    return trimmed;
  }

  return null;
}

