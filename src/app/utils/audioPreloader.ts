/**
 * Audio Preloader & Cache System
 * 
 * Automatically retrieves and preloads audio files into browser memory and HTTP cache
 * as soon as the sealed gift link is opened, eliminating buffering latency for the receiver.
 */

import type { GiftProject } from "../giftStore";
import defaultBirthdaySong from "../../imports/birthday_celebration_custom.m4a";

// Track preloaded URLs to avoid duplicate network fetches
const preloadedUrls = new Set<string>();
const activePreloadPromises = new Map<string, Promise<string>>();
const preloadedBlobUrls = new Map<string, string>();
const preloadedAudioElements = new Map<string, HTMLAudioElement>();

/**
 * Preload a single audio URL into browser cache and pre-warm an HTMLAudioElement.
 * Returns a Promise that resolves with the playable URL (cached object URL or direct URL).
 */
export function preloadAudio(url?: string | null): Promise<string> {
  if (!url || typeof url !== "string") {
    return Promise.resolve("");
  }

  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith("idb:")) {
    return Promise.resolve(trimmed);
  }

  // Already cached as blob URL?
  if (preloadedBlobUrls.has(trimmed)) {
    return Promise.resolve(preloadedBlobUrls.get(trimmed)!);
  }

  // Already preloading?
  if (activePreloadPromises.has(trimmed)) {
    return activePreloadPromises.get(trimmed)!;
  }

  // Base64 data URLs don't need network preloading, just warm up an audio element
  if (trimmed.startsWith("data:audio")) {
    preloadedUrls.add(trimmed);
    try {
      const audio = new Audio();
      audio.preload = "auto";
      audio.src = trimmed;
      audio.load();
      preloadedAudioElements.set(trimmed, audio);
    } catch {}
    return Promise.resolve(trimmed);
  }

  // Handle HTTP / HTTPS or bundled static asset paths
  const isHttpOrAsset =
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("./");

  if (!isHttpOrAsset) {
    return Promise.resolve(trimmed);
  }

  const preloadPromise = new Promise<string>((resolve) => {
    let resolved = false;

    const finalize = (playableUrl: string) => {
      if (!resolved) {
        resolved = true;
        preloadedUrls.add(trimmed);
        activePreloadPromises.delete(trimmed);
        resolve(playableUrl);
      }
    };

    // 1. Pre-warm HTML5 Audio element for decoded audio engine readiness
    try {
      const audio = new Audio();
      audio.preload = "auto";
      audio.src = trimmed;

      const handleCanPlay = () => {
        preloadedAudioElements.set(trimmed, audio);
        finalize(trimmed);
      };

      audio.addEventListener("canplaythrough", handleCanPlay, { once: true });
      audio.addEventListener("loadeddata", handleCanPlay, { once: true });
      audio.addEventListener("error", () => {
        // Fall back gracefully even if decode fails
        finalize(trimmed);
      }, { once: true });

      audio.load();
    } catch {
      finalize(trimmed);
    }

    // 2. Fetch full file into browser HTTP & disk cache (with 15s timeout)
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeoutId = setTimeout(() => {
      controller?.abort();
      finalize(trimmed);
    }, 15000);

    fetch(trimmed, {
      mode: "cors",
      signal: controller?.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        clearTimeout(timeoutId);
        try {
          const blobUrl = URL.createObjectURL(blob);
          preloadedBlobUrls.set(trimmed, blobUrl);
          finalize(blobUrl);
        } catch {
          finalize(trimmed);
        }
      })
      .catch(() => {
        clearTimeout(timeoutId);
        // If fetch failed due to strict CORS headers on external CDN,
        // the HTML5 Audio tag will still stream it via range requests.
        finalize(trimmed);
      });
  });

  activePreloadPromises.set(trimmed, preloadPromise);
  return preloadPromise;
}

/**
 * Returns the cached object URL if one was created during preloading,
 * or the original URL.
 */
export function getPreloadedAudioUrl(url?: string | null): string {
  if (!url) return "";
  return preloadedBlobUrls.get(url) || url;
}

/**
 * Preload all audio assets in a gift project:
 * - Celebration room custom song (or default song)
 * - Mailbox music and voice notes
 * 
 * Called automatically as soon as the sealed gift link is opened on WishPage.
 */
export function preloadProjectAudios(project: Partial<GiftProject> | null | undefined): void {
  if (!project) return;

  // 1. Preload Default Celebration Song
  try {
    preloadAudio(defaultBirthdaySong);
  } catch {}

  // 2. Preload Custom Song for Celebration Room (Supabase or direct audio link)
  if (project.customSongUrl) {
    preloadAudio(project.customSongUrl);
  }

  // 3. Preload all audio and voice notes in Mailbox items
  if (Array.isArray(project.mailboxItems)) {
    for (const item of project.mailboxItems) {
      if (item.audioUrl && (item.audioUrl.startsWith("http") || item.audioUrl.startsWith("data:"))) {
        preloadAudio(item.audioUrl);
      }
      if (item.voiceUrl && (item.voiceUrl.startsWith("http") || item.voiceUrl.startsWith("data:"))) {
        preloadAudio(item.voiceUrl);
      }
    }
  }

  console.log("[AudioPreloader] Initiated background retrieval for project audio files.");
}
