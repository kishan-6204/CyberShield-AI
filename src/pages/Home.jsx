import { Link } from 'react-router-dom';

const features = [
  ['URL Phishing Detection', 'Evaluate suspicious links before they become credential theft incidents.'],
  ['Email Threat Analysis', 'Review suspicious messages for social engineering and malicious indicators.'],
  ['Password Strength Checker', 'Guide users toward stronger, more resilient credential choices.'],
  ['Security Awareness Quiz', 'Build practical cybersecurity confidence through focused learning.'],
];

const benefits = ['Real-Time Analysis', 'AI Assistance', 'Security Education'];

function Home() {
  return (
    <div className="overflow-hidden">
      <section className="container-shell py-20 sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-200">
            Cybersecurity readiness for modern teams
          </span>
          <h1 className="mt-8 text-4xl font-bold tracking-tight text-white sm:text-6xl">
            AI-Powered Cybersecurity Protection
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Detect phishing threats, analyze suspicious emails, evaluate password strength, and improve your
            cybersecurity awareness.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/register" className="primary-button">Get Started</Link>
            <a href="#features" className="secondary-button">Learn More</a>
          </div>
        </div>
      </section>

      <section id="features" className="container-shell py-12">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">Platform modules</p>
          <h2 className="mt-3 text-3xl font-bold text-white">Security tools built for everyday decisions</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map(([title, description]) => (
            <article key={title} className="glass-card rounded-2xl p-6">
              <div className="mb-5 h-10 w-10 rounded-xl bg-cyan-300/10 ring-1 ring-cyan-300/25" />
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container-shell py-16">
        <div className="grid gap-5 md:grid-cols-3">
          {benefits.map((benefit) => (
            <div key={benefit} className="rounded-2xl border border-white/10 bg-slate-950/40 p-6">
              <p className="text-2xl font-bold text-white">{benefit}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Designed to reduce uncertainty, improve response speed, and reinforce secure behavior.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-shell pb-20">
        <div className="glass-card rounded-3xl p-8 text-center sm:p-12">
          <h2 className="text-3xl font-bold text-white">Start building safer cyber habits today.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Explore the CyberShield AI dashboard foundation and prepare for upcoming detection workflows.
          </p>
          <Link to="/dashboard" className="primary-button mt-8">View Dashboard</Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
