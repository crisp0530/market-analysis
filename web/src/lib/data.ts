import fs from "fs";
import path from "path";
import { DailyData } from "./types";

// Try multiple paths: parent dir (local dev & Vercel), or web/public/data (fallback)
const DATA_DIR = (() => {
  const candidates = [
    path.join(process.cwd(), "..", "data"),      // local dev & Vercel (root dir = web/)
    path.join(process.cwd(), "data"),             // if cwd is project root
    path.join(process.cwd(), "public", "data"),   // static fallback
  ];
  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir;
  }
  return candidates[0]; // default
})();

export function getAvailableDates(): string[] {
  try {
    const files = fs
      .readdirSync(DATA_DIR)
      .filter((f) => f.endsWith(".json") && /^\d{4}-\d{2}-\d{2}\.json$/.test(f));
    return files.map((f) => f.replace(".json", "")).sort().reverse();
  } catch {
    return [];
  }
}

export function getLatestDate(): string | null {
  const dates = getAvailableDates();
  return dates.length > 0 ? dates[0] : null;
}

export function loadData(date: string): DailyData | null {
  try {
    const filepath = path.join(DATA_DIR, `${date}.json`);
    const raw = fs.readFileSync(filepath, "utf-8");
    return JSON.parse(raw) as DailyData;
  } catch {
    return null;
  }
}

export function loadLatestData(): DailyData | null {
  const date = getLatestDate();
  if (!date) return null;
  return loadData(date);
}
