# video-learning-tracker — IMPLEMENTATION PLAN

**Date:** 2026-08-29
**Feature:** video-learning-tracker
**Plan type:** COMPLEX (multi-phase, multi-session)
**SPEC:** `video-learning-tracker_SPEC_29-08-26.md`
**Status:** ACTIVE

---

## Goal

Triển khai ứng dụng **video-learning-tracker** — một nền tảng học qua video YouTube cá nhân hóa được xây dựng bằng Next.js 14 App Router, Auth.js v5 (Google OAuth + JWT), Prisma ORM + Neon PostgreSQL, Tailwind CSS, shadcn/ui và GSAP. Kế hoạch này bao gồm toàn bộ chuỗi triển khai từ scaffolding dự án → cấu hình database & auth → tích hợp YouTube API → xây dựng UI toàn diện → deploy Vercel, đảm bảo zero-ambiguity cho từng bước thực thi. Sản phẩm hoàn chỉnh cho phép người dùng đăng nhập bằng Google, thêm YouTube playlist, xem video nhúng trong giao diện tập trung, viết nhật ký Markdown với autosave, và đánh dấu tiến độ hoàn thành từng video.

---

## Blast Radius

### Files to CREATE (new project — all files are new)

```
video-learning-tracker/
├── .env.local                                    [CREATE]
├── .env.example                                  [CREATE]
├── .gitignore                                    [CREATE]
├── next.config.ts                                [CREATE]
├── package.json                                  [CREATE]
├── tsconfig.json                                 [CREATE]
├── tailwind.config.ts                            [CREATE]
├── postcss.config.mjs                            [CREATE]
├── components.json                               [CREATE]  ← shadcn/ui config
├── middleware.ts                                 [CREATE]
│
├── prisma/
│   └── schema.prisma                             [CREATE]
│
├── app/
│   ├── globals.css                               [CREATE]
│   ├── layout.tsx                                [CREATE]  ← root layout + SessionProvider
│   ├── page.tsx                                  [CREATE]  ← redirect to /dashboard or /login
│   ├── loading.tsx                               [CREATE]  ← root loading skeleton
│   │
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx                          [CREATE]  ← login page
│   │
│   ├── dashboard/
│   │   ├── page.tsx                              [CREATE]  ← playlist dashboard
│   │   ├── loading.tsx                           [CREATE]
│   │   └── error.tsx                             [CREATE]
│   │
│   ├── playlist/
│   │   └── [playlistId]/
│   │       ├── page.tsx                          [CREATE]  ← playlist detail + video player
│   │       ├── loading.tsx                       [CREATE]
│   │       └── error.tsx                         [CREATE]
│   │
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts                      [CREATE]  ← Auth.js handler
│
├── components/
│   ├── providers/
│   │   └── session-provider.tsx                  [CREATE]  ← wraps SessionProvider (client)
│   │
│   ├── auth/
│   │   ├── login-button.tsx                      [CREATE]  ← Google sign-in button
│   │   └── user-menu.tsx                         [CREATE]  ← avatar + sign-out dropdown
│   │
│   ├── dashboard/
│   │   ├── playlist-grid.tsx                     [CREATE]  ← CSS Grid of PlaylistCards
│   │   ├── playlist-card.tsx                     [CREATE]  ← single playlist card (GSAP hover)
│   │   ├── add-playlist-dialog.tsx               [CREATE]  ← modal: input URL → import
│   │   └── empty-state.tsx                       [CREATE]  ← shown when 0 playlists
│   │
│   ├── player/
│   │   ├── youtube-player.tsx                    [CREATE]  ← YouTube IFrame API wrapper (client)
│   │   ├── video-list.tsx                        [CREATE]  ← sidebar video list
│   │   ├── video-list-item.tsx                   [CREATE]  ← individual video row
│   │   └── completion-toggle.tsx                 [CREATE]  ← checkbox "Đã hoàn thành"
│   │
│   ├── journal/
│   │   ├── journal-editor.tsx                    [CREATE]  ← textarea + autosave logic (client)
│   │   ├── journal-preview.tsx                   [CREATE]  ← Markdown preview pane
│   │   └── save-indicator.tsx                    [CREATE]  ← "Saving..." / "Saved" status
│   │
│   └── ui/                                       [CREATE]  ← shadcn/ui generated components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── textarea.tsx
│       ├── badge.tsx
│       ├── avatar.tsx
│       ├── dropdown-menu.tsx
│       ├── skeleton.tsx
│       ├── progress.tsx
│       └── separator.tsx
│
├── actions/
│   ├── playlist.actions.ts                       [CREATE]
│   ├── video.actions.ts                          [CREATE]
│   └── user-video-state.actions.ts               [CREATE]
│
├── lib/
│   ├── prisma.ts                                 [CREATE]  ← Prisma singleton client
│   ├── auth.ts                                   [CREATE]  ← Auth.js config
│   ├── youtube.ts                                [CREATE]  ← YouTube Data API v3 helpers
│   ├── utils.ts                                  [CREATE]  ← cn() helper + misc utils
│   └── constants.ts                              [CREATE]
│
└── types/
    └── index.ts                                  [CREATE]  ← shared TypeScript interfaces
```

### Files to MODIFY
- None (new project)

### Files to DELETE
- None

---

## Prisma Schema

> Full schema — implement y hệt, không thêm/bớt field.

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")       // pooled URL (pgBouncer / Neon pooler)
  directUrl = env("DIRECT_URL")         // direct URL for migrations
}

// ─── Auth.js v5 Required Models ───────────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts    Account[]
  sessions    Session[]
  playlists   Playlist[]
  videoStates UserVideoState[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@unique([identifier, token])
}

// ─── Application Models ───────────────────────────────────────────────────

model Playlist {
  id                String   @id @default(cuid())
  userId            String
  youtubePlaylistId String   @unique
  title             String
  description       String?  @db.Text
  thumbnailUrl      String?
  channelTitle      String?
  videoCount        Int      @default(0)
  importedAt        DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  videos Video[]

  @@index([userId])
}

model Video {
  id              String    @id @default(cuid())
  playlistId      String
  youtubeVideoId  String
  title           String
  description     String?   @db.Text
  thumbnailUrl    String?
  channelTitle    String?
  position        Int
  durationSeconds Int?
  publishedAt     DateTime?
  createdAt       DateTime  @default(now())

  playlist   Playlist         @relation(fields: [playlistId], references: [id], onDelete: Cascade)
  userStates UserVideoState[]

  @@unique([playlistId, youtubeVideoId])
  @@index([playlistId, position])
}

model UserVideoState {
  id          String   @id @default(cuid())
  userId      String
  videoId     String
  isCompleted Boolean  @default(false)
  notes       String?  @db.Text
  updatedAt   DateTime @updatedAt

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  video Video @relation(fields: [videoId], references: [id], onDelete: Cascade)

  @@unique([userId, videoId])
  @@index([userId])
}
```

---

## Environment Variables Reference

```bash
# .env.local — NEVER commit this file

AUTH_SECRET="<random-32-char-string>"         # openssl rand -base64 32
AUTH_GOOGLE_ID="<google-oauth-client-id>"
AUTH_GOOGLE_SECRET="<google-oauth-client-secret>"

DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://user:pass@host:5432/db"

YOUTUBE_API_KEY="<youtube-api-key>"

NEXTAUTH_URL="http://localhost:3000"          # change to production domain on Vercel
```

---

## Checklist (Ordered Implementation Steps)

### Phase 1 — Project Scaffolding

- [ ] **1.1** Tạo thư mục dự án và khởi tạo Next.js 14+:
  ```bash
  npx create-next-app@latest video-learning-tracker \
    --typescript --tailwind --eslint --app --src-dir=false \
    --import-alias "@/*"
  cd video-learning-tracker
  ```

- [ ] **1.2** Cài đặt toàn bộ dependencies:
  ```bash
  npm install @prisma/client @auth/prisma-adapter next-auth@beta
  npm install isomorphic-dompurify marked
  npm install gsap @gsap/react
  npm install lucide-react class-variance-authority clsx tailwind-merge
  npm install -D prisma @types/dompurify
  ```

- [ ] **1.3** Khởi tạo shadcn/ui:
  ```bash
  npx shadcn@latest init
  npx shadcn@latest add button card dialog input textarea badge avatar dropdown-menu skeleton progress separator
  ```

- [ ] **1.4** Tạo `next.config.ts` với `remotePatterns`:
  ```typescript
  import type { NextConfig } from "next";
  const nextConfig: NextConfig = {
    images: {
      remotePatterns: [
        { protocol: "https", hostname: "i.ytimg.com" },
        { protocol: "https", hostname: "img.youtube.com" },
        { protocol: "https", hostname: "yt3.ggpht.com" },
        { protocol: "https", hostname: "lh3.googleusercontent.com" },
      ],
    },
  };
  export default nextConfig;
  ```

- [ ] **1.5** Tạo `.env.local` từ template, điền placeholder values.

- [ ] **1.6** Tạo `.gitignore` đảm bảo `.env.local` được ignore.

- [ ] **1.7** Tạo `lib/constants.ts`:
  ```typescript
  export const DEBOUNCE_MS = 2000;
  export const MAX_NOTES_LENGTH = 50000;
  export const YOUTUBE_PLAYLIST_REGEX = /(?:list=)([a-zA-Z0-9_-]+)/;
  export const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
  ```

- [ ] **1.8** Tạo `lib/utils.ts`:
  ```typescript
  import { clsx, type ClassValue } from "clsx";
  import { twMerge } from "tailwind-merge";
  export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
  export function extractPlaylistId(urlOrId: string): string | null {
    const match = urlOrId.match(/(?:list=)([a-zA-Z0-9_-]+)/);
    if (match) return match[1];
    // Plain playlist ID (no URL)
    if (/^[a-zA-Z0-9_-]{10,}$/.test(urlOrId)) return urlOrId;
    return null;
  }
  export function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }
  ```

- [ ] **1.9** Tạo `types/index.ts` với shared interfaces.

**Gate 1:** `npm run dev` không lỗi, localhost:3000 hiển thị Next.js default page.

---

### Phase 2 — Database & Prisma Setup

- [ ] **2.1** Tạo database trên Neon.tech:
  - Neon Dashboard → New Project → copy **Pooled connection string** → `DATABASE_URL`
  - Copy **Direct connection string** → `DIRECT_URL`

- [ ] **2.2** Khởi tạo Prisma:
  ```bash
  npx prisma init --datasource-provider postgresql
  ```

- [ ] **2.3** Viết schema đầy đủ vào `prisma/schema.prisma` (7 models: User, Account, Session, VerificationToken, Playlist, Video, UserVideoState).

- [ ] **2.4** Chạy migration đầu tiên:
  ```bash
  npx prisma migrate dev --name init
  ```
  Expected: `Migration 'init' applied successfully`

- [ ] **2.5** Tạo `lib/prisma.ts` — Prisma Singleton:
  ```typescript
  import { PrismaClient } from "@prisma/client";
  const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
  export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  ```

- [ ] **2.6** Verify với Prisma Studio:
  ```bash
  npx prisma studio
  ```

**Gate 2:** `npx prisma migrate status` → `All migrations have been applied`. Studio tại `:5555` có đủ 7 bảng.

---

### Phase 3 — Auth.js v5 (Google OAuth + JWT)

- [ ] **3.1** Lấy Google OAuth Credentials:
  - Google Cloud Console → APIs & Services → Credentials → Create OAuth 2.0 Client ID
  - Application type: **Web application**
  - Authorized redirect URIs:
    - `http://localhost:3000/api/auth/callback/google`
    - `https://your-app.vercel.app/api/auth/callback/google`
  - Copy Client ID → `AUTH_GOOGLE_ID`, Client Secret → `AUTH_GOOGLE_SECRET`

- [ ] **3.2** Tạo AUTH_SECRET:
  ```bash
  openssl rand -base64 32
  # Hoặc:
  npx auth secret
  ```

- [ ] **3.3** Tạo `lib/auth.ts`:
  ```typescript
  import NextAuth from "next-auth";
  import GoogleProvider from "next-auth/providers/google";
  import { PrismaAdapter } from "@auth/prisma-adapter";
  import { prisma } from "@/lib/prisma";

  export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
      GoogleProvider({
        clientId: process.env.AUTH_GOOGLE_ID!,
        clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      }),
    ],
    session: { strategy: "jwt" },
    callbacks: {
      async session({ session, token }) {
        if (session.user && token.sub) session.user.id = token.sub;
        return session;
      },
      async jwt({ token, user }) {
        if (user) token.sub = user.id;
        return token;
      },
    },
    pages: { signIn: "/login" },
  });
  ```

- [ ] **3.4** Tạo `app/api/auth/[...nextauth]/route.ts`:
  ```typescript
  import { handlers } from "@/lib/auth";
  export const { GET, POST } = handlers;
  ```

- [ ] **3.5** Tạo `middleware.ts`:
  ```typescript
  export { auth as middleware } from "@/lib/auth";
  export const config = {
    matcher: ["/dashboard/:path*", "/playlist/:path*"],
  };
  ```

- [ ] **3.6** Tạo `components/providers/session-provider.tsx` (Client Component wrapping NextAuth SessionProvider).

- [ ] **3.7** Cập nhật `app/layout.tsx` bọc `<Providers>` ở root.

- [ ] **3.8** Tạo `app/(auth)/login/page.tsx` — Server Component, redirect nếu đã có session, render LoginButton.

- [ ] **3.9** Tạo `components/auth/login-button.tsx` — "use client", gọi `signIn("google")`.

- [ ] **3.10** Tạo `components/auth/user-menu.tsx` — Avatar + dropdown + `signOut()`.

**Gate 3:**
- Truy cập `/dashboard` khi chưa login → redirect `/login` ✓
- Đăng nhập Google → redirect `/dashboard` ✓
- Bảng `User` và `Account` trong Studio có record mới ✓

---

### Phase 4 — YouTube API Integration

- [ ] **4.1** Lấy YouTube API Key:
  - Google Cloud Console → APIs & Services → Library → "YouTube Data API v3" → Enable
  - Credentials → Create API Key → Restrict: YouTube Data API v3
  - Copy → `YOUTUBE_API_KEY`

- [ ] **4.2** Tạo `lib/youtube.ts` với các hàm:
  - `fetchPlaylistInfo(playlistId)` — Gọi `playlists?part=snippet,contentDetails` (1 quota unit)
  - `fetchPlaylistVideos(playlistId)` — Gọi `playlistItems` với pagination (50/page) + enrich duration từ `videos?part=contentDetails`
  - `iso8601DurationToSeconds(duration)` — Parse ISO 8601 duration string (PT1H30M45S)

  > **Quota awareness:** Playlist với 200 video tốn ~5 units (4 pages + 4 video.list batches). Daily quota mặc định = 10,000 units.

**Gate 4:** Test script gọi `fetchPlaylistInfo("PLrAXtmRdnEQy...")` → nhận object hợp lệ với title, thumbnailUrl, videoCount.

---

### Phase 5 — Server Actions

- [ ] **5.1** Tạo `actions/playlist.actions.ts`:
  - `addPlaylist(urlOrId: string)` — auth check → extractPlaylistId → duplicate check → fetchPlaylistInfo + fetchPlaylistVideos → prisma.$transaction(create playlist + createMany videos) → revalidatePath("/dashboard")
  - `getUserPlaylists()` — trả về playlists với _count và userStates để tính tiến độ
  - `deletePlaylist(playlistDbId: string)` — auth check → prisma.playlist.deleteMany (scope by userId)

- [ ] **5.2** Tạo `actions/user-video-state.actions.ts`:
  - `toggleCompletion(videoId, isCompleted)` — upsert UserVideoState.isCompleted
  - `saveNotes(videoId, notes)` — validate length ≤ 50000 → upsert UserVideoState.notes
  - `getUserVideoState(videoId)` — findUnique UserVideoState

- [ ] **5.3** Tạo `actions/video.actions.ts`:
  - `getPlaylistWithVideos(playlistDbId)` — auth + userId scope → playlist + videos ordered by position + userStates

  > **Security pattern tất cả actions:** `const session = await auth(); if (!session?.user?.id) throw new Error("Unauthorized");` — không tin tưởng input client.

**Gate 5:** Import và gọi `addPlaylist()` trong một test script với YouTube playlist URL thật → record xuất hiện trong Prisma Studio.

---

### Phase 6 — Dashboard Page

- [ ] **6.1** Tạo `app/dashboard/page.tsx` (Server Component):
  - Gọi `getUserPlaylists()`
  - Render `<PlaylistGrid>` hoặc `<EmptyState>`
  - Header với `<UserMenu>` và nút "Thêm Playlist"

- [ ] **6.2** Tạo `components/dashboard/playlist-card.tsx`:
  - `next/image` thumbnail từ `i.ytimg.com`
  - Hiển thị: title, channelTitle, videoCount, completion percentage
  - `<Progress>` cho completion bar
  - Link đến `/playlist/[id]`
  - GSAP hover: `useGSAP` scale + shadow
  ```typescript
  useGSAP(() => {
    const el = cardRef.current;
    if (!el) return;
    const enter = () => gsap.to(el, { scale: 1.03, duration: 0.2, ease: "power2.out" });
    const leave = () => gsap.to(el, { scale: 1, duration: 0.2 });
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    return () => { el.removeEventListener("mouseenter", enter); el.removeEventListener("mouseleave", leave); };
  }, { scope: cardRef });
  ```

- [ ] **6.3** Tạo `components/dashboard/add-playlist-dialog.tsx`:
  - `<Dialog>` shadcn/ui
  - Input nhận YouTube URL hoặc playlist ID
  - Submit → `addPlaylist()` server action với loading state
  - Error display inline

- [ ] **6.4** Tạo `components/dashboard/empty-state.tsx` — icon + CTA button.

- [ ] **6.5** Tạo `app/dashboard/loading.tsx` — 6 skeleton cards dùng `<Skeleton>`.

**Gate 6:**
- Dashboard hiển thị danh sách playlist ✓
- Thêm playlist YouTube thật → card xuất hiện ngay ✓
- URL không hợp lệ → error message hiện ✓

---

### Phase 7 — Playlist & Video Player Page

- [ ] **7.1** Tạo `app/playlist/[playlistId]/page.tsx` (Server Component):
  - `params.playlistId` = DB cuid
  - Gọi `getPlaylistWithVideos(params.playlistId)`
  - 404 nếu không tìm thấy hoặc không thuộc user
  - `searchParams.videoId` = YouTube video ID đang phát (mặc định = video đầu tiên)
  - Layout: `flex h-screen` → sidebar 320px + flex-1 main

- [ ] **7.2** Tạo `components/player/youtube-player.tsx` (Client Component):
  - Load YouTube IFrame API script 1 lần qua `useEffect`
  - `new window.YT.Player(containerRef.current, { videoId, playerVars: { autoplay: 1, rel: 0, modestbranding: 1 } })`
  - Cleanup: `player.destroy()` trong useEffect return
  - Re-initialize khi `videoId` prop thay đổi

- [ ] **7.3** Tạo `components/player/video-list.tsx` (Client Component):
  - Nhận `videos` array, `currentVideoId`, `playlistDbId`
  - Click video → `router.push(/playlist/${playlistDbId}?videoId=${ytVideoId})`
  - GSAP stagger entrance animation khi mount

- [ ] **7.4** Tạo `components/player/video-list-item.tsx`:
  - Thumbnail, title (2-line truncate), duration badge, `<CompletionToggle>`

- [ ] **7.5** Tạo `components/player/completion-toggle.tsx` (Client Component — Optimistic):
  ```typescript
  "use client";
  import { useOptimistic, useTransition } from "react";
  import { toggleCompletion } from "@/actions/user-video-state.actions";

  export function CompletionToggle({ videoId, initialCompleted }: Props) {
    const [optimisticCompleted, setOptimistic] = useOptimistic(initialCompleted);
    const [, startTransition] = useTransition();
    function handleChange(checked: boolean) {
      startTransition(async () => {
        setOptimistic(checked);
        await toggleCompletion(videoId, checked);
      });
    }
    return <Checkbox checked={optimisticCompleted} onCheckedChange={handleChange} />;
  }
  ```

- [ ] **7.6** Tạo `components/journal/journal-editor.tsx` (Client Component):

  **Autosave flow:**
  1. User types → save to `localStorage[notes_${videoId}]` ngay lập tức
  2. Debounce 2000ms → call `saveNotes(videoId, content)` server action
  3. Flush khi unmount (useEffect return) hoặc onBlur
  4. Load: so sánh `localStorage.savedAt` vs `dbUpdatedAt` → dùng cái mới hơn

  ```typescript
  const lsKey = `notes_${videoId}`;
  const getInitialContent = () => {
    if (typeof window === "undefined") return initialNotes ?? "";
    const lsData = localStorage.getItem(lsKey);
    if (!lsData) return initialNotes ?? "";
    const parsed = JSON.parse(lsData);
    if (dbUpdatedAt && new Date(parsed.savedAt) > new Date(dbUpdatedAt)) return parsed.content;
    return initialNotes ?? "";
  };
  ```

- [ ] **7.7** Tạo `components/journal/journal-preview.tsx`:
  ```typescript
  import DOMPurify from "isomorphic-dompurify";
  import { marked } from "marked";
  export function JournalPreview({ content }: { content: string }) {
    const html = DOMPurify.sanitize(marked.parse(content) as string);
    return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
  }
  ```

- [ ] **7.8** Tạo `components/journal/save-indicator.tsx` với 4 states: `idle` | `saving` | `saved` | `error`.

- [ ] **7.9** Tạo `app/playlist/[playlistId]/loading.tsx` — split skeleton layout.

**Gate 7:**
- Chọn playlist → trang load, video đầu tiên phát ✓
- Click video khác → video đổi, ghi chú cũ load đúng ✓
- Gõ ghi chú → "Đang lưu..." → sau 2s "✓ Đã lưu" ✓
- Reload trang → ghi chú vẫn hiện ✓
- Check "Đã hoàn thành" → badge xuất hiện ngay (optimistic) ✓

---

### Phase 8 — Navigation & Root Layout

- [ ] **8.1** Tạo `app/layout.tsx` — root layout với `<Providers>`, Inter font, metadata.

- [ ] **8.2** Tạo `app/page.tsx` — root redirect:
  ```typescript
  import { redirect } from "next/navigation";
  import { auth } from "@/lib/auth";
  export default async function RootPage() {
    const session = await auth();
    redirect(session ? "/dashboard" : "/login");
  }
  ```

- [ ] **8.3** Tạo navigation header (Server Component) dùng trong dashboard và playlist page:
  - Logo + app name bên trái
  - `<UserMenu>` bên phải (avatar, tên, sign-out)

- [ ] **8.4** Tạo error boundaries: `app/dashboard/error.tsx` và `app/playlist/[playlistId]/error.tsx` — "use client", retry button.

**Gate 8:** Full navigation flow: `/` → `/login` → đăng nhập → `/dashboard` → chọn playlist → `/playlist/[id]` → back.

---

### Phase 9 — Styling & Polish

- [ ] **9.1** Thiết lập `app/globals.css`:
  - Tailwind directives
  - CSS variables shadcn/ui
  - `.prose` custom styles cho markdown

- [ ] **9.2** Responsive layout:
  - Dashboard: 1 col → 2 col (md) → 3 col (lg) → 4 col (xl)
  - Playlist page: column (mobile) → side-by-side với sidebar 320px (lg+)

- [ ] **9.3** GSAP animations:
  - Dashboard mount: `gsap.from(cards, { opacity: 0, y: 20, stagger: 0.08, duration: 0.5 })`
  - Video list mount: `gsap.from(items, { x: -20, opacity: 0, stagger: 0.05, duration: 0.4 })`
  - Player panel fade-in: `gsap.from(panel, { opacity: 0, duration: 0.3 })`
  - Dùng `useGSAP` hook (không dùng `gsap.*` trực tiếp ngoài hook)

- [ ] **9.4** Dark mode: `tailwind.config.ts` → `darkMode: "class"`.

- [ ] **9.5** Complete loading skeletons cho tất cả loading.tsx files.

**Gate 9:** Visual review — responsive trên mobile/tablet/desktop, animations mượt, không có Hydration errors.

---

### Phase 10 — Deployment (Vercel)

- [ ] **10.1** Tạo production database trên Neon.tech:
  - Neon Dashboard → New Project → Settings → Connection Details
  - Copy **Pooled connection** (Transaction mode) → `DATABASE_URL`
  - Copy **Direct connection** → `DIRECT_URL`

- [ ] **10.2** Chạy production migration:
  ```bash
  npx prisma migrate deploy
  ```

- [ ] **10.3** Cập nhật Google OAuth — thêm production redirect URI:
  - `https://your-app.vercel.app/api/auth/callback/google`

- [ ] **10.4** Deploy lên Vercel:
  ```bash
  npx vercel --prod
  # Hoặc: Vercel Dashboard → Import Git Repository
  ```

- [ ] **10.5** Set Environment Variables trên Vercel (Project → Settings → Environment Variables):

  | Variable | Value |
  |---|---|
  | `AUTH_SECRET` | 32-char random string |
  | `AUTH_GOOGLE_ID` | Google OAuth Client ID |
  | `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret |
  | `DATABASE_URL` | Neon pooled connection string |
  | `DIRECT_URL` | Neon direct connection string |
  | `YOUTUBE_API_KEY` | YouTube Data API v3 key |
  | `NEXTAUTH_URL` | `https://your-app.vercel.app` |

- [ ] **10.6** Trigger redeploy sau khi thêm env vars.

- [ ] **10.7** Verify production — test tất cả 5 Acceptance Criteria trên live URL.

**Gate 10:** Tất cả AC trong SPEC pass trên production domain.

---

## Test Gates Summary

| Gate | Phase | Command / Action | Expected |
|------|-------|------------------|----------|
| **G1** | Scaffolding | `npm run dev` | No errors, page loads |
| **G2** | Database | `npx prisma migrate status` | All applied; 7 tables in Studio |
| **G3** | Auth | Google OAuth flow | User+Account in DB |
| **G4** | YouTube API | `fetchPlaylistInfo(testId)` | Valid playlist object |
| **G5** | Server Actions | `addPlaylist(testUrl)` | Playlist+Videos in DB |
| **G6** | Dashboard | Add playlist via UI | Card appears, no errors |
| **G7** | Player | Notes autosave + reload | Notes persist after reload |
| **G8** | Navigation | Full auth flow | All redirects correct |
| **G9** | Styling | Visual review | Responsive, no hydration errors |
| **G10** | Production | Live Vercel URL | 5 AC in SPEC pass |

### Build Verification Commands
```bash
npx tsc --noEmit          # Type check
npm run lint              # ESLint
npm run build             # Next.js build (catches SSR errors)
npx prisma migrate status # DB migration status
```

---

## Acceptance Criteria Mapping

| AC | Pass When |
|----|-----------|
| AC1: Google Login | Gate 3 ✓ |
| AC2: Add Playlist | Gate 6 ✓ |
| AC3: Dashboard visibility | Gate 6 + multi-user isolation test |
| AC4: Embedded video loading | Gate 7 ✓ |
| AC5: Autosave journal | Gate 7 reload test ✓ |

---

## Rollback Plan

| Scenario | Action |
|----------|--------|
| Prisma migration failure | `npx prisma migrate reset` (dev); revert schema + `migrate deploy` (prod) |
| Auth.js misconfiguration | Revert `lib/auth.ts`; remove `AUTH_*` env vars on Vercel |
| YouTube API quota exceeded | Disable duration enrichment step; use mock/partial data |
| Vercel deployment fail | Vercel Dashboard → Deployments → Rollback to previous |
| DB connection pool exhaustion | Verify `pgbouncer=true&connection_limit=1` in `DATABASE_URL`; verify Prisma singleton pattern |
| GSAP hydration error | Ensure all `gsap.*` calls inside `useGSAP(() => { ... }, { scope })` — never in render |
| Multi-tab note conflict | Last Write Wins via `updatedAt` — by design, no additional action needed |

---

## Resume Handoff

Nếu implementation bị gián đoạn:

1. **Đọc SPEC + PLAN này** để hiểu toàn bộ context
2. **Kiểm tra phase đang dở**: checklist item nào chưa `[x]`
3. **Chạy Test Gate** của phase cuối completed để verify trạng thái hiện tại
4. **Tiếp tục** từ item chưa check — không re-do phases đã pass gate

**Decisions không được thay đổi (locked từ INNOVATE):**
- JWT session strategy (không lưu session vào DB)
- 1 bảng `UserVideoState` duy nhất (không tách JournalLog riêng)
- YouTube metadata fetch 1 lần khi import (không gọi lại khi load trang bình thường)
- Autosave = LocalStorage staging + 2s debounce + Server Action
- isCompleted hoàn toàn thủ công (không auto-detect từ video events)

**Common blockers và giải pháp:**
- Neon/Supabase down → thử local PostgreSQL với `DATABASE_URL=postgresql://localhost:5432/dev`
- YouTube API quota hết → mock data mode, tạo Playlist+Video trực tiếp trong Prisma Studio
- Google OAuth redirect mismatch → kiểm tra `NEXTAUTH_URL` và Authorized redirect URIs trong Google Console khớp chính xác

---

*Plan authored: 2026-08-29 | Feature: video-learning-tracker | RIPER-5 Phase: PLAN*

---

## Validate Contract

generated-by: inner-pvl: phase-VALIDATE
date: 29-08-26
gate: CONDITIONAL

### Dimension Findings

- **Infra & Dependencies**: PASS — All required packages are explicitly listed in Phase 1.2: `gsap`, `@gsap/react`, `isomorphic-dompurify`, `marked`, `@types/dompurify`, `@prisma/client`, `@auth/prisma-adapter`, `next-auth@beta`. The `next.config.ts` in Phase 1.4 covers all 4 required `remotePatterns` hostnames (`i.ytimg.com`, `img.youtube.com`, `yt3.ggpht.com`, `lh3.googleusercontent.com`). All 7 env vars are documented (AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, DATABASE_URL, DIRECT_URL, YOUTUBE_API_KEY, NEXTAUTH_URL). Neon pooled URL uses `pgbouncer=true&connection_limit=1`. Prisma Singleton pattern in Phase 2.5 is correct for Vercel serverless cold starts. `next-auth@beta` (v5) + `@auth/prisma-adapter` is the officially supported pairing for Prisma 5.

- **Test Coverage**: CONCERN — Gates G1–G10 cover AC1 (Gate 3), AC2 (Gate 6), AC4 (Gate 7), AC5 (Gate 7) adequately. **AC3 (Dashboard isolation — "playlist of user A must not appear for user B")** is only partially covered: Gate 6 tests single-user UI visibility but no explicit multi-account isolation test procedure is defined. The Acceptance Criteria Mapping table (line 757) acknowledges this gap with "multi-user isolation test" but provides no concrete test steps or command for it.

- **Security**: PASS — All server actions are documented to apply the guard `const session = await auth(); if (!session?.user?.id) throw new Error("Unauthorized");` (Phase 5, security note). `YOUTUBE_API_KEY` is consumed only in `lib/youtube.ts` (a server-only module, never imported by Client Components). `DOMPurify.sanitize()` wraps all `marked.parse()` output before `dangerouslySetInnerHTML` in `journal-preview.tsx`. JWT session strategy avoids DB reads on every request. `MAX_NOTES_LENGTH = 50000` is defined in `constants.ts` and validated inside `saveNotes()`. `getPlaylistWithVideos` scopes queries by `userId` to prevent cross-user data leakage. `.gitignore` step is Phase 1.6.

- **Breaking Changes**: PASS — This is a brand-new project; there are no existing files, tables, or routes to break. `prisma migrate dev --name init` creates fresh tables with no destructive impact. Phase ordering is correct: Phase 2 (DB + Prisma) → Phase 3 (Auth, depends on `lib/prisma.ts`) → Phase 5 (Server Actions, depends on `lib/auth.ts` + Prisma models).

### Accepted Concerns

1. **AC3 Multi-User Isolation Test (CONCERN — Test Coverage):** Gate 6 does not define an explicit two-account test procedure. The execute-agent must manually verify this during Gate 6: sign in with Account A, add a playlist, sign out, sign in with Account B, confirm the playlist is absent. This is a manual verification step and must be noted in Gate 6 pass criteria.

2. **YouTube Player Re-init Race Condition (LOW RISK — Infra):** The plan specifies `player.destroy()` + re-initialize when `videoId` changes via `useEffect`. Developers must ensure the YT IFrame API script (`window.YT`) is confirmed loaded before calling `new window.YT.Player(...)` in the re-init path. A `window.onYouTubeIframeAPIReady` guard or a ref-based `isApiReady` flag should be used. This is a code-level detail not fully spelled out in Phase 7.2 and should be implemented carefully during execution.

### Execute-Agent Instructions

Execute phases in strict order. Do not skip or reorder phases.

1. **Phase 1** — Scaffold the project. Run Gate 1 (`npm run dev`) before proceeding.
2. **Phase 2** — Set up Neon DB, write schema, run `prisma migrate dev --name init`. Run Gate 2 (`npx prisma migrate status`) before proceeding.
3. **Phase 3** — Configure Auth.js v5. Run Gate 3 (full Google OAuth login flow in browser) before proceeding. Verify `User` and `Account` rows appear in Prisma Studio.
4. **Phase 4** — Create `lib/youtube.ts`. Run Gate 4 (call `fetchPlaylistInfo` in a test script) before proceeding.
5. **Phase 5** — Implement all 3 server action files. Apply the auth guard pattern to **every** exported action. Run Gate 5 (call `addPlaylist()` with a real URL) before proceeding.
6. **Phase 6** — Build dashboard UI. Run Gate 6 including: (a) add playlist via UI → card appears, (b) **multi-user isolation check**: sign in as User B, confirm User A's playlist is invisible. Both sub-checks must pass.
7. **Phase 7** — Build playlist/player page. Implement YouTube Player with `isApiReady` guard on re-init. Run Gate 7 (autosave + reload test) before proceeding.
8. **Phase 8** — Wire root layout, navigation, error boundaries. Run Gate 8 (full nav flow).
9. **Phase 9** — Apply responsive styles, GSAP animations, dark mode. Run Gate 9 (visual review, no hydration errors in console).
10. **Phase 10** — Production deploy to Vercel. Set all 7 env vars. Run `npx prisma migrate deploy` against production DB. Run Gate 10 (verify all 5 AC on live URL).

**At each gate, run the Build Verification Commands before marking a gate as passed:**
```bash
npx tsc --noEmit
npm run lint
npm run build
```

### Test Gates

```bash
# Gate 1 — Scaffolding
npm run dev
# Expected: Server starts, http://localhost:3000 loads without error

# Gate 2 — Database
npx prisma migrate status
# Expected: "All migrations have been applied"
# Manual: npx prisma studio → confirm 7 tables exist (User, Account, Session, VerificationToken, Playlist, Video, UserVideoState)

# Gate 3 — Auth (manual browser test)
# 1. Navigate to http://localhost:3000/dashboard (unauthenticated) → must redirect to /login
# 2. Click "Sign in with Google" → complete OAuth flow → must redirect to /dashboard
# 3. npx prisma studio → User table has 1 row, Account table has 1 row

# Gate 4 — YouTube API (test script)
# Create scratch file: scripts/test-youtube.ts
# import { fetchPlaylistInfo } from "@/lib/youtube";
# console.log(await fetchPlaylistInfo("PLrAXtmRdnEQy...")); // replace with real ID
# npx ts-node --project tsconfig.json scripts/test-youtube.ts
# Expected: object with { title, thumbnailUrl, videoCount } populated

# Gate 5 — Server Actions (test script)
# Create scratch file: scripts/test-actions.ts
# import { addPlaylist } from "@/actions/playlist.actions";
# console.log(await addPlaylist("https://youtube.com/playlist?list=PLrAXtmRdnEQy..."));
# npx ts-node --project tsconfig.json scripts/test-actions.ts
# Expected: Playlist + Video rows visible in Prisma Studio

# Gate 6 — Dashboard UI (manual browser test)
# 1. Open http://localhost:3000/dashboard
# 2. Click "Thêm Playlist mới" → paste a real YouTube playlist URL → submit
#    Expected: Playlist card appears in grid
# 3. Submit an invalid URL (e.g. "not-a-url") → Expected: inline error message appears
# 4. [ISOLATION CHECK] Sign out. Sign in as a different Google account.
#    Expected: Dashboard is empty (no playlists from Account A are visible)

# Gate 7 — Player & Journal (manual browser test)
# 1. Click a playlist card → Playlist page loads, first video auto-plays
# 2. Click a different video in sidebar → video switches without full page reload
# 3. Type text in the journal editor → "Đang lưu..." indicator appears
# 4. Wait 2 seconds → "✓ Đã lưu" indicator appears
# 5. Hard-reload the page (Ctrl+Shift+R) → journal text reappears
# 6. Click "Đã hoàn thành" checkbox → badge/state updates immediately (optimistic UI)

# Gate 8 — Navigation (manual browser test)
# Full flow: / → /login → Google OAuth → /dashboard → select playlist → /playlist/[id] → browser back → /dashboard
# Expected: All redirects correct, no 404s, no unhandled errors

# Gate 9 — Styling (visual review)
# 1. Open DevTools → toggle responsive mode (375px, 768px, 1440px)
#    Expected: Dashboard grid reflows (1→2→3→4 cols), playlist page stacks correctly on mobile
# 2. Check browser console for hydration errors → Expected: zero hydration warnings
# 3. Verify GSAP animations play on dashboard mount and video list mount

# Gate 10 — Production (live Vercel URL)
# 1. Deploy: npx vercel --prod
# 2. Confirm: npx prisma migrate deploy (run against DIRECT_URL / production DB)
# 3. Verify all 5 AC on production domain:
#    AC1: Google login → dashboard redirect ✓
#    AC2: Add playlist → persisted to production DB ✓
#    AC3: Multi-user isolation on production ✓
#    AC4: Video embedded and switches without crash ✓
#    AC5: Notes survive page reload on production ✓

# Build Verification (run before marking any gate PASS)
npx tsc --noEmit          # Zero TypeScript errors
npm run lint              # Zero ESLint errors
npm run build             # Next.js build succeeds (catches SSR/SSG errors)
npx prisma migrate status # All migrations applied
```
