# MISSIONCOPY

## Current State
- 4 batches: 9th, 10th, Drona JEE 11th, Drona NEET 11th
- 3 sections per batch: Lecture, PDF, Doubt Solving
- Admin can upload MP4/PDF via a dialog, stored as base64 in localStorage
- Students access via invite link (URL param `?invite=CODE`) or by entering a code on the landing page
- LandingPage has a "Student Access" card with invite code input field
- StudentEnrollmentPage shows a welcome screen before entering the batch
- StudentView shows content by section using tabs
- Upload size is limited only by FileReader/localStorage practical limits (no explicit cap)

## Requested Changes (Diff)

### Add
- After enrollment, students should land directly on the batch content view (StudentView) without needing to click "Enter Batch" — the enrollment step should auto-proceed or be removed entirely
- Batch class-wise section navigation inside StudentView: after the student is assigned to a batch, they see that batch's sections (Lecture, PDF, Doubt Solving) immediately with full direct access to content
- Upload size limit increased to 1GB (update any file size warning/hint text to reflect 1GB)

### Modify
- **LandingPage**: Remove the entire "Student Access" card (invite code input + Access button). Landing page should only show the admin login button and branding. Students no longer enter via the landing page at all.
- **StudentEnrollmentPage**: Remove the "YOU'VE BEEN INVITED" badge and the "No signup required — click below" text. The page should auto-redirect to the batch content view immediately on load (call `onEnter` in a useEffect on mount), eliminating the "Enter Batch" button click requirement. Or simply skip the enrollment page and go straight to StudentView.
- **App.tsx**: When an invite code is detected in the URL, skip the enrollment step and go directly to `route: "student"` instead of `route: "enrollment"`.
- **AdminDashboard**: Update upload dialog hint text to mention 1GB support instead of implying small file sizes.
- **AdminDashboard**: Keep invite link generation for admin (admin still needs to generate links to share with students), but students no longer need to enter codes manually.

### Remove
- The "Student Access" invite code input card from the LandingPage
- The `handleStudentAccess` function and related state (`inviteCode`) from LandingPage
- The manual "Enter Batch" button requirement — enrollment should be automatic/instant
- Any text on the enrollment page that says "No signup required — click below to access your course materials"

## Implementation Plan
1. **App.tsx**: Change `parseInitialRoute` so that when `?invite=CODE` is found, set `route: "student"` directly (bypass enrollment). Also handle `?batch=...&token=...` path the same way.
2. **LandingPage.tsx**: Remove the "Student Access" card div entirely. Remove `inviteCode` state, `handleStudentAccess` function, and `findInviteByCode` import. Remove `onStudentAccess` prop (or keep it but unused — prefer removing it clean). Update the App.tsx call site to not pass `onStudentAccess`.
3. **StudentEnrollmentPage.tsx**: Either delete the file or convert it to auto-call `onEnter` via `useEffect` on mount (since App.tsx will skip it anyway). Clean approach: keep the file but auto-redirect, as a safe fallback.
4. **AdminDashboard.tsx**: Update the upload dropzone hint text from "Supports MP4 and PDF" to "Supports MP4 and PDF up to 1GB". Also remove the 5MB warning if any. Update file input to not restrict size.
5. **App.tsx `LandingPage` render**: Remove the `onStudentAccess` prop from LandingPage render since student access no longer goes through landing.
6. Ensure `StudentView` shows sections immediately with correct batch-filtered content via tabs — this is already implemented, just confirm it works without enrollment barrier.
