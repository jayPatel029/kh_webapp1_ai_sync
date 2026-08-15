/**
 * Vitals Thresholds — Admin-configurable clinical boundaries
 * Resolved per Part2 Change Requirements #6 (Round 2) — literature-backed values approved as final.
 * Shipped defaults are not hardcoded constants; they are editable via admin Thresholds panel.
 * Storage: localStorage key 'vitalsThresholds' (facility-level setting) with fallback to defaults.
 * @file src/config/vitalsThresholds.js
 */

export const DEFAULT_VITALS_THRESHOLDS = {
  systolic: { warningLow: [90, 100], warningHigh: [160, 180], criticalLow: 90, criticalHigh: 180 },
  diastolic: { warningLow: [50, 55], warningHigh: [100, 110], criticalLow: 50, criticalHigh: 110 },
  pulse: { warningLow: [50, 59], warningHigh: [101, 110], criticalLow: 50, criticalHigh: 110 },
  temperature: { warningLow: [36.3, 36.5], warningHigh: [37.5, 38.0], criticalLow: 36.3, criticalHigh: 38.0 },
  spo2: { warning: [90, 94], criticalLow: 90 },
  respiration: { warningLow: [12, 13], warningHigh: [18, 20], criticalLow: 12, criticalHigh: 20 },
};

export const DEFAULT_UF_THRESHOLDS = {
  warning: 10, // mL/kg/hr
  critical: 13, // mL/kg/hr — CMS quality measure cap
};

const VITALS_KEY = 'vitalsThresholds';
const UF_KEY = 'ufThresholds';

export function getVitalsThresholds() {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(VITALS_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      // shallow merge with defaults to tolerate partial saves
      return { ...DEFAULT_VITALS_THRESHOLDS, ...parsed, systolic: { ...DEFAULT_VITALS_THRESHOLDS.systolic, ...(parsed.systolic||{}) }, diastolic: { ...DEFAULT_VITALS_THRESHOLDS.diastolic, ...(parsed.diastolic||{}) }, pulse: { ...DEFAULT_VITALS_THRESHOLDS.pulse, ...(parsed.pulse||{}) }, temperature: { ...DEFAULT_VITALS_THRESHOLDS.temperature, ...(parsed.temperature||{}) }, spo2: { ...DEFAULT_VITALS_THRESHOLDS.spo2, ...(parsed.spo2||{}) }, respiration: { ...DEFAULT_VITALS_THRESHOLDS.respiration, ...(parsed.respiration||{}) } };
    }
  } catch (_) {}
  return DEFAULT_VITALS_THRESHOLDS;
}

export function setVitalsThresholds(next) {
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(VITALS_KEY, JSON.stringify(next));
  } catch (_) {}
  return next;
}

export function getUfThresholds() {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(UF_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_UF_THRESHOLDS, ...parsed };
    }
  } catch (_) {}
  return DEFAULT_UF_THRESHOLDS;
}

export function setUfThresholds(next) {
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(UF_KEY, JSON.stringify(next));
  } catch (_) {}
  return next;
}
