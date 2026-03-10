export default function NoData({
  message = "\u6682\u65e0\u6570\u636e",
}: {
  message?: string;
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <p className="text-4xl mb-3">{"\u26a1"}</p>
        <p className="text-text-secondary text-lg">{message}</p>
        <p className="text-text-muted text-sm mt-2">
          {"\u8bf7\u5148\u8fd0\u884c python main.py \u751f\u6210\u6570\u636e"}
        </p>
      </div>
    </div>
  );
}
