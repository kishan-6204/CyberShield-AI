const badgeStyles = {
  Safe: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-200',
  'Low Risk': 'border-amber-300/20 bg-amber-300/10 text-amber-200',
  'Medium Risk': 'border-orange-300/20 bg-orange-300/10 text-orange-200',
  'High Risk': 'border-rose-300/20 bg-rose-300/10 text-rose-200',
};

function ThreatBadge({ threatLevel }) {
  return (
    <span className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${badgeStyles[threatLevel] ?? badgeStyles.Safe}`}>
      {threatLevel}
    </span>
  );
}

export default ThreatBadge;