import { loadData, getLatestDate } from "@/lib/data";
import NoData from "@/components/NoData";
import MetricCard from "@/components/MetricCard";
import TierBadge from "@/components/TierBadge";
import Link from "next/link";

function fmt(v: any, suffix = ""): string {
  if (v == null || v === undefined || Number.isNaN(v)) return "\u2014";
  return typeof v === "number" ? v.toFixed(2) + suffix : String(v);
}

function pct(v: any): string {
  return fmt(v, "%");
}

function rocColor(v: any): string {
  if (v == null) return "text-text-primary";
  return v >= 0 ? "text-accent-green" : "text-accent-red";
}

function sharpeColor(v: any): string {
  if (v == null) return "text-text-primary";
  if (v > 1) return "text-accent-green";
  if (v >= 0) return "text-[#f59e0b]";
  return "text-accent-red";
}

function rsiColor(v: any): string {
  if (v == null) return "text-text-primary";
  if (v < 30) return "text-accent-green";
  if (v > 70) return "text-accent-red";
  return "text-text-primary";
}

export default function DetailPage({
  params,
  searchParams,
}: {
  params: { symbol: string };
  searchParams: { date?: string };
}) {
  const date = searchParams.date || getLatestDate();
  if (!date) return <NoData />;
  const data = loadData(date);
  if (!data) return <NoData />;

  const symbol = decodeURIComponent(params.symbol);
  const item = data.strength.find((s) => s.symbol === symbol);

  if (!item) {
    return (
      <div>
        <Link href="/" className="text-accent-blue hover:underline text-sm">
          {"\u2190 \u8FD4\u56DE\u6982\u89C8"}
        </Link>
        <div className="mt-8 text-center">
          <p className="text-text-secondary text-lg">
            {"\u672A\u627E\u5230"} {symbol} {"\u7684\u6570\u636E"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Back link */}
      <Link href="/" className="text-accent-blue hover:underline text-sm">
        {"\u2190 \u8FD4\u56DE\u6982\u89C8"}
      </Link>

      {/* Title */}
      <div className="flex items-center gap-3 mt-4 mb-6">
        <h2 className="text-xl font-bold text-gold">
          {"\uD83D\uDCCB"} {item.name} ({item.symbol})
        </h2>
        <TierBadge tier={item.tier} />
      </div>

      {/* Section 1: \u57FA\u7840\u6570\u636E */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-3">
          {"\uD83D\uDCCA \u57FA\u7840\u6570\u636E"}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard label="Close" value={fmt(item.close)} />
          <MetricCard
            label="ROC 5d"
            value={pct(item.roc_5d)}
            color={rocColor(item.roc_5d)}
          />
          <MetricCard
            label="ROC 20d"
            value={pct(item.roc_20d)}
            color={rocColor(item.roc_20d)}
          />
          <MetricCard
            label="ROC 60d"
            value={pct(item.roc_60d)}
            color={rocColor(item.roc_60d)}
          />
          <MetricCard
            label="Composite Score"
            value={item.composite_score != null ? item.composite_score.toFixed(0) : "\u2014"}
          />
          <MetricCard label="Tier" value={item.tier} />
        </div>
      </div>

      {/* Section 2: \u91CF\u5316\u6307\u6807 */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-3">
          {"\uD83D\uDD22 \u91CF\u5316\u6307\u6807"}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard
            label="Sharpe"
            value={fmt(item.sharpe)}
            color={sharpeColor(item.sharpe)}
          />
          <MetricCard
            label="Max Drawdown"
            value={pct(item.max_drawdown)}
            color="text-accent-red"
            subtitle={item.max_dd_date ? `@ ${item.max_dd_date}` : undefined}
          />
          <MetricCard
            label={"\u6CE2\u52A8\u7387 (Ann Vol)"}
            value={pct(item.ann_vol)}
          />
          <MetricCard
            label="Calmar Ratio"
            value={fmt(item.calmar_ratio)}
          />
          <MetricCard
            label={"\u5E74\u5316\u6536\u76CA"}
            value={pct(item.ann_return)}
            color={rocColor(item.ann_return)}
          />
          <MetricCard
            label="Variance Drag"
            value={pct(item.variance_drag)}
          />
        </div>
      </div>

      {/* Section 3: \u6280\u672F\u6307\u6807 */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-3">
          {"\uD83D\uDCC8 \u6280\u672F\u6307\u6807 (TradingView)"}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard
            label="RSI"
            value={fmt(item.tv_rsi)}
            color={rsiColor(item.tv_rsi)}
            subtitle={
              item.tv_rsi != null
                ? item.tv_rsi < 30
                  ? "Oversold"
                  : item.tv_rsi > 70
                  ? "Overbought"
                  : undefined
                : undefined
            }
          />
          <MetricCard label="MACD" value={fmt(item.tv_macd)} />
          <MetricCard label="CMF" value={fmt(item.tv_cmf)} />
          <MetricCard label="MFI" value={fmt(item.tv_mfi)} />
          <MetricCard
            label="Rel Volume"
            value={fmt(item.tv_rel_volume)}
          />
          <MetricCard
            label="Recommendation"
            value={item.tv_recommendation ?? "\u2014"}
            color={
              item.tv_recommendation === "BUY" || item.tv_recommendation === "STRONG_BUY"
                ? "text-accent-green"
                : item.tv_recommendation === "SELL" || item.tv_recommendation === "STRONG_SELL"
                ? "text-accent-red"
                : "text-text-primary"
            }
          />
        </div>
      </div>

      {/* Section 4: \u6050\u614C/\u5E95\u90E8/\u5468\u671F */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-3">
          {"\uD83C\uDF21\uFE0F \u6050\u614C / \u5E95\u90E8 / \u5468\u671F"}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
          <MetricCard
            label={"\u6050\u614C\u5206\u6570"}
            value={item.fear_score != null ? `${fmt(item.fear_score)}` : "\u2014"}
            subtitle={item.fear_label ?? undefined}
            color={
              item.fear_score != null && item.fear_score >= 70
                ? "text-accent-red"
                : item.fear_score != null && item.fear_score >= 40
                ? "text-[#f59e0b]"
                : "text-accent-green"
            }
          />
          <MetricCard
            label={"\u5E95\u90E8\u5206\u6570"}
            value={item.bottom_score != null ? `${fmt(item.bottom_score)}` : "\u2014"}
            subtitle={item.bottom_label ?? undefined}
            color={
              item.bottom_score != null && item.bottom_score >= 70
                ? "text-accent-green"
                : "text-text-primary"
            }
          />
          <MetricCard
            label={"\u5468\u671F\u9636\u6BB5"}
            value={item.cycle_stage ?? "\u2014"}
            subtitle={
              item.cycle_confidence != null
                ? `\u7F6E\u4FE1\u5EA6: ${fmt(item.cycle_confidence)}`
                : undefined
            }
          />
        </div>

        {/* Fear dimensions */}
        <div className="mb-3">
          <p className="text-text-muted text-xs uppercase tracking-wider mb-2">
            {"\u6050\u614C\u7EF4\u5EA6\u62C6\u89E3"}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-card border border-border-subtle rounded p-3">
              <div className="text-text-muted text-xs">RSI</div>
              <div className="text-sm font-semibold mt-1">{fmt(item.fear_rsi_dim)}</div>
            </div>
            <div className="bg-card border border-border-subtle rounded p-3">
              <div className="text-text-muted text-xs">Drawdown</div>
              <div className="text-sm font-semibold mt-1">{fmt(item.fear_drawdown_dim)}</div>
            </div>
            <div className="bg-card border border-border-subtle rounded p-3">
              <div className="text-text-muted text-xs">Streak</div>
              <div className="text-sm font-semibold mt-1">{fmt(item.fear_streak_dim)}</div>
            </div>
            <div className="bg-card border border-border-subtle rounded p-3">
              <div className="text-text-muted text-xs">Momentum</div>
              <div className="text-sm font-semibold mt-1">{fmt(item.fear_momentum_dim)}</div>
            </div>
          </div>
        </div>

        {/* Bottom dimensions */}
        <div>
          <p className="text-text-muted text-xs uppercase tracking-wider mb-2">
            {"\u5E95\u90E8\u7EF4\u5EA6\u62C6\u89E3"}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-card border border-border-subtle rounded p-3">
              <div className="text-text-muted text-xs">RSI</div>
              <div className="text-sm font-semibold mt-1">{fmt(item.bottom_rsi_dim)}</div>
            </div>
            <div className="bg-card border border-border-subtle rounded p-3">
              <div className="text-text-muted text-xs">Drawdown</div>
              <div className="text-sm font-semibold mt-1">{fmt(item.bottom_drawdown_dim)}</div>
            </div>
            <div className="bg-card border border-border-subtle rounded p-3">
              <div className="text-text-muted text-xs">Volatility</div>
              <div className="text-sm font-semibold mt-1">{fmt(item.bottom_vol_dim)}</div>
            </div>
            <div className="bg-card border border-border-subtle rounded p-3">
              <div className="text-text-muted text-xs">Flow</div>
              <div className="text-sm font-semibold mt-1">{fmt(item.bottom_flow_dim)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: \u76D8\u524D\u6570\u636E */}
      {item.pm_price != null && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-text-secondary mb-3">
            {"\u23F0 \u76D8\u524D\u6570\u636E"}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <MetricCard label="PM Price" value={fmt(item.pm_price)} />
            <MetricCard
              label="PM Change"
              value={pct(item.pm_change_pct)}
              color={rocColor(item.pm_change_pct)}
            />
            <MetricCard
              label="PM Gap"
              value={pct(item.pm_gap)}
              color={rocColor(item.pm_gap)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
