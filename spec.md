# MISSIONCOPY

## Current State
New project. No existing backend or frontend.

## Requested Changes (Diff)

### Add
- Admin authentication with hardcoded password `missioncopy@admin` (no username field)
- 4 batches: 9th, 10th, Drona JEE 11th, Drona NEET 11th
- 3 sections per batch: Lecture, PDF, Doubt Solving
- Admin can upload MP4 videos to Lecture and Doubt Solving sections
- Admin can upload PDFs to PDF section
- Admin can upload MP4 videos or PDFs to any section (flexible)
- Admin can generate invite links per batch
- Students access the platform via invite link (no signup/login needed)
- Students can only view content for the batch their invite link is associated with
- Content items have title, file, and upload date
- Admin dashboard to manage all batches, sections, and content

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Select components: blob-storage (for video/PDF uploads), invite-links (for batch-scoped student access), authorization (for admin login)
2. Generate Motoko backend:
   - Admin auth with hardcoded password check
   - Batch data model (4 fixed batches)
   - Section data model (3 fixed sections per batch: Lecture, PDF, Doubt Solving)
   - Content items linked to batch + section, storing blob reference, title, upload date, file type
   - Invite link generation per batch (using invite-links component)
   - Student access: validate invite link and return batch-scoped content
3. Build frontend:
   - Landing page: admin login form + student invite link entry
   - Admin dashboard: batch tabs, section tabs, upload UI, invite link generator
   - Student view: batch content viewer, section tabs, video player, PDF viewer
   - Black/red/white branding throughout
