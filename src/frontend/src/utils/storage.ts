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
export async function uploadFile(
  storageClient: StorageClient,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { hash } = await storageClient.putFile(bytes, onProgress);
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
