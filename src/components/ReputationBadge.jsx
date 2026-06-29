const badgeStyles = {
  Malicious: 'border-rose-300/20 bg-rose-300/10 text-rose-200',
  Suspicious: 'border-amber-300/20 bg-amber-300/10 text-amber-200',
  Harmless: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-200',
  Undetected: 'border-slate-300/20 bg-slate-300/10 text-slate-200',
};

function ReputationBadge({ label = 'Undetected', score }) {
  return (
    <span className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${badgeStyles[label] ?? badgeStyles.Undetected}`}>
      {label}
      {Number.isFinite(score) ? <span className="ml-2 text-white/60">({score})</span> : null}
    </span>
  );
}

export default ReputationBadge;