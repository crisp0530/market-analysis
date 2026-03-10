import { loadData, getLatestDate } from "@/lib/data";
import NoData from "@/components/NoData";
import MetricCard from "@/components/MetricCard";
import SeverityBadge from "@/components/SeverityBadge";

const TYPE_LABELS: Record<string, string> = {
  zscore: "Z-Score异常",
  tier_jump: "Tier跳变",
  clustering: "聚集效应",
  momentum_reversal: "动量反转",
  divergence: "背离",
  cross_market: "跨市场",
};

const SEVERITY_BORDER: Record<string, string> = {
  high: "border-accent-red/40",
  medium: "border-[#f59e0b]/40",
  low: "border-accent-blue/40",
};

export default function AnomaliesPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const date = searchParams.date || getLatestDate();
  if (!date) return <NoData />;
  const data = loadData(date);
  if (!data) return <NoData />;

  const { anomalies } = data;

  if (!anomalies || anomalies.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-bold text-gold mb-6">
          {"⚠️ 异常信号"}
        </h2>
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <p className="text-4xl mb-3">{"✅"}</p>
            <p className="text-text-secondary text-lg">未检测到异常信号</p>
          </div>
        </div>
      </div>
    );
  }

  const highCount = anomalies.filter((a) => a.severity === "high").length;
  const medCount = anomalies.filter((a) => a.severity === "medium").length;
  const lowCount = anomalies.filter((a) => a.severity === "low").length;

  // Type distribution
  const typeDist: Record<string, number> = {};
  anomalies.forEach((a) => {
    typeDist[a.type] = (typeDist[a.type] || 0) + 1;
  });

  // Group anomalies by type
  const grouped: Record<string, typeof anomalies> = {};
  anomalies.forEach((a) => {
    if (!grouped[a.type]) grouped[a.type] = [];
    grouped[a.type].push(a);
  });

  // Sort groups: types with high severity first, then by count
  const sortedTypes = Object.keys(grouped).sort((a, b) => {
    const aHigh = grouped[a].filter((x) => x.severity === "high").length;
    const bHigh = grouped[b].filter((x) => x.severity === "high").length;
    if (aHigh !== bHigh) return bHigh - aHigh;
    return grouped[b].length - grouped[a].length;
  });

  return (
    <div>
      <h2 className="text-xl font-bold text-gold mb-6">
        {"⚠️ 异常信号"}
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="异常总数"
          value={anomalies.length}
          color="text-[#f59e0b]"
        />
        <MetricCard
          label="高严重度"
          value={highCount}
          color={highCount > 0 ? "text-accent-red" : "text-accent-green"}
        />
        <MetricCard
          label="中严重度"
          value={medCount}
          color="text-[#f59e0b]"
        />
        <MetricCard
          label="低严重度"
          value={lowCount}
          color="text-accent-blue"
        />
      </div>

      {/* Type Distribution */}
      <div className="bg-card border border-border-subtle rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-text-primary mb-3">
          异常类型分布
        </h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(typeDist).map(([type, count]) => (
            <div
              key={type}
              className="bg-white/[0.03] border border-border-subtle rounded px-3 py-2 text-sm"
            >
              <span className="text-text-secondary">
                {TYPE_LABELS[type] || type}
              </span>
              <span className="text-text-primary font-bold ml-2">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Anomaly Cards Grouped by Type */}
      <div className="space-y-6">
        {sortedTypes.map((type) => (
          <div key={type}>
            <h3 className="text-sm font-semibold text-text-secondary mb-3">
              {TYPE_LABELS[type] || type} ({grouped[type].length})
            </h3>
            <div className="space-y-3">
              {grouped[type].map((anomaly, idx) => (
                <div
                  key={`${type}-${idx}`}
                  className={`bg-card border rounded-lg p-4 ${
                    SEVERITY_BORDER[anomaly.severity] || "border-border-subtle"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={anomaly.severity} />
                      <span className="text-xs text-text-muted">
                        {TYPE_LABELS[anomaly.type] || anomaly.type}
                      </span>
                    </div>
                  </div>
                  <p className="text-text-primary text-sm mb-2">
                    {anomaly.description}
                  </p>
                  {anomaly.symbols && anomaly.symbols.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {anomaly.symbols.map((sym) => (
                        <span
                          key={sym}
                          className="bg-white/[0.06] text-text-secondary text-xs px-2 py-0.5 rounded"
                        >
                          {sym}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
