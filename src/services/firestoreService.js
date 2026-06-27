import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config.js';

export const COLLECTIONS = {
  users: 'users',
  scanHistory: 'scanHistory',
};

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function getSafeDisplayName(user) {
  return normalizeString(user?.displayName) || normalizeString(user?.email).split('@')[0] || 'User';
}

function getMaskedPasswordInput(password) {
  if (!password) {
    return '';
  }

  return `Password entered (${password.length} characters)`;
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

  return {
    id: snapshot.id,
    ...data,
    createdAt: convertTimestamp(data.createdAt || data.timestamp),
  };
}

export async function syncUserDocument(user) {
  if (!user?.uid) {
    return null;
  }

  const userRef = doc(db, COLLECTIONS.users, user.uid);
  const userSnapshot = await getDoc(userRef);

  const baseData = {
    uid: user.uid,
    displayName: getSafeDisplayName(user),
    email: normalizeString(user.email),
    photoURL: normalizeString(user.photoURL),
    lastLogin: serverTimestamp(),
  };

  if (userSnapshot.exists()) {
    await setDoc(userRef, baseData, { merge: true });
  } else {
    await setDoc(userRef, {
      ...baseData,
      createdAt: serverTimestamp(),
    });
  }

  return userRef;
}

export async function saveScanHistory(userId, scan) {
  if (!userId) {
    throw new Error('A user id is required to save scan history.');
  }

  const type = normalizeString(scan?.type);
  const rawInput = normalizeString(scan?.input);

  if (!type || !rawInput) {
    throw new Error('Scan type and input are required.');
  }

  const isPasswordScan = type === 'password';
  const now = serverTimestamp();
  const documentData = {
    userId,
    type,
    input: isPasswordScan ? getMaskedPasswordInput(rawInput) : rawInput,
    threatLevel: normalizeString(scan?.threatLevel) || 'Safe',
    createdAt: now,
    timestamp: now,
  };

  if (Number.isFinite(scan?.riskScore)) {
    documentData.riskScore = scan.riskScore;
  }

  if (Number.isFinite(scan?.confidence)) {
    documentData.confidence = scan.confidence;
  }

  if (Array.isArray(scan?.indicators)) {
    documentData.indicators = scan.indicators;
  }

  if (Array.isArray(scan?.recommendations)) {
    documentData.recommendations = scan.recommendations;
  }

  if (typeof scan?.summary === 'string' && scan.summary.trim()) {
    documentData.summary = scan.summary.trim();
  }

  return addDoc(collection(db, COLLECTIONS.scanHistory), {
    ...documentData,
  });
}

export async function getDashboardData(userId) {
  if (!userId) {
    throw new Error('A user id is required to load dashboard data.');
  }

  const historyQuery = query(
    collection(db, COLLECTIONS.scanHistory),
    where('userId', '==', userId),
  );

  const snapshot = await getDocs(historyQuery);
  const history = snapshot.docs.map(mapScanDocument).sort((left, right) => {
    const leftTime = left.createdAt?.getTime?.() || 0;
    const rightTime = right.createdAt?.getTime?.() || 0;
    return rightTime - leftTime;
  });

  const totalUrlScans = history.filter((item) => item.type === 'url').length;
  const totalPasswordChecks = history.filter((item) => item.type === 'password').length;
  const totalEmailAnalyses = history.filter((item) => item.type === 'email').length;
  const averageRisk = history.length
    ? Math.round(
        history.reduce((sum, item) => {
          if (Number.isFinite(item.riskScore)) {
            return sum + item.riskScore;
          }

          if (Number.isFinite(item.confidence)) {
            return sum + (100 - item.confidence);
          }

          return sum + 50;
        }, 0) / history.length,
      )
    : 0;
  const securityScore = Math.max(0, Math.min(100, 100 - averageRisk));

  return {
    totalUrlScans,
    totalPasswordChecks,
    totalEmailAnalyses,
    securityScore,
    recentActivity: history.slice(0, 5),
  };
}

export function subscribeToDashboardData(userId, onChange, onError) {
  if (!userId) {
    throw new Error('A user id is required to load dashboard data.');
  }

  const historyQuery = query(
    collection(db, COLLECTIONS.scanHistory),
    where('userId', '==', userId),
  );

  return onSnapshot(
    historyQuery,
    (snapshot) => {
      const history = snapshot.docs.map(mapScanDocument).sort((left, right) => {
        const leftTime = left.createdAt?.getTime?.() || 0;
        const rightTime = right.createdAt?.getTime?.() || 0;
        return rightTime - leftTime;
      });

      const totalUrlScans = history.filter((item) => item.type === 'url').length;
      const totalPasswordChecks = history.filter((item) => item.type === 'password').length;
      const totalEmailAnalyses = history.filter((item) => item.type === 'email').length;
      const averageRisk = history.length
        ? Math.round(
            history.reduce((sum, item) => {
              if (Number.isFinite(item.riskScore)) {
                return sum + item.riskScore;
              }

              if (Number.isFinite(item.confidence)) {
                return sum + (100 - item.confidence);
              }

              return sum + 50;
            }, 0) / history.length,
          )
        : 0;
      const securityScore = Math.max(0, Math.min(100, 100 - averageRisk));

      onChange({
        totalUrlScans,
        totalPasswordChecks,
        totalEmailAnalyses,
        securityScore,
        recentActivity: history.slice(0, 5),
      });
    },
    (error) => {
      if (typeof onError === 'function') {
        onError(error);
      }
    },
  );
}
