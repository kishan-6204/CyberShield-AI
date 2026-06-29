function getArcPath(cx, cy, radius, startAngle, endAngle) {
  const startX = cx + radius * Math.cos(startAngle);
  const startY = cy + radius * Math.sin(startAngle);
  const endX = cx + radius * Math.cos(endAngle);
  const endY = cy + radius * Math.sin(endAngle);
  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

  return [
    `M ${cx} ${cy}`,
    `L ${startX} ${startY}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
    'Z',
  ].join(' ');
}

function PieChart({ data = [], title, subtitle }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cursor = -Math.PI / 2;

  return (
    <article className="flex h-full flex-col rounded-3xl border border-white/10 bg-slate-950/60 p-5">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">Chart</p>
          <h3 className="mt-2 text-xl font-bold text-white">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Total</p>
          <p className="text-3xl font-bold text-white">{total}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-1 flex-col gap-6">
        <div className="flex justify-center">
          <svg viewBox="0 0 240 240" className="h-56 w-56 shrink-0 max-w-full sm:h-60 sm:w-60">
            <circle cx="120" cy="120" r="84" fill="#0f172a" />
            {data.map((item) => {
              const value = Number(item.value) || 0;
              const sweep = total > 0 ? (value / total) * Math.PI * 2 : 0;
              const startAngle = cursor;
              const endAngle = cursor + sweep;
              cursor = endAngle;

              if (!value) {
                return null;
              }

              return <path key={item.label} d={getArcPath(120, 120, 84, startAngle, endAngle)} fill={item.color} />;
            })}
            <circle cx="120" cy="120" r="48" fill="#0f172a" />
            <text x="120" y="118" textAnchor="middle" fill="#f8fafc" fontSize="26" fontWeight="700">
              {total}
            </text>
            <text x="120" y="138" textAnchor="middle" fill="#94a3b8" fontSize="11">
              total scans
            </text>
          </svg>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          {data.map((item) => (
            <li key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="min-w-0 text-sm font-medium leading-5 text-slate-200">{item.label}</span>
                </div>
                <span className="shrink-0 text-xl font-bold text-white">{item.value}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${total > 0 ? (item.value / total) * 100 : 0}%`, backgroundColor: item.color }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default PieChart;