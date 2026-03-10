import { loadData, getLatestDate } from "@/lib/data";
import NoData from "@/components/NoData";
import MetricCard from "@/components/MetricCard";
import TierBadge from "@/components/TierBadge";
import DataTable from "@/components/DataTable";
import Link from "next/link";

function fmt(v: any, suffix = ""): string {
  if (v == null || v === undefined || Number.isNaN(v)) return "\u2014";
  return typeof v === "number" ? v.toFixed(2) + suffix : String(v);
}

function pct(v: any): string {
  return fmt(v, "%");
}

function sharpeColor(v: number | undefined): string {
  if (v == null) return "text-text-primary";
  if (v > 1) return "text-accent-green";
  if (v >= 0) return "text-[#f59e0b]";
  return "text-accent-red";
}

function returnColor(v: number | undefined): string {
  if (v == null) return "text-text-primary";
  return v >= 0 ? "text-accent-green" : "text-accent-red";
}

export default function QuantPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const date = searchParams.date || getLatestDate();
  if (!date) return <NoData />;
  const data = loadData(date);
  if (!data) return <NoData />;

  const { strength } = data;

  // --- Summary stats ---
  const sharpes = strength.map((s) => s.sharpe).filter((v): v is number => v != null);
  const drawdowns = strength.map((s) => s.max_drawdown).filter((v): v is number => v != null);
  const vols = strength.map((s) => s.ann_vol).filter((v): v is number => v != null);
  const calmars = strength.map((s) => s.calmar_ratio).filter((v): v is number => v != null);

  const avgSharpe = sharpes.length > 0 ? sharpes.reduce((a, b) => a + b, 0) / sharpes.length : null;
  const worstDD = drawdowns.length > 0 ? Math.min(...drawdowns) : null;
  const avgVol = vols.length > 0 ? vols.reduce((a, b) => a + b, 0) / vols.length : null;
  const bestCalmar = calmars.length > 0 ? Math.max(...calmars) : null;

  // --- Sort by sharpe DESC ---
  const sorted = [...strength]
    .filter((s) => s.sharpe != null)
    .sort((a, b) => (b.sharpe ?? 0) - (a.sharpe ?? 0));

  // --- Risk items ---
  const riskItems = strength.filter(
    (s) => (s.max_drawdown != null && s.max_drawdown < -15) || (s.sharpe != null && s.sharpe < 0)
  );

  return (
    <div>
      <h2 className="text-xl font-bold text-gold mb-6">
        {"\uD83D\uDD22 \u91CF\u5316\u9762\u677F"}
      </h2>

      {/* Summary MetricCards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="\u5E73\u5747 Sharpe"
          value={fmt(avgSharpe)}
          color={sharpeColor(avgSharpe ?? undefined)}
        />
        <MetricCard
          label="\u6700\u5DEE\u56DE\u64A4"
          value={pct(worstDD)}
          color="text-accent-red"
        />
        <MetricCard
          label="\u5E73\u5747\u6CE2\u52A8\u7387"
          value={pct(avgVol)}
        />
        <MetricCard
          label="\u6700\u9AD8 Calmar"
          value={fmt(bestCalmar)}
          color="text-accent-green"
        />
      </div>

      {/* Main DataTable */}
      <div className="bg-card border border-border-subtle rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold mb-3">
          {"\u91CF\u5316\u6392\u540D (Sharpe \u964D\u5E8F)"}
        </h3>
        <DataTable
          columns={[
            {
              key: "_rank",
              label: "#",
              align: "center",
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
            { key: "market", label: "Market" },
            {
              key: "tier",
              label: "Tier",
              align: "center",
              render: (v: string) => <TierBadge tier={v} />,
            },
            {
              key: "sharpe",
              label: "Sharpe",
              align: "right",
              render: (v: number) => (
                <span className={sharpeColor(v)}>{fmt(v)}</span>
              ),
            },
            {
              key: "max_drawdown",
              label: "Max DD",
              align: "right",
              render: (v: number) => (
                <span className="text-accent-red">{pct(v)}</span>
              ),
            },
            {
              key: "ann_vol",
              label: "\u6CE2\u52A8\u7387",
              align: "right",
              render: (v: number) => pct(v),
            },
            {
              key: "calmar_ratio",
              label: "Calmar",
              align: "right",
              render: (v: number) => fmt(v),
            },
            {
              key: "ann_return",
              label: "\u5E74\u5316\u6536\u76CA",
              align: "right",
              render: (v: number) => (
                <span className={returnColor(v)}>{pct(v)}</span>
              ),
            },
            {
              key: "variance_drag",
              label: "Var Drag",
              align: "right",
              render: (v: number) => pct(v),
            },
          ]}
          data={sorted.map((item, i) => ({ ...item, _rank: i + 1 }))}
        />
      </div>

      {/* Risk section */}
      {riskItems.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3 text-accent-red">
            {"\u26A0\uFE0F \u9AD8\u98CE\u9669\u6807\u7684"} ({riskItems.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {riskItems.map((item) => (
              <div
                key={item.symbol}
                className="bg-card border border-accent-red/30 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <Link
                    href={`/detail/${encodeURIComponent(item.symbol)}`}
                    className="font-semibold text-accent-red hover:underline"
                  >
                    {item.symbol}
                  </Link>
                  <TierBadge tier={item.tier} />
                </div>
                <div className="text-text-muted text-xs mb-1">{item.name}</div>
                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  <div>
                    <span className="text-text-muted">Sharpe: </span>
                    <span className={sharpeColor(item.sharpe)}>
                      {fmt(item.sharpe)}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted">Max DD: </span>
                    <span className="text-accent-red">
                      {pct(item.max_drawdown)}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted">{"\u6CE2\u52A8\u7387"}: </span>
                    <span>{pct(item.ann_vol)}</span>
                  </div>
                  <div>
                    <span className="text-text-muted">{"\u5E74\u5316"}: </span>
                    <span className={returnColor(item.ann_return)}>
                      {pct(item.ann_return)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
