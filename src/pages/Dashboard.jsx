import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardCard from '../components/dashboard/DashboardCard.jsx';
import useAuth from '../hooks/useAuth.js';
import { subscribeToDashboardData } from '../services/firestoreService.js';

const sidebarItems = [
  { label: 'Dashboard', path: '/dashboard', active: true },
  { label: 'Email Analyzer', path: '/email-analyzer' },
  { label: 'URL Scanner', path: '/url-scanner' },
  { label: 'Password Checker', path: '/password-checker' },
  { label: 'Settings' },
];

function formatDateTime(value) {
  if (!value) {
    return 'Just now';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

function getStatusClass(riskScore) {
  if (riskScore >= 76) return 'bg-rose-300/10 text-rose-200';
  if (riskScore >= 51) return 'bg-amber-300/10 text-amber-200';
  if (riskScore >= 26) return 'bg-cyan-300/10 text-cyan-200';
  return 'bg-emerald-300/10 text-emerald-200';
}

function getActivityTypeLabel(activityType) {
  if (activityType === 'url') return 'URL Scan';
  if (activityType === 'password') return 'Password Check';
  if (activityType === 'email') return 'Email Analysis';
  return 'Analysis';
}

function Dashboard() {
  const { currentUser, currentUserName } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError('');

    return subscribeToDashboardData(
      currentUser.uid,
      (data) => {
        setDashboardData(data);
        setLoading(false);
      },
      (loadError) => {
        setError(loadError?.message || 'Failed to load dashboard data.');
        setLoading(false);
      },
    );
  }, [currentUser?.uid]);

  return (
    <section className="container-shell py-8">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="glass-card rounded-2xl p-4 lg:min-h-[720px]">
          <p className="px-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Workspace</p>
          <nav className="mt-4 space-y-1">
            {sidebarItems.map((item) => {
              const classes = `block w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                item.active ? 'bg-cyan-400/10 text-cyan-200' : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`;

              return item.path ? (
                <Link key={item.label} to={item.path} className={classes}>
                  {item.label}
                </Link>
              ) : (
                <button key={item.label} type="button" className={classes}>
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/40 p-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">Security command center</p>
              <h1 className="mt-2 text-3xl font-bold text-white">Welcome back, {currentUserName}</h1>
              <p className="mt-2 text-slate-400">
                {currentUser?.email ? `Signed in as ${currentUser.email}.` : 'Monitor your security workspace and activity.'}
              </p>
            </div>
            <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-200">
              {loading ? 'Syncing Data' : 'System Ready'}
            </span>
          </div>

          {error ? <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 px-5 py-4 text-sm text-rose-100">{error}</div> : null}

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardCard label="Total URL Scans" value={loading ? '—' : dashboardData?.totalUrlScans ?? 0} note="Stored in scan history" />
            <DashboardCard label="Total Password Checks" value={loading ? '—' : dashboardData?.totalPasswordChecks ?? 0} note="Stored in scan history" tone="emerald" />
            <DashboardCard label="Email Analyses" value={loading ? '—' : dashboardData?.totalEmailAnalyses ?? 0} note="Gemini + heuristics" tone="slate" />
            <DashboardCard label="Security Score" value={loading ? '—' : `${dashboardData?.securityScore ?? 0}/100`} note="Based on recent scan risk" tone="amber" />
            <DashboardCard label="Recent Activity" value={loading ? '—' : dashboardData?.recentActivity?.length ?? 0} note="Latest completed scans" tone="slate" />
          </div>

          <div className="glass-card overflow-hidden rounded-2xl">
            <div className="border-b border-white/10 p-6">
              <h2 className="text-xl font-bold text-white">Recent Activity</h2>
              <p className="mt-1 text-sm text-slate-400">Latest URL and password scans saved in Firestore.</p>
            </div>
            {loading ? (
              <div className="p-6 text-sm text-slate-400">Loading recent activity...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                  <thead className="bg-white/[0.03] text-slate-400">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Activity</th>
                      <th className="px-6 py-4 font-semibold">Type</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {(dashboardData?.recentActivity || []).map((activity) => (
                      <tr key={activity.id} className="text-slate-300">
                        <td className="px-6 py-4 font-medium text-white">{activity.input}</td>
                        <td className="px-6 py-4">{getActivityTypeLabel(activity.type)}</td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(activity.riskScore)}`}>
                            {activity.threatLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4">{formatDateTime(activity.createdAt)}</td>
                      </tr>
                    ))}
                    {!dashboardData?.recentActivity?.length ? (
                      <tr>
                        <td className="px-6 py-6 text-sm text-slate-400" colSpan={4}>
                          No scan history yet. Complete a URL scan or password check to populate this dashboard.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
