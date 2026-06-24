import { useMemo, useState } from 'react';
import { analyzePassword } from '../utils/passwordAnalyzer.js';

const checklistItems = [
  { key: 'hasEightCharacters', label: 'Contains at least 8 characters' },
  { key: 'hasTwelveCharacters', label: 'Contains 12+ characters' },
  { key: 'hasUppercase', label: 'Contains uppercase letters' },
  { key: 'hasLowercase', label: 'Contains lowercase letters' },
  { key: 'hasNumber', label: 'Contains numbers' },
  { key: 'hasSpecialCharacter', label: 'Contains special characters' },
  { key: 'isNotCommonPassword', label: 'Avoids common passwords' },
];

function PasswordChecker() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const analysis = useMemo(() => analyzePassword(password), [password]);

  const checklistState = {
    ...analysis.checks,
    isNotCommonPassword: password.length > 0 && !analysis.checks.isCommonPassword,
  };

  return (
    <section className="container-shell py-10">
      <div className="mb-8 rounded-3xl border border-cyan-300/20 bg-slate-950/50 p-6 shadow-glow md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Credential defense module</p>
        <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">Password Strength Analyzer</h1>
        <p className="mt-3 max-w-3xl text-slate-400">
          Test password resilience in real time against length, character diversity, and common-password risk signals.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card rounded-3xl p-6 md:p-8">
          <label htmlFor="password" className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Password input
          </label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="form-input sm:flex-1"
              placeholder="Enter a password to analyze"
              autoComplete="new-password"
            />
            <button type="button" className="secondary-button" onClick={() => setShowPassword((current) => !current)}>
              {showPassword ? 'Hide' : 'Show'} password
            </button>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm text-slate-400">Strength score</p>
                <p className="mt-1 text-4xl font-bold text-white">{analysis.score}<span className="text-lg text-slate-500">/100</span></p>
              </div>
              <span className={`rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold ${analysis.strength.textColor}`}>
                {analysis.strength.label}
              </span>
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
              <div className={`h-full rounded-full ${analysis.strength.color} transition-all duration-300`} style={{ width: `${analysis.score}%` }} />
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-white">Security checklist</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {checklistItems.map((item) => {
                const passed = Boolean(checklistState[item.key]);
                return (
                  <div key={item.key} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <span className={passed ? 'text-emerald-300' : 'text-rose-300'}>{passed ? '✓' : '✗'}</span>
                    <span className="text-sm text-slate-200">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="glass-card rounded-3xl p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">Recommendations</p>
          <h2 className="mt-3 text-2xl font-bold text-white">Suggestions</h2>
          <ul className="mt-5 space-y-3">
            {(analysis.suggestions.length ? analysis.suggestions : ['Start typing to receive live password guidance.']).map((suggestion) => (
              <li key={suggestion} className="rounded-xl border border-cyan-300/10 bg-cyan-300/[0.04] p-4 text-sm text-slate-200">
                {suggestion}
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
            Common passwords like password, 123456, qwerty, admin, welcome, and letmein are flagged as unsafe.
          </div>
        </aside>
      </div>
    </section>
  );
}

export default PasswordChecker;
