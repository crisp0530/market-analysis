import { loadData, getLatestDate } from "@/lib/data";
import NoData from "@/components/NoData";
import MetricCard from "@/components/MetricCard";
import DataTable from "@/components/DataTable";

interface PortfolioItem {
  symbol: string;
  name: string;
  type: string;
  current_price?: number;
  daily_change_pct?: number;
  avg_cost?: number;
  target_buy?: number;
  target_sell?: number | null;
  distance_to_target_pct?: number;
  distance_to_ema200_pct?: number;
  rsi?: number;
  cmf?: number;
  status: string;
  signal_strength: string;
  notes?: string;
  logic?: string;
  position_plan?: string;
  ema_20?: number;
  ema_50?: number;
  ema_100?: number;
  ema_200?: number;
  [key: string]: any;
}

function fmt(v: any, suffix = ""): string {
  if (v == null || v === undefined || Number.isNaN(v)) return "\u2014";
  return typeof v === "number" ? v.toFixed(2) + suffix : String(v);
}

function pct(v: any): string {
  return fmt(v, "%");
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    in_zone: { label: "进入区间", cls: "bg-accent-green/20 text-accent-green" },
    approaching: { label: "接近目标", cls: "bg-[#f59e0b]/20 text-[#f59e0b]" },
    away: { label: "远离", cls: "bg-accent-red/20 text-accent-red" },
    holding: { label: "持有中", cls: "bg-white/10 text-text-muted" },
  };
  const c = config[status] || { label: status, cls: "bg-white/10 text-text-muted" };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${c.cls}`}>
      {c.label}
    </span>
  );
}

function SignalBadge({ signal }: { signal: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    strong: { label: "强", cls: "text-accent-green font-semibold" },
    medium: { label: "中", cls: "text-[#f59e0b] font-semibold" },
    weak: { label: "弱", cls: "text-text-muted" },
    none: { label: "\u2014", cls: "text-text-muted" },
  };
  const c = config[signal] || { label: signal, cls: "text-text-muted" };
  return <span className={c.cls}>{c.label}</span>;
}

function AdviceTextRenderer({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim();

        // Empty line
        if (!trimmed) return <div key={i} className="h-2" />;

        // Horizontal rule
        if (trimmed === "---") {
          return <hr key={i} className="border-border-subtle my-4" />;
        }

        // Emoji-prefixed lines (priority signals)
        if (/^[\u2705\u{1F7E1}\u274C\u26A1\u{1F7E2}\u{1F534}\u{1F7E0}]/u.test(trimmed)) {
          return (
            <p
              key={i}
              className="text-base font-bold mt-4 mb-1"
              dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }}
            />
          );
        }

        // Numbered priority lines (e.g. "1. ...")
        if (/^\d+\.\s/.test(trimmed)) {
          return (
            <p
              key={i}
              className="text-sm font-semibold text-gold pl-2 mt-2"
              dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }}
            />
          );
        }

        // Italic lines (starting with *)
        if (/^\*\s/.test(trimmed)) {
          return (
            <p
              key={i}
              className="text-sm text-text-secondary italic pl-4"
              dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }}
            />
          );
        }

        // Default paragraph
        return (
          <p
            key={i}
            className="text-sm text-text-secondary pl-2"
            dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }}
          />
        );
      })}
    </div>
  );
}

function formatInlineMarkdown(text: string): string {
  // Bold: **text**
  let result = text.replace(/\*\*(.+?)\*\*/g, '<strong class="text-text-primary">$1</strong>');
  // Inline code: `text`
  result = result.replace(/`(.+?)`/g, '<code class="bg-white/5 px-1 rounded text-xs">$1</code>');
  return result;
}

export default function PortfolioPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const date = searchParams.date || getLatestDate();
  if (!date) return <NoData />;
  const data = loadData(date);
  if (!data) return <NoData />;

  const portfolioAdvice = (data as any).portfolio_advice as
    | { items: PortfolioItem[]; advice_text: string }
    | undefined;

  if (
    !portfolioAdvice ||
    !portfolioAdvice.items ||
    portfolioAdvice.items.length === 0
  ) {
    return (
      <div>
        <h2 className="text-xl font-bold text-gold mb-6">
          {"💼 持仓建议"}
        </h2>
        <div className="bg-card border border-border-subtle rounded-lg p-6 text-center text-text-secondary">
          {"未配置持仓数据。请编辑 config/portfolio.yaml 添加持仓和关注标的。"}
        </div>
      </div>
    );
  }

  const { items, advice_text } = portfolioAdvice;

  // --- Summary stats ---
  const holdingCount = items.filter((it) => it.type === "holding").length;
  const watchlistCount = items.filter((it) => it.type === "watchlist").length;
  const inZoneCount = items.filter((it) => it.status === "in_zone").length;
  const approachingCount = items.filter(
    (it) => it.status === "approaching"
  ).length;

  return (
    <div>
      <h2 className="text-xl font-bold text-gold mb-6">
        {"💼 持仓建议"}
      </h2>

      {/* Summary MetricCards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard label="持仓数量" value={holdingCount} />
        <MetricCard label="关注数量" value={watchlistCount} />
        <MetricCard
          label="进入区间"
          value={inZoneCount}
          color="text-accent-green"
        />
        <MetricCard
          label="接近目标"
          value={approachingCount}
          color="text-[#f59e0b]"
        />
      </div>

      {/* AI Advice Text */}
      {advice_text && advice_text.trim().length > 0 && (
        <div className="bg-card border border-border-subtle rounded-lg p-6 mb-6">
          <h3 className="text-sm font-semibold mb-4 text-text-muted uppercase tracking-wider">
            {"AI 操作建议"}
          </h3>
          <AdviceTextRenderer text={advice_text} />
        </div>
      )}

      {/* Data Table */}
      <div className="bg-card border border-border-subtle rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">
          {"全部标的明细"}
        </h3>
        <DataTable
          columns={[
            {
              key: "symbol",
              label: "Symbol",
              render: (v: string) => (
                <span className="font-semibold text-text-primary">{v}</span>
              ),
            },
            { key: "name", label: "名称" },
            {
              key: "type",
              label: "类型",
              align: "center",
              render: (v: string) => (
                <span
                  className={
                    v === "holding"
                      ? "text-accent-blue text-xs"
                      : "text-text-muted text-xs"
                  }
                >
                  {v === "holding" ? "持仓" : "关注"}
                </span>
              ),
            },
            {
              key: "current_price",
              label: "现价",
              align: "right",
              render: (v: number) => fmt(v),
            },
            {
              key: "target_buy",
              label: "目标买入",
              align: "right",
              render: (v: number) => fmt(v),
            },
            {
              key: "distance_to_target_pct",
              label: "距离%",
              align: "right",
              render: (v: number) => {
                if (v == null) return "\u2014";
                const color =
                  v <= 0
                    ? "text-accent-green"
                    : v <= 5
                    ? "text-[#f59e0b]"
                    : "text-text-muted";
                return <span className={color}>{pct(v)}</span>;
              },
            },
            {
              key: "ema_200",
              label: "EMA200",
              align: "right",
              render: (v: number) => fmt(v),
            },
            {
              key: "status",
              label: "状态",
              align: "center",
              render: (v: string) => <StatusBadge status={v} />,
            },
            {
              key: "signal_strength",
              label: "信号",
              align: "center",
              render: (v: string) => <SignalBadge signal={v} />,
            },
            {
              key: "rsi",
              label: "RSI",
              align: "right",
              render: (v: number) => {
                if (v == null) return "\u2014";
                const color =
                  v > 70
                    ? "text-accent-red"
                    : v < 30
                    ? "text-accent-green"
                    : "text-text-primary";
                return <span className={color}>{v.toFixed(1)}</span>;
              },
            },
          ]}
          data={items}
        />
      </div>
    </div>
  );
}
