/**
 * Mutation → Cache Mapping
 *
 * Maps API URL patterns to the page caches they affect.
 * Used by the axiosInstance response interceptor to auto-invalidate
 * caches when a mutation (POST / PUT / DELETE / PATCH) succeeds.
 *
 * How it works:
 *   1. Axios success interceptor checks if the HTTP method is a mutation.
 *   2. The request URL is tested against every pattern below.
 *   3. All matched page names are collected (de-duplicated).
 *   4. Those page caches are invalidated in localStorage and an event is
 *      emitted so that active usePageCache hooks can auto-refetch.
 *
 * @file src/cache/mutationCacheMap.js
 */

/**
 * Each entry: { pattern: RegExp, pages: string[] }
 *
 * `pages` lists PAGE_CACHE.*.name values that should be invalidated
 * when a mutation matches the pattern.
 */
export const MUTATION_CACHE_MAP = [
  // ── Languages ──────────────────────────────────────────────────────
  { pattern: /\/languages(?:\/|$)/, pages: ['language'] },

  // ── Ailments ───────────────────────────────────────────────────────
  { pattern: /\/ailment(?:\/|$)/, pages: ['ailmentMaster', 'manageParameters'] },

  // ── Alarms ─────────────────────────────────────────────────────────
  { pattern: /\/alarms(?:\/|$)/, pages: ['showAlarms', 'dashboard', 'doctorDashboard'] },

  // ── Alerts ─────────────────────────────────────────────────────────
  { pattern: /\/alerts\//, pages: ['showAlarms', 'dashboard', 'doctorDashboard'] },
  { pattern: /\/sortAlerts\//, pages: ['dashboard', 'doctorDashboard'] },
  { pattern: /\/dailyAlerts\//, pages: ['dashboard', 'doctorDashboard'] },
  { pattern: /\/appAlerts\//, pages: ['dashboard', 'doctorDashboard'] },

  // ── Lab Reports ────────────────────────────────────────────────────
  { pattern: /\/labreport\//, pages: ['userLabReports', 'patientDetail'] },

  // ── Diet ───────────────────────────────────────────────────────────
  { pattern: /\/dietdetails\//, pages: ['userDiet', 'patientDetail'] },

  // ── Requisitions ───────────────────────────────────────────────────
  { pattern: /\/requisition\//, pages: ['userRequisition', 'patientDetail'] },

  // ── Prescriptions ──────────────────────────────────────────────────
  { pattern: /\/prescription\//, pages: ['userPrescription', 'patientDetail', 'dashboard'] },

  // ── Readings ───────────────────────────────────────────────────────
  { pattern: /\/readings\//, pages: ['dailyReadings', 'dialysisReadings', 'patientDetail'] },
  { pattern: /\/graphReadings\//, pages: ['dailyReadings', 'patientDetail'] },
  { pattern: /\/graphReadingDialysis\//, pages: ['dialysisReadings', 'patientDetail'] },

  // ── Patient data ───────────────────────────────────────────────────
  { pattern: /\/patientdata\//, pages: ['patients', 'patientDetail', 'dashboard', 'userProgram'] },

  // ── Doctor management (specific paths to avoid matching query POSTs) ─
  { pattern: /\/doctor\/(add|update|delete)/, pages: ['doctorManagement', 'dashboard'] },

  // ── Admin / User management ────────────────────────────────────────
  { pattern: /\/auth\/register/, pages: ['adminManagement', 'dashboard'] },
  { pattern: /\/users\/(delete|update)/, pages: ['adminManagement'] },

  // ── Parameters ─────────────────────────────────────────────────────
  { pattern: /\/manageParameters\//, pages: ['manageParameters'] },

  // ── Profile questions ──────────────────────────────────────────────
  { pattern: /\/question\//, pages: ['profileQuestion'] },

  // ── Notifications ──────────────────────────────────────────────────
  { pattern: /\/notifs\//, pages: ['dashboard', 'doctorDashboard'] },

  // ── Contact ────────────────────────────────────────────────────────
  { pattern: /\/contactus(?:\/|$)/, pages: [] },
];

// ── Query POST exclusions ────────────────────────────────────────────
// Some POST endpoints are really queries (fetching data), not mutations.
// Exclude them from auto-invalidation to avoid false positives.
const QUERY_POST_EXCLUSIONS = [
  /\/byEmail\//,           // Get user/doctor ID by email
  /\/users\/total/,        // Count queries
  /\/canReceive/,          // Permission checks
  /\/canexport/,           // Permission checks
  /\/sort$/,               // Sorting endpoints
  /\/getPatients/,         // Fetching patients (POST-based query)
  /\/getMessagesSW/,       // Service worker message fetch
];

/**
 * Resolve which page caches should be invalidated for a given request URL.
 *
 * @param {string} url - The full request URL
 * @returns {string[]} Unique array of page cache names to invalidate
 */
export function getAffectedPages(url) {
  // Skip known query POSTs
  if (QUERY_POST_EXCLUSIONS.some((p) => p.test(url))) {
    return [];
  }

  const affected = new Set();
  for (const { pattern, pages } of MUTATION_CACHE_MAP) {
    if (pattern.test(url)) {
      pages.forEach((p) => affected.add(p));
    }
  }
  return [...affected];
}
