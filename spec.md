# MISSIONCOPY

## Current State
The app has admin upload working (files go to blob storage). The backend has `setContentItems(json)` and `getContentItems()` Motoko methods to store/retrieve the content list so students on any device can see it. However these methods were never included in the generated `backend.d.ts`/`backend.ts` bindings. The frontend casts around this using `actor as unknown as ActorWithContent`, but at runtime the `Backend` class wrapper does NOT have these methods — only the raw Candid actor inside it does. This means `setContentItems` calls silently fail, so students never see content uploaded by admin.

## Requested Changes (Diff)

### Add
- `setContentItems(json: string): Promise<void>` to the backend bindings
- `getContentItems(): Promise<string>` to the backend bindings

### Modify
- Regenerate `backend.d.ts` and `backend.ts` to include the two content methods
- Remove the `ActorWithContent` interface hack in AdminDashboard and StudentView; use the properly typed `actor` directly

### Remove
- `ActorWithContent` interface in AdminDashboard.tsx and StudentView.tsx (replaced by proper bindings)

## Implementation Plan
1. Regenerate Motoko backend code so the bindgen picks up `setContentItems` and `getContentItems` in the generated TypeScript bindings
2. Update AdminDashboard.tsx: remove `ActorWithContent` cast, call `actor.setContentItems(json)` directly
3. Update StudentView.tsx: remove `ActorWithContent` cast, call `actor.getContentItems()` directly
4. Validate, build, and deploy
