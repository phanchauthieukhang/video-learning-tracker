# video-learning-tracker - SPEC

## Summary

Ứng dụng quản lý học tập qua video YouTube (`video-learning-tracker`) giúp người dùng (học viên, lập trình viên) theo dõi lộ trình học từ các danh sách phát (playlists) của YouTube. Ứng dụng cho phép người dùng nhúng các playlist yêu thích để học trực tiếp trên giao diện web tập trung, giúp loại bỏ các yếu tố gây xao nhãng từ bảng tin YouTube. Dưới khung phát video, người dùng có thể viết nhật ký học tập, ghi chú kiến thức đã học cho từng video riêng biệt và lưu lại tiến độ học. Toàn bộ dữ liệu được đồng bộ hóa và bảo mật thông qua tài khoản Google.

---

## User Stories / Jobs To Be Done

- **Story 1 (Quản lý lộ trình):** Là một người học tự nghiên cứu qua các video YouTube, tôi muốn lưu và nhóm các playlist video hướng dẫn vào một trang quản lý duy nhất, để tôi không cần mất công tìm kiếm lại danh sách phát trên YouTube mỗi khi muốn học.
- **Story 2 (Xem video tập trung):** Là một học viên muốn tập trung cao độ, tôi muốn xem các video trong danh sách phát trực tiếp trên trang web này mà không cần truy cập YouTube, để tránh bị phân tâm bởi các gợi ý video khác hoặc quảng cáo bên ngoài.
- **Story 3 (Ghi chép nhật ký học tập):** Là một lập trình viên học qua video, tôi muốn viết ghi chú/nhật ký (hỗ trợ định dạng Markdown) ngay dưới màn hình phát video và tự động lưu lại tiến độ (video đã hoàn thành, ghi chú của video đó), để tôi có thể hệ thống hóa kiến thức và theo dõi tiến độ của bản thân.
- **Story 4 (Xác thực tài khoản):** Là một người dùng cá nhân, tôi muốn đăng nhập an toàn bằng tài khoản Google để đồng bộ toàn bộ playlist và nhật ký học tập của mình trên mọi thiết bị.

---

## What The User Wants (Behavioral Outcomes)

- **Trang đăng nhập (Login Page):** Giao diện đăng nhập trực quan với nút "Đăng nhập bằng Google".
- **Bảng điều khiển (Dashboard):** 
  - Hiển thị danh sách các Playlist đã thêm của người dùng dưới dạng card kèm tiêu đề và hình thu nhỏ (thumbnail).
  - Có nút "Thêm Playlist mới" để người dùng dán URL danh sách phát YouTube hoặc ID playlist.
- **Trang chi tiết Playlist & Trình xem Video (Playlist & Video Player Page):**
  - Giao diện chia đôi: Một bên là danh sách các video trong playlist (hiển thị tiêu đề, thứ tự, trạng thái hoàn thành), một bên là trình phát video và khu vực ghi chép.
  - Trình phát video YouTube tích hợp phát mượt mà (chạy trực tiếp trên web).
  - Khu vực ghi chú (Journal Log Editor) nằm ngay bên dưới trình phát video, tự động tải ghi chú cũ (nếu có) và cho phép viết ghi chú mới dưới dạng văn bản hỗ trợ Markdown, tự động lưu lại khi người dùng dừng viết hoặc chuyển video.
  - Đánh dấu trạng thái "Đã hoàn thành" cho từng video sau khi người dùng xem xong hoặc bấm nút tích chọn.

---

## Flow / State Diagram

```
[Chưa đăng nhập] 
       |
       v (Bấm đăng nhập bằng Google)
[Trang Dashboard] <------------------------------------+
       |                                               |
       +---> [Thêm Playlist] (Nhập URL -> Validate) --+
       |
       v (Chọn một Playlist)
[Trang xem Video & Viết Nhật ký]
       |
       +---> [Xem Video nhúng]
       |
       +---> [Viết Nhật ký học tập & Ghi chú] (Tự động lưu)
       |
       +---> [Đánh dấu video hoàn thành]
```

---

## Acceptance Criteria (Testable Outcomes)

- **AC1: Đăng nhập Google thành công**
  - Người dùng chưa đăng nhập khi truy cập sẽ được chuyển hướng đến trang Login. Khi bấm nút đăng nhập bằng tài khoản Google hợp lệ, hệ thống sẽ xác thực và chuyển hướng người dùng về trang Dashboard cá nhân hóa.
  - proven by: `google-oauth-login` scenario
  - strategy: Fully-Automated

- **AC2: Thêm Playlist YouTube hợp lệ**
  - Người dùng dán URL hoặc ID playlist YouTube hợp lệ vào form, nhấn lưu. Hệ thống sẽ gọi API của YouTube để lấy tiêu đề, thumbnail, danh sách video con và lưu thành công vào cơ sở dữ liệu dưới tài khoản của người dùng.
  - proven by: `add-playlist-validation` scenario
  - strategy: Fully-Automated

- **AC3: Xem danh sách Playlist trên Dashboard**
  - Khi truy cập Dashboard, người dùng sẽ thấy đầy đủ danh sách các playlist họ đã thêm. Các playlist của người dùng này không được hiển thị ở tài khoản của người dùng khác.
  - proven by: `dashboard-playlist-visibility` scenario
  - strategy: Fully-Automated

- **AC4: Phát video nhúng mượt mà**
  - Khi chọn một video cụ thể trong trang Playlist, trình phát video sẽ tải chính xác video đó. Việc chuyển tiếp giữa các video trong danh sách không làm tải lại toàn bộ trang và không bị rò rỉ bộ nhớ (memory leaks) hay lỗi crash trình phát.
  - proven by: `embedded-video-loading` scenario
  - strategy: Fully-Automated

- **AC5: Viết và tự động lưu nhật ký học tập**
  - Khi người dùng gõ ghi chú vào vùng nhật ký học tập bên dưới video đang phát, nội dung ghi chú sẽ được tự động lưu trữ vào cơ sở dữ liệu. Khi chuyển sang video khác rồi quay lại, nội dung ghi chú cũ của video đó được tải lên chính xác.
  - proven by: `auto-save-learning-journal` scenario
  - strategy: Fully-Automated

---

## Out Of Scope

- Hỗ trợ thêm các nền tảng video khác ngoài YouTube (chỉ tập trung hỗ trợ duy nhất YouTube trong giai đoạn này).
- Chia sẻ danh sách phát và nhật ký học tập công khai cho người dùng khác (chỉ hiển thị chế độ riêng tư cho chính tài khoản sở hữu).
- Trình soạn thảo văn bản Rich Text nâng cao (ví dụ: upload trực tiếp ảnh/video vào ghi chú) — chỉ hỗ trợ định dạng văn bản Markdown cơ bản.

---

## Constraints

- **Framework:** Next.js App Router (React Server/Client Components).
- **Giao diện & Hoạt ảnh:** Tailwind CSS cho styling, GSAP (GreenSock) cho hiệu ứng động mượt mà (sử dụng `@gsap/react` để tránh lỗi re-render).
- **Cơ sở dữ liệu:** PostgreSQL (kết nối qua Prisma ORM hỗ trợ pooling cho môi trường serverless trên Vercel).
- **Xác thực:** Auth.js v5 (NextAuth) tích hợp Google OAuth.
- **Môi trường triển khai:** Vercel.

---

## Open Questions

- None.

---

## Background / Research Findings

- **YouTube Player Iframe API:** Nghiên cứu cho thấy việc dùng thẻ Iframe thông thường có thể gây xao nhãng. Sử dụng YouTube Player API động cho phép kiểm soát tốt hơn các sự kiện phát (playing, paused, completed) để đồng bộ hóa trạng thái học tập của người dùng.
- **NextAuth v5 & Prisma Adapter:** Việc đồng bộ tài khoản Google và cơ sở dữ liệu quan hệ được đơn giản hóa nhờ Prisma Adapter của Auth.js. Cấu hình Prisma Client Singleton là bắt buộc để ngăn lỗi tràn kết nối (connection limit exhaustion) trên Supabase/Neon khi deploy lên Vercel.
- **Hiệu ứng GSAP:** Sử dụng `@gsap/react` với hook `useGSAP` giúp tự động quản lý vòng đời hoạt ảnh của React, loại bỏ hoàn toàn các lỗi Hydration mismatch do render không nhất quán giữa Server và Client.
