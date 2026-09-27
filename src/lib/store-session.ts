import { readStorage, writeStorage } from './browser-storage';

const STORAGE_KEY = 'store_session_v2';
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

interface StoreSession {
  id: string;
  startedAt: number;
  lastActiveAt: number;
  campaign: string;
  attribution: {
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    utmContent: string | null;
    utmTerm: string | null;
    referrer: string | null;
  };
}

let memorySession: StoreSession | null = null;

export function initializeStoreSession() {
  if (typeof window === 'undefined') return null;
  const now = Date.now();
  const params = new URLSearchParams(window.location.search);
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const campaign = keys.map(key => params.get(key)?.slice(0, 200) || '').join('|');
  const hasCampaign = keys.some(key => params.has(key));
  let current = memorySession;
  if (!current) {
    try { current = JSON.parse(readStorage(STORAGE_KEY, true) || 'null'); } catch { /* new session */ }
  }
  if (!current || typeof current.id !== 'string' || !current.attribution ||
      !Number.isFinite(current.startedAt) || !Number.isFinite(current.lastActiveAt) ||
      now < current.startedAt || now - current.lastActiveAt >= SESSION_TIMEOUT_MS ||
      (hasCampaign && campaign !== current.campaign)) {
    let referrer: string | null = null;
    try {
      const source = new URL(document.referrer);
      // Never store arbitrary referrer query strings (they may contain PII).
      if (source.origin !== window.location.origin) referrer = source.origin + source.pathname;
    } catch { /* no external referrer */ }
    current = {
      id: crypto.randomUUID(), startedAt: now, lastActiveAt: now, campaign,
      attribution: {
        utmSource: params.get('utm_source')?.slice(0, 200) || null,
        utmMedium: params.get('utm_medium')?.slice(0, 200) || null,
        utmCampaign: params.get('utm_campaign')?.slice(0, 200) || null,
        utmContent: params.get('utm_content')?.slice(0, 200) || null,
        utmTerm: params.get('utm_term')?.slice(0, 200) || null,
        referrer,
      },
    };
  }
  current.lastActiveAt = now;
  memorySession = current;
  writeStorage(STORAGE_KEY, JSON.stringify(current), true);
  return current;
}
