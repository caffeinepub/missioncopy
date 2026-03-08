# MISSIONCOPY

## Current State
- Admin can upload MP4/PDF files; content metadata is saved in localStorage, file blobs in browser IndexedDB.
- StudentView reads content from the same localStorage/IndexedDB on the student's device.
- Because storage is device-local, content uploaded by admin never appears on any student device.
- 4 batches: Class 9th, Class 10th, Drona JEE 11th, Drona NEET 11th.
- 3 sections per batch: Lecture, PDF, Doubt Solving.
- Admin password: missioncopy@admin (hardcoded check).
- Students select a batch from the landing page and view content with no login.

## Requested Changes (Diff)

### Add
- Motoko backend canister that stores content metadata and file blobs persistently, accessible from any device.
- Backend functions: uploadContent (title, batch, section, fileType, blob chunks), getContentList (batch, section) returning metadata, getFileChunk (id, chunkIndex) for streaming file retrieval, deleteContent (id, adminPassword).
- Chunked upload/download so large files (up to ~50 MB practical limit per IC message size) work.
- Admin password verification done on backend for delete.

### Modify
- AdminDashboard: replace localStorage/IndexedDB writes with backend upload calls; show real upload progress via chunked upload; list content from backend.
- StudentView: load content list from backend on mount; load file data from backend when item is opened.
- storage.ts: keep as thin wrapper or remove entirely, backend is the source of truth.

### Remove
- All localStorage and IndexedDB usage for content data (CONTENT_STORAGE_KEY, openDB, saveFileData, getFileData, deleteFileData, saveContent, addContentItem from local storage).

## Implementation Plan
1. Generate Motoko backend with: content metadata store (id, batch, section, title, fileType, uploadedAt), file chunk store (id -> [Blob]), uploadChunk/finalizeUpload/getContentList/getFileChunk/deleteContent functions, admin password check for delete.
2. Update frontend storage utils to use backend actor calls.
3. Update AdminDashboard to upload via chunked backend calls with progress.
4. Update StudentView to fetch content list and file chunks from backend.
5. Validate and deploy.
