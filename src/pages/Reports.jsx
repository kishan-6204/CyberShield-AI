import { useEffect, useState } from 'react';
import ReportPreview from '../components/ReportPreview.jsx';
import useAuth from '../hooks/useAuth.js';
import { generateSecurityReportPdf, loadSecurityReport } from '../services/reportService.js';

function Reports() {
  const { currentUser, currentUserName } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadReport = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const data = await loadSecurityReport(currentUser);
        if (active) {
          setReport(data);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError?.message || 'Unable to load the security report.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadReport();

    return () => {
      active = false;
    };
  }, [currentUser?.uid]);

  const handleDownload = async () => {
    if (!report) {
      return;
    }

    setGenerating(true);
    setError('');

    try {
      await generateSecurityReportPdf(report);
    } catch (downloadError) {
      setError(downloadError?.message || 'Unable to generate the PDF report.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <section className="container-shell py-10">
      <div className="mb-8 rounded-3xl border border-cyan-300/20 bg-slate-950/50 p-6 shadow-glow md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Security reporting module</p>
        <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">PDF Security Report</h1>
        <p className="mt-3 max-w-3xl text-slate-400">
          Generate a professional PDF report summarizing scan history, current security posture, and threat intelligence for {currentUserName}.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/60 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Report controls</p>
          <p className="mt-2 text-sm text-slate-300">Download a security report based on authenticated Firestore history.</p>
        </div>
        <button type="button" className="primary-button lg:w-auto" onClick={handleDownload} disabled={loading || generating || !report}>
          {generating ? 'Generating PDF...' : 'Download Security Report'}
        </button>
      </div>

      {error ? <div className="mb-6 rounded-2xl border border-rose-300/20 bg-rose-300/10 px-5 py-4 text-sm text-rose-100">{error}</div> : null}

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="glass-card rounded-3xl p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">Report overview</p>
          <h2 className="mt-3 text-2xl font-bold text-white">User information</h2>
          {loading ? (
            <p className="mt-4 text-sm text-slate-400">Loading report data...</p>
          ) : report ? (
            <div className="mt-5 space-y-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Name</p>
                <p className="mt-1 text-white">{report.user.displayName}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Email</p>
                <p className="mt-1 break-all text-white">{report.user.email || 'Not available'}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Security Score</p>
                <p className="mt-1 text-3xl font-bold text-cyan-200">{report.summary.securityScore}/100</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Last Generated</p>
                <p className="mt-1 text-white">
                  {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(report.generatedAt)}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">No report data available yet. Run scans to populate the report.</p>
          )}
        </aside>

        <div className="space-y-6">
          <ReportPreview report={report} />
        </div>
      </div>
    </section>
  );
}

export default Reports;