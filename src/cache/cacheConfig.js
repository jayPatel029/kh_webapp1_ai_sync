/**
 * Page Cache Configuration
 * 
 * Central registry of page names and their default TTLs.
 * Each page key maps to a human-readable name used as the localStorage namespace.
 * 
 * When a mutation happens on a page, we invalidate that page AND any
 * related pages listed in `invalidatesPages`.
 * 
 * @file src/cache/cacheConfig.js
 */

/** TTL presets (in milliseconds) */
export const TTL = {
  SHORT: 2 * 60 * 1000,      // 2 min  – rapidly changing data (dashboard alerts)
  MEDIUM: 5 * 60 * 1000,     // 5 min  – standard lists (patients, admins)
  LONG: 15 * 60 * 1000,      // 15 min – rarely changing data (roles, ailments)
  VERY_LONG: 30 * 60 * 1000, // 30 min – almost-static reference data
};

/**
 * Page cache definitions.
 * 
 * - `name`             : localStorage key segment (cache::<name>)
 * - `defaultTTL`       : default time-to-live for all API entries in this page
 * - `invalidatesPages` : when this page's data is mutated, also invalidate these pages
 */
export const PAGE_CACHE = {
  // ── Patient pages ─────────────────────────────────────────
  PATIENTS: {
    name: 'patients',
    defaultTTL: TTL.MEDIUM,
    invalidatesPages: ['dashboard', 'patientDetail'],
  },
  PATIENT_DETAIL: {
    name: 'patientDetail',
    defaultTTL: TTL.MEDIUM,
    invalidatesPages: ['patients'],
  },

  // ── User management ───────────────────────────────────────
  ADMIN_MANAGEMENT: {
    name: 'adminManagement',
    defaultTTL: TTL.MEDIUM,
    invalidatesPages: ['dashboard'],
  },
  DOCTOR_MANAGEMENT: {
    name: 'doctorManagement',
    defaultTTL: TTL.MEDIUM,
    invalidatesPages: ['dashboard'],
  },
  USER_ROLES: {
    name: 'userRoles',
    defaultTTL: TTL.LONG,
    invalidatesPages: ['adminManagement', 'doctorManagement'],
  },

  // ── Dashboard ─────────────────────────────────────────────
  DASHBOARD: {
    name: 'dashboard',
    defaultTTL: TTL.SHORT,
    invalidatesPages: [],
  },

  // ── Settings / Parameters ─────────────────────────────────
  MANAGE_PARAMETERS: {
    name: 'manageParameters',
    defaultTTL: TTL.MEDIUM,
    invalidatesPages: [],
  },

  // ── Readings ──────────────────────────────────────────────
  DAILY_READINGS: {
    name: 'dailyReadings',
    defaultTTL: TTL.MEDIUM,
    invalidatesPages: ['patientDetail'],
  },
  DIALYSIS_READINGS: {
    name: 'dialysisReadings',
    defaultTTL: TTL.MEDIUM,
    invalidatesPages: ['patientDetail'],
  },

  // ── Doctor dashboard ────────────────────────────────────────
  DOCTOR_DASHBOARD: {
    name: 'doctorDashboard',
    defaultTTL: TTL.SHORT,
    invalidatesPages: [],
  },

  // ── Patient detail sub-pages ──────────────────────────────
  SHOW_ALARMS: {
    name: 'showAlarms',
    defaultTTL: TTL.MEDIUM,
    invalidatesPages: ['dashboard', 'doctorDashboard'],
  },
  USER_LAB_REPORTS: {
    name: 'userLabReports',
    defaultTTL: TTL.MEDIUM,
    invalidatesPages: ['patientDetail'],
  },
  USER_DIET: {
    name: 'userDiet',
    defaultTTL: TTL.MEDIUM,
    invalidatesPages: ['patientDetail'],
  },
  USER_REQUISITION: {
    name: 'userRequisition',
    defaultTTL: TTL.MEDIUM,
    invalidatesPages: ['patientDetail'],
  },
  USER_PRESCRIPTION: {
    name: 'userPrescription',
    defaultTTL: TTL.MEDIUM,
    invalidatesPages: ['patientDetail', 'dashboard'],
  },
  USER_PROGRAM: {
    name: 'userProgram',
    defaultTTL: TTL.MEDIUM,
    invalidatesPages: ['patients'],
  },

  // ── Other pages ───────────────────────────────────────────
  AILMENT_MASTER: {
    name: 'ailmentMaster',
    defaultTTL: TTL.LONG,
    invalidatesPages: ['manageParameters', 'dailyReadings', 'dialysisReadings'],
  },
  AUDIT_LOGS: {
    name: 'auditLogs',
    defaultTTL: TTL.SHORT,
    invalidatesPages: [],
  },
  KFRE: {
    name: 'kfre',
    defaultTTL: TTL.MEDIUM,
    invalidatesPages: [],
  },
  DOCTOR_REPORT: {
    name: 'doctorReport',
    defaultTTL: TTL.MEDIUM,
    invalidatesPages: [],
  },
  LANGUAGE: {
    name: 'language',
    defaultTTL: TTL.VERY_LONG,
    invalidatesPages: [],
  },
  PROFILE_QUESTION: {
    name: 'profileQuestion',
    defaultTTL: TTL.LONG,
    invalidatesPages: [],
  },
};
