import { loadData, getLatestDate } from "@/lib/data";
import NoData from "@/components/NoData";

export default function AnomaliesPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const date = searchParams.date || getLatestDate();
  if (!date) return <NoData />;
  const data = loadData(date);
  if (!data) return <NoData />;

  return (
    <div>
      <h2 className="text-xl font-bold text-gold mb-6">
        {"\u26a0\ufe0f \u5f02\u5e38\u4fe1\u53f7"}
      </h2>
      <p className="text-text-secondary">
        {"\u9875\u9762\u5185\u5bb9\u5f85\u5b9e\u73b0..."}
      </p>
    </div>
  );
}
