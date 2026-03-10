const TIER_COLORS: Record<string, string> = {
  T1: "bg-accent-green text-primary",
  T2: "bg-accent-blue text-primary",
  T3: "bg-[#f59e0b] text-primary",
  T4: "bg-accent-red text-primary",
};

export default function TierBadge({ tier }: { tier: string }) {
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium ${
        TIER_COLORS[tier] || "bg-gray-600 text-white"
      }`}
    >
      {tier}
    </span>
  );
}
