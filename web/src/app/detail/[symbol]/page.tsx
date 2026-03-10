import { loadData, getLatestDate } from "@/lib/data";
import NoData from "@/components/NoData";

export default function DetailPage({
  params,
  searchParams,
}: {
  params: { symbol: string };
  searchParams: { date?: string };
}) {
  const date = searchParams.date || getLatestDate();
  if (!date) return <NoData />;
  const data = loadData(date);
  if (!data) return <NoData />;

  const symbol = decodeURIComponent(params.symbol);

  return (
    <div>
      <h2 className="text-xl font-bold text-gold mb-6">
        {"\ud83d\udccb"} {"\u4e2a\u80a1\u8be6\u60c5"} - {symbol}
      </h2>
      <p className="text-text-secondary">
        {"\u9875\u9762\u5185\u5bb9\u5f85\u5b9e\u73b0..."}
      </p>
    </div>
  );
}
