"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const NAV_ITEMS = [
  { href: "/", label: "\u5168\u5c40\u6982\u89c8", icon: "\ud83d\udcca" },
  { href: "/fear", label: "\u6050\u614c/\u5e95\u90e8", icon: "\ud83d\ude31" },
  { href: "/premarket", label: "\u76d8\u524d\u5f02\u52a8", icon: "\u23f0" },
  { href: "/anomalies", label: "\u5f02\u5e38\u4fe1\u53f7", icon: "\u26a0\ufe0f" },
  { href: "/signals", label: "\u7a81\u7834/\u629b\u7269\u7ebf", icon: "\ud83d\udcc8" },
  { href: "/stocks", label: "\u4e2a\u80a1\u673a\u4f1a", icon: "\ud83c\udfaf" },
  { href: "/sectors", label: "\u677f\u5757\u70ed\u529b\u56fe", icon: "\ud83d\uddfa\ufe0f" },
  { href: "/quant", label: "\u91cf\u5316\u9762\u677f", icon: "\ud83d\udd22" },
];

function SidebarContent({
  dates,
  currentDate,
}: {
  dates: string[];
  currentDate: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date") || currentDate;

  return (
    <aside className="w-56 bg-secondary border-r border-border-subtle flex flex-col h-screen fixed left-0 top-0">
      <div className="p-4 border-b border-border-subtle">
        <h1 className="text-gold font-bold text-lg">{"\ud83d\udcca"} MA</h1>
        <p className="text-text-muted text-xs mt-1">Market Analyst</p>
      </div>

      <div className="p-3 border-b border-border-subtle">
        <label className="text-text-muted text-xs block mb-1">
          {"\u65e5\u671f"}
        </label>
        <select
          className="w-full bg-primary text-text-primary text-sm border border-border-subtle rounded px-2 py-1.5 focus:outline-none focus:border-gold"
          value={dateParam}
          onChange={(e) => {
            const url = new URL(window.location.href);
            url.searchParams.set("date", e.target.value);
            window.location.href = url.toString();
          }}
        >
          {dates.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={`${item.href}?date=${dateParam}`}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? "text-gold bg-gold/10 border-l-2 border-gold"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/[0.02]"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border-subtle">
        <p className="text-text-muted text-[10px]">
          {"\u66f4\u65b0"}: {currentDate}
        </p>
      </div>
    </aside>
  );
}

export default function Sidebar({
  dates,
  currentDate,
}: {
  dates: string[];
  currentDate: string;
}) {
  return (
    <Suspense
      fallback={
        <div className="w-56 bg-secondary h-screen fixed left-0 top-0" />
      }
    >
      <SidebarContent dates={dates} currentDate={currentDate} />
    </Suspense>
  );
}
