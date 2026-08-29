import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers/session-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Video Learning Tracker - Học tập YouTube không xao nhãng",
  description:
    "Quản lý lộ trình học tập qua video YouTube, viết nhật ký Markdown và tự động lưu tiến độ học.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
