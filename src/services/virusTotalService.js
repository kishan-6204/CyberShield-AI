import { analyzeUrl } from '../utils/urlAnalyzer.js';

const VIRUSTOTAL_API_KEY = import.meta.env.VITE_VIRUSTOTAL_API_KEY || '';
const VIRUSTOTAL_API_BASE = 'https://www.virustotal.com/api/v3';

function toBase64Url(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function formatVirusTotalDate(timestamp) {
  if (!Number.isFinite(timestamp)) {
    return null;
  }

  return new Date(timestamp * 1000);
}

function getReputationLabel(stats = {}) {
  if (Number(stats.malicious) > 0) {
    return 'Malicious';
  }

  if (Number(stats.suspicious) > 0) {
    return 'Suspicious';
  }

  if (Number(stats.harmless) > 0) {
    return 'Harmless';
  }

  return 'Undetected';
}

function getOverallRecommendation(stats = {}, hasReport = false) {
  if (!hasReport) {
    return 'URL has not been analyzed before. Continue with the heuristic score and recheck if the destination changes.';
  }

  if (Number(stats.malicious) > 0) {
    return 'Block access and investigate the URL before sharing or opening it.';
  }

  if (Number(stats.suspicious) > 0) {
    return 'Exercise caution. Review the destination and verify trust signals before proceeding.';
  }

  return 'VirusTotal reputation looks clean. Keep the heuristic analysis in the decision chain before trusting the URL.';
}

function mapEngineResults(results = {}) {
  return Object.entries(results)
    .map(([engine, result]) => ({
      engine,
      category: String(result?.category || 'undetected'),
      result: String(result?.result || 'No detection'),
      method: String(result?.method || ''),
    }))
    .sort((left, right) => {
      const order = {
        malicious: 0,
        suspicious: 1,
        undetected: 2,
        harmless: 3,
      };

      const leftPriority = order[left.category] ?? 4;
      const rightPriority = order[right.category] ?? 4;

      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }

      return left.engine.localeCompare(right.engine);
    });
}

function createUnavailableResult(normalizedUrl, message) {
  return {
    available: false,
    hasReport: false,
    normalizedUrl,
    message,
    reputation: null,
    reputationLabel: 'Undetected',
    lastAnalysis: null,
    stats: {
      malicious: 0,
      suspicious: 0,
      harmless: 0,
      undetected: 0,
    },
    engineResults: [],
    overallRecommendation: message,
  };
}

async function requestVirusTotal(path, options = {}) {
  const response = await fetch(`${VIRUSTOTAL_API_BASE}${path}`, {
    ...options,
    headers: {
      'x-apikey': VIRUSTOTAL_API_KEY,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const error = new Error(`VirusTotal request failed with status ${response.status}.`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

async function getVirusTotalReport(normalizedUrl) {
  const urlId = toBase64Url(normalizedUrl);

  try {
    return await requestVirusTotal(`/urls/${urlId}`);
  } catch (error) {
    if (error?.status !== 404) {
      throw error;
    }

    await requestVirusTotal('/urls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ url: normalizedUrl }),
    });

    return null;
  }
}

function normalizeVirusTotalResponse(payload) {
  const data = payload?.data?.attributes || {};
  const stats = {
    malicious: Number(data.last_analysis_stats?.malicious || 0),
    suspicious: Number(data.last_analysis_stats?.suspicious || 0),
    harmless: Number(data.last_analysis_stats?.harmless || 0),
    undetected: Number(data.last_analysis_stats?.undetected || 0),
  };

  return {
    available: true,
    hasReport: true,
    normalizedUrl: payload?.data?.id ? data.last_final_url || payload.data.id : '',
    message: '',
    reputation: Number.isFinite(Number(data.reputation)) ? Number(data.reputation) : null,
    reputationLabel: getReputationLabel(stats),
    lastAnalysis: formatVirusTotalDate(Number(data.last_analysis_date)),
    stats,
    engineResults: mapEngineResults(data.last_analysis_results),
    overallRecommendation: getOverallRecommendation(stats, true),
  };
}

export async function analyzeUrlWithVirusTotal(input = '') {
  const heuristic = analyzeUrl(input);
  const normalizedUrl = heuristic.normalizedUrl;

  if (!normalizedUrl || !heuristic.isValid) {
    return {
      ...heuristic,
      virusTotal: createUnavailableResult(normalizedUrl, 'VirusTotal analysis is unavailable for this URL.'),
    };
  }

  if (!VIRUSTOTAL_API_KEY) {
    const virusTotal = createUnavailableResult(normalizedUrl, 'VirusTotal API key is not configured. Showing heuristic analysis only.');
    return {
      ...heuristic,
      virusTotal,
      recommendations: Array.from(new Set([...heuristic.recommendations, virusTotal.overallRecommendation])),
    };
  }

  try {
    const payload = await getVirusTotalReport(normalizedUrl);

    if (!payload) {
      const virusTotal = createUnavailableResult(normalizedUrl, 'URL has not been analyzed before.');
      return {
        ...heuristic,
        virusTotal,
        recommendations: Array.from(new Set([...heuristic.recommendations, virusTotal.overallRecommendation])),
      };
    }

    const virusTotal = normalizeVirusTotalResponse(payload);
    return {
      ...heuristic,
      virusTotal,
      recommendations: Array.from(new Set([...heuristic.recommendations, virusTotal.overallRecommendation])),
    };
  } catch {
    const virusTotal = createUnavailableResult(normalizedUrl, 'VirusTotal request failed. Showing heuristic analysis only.');
    return {
      ...heuristic,
      virusTotal,
      recommendations: Array.from(new Set([...heuristic.recommendations, virusTotal.overallRecommendation])),
    };
  }
}