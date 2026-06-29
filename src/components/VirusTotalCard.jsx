import EngineResults from './EngineResults.jsx';
import ReputationBadge from './ReputationBadge.jsx';

function formatDate(value) {
  if (!value) {
    return 'No previous analysis';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

function VirusTotalCard({ virusTotal }) {
  const stats = virusTotal?.stats || {
    malicious: 0,
    suspicious: 0,
    harmless: 0,
    undetected: 0,
  };

  return (
    <section className="rounded-2xl border border-cyan-300/15 bg-slate-950/60 p-5">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">VirusTotal intelligence</p>
          <h3 className="mt-2 text-xl font-bold text-white">Community reputation</h3>
          <p className="mt-1 text-sm text-slate-400">Supplement the heuristic scan with threat intel from VirusTotal.</p>
        </div>
        <ReputationBadge label={virusTotal?.reputationLabel || 'Undetected'} score={virusTotal?.reputation} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Malicious</p>
          <p className="mt-2 text-2xl font-bold text-white">{stats.malicious}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Suspicious</p>
          <p className="mt-2 text-2xl font-bold text-white">{stats.suspicious}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Harmless</p>
          <p className="mt-2 text-2xl font-bold text-white">{stats.harmless}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Undetected</p>
          <p className="mt-2 text-2xl font-bold text-white">{stats.undetected}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Last analysis date</p>
          <p className="mt-2 text-sm text-slate-200">{formatDate(virusTotal?.lastAnalysis)}</p>

          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Overall recommendation</p>
          <p className="mt-2 text-sm leading-6 text-slate-200">{virusTotal?.overallRecommendation || 'VirusTotal analysis is unavailable.'}</p>

          {virusTotal?.message ? <p className="mt-4 rounded-xl border border-cyan-300/15 bg-cyan-300/[0.05] px-4 py-3 text-sm text-cyan-100">{virusTotal.message}</p> : null}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Top detection engines</p>
          <div className="mt-4">
            <EngineResults engines={(virusTotal?.engineResults || []).slice(0, 5)} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default VirusTotalCard;