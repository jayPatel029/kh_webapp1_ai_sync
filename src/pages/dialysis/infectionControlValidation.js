// Validation logic for P2-10 Infection Control

export const INFECTION_CRITICAL_KEYS = [
  'hand_hygiene',
  'aseptic_technique',
  'sharps_handling',
];

export const INFECTION_NON_CRITICAL_KEYS = [
  'ppe',
  'work_area_clean',
  'dialysis_machine_disinfected',
  'ro_system_disinfection',
  'dialyzer_reuse',
  'biomedical_waste',
  'isolation_precautions',
];

export const INFECTION_ITEM_KEYS = [
  ...INFECTION_CRITICAL_KEYS,
  ...INFECTION_NON_CRITICAL_KEYS,
];

export const OPTIONAL_INFECTION_FIELDS = [
  { key: 'ppe', field_name: 'ppe', label: 'PPE' },
  { key: 'work_area_clean', field_name: 'work_area_clean', label: 'Work Area Clean & Disinfected' },
  { key: 'dialysis_machine_disinfected', field_name: 'dialysis_machine_disinfected', label: 'Dialysis Machine Disinfected' },
  { key: 'ro_system_disinfection', field_name: 'ro_system_disinfection', label: 'RO System Disinfection' },
  { key: 'dialyzer_reuse', field_name: 'dialyzer_reuse', label: 'Dialyzer Reuse' },
  { key: 'biomedical_waste', field_name: 'biomedical_waste', label: 'Bio-medical Waste Disposal' },
  { key: 'isolation_precautions', field_name: 'isolation_precautions', label: 'Isolation Precautions' },
];

export const TRI_ITEM_KEYS = [
  'ro_system_disinfection',
  'dialyzer_reuse',
  'isolation_precautions',
];

export const isTruthyInfectionValue = (value) => {
  if (value === true || value === 1) return true;
  const raw = String(value || '').toLowerCase();
  return ['yes', 'completed', 'used', 'followed', 'safe', 'compliant'].includes(raw);
};

export const isNaInfectionValue = (value) => {
  const raw = String(value || '').toLowerCase();
  return raw === 'not_applicable' || raw === 'n/a';
};

export const isInfectionItemResolved = (value) => {
  if (value === true || value === false || value === 0 || value === 1) return true;
  if (value === null || value === undefined || value === '') return false;
  return isTruthyInfectionValue(value) || isNaInfectionValue(value);
};

export const isInfectionItemCompliant = (value) =>
  isTruthyInfectionValue(value) || isNaInfectionValue(value);

export const isScrubHubPassed = (value) => {
  if (value === true || value === 1) return true;
  const raw = String(value || '').toLowerCase();
  return ['yes', 'followed', 'completed', 'performed'].includes(raw);
};

export const normalizeAccessType = (value) => {
  const raw = String(value || '').toUpperCase();
  if (raw === 'AVF' || raw === 'AVG' || raw === 'CVC') return raw;
  if (raw.includes('CATHETER') || raw.includes('CVC')) return 'CVC';
  if (raw.includes('GRAFT') || raw.includes('AVG')) return 'AVG';
  if (raw.includes('FISTULA') || raw.includes('AVF')) return 'AVF';
  return '';
};

export const getCriticalInfectionIssues = (items = {}, accessType = '', scrubHub = null) => {
  const issues = [];
  if (!items.hand_hygiene || !isTruthyInfectionValue(items.hand_hygiene)) {
    issues.push('Hand hygiene is required');
  }
  if (!items.aseptic_technique || !isTruthyInfectionValue(items.aseptic_technique)) {
    issues.push('Aseptic technique is required');
  }
  if (!items.sharps_handling || !isTruthyInfectionValue(items.sharps_handling)) {
    issues.push('Sharps handling is required');
  }
  if (normalizeAccessType(accessType) === 'CVC' && !isScrubHubPassed(scrubHub)) {
    issues.push('Scrub-the-hub must be performed for CVC');
  }
  return issues;
};

export const canProceedInfectionControl = (items = {}, accessType = '', scrubHub = null) => {
  if (!normalizeAccessType(accessType)) return false;
  // Critical items hard-gate; non-critical blanks use the skip workflow at Save & Continue.
  return getCriticalInfectionIssues(items, accessType, scrubHub).length === 0;
};

export const listSkippedInfectionFields = (items = {}) =>
  OPTIONAL_INFECTION_FIELDS
    .filter((field) => !isInfectionItemResolved(items[field.key]))
    .map((field) => field.label);

export const computeInfectionCompliancePct = (items = {}, accessType = '', scrubHub = null) => {
  const keys = [...INFECTION_ITEM_KEYS];
  if (normalizeAccessType(accessType) === 'CVC') keys.push('scrub_the_hub');
  const values = keys.map((key) => (key === 'scrub_the_hub' ? scrubHub : items[key]));
  if (!values.length) return 0;
  const okCount = values.filter((value, idx) => {
    if (keys[idx] === 'scrub_the_hub') return isScrubHubPassed(value);
    return isInfectionItemCompliant(value);
  }).length;
  return Math.round((okCount / values.length) * 100);
};

// Legacy helper kept for older checklist-style tests/callers.
export const validateInfectionControl = (checklist) => {
  if (!checklist || checklist.length === 0) return false;

  const compliantStatuses = [
    'OK', 'Completed', 'Used', 'Yes', 'Up to Date', 'Not Applicable',
    'Followed', 'Safe', 'Compliant',
  ];

  return checklist.every((item) => compliantStatuses.includes(item.status));
};
