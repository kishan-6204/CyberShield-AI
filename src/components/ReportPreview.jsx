import BarChart from './Charts/BarChart.jsx';
import PieChart from './Charts/PieChart.jsx';
import SecuritySummary from './SecuritySummary.jsx';

function ReportPreview({ report }) {
  if (!report) {
    return (
      <section className="glass-card rounded-3xl p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">Report preview</p>
        <h2 className="mt-3 text-2xl font-bold text-white">No report loaded</h2>
        <p className="mt-3 text-sm text-slate-400">Load a report to preview the security summary and charts.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <SecuritySummary report={report} />

      <div className="grid items-stretch gap-6 xl:grid-cols-2">
        <div className="h-full">
          <PieChart
            title="Scan Breakdown"
            subtitle="URL, password, and email activity distribution"
            data={report.charts.pie}
          />
        </div>
        <div className="h-full">
          <BarChart
            title="Threat Levels"
            subtitle="Aggregate safe-to-high risk trends"
            data={report.charts.bar}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <article className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">VirusTotal Results</p>
          <h3 className="mt-2 text-xl font-bold text-white">Threat statistics</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Malicious</p>
              <p className="mt-2 text-2xl font-bold text-white">{report.sections.virusTotalSummary.malicious}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Suspicious</p>
              <p className="mt-2 text-2xl font-bold text-white">{report.sections.virusTotalSummary.suspicious}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Harmless</p>
              <p className="mt-2 text-2xl font-bold text-white">{report.sections.virusTotalSummary.harmless}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Undetected</p>
              <p className="mt-2 text-2xl font-bold text-white">{report.sections.virusTotalSummary.undetected}</p>
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">AI Recommendations</p>
          <h3 className="mt-2 text-xl font-bold text-white">Next actions</h3>
          <ul className="mt-4 space-y-3">
            {(report.recommendations.length ? report.recommendations : ['Run a scan to generate recommendations.']).map((item) => (
              <li key={item} className="rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.04] p-4 text-sm text-slate-200">
                {item}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

export default ReportPreview;