import { loadData, getLatestDate } from "@/lib/data";
import NoData from "@/components/NoData";
import MetricCard from "@/components/MetricCard";
import TierBadge from "@/components/TierBadge";
import DataTable from "@/components/DataTable";

export default function OverviewPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const date = searchParams.date || getLatestDate();
  if (!date) return <NoData />;
  const data = loadData(date);
  if (!data) return <NoData />;

  const { summary, strength } = data;

  const tempColor = (temp: string | undefined) => {
    if (!temp) return "text-text-muted";
    if (temp === "强势" || temp === "偏强") return "text-accent-green";
    if (temp === "弱势" || temp === "偏弱") return "text-accent-red";
    return "text-[#f59e0b]";
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gold mb-6">全局概览</h2>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="US 市场温度"
          value={summary.us_temperature || "—"}
          color={tempColor(summary.us_temperature)}
        />
        <MetricCard
          label="CN 市场温度"
          value={summary.cn_temperature || "—"}
          color={tempColor(summary.cn_temperature)}
        />
        <MetricCard
          label="VIX"
          value={summary.vix_close ?? "—"}
          color={(summary.vix_close ?? 20) < 20 ? "text-accent-green" : "text-accent-red"}
          subtitle={
            summary.vix_roc_5d
              ? `5d: ${summary.vix_roc_5d > 0 ? "+" : ""}${summary.vix_roc_5d}%`
              : undefined
          }
        />
        <MetricCard
          label="异常信号"
          value={summary.anomaly_count}
          color={summary.anomaly_count > 0 ? "text-accent-red" : "text-accent-green"}
        />
      </div>

      <div className="bg-card border border-border-subtle rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">强弱排名</h3>
        <DataTable
          columns={[
            { key: "rank", label: "#", align: "center" },
            { key: "symbol", label: "Symbol" },
            { key: "name", label: "Name" },
            { key: "market", label: "Market" },
            {
              key: "roc_5d",
              label: "ROC 5d",
              align: "right",
              render: (v: number) => (
                <span className={v >= 0 ? "text-accent-green" : "text-accent-red"}>
                  {v >= 0 ? "+" : ""}{v?.toFixed(2)}%
                </span>
              ),
            },
            {
              key: "composite_score",
              label: "Score",
              align: "right",
              render: (v: number) => v?.toFixed(0),
            },
            {
              key: "tier",
              label: "Tier",
              align: "center",
              render: (v: string) => <TierBadge tier={v} />,
            },
          ]}
          data={strength.sort((a, b) => a.rank - b.rank)}
        />
      </div>
    </div>
  );
}
