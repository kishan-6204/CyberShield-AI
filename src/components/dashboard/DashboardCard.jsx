function DashboardCard({ label, value, note, tone = 'cyan' }) {
  const toneStyles = {
    cyan: 'text-cyan-200',
    emerald: 'text-emerald-200',
    amber: 'text-amber-200',
    slate: 'text-slate-200',
  };

  return (
    <article className="glass-card rounded-2xl p-6">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-3 text-3xl font-bold ${toneStyles[tone] || toneStyles.cyan}`}>{value}</p>
      {note ? <p className="mt-2 text-sm text-slate-400">{note}</p> : null}
    </article>
  );
}

export default DashboardCard;