const SUSPICIOUS_KEYWORDS = ['login', 'verify', 'secure', 'update', 'confirm', 'bank', 'paypal', 'wallet', 'signin', 'account'];
const SHORTENING_SERVICES = ['bit.ly', 'tinyurl', 'goo.gl', 't.co'];

const THREAT_LEVELS = [
  { min: 0, max: 25, label: 'Safe' },
  { min: 26, max: 50, label: 'Low Risk' },
  { min: 51, max: 75, label: 'Medium Risk' },
  { min: 76, max: 100, label: 'High Risk' },
];

function normalizeUrlInput(input = '') {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return '';
  }

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmedInput)) {
    return trimmedInput;
  }

  return `https://${trimmedInput}`;
}

function getThreatLevel(riskScore) {
  return THREAT_LEVELS.find((level) => riskScore >= level.min && riskScore <= level.max)?.label ?? 'Safe';
}

function isIpAddress(hostname = '') {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname);
}

function getSubdomainCount(hostname = '') {
  if (!hostname || isIpAddress(hostname)) {
    return 0;
  }

  return hostname.split('.').filter(Boolean).length - 2;
}

export function normalizeUrl(input = '') {
  return normalizeUrlInput(input);
}

export function analyzeUrl(input = '') {
  const rawInput = input.trim();
  const normalizedUrl = normalizeUrlInput(rawInput);

  if (!rawInput) {
    return {
      riskScore: 0,
      threatLevel: 'Safe',
      normalizedUrl: '',
      isValid: false,
      reasons: [],
      recommendations: ['Enter a URL to begin phishing risk analysis.'],
    };
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(normalizedUrl);
  } catch {
    return {
      riskScore: 100,
      threatLevel: 'High Risk',
      normalizedUrl,
      isValid: false,
      reasons: ['The entered value is not a valid URL.'],
      recommendations: [
        'Use a complete URL with a valid domain or IP address.',
        'Check for extra spaces, missing domain parts, or unsupported characters.',
      ],
    };
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const entireUrl = `${parsedUrl.hostname}${parsedUrl.pathname}${parsedUrl.search}`.toLowerCase();
  const reasons = [];
  const recommendations = [];

  let riskScore = 0;

  if (!/^https:$/i.test(parsedUrl.protocol)) {
    riskScore += 15;
    reasons.push('The URL does not use HTTPS.');
    recommendations.push('Use HTTPS to encrypt the connection and reduce interception risk.');
  }

  if (isIpAddress(hostname)) {
    riskScore += 20;
    reasons.push('The URL uses an IP address instead of a domain name.');
    recommendations.push('Prefer trusted domain names over raw IP addresses for sensitive destinations.');
  }

  if (rawInput.length > 75) {
    riskScore += 10;
    reasons.push('The URL is unusually long.');
    recommendations.push('Review long URLs carefully because attackers often hide malicious paths and parameters.');
  }

  const matchedKeywords = SUSPICIOUS_KEYWORDS.filter((keyword) => entireUrl.includes(keyword));
  if (matchedKeywords.length > 0) {
    const keywordRisk = Math.min(matchedKeywords.length * 5, 20);
    riskScore += keywordRisk;
    reasons.push(`The URL contains suspicious keyword${matchedKeywords.length > 1 ? 's' : ''}: ${matchedKeywords.join(', ')}.`);
    recommendations.push('Be cautious when a URL contains login, account, bank, or other credential-related terms.');
  }

  const hyphenCount = (hostname.match(/-/g) ?? []).length;
  if (hyphenCount > 2) {
    riskScore += 10;
    reasons.push('The domain contains more than two hyphens.');
    recommendations.push('Excessive hyphens are often used to imitate legitimate brands or split suspicious names.');
  }

  if ((rawInput.match(/\d/g) ?? []).length > 6) {
    riskScore += 10;
    reasons.push('The URL contains an excessive number of digits.');
    recommendations.push('Excessive numbers can be used to disguise phishing domains or subdomains.');
  }

  const subdomainCount = getSubdomainCount(hostname);
  if (subdomainCount > 3) {
    riskScore += 15;
    reasons.push('The domain uses too many subdomains.');
    recommendations.push('Large subdomain chains can hide the real destination or imitate trusted services.');
  }

  const shorteningService = SHORTENING_SERVICES.find((service) => hostname === service || hostname.endsWith(`.${service}`));
  if (shorteningService) {
    riskScore += 25;
    reasons.push(`The URL uses the shortening service ${shorteningService}.`);
    recommendations.push('Expand shortened links before opening them and verify the final destination first.');
  }

  const normalizedRiskScore = Math.min(riskScore, 100);

  return {
    riskScore: normalizedRiskScore,
    threatLevel: getThreatLevel(normalizedRiskScore),
    normalizedUrl,
    isValid: true,
    reasons: reasons.length > 0 ? Array.from(new Set(reasons)) : ['No high-risk phishing indicators were detected.'],
    recommendations:
      recommendations.length > 0
        ? Array.from(new Set(recommendations))
        : ['Keep monitoring the URL against additional threat intelligence before trusting it.'],
  };
}

export { SHORTENING_SERVICES, SUSPICIOUS_KEYWORDS, THREAT_LEVELS };