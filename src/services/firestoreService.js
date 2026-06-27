import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
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
    createdAt: convertTimestamp(data.createdAt),
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

  return addDoc(collection(db, COLLECTIONS.scanHistory), {
    userId,
    type,
    input: isPasswordScan ? getMaskedPasswordInput(rawInput) : rawInput,
    riskScore: Number.isFinite(scan?.riskScore) ? scan.riskScore : 0,
    threatLevel: normalizeString(scan?.threatLevel) || 'Safe',
    createdAt: serverTimestamp(),
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
  const averageRisk = history.length
    ? Math.round(history.reduce((sum, item) => sum + (Number(item.riskScore) || 0), 0) / history.length)
    : 0;
  const securityScore = Math.max(0, Math.min(100, 100 - averageRisk));

  return {
    totalUrlScans,
    totalPasswordChecks,
    securityScore,
    recentActivity: history.slice(0, 5),
  };
}
