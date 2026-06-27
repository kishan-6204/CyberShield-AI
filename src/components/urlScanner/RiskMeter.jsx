const meterStyles = {
  Safe: 'from-emerald-400 to-cyan-300',
  'Low Risk': 'from-amber-400 to-yellow-300',
  'Medium Risk': 'from-orange-400 to-amber-300',
  'High Risk': 'from-rose-500 to-red-400',
};

function RiskMeter({ riskScore, threatLevel }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-400">Risk score</p>
          <p className="mt-1 text-4xl font-bold text-white">
            {riskScore}
            <span className="text-lg text-slate-500">/100</span>
          </p>
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">{threatLevel}</p>
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full bg-gradient-to-r transition-all duration-300 ${meterStyles[threatLevel] ?? meterStyles.Safe}`}
          style={{ width: `${riskScore}%` }}
        />
      </div>
    </div>
  );
}

export default RiskMeter;