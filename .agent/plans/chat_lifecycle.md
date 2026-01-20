---
description: Implement Chat Lifecycle (Solved, Blocked, Context) for Native Chat
---

# Chat Lifecycle & Actions Plan

This plan outlines adding lifecycle management to the native chat system: Context, Resolution (Solved), and Moderation (Block).

## 1. Schema Updates
- **File**: `src/models/Claim.ts`
- **Changes**:
    - updates status enum to include `solved`.
    - Add `isBlocked` (boolean) and `blockedBy` (string/email).

## 2. Backend API
### A. Resolve / Mark Solved
- **Route**: `POST /api/claim/[id]/resolve`
- **Logic**:
    - Check if User is the Item Poster (Finder for Found, Owner for Lost).
    - Update `Claim.status` -> `solved`.
    - Update `Item.status` -> `resolved` (so it stops appearing in search).

### B. Block Chat
- **Route**: `POST /api/chat/block`
- **Logic**:
    - Toggle `isBlocked` on the Claim document.
    - Set `blockedBy` to the requestor.

## 3. Frontend Implementation
- **File**: `src/app/chat/[claimId]/page.tsx` (or the native client component)
- **Features**:
    - **Header Menu**: Three dots dropdown.
    - **Conditions**: 
        - Show "Mark Solved" ONLY if user is the *Poster*.
        - Show "Block" to both.
    - **Details Modal**: Show Item Image, Title, Description.
    - **Read-Only Mode**: If `status === 'solved'` or `isBlocked === true`, hide input box and show descriptive banner.

## 4. Execution Order
1.  Update `Claim` Model.
2.  Create API Endpoints (`resolve`, `block`).
3.  Update Frontend Chat Component.
