/**
 * Heparin dosage helper
 * Calculates a suggested heparin bolus (IU) based on weight and strategy.
 * Strategy: 'low' | 'standard' | 'high' | 'auto'
 * Ailment hint can drive an automatic strategy selection.
 */
const FACTORS_IU_PER_KG = {
  low: 30, // IU/kg (configurable)
  standard: 50,
  high: 75,
};

const AILMENT_STRATEGY_MAP = {
  // keys are human-friendly string identifiers that may be provided from the UI
  anticoagulation: 'low', // patient already on anticoagulants -> prefer lower dose
  bleeding_risk: 'low',
  hypercoagulable: 'high',
  heparin_resistance: 'high',
};

/**
 * Calculate heparin bolus suggestion
 * @param {number} weightKg - patient's dry weight in kilograms
 * @param {'low'|'standard'|'high'|'auto'} strategy
 * @param {string|null} ailment - optional ailment key to influence auto strategy
 * @returns {{doseIU: number|null, perKg: number|null, strategy: string, note: string}}
 */
export function calculateHeparinDose(weightKg, strategy = 'auto', ailment = null) {
  if (!weightKg || Number.isNaN(Number(weightKg)) || Number(weightKg) <= 0) {
    return { doseIU: null, perKg: null, strategy: 'unknown', note: 'Weight not available' };
  }

  let chosen = strategy;
  if (strategy === 'auto') {
    if (ailment && AILMENT_STRATEGY_MAP[ailment]) {
      chosen = AILMENT_STRATEGY_MAP[ailment];
    } else {
      chosen = 'standard';
    }
  }

  const perKg = FACTORS_IU_PER_KG[chosen] || FACTORS_IU_PER_KG.standard;
  const dose = Math.round(Number(weightKg) * perKg);

  return {
    doseIU: dose,
    perKg,
    strategy: chosen,
    note: `Calculated using ${perKg} IU/kg for strategy '${chosen}'`,
  };
}

export default calculateHeparinDose;
