export function StatSummary({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="summary-card">
      <span className="summary-label">{title}</span>
      <strong className="summary-value">{value}</strong>
    </div>
  );
}
