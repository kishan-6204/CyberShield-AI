function BarChart({ data = [], title, subtitle }) {
  const maxValue = Math.max(...data.map((item) => Number(item.value) || 0), 1);

  return (
    <article className="flex h-full flex-col rounded-3xl border border-white/10 bg-slate-950/60 p-5">
      <div className="border-b border-white/10 pb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">Chart</p>
        <h3 className="mt-2 text-xl font-bold text-white">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
      </div>

      <div className="mt-5 flex flex-1 flex-col justify-between gap-4">
        {data.map((item) => {
          const value = Number(item.value) || 0;
          const width = Math.max((value / maxValue) * 100, value > 0 ? 18 : 4);

          return (
            <div key={item.label} className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-medium text-slate-200">{item.label}</span>
                <span className="text-slate-400">{value}</span>
              </div>
              <div className="h-10 rounded-2xl bg-slate-900/70 p-1 sm:h-11">
                <div
                  className="flex h-full items-center rounded-xl px-3 text-sm font-semibold text-white transition-all duration-300"
                  style={{ width: `${width}%`, backgroundColor: item.color }}
                >
                  {value > 0 ? `${value}` : '0'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

export default BarChart;