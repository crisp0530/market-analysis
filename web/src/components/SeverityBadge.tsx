const SEVERITY_COLORS: Record<string, string> = {
  high: "bg-accent-red/20 text-accent-red border-accent-red/30",
  medium: "bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30",
  low: "bg-accent-blue/20 text-accent-blue border-accent-blue/30",
};

export default function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium border ${
        SEVERITY_COLORS[severity] || ""
      }`}
    >
      {severity}
    </span>
  );
}
