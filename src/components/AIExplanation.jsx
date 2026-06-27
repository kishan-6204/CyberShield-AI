function AIExplanation({ summary = '', recommendations = [] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">AI Summary</p>
        <p className="mt-4 text-sm leading-7 text-slate-200">{summary || 'No AI summary is available yet.'}</p>
      </article>
      <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">Recommended Action</p>
        <ul className="mt-4 space-y-3">
          {(recommendations.length ? recommendations : ['No recommendation available.']).map((item) => (
            <li key={item} className="rounded-xl border border-cyan-300/10 bg-cyan-300/[0.04] px-4 py-3 text-sm text-slate-200">
              {item}
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}

export default AIExplanation;
