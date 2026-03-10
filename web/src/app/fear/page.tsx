import { loadData, getLatestDate } from "@/lib/data";
import NoData from "@/components/NoData";
import MetricCard from "@/components/MetricCard";
import DataTable from "@/components/DataTable";
import TierBadge from "@/components/TierBadge";

const FEAR_COLORS: Record<string, string> = {
  "极贪婪": "#00d4aa",
  "贪婪": "#4ade80",
  "中性": "#f0b90b",
  "恐慌": "#f97316",
  "极恐慌": "#ff4757",
};

const BOTTOM_COLORS: Record<string, string> = {
  "无": "#8888aa",
  "早期": "#3b82f6",
  "显现": "#f59e0b",
  "强烈": "#ff4757",
};

const FEAR_LABELS_ORDER = ["极贪婪", "贪婪", "中性", "恐慌", "极恐慌"];
const BOTTOM_LABELS_ORDER = ["无", "早期", "显现", "强烈"];

export default function FearPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const date = searchParams.date || getLatestDate();
  if (!date) return <NoData />;
  const data = loadData(date);
  if (!data) return <NoData />;

  const { strength } = data;

  // Compute metrics
  const itemsWithFear = strength.filter(
    (s) => s.fear_score != null && s.fear_score !== undefined
  );
  const avgFearScore =
    itemsWithFear.length > 0
      ? itemsWithFear.reduce((sum, s) => sum + (s.fear_score ?? 0), 0) /
        itemsWithFear.length
      : 0;
  const panicCount = itemsWithFear.filter(
    (s) => s.fear_label === "极恐慌" || s.fear_label === "恐慌"
  ).length;

  const itemsWithBottom = strength.filter(
    (s) => s.bottom_score != null && s.bottom_score !== undefined
  );
  const avgBottomScore =
    itemsWithBottom.length > 0
      ? itemsWithBottom.reduce((sum, s) => sum + (s.bottom_score ?? 0), 0) /
        itemsWithBottom.length
      : 0;
  const bottomSignalCount = itemsWithBottom.filter(
    (s) => s.bottom_label === "强烈" || s.bottom_label === "显现"
  ).length;

  // Distribution counts
  const fearDist: Record<string, number> = {};
  FEAR_LABELS_ORDER.forEach((l) => (fearDist[l] = 0));
  itemsWithFear.forEach((s) => {
    if (s.fear_label && fearDist[s.fear_label] !== undefined) {
      fearDist[s.fear_label]++;
    }
  });

  const bottomDist: Record<string, number> = {};
  BOTTOM_LABELS_ORDER.forEach((l) => (bottomDist[l] = 0));
  itemsWithBottom.forEach((s) => {
    if (s.bottom_label && bottomDist[s.bottom_label] !== undefined) {
      bottomDist[s.bottom_label]++;
    }
  });

  const fearMax = Math.max(...Object.values(fearDist), 1);
  const bottomMax = Math.max(...Object.values(bottomDist), 1);

  // Sorted data for table, with rank added
  const sorted = [...itemsWithFear]
    .sort((a, b) => (b.fear_score ?? 0) - (a.fear_score ?? 0))
    .map((item, idx) => ({ ...item, _rank: idx + 1 }));

  return (
    <div>
      <h2 className="text-xl font-bold text-gold mb-6">
        {"😱 恐慌/底部"}
      </h2>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="平均恐慌分数"
          value={avgFearScore.toFixed(1)}
          color={avgFearScore >= 60 ? "text-accent-red" : avgFearScore >= 40 ? "text-[#f59e0b]" : "text-accent-green"}
        />
        <MetricCard
          label="恐慌/极恐慌数量"
          value={panicCount}
          color={panicCount > 0 ? "text-accent-red" : "text-accent-green"}
          subtitle={`共 ${itemsWithFear.length} 只`}
        />
        <MetricCard
          label="平均底部分数"
          value={avgBottomScore.toFixed(1)}
          color={avgBottomScore >= 40 ? "text-accent-green" : "text-text-primary"}
        />
        <MetricCard
          label="底部信号数量"
          value={bottomSignalCount}
          color={bottomSignalCount > 0 ? "text-accent-green" : "text-text-primary"}
          subtitle="显现 + 强烈"
        />
      </div>

      {/* Distribution Bars */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Fear Distribution */}
        <div className="bg-card border border-border-subtle rounded-lg p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            恐慌分布
          </h3>
          <div className="space-y-2">
            {FEAR_LABELS_ORDER.map((label) => (
              <div key={label} className="flex items-center gap-3">
                <span
                  className="text-xs w-14 text-right shrink-0"
                  style={{ color: FEAR_COLORS[label] }}
                >
                  {label}
                </span>
                <div className="flex-1 h-5 bg-white/[0.03] rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all"
                    style={{
                      width: `${(fearDist[label] / fearMax) * 100}%`,
                      backgroundColor: FEAR_COLORS[label],
                      minWidth: fearDist[label] > 0 ? "2px" : "0px",
                    }}
                  />
                </div>
                <span className="text-xs text-text-muted w-8 text-right">
                  {fearDist[label]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Distribution */}
        <div className="bg-card border border-border-subtle rounded-lg p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            底部信号分布
          </h3>
          <div className="space-y-2">
            {BOTTOM_LABELS_ORDER.map((label) => (
              <div key={label} className="flex items-center gap-3">
                <span
                  className="text-xs w-10 text-right shrink-0"
                  style={{ color: BOTTOM_COLORS[label] }}
                >
                  {label}
                </span>
                <div className="flex-1 h-5 bg-white/[0.03] rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all"
                    style={{
                      width: `${(bottomDist[label] / bottomMax) * 100}%`,
                      backgroundColor: BOTTOM_COLORS[label],
                      minWidth: bottomDist[label] > 0 ? "2px" : "0px",
                    }}
                  />
                </div>
                <span className="text-xs text-text-muted w-8 text-right">
                  {bottomDist[label]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card border border-border-subtle rounded-lg p-4">
        <h3 className="text-sm font-semibold text-text-primary mb-3">
          恐慌/底部详情
        </h3>
        <DataTable
          columns={[
            {
              key: "_rank",
              label: "#",
              align: "center",
            },
            { key: "symbol", label: "Symbol" },
            { key: "name", label: "Name" },
            { key: "market", label: "Market" },
            {
              key: "tier",
              label: "Tier",
              align: "center",
              render: (v: string) => <TierBadge tier={v} />,
            },
            {
              key: "fear_score",
              label: "恐慌分数",
              align: "right",
              render: (v: number) => (
                <span
                  className={
                    v >= 60
                      ? "text-accent-red"
                      : v >= 40
                      ? "text-[#f59e0b]"
                      : "text-accent-green"
                  }
                >
                  {v?.toFixed(1)}
                </span>
              ),
            },
            {
              key: "fear_label",
              label: "恐慌标签",
              align: "center",
              render: (v: string) => (
                <span
                  className="text-xs font-medium"
                  style={{ color: FEAR_COLORS[v] || "#8888aa" }}
                >
                  {v || "—"}
                </span>
              ),
            },
            {
              key: "bottom_score",
              label: "底部分数",
              align: "right",
              render: (v: number) => (
                <span
                  className={
                    v >= 40
                      ? "text-accent-green"
                      : "text-text-primary"
                  }
                >
                  {v?.toFixed(1) ?? "—"}
                </span>
              ),
            },
            {
              key: "bottom_label",
              label: "底部信号",
              align: "center",
              render: (v: string) => (
                <span
                  className="text-xs font-medium"
                  style={{ color: BOTTOM_COLORS[v] || "#8888aa" }}
                >
                  {v || "—"}
                </span>
              ),
            },
          ]}
          data={sorted}
        />
      </div>
    </div>
  );
}
