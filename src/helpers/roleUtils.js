// Centralized role normalization and checks
// Usage: import { normalizeRole, isRole } from '../helpers/roleUtils';

export const normalizeRole = (role) => {
  if (!role && role !== 0) return '';
  let name = '';
  if (typeof role === 'string') name = role;
  else if (typeof role === 'object') {
    // common fields that may contain role text
    name = role.role_name || role.name || role.role || '';
  } else {
    name = String(role);
  }
  return String(name)
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
};

// isRole accepts a role (string or object) and a target which can be string or array of strings.
// It returns true if the normalized role equals any targetNormalized OR contains the targetNormalized as a substring.
export const isRole = (role, target) => {
  const norm = normalizeRole(role);
  if (!norm) return false;
  const targets = Array.isArray(target) ? target : [target];
  for (const t of targets) {
    if (typeof t !== 'string') continue;
    const tn = normalizeRole(t);
    if (!tn) continue;
    if (norm === tn) return true;
    if (norm.includes(tn)) return true;
  }
  return false;
};

export default {
  normalizeRole,
  isRole,
};
