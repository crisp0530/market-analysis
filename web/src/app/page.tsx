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

  return (
    <div>
      <h2 className="text-xl font-bold text-gold mb-6">
        {"\u5168\u5c40\u6982\u89c8"}
      </h2>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="US \u5e02\u573a\u6e29\u5ea6"
          value={summary.us_temperature || "\u2014"}
          color={
            summary.us_temperature === "\u504f\u5f3a"
              ? "text-accent-green"
              : "text-[#f59e0b]"
          }
        />
        <MetricCard
          label="CN \u5e02\u573a\u6e29\u5ea6"
          value={summary.cn_temperature || "\u2014"}
          color={
            summary.cn_temperature === "\u504f\u5f3a"
              ? "text-accent-green"
              : "text-[#f59e0b]"
          }
        />
        <MetricCard
          label="VIX"
          value={summary.vix_close ?? "\u2014"}
          color={
            (summary.vix_close ?? 20) < 20
              ? "text-accent-green"
              : "text-accent-red"
          }
          subtitle={
            summary.vix_roc_5d
              ? `5d: ${summary.vix_roc_5d > 0 ? "+" : ""}${summary.vix_roc_5d}%`
              : undefined
          }
        />
        <MetricCard
          label="\u5f02\u5e38\u4fe1\u53f7"
          value={summary.anomaly_count}
          color={
            summary.anomaly_count > 0 ? "text-accent-red" : "text-accent-green"
          }
        />
      </div>

      <div className="bg-card border border-border-subtle rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">
          {"\u5f3a\u5f31\u6392\u540d"}
        </h3>
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
                <span
                  className={
                    v >= 0 ? "text-accent-green" : "text-accent-red"
                  }
                >
                  {v >= 0 ? "+" : ""}
                  {v?.toFixed(2)}%
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
