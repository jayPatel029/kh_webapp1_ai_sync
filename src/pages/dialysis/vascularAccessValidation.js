// --- Config for Tables ---
export const AVF_AVG_CONFIG = [
  { id: 'signsOfInfection', label: 'Signs of Infection', type: 'radio', options: ['No', 'Yes'], critical: true },
  { id: 'bleedingDischarge', label: 'Bleeding / Discharge', type: 'radio', options: ['No', 'Yes'], critical: true },
  { id: 'thrillBruit', label: 'Thrill / Bruit', type: 'radio', options: ['Present', 'Weak', 'Absent'], critical: true },
  { id: 'accessFlow', label: 'Access Flow (mL/min)', type: 'number', critical: true },
  { id: 'accessSiteAppearance', label: 'Access Site Appearance', type: 'radio', options: ['Normal', 'Redness', 'Swelling', 'Other'], critical: false },
  { id: 'cannulationZone', label: 'Cannulation Zone', type: 'radio', options: ['Good', 'Limited', 'Poor'], critical: false },
  { id: 'aneurysm', label: 'Aneurysm / Pseudoaneurysm', type: 'radio', options: ['No', 'Yes'], critical: false },
];

export const CVC_CONFIG = [
  { id: 'signsOfInfectionCVC', label: 'Signs of Infection / Erythema / Discharge', type: 'radio', options: ['No', 'Yes'], critical: true },
  { id: 'catheterPatent', label: 'Catheter Patent', type: 'radio', options: ['Yes', 'No'], critical: true },
  { id: 'tendernessPain', label: 'Tenderness/Pain at Exit Site', type: 'radio', options: ['No', 'Yes'], critical: true },
  { id: 'dressingIntact', label: 'Dressing Intact', type: 'radio', options: ['Yes', 'No'], critical: false },
  { id: 'exitSiteClean', label: 'Exit Site Clean', type: 'radio', options: ['Yes', 'No'], critical: false },
];

export const validateVascularAccess = (accessType, currentConfig, formData) => {
    let failed = false;
    const cErrors = [];
    const vErrors = [];

    if (!accessType) return { isCriticalFailed: true, criticalErrors: ['Access Type is required'], validationErrors: [] };

    currentConfig.forEach((field) => {
      const val = formData[field.id];
      // Check mandatory critical fields
      if (field.critical && (val === undefined || val === '')) {
        vErrors.push(`Required: ${field.label}`);
      }

      // Check Clinical Rules for failure state
      if (accessType === 'AVF' || accessType === 'AVG') {
        if (field.id === 'signsOfInfection' && val === 'Yes') {
          failed = true; cErrors.push('Signs of Infection detected. Do not cannulate this access — escalate before proceeding.');
        }
        if (field.id === 'bleedingDischarge' && val === 'Yes') {
          failed = true; cErrors.push('Bleeding / Discharge detected. Escalate before proceeding.');
        }
        if (field.id === 'thrillBruit' && val === 'Absent') {
          failed = true; cErrors.push('AVF thrill absent. Escalate before proceeding.');
        }
        if (field.id === 'accessFlow' && val && Number(val) < 500) {
          failed = true; cErrors.push('Access Flow < 500 mL/min. Escalate before proceeding.');
        }
      } else if (accessType === 'CVC') {
        if (field.id === 'signsOfInfectionCVC' && val === 'Yes') {
          failed = true; cErrors.push('Signs of infection/Erythema/Discharge detected. Escalate before proceeding.');
        }
        if (field.id === 'catheterPatent' && val === 'No') {
          failed = true; cErrors.push('Catheter Patent is No. Escalate before proceeding.');
        }
      }
    });

    // Check if any critical field is missing
    const missingCritical = currentConfig.some(f => f.critical && (formData[f.id] === undefined || formData[f.id] === ''));
    if (missingCritical) {
      failed = true;
    }

    return { isCriticalFailed: failed, criticalErrors: cErrors, validationErrors: vErrors };
};
