function ThreatIndicators({ indicators = [] }) {
  if (!indicators.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">
        No threat indicators detected.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {indicators.map((indicator) => {
        const isDetected = Boolean(indicator.detected);

        return (
          <article
            key={indicator.key}
            className={`rounded-2xl border p-5 transition ${
              isDetected ? 'border-rose-300/20 bg-rose-300/[0.06]' : 'border-emerald-300/15 bg-emerald-300/[0.04]'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-200">{indicator.label}</h3>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${isDetected ? 'bg-rose-300/15 text-rose-100' : 'bg-emerald-300/15 text-emerald-100'}`}>
                {isDetected ? 'Detected' : 'Clear'}
              </span>
            </div>
            {indicator.summary ? <p className="mt-3 text-sm leading-6 text-slate-300">{indicator.summary}</p> : null}
          </article>
        );
      })}
    </div>
  );
}

export default ThreatIndicators;
