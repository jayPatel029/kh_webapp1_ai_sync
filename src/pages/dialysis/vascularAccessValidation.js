const FIELD_NAME_MAP = {
  thrillBruit: 'thrill_bruit',
  accessSiteAppearance: 'access_site_appearance',
  signsOfInfection: 'signs_of_infection',
  bleedingDischarge: 'bleeding_discharge',
  aneurysm: 'aneurysm',
  cannulationZone: 'cannulation_zone',
  accessFlow: 'access_flow_ml_min',
  dressingIntact: 'dressing_intact',
  tendernessPain: 'tenderness_pain',
  exitSiteClean: 'exit_site_clean',
  signsOfInfectionCVC: 'cvc_signs_of_infection',
  catheterPatent: 'catheter_patent',
};

// --- Config for Tables ---
export const AVF_AVG_CONFIG = [
  { id: 'thrillBruit', label: 'Thrill / Bruit', type: 'radio', options: ['Present', 'Weak', 'Absent'], critical: true },
  { id: 'accessSiteAppearance', label: 'Access Site Appearance', type: 'radio', options: ['Normal', 'Redness', 'Swelling', 'Other'], critical: false },
  { id: 'signsOfInfection', label: 'Signs of Infection', type: 'radio', options: ['No', 'Yes'], critical: true },
  { id: 'bleedingDischarge', label: 'Bleeding / Discharge', type: 'radio', options: ['No', 'Yes'], critical: true },
  { id: 'aneurysm', label: 'Aneurysm / Pseudoaneurysm', type: 'radio', options: ['No', 'Yes'], critical: false },
  { id: 'cannulationZone', label: 'Cannulation Zone', type: 'radio', options: ['Good', 'Limited', 'Poor'], critical: false },
  { id: 'accessFlow', label: 'Access Flow (mL/min)', type: 'number', critical: true },
];

export const CVC_CONFIG = [
  { id: 'dressingIntact', label: 'Dressing Intact', type: 'radio', options: ['Yes', 'No'], critical: false },
  { id: 'tendernessPain', label: 'Tenderness/Pain at Exit Site', type: 'radio', options: ['No', 'Yes'], critical: true },
  { id: 'exitSiteClean', label: 'Exit Site Clean', type: 'radio', options: ['Yes', 'No'], critical: false },
  { id: 'signsOfInfectionCVC', label: 'Signs of Infection / Erythema / Discharge', type: 'radio', options: ['No', 'Yes'], critical: true },
  { id: 'catheterPatent', label: 'Catheter Patent', type: 'radio', options: ['Yes', 'No'], critical: true },
];

/**
 * v5 D11–D14 / D8 — blocking findings vs always-alert vs blank Critical (popup).
 */
export const validateVascularAccess = (accessType, currentConfig, formData, options = {}) => {
  const { treatBlankCriticalAsError = false } = options;
  let failed = false;
  const cErrors = [];
  const alertWarnings = [];
  const vErrors = [];

  if (!accessType) {
    return {
      isCriticalFailed: true,
      criticalErrors: ['Access Type is required'],
      alwaysAlertWarnings: [],
      validationErrors: [],
      blankCriticalFields: [],
    };
  }

  const blankCriticalFields = [];

  currentConfig.forEach((field) => {
    const val = formData[field.id];
    if (field.critical && (val === undefined || val === null || val === '')) {
      blankCriticalFields.push({
        key: field.id,
        field_name: FIELD_NAME_MAP[field.id] || field.id,
        label: field.label,
        inputType: field.type === 'number' ? 'number' : (field.options ? 'select' : 'yn'),
        options: field.options,
      });
      if (treatBlankCriticalAsError) {
        vErrors.push(`Required: ${field.label}`);
      }
    }

    if (accessType === 'AVF' || accessType === 'AVG') {
      // D11 — blocking
      if (field.id === 'signsOfInfection' && String(val).toLowerCase() === 'yes') {
        failed = true;
        cErrors.push('Signs of Infection detected. Blocked until cleared by nephrologist or nurse PIN.');
      }
      if (field.id === 'bleedingDischarge' && String(val).toLowerCase() === 'yes') {
        failed = true;
        cErrors.push('Bleeding / Discharge detected. Blocked until cleared by nephrologist or nurse PIN.');
      }
      // D13 — always-alert, non-blocking
      if (field.id === 'accessSiteAppearance' && ['redness', 'swelling', 'other'].includes(String(val).toLowerCase())) {
        alertWarnings.push(`Access Site Appearance: ${val} — doctor alerted; you may proceed after save.`);
      }
      if (field.id === 'thrillBruit' && ['weak', 'absent'].includes(String(val).toLowerCase())) {
        alertWarnings.push(`Thrill / Bruit: ${val} — doctor alerted; you may proceed after save.`);
      }
      if (field.id === 'aneurysm' && String(val).toLowerCase() === 'yes') {
        alertWarnings.push('Aneurysm / Pseudoaneurysm = Yes — doctor alerted; you may proceed after save.');
      }
      if (field.id === 'cannulationZone' && String(val).toLowerCase() === 'poor') {
        alertWarnings.push('Cannulation Zone = Poor — doctor alerted; you may proceed after save.');
      }
      if (field.id === 'accessFlow' && val !== undefined && val !== null && val !== '') {
        const flow = Number(val);
        if (Number.isFinite(flow) && flow < 500) {
          alertWarnings.push('Access Flow < 500 mL/min — doctor alerted; you may proceed after save.');
        }
      }
    } else if (accessType === 'CVC') {
      // D11 — blocking
      if (field.id === 'signsOfInfectionCVC' && String(val).toLowerCase() === 'yes') {
        failed = true;
        cErrors.push('Signs of infection/Erythema/Discharge detected. Blocked until cleared by nephrologist or nurse PIN.');
      }
      if (field.id === 'catheterPatent' && String(val).toLowerCase() === 'no') {
        failed = true;
        cErrors.push('Catheter Patent is No. Blocked until cleared by nephrologist or nurse PIN.');
      }
      // D14 — always-alert
      if (field.id === 'tendernessPain' && String(val).toLowerCase() === 'yes') {
        alertWarnings.push('Tenderness/Pain at Exit Site = Yes — doctor alerted; you may proceed after save.');
      }
      if (field.id === 'exitSiteClean' && String(val).toLowerCase() === 'no') {
        alertWarnings.push('Exit Site Clean = No — doctor alerted; you may proceed after save.');
      }
    }
  });

  return {
    isCriticalFailed: failed,
    criticalErrors: cErrors,
    alwaysAlertWarnings: alertWarnings,
    validationErrors: vErrors,
    blankCriticalFields,
  };
};
