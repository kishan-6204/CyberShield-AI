import { useMemo, useState } from 'react';
import ScanResult from '../components/urlScanner/ScanResult.jsx';
import useAuth from '../hooks/useAuth.js';
import { saveScanHistory } from '../services/firestoreService.js';
import { analyzeUrl, normalizeUrl } from '../utils/urlAnalyzer.js';

function UrlScanner() {
  const [urlInput, setUrlInput] = useState('');
  const [submittedUrl, setSubmittedUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const { currentUser } = useAuth();

  const analysis = useMemo(() => analyzeUrl(submittedUrl), [submittedUrl]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmittedUrl(urlInput);

    if (!urlInput.trim() || !currentUser?.uid) {
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const result = analyzeUrl(urlInput);
      await saveScanHistory(currentUser.uid, {
        type: 'url',
        input: urlInput,
        riskScore: result.riskScore,
        threatLevel: result.threatLevel,
      });

      setMessage('URL scan saved to your dashboard history.');
    } catch {
      setMessage('Scan completed, but saving to Firestore failed.');
    } finally {
      setSaving(false);
    }
  };

  const normalizedPreview = normalizeUrl(urlInput);

  return (
    <section className="container-shell py-10">
      <div className="mb-8 rounded-3xl border border-cyan-300/20 bg-slate-950/50 p-6 shadow-glow md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Threat intelligence module</p>
        <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">URL Phishing Detection</h1>
        <p className="mt-3 max-w-3xl text-slate-400">
          Scan suspicious links with a production-style heuristic engine that highlights phishing patterns before users click.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="glass-card rounded-3xl p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">URL input</p>
          <h2 className="mt-3 text-2xl font-bold text-white">Analyze a destination link</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Missing protocols are normalized automatically. Use the scanner to inspect deceptive domains, shortening services, and suspicious patterns.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label htmlFor="url-input" className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              URL to scan
            </label>
            <input
              id="url-input"
              type="text"
              value={urlInput}
              onChange={(event) => setUrlInput(event.target.value)}
              className="form-input"
              placeholder="example.com/login or https://example.com"
              autoComplete="off"
              spellCheck="false"
            />

            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="submit" className="primary-button sm:flex-1">
                {saving ? 'Saving...' : 'Analyze URL'}
              </button>
              <button type="button" className="secondary-button" onClick={() => setUrlInput('')}>
                Clear
              </button>
            </div>
          </form>

          {message ? <p className="mt-4 rounded-xl border border-cyan-300/15 bg-cyan-300/[0.05] px-4 py-3 text-sm text-cyan-100">{message}</p> : null}

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Normalized preview</p>
            <p className="mt-3 break-all text-sm text-slate-200">{normalizedPreview || 'https://...'}</p>
          </div>

          <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-5 text-sm leading-6 text-cyan-50">
            The scanner evaluates HTTPS usage, IP-based destinations, excessive length, suspicious keywords, hyphen density, digits, subdomains, and shortening services.
          </div>
        </div>

        <ScanResult result={analysis} />
      </div>
    </section>
  );
}

export default UrlScanner;