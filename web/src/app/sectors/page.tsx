import { loadData, getLatestDate } from "@/lib/data";
import NoData from "@/components/NoData";

export default function SectorsPage({
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
        {"\ud83d\uddfa\ufe0f \u677f\u5757\u70ed\u529b\u56fe"}
      </h2>
      <p className="text-text-secondary">
        {"\u9875\u9762\u5185\u5bb9\u5f85\u5b9e\u73b0..."}
      </p>
    </div>
  );
}
