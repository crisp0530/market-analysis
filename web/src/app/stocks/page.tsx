import { loadData, getLatestDate } from "@/lib/data";
import NoData from "@/components/NoData";
import DataTable from "@/components/DataTable";

interface SectorPick {
  sector: string;
  market: string;
  tv_sector?: string;
  source_etfs: string[];
  stocks: StockItem[];
}

interface StockItem {
  symbol: string;
  name: string;
  price?: number;
  change_pct?: number;
  rel_volume?: number;
  rsi?: number;
  cmf?: number;
  macd_hist?: number;
  market_cap_b?: number;
  market_cap_unit?: string;
  sector?: string;
  industry?: string;
  [key: string]: any;
}

const moverColumns = [
  { key: "symbol", label: "Symbol" },
  { key: "name", label: "Name" },
  {
    key: "change_pct",
    label: "Change %",
    align: "right" as const,
    render: (v: number) => {
      if (v == null) return "\u2014";
      return (
        <span className={v >= 0 ? "text-accent-green" : "text-accent-red"}>
          {v >= 0 ? "+" : ""}
          {v.toFixed(2)}%
        </span>
      );
    },
  },
  {
    key: "price",
    label: "Price",
    align: "right" as const,
    render: (v: number) => (v != null ? v.toFixed(2) : "\u2014"),
  },
  {
    key: "rel_volume",
    label: "Rel Vol",
    align: "right" as const,
    render: (v: number) => {
      if (v == null) return "\u2014";
      return (
        <span className={v > 2 ? "text-accent-green" : "text-text-primary"}>
          {v.toFixed(2)}x
        </span>
      );
    },
  },
  {
    key: "rsi",
    label: "RSI",
    align: "right" as const,
    render: (v: number) => {
      if (v == null) return "\u2014";
      const color = v > 70 ? "text-accent-red" : v < 30 ? "text-accent-green" : "text-text-primary";
      return <span className={color}>{v.toFixed(0)}</span>;
    },
  },
  {
    key: "sector",
    label: "Sector",
    render: (v: string) => (
      <span className="text-text-muted text-xs">{v || "\u2014"}</span>
    ),
  },
];

const sectorStockColumns = [
  { key: "symbol", label: "Symbol" },
  { key: "name", label: "Name" },
  {
    key: "change_pct",
    label: "Change %",
    align: "right" as const,
    render: (v: number) => {
      if (v == null) return "\u2014";
      return (
        <span className={v >= 0 ? "text-accent-green" : "text-accent-red"}>
          {v >= 0 ? "+" : ""}
          {v.toFixed(2)}%
        </span>
      );
    },
  },
  {
    key: "price",
    label: "Price",
    align: "right" as const,
    render: (v: number) => (v != null ? v.toFixed(2) : "\u2014"),
  },
  {
    key: "rel_volume",
    label: "Rel Vol",
    align: "right" as const,
    render: (v: number) => {
      if (v == null) return "\u2014";
      return (
        <span className={v > 2 ? "text-accent-green" : "text-text-primary"}>
          {v.toFixed(2)}x
        </span>
      );
    },
  },
  {
    key: "rsi",
    label: "RSI",
    align: "right" as const,
    render: (v: number) => {
      if (v == null) return "\u2014";
      const color = v > 70 ? "text-accent-red" : v < 30 ? "text-accent-green" : "text-text-primary";
      return <span className={color}>{v.toFixed(0)}</span>;
    },
  },
  {
    key: "cmf",
    label: "CMF",
    align: "right" as const,
    render: (v: number) => {
      if (v == null) return "\u2014";
      return (
        <span className={v > 0 ? "text-accent-green" : "text-accent-red"}>
          {v.toFixed(3)}
        </span>
      );
    },
  },
  {
    key: "market_cap_b",
    label: "Mkt Cap",
    align: "right" as const,
    render: (v: number, row: any) => {
      if (v == null) return "\u2014";
      const unit = row.market_cap_unit || "B";
      return <span className="text-text-muted">{v.toFixed(0)}{unit}</span>;
    },
  },
];

function MoverSection({
  title,
  items,
  colorClass,
}: {
  title: string;
  items: StockItem[];
  colorClass: string;
}) {
  return (
    <div className="bg-card border border-border-subtle rounded-lg p-4">
      <h3 className={`text-sm font-semibold mb-3 ${colorClass}`}>{title}</h3>
      {items.length > 0 ? (
        <DataTable columns={moverColumns} data={items} />
      ) : (
        <p className="text-text-muted text-sm text-center py-3">{"\u65e0"}</p>
      )}
    </div>
  );
}

export default function StocksPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const date = searchParams.date || getLatestDate();
  if (!date) return <NoData />;
  const data = loadData(date);
  if (!data) return <NoData />;

  const picks = data.stock_picks as any;
  if (!picks || Object.keys(picks).length === 0) {
    return (
      <div>
        <h2 className="text-xl font-bold text-gold mb-6">
          {"\ud83c\udfaf \u4e2a\u80a1\u673a\u4f1a"}
        </h2>
        <div className="bg-card border border-border-subtle rounded-lg p-6 text-center text-text-secondary">
          {"\u65e0\u4e2a\u80a1\u673a\u4f1a\u6570\u636e"}
        </div>
      </div>
    );
  }

  const sectorPicks: SectorPick[] = picks.sector_picks || [];
  const bigMoversUp: StockItem[] = picks.big_movers_up || [];
  const bigMoversDown: StockItem[] = picks.big_movers_down || [];
  const cnBigMoversUp: StockItem[] = picks.cn_big_movers_up || [];
  const cnBigMoversDown: StockItem[] = picks.cn_big_movers_down || [];

  return (
    <div>
      <h2 className="text-xl font-bold text-gold mb-6">
        {"\ud83c\udfaf \u4e2a\u80a1\u673a\u4f1a"}
      </h2>

      {/* Section 1: Sector Picks */}
      {sectorPicks.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            {"\ud83d\udcc2 \u677f\u5757\u7cbe\u9009"}
          </h3>
          <div className="space-y-4">
            {sectorPicks.map((sp, i) => (
              <div
                key={i}
                className="bg-card border border-border-subtle rounded-lg p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-text-primary font-semibold text-sm">
                    {sp.sector}
                  </span>
                  <span className="text-text-muted text-xs">
                    {"\u6765\u6e90"}: {sp.source_etfs?.join(", ")}
                  </span>
                  <span className="text-text-muted text-xs ml-auto">
                    {sp.stocks?.length || 0} {"\u53ea"}
                  </span>
                </div>
                {sp.stocks && sp.stocks.length > 0 ? (
                  <DataTable columns={sectorStockColumns} data={sp.stocks} />
                ) : (
                  <p className="text-text-muted text-sm text-center py-2">
                    {"\u65e0\u4e2a\u80a1"}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2 & 3: US Big Movers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <MoverSection
          title={"\ud83d\udfe2 US \u5927\u6da8\u80a1 (>8%)"}
          items={bigMoversUp}
          colorClass="text-accent-green"
        />
        <MoverSection
          title={"\ud83d\udd34 US \u5927\u8dcc\u80a1 (<-8%)"}
          items={bigMoversDown}
          colorClass="text-accent-red"
        />
      </div>

      {/* Section 4 & 5: CN Big Movers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MoverSection
          title={"\ud83d\udfe2 CN \u5927\u6da8\u80a1"}
          items={cnBigMoversUp}
          colorClass="text-accent-green"
        />
        <MoverSection
          title={"\ud83d\udd34 CN \u5927\u8dcc\u80a1"}
          items={cnBigMoversDown}
          colorClass="text-accent-red"
        />
      </div>
    </div>
  );
}
