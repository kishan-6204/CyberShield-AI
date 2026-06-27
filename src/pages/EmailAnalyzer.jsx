import { useMemo, useState } from 'react';
import AIExplanation from '../components/AIExplanation.jsx';
import ConfidenceMeter from '../components/ConfidenceMeter.jsx';
import ThreatAnalysisCard from '../components/ThreatAnalysisCard.jsx';
import ThreatIndicators from '../components/ThreatIndicators.jsx';
import useAuth from '../hooks/useAuth.js';
import { saveScanHistory } from '../services/firestoreService.js';
import { analyzeEmail } from '../services/geminiService.js';

const PLACEHOLDER_EMAIL = `Dear Customer,

Your account has been suspended.

Click the link below immediately.

[https://paypal-secure-login.xyz](https://paypal-secure-login.xyz/)

Failure to verify your account will permanently suspend your account.`;

const THREAT_TONES = {
  Safe: 'emerald',
  Low: 'cyan',
  Medium: 'amber',
  High: 'rose',
  Critical: 'rose',
};

function EmailAnalyzer() {
  const { currentUser } = useAuth();
  const [emailText, setEmailText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  const hasAnalysis = Boolean(analysis);

  const threatLabel = useMemo(() => analysis?.threatLevel || 'Safe', [analysis]);

  const handleAnalyze = async (event) => {
    event.preventDefault();
    setError('');
    setSavedMessage('');
    setLoading(true);

    try {
      const result = await analyzeEmail(emailText);
      setAnalysis(result);

      if (currentUser?.uid) {
        setSaving(true);
        try {
          await saveScanHistory(currentUser.uid, {
            type: 'email',
            input: emailText,
            threatLevel: result.threatLevel,
            confidence: result.confidence,
            indicators: result.indicators,
            summary: result.summary,
            recommendations: result.recommendations,
          });
          setSavedMessage('Email analysis saved to your dashboard history.');
        } finally {
          setSaving(false);
        }
      }
    } catch (analysisError) {
      setError(analysisError?.message || 'Unable to analyze the email.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setEmailText('');
    setAnalysis(null);
    setError('');
    setSavedMessage('');
  };

  return (
    <section className="container-shell py-10">
      <div className="mb-8 rounded-3xl border border-cyan-300/20 bg-slate-950/50 p-6 shadow-glow md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">AI Threat Intelligence Module</p>
        <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">Email Phishing Detection</h1>
        <p className="mt-3 max-w-3xl text-slate-400">
          Paste a suspicious email to analyze phishing risk with Gemini, with rule-based fallback protection when the API key is unavailable or invalid.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="glass-card rounded-3xl p-6 md:p-8">
          <form className="space-y-5" onSubmit={handleAnalyze}>
            <div>
              <label htmlFor="email-input" className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                Paste suspicious email
              </label>
              <textarea
                id="email-input"
                rows={16}
                value={emailText}
                onChange={(event) => setEmailText(event.target.value)}
                className="form-input mt-3 min-h-[360px] resize-y font-mono text-sm leading-6"
                placeholder={PLACEHOLDER_EMAIL}
                spellCheck="false"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="submit" className="primary-button sm:flex-1" disabled={loading || saving}>
                {loading ? 'Analyzing...' : saving ? 'Saving...' : 'Analyze Email'}
              </button>
              <button type="button" className="secondary-button" onClick={handleClear}>
                Clear
              </button>
            </div>
          </form>

          {error ? <p className="mt-4 rounded-xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">{error}</p> : null}
          {savedMessage ? <p className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">{savedMessage}</p> : null}
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <ThreatAnalysisCard
              label="Threat Level"
              value={threatLabel}
              tone={THREAT_TONES[threatLabel] || 'cyan'}
              description="Gemini and heuristics score the message for phishing risk."
            />
            <ThreatAnalysisCard
              label="Detected Signals"
              value={hasAnalysis ? analysis.indicators.filter((indicator) => indicator.detected).length : 0}
              tone="slate"
              description="Highlighted social engineering indicators."
            />
            <ThreatAnalysisCard
              label="Status"
              value={hasAnalysis ? 'Analyzed' : 'Waiting'}
              tone="emerald"
              description="Completed analyses are stored in Firestore history."
            />
          </div>

          <ConfidenceMeter confidence={analysis?.confidence || 0} />

          <ThreatIndicators indicators={analysis?.indicators || []} />

          <AIExplanation summary={analysis?.summary || ''} recommendations={analysis?.recommendations || []} />
        </div>
      </div>
    </section>
  );
}

export default EmailAnalyzer;
