import type { ContentItem } from "@/types/missioncopy";
import type { StorageClient } from "@/utils/StorageClient";

// ─── localStorage keys ─────────────────────────────────────────────────────
export const MANIFEST_HASH_KEY = "missioncopy_manifest_hash";
export const MANIFEST_ITEMS_KEY = "missioncopy_content_items";

// ─── Manifest structure ────────────────────────────────────────────────────
export interface Manifest {
  items: ContentItem[];
  updatedAt: number;
}

// ─── File upload via StorageClient ────────────────────────────────────────
// Streams file in segments to avoid a single giant memory allocation.
export async function uploadFile(
  storageClient: StorageClient,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const SEGMENT = 16 * 1024 * 1024; // 16 MB per read
  const totalSize = file.size;

  if (totalSize <= SEGMENT) {
    // Small/medium file: read all at once
    const buf = await file.arrayBuffer();
    const { hash } = await storageClient.putFile(
      new Uint8Array(buf),
      onProgress,
    );
    return hash;
  }

  // Large file (>16 MB): read in segments then concatenate
  const allChunks: Uint8Array[] = [];
  let readBytes = 0;
  for (let offset = 0; offset < totalSize; offset += SEGMENT) {
    const slice = file.slice(offset, Math.min(offset + SEGMENT, totalSize));
    const buf = await slice.arrayBuffer();
    allChunks.push(new Uint8Array(buf));
    readBytes += buf.byteLength;
    if (onProgress) onProgress((readBytes / totalSize) * 0.3); // 0–30% reading
  }

  const merged = new Uint8Array(totalSize);
  let pos = 0;
  for (const chunk of allChunks) {
    merged.set(chunk, pos);
    pos += chunk.length;
  }

  const { hash } = await storageClient.putFile(merged, (pct) => {
    if (onProgress) onProgress(0.3 + pct * 0.7); // 30–100% uploading
  });

  return hash;
}

// ─── Manifest upload / fetch ──────────────────────────────────────────────
export async function uploadManifest(
  storageClient: StorageClient,
  items: ContentItem[],
): Promise<string> {
  const manifest: Manifest = { items, updatedAt: Date.now() };
  const bytes = new TextEncoder().encode(JSON.stringify(manifest));
  const { hash } = await storageClient.putFile(bytes);
  return hash;
}

export async function fetchManifest(
  storageClient: StorageClient,
  manifestHash: string,
): Promise<ContentItem[]> {
  const url = await storageClient.getDirectURL(manifestHash);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch manifest: ${res.statusText}`);
  const manifest = (await res.json()) as Manifest;
  return manifest.items;
}

// ─── localStorage helpers ─────────────────────────────────────────────────
export function getLocalManifestHash(): string | null {
  try {
    return localStorage.getItem(MANIFEST_HASH_KEY);
  } catch {
    return null;
  }
}

export function saveLocalManifestHash(hash: string): void {
  try {
    localStorage.setItem(MANIFEST_HASH_KEY, hash);
  } catch {
    // ignore
  }
}

export function getLocalManifestItems(): ContentItem[] {
  try {
    const raw = localStorage.getItem(MANIFEST_ITEMS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ContentItem[];
  } catch {
    return [];
  }
}

export function saveLocalManifestItems(items: ContentItem[]): void {
  try {
    localStorage.setItem(MANIFEST_ITEMS_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}
