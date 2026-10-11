// IndexedDB storage for custom user-uploaded ambient music (MP3, WAV, AAC, etc.)
// Persists user audio files across browser sessions and refreshes without size limits.

const DB_NAME = 'CountToAudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'custom_audio';
const AUDIO_KEY = 'ambient_theme_track';

export interface StoredAudioMeta {
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: number;
}

let cachedObjectUrl: string | null = null;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save user uploaded audio file to IndexedDB
 */
export async function saveCustomAudio(file: File): Promise<StoredAudioMeta> {
  const db = await openDB();

  if (cachedObjectUrl) {
    URL.revokeObjectURL(cachedObjectUrl);
    cachedObjectUrl = null;
  }

  const record = {
    id: AUDIO_KEY,
    name: file.name,
    blob: file,
    size: file.size,
    type: file.type || 'audio/mpeg',
    uploadedAt: Date.now()
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const putReq = store.put(record);

    putReq.onsuccess = () => {
      cachedObjectUrl = URL.createObjectURL(file);
      resolve({
        name: record.name,
        url: cachedObjectUrl,
        size: record.size,
        type: record.type,
        uploadedAt: record.uploadedAt
      });
    };

    putReq.onerror = () => reject(putReq.error);
  });
}

/**
 * Retrieve saved custom audio file from IndexedDB
 */
export async function getCustomAudio(): Promise<StoredAudioMeta | null> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(AUDIO_KEY);

      getReq.onsuccess = () => {
        const result = getReq.result;
        if (!result || !result.blob) {
          resolve(null);
          return;
        }

        if (cachedObjectUrl) {
          URL.revokeObjectURL(cachedObjectUrl);
        }
        cachedObjectUrl = URL.createObjectURL(result.blob);

        resolve({
          name: result.name || 'Özel Ses Dosyası',
          url: cachedObjectUrl,
          size: result.size || 0,
          type: result.type || 'audio/mpeg',
          uploadedAt: result.uploadedAt || Date.now()
        });
      };

      getReq.onerror = () => reject(getReq.error);
    });
  } catch (err) {
    console.warn('Failed to load custom audio from IndexedDB:', err);
    return null;
  }
}

/**
 * Delete custom audio file from IndexedDB
 */
export async function deleteCustomAudio(): Promise<void> {
  try {
    const db = await openDB();

    if (cachedObjectUrl) {
      URL.revokeObjectURL(cachedObjectUrl);
      cachedObjectUrl = null;
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const delReq = store.delete(AUDIO_KEY);

      delReq.onsuccess = () => resolve();
      delReq.onerror = () => reject(delReq.error);
    });
  } catch (err) {
    console.warn('Failed to delete custom audio from IndexedDB:', err);
  }
}
