interface MetricCardProps {
  label: string;
  value: string | number;
  color?: string;
  subtitle?: string;
}

export default function MetricCard({
  label,
  value,
  color = "text-text-primary",
  subtitle,
}: MetricCardProps) {
  return (
    <div className="bg-card border border-border-subtle rounded-lg p-4">
      <div className="text-text-muted text-xs uppercase tracking-wider">
        {label}
      </div>
      <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
      {subtitle && (
        <div className="text-text-muted text-xs mt-1">{subtitle}</div>
      )}
    </div>
  );
}
