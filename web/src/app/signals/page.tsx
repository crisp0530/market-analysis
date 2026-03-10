import { loadData, getLatestDate } from "@/lib/data";
import NoData from "@/components/NoData";
import DataTable from "@/components/DataTable";
import TierBadge from "@/components/TierBadge";
import MetricCard from "@/components/MetricCard";

const STAGE_COLORS: Record<string, { color: string; label: string }> = {
  Stage1: { color: "#3b82f6", label: "Accumulation" },
  Stage2: { color: "#00d4aa", label: "Markup" },
  Stage3: { color: "#f59e0b", label: "Distribution" },
  Stage4: { color: "#ff4757", label: "Markdown" },
  Stage5: { color: "#a855f7", label: "Breakout" },
  Stage6: { color: "#06b6d4", label: "Parabolic" },
};

const SIGNAL_TYPE_STYLES: Record<string, { icon: string; label: string; bg: string; text: string }> = {
  breakout: { icon: "\ud83d\udd35", label: "\u7a81\u7834", bg: "bg-accent-blue/20", text: "text-accent-blue" },
  parabolic: { icon: "\ud83d\udfe3", label: "\u629b\u7269\u7ebf", bg: "bg-accent-purple/20", text: "text-accent-purple" },
};

export default function SignalsPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const date = searchParams.date || getLatestDate();
  if (!date) return <NoData />;
  const data = loadData(date);
  if (!data) return <NoData />;

  const { cycle_signals, strength } = data;

  // Count symbols per cycle_stage
  const stageCounts: Record<string, number> = {};
  for (const item of strength) {
    const stage = item.cycle_stage || "";
    if (stage && stage.startsWith("Stage")) {
      stageCounts[stage] = (stageCounts[stage] || 0) + 1;
    }
  }

  // Sort strength items by cycle_stage_num DESC for the table
  const cycleItems = strength
    .filter((s) => s.cycle_stage && s.cycle_stage.startsWith("Stage"))
    .sort((a, b) => (b.cycle_stage_num ?? 0) - (a.cycle_stage_num ?? 0));

  return (
    <div>
      <h2 className="text-xl font-bold text-gold mb-6">
        {"\ud83d\udcc8 \u7a81\u7834 / \u629b\u7269\u7ebf"}
      </h2>

      {/* Cycle Signals */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-text-primary mb-3">
          {"\u6d3b\u8dc3\u4fe1\u53f7"}
        </h3>
        {cycle_signals && cycle_signals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cycle_signals.map((signal, i) => {
              const stype = signal.type || (signal as any).signal_type || "unknown";
              const style = SIGNAL_TYPE_STYLES[stype] || {
                icon: "\u26a1",
                label: stype,
                bg: "bg-gold/20",
                text: "text-gold",
              };
              return (
                <div
                  key={i}
                  className={`${style.bg} border border-border-subtle rounded-lg p-4`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text} border border-current/20`}>
                      {style.icon} {style.label}
                    </span>
                    <span className="text-text-primary font-semibold text-sm">
                      {signal.symbol}
                    </span>
                    {(signal as any).confidence && (
                      <span className="text-text-muted text-xs uppercase">
                        {(signal as any).confidence}
                      </span>
                    )}
                  </div>
                  <p className="text-text-secondary text-sm font-mono">
                    {signal.description}
                  </p>
                  {((signal as any).key_level || (signal as any).invalidation) && (
                    <div className="flex gap-4 mt-2 text-xs text-text-muted">
                      {(signal as any).close && (
                        <span>
                          {"\u5f53\u524d"}: <span className="text-text-primary">{Number((signal as any).close).toFixed(2)}</span>
                        </span>
                      )}
                      {(signal as any).key_level && (
                        <span>
                          {"\u5173\u952e\u4ef7\u4f4d"}: <span className="text-accent-green">{Number((signal as any).key_level).toFixed(2)}</span>
                        </span>
                      )}
                      {(signal as any).invalidation && (
                        <span>
                          {"\u5931\u6548"}: <span className="text-accent-red">{Number((signal as any).invalidation).toFixed(2)}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-card border border-border-subtle rounded-lg p-6 text-center text-text-secondary">
            {"\u65e0\u7a81\u7834/\u629b\u7269\u7ebf\u4fe1\u53f7"}
          </div>
        )}
      </div>

      {/* Cycle Stage Distribution */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-text-primary mb-3">
          {"\u5468\u671f\u9636\u6bb5\u5206\u5e03"}
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {(["Stage1", "Stage2", "Stage3", "Stage4", "Stage5", "Stage6"] as const).map(
            (stage) => {
              const info = STAGE_COLORS[stage];
              const count = stageCounts[stage] || 0;
              return (
                <div
                  key={stage}
                  className="rounded-lg p-3 border border-border-subtle text-center"
                  style={{ backgroundColor: `${info.color}15` }}
                >
                  <div
                    className="text-2xl font-bold"
                    style={{ color: info.color }}
                  >
                    {count}
                  </div>
                  <div className="text-xs text-text-muted mt-1">{stage}</div>
                  <div
                    className="text-[10px] mt-0.5"
                    style={{ color: info.color }}
                  >
                    {info.label}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Cycle Details Table */}
      <div className="bg-card border border-border-subtle rounded-lg p-4">
        <h3 className="text-sm font-semibold text-text-primary mb-3">
          {"\u5468\u671f\u8be6\u60c5"}
        </h3>
        {cycleItems.length > 0 ? (
          <DataTable
            columns={[
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
                key: "cycle_stage",
                label: "Stage",
                render: (v: string) => {
                  const info = STAGE_COLORS[v];
                  if (!info) return v;
                  return (
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor: `${info.color}25`,
                        color: info.color,
                      }}
                    >
                      {v}
                    </span>
                  );
                },
              },
              {
                key: "cycle_confidence",
                label: "Confidence",
                align: "right",
                render: (v: number) =>
                  v != null ? `${(v * 100).toFixed(0)}%` : "\u2014",
              },
              {
                key: "cycle_position",
                label: "Position",
                align: "center",
                render: (v: number, row: any) => {
                  if (v == null) return "\u2014";
                  const pct = Math.round(v * 100);
                  const stage = row.cycle_stage || "";
                  const color = STAGE_COLORS[stage]?.color || "#888";
                  return (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                      <span className="text-xs text-text-muted w-8 text-right">
                        {pct}%
                      </span>
                    </div>
                  );
                },
              },
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
                key: "cycle_description",
                label: "\u63cf\u8ff0",
                render: (v: string) => (
                  <span className="text-text-muted text-xs">{v || "\u2014"}</span>
                ),
              },
            ]}
            data={cycleItems}
          />
        ) : (
          <p className="text-text-secondary text-center py-4">
            {"\u65e0\u5468\u671f\u6570\u636e"}
          </p>
        )}
      </div>
    </div>
  );
}
