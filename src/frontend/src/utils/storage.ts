import {
  CONTENT_STORAGE_KEY,
  type ContentItem,
  INVITES_STORAGE_KEY,
  type InviteToken,
} from "@/types/missioncopy";

export function getContent(): ContentItem[] {
  try {
    const raw = localStorage.getItem(CONTENT_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ContentItem[];
  } catch {
    return [];
  }
}

export function saveContent(items: ContentItem[]): void {
  localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(items));
}

export function addContentItem(item: ContentItem): void {
  const items = getContent();
  items.push(item);
  saveContent(items);
}

export function deleteContentItem(id: string): void {
  const items = getContent().filter((i) => i.id !== id);
  saveContent(items);
}

export function getInvites(): InviteToken[] {
  try {
    const raw = localStorage.getItem(INVITES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as InviteToken[];
  } catch {
    return [];
  }
}

export function saveInvites(tokens: InviteToken[]): void {
  localStorage.setItem(INVITES_STORAGE_KEY, JSON.stringify(tokens));
}

export function addInviteToken(token: InviteToken): void {
  const tokens = getInvites();
  tokens.push(token);
  saveInvites(tokens);
}

export function findInviteByCode(code: string): InviteToken | undefined {
  return getInvites().find((t) => t.code === code);
}
