import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { getAvailableDates, getLatestDate } from "@/lib/data";

export const metadata: Metadata = {
  title: "Market Analyst Dashboard",
  description: "AI-driven market strength analysis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dates = getAvailableDates();
  const currentDate =
    getLatestDate() || new Date().toISOString().split("T")[0];

  return (
    <html lang="zh-CN">
      <body className="bg-primary text-text-primary font-sans">
        <Sidebar dates={dates} currentDate={currentDate} />
        <main className="ml-56 min-h-screen p-6">{children}</main>
      </body>
    </html>
  );
}
