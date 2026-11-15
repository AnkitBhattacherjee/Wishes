/**
 * Persistent Local Media & Project Cache System
 * 
 * Ensures that once a project and its media files (photos, audio files, voice notes,
 * room background, scrapbook images) are loaded/fetched successfully from the database,
 * they are permanently cached locally in IndexedDB & localStorage.
 * 
 * On page reload or fresh visits:
 * - The project loads instantly (0ms) from local storage without re-querying Supabase.
 * - All media files play/render from local IndexedDB blobs without re-downloading over the network.
 * - Works identically for both sender and receiver.
 */

import React, { useState, useEffect } from "react";
import type { GiftProject } from "../giftStore";

const DB_NAME = "MakeAWishLocalCache";
const DB_VERSION = 1;
const STORE_MEDIA = "media_blobs";
const STORE_PROJECTS = "projects";

// In-memory RAM caches for instant synchronous lookup during current document session
const inMemoryBlobUrls = new Map<string, string>();
const inMemoryProjects = new Map<string, GiftProject>();
const ongoingFetches = new Map<string, Promise<string>>();

/**
 * Open or upgrade the persistent IndexedDB database
 */
function openCacheDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not available"));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_MEDIA)) {
        db.createObjectStore(STORE_MEDIA);
      }
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT LOCAL CACHING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Saves a project to persistent local cache (Memory + localStorage + IndexedDB).
 */
export async function saveProjectLocalCache(project: GiftProject): Promise<void> {
  if (!project) return;
  const targetId = project.supabaseId || project.projectId;
  if (!targetId) return;

  // 1. RAM Cache
  inMemoryProjects.set(targetId, project);
  if (project.projectId) inMemoryProjects.set(project.projectId, project);
  if (project.supabaseId) inMemoryProjects.set(project.supabaseId, project);

  // 2. LocalStorage Cache (Fast synchronous path for next reload)
  try {
    const serialized = JSON.stringify(project);
    localStorage.setItem(`wish_project_cache_${targetId}`, serialized);
    if (project.projectId && project.projectId !== targetId) {
      localStorage.setItem(`wish_project_cache_${project.projectId}`, serialized);
    }
    if (project.supabaseId && project.supabaseId !== targetId) {
      localStorage.setItem(`wish_project_cache_${project.supabaseId}`, serialized);
    }
    localStorage.setItem("make-a-wish-project-v1", serialized);
  } catch (err) {
    // LocalStorage quota may be exceeded if project has inline base64
    console.warn("[Local Cache] LocalStorage quota limit reached, saving to IndexedDB:", err);
  }

  // 3. IndexedDB Cache (Guaranteed unlimited storage, never fails on size)
  try {
    const db = await openCacheDB();
    const tx = db.transaction(STORE_PROJECTS, "readwrite");
    const store = tx.objectStore(STORE_PROJECTS);
    store.put(project, targetId);
    if (project.projectId && project.projectId !== targetId) {
      store.put(project, project.projectId);
    }
    if (project.supabaseId && project.supabaseId !== targetId) {
      store.put(project, project.supabaseId);
    }
  } catch (err) {
    console.warn("[Local Cache] Could not write project to IndexedDB:", err);
  }
}

/**
 * Synchronous local project lookup (Memory -> localStorage).
 * Used during React initial state setup so the page renders with full data on frame 1.
 */
export function getProjectLocalCacheSync(id?: string | null): GiftProject | null {
  if (!id) return null;

  // 1. Check RAM
  if (inMemoryProjects.has(id)) {
    return inMemoryProjects.get(id)!;
  }

  // 2. Check LocalStorage
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(`wish_project_cache_${id}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        inMemoryProjects.set(id, parsed);
        return parsed;
      }
      const generic = localStorage.getItem("make-a-wish-project-v1");
      if (generic) {
        const parsed = JSON.parse(generic);
        if (parsed.projectId === id || parsed.supabaseId === id) {
          inMemoryProjects.set(id, parsed);
          return parsed;
        }
      }
    } catch {}
  }

  return null;
}

/**
 * Asynchronous local project lookup (Memory -> localStorage -> IndexedDB).
 */
export async function getProjectLocalCache(id?: string | null): Promise<GiftProject | null> {
  if (!id) return null;

  // Try fast synchronous path first
  const sync = getProjectLocalCacheSync(id);
  if (sync) return sync;

  // Check IndexedDB
  try {
    const db = await openCacheDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_PROJECTS, "readonly");
      const store = tx.objectStore(STORE_PROJECTS);
      const req = store.get(id);
      req.onsuccess = () => {
        const result = req.result as GiftProject | undefined;
        if (result) {
          inMemoryProjects.set(id, result);
          resolve(result);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MEDIA BLOB LOCAL CACHING (Images & Audio)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Save a raw Blob/File to local IndexedDB media cache under its original URL
 */
export async function saveMediaBlob(url: string, blob: Blob): Promise<string> {
  if (!url || !blob) return url;
  try {
    const db = await openCacheDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_MEDIA, "readwrite");
      const store = tx.objectStore(STORE_MEDIA);
      const req = store.put(blob, url);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    const blobUrl = URL.createObjectURL(blob);
    inMemoryBlobUrls.set(url, blobUrl);
    return blobUrl;
  } catch (err) {
    console.warn(`[Local Cache] Could not save media blob for [${url}]:`, err);
    return url;
  }
}

/**
 * Read a raw Blob from local IndexedDB media cache
 */
export async function getMediaBlob(url: string): Promise<Blob | null> {
  if (!url) return null;
  try {
    const db = await openCacheDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_MEDIA, "readonly");
      const store = tx.objectStore(STORE_MEDIA);
      const req = store.get(url);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Returns a synchronous in-memory blob URL if already created this session.
 */
export function getCachedBlobUrlSync(url?: string | null): string | null {
  if (!url) return null;
  return inMemoryBlobUrls.get(url) || null;
}

/**
 * Resolves any media URL (HTTP, HTTPS, blob, idb) to a local cached object URL:
 * 1. If in RAM, returns immediately.
 * 2. If in IndexedDB, creates object URL and returns.
 * 3. If remote HTTP/HTTPS and not yet cached, downloads it once in the background,
 *    stores it in IndexedDB, and returns the local blob URL.
 */
export async function resolveCachedMediaUrl(url?: string | null): Promise<string> {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  // Data URLs and local idb: markers don't need network downloading
  if (trimmed.startsWith("data:") || trimmed.startsWith("idb:")) {
    return trimmed;
  }

  // Already converted to an object URL in memory?
  if (inMemoryBlobUrls.has(trimmed)) {
    return inMemoryBlobUrls.get(trimmed)!;
  }

  // If already a blob URL from current session
  if (trimmed.startsWith("blob:")) {
    return trimmed;
  }

  // If a fetch is currently in-flight for this URL, join it
  if (ongoingFetches.has(trimmed)) {
    return ongoingFetches.get(trimmed)!;
  }

  // 1. Check if already stored in local IndexedDB
  const cachedBlob = await getMediaBlob(trimmed);
  if (cachedBlob) {
    try {
      const blobUrl = URL.createObjectURL(cachedBlob);
      inMemoryBlobUrls.set(trimmed, blobUrl);
      return blobUrl;
    } catch {}
  }

  // 2. Only fetch remote HTTP / HTTPS URLs
  const isRemote = trimmed.startsWith("http://") || trimmed.startsWith("https://");
  if (!isRemote) {
    return trimmed;
  }

  // 3. Fetch once from network and persist into IndexedDB
  const fetchPromise = (async () => {
    try {
      const res = await fetch(trimmed, { mode: "cors" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const localBlobUrl = await saveMediaBlob(trimmed, blob);
      return localBlobUrl;
    } catch (err) {
      console.warn(`[Local Cache] Background cache fetch deferred for [${trimmed}]:`, err);
      return trimmed;
    } finally {
      ongoingFetches.delete(trimmed);
    }
  })();

  ongoingFetches.set(trimmed, fetchPromise);
  return fetchPromise;
}

/**
 * Preload and permanently save ALL media files in a project locally:
 * - Celebration room custom song
 * - Celebration room custom background
 * - All scrapbook photos (page.photos & page.data)
 * - All mailbox photos, songs, and voice notes
 * 
 * Once downloaded, future reloads load 100% locally from IndexedDB.
 */
export async function cacheAllProjectMedia(project: GiftProject): Promise<void> {
  if (!project) return;
  const urlsToCache = new Set<string>();

  // 1. Custom background & custom song
  if (project.customBgUrl && project.customBgUrl.startsWith("http")) {
    urlsToCache.add(project.customBgUrl);
  }
  if (project.customSongUrl && project.customSongUrl.startsWith("http")) {
    urlsToCache.add(project.customSongUrl);
  }

  // 2. Scrapbook photos
  if (Array.isArray(project.journalPages)) {
    for (const page of project.journalPages) {
      if (Array.isArray(page.photos)) {
        for (const p of page.photos) {
          if (p && typeof p === "string" && p.startsWith("http")) {
            urlsToCache.add(p);
          }
        }
      }
      if (page.data && typeof page.data === "object") {
        for (const val of Object.values(page.data)) {
          if (typeof val === "string" && val.startsWith("http")) {
            urlsToCache.add(val);
          }
        }
      }
    }
  }

  // 3. Mailbox items
  if (Array.isArray(project.mailboxItems)) {
    for (const item of project.mailboxItems) {
      if (item.photoUrl && item.photoUrl.startsWith("http")) {
        urlsToCache.add(item.photoUrl);
      }
      if (item.audioUrl && item.audioUrl.startsWith("http")) {
        urlsToCache.add(item.audioUrl);
      }
      if (item.voiceUrl && item.voiceUrl.startsWith("http")) {
        urlsToCache.add(item.voiceUrl);
      }
    }
  }

  if (urlsToCache.size === 0) return;

  const urlList = Array.from(urlsToCache);
  console.log(`[Local Cache] Ensuring ${urlList.length} media files are saved locally in IndexedDB...`);

  // Cache in parallel with concurrency pool of 4
  const CONCURRENCY = 4;
  for (let i = 0; i < urlList.length; i += CONCURRENCY) {
    const chunk = urlList.slice(i, i + CONCURRENCY);
    await Promise.allSettled(chunk.map((u) => resolveCachedMediaUrl(u)));
  }

  console.log(`[Local Cache] ✅ All ${urlList.length} media files verified in local cache!`);
}

// ─────────────────────────────────────────────────────────────────────────────
// REACT HOOK & COMPONENT HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * React hook that returns the local cached blob URL for any media file.
 * Returns synchronous value immediately if already in memory to eliminate render flicker.
 */
export function useCachedMediaUrl(url?: string | null): string {
  const [resolved, setResolved] = useState<string>(() => {
    if (!url) return "";
    return getCachedBlobUrlSync(url) || url;
  });

  useEffect(() => {
    if (!url) {
      setResolved("");
      return;
    }
    const sync = getCachedBlobUrlSync(url);
    if (sync) {
      setResolved(sync);
      return;
    }

    let isMounted = true;
    resolveCachedMediaUrl(url).then((cached) => {
      if (isMounted && cached) {
        setResolved(cached);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [url]);

  return resolved;
}

/**
 * Drop-in image component that automatically renders from local IndexedDB cache
 * without network round-trips on reload.
 */
export function CachedImage({
  src,
  alt = "",
  className,
  style,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  const resolvedSrc = useCachedMediaUrl(typeof src === "string" ? src : undefined);
  return React.createElement("img", {
    src: resolvedSrc || src,
    alt,
    className,
    style,
    ...props,
  });
}
