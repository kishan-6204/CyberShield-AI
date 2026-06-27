function ThreatAnalysisCard({ label, value, tone = 'cyan', description }) {
  const toneStyles = {
    cyan: 'border-cyan-300/20 bg-cyan-300/[0.05] text-cyan-100',
    emerald: 'border-emerald-300/20 bg-emerald-300/[0.05] text-emerald-100',
    amber: 'border-amber-300/20 bg-amber-300/[0.05] text-amber-100',
    rose: 'border-rose-300/20 bg-rose-300/[0.05] text-rose-100',
    slate: 'border-white/10 bg-white/[0.03] text-slate-100',
  };

  return (
    <article className={`rounded-2xl border p-5 ${toneStyles[tone] || toneStyles.cyan}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
      {description ? <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p> : null}
    </article>
  );
}

export default ThreatAnalysisCard;
