import type { ContentItem } from "../types/missioncopy";
import type { StorageClient } from "./StorageClient";

export const LOCAL_MANIFEST_KEY = "missioncopy_manifest_v2";

export function getLocalManifestItems(): ContentItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_MANIFEST_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ContentItem[];
  } catch {
    return [];
  }
}

export function saveLocalManifestItems(items: ContentItem[]): void {
  try {
    localStorage.setItem(LOCAL_MANIFEST_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn("Could not save manifest to localStorage:", err);
  }
}

/**
 * Upload a file using the provided StorageClient.
 * onProgress receives a value 0..1.
 */
export async function uploadFile(
  client: StorageClient,
  file: File,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { hash } = await client.putFile(bytes, (pct) => {
    onProgress?.(pct / 100);
  });
  return hash;
}
