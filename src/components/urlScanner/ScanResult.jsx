import RiskMeter from './RiskMeter.jsx';
import ThreatBadge from './ThreatBadge.jsx';
import RecommendationCard from './RecommendationCard.jsx';

function ScanResult({ result }) {
  if (!result) {
    return (
      <aside className="glass-card rounded-3xl p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">Scan result</p>
        <h2 className="mt-3 text-2xl font-bold text-white">No scan yet</h2>
        <p className="mt-3 text-slate-400">Enter a URL and run the scanner to generate a phishing risk assessment.</p>
      </aside>
    );
  }

  return (
    <aside className="glass-card rounded-3xl p-6 md:p-8">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">Scan result</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Threat analysis</h2>
            <p className="mt-1 break-all text-sm text-slate-400">{result.normalizedUrl}</p>
          </div>
          <ThreatBadge threatLevel={result.threatLevel} />
        </div>
      </div>

      <div className="mt-6">
        <RiskMeter riskScore={result.riskScore} threatLevel={result.threatLevel} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Reasons</h3>
          <ul className="mt-3 space-y-3">
            {result.reasons.map((reason) => (
              <li key={reason} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-200">
                {reason}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Recommendations</h3>
          <ul className="mt-3 space-y-3">
            {result.recommendations.map((recommendation) => (
              <RecommendationCard key={recommendation} title="Action needed" description={recommendation} />
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}

export default ScanResult;