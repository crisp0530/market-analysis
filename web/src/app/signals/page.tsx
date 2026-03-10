import { loadData, getLatestDate } from "@/lib/data";
import NoData from "@/components/NoData";

export default function SignalsPage({
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
        {"\ud83d\udcc8 \u7a81\u7834/\u629b\u7269\u7ebf"}
      </h2>
      <p className="text-text-secondary">
        {"\u9875\u9762\u5185\u5bb9\u5f85\u5b9e\u73b0..."}
      </p>
    </div>
  );
}
