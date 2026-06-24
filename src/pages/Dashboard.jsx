import { Link } from 'react-router-dom';

const stats = [
  ['Total URL Scans', '1,248', '+12% this week'],
  ['Email Analyses', '327', '+18% this week'],
  ['Security Score', '86/100', 'Strong posture'],
  ['Quiz Attempts', '42', 'Training active'],
];

const sidebarItems = [
  { label: 'Dashboard', path: '/dashboard', active: true },
  { label: 'URL Scanner' },
  { label: 'Email Analyzer' },
  { label: 'Password Checker', path: '/password-checker' },
  { label: 'Quiz' },
  { label: 'Settings' },
];

const activities = [
  { item: 'Suspicious login email reviewed', type: 'Email Analysis', status: 'Medium Risk', time: 'Today, 09:42' },
  { item: 'pay-secure-update.net scanned', type: 'URL Scan', status: 'High Risk', time: 'Yesterday, 16:18' },
  { item: 'Password policy exercise completed', type: 'Quiz', status: 'Passed', time: 'Yesterday, 11:05' },
  { item: 'Credential strength guidance viewed', type: 'Password Check', status: 'Improved', time: 'Mon, 14:30' },
];

function Dashboard() {
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
              <h1 className="mt-2 text-3xl font-bold text-white">Dashboard</h1>
              <p className="mt-2 text-slate-400">Monitor mock security activity and prepare for upcoming analysis tools.</p>
            </div>
            <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-200">
              System Ready
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(([label, value, note]) => (
              <article key={label} className="glass-card rounded-2xl p-6">
                <p className="text-sm text-slate-400">{label}</p>
                <p className="mt-3 text-3xl font-bold text-white">{value}</p>
                <p className="mt-2 text-sm text-cyan-200">{note}</p>
              </article>
            ))}
          </div>

          <div className="glass-card overflow-hidden rounded-2xl">
            <div className="border-b border-white/10 p-6">
              <h2 className="text-xl font-bold text-white">Recent Activity</h2>
              <p className="mt-1 text-sm text-slate-400">Mock events for the Day 1 static dashboard interface.</p>
            </div>
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
                  {activities.map((activity) => (
                    <tr key={activity.item} className="text-slate-300">
                      <td className="px-6 py-4 font-medium text-white">{activity.item}</td>
                      <td className="px-6 py-4">{activity.type}</td>
                      <td className="px-6 py-4"><span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-200">{activity.status}</span></td>
                      <td className="px-6 py-4">{activity.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
