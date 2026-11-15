/**
 * Browser IndexedDB storage for offline & instant local audio playback.
 */
const DB_NAME = "MakeAWishAudioDB";
const STORE_NAME = "audio_blobs";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not supported"));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveAudioBlob(key: string, blob: Blob | File): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Could not cache audio in IndexedDB:", err);
  }
}

export async function getAudioBlob(key: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function getAudioObjectUrl(key: string): Promise<string | null> {
  const blob = await getAudioBlob(key);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

/**
 * Resolves an audio URL whether it is a remote HTTPS URL, a base64 data URL, an IndexedDB key (idb:key),
 * or a dead blob URL that needs restoration from IndexedDB.
 */
export async function resolveAudioPlaybackUrl(url?: string | null, fallbackKey?: string): Promise<string | null> {
  if (!url) {
    if (fallbackKey) return getAudioObjectUrl(fallbackKey);
    return null;
  }
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  if (url.startsWith("idb:")) {
    const key = url.replace("idb:", "");
    const objUrl = await getAudioObjectUrl(key);
    if (objUrl) return objUrl;
    if (fallbackKey && fallbackKey !== key) {
      return getAudioObjectUrl(fallbackKey);
    }
    return null;
  }
  if (url.startsWith("blob:") && fallbackKey) {
    // Dead blob URL after page reload — restore fresh blob URL from IndexedDB
    const objUrl = await getAudioObjectUrl(fallbackKey);
    if (objUrl) return objUrl;
  }
  return url;
}
