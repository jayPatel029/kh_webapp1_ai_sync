/**
 * Helpers for Missing Critical Reading popup (v5 D8).
 */

export function listBlankCriticalFields(fields, getValue) {
  return (fields || []).filter((field) => {
    const value = getValue(field);
    return value === undefined || value === null || String(value).trim() === '';
  });
}

export function buildCriticalSkipsPayload(fields, skippedMap, reasonsMap) {
  return (fields || [])
    .filter((field) => skippedMap[field.key])
    .map((field) => ({
      field_name: field.field_name || field.key,
      reason: reasonsMap[field.key] && String(reasonsMap[field.key]).trim()
        ? String(reasonsMap[field.key]).trim().slice(0, 200)
        : null,
      criticality: 'Critical',
    }));
}
