# 🎓 Video Learning Tracker

Ứng dụng quản lý lộ trình học qua video YouTube tập trung, loại bỏ xao nhãng, hỗ trợ viết nhật ký học tập định dạng Markdown với tính năng tự động lưu (Autosave) và theo dõi tiến độ từng video.

---

## 🚀 Công nghệ sử dụng

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Actions, React Server Components)
- **Database & ORM:** [Prisma ORM](https://www.prisma.io/) + [PostgreSQL (Neon.tech)](https://neon.tech/)
- **Xác thực:** [Auth.js v5](https://authjs.dev/) (Google OAuth Provider + JWT Strategy)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Hoạt ảnh:** [GSAP (GreenSock)](https://gsap.com/) + `@gsap/react`
- **Markdown & Security:** `marked` + `isomorphic-dompurify`

---

## ⚙️ Thiết lập biến môi trường (.env.local)

Tạo file `.env.local` từ `.env.example` với đầy đủ 7 biến môi trường sau:

```bash
# 1. Auth.js Secret (Tạo ngẫu nhiên bằng `openssl rand -base64 32` hoặc `npx auth secret`)
AUTH_SECRET="your-32-char-random-secret"

# 2. Google OAuth Credentials (Lấy từ Google Cloud Console)
AUTH_GOOGLE_ID="your-google-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# 3. PostgreSQL Database URLs (Neon.tech hoặc Supabase)
# DATABASE_URL: Chuỗi kết nối Pooled (Transaction mode, pgbouncer=true)
DATABASE_URL="postgresql://user:password@ep-sample-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connection_limit=1"

# DIRECT_URL: Chuỗi kết nối Direct không qua pooler (dùng cho Prisma migration)
DIRECT_URL="postgresql://user:password@ep-sample.us-east-1.aws.neon.tech/neondb?sslmode=require"

# 4. YouTube Data API v3 Key (Lấy từ Google Cloud Console)
YOUTUBE_API_KEY="your-youtube-data-api-v3-key"

# 5. Canonical Application URL
NEXTAUTH_URL="http://localhost:3000"
```

---

## 🛠️ Hướng dẫn cài đặt & chạy Local

### 1. Cài đặt Dependencies
```bash
npm install
```

### 2. Sinh Prisma Client & Đồng bộ Database
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 3. Khởi chạy Development Server
```bash
npm run dev
```
Truy cập [http://localhost:3000](http://localhost:3000) trên trình duyệt.

---

## 🌐 Hướng dẫn Deploy lên Vercel

1. Đẩy mã nguồn lên kho chứa GitHub / GitLab.
2. Truy cập [Vercel Dashboard](https://vercel.com/) và chọn **Import Git Repository**.
3. Cấu hình **Environment Variables** trên Vercel:
   - `AUTH_SECRET`
   - `AUTH_GOOGLE_ID`
   - `AUTH_GOOGLE_SECRET`
   - `DATABASE_URL` (Neon pooled string)
   - `DIRECT_URL` (Neon direct string)
   - `YOUTUBE_API_KEY`
   - `NEXTAUTH_URL` (Domain Vercel của bạn, ví dụ `https://your-app.vercel.app`)
4. Thêm **Authorized redirect URI** trong Google Cloud Console:
   `https://your-app.vercel.app/api/auth/callback/google`
5. Nhấn **Deploy**.

---

## 📁 Cấu trúc thư mục

```
video-learning-tracker/
├── actions/                  # Server Actions (Playlist, Video, UserVideoState)
├── app/                      # Next.js 14 App Router (Layouts, Pages, Routes)
│   ├── (auth)/login/         # Trang đăng nhập Google
│   ├── api/auth/[...nextauth]# Auth.js route handler
│   ├── dashboard/            # Dashboard danh sách playlist & tiến độ
│   ├── playlist/[playlistId] # Chi tiết playlist: Video Player + Markdown Journal
│   └── globals.css           # Tailwind base styles & CSS variables
├── components/
│   ├── auth/                 # LoginButton, UserMenu
│   ├── dashboard/            # PlaylistCard (GSAP hover), PlaylistGrid, AddPlaylistDialog
│   ├── journal/              # JournalEditor (Autosave), JournalPreview (DOMPurify)
│   ├── player/               # YouTubePlayer (IFrame API), VideoList, CompletionToggle
│   ├── providers/            # SessionProvider wrapper
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── auth.ts               # Cấu hình Auth.js v5 (NextAuth)
│   ├── constants.ts          # Hằng số cấu hình hệ thống
│   ├── prisma.ts             # Prisma Client singleton
│   ├── utils.ts              # Helper functions (cn, formatDuration, extractPlaylistId)
│   └── youtube.ts            # YouTube Data API v3 client
├── prisma/
│   └── schema.prisma         # Prisma Schema (User, Account, Playlist, Video, UserVideoState)
└── types/
    └── index.ts              # Shared TypeScript definitions
```

---

## 🔒 Multi-user Data Isolation

Mọi truy vấn và Server Actions (`actions/playlist.actions.ts`, `actions/video.actions.ts`, `actions/user-video-state.actions.ts`) đều được bảo vệ bởi session guard xác thực người dùng `const session = await auth(); if (!session?.user?.id) throw new Error("Unauthorized");`. Dữ liệu giữa các tài khoản người dùng được cô lập hoàn toàn dựa trên `userId`.
