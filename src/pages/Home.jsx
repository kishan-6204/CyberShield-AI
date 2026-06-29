import { Link } from 'react-router-dom';

const features = [
  ['URL Phishing Detection', 'Evaluate suspicious links before they become credential theft incidents.'],
  ['Email Threat Analysis', 'Review suspicious messages for social engineering and malicious indicators.'],
  ['Password Strength Checker', 'Guide users toward stronger, more resilient credential choices.'],
  ['Reports', 'Generate professional security reports from your scan history and threat intelligence.'],
];

const benefits = [
  {
    title: 'AI-Powered Detection',
    description: 'Layer rule-based analysis with intelligent threat detection to reduce false confidence.',
    icon: '✦',
  },
  {
    title: 'Real-Time Protection',
    description: 'Act quickly with fast, responsive workflows designed for immediate security decisions.',
    icon: '◉',
  },
  {
    title: 'Privacy First',
    description: 'Keep data handling transparent and focused on minimal exposure across every module.',
    icon: '⛨',
  },
  {
    title: 'Professional Reporting',
    description: 'Turn scan history into executive-ready reporting with clear summaries and threat context.',
    icon: '▣',
  },
];

const statistics = [
  ['99% Threat Detection Accuracy', 'Precision-tuned analysis across supported workflows.'],
  ['24/7 AI Analysis', 'Always-on security coverage for suspicious content and links.'],
  ['4 Security Modules', 'A focused toolkit for phishing, credentials, reporting, and review.'],
  ['Real-Time Threat Intelligence', 'Combine heuristics with live intelligence signals.'],
];

const featureButtons = {
  'URL Phishing Detection': 'Analyze URL',
  'Email Threat Analysis': 'Analyze Email',
  'Password Strength Checker': 'Check Password',
  Reports: 'View Reports',
};

function FeatureIcon({ title }) {
  const iconStyles = {
    'URL Phishing Detection': 'text-cyan-200 bg-cyan-300/10 ring-cyan-300/20',
    'Email Threat Analysis': 'text-emerald-200 bg-emerald-300/10 ring-emerald-300/20',
    'Password Strength Checker': 'text-amber-200 bg-amber-300/10 ring-amber-300/20',
    Reports: 'text-rose-200 bg-rose-300/10 ring-rose-300/20',
  };

  const symbol = {
    'URL Phishing Detection': '↗',
    'Email Threat Analysis': '✉',
    'Password Strength Checker': '⌁',
    Reports: '▤',
  };

  return (
    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${iconStyles[title] || iconStyles.Reports}`}>
      <span className="text-xl font-semibold">{symbol[title] || '•'}</span>
    </div>
  );
}

function BenefitIcon({ icon }) {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-cyan-200 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
      <span className="text-lg font-semibold">{icon}</span>
    </div>
  );
}

function Home() {
  return (
    <div className="overflow-hidden">
      <section className="container-shell relative py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-x-0 top-8 -z-10 mx-auto h-80 max-w-5xl rounded-full bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.16),transparent_60%)] blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-20 -z-10 h-56 w-56 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.14),transparent_65%)] blur-3xl" />

        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center rounded-full border border-cyan-300/20 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-cyan-100 shadow-lg shadow-cyan-950/10">
            Trusted AI Cybersecurity Platform
          </span>

          <div className="relative mx-auto mt-8 max-w-4xl">
            <div className="absolute inset-x-12 top-1/2 -z-10 h-28 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-400/10 via-emerald-300/10 to-sky-400/10 blur-3xl" />
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            AI-Powered Cybersecurity Protection
            </h1>
          </div>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
            Detect phishing threats, analyze suspicious emails, evaluate password strength, and improve your
            cybersecurity awareness.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/register"
              className="group inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_16px_40px_rgba(34,211,238,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(16,185,129,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
            >
              <span>Get Started</span>
              <span className="ml-2 transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </Link>
            <a
              href="#features"
              className="group inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
            >
              <span>Learn More</span>
              <span className="ml-2 transition-transform duration-300 group-hover:translate-x-0.5">↘</span>
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="container-shell py-12 sm:py-16">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">Platform modules</p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Security tools built for everyday decisions</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            CyberShield AI brings together focused detection workflows, reporting, and guidance in one responsive security workspace.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map(([title, description]) => (
            <article
              key={title}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/55 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/20 hover:shadow-[0_22px_60px_rgba(8,145,178,0.12)]"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-emerald-300 to-sky-400 opacity-80" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative flex h-full flex-col">
                <FeatureIcon title={title} />
                <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
                <div className="mt-6">
                  <Link
                    to={title === 'URL Phishing Detection' ? '/url-scanner' : title === 'Email Threat Analysis' ? '/email-analyzer' : title === 'Password Strength Checker' ? '/password-checker' : '/reports'}
                    className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:border-cyan-300/25 hover:bg-cyan-300/10 hover:text-cyan-100"
                  >
                    {featureButtons[title] || 'Learn More'}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container-shell py-10 sm:py-14">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {benefits.map((benefit) => (
            <article
              key={benefit.title}
              className="group rounded-3xl border border-white/10 bg-slate-950/55 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/20 hover:shadow-[0_22px_60px_rgba(34,211,238,0.08)]"
            >
              <div className="flex items-start gap-4">
                <BenefitIcon icon={benefit.icon} />
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-white">{benefit.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{benefit.description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container-shell py-10 sm:py-14">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {statistics.map(([title, description]) => (
            <article
              key={title}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.14)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/20 hover:bg-white/[0.045]"
            >
              <p className="text-3xl font-bold tracking-tight text-white sm:text-[2rem]">{title}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container-shell pb-20 pt-6 sm:pt-10">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/80 via-slate-950/65 to-cyan-950/30 p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_55%)]" />
          <div className="relative mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Start building safer cyber habits today.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Explore the CyberShield AI dashboard foundation and prepare for upcoming detection workflows.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_16px_40px_rgba(34,211,238,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(16,185,129,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
              >
                Explore Dashboard
              </Link>
              <Link
                to="/url-scanner"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
              >
                Start Free Analysis
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
