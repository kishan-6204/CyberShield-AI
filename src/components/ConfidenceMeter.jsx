function ConfidenceMeter({ confidence = 0 }) {
  const safeConfidence = Math.max(0, Math.min(100, Number(confidence) || 0));
  const toneClass = safeConfidence >= 80 ? 'bg-emerald-400' : safeConfidence >= 55 ? 'bg-amber-400' : 'bg-cyan-400';

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Confidence</p>
          <p className="mt-2 text-3xl font-bold text-white">{safeConfidence}%</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-300">
          Gemini + heuristics
        </span>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
        <div className={`h-full rounded-full transition-all duration-300 ${toneClass}`} style={{ width: `${safeConfidence}%` }} />
      </div>
    </div>
  );
}

export default ConfidenceMeter;
