import { analyzeEmailHeuristics } from '../utils/emailHeuristics.js';

const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_GEMINI_API_KEY || '';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function stripCodeFences(value = '') {
  return String(value)
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();
}

function safeParseJson(value) {
  const cleaned = stripCodeFences(value);

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    }

    throw new Error('Unable to parse Gemini response.');
  }
}

function buildPrompt(emailText) {
  return `Analyze the email below for phishing and social engineering risk.

Return ONLY a JSON object with this shape:
{
  "threatLevel": "Safe | Low | Medium | High | Critical",
  "confidence": 0,
  "indicators": [
    { "key": "string", "label": "string", "detected": true, "summary": "string" }
  ],
  "summary": "string",
  "recommendations": ["string"]
}

Email:
${emailText}`;
}

function normalizeGeminiResult(result, fallback) {
  if (!result || typeof result !== 'object') {
    return fallback;
  }

  const indicators = Array.isArray(result.indicators)
    ? result.indicators.map((indicator) => ({
        key: String(indicator?.key || indicator?.label || 'indicator').toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        label: String(indicator?.label || indicator?.key || 'Indicator'),
        detected: Boolean(indicator?.detected ?? true),
        summary: String(indicator?.summary || ''),
      }))
    : fallback.indicators;

  const recommendations = Array.isArray(result.recommendations)
    ? result.recommendations.map((item) => String(item).trim()).filter(Boolean)
    : fallback.recommendations;

  return {
    threatLevel: String(result.threatLevel || fallback.threatLevel),
    confidence: Number.isFinite(Number(result.confidence)) ? Math.max(0, Math.min(100, Number(result.confidence))) : fallback.confidence,
    indicators,
    summary: String(result.summary || fallback.summary),
    recommendations: recommendations.length ? recommendations : fallback.recommendations,
  };
}

async function callGemini(emailText) {
  const response = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: buildPrompt(emailText) }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 512,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini request failed with status ${response.status}.`);
  }

  const payload = await response.json();
  const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part?.text || '').join('') || '';

  if (!text.trim()) {
    throw new Error('Gemini returned an empty response.');
  }

  return safeParseJson(text);
}

export async function analyzeEmail(emailText = '') {
  const fallback = analyzeEmailHeuristics(emailText);
  const trimmedEmail = String(emailText).trim();

  if (!trimmedEmail) {
    return fallback;
  }

  if (!GEMINI_API_KEY) {
    return fallback;
  }

  try {
    const result = await callGemini(trimmedEmail);
    return normalizeGeminiResult(result, fallback);
  } catch {
    return fallback;
  }
}
