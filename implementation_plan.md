# Implementation Plan - Social PWA Frontend Expansion (Active)

This plan outlines the implementation of frontend features to complete the **Real-Time DM Chatting, Emoji Reactions, Disappearing Stories with Local Image Uploads, Interactive Polls**, and **Real-Time Notification System**.

---

## User Review Required

> [!IMPORTANT]
> - **Local Image Upload for Stories**: Clicking the "+" next to stories triggers a modern options modal allowing either:
>   - **Local Image Story**: Opens file chooser, converts selected image to a base64 string, and uploads it.
>   - **Text Story**: Allows entering text with custom gradient background selections.
> - **Reactions Overlay**: Hovering/holding the "Like" button displays a premium floating card with five custom emojis (`❤️`, `😂`, `🔥`, `😮`, `😢`).
> - **Interactive Polls**: Users can create multi-option polls (up to 4 options) when writing a post, and vote on other users' polls with real-time percentage animation bars.
> - **Sliding Notification Drawer**: Clicking the bell icon slides out a glassmorphic sidebar showing all activities (comments, reactions, follow alerts, and DMs).

---

## Proposed Changes

### 1. App Integration & Navigation
#### [MODIFY] [App.js](file:///c:/Users/CHIEDOZIE/Documents/CodeAlpha_SocialMedia/frontend/src/App.js)
- Import `ChatsScreen` and map route `/chats` to `ChatsScreen`.

#### [MODIFY] [Navbar.js](file:///c:/Users/CHIEDOZIE/Documents/CodeAlpha_SocialMedia/frontend/src/components/Navbar.js)
- Fetch unread notifications from `/api/notifications`.
- Listen on Socket.io for live updates (`message_received` and `new_notification`).
- Display unread badge counts on Chats (`✉️`) and Notifications (`🔔`).
- Hook up clicking the Bell icon to toggle the `NotificationDrawer` sliding state.

### 2. Disappearing Stories with Local Image Uploader
#### [NEW] [StoriesBar.js](file:///c:/Users/CHIEDOZIE/Documents/CodeAlpha_SocialMedia/frontend/src/components/StoriesBar.js)
- Horizontal scrolling container displayed at the top of `HomeScreen`.
- Renders user circles grouping active stories.
- First circle is "+ Add Story", prompting a glassmorphic dialog:
  - Option to browse local images. Uses `FileReader` to encode to base64 Data URLs and posts it with type `'image'`.
  - Option for text stories with color gradients.
- Clicking any active circle opens the immersive `StoriesModal`.

#### [NEW] [StoriesModal.js](file:///c:/Users/CHIEDOZIE/Documents/CodeAlpha_SocialMedia/frontend/src/components/StoriesModal.js)
- Fullscreen dark glassmorphic overlay for playing through selected user's stories.
- Segmented progress bar timers at the top (5s per story).
- Auto-advances or allows clicking left/right to skip.
- Renders base64 local images or styled text stories.

### 3. Notifications Sidebar
#### [NEW] [NotificationDrawer.js](file:///c:/Users/CHIEDOZIE/Documents/CodeAlpha_SocialMedia/frontend/src/components/NotificationDrawer.js)
- Sliding glassmorphic pane from the right side.
- Lists recent activity notifications: follow requests, post comments, emoji reactions, and new chat invitations.
- Includes a "Mark all as read" action.

### 4. Interactive Polls & Emoji Reactions
#### [MODIFY] [CreatePost.js](file:///c:/Users/CHIEDOZIE/Documents/CodeAlpha_SocialMedia/frontend/src/components/CreatePost.js)
- Adds a toggle "📊 Create Poll".
- When active, lets user define a Poll Question and up to 4 poll options.
- Sends `pollQuestion` and `pollOptions` along with post body content.

#### [MODIFY] [PostCard.js](file:///c:/Users/CHIEDOZIE/Documents/CodeAlpha_SocialMedia/frontend/src/components/PostCard.js)
- Shows custom emoji reaction pills under the post content.
- Replaces standard like button with a hoverable/clickable emoji selection drawer containing: `❤️`, `😂`, `🔥`, `😮`, `😢`.
- Renders interactive polls using elegant percentage vote bars with calculation animation. Casts votes instantly.

---

## Verification Plan

### Automated & Manual Verification
- Deploy local dev server (`npm run dev`).
- Test local image story uploads and play back in `StoriesModal`.
- Create a post with a multi-option poll, cast a vote, and verify percentage updates.
- Open two browser tabs (different users) to test real-time DM chat and notification badges.
- Verify production build finishes cleanly (`npm run build`).
