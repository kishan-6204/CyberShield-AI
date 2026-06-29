import { collection, getDocs, query, where } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import { db } from '../firebase/config.js';

const COLLECTION_NAME = 'scanHistory';
const BRAND_COLOR = '#22d3ee';
const BRAND_DARK = '#0f172a';
const BRIGHT_TEXT = '#f8fafc';

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function safeText(value, fallback = 'N/A') {
  const normalized = normalizeString(value);
  return normalized || fallback;
}

function safeNumber(value, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function createVirusTotalDefaults() {
  return {
    malicious: 0,
    suspicious: 0,
    harmless: 0,
    undetected: 0,
    reputation: 0,
    lastAnalysis: null,
    reputationLabel: 'N/A',
  };
}

function normalizeVirusTotal(value) {
  const source = value && typeof value === 'object' ? value : {};
  const normalized = {
    ...createVirusTotalDefaults(),
    ...source,
  };

  normalized.malicious = safeNumber(normalized.malicious);
  normalized.suspicious = safeNumber(normalized.suspicious);
  normalized.harmless = safeNumber(normalized.harmless);
  normalized.undetected = safeNumber(normalized.undetected);
  normalized.reputation = safeNumber(normalized.reputation);
  normalized.lastAnalysis = convertTimestamp(normalized.lastAnalysis);
  normalized.reputationLabel = safeText(normalized.reputationLabel, 'N/A');

  return normalized;
}

function normalizeAnalysisBlock(value) {
  const source = value && typeof value === 'object' ? value : {};

  return {
    threatLevel: safeText(source.threatLevel, 'N/A'),
    confidence: Number.isFinite(Number(source.confidence)) ? Number(source.confidence) : null,
    indicators: safeArray(source.indicators),
    recommendations: safeArray(source.recommendations),
    summary: safeText(source.summary, 'N/A'),
  };
}

function normalizeScanRecord(data = {}) {
  const emailAnalysis = normalizeAnalysisBlock(data.emailAnalysis);
  const passwordAnalysis = normalizeAnalysisBlock(data.passwordAnalysis);
  const virusTotal = normalizeVirusTotal(data.virusTotal);

  return {
    ...data,
    emailAnalysis,
    passwordAnalysis,
    virusTotal,
    hasVirusTotal: Boolean(data.virusTotal),
    hasEmailAnalysis: Boolean(data.emailAnalysis),
    hasPasswordAnalysis: Boolean(data.passwordAnalysis),
    threatLevel: safeText(data.threatLevel, 'N/A'),
    confidence: Number.isFinite(Number(data.confidence)) ? Number(data.confidence) : null,
    indicators: safeArray(data.indicators),
    recommendations: safeArray(data.recommendations),
    summary: safeText(data.summary, 'N/A'),
  };
}

function convertTimestamp(value) {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === 'function') {
    return value.toDate();
  }

  return value instanceof Date ? value : null;
}

function mapScanDocument(snapshot) {
  const data = snapshot.data();
  const normalizedData = normalizeScanRecord(data);

  return {
    id: snapshot.id,
    ...normalizedData,
    createdAt: convertTimestamp(data.createdAt || data.timestamp),
  };
}

function getDisplayName(user) {
  return normalizeString(user?.displayName) || normalizeString(user?.email).split('@')[0] || 'User';
}

function getSecurityLabel(score) {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Moderate';
  return 'At Risk';
}

function getThreatTone(riskScore = 0) {
  if (riskScore >= 76) return 'High';
  if (riskScore >= 51) return 'Medium';
  if (riskScore >= 26) return 'Low';
  return 'Safe';
}

function getWeightedAverage(values = [], fallback = 0) {
  const validValues = values.filter((value) => Number.isFinite(value));

  if (!validValues.length) {
    return fallback;
  }

  return Math.round(validValues.reduce((sum, value) => sum + value, 0) / validValues.length);
}

function dedupe(strings = []) {
  return Array.from(new Set(strings.map((item) => String(item).trim()).filter(Boolean)));
}

function summarizeScanHistory(history) {
  const normalizedHistory = history.map(normalizeScanRecord);
  const urlScans = normalizedHistory.filter((item) => item.type === 'url');
  const passwordChecks = normalizedHistory.filter((item) => item.type === 'password');
  const emailAnalyses = normalizedHistory.filter((item) => item.type === 'email');

  const urlRiskScores = urlScans.map((item) => safeNumber(item.riskScore, NaN)).filter(Number.isFinite);
  const passwordRiskScores = passwordChecks.map((item) => safeNumber(item.riskScore, NaN)).filter(Number.isFinite);
  const emailConfidenceScores = emailAnalyses
    .map((item) => {
      if (Number.isFinite(item.confidence)) {
        return item.confidence;
      }

      return Number.isFinite(Number(item.emailAnalysis?.confidence)) ? Number(item.emailAnalysis.confidence) : NaN;
    })
    .filter(Number.isFinite);

  const securityScore = Math.max(
    0,
    Math.min(
      100,
      100 - getWeightedAverage(
        history.map((item) => {
          if (Number.isFinite(Number(item.riskScore))) {
            return Number(item.riskScore);
          }

          if (Number.isFinite(Number(item.confidence))) {
            return 100 - Number(item.confidence);
          }

          return 50;
        }),
      ),
    ),
  );

  const urlThreatCounts = urlScans.reduce(
    (accumulator, item) => {
      const threatLabel = getThreatTone(Number(item.riskScore));
      accumulator[threatLabel] += 1;
      return accumulator;
    },
    { Safe: 0, Low: 0, Medium: 0, High: 0 },
  );

  const passwordThreatCounts = passwordChecks.reduce(
    (accumulator, item) => {
      const threatLabel = getThreatTone(Number(item.riskScore));
      accumulator[threatLabel] += 1;
      return accumulator;
    },
    { Safe: 0, Low: 0, Medium: 0, High: 0 },
  );

  const emailThreatCounts = emailAnalyses.reduce(
    (accumulator, item) => {
      const threatLabel = item.threatLevel !== 'N/A' ? String(item.threatLevel) : safeText(item.emailAnalysis?.threatLevel, 'N/A');
      if (threatLabel === 'Safe') {
        accumulator.Safe += 1;
      } else if (threatLabel === 'Low Risk') {
        accumulator.Low += 1;
      } else if (threatLabel === 'Medium Risk') {
        accumulator.Medium += 1;
      } else {
        accumulator.High += 1;
      }
      return accumulator;
    },
    { Safe: 0, Low: 0, Medium: 0, High: 0 },
  );

  const virusTotalChecks = urlScans.filter((item) => item.hasVirusTotal).length;
  const virusTotalStats = urlScans.reduce(
    (accumulator, item) => {
      const vt = normalizeVirusTotal(item.virusTotal);

      if (!item.hasVirusTotal) {
        return accumulator;
      }

      accumulator.malicious += vt.malicious;
      accumulator.suspicious += vt.suspicious;
      accumulator.harmless += vt.harmless;
      accumulator.undetected += vt.undetected;

      if (Number.isFinite(vt.reputation)) {
        accumulator.reputationValues.push(vt.reputation);
      }

      if (vt.lastAnalysis) {
        const lastAnalysisDate = convertTimestamp(vt.lastAnalysis);
        if (lastAnalysisDate && (!accumulator.lastAnalysis || lastAnalysisDate > accumulator.lastAnalysis)) {
          accumulator.lastAnalysis = lastAnalysisDate;
        }
      }

      return accumulator;
    },
    {
      malicious: 0,
      suspicious: 0,
      harmless: 0,
      undetected: 0,
      reputationValues: [],
      lastAnalysis: null,
    },
  );

  const recommendations = dedupe([
    ...normalizedHistory.flatMap((item) => safeArray(item.recommendations)),
    ...normalizedHistory.flatMap((item) => safeArray(item.emailAnalysis?.recommendations)),
    ...normalizedHistory.flatMap((item) => safeArray(item.passwordAnalysis?.recommendations)),
    ...(urlScans.some((item) => safeNumber(item.riskScore, -1) >= 76) ? ['Block or verify risky links before opening them.'] : []),
    ...(passwordChecks.some((item) => safeNumber(item.riskScore, -1) >= 60) ? ['Strengthen weak passwords and avoid reuse across accounts.'] : []),
    ...(emailAnalyses.some((item) => ['High', 'Critical'].includes(String(item.threatLevel || item.emailAnalysis?.threatLevel || '').split(' ')[0])) ? ['Treat suspicious messages as phishing until verified.'] : []),
    ...(virusTotalChecks ? ['Use VirusTotal reputation alongside the heuristic scanner before trusting a URL.'] : []),
  ]);

  const recentFindings = history.slice(0, 6);
  const chartData = {
    pie: [
      { label: 'URL Scans', value: urlScans.length, color: '#22d3ee' },
      { label: 'Password Checks', value: passwordChecks.length, color: '#34d399' },
      { label: 'Email Analyses', value: emailAnalyses.length, color: '#fbbf24' },
    ],
    bar: [
      { label: 'Safe', value: urlThreatCounts.Safe + passwordThreatCounts.Safe + emailThreatCounts.Safe, color: '#10b981' },
      { label: 'Low', value: urlThreatCounts.Low + passwordThreatCounts.Low + emailThreatCounts.Low, color: '#22d3ee' },
      { label: 'Medium', value: urlThreatCounts.Medium + passwordThreatCounts.Medium + emailThreatCounts.Medium, color: '#f59e0b' },
      { label: 'High', value: urlThreatCounts.High + passwordThreatCounts.High + emailThreatCounts.High, color: '#ef4444' },
    ],
  };

  return {
    generatedAt: new Date(),
    user: null,
    totals: {
      totalScans: history.length,
      urlScans: urlScans.length,
      passwordChecks: passwordChecks.length,
      emailAnalyses: emailAnalyses.length,
      virusTotalChecks,
    },
    summary: {
      securityScore,
      securityLabel: getSecurityLabel(securityScore),
      averageUrlRisk: getWeightedAverage(urlRiskScores),
      averagePasswordRisk: getWeightedAverage(passwordRiskScores),
      averageEmailConfidence: getWeightedAverage(emailConfidenceScores),
      communityReputationAverage: getWeightedAverage(virusTotalStats.reputationValues),
      urlThreatCounts,
      passwordThreatCounts,
      emailThreatCounts,
      virusTotalStats: {
        malicious: virusTotalStats.malicious,
        suspicious: virusTotalStats.suspicious,
        harmless: virusTotalStats.harmless,
        undetected: virusTotalStats.undetected,
        lastAnalysis: virusTotalStats.lastAnalysis,
        reputationAverage: getWeightedAverage(virusTotalStats.reputationValues),
      },
    },
    charts: chartData,
    recommendations,
    recentFindings,
    sections: {
      urlSummary: {
        total: urlScans.length,
        averageRisk: getWeightedAverage(urlRiskScores),
        threatCounts: urlThreatCounts,
      },
      passwordSummary: {
        total: passwordChecks.length,
        averageRisk: getWeightedAverage(passwordRiskScores),
        threatCounts: passwordThreatCounts,
      },
      emailSummary: {
        total: emailAnalyses.length,
        averageConfidence: getWeightedAverage(emailConfidenceScores),
        threatCounts: emailThreatCounts,
      },
      virusTotalSummary: {
        totalChecks: virusTotalChecks,
        ...virusTotalStats,
      },
    },
  };
}

export async function loadSecurityReport(user) {
  if (!user?.uid) {
    throw new Error('A signed-in user is required to build a report.');
  }

  const historyQuery = query(collection(db, COLLECTION_NAME), where('userId', '==', user.uid));
  const snapshot = await getDocs(historyQuery);
  const history = snapshot.docs.map(mapScanDocument).sort((left, right) => {
    const leftTime = left.createdAt?.getTime?.() || 0;
    const rightTime = right.createdAt?.getTime?.() || 0;
    return rightTime - leftTime;
  });

  const report = summarizeScanHistory(history);
  report.user = {
    uid: user.uid,
    displayName: getDisplayName(user),
    email: normalizeString(user.email),
    photoURL: normalizeString(user.photoURL),
  };

  return report;
}

export function buildSecurityReportDataset(report) {
  return {
    generatedAt: report.generatedAt,
    user: report.user,
    totals: report.totals,
    summary: report.summary,
    charts: report.charts,
    recommendations: report.recommendations,
    recentFindings: report.recentFindings,
    sections: report.sections,
  };
}

function addHeader(doc, dataset) {
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 595, 92, 'F');
  doc.setTextColor(248, 250, 252);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('CyberShield AI', 48, 42);
  doc.setFontSize(17);
  doc.text('Security Report', 48, 64);

  doc.setFillColor(34, 211, 238);
  doc.roundedRect(484, 24, 64, 42, 10, 10, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(24);
  doc.text('⛨', 504, 52);

  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Generated ${formatDateTime(dataset.generatedAt)}`, 48, 82);
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

function addSectionTitle(doc, title, subtitle, y) {
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(title, 48, y);
  if (subtitle) {
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(subtitle, 48, y + 12);
  }
}

function drawMetricChip(doc, label, value, x, y, width = 150) {
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x, y, width, 44, 8, 8, 'FD');
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(label.toUpperCase(), x + 10, y + 15);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(String(value), x + 10, y + 33);
}

function renderPieChartCanvas(data) {
  if (typeof document === 'undefined') {
    return null;
  }

  const size = 520;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');

  if (!context) {
    return null;
  }

  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  const center = size / 2;
  const radius = 160;
  let startAngle = -Math.PI / 2;

  context.clearRect(0, 0, size, size);
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, size, size);

  data.forEach((item) => {
    const slice = (item.value / total) * Math.PI * 2;
    context.beginPath();
    context.moveTo(center, center);
    context.fillStyle = item.color;
    context.arc(center, center, radius, startAngle, startAngle + slice);
    context.closePath();
    context.fill();
    startAngle += slice;
  });

  context.beginPath();
  context.fillStyle = '#f8fafc';
  context.arc(center, center, 92, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = '#0f172a';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = 'bold 30px Arial';
  context.fillText(String(total), center, center - 4);
  context.font = '14px Arial';
  context.fillText('Total scans', center, center + 24);

  return canvas.toDataURL('image/png');
}

function renderBarChartCanvas(data) {
  if (typeof document === 'undefined') {
    return null;
  }

  const width = 700;
  const height = 420;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  if (!context) {
    return null;
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);

  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const chartTop = 50;
  const chartBottom = 310;
  const chartHeight = chartBottom - chartTop;
  const barWidth = 110;
  const gap = 52;
  const startX = 72;

  context.strokeStyle = '#e2e8f0';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(50, chartBottom);
  context.lineTo(width - 30, chartBottom);
  context.stroke();

  context.fillStyle = '#0f172a';
  context.font = 'bold 22px Arial';
  context.fillText('Threat levels', 48, 28);
  context.font = '14px Arial';
  context.fillStyle = '#64748b';
  context.fillText('Aggregate risk posture across the authenticated user history', 48, 46);

  data.forEach((item, index) => {
    const barHeight = Math.max((item.value / maxValue) * chartHeight, item.value > 0 ? 18 : 4);
    const x = startX + index * (barWidth + gap);
    const y = chartBottom - barHeight;

    context.fillStyle = item.color;
    context.fillRect(x, y, barWidth, barHeight);

    context.fillStyle = '#0f172a';
    context.font = 'bold 18px Arial';
    context.textAlign = 'center';
    context.fillText(String(item.value), x + barWidth / 2, y - 10);

    context.font = '13px Arial';
    context.fillText(item.label, x + barWidth / 2, chartBottom + 22);
  });

  return canvas.toDataURL('image/png');
}

function addCharts(doc, dataset, y) {
  const pieImage = renderPieChartCanvas(dataset.charts.pie);
  const barImage = renderBarChartCanvas(dataset.charts.bar);

  if (pieImage) {
    doc.addImage(pieImage, 'PNG', 48, y + 10, 190, 190);
  }

  if (barImage) {
    doc.addImage(barImage, 'PNG', 260, y + 12, 288, 170);
  }
}

function addBulletList(doc, items, x, y, maxWidth) {
  let currentY = y;

  safeArray(items).forEach((item) => {
    const lines = doc.splitTextToSize(`• ${safeText(item)}`, maxWidth);
    doc.text(lines, x, currentY);
    currentY += lines.length * 12 + 6;
  });

  return currentY;
}

function addRecommendations(doc, dataset, y) {
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(48, y, 499, 120, 12, 12, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(48, y, 499, 120, 12, 12, 'S');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('AI Recommendations', 62, y + 22);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const recommendations = safeArray(dataset?.recommendations);

  if (!recommendations.length) {
    doc.setTextColor(100, 116, 139);
    doc.text('No recommendations available.', 62, y + 42);
    return;
  }

  addBulletList(doc, recommendations.slice(0, 5), 62, y + 40, 460);
}

function addThreatStatistics(doc, dataset, y) {
  drawMetricChip(doc, 'URL scans', dataset.totals.urlScans, 48, y, 108);
  drawMetricChip(doc, 'Passwords', dataset.totals.passwordChecks, 166, y, 108);
  drawMetricChip(doc, 'Emails', dataset.totals.emailAnalyses, 284, y, 108);
  drawMetricChip(doc, 'VirusTotal', dataset.totals.virusTotalChecks, 402, y, 145);

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(48, y + 56, 499, 118, 12, 12, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(48, y + 56, 499, 118, 12, 12, 'S');

  const lines = [
    `Security score: ${safeText(dataset?.summary?.securityScore)} / 100 (${safeText(dataset?.summary?.securityLabel)})`,
    `URL summary: ${safeNumber(dataset?.summary?.urlThreatCounts?.Safe)} safe, ${safeNumber(dataset?.summary?.urlThreatCounts?.Low)} low, ${safeNumber(dataset?.summary?.urlThreatCounts?.Medium)} medium, ${safeNumber(dataset?.summary?.urlThreatCounts?.High)} high.`,
    `Password summary: ${safeNumber(dataset?.summary?.passwordThreatCounts?.Safe)} safe, ${safeNumber(dataset?.summary?.passwordThreatCounts?.Low)} low, ${safeNumber(dataset?.summary?.passwordThreatCounts?.Medium)} medium, ${safeNumber(dataset?.summary?.passwordThreatCounts?.High)} high.`,
    `Email summary: ${safeNumber(dataset?.summary?.emailThreatCounts?.Safe)} safe, ${safeNumber(dataset?.summary?.emailThreatCounts?.Low)} low, ${safeNumber(dataset?.summary?.emailThreatCounts?.Medium)} medium, ${safeNumber(dataset?.summary?.emailThreatCounts?.High)} high.`,
    `VirusTotal: ${safeNumber(dataset?.summary?.virusTotalSummary?.malicious)} malicious, ${safeNumber(dataset?.summary?.virusTotalSummary?.suspicious)} suspicious, ${safeNumber(dataset?.summary?.virusTotalSummary?.harmless)} harmless, ${safeNumber(dataset?.summary?.virusTotalSummary?.undetected)} undetected.`,
  ];

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  let currentY = y + 76;
  lines.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, 450);
    doc.text(wrapped, 62, currentY);
    currentY += wrapped.length * 12 + 4;
  });
}

export async function generateSecurityReportPdf(report) {
  if (!report?.user) {
    throw new Error('Report data is required to generate a PDF.');
  }

  const dataset = buildSecurityReportDataset(report);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

  addHeader(doc, dataset);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('User Information', 48, 122);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text(`Name: ${safeText(dataset?.user?.displayName)}`, 48, 140);
  doc.text(`Email: ${safeText(dataset?.user?.email)}`, 48, 156);
  doc.text(`User ID: ${safeText(dataset?.user?.uid)}`, 48, 172);
  doc.text(`Generated Date: ${formatDateTime(dataset.generatedAt)}`, 48, 188);

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(48, 206, 499, 76, 12, 12, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(48, 206, 499, 76, 12, 12, 'S');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Current Security Posture', 62, 228);
  doc.setFontSize(26);
  doc.text(`${safeText(dataset?.summary?.securityScore, 'N/A')}/100`, 62, 260);
  doc.setFontSize(11);
  doc.setTextColor(34, 211, 238);
  doc.text(safeText(dataset?.summary?.securityLabel), 150, 260);

  addThreatStatistics(doc, dataset, 298);

  addSectionTitle(doc, 'Charts', 'Visual overview of the authenticated user activity.', 484);
  addCharts(doc, dataset, 492);

  doc.addPage();
  addHeader(doc, dataset);
  addSectionTitle(doc, 'Detailed Summaries', 'Scan history breakdown across URL, password, email, and threat intelligence checks.', 122);

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(48, 138, 499, 114, 12, 12, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(48, 138, 499, 114, 12, 12, 'S');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('URL Scan Summary', 62, 160);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Total URL scans: ${safeNumber(dataset?.sections?.urlSummary?.total)}`, 62, 178);
  doc.text(`Average URL risk: ${safeText(dataset?.sections?.urlSummary?.averageRisk, 'N/A')}/100`, 62, 194);
  doc.text(
    `Threat profile: ${safeNumber(dataset?.sections?.urlSummary?.threatCounts?.Safe)} safe, ${safeNumber(dataset?.sections?.urlSummary?.threatCounts?.Low)} low, ${safeNumber(dataset?.sections?.urlSummary?.threatCounts?.Medium)} medium, ${safeNumber(dataset?.sections?.urlSummary?.threatCounts?.High)} high.`,
    62,
    210,
    { maxWidth: 460 },
  );

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(48, 270, 499, 114, 12, 12, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(48, 270, 499, 114, 12, 12, 'S');
  doc.setFont('helvetica', 'bold');
  doc.text('Password Analysis Summary', 62, 292);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total password checks: ${safeNumber(dataset?.sections?.passwordSummary?.total)}`, 62, 310);
  doc.text(`Average password risk: ${safeText(dataset?.sections?.passwordSummary?.averageRisk, 'N/A')}/100`, 62, 326);
  doc.text(
    `Threat profile: ${safeNumber(dataset?.sections?.passwordSummary?.threatCounts?.Safe)} safe, ${safeNumber(dataset?.sections?.passwordSummary?.threatCounts?.Low)} low, ${safeNumber(dataset?.sections?.passwordSummary?.threatCounts?.Medium)} medium, ${safeNumber(dataset?.sections?.passwordSummary?.threatCounts?.High)} high.`,
    62,
    342,
    { maxWidth: 460 },
  );

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(48, 402, 499, 114, 12, 12, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(48, 402, 499, 114, 12, 12, 'S');
  doc.setFont('helvetica', 'bold');
  doc.text('Email Analysis Summary', 62, 424);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total email analyses: ${safeNumber(dataset?.sections?.emailSummary?.total)}`, 62, 442);
  doc.text(`Average confidence: ${safeText(dataset?.sections?.emailSummary?.averageConfidence, 'N/A')}%`, 62, 458);
  doc.text(
    `Threat profile: ${safeNumber(dataset?.sections?.emailSummary?.threatCounts?.Safe)} safe, ${safeNumber(dataset?.sections?.emailSummary?.threatCounts?.Low)} low, ${safeNumber(dataset?.sections?.emailSummary?.threatCounts?.Medium)} medium, ${safeNumber(dataset?.sections?.emailSummary?.threatCounts?.High)} high.`,
    62,
    474,
    { maxWidth: 460 },
  );

  doc.addPage();
  addHeader(doc, dataset);
  addSectionTitle(doc, 'VirusTotal Results', 'Community reputation and threat intelligence from scanned URLs.', 122);

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(48, 138, 499, 110, 12, 12, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(48, 138, 499, 110, 12, 12, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Threat Intelligence Checks', 62, 160);
  doc.setFont('helvetica', 'normal');
  doc.text(`VirusTotal checks: ${safeNumber(dataset?.sections?.virusTotalSummary?.totalChecks)}`, 62, 178);
  doc.text(`Community reputation average: ${safeText(dataset?.summary?.communityReputationAverage, 'N/A')}`, 62, 194);
  doc.text(
    `Last analysis date: ${dataset?.sections?.virusTotalSummary?.lastAnalysis ? formatDateTime(dataset.sections.virusTotalSummary.lastAnalysis) : 'No VirusTotal data available'}`,
    62,
    210,
    { maxWidth: 460 },
  );

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(48, 266, 499, 122, 12, 12, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(48, 266, 499, 122, 12, 12, 'S');
  doc.setFont('helvetica', 'bold');
  doc.text('Threat Statistics', 62, 288);
  doc.setFont('helvetica', 'normal');
  doc.text(`Malicious: ${safeNumber(dataset?.sections?.virusTotalSummary?.malicious)}`, 62, 306);
  doc.text(`Suspicious: ${safeNumber(dataset?.sections?.virusTotalSummary?.suspicious)}`, 62, 322);
  doc.text(`Harmless: ${safeNumber(dataset?.sections?.virusTotalSummary?.harmless)}`, 62, 338);
  doc.text(`Undetected: ${safeNumber(dataset?.sections?.virusTotalSummary?.undetected)}`, 62, 354);

  addRecommendations(doc, dataset, 408);

  doc.addPage();
  addHeader(doc, dataset);
  addSectionTitle(doc, 'Recent Findings', 'Latest entries from the authenticated user history.', 122);

  let currentY = 146;
  safeArray(dataset?.recentFindings).forEach((item) => {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(48, currentY, 499, 48, 10, 10, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(48, currentY, 499, 48, 10, 10, 'S');
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(safeText(item?.input), 60, currentY + 18, { maxWidth: 300 });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`${safeText(item?.type, 'analysis').toUpperCase()} • ${safeText(item?.threatLevel)}`, 60, currentY + 34);
    doc.text(formatDateTime(item.createdAt || dataset.generatedAt), 392, currentY + 18);
    currentY += 58;
  });

  if (!safeArray(dataset?.recentFindings).length) {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(48, currentY, 499, 48, 10, 10, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(48, currentY, 499, 48, 10, 10, 'S');
    doc.setTextColor(100, 116, 139);
    doc.text('No scan history available yet. Run a scan to populate this report.', 60, currentY + 29);
  }

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 800, 595, 42, 'F');
  doc.setTextColor(248, 250, 252);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('CyberShield AI • Security report generated from authenticated Firestore history', 48, 826);

  doc.save(`CyberShield-AI-Security-Report-${safeText(dataset?.user?.displayName, 'User').replace(/\s+/g, '-')}.pdf`);
}