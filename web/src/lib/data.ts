import fs from "fs";
import path from "path";
import { DailyData } from "./types";

// Find data directory - try all possible locations
function findDataDir(): string {
  const candidates = [
    path.join(process.cwd(), "..", "data"),        // local dev (cwd=web/)
    path.join(process.cwd(), "data"),              // cwd=project root
    path.join(process.cwd(), "public", "data"),    // Vercel serverless (cwd=web/)
    path.resolve(__dirname, "..", "..", "..", "public", "data"),  // relative to this file
    path.resolve(__dirname, "..", "..", "..", "..", "data"),      // up from src/lib/
    "/var/task/public/data",                        // Vercel lambda absolute
    "/var/task/.next/server/public/data",           // Vercel .next output
  ];
  for (const dir of candidates) {
    try {
      if (fs.existsSync(dir) && fs.readdirSync(dir).some(f => f.endsWith(".json"))) {
        return dir;
      }
    } catch { /* skip */ }
  }
  return candidates[0];
}

const DATA_DIR = findDataDir();

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
