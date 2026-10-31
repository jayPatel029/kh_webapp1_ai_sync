import { isRole } from '../../helpers/roleUtils';

const ADMIN_TARGETS = ['Admin', 'PSAdmin', 'Super Admin', 'SuperAdmin', 'super admin'];
const PART2_TARGETS = [
  'Dialysis Technician',
  'Technician',
  'DT',
  'Nurse',
  'Nephrologist',
  'Doctor',
  'Clinician',
];

export const MISSING = '—';

export function isAdminDtRole(role) {
  return isRole(role, ADMIN_TARGETS);
}

export function canRunPart2(role) {
  if (isAdminDtRole(role)) return false;
  return isRole(role, PART2_TARGETS);
}

export function resolveP2SessionId(propSessionId, location) {
  if (propSessionId !== undefined && propSessionId !== null && String(propSessionId).trim() !== '') {
    return String(propSessionId);
  }
  try {
    const fromState =
      location?.state?.sessionId ||
      location?.state?.session_id ||
      location?.state?.dialysis_session_id;
    if (fromState) return String(fromState);
    const persisted =
      localStorage.getItem('lastDialysisSessionId') ||
      sessionStorage.getItem('lastDialysisSessionId');
    if (persisted) return String(persisted);
  } catch (_) {}
  return '';
}

export function liveValue(value, suffix = '') {
  if (value === null || value === undefined || String(value).trim() === '') return MISSING;
  return suffix ? `${value}${suffix}` : String(value);
}

export function formatIst(value) {
  if (value === null || value === undefined || value === '') return MISSING;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function unwrapList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.sessions)) return payload.sessions;
  if (Array.isArray(payload?.alerts)) return payload.alerts;
  if (Array.isArray(payload?.notes)) return payload.notes;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

export function unwrapRecord(payload, nestedKeys = []) {
  if (!payload || typeof payload !== 'object') return null;
  for (const key of nestedKeys) {
    if (payload[key] && typeof payload[key] === 'object' && !Array.isArray(payload[key])) {
      return payload[key];
    }
  }
  if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    for (const key of nestedKeys) {
      if (payload.data[key] && typeof payload.data[key] === 'object' && !Array.isArray(payload.data[key])) {
        return payload.data[key];
      }
    }
    return payload.data;
  }
  return payload;
}

export const ROLLUP_TO_DASHBOARD = {
  step_verification: 'verification',
  step_vitals: 'vitals',
  step_assessment: 'assessment',
  step_vascular: 'access',
  step_machine: 'machine',
  step_water: 'water',
  step_infection: 'infection',
  step_safety: 'validation',
  step_start: 'start',
};

export const ROLLUP_LABELS = {
  step_verification: 'Patient Verification',
  step_vitals: 'Vitals & Measurements',
  step_assessment: 'Patient Assessment',
  step_vascular: 'Vascular Access Assessment',
  step_machine: 'Machine Safety',
  step_water: 'Water Safety',
  step_infection: 'Infection Control',
  step_safety: 'Safety Validation',
  step_start: 'Start Dialysis Confirmation',
};

export function normalizeStepStatus(raw) {
  const value = String(raw || '').toLowerCase();
  if (value === 'complete' || value === 'completed' || value === 'passed') return 'Completed';
  if (value === 'in_progress' || value === 'in-progress') return 'In Progress';
  if (value === 'failed' || value === 'fail') return 'Failed';
  return 'Not started';
}

export function mapRollupSteps(payload) {
  const steps = Array.isArray(payload?.steps) ? payload.steps : [];
  return steps.map((step, index) => {
    const key = step.key || step.step_key || `step_${index + 1}`;
    return {
      id: step.step || index + 1,
      key,
      dashboardKey: ROLLUP_TO_DASHBOARD[key] || key.replace(/^step_/, ''),
      name: ROLLUP_LABELS[key] || step.name || key,
      status: normalizeStepStatus(step.status),
      rawStatus: step.status || null,
    };
  });
}
