function SecuritySummary({ report }) {
  if (!report) {
    return null;
  }

  const summaryCards = [
    { label: 'Security Score', value: `${report.summary.securityScore}/100`, note: report.summary.securityLabel, tone: 'cyan' },
    { label: 'Total Scans', value: report.totals.totalScans, note: 'All authenticated scan types', tone: 'emerald' },
    { label: 'VirusTotal Checks', value: report.totals.virusTotalChecks, note: 'Threat intelligence lookups', tone: 'amber' },
    { label: 'Community Reputation', value: report.summary.communityReputationAverage, note: 'Average reputation score', tone: 'slate' },
  ];

  const toneStyles = {
    cyan: 'text-cyan-200',
    emerald: 'text-emerald-200',
    amber: 'text-amber-200',
    slate: 'text-slate-200',
  };

  return (
    <section className="rounded-3xl border border-cyan-300/15 bg-slate-950/60 p-5 md:p-6">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">Security summary</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Current posture</h2>
          <p className="mt-1 text-sm text-slate-400">A concise view of the authenticated user's history and threat posture.</p>
        </div>
        <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100">
          Generated {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(report.generatedAt)}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-sm text-slate-400">{card.label}</p>
            <p className={`mt-3 text-3xl font-bold ${toneStyles[card.tone] || toneStyles.cyan}`}>{card.value}</p>
            {card.note ? <p className="mt-2 text-sm text-slate-400">{card.note}</p> : null}
          </article>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">URL Summary</p>
          <p className="mt-2 text-sm text-slate-300">{report.sections.urlSummary.total} scans, average risk {report.sections.urlSummary.averageRisk}/100.</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Password Summary</p>
          <p className="mt-2 text-sm text-slate-300">{report.sections.passwordSummary.total} checks, average risk {report.sections.passwordSummary.averageRisk}/100.</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Email Summary</p>
          <p className="mt-2 text-sm text-slate-300">{report.sections.emailSummary.total} analyses, average confidence {report.sections.emailSummary.averageConfidence}%.</p>
        </article>
      </div>
    </section>
  );
}

export default SecuritySummary;