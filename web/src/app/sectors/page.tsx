import { loadData, getLatestDate } from "@/lib/data";
import NoData from "@/components/NoData";
import TierBadge from "@/components/TierBadge";
import { StrengthItem } from "@/lib/types";

interface SectorGroup {
  sector: string;
  count: number;
  avgRoc5d: number;
  avgScore: number;
  tierDist: Record<string, number>;
}

function groupBySector(items: StrengthItem[]): SectorGroup[] {
  const map = new Map<
    string,
    { items: StrengthItem[]; tiers: Record<string, number> }
  >();

  for (const item of items) {
    const sector = item.sector || "Unknown";
    if (!map.has(sector)) {
      map.set(sector, { items: [], tiers: {} });
    }
    const group = map.get(sector)!;
    group.items.push(item);
    const tier = item.tier || "T4";
    group.tiers[tier] = (group.tiers[tier] || 0) + 1;
  }

  const result: SectorGroup[] = [];
  const entries = Array.from(map.entries());
  for (const [sector, { items: sItems, tiers }] of entries) {
    const avgRoc5d =
      sItems.reduce((sum, s) => sum + (s.roc_5d || 0), 0) / sItems.length;
    const avgScore =
      sItems.reduce((sum, s) => sum + (s.composite_score || 0), 0) /
      sItems.length;
    result.push({
      sector,
      count: sItems.length,
      avgRoc5d,
      avgScore,
      tierDist: tiers,
    });
  }

  return result.sort((a, b) => b.avgRoc5d - a.avgRoc5d);
}

function getHeatColor(roc: number): string {
  // Scale opacity based on absolute value, cap at 10%
  const absVal = Math.min(Math.abs(roc), 10);
  const opacity = (absVal / 10) * 0.4 + 0.05;
  if (roc >= 0) {
    return `rgba(0, 212, 170, ${opacity})`; // accent-green
  }
  return `rgba(255, 71, 87, ${opacity})`; // accent-red
}

const MARKET_LABELS: Record<string, string> = {
  us: "\ud83c\uddfa\ud83c\uddf8 \u7f8e\u80a1",
  cn: "\ud83c\udde8\ud83c\uddf3 A\u80a1",
  global: "\ud83c\udf0d \u5168\u7403",
};

const MARKET_ORDER = ["us", "cn", "global"];

export default function SectorsPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const date = searchParams.date || getLatestDate();
  if (!date) return <NoData />;
  const data = loadData(date);
  if (!data) return <NoData />;

  const { strength } = data;

  // Group by market
  const marketMap = new Map<string, StrengthItem[]>();
  for (const item of strength) {
    const market = item.market || "global";
    if (!marketMap.has(market)) {
      marketMap.set(market, []);
    }
    marketMap.get(market)!.push(item);
  }

  // Sort markets in defined order, then alphabetically for extras
  const markets = Array.from(marketMap.keys()).sort((a, b) => {
    const ia = MARKET_ORDER.indexOf(a);
    const ib = MARKET_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });

  return (
    <div>
      <h2 className="text-xl font-bold text-gold mb-6">
        {"\ud83d\uddfa\ufe0f \u677f\u5757\u70ed\u529b\u56fe"}
      </h2>

      {markets.map((market) => {
        const items = marketMap.get(market)!;
        const avgRoc =
          items.reduce((sum, s) => sum + (s.roc_5d || 0), 0) / items.length;
        const sectors = groupBySector(items);

        return (
          <div key={market} className="mb-8">
            {/* Market Header */}
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-base font-semibold text-text-primary">
                {MARKET_LABELS[market] || market.toUpperCase()}
              </h3>
              <span className="text-text-muted text-xs">
                {items.length} symbols
              </span>
              <span
                className={`text-sm font-mono ${
                  avgRoc >= 0 ? "text-accent-green" : "text-accent-red"
                }`}
              >
                avg 5d: {avgRoc >= 0 ? "+" : ""}
                {avgRoc.toFixed(2)}%
              </span>
            </div>

            {/* Sector Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {sectors.map((sg) => (
                <div
                  key={sg.sector}
                  className="rounded-lg p-4 border border-border-subtle transition-colors hover:border-white/10"
                  style={{ backgroundColor: getHeatColor(sg.avgRoc5d) }}
                >
                  {/* Sector Name */}
                  <div className="text-text-primary font-semibold text-sm mb-2 truncate">
                    {sg.sector}
                  </div>

                  {/* Metrics */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted text-xs">Symbols</span>
                      <span className="text-text-primary text-sm">
                        {sg.count}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted text-xs">ROC 5d</span>
                      <span
                        className={`text-sm font-mono font-semibold ${
                          sg.avgRoc5d >= 0
                            ? "text-accent-green"
                            : "text-accent-red"
                        }`}
                      >
                        {sg.avgRoc5d >= 0 ? "+" : ""}
                        {sg.avgRoc5d.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted text-xs">Score</span>
                      <span className="text-text-primary text-sm">
                        {sg.avgScore.toFixed(0)}
                      </span>
                    </div>
                  </div>

                  {/* Tier Distribution */}
                  <div className="flex gap-1 mt-3 flex-wrap">
                    {(["T1", "T2", "T3", "T4"] as const).map((tier) => {
                      const count = sg.tierDist[tier] || 0;
                      if (count === 0) return null;
                      return (
                        <span key={tier} className="flex items-center gap-0.5">
                          <TierBadge tier={tier} />
                          <span className="text-text-muted text-[10px]">
                            {count}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
