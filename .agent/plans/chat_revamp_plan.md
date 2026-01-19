# Plan: Professional Chat Interface & Unread Count

This plan outlines the steps to overhaul the chat experience in "FoundIt!", enabling a WhatsApp-style interface and accurate unread message counts in the Navbar.

## 1. Database & Backend Updates

### A. Update `Message` Model
- Add an `isRead` field to the `Message` schema to track read status.
- **File**: `src/models/Message.ts`

### B. Update Chat List API
- Modify the `GET /api/chat/list/[email]` endpoint to:
    - Return a list of chats sorted by the *latest message timestamp*.
    - Include the **last message preview** and **timestamp** for each chat.
    - Include the **unread message count** for each chat (messages sent to the user that are `isRead: false`).
- **File**: `src/app/api/chat/list/[email]/route.ts`

### C. Create "Mark as Read" API
- Create a mechanism (new endpoint or update existing) to mark all messages in a specific chat as read when the user opens it.
- **Route**: `PATCH /api/chat/mark-read`

## 2. Frontend: Navbar Improvements

### A. Unread Badge Logic
- Update `Navbar.tsx` to sum up the `unreadCount` from all chats fetched.
- Display this total count on the Message icon instead of the total number of chats.
- **File**: `src/components/Navbar.tsx`

## 3. Frontend: Professional Chat Interface (WhatsApp Style)

### A. Layout Redesign
- Instead of a simple centered chat box, create a **Two-Pane Layout** (responsive: full width list on mobile, split on desktop).
    - **Sidebar (Left)**:
        - Header: User profile/actions.
        - Search: Filter chats.
        - List: Chat items showing:
            - Other user's name/avatar.
            - Last message text (truncated).
            - Time (e.g., "10:30 AM", "Yesterday").
            - Unread badge (green circle with number).
    - **Chat Window (Right)**:
        - Header: Current chat user & item details.
        - Message Area:
            - Bubbles with "tail" design.
            - Distinct colors for Sent (Green/Yellow) vs. Received (Gray/Dark).
            - Time stamps inside bubbles.
        - Input Area:
            - "Type a message..." input.
            - Send button (Paper plane).
            - (Optional) Attachment icon for future use.

### B. Implementation Details
- **File**: `src/app/chat/[claimId]/page.tsx` (Will likely become the main chat wrapper).
- We might need a new page `src/app/chat/page.tsx` for the "No chat selected" state if we go full-screen.

## 4. Execution Steps

1.  **Schema**: Add `isRead` to Message model.
2.  **API**: Update List API and create Mark Read API.
3.  **Navbar**: Fix the badge logic.
4.  **UI**: Build the new Chat Layout components.
