const THREAT_LEVELS = [
  { min: 0, max: 20, label: 'Safe' },
  { min: 21, max: 40, label: 'Low' },
  { min: 41, max: 65, label: 'Medium' },
  { min: 66, max: 85, label: 'High' },
  { min: 86, max: 100, label: 'Critical' },
];

const SUSPICIOUS_PATTERNS = [
  { key: 'urgency', label: 'Urgency', regex: /\b(urgent|immediately|asap|right away|expires? soon|limited time)\b/i, weight: 12, summary: 'Creates time pressure to reduce scrutiny.' },
  { key: 'credential_harvesting', label: 'Credential Harvesting', regex: /\b(password|login|sign in|credentials|account verification|verify your account|reset password)\b/i, weight: 16, summary: 'Attempts to capture login credentials.' },
  { key: 'fear_tactics', label: 'Fear Tactics', regex: /\b(suspended|locked|disabled|blocked|security alert|unusual activity|risk)\b/i, weight: 14, summary: 'Uses fear to push immediate action.' },
  { key: 'suspicious_links', label: 'Suspicious Links', regex: /(https?:\/\/|www\.|click here|bit\.ly|tinyurl|goo\.gl|t\.co)/i, weight: 16, summary: 'Contains links or link-shortening patterns.' },
  { key: 'grammar_issues', label: 'Grammar Issues', regex: /\b(dear customer|kindly|dear user|dear sir\/madam|your account has been|will permanently suspend)\b/i, weight: 8, summary: 'Language patterns are common in phishing templates.' },
  { key: 'spoofing_attempt', label: 'Spoofing Attempt', regex: /\b(paypal|bank|microsoft|apple|google|amazon|security team|admin department)\b/i, weight: 14, summary: 'Tries to imitate a trusted organization.' },
  { key: 'financial_scam', label: 'Financial Scam', regex: /\b(bank|payment|invoice|wire transfer|refund|lottery|gift|prize|reward)\b/i, weight: 12, summary: 'Focuses on money, prizes, or payment actions.' },
  { key: 'sensitive_information', label: 'Sensitive Information Request', regex: /\b(ssn|social security|card number|cvv|pin|otp|verification code|security question)\b/i, weight: 18, summary: 'Requests highly sensitive information.' },
];

function normalizeText(value = '') {
  return String(value).replace(/\s+/g, ' ').trim();
}

function getThreatLevel(score) {
  return THREAT_LEVELS.find((level) => score >= level.min && score <= level.max)?.label ?? 'Safe';
}

export function analyzeEmailHeuristics(emailText = '') {
  const normalized = normalizeText(emailText);

  if (!normalized) {
    return {
      threatLevel: 'Safe',
      confidence: 0,
      indicators: [],
      summary: 'Paste an email to analyze it for phishing and social engineering patterns.',
      recommendations: ['Review the sender, links, and requests before taking any action.'],
    };
  }

  const lower = normalized.toLowerCase();
  const indicators = [];
  let riskScore = 0;

  SUSPICIOUS_PATTERNS.forEach((pattern) => {
    const detected = pattern.regex.test(lower);

    if (detected) {
      indicators.push({
        key: pattern.key,
        label: pattern.label,
        detected: true,
        summary: pattern.summary,
      });
      riskScore += pattern.weight;
    } else {
      indicators.push({
        key: pattern.key,
        label: pattern.label,
        detected: false,
        summary: pattern.summary,
      });
    }
  });

  if ((lower.match(/https?:\/\//g) || []).length > 1) {
    riskScore += 10;
  }

  if ((lower.match(/!/g) || []).length > 3) {
    riskScore += 6;
  }

  if ((lower.match(/\b(verify|confirm|login|password|account)\b/g) || []).length > 2) {
    riskScore += 8;
  }

  const confidence = Math.max(15, Math.min(99, riskScore + (indicators.filter((indicator) => indicator.detected).length * 3)));
  const threatLevel = getThreatLevel(Math.min(100, riskScore));
  const recommendations = [];

  if (indicators.some((indicator) => indicator.key === 'suspicious_links' && indicator.detected)) {
    recommendations.push('Do not click links until the destination is verified independently.');
  }

  if (indicators.some((indicator) => indicator.key === 'spoofing_attempt' && indicator.detected)) {
    recommendations.push('Verify sender identity using an official channel, not the email thread.');
  }

  if (indicators.some((indicator) => indicator.key === 'credential_harvesting' && indicator.detected)) {
    recommendations.push('Never enter passwords or verification codes from this message.');
  }

  if (indicators.some((indicator) => indicator.key === 'financial_scam' && indicator.detected)) {
    recommendations.push('Validate any money-related request directly with the organization.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Inspect the sender, attachments, and URLs before responding.');
  }

  return {
    threatLevel,
    confidence,
    indicators,
    summary: threatLevel === 'Safe'
      ? 'The email does not strongly resemble a phishing attempt, but sender verification is still recommended.'
      : 'The email contains multiple phishing signals consistent with social engineering or credential theft.',
    recommendations,
  };
}

export { THREAT_LEVELS as EMAIL_THREAT_LEVELS };
