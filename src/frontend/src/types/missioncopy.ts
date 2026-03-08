export const BATCHES = [
  "9th",
  "10th",
  "Drona JEE 11th",
  "Drona NEET 11th",
] as const;

export const SECTIONS = ["Lecture", "PDF", "Doubt Solving"] as const;

export type Batch = (typeof BATCHES)[number];
export type Section = (typeof SECTIONS)[number];

export interface ContentItem {
  id: string;
  batch: string;
  section: string;
  title: string;
  fileType: "video" | "pdf";
  fileData: string; // base64 data URL: "data:video/mp4;base64,..." or "data:application/pdf;base64,..."
  uploadedAt: number;
}

export interface InviteToken {
  code: string;
  batch: string;
  createdAt: number;
}

export const ADMIN_PASSWORD = "missioncopy@admin";
export const ADMIN_SESSION_KEY = "missioncopy_admin_session";
export const CONTENT_STORAGE_KEY = "missioncopy_content";
export const INVITES_STORAGE_KEY = "missioncopy_invites";
