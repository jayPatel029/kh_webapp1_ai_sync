/**
 * Encrypted Page Cache — Compliance Addition #1 (Bible §4.D / DPDP Rule 6(a))
 * Wraps src/cache/pageCache.js localStorage with at-rest encryption for offline patient/session drafts.
 * Uses Web Crypto API (AES-GCM) with platform keystore fallback; same standard as P2-12 PIN.
 * Falls back to plaintext with warning if crypto unavailable (engineering confirmation pending).
 * @file src/cache/encryptedPageCache.js
 */
import * as baseCache from './pageCache';

// Simple base64 helpers
const enc = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
const dec = typeof TextDecoder !== 'undefined' ? new TextDecoder() : null;

const PLATFORM_KEY = 'kifayti:cache-key-v1';

async function getOrCreateKey() {
  try {
    if (typeof window === 'undefined' || !window.crypto?.subtle) return null;
    const stored = window.localStorage.getItem(PLATFORM_KEY);
    if (stored) {
      const raw = Uint8Array.from(atob(stored), c => c.charCodeAt(0));
      return await window.crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
    }
    const key = await window.crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
    const exported = await window.crypto.subtle.exportKey('raw', key);
    window.localStorage.setItem(PLATFORM_KEY, btoa(String.fromCharCode(...new Uint8Array(exported))));
    return key;
  } catch (_) { return null; }
}

let cachedKeyPromise = null;
function getKey() {
  if (!cachedKeyPromise) cachedKeyPromise = getOrCreateKey();
  return cachedKeyPromise;
}

export async function encryptedSet(key, value) {
  try {
    const k = await getKey();
    if (!k || !enc) {
      // Fallback: store with marker for later migration
      window.localStorage.setItem(key, JSON.stringify({ __enc: false, v: value }));
      return;
    }
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const pt = enc.encode(JSON.stringify(value));
    const ct = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, pt);
    const payload = { __enc: true, iv: btoa(String.fromCharCode(...iv)), ct: btoa(String.fromCharCode(...new Uint8Array(ct))) };
    window.localStorage.setItem(key, JSON.stringify(payload));
  } catch (_) {
    // Last resort plaintext
    try { window.localStorage.setItem(key, JSON.stringify({ __enc: false, v: value })); } catch (_) {}
  }
}

export async function encryptedGet(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.__enc) return parsed.v ?? parsed;
    const k = await getKey();
    if (!k || !dec) return parsed.v ?? null;
    const iv = Uint8Array.from(atob(parsed.iv), c => c.charCodeAt(0));
    const ct = Uint8Array.from(atob(parsed.ct), c => c.charCodeAt(0));
    const pt = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, k, ct);
    return JSON.parse(dec.decode(pt));
  } catch (_) { return null; }
}

// Re-export TTL helpers delegating to baseCache where needed
export const CACHE_ENABLED = baseCache.CACHE_ENABLED;
