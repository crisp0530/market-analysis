import { loadData, getLatestDate } from "@/lib/data";
import NoData from "@/components/NoData";
import DataTable from "@/components/DataTable";
import TierBadge from "@/components/TierBadge";

export default function PremarketPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const date = searchParams.date || getLatestDate();
  if (!date) return <NoData />;
  const data = loadData(date);
  if (!data) return <NoData />;

  const { strength } = data;

  // Filter items that have premarket data
  const pmItems = strength.filter(
    (s) => s.pm_price != null && s.pm_price !== undefined
  );

  if (pmItems.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-bold text-gold mb-6">
          {"⏰ 盘前异动"}
        </h2>
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <p className="text-4xl mb-3">{"🌙"}</p>
            <p className="text-text-secondary text-lg">
              无盘前数据（仅美股交易时段前可用）
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Sort by absolute premarket change percentage descending
  const sorted = [...pmItems].sort(
    (a, b) =>
      Math.abs(b.pm_change_pct ?? 0) - Math.abs(a.pm_change_pct ?? 0)
  );

  return (
    <div>
      <h2 className="text-xl font-bold text-gold mb-6">
        {"⏰ 盘前异动"}
      </h2>

      <div className="bg-card border border-border-subtle rounded-lg p-4">
        <h3 className="text-sm font-semibold text-text-primary mb-3">
          盘前报价 · {sorted.length} 只
        </h3>
        <DataTable
          columns={[
            { key: "symbol", label: "Symbol" },
            { key: "name", label: "Name" },
            { key: "market", label: "Market" },
            {
              key: "close",
              label: "昨收",
              align: "right",
              render: (v: number) => v?.toFixed(2) ?? "—",
            },
            {
              key: "pm_price",
              label: "盘前价",
              align: "right",
              render: (v: number) => (
                <span className="text-text-primary font-medium">
                  {v?.toFixed(2) ?? "—"}
                </span>
              ),
            },
            {
              key: "pm_change_pct",
              label: "涨跌%",
              align: "right",
              render: (v: number) => (
                <span
                  className={
                    v > 0
                      ? "text-accent-green font-medium"
                      : v < 0
                      ? "text-accent-red font-medium"
                      : "text-text-primary"
                  }
                >
                  {v > 0 ? "+" : ""}
                  {v?.toFixed(2) ?? "—"}%
                </span>
              ),
            },
            {
              key: "pm_gap",
              label: "缺口%",
              align: "right",
              render: (v: number) => (
                <span
                  className={
                    v > 0
                      ? "text-accent-green"
                      : v < 0
                      ? "text-accent-red"
                      : "text-text-primary"
                  }
                >
                  {v != null
                    ? `${v > 0 ? "+" : ""}${v.toFixed(2)}%`
                    : "—"}
                </span>
              ),
            },
            {
              key: "tier",
              label: "Tier",
              align: "center",
              render: (v: string) => <TierBadge tier={v} />,
            },
          ]}
          data={sorted}
        />
      </div>
    </div>
  );
}
