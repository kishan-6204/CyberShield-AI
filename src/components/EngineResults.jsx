const engineToneStyles = {
  malicious: 'border-rose-300/20 bg-rose-300/10 text-rose-100',
  suspicious: 'border-amber-300/20 bg-amber-300/10 text-amber-100',
  harmless: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100',
  undetected: 'border-slate-300/10 bg-white/[0.03] text-slate-300',
};

function EngineResults({ engines = [] }) {
  if (!engines.length) {
    return <p className="text-sm text-slate-400">URL has not been analyzed before.</p>;
  }

  return (
    <ul className="space-y-3">
      {engines.map((engine) => (
        <li key={engine.engine} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-semibold text-white">{engine.engine}</p>
              <p className="mt-1 text-sm text-slate-400">{engine.result}</p>
              {engine.method ? <p className="mt-1 text-xs text-slate-500">{engine.method}</p> : null}
            </div>
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${engineToneStyles[engine.category] ?? engineToneStyles.undetected}`}>
              {engine.category}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default EngineResults;