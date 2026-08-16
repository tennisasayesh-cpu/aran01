import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARAN OS | ERP مجموعه آران",
  description: "سامانه یکپارچه مدیریت مجموعه‌های ورزشی، اقامتی و رستورانی آران"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}