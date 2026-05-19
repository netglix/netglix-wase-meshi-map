import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "早稲めしマップ",
  description: "早稲田周辺の飲食店を探せるマップ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
