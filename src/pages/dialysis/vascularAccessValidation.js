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

export const validateVascularAccess = (accessType, currentConfig, formData) => {
    let failed = false;
    const cErrors = [];
    const vErrors = [];

    if (!accessType) return { isCriticalFailed: true, criticalErrors: ['Access Type is required'], validationErrors: [] };

    currentConfig.forEach((field) => {
      const val = formData[field.id];
      // Check mandatory critical fields (treat null the same as blank)
      if (field.critical && (val === undefined || val === null || val === '')) {
        vErrors.push(`Required: ${field.label}`);
      }

      // Check Clinical Rules for failure state
      if (accessType === 'AVF' || accessType === 'AVG') {
        if (field.id === 'signsOfInfection' && String(val).toLowerCase() === 'yes') {
          failed = true; cErrors.push('Signs of Infection detected. Do not cannulate this access — escalate before proceeding.');
        }
        if (field.id === 'bleedingDischarge' && String(val).toLowerCase() === 'yes') {
          failed = true; cErrors.push('Bleeding / Discharge detected. Escalate before proceeding.');
        }
        if (field.id === 'thrillBruit' && String(val).toLowerCase() === 'absent') {
          failed = true; cErrors.push('AVF thrill absent. Escalate before proceeding.');
        }
        if (field.id === 'accessFlow' && val !== undefined && val !== null && val !== '') {
          const flow = Number(val);
          if (!Number.isFinite(flow) || flow < 500) {
            failed = true; cErrors.push('Access Flow < 500 mL/min. Escalate before proceeding.');
          }
        }
      } else if (accessType === 'CVC') {
        if (field.id === 'signsOfInfectionCVC' && String(val).toLowerCase() === 'yes') {
          failed = true; cErrors.push('Signs of infection/Erythema/Discharge detected. Escalate before proceeding.');
        }
        if (field.id === 'catheterPatent' && String(val).toLowerCase() === 'no') {
          failed = true; cErrors.push('Catheter Patent is No. Escalate before proceeding.');
        }
      }
    });

    // Check if any critical field is missing
    const missingCritical = currentConfig.some((f) => {
      const val = formData[f.id];
      return f.critical && (val === undefined || val === null || val === '');
    });
    if (missingCritical) {
      failed = true;
    }

    return { isCriticalFailed: failed, criticalErrors: cErrors, validationErrors: vErrors };
};
