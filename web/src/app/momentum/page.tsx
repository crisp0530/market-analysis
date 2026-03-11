import { loadData, getLatestDate } from "@/lib/data";
import NoData from "@/components/NoData";
import MetricCard from "@/components/MetricCard";
import DataTable from "@/components/DataTable";
import Link from "next/link";

interface MomentumItem {
  symbol: string;
  name: string;
  price?: number;
  change_pct?: number;
  pct_5d?: number;
  pct_1m?: number;
  trigger?: string;
  rsi?: number;
  rel_volume?: number;
  market_cap_b?: number;
  market_cap_unit?: string;
  industry?: string;
  [key: string]: any;
}

function fmt(v: any, suffix = ""): string {
  if (v == null || Number.isNaN(v)) return "—";
  return typeof v === "number" ? v.toFixed(2) + suffix : String(v);
}

function pct(v: any): string {
  return fmt(v, "%");
}

function pctColor(v: number | undefined): string {
  if (v == null) return "text-text-primary";
  return v >= 0 ? "text-accent-green" : "text-accent-red";
}

function triggerColor(t: string): string {
  if (t === "both") return "text-gold";
  if (t === "5d") return "text-accent-blue";
  return "text-accent-purple";
}

function makeMomentumColumns() {
  return [
    {
      key: "_rank",
      label: "#",
      align: "center" as const,
    },
    {
      key: "symbol",
      label: "Symbol",
      render: (v: string) => (
        <Link
          href={`/detail/${encodeURIComponent(v)}`}
          className="text-accent-blue hover:underline"
        >
          {v}
        </Link>
      ),
    },
    { key: "name", label: "Name" },
    {
      key: "price",
      label: "Price",
      align: "right" as const,
      render: (v: number) => (v != null ? v.toFixed(2) : "—"),
    },
    {
      key: "change_pct",
      label: "Day%",
      align: "right" as const,
      render: (v: number) => (
        <span className={pctColor(v)}>
          {v != null ? (v >= 0 ? "+" : "") + v.toFixed(2) + "%" : "—"}
        </span>
      ),
    },
    {
      key: "perf_5d",
      label: "5d%",
      align: "right" as const,
      render: (v: number) => (
        <span className={pctColor(v)}>
          {v != null ? (v >= 0 ? "+" : "") + v.toFixed(2) + "%" : "—"}
        </span>
      ),
    },
    {
      key: "perf_20d",
      label: "1M%",
      align: "right" as const,
      render: (v: number) => (
        <span className={pctColor(v)}>
          {v != null ? (v >= 0 ? "+" : "") + v.toFixed(2) + "%" : "—"}
        </span>
      ),
    },
    {
      key: "trigger",
      label: "Trigger",
      align: "center" as const,
      render: (v: string) => (
        <span className={`font-semibold ${triggerColor(v || "")}`}>
          {v || "—"}
        </span>
      ),
    },
    {
      key: "rsi",
      label: "RSI",
      align: "right" as const,
      render: (v: number) => {
        if (v == null) return "—";
        if (v > 70) {
          return (
            <span className="text-accent-red font-semibold">
              {v.toFixed(0)}
              <span className="text-[10px] ml-0.5 opacity-70">超买</span>
            </span>
          );
        }
        if (v < 30) {
          return (
            <span className="text-accent-green font-semibold">
              {v.toFixed(0)}
              <span className="text-[10px] ml-0.5 opacity-70">超卖</span>
            </span>
          );
        }
        return <span>{v.toFixed(0)}</span>;
      },
    },
    {
      key: "rel_volume",
      label: "RelVol",
      align: "right" as const,
      render: (v: number) => {
        if (v == null) return "—";
        return (
          <span className={v > 2 ? "text-accent-green" : "text-text-primary"}>
            {v.toFixed(2)}x
          </span>
        );
      },
    },
    {
      key: "market_cap_b",
      label: "MktCap",
      align: "right" as const,
      render: (v: number, row: any) => {
        if (v == null) return "—";
        const unit = row.market_cap_unit || "B";
        return (
          <span className="text-text-muted">
            {v.toFixed(0)}
            {unit}
          </span>
        );
      },
    },
    {
      key: "industry",
      label: "Industry",
      render: (v: string) => (
        <span className="text-text-muted text-xs">{v || "—"}</span>
      ),
    },
  ];
}

export default function MomentumPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const date = searchParams.date || getLatestDate();
  if (!date) return <NoData />;
  const data = loadData(date);
  if (!data) return <NoData />;

  const momentum = data.momentum_surge as any;
  if (!momentum) {
    return (
      <div>
        <h2 className="text-xl font-bold text-gold mb-6">
          {"🚀 动量异动"}
        </h2>
        <div className="bg-card border border-border-subtle rounded-lg p-6 text-center text-text-secondary">
          无动量异动数据
        </div>
      </div>
    );
  }

  const usItems: MomentumItem[] = momentum.us_momentum || [];
  const cnItems: MomentumItem[] = momentum.cn_momentum || [];

  // --- Summary stats ---
  const allItems = [...usItems, ...cnItems];
  const all5d = allItems
    .map((s) => s.perf_5d)
    .filter((v): v is number => v != null);
  const all1m = allItems
    .map((s) => s.perf_20d)
    .filter((v): v is number => v != null);

  const best5d = all5d.length > 0 ? Math.max(...all5d) : null;
  const best1m = all1m.length > 0 ? Math.max(...all1m) : null;

  const columns = makeMomentumColumns();

  return (
    <div>
      <h2 className="text-xl font-bold text-gold mb-6">
        {"🚀 动量异动"}
      </h2>

      {/* Summary MetricCards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="US动量信号数量"
          value={String(usItems.length)}
          color="text-accent-blue"
        />
        <MetricCard
          label="CN动量信号数量"
          value={String(cnItems.length)}
          color="text-accent-purple"
        />
        <MetricCard
          label="最强5日涨幅"
          value={pct(best5d)}
          color={pctColor(best5d ?? undefined)}
        />
        <MetricCard
          label="最强月涨幅"
          value={pct(best1m)}
          color={pctColor(best1m ?? undefined)}
        />
      </div>

      {/* US Momentum Table */}
      <div className="bg-card border border-border-subtle rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold mb-3 text-accent-blue">
          {"🇺🇸 US 动量信号"} ({usItems.length})
        </h3>
        {usItems.length > 0 ? (
          <DataTable
            columns={columns}
            data={usItems.map((item, i) => ({ ...item, _rank: i + 1 }))}
          />
        ) : (
          <p className="text-text-muted text-sm text-center py-3">无</p>
        )}
      </div>

      {/* CN Momentum Table */}
      <div className="bg-card border border-border-subtle rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold mb-3 text-accent-purple">
          {"🇨🇳 CN 动量信号"} ({cnItems.length})
        </h3>
        {cnItems.length > 0 ? (
          <DataTable
            columns={columns}
            data={cnItems.map((item, i) => ({ ...item, _rank: i + 1 }))}
          />
        ) : (
          <p className="text-text-muted text-sm text-center py-3">无</p>
        )}
      </div>
    </div>
  );
}
