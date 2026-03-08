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
  fileHash: string; // Caffeine blob storage hash e.g. "sha256:abc123..."
  uploadedAt: number;
}

export const ADMIN_PASSWORD = "missioncopy@admin";
export const ADMIN_SESSION_KEY = "missioncopy_admin_session";
export const CONTENT_STORAGE_KEY = "missioncopy_content";

// Batch display info
export const BATCH_INFO: Record<
  string,
  { label: string; subtitle: string; tag: string }
> = {
  "9th": {
    label: "Class 9th",
    subtitle: "Foundation Course",
    tag: "CLASS IX",
  },
  "10th": {
    label: "Class 10th",
    subtitle: "Board Preparation",
    tag: "CLASS X",
  },
  "Drona JEE 11th": {
    label: "Drona JEE",
    subtitle: "11th — Engineering",
    tag: "JEE",
  },
  "Drona NEET 11th": {
    label: "Drona NEET",
    subtitle: "11th — Medical",
    tag: "NEET",
  },
};
