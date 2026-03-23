const VIEW_PERMISSION_BIT = 1;
const EDIT_PERMISSION_BIT = 2;
const DELETE_PERMISSION_BIT = 4;

export const ADMIN_ROLE_NAMES = ["Admin", "PSadmin"];
export const DASHBOARD_ROLE_NAMES = ["Admin", "PSadmin", "Doctor"];

// Backend auth_arr order contract.
// Keep this list stable even if PERMISSION_FIELDS UI order changes.
export const AUTH_ARRAY_API_ORDER = [
  "can_vud_mr",
  "can_vud_am",
  "can_vud_ca",
  "can_vud_cd",
  "can_vud_pq",
  "can_vud_p",
  "can_vud_dr",
  "can_vud_dir",
  "can_vud_cp",
  "can_vud_ups",
  "can_vud_docr",
  "can_vud_fb",
  "can_vud_la",
  "can_vud_lo",
];

export const PERMISSION_FIELDS = [
  { key: "manageRoles", apiKey: "can_vud_mr", label: "Manage Roles" },
  { key: "ailmentMaster", apiKey: "can_vud_am", label: "Ailment Master" },
  { key: "createAdmin", apiKey: "can_vud_ca", label: "Create Admin" },
  { key: "createDoctor", apiKey: "can_vud_cd", label: "Create Doctor" },
  { key: "profileQuestions", apiKey: "can_vud_pq", label: "Profile Questions" },
  {key: "languageMaster", apiKey: "can_vud_la", label: "Language Master"},
  { key: "patients", apiKey: "can_vud_p", label: "Patients" },
  { key: "dailyReadings", apiKey: "can_vud_dr", label: "Daily Readings" },
  { key: "dialysisReadings", apiKey: "can_vud_dir", label: "Dialysis Readings" },
  { key: "changePassword", apiKey: "can_vud_cp", label: "Change Password", visiblePermissions: ['edit'] },
  { key: "userProgramSelection", apiKey: "can_vud_ups", label: "User Program Selection", visiblePermissions: ['view', 'edit'] },
  { key: "logs", apiKey: "can_vud_lo", label: "Logs" },
  // { key: "doctorReports", apiKey: "can_vud_docr", label: "Doctor Reports" },
  { key: "feedback", apiKey: "can_vud_fb", label: "Feedback", visiblePermissions: ['view','edit'] },
];

export const ROUTE_PERMISSION_MAP = {
  CreateAdmin: "createAdmin",
  AlimentMaster: "ailmentMaster",
  ChangePassword: "changePassword",
  DailyReadings: "dailyReadings",
  DialysisReadings: "dialysisReadings",
  ProfileQuestions: "profileQuestions",
  LanguageMaster: "languageMaster",
  UserProgramSelection: "userProgramSelection",
  Patient: "patients",
  UserRoles: "manageRoles",
  EditRole: "manageRoles",
  DoctorManagement: "createDoctor",
  ShowAlarms: "patients",
  ManageParameters: "patients",
  Userprescription: "patients",
  UserLabReports: "patients",
  UserDietDetails: "patients",
  UserRequisition: "patients",
  AdminChat: "patients",
  DoctorChat: "patients",
  ContactUsPage: "feedback",
  logs: "logs",
};

const toPascalCase = (value = "") =>
  String(value)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

export const getPermissionValue = (role, permissionKey) =>
  Number(role?.[permissionKey] ?? 0);

export const hasAnyPermission = (role, permissionKey) =>
  getPermissionValue(role, permissionKey) > 0;

export const hasViewPermission = (role, permissionKey) =>
  (getPermissionValue(role, permissionKey) & VIEW_PERMISSION_BIT) !== 0;

export const hasEditPermission = (role, permissionKey) =>
  (getPermissionValue(role, permissionKey) & EDIT_PERMISSION_BIT) !== 0;

export const hasDeletePermission = (role, permissionKey) =>
  (getPermissionValue(role, permissionKey) & DELETE_PERMISSION_BIT) !== 0;

export const isAdminRole = (roleName) => ADMIN_ROLE_NAMES.includes(roleName);

export const hasDashboardAccess = (roleName) =>
  DASHBOARD_ROLE_NAMES.includes(roleName);

export const decodePermissionValue = (value) => {
  const num = Number(value) || 0;
  return {
    view: (num & VIEW_PERMISSION_BIT) !== 0,
    edit: (num & EDIT_PERMISSION_BIT) !== 0,
    delete: (num & DELETE_PERMISSION_BIT) !== 0,
  };
};

export const encodePermissionValue = ({ view, edit, delete: canDelete }) =>
  (view ? VIEW_PERMISSION_BIT : 0) +
  (edit ? EDIT_PERMISSION_BIT : 0) +
  (canDelete ? DELETE_PERMISSION_BIT : 0);

const getRoleAuthValueByApiKey = (roleData = {}, apiKey) => {
  if (Array.isArray(roleData?.auth_arr)) {
    const index = AUTH_ARRAY_API_ORDER.indexOf(apiKey);
    if (index >= 0) {
      return roleData.auth_arr?.[index] ?? roleData?.[apiKey] ?? 0;
    }
  }

  return roleData?.[apiKey] ?? 0;
};

export const getRoleAuthArray = (roleData = {}) =>
  PERMISSION_FIELDS.map(({ apiKey }) => getRoleAuthValueByApiKey(roleData, apiKey));

export const getInitialRolePermissions = () =>
  PERMISSION_FIELDS.reduce((acc, { key, label }) => {
    acc[key] = { name: label, view: false, edit: false, delete: false };
    return acc;
  }, {});

export const mapRoleDataToFormPermissions = (roleData = {}) => {
  const initial = getInitialRolePermissions();
  const authArray = getRoleAuthArray(roleData);

  PERMISSION_FIELDS.forEach(({ key }, index) => {
    initial[key] = {
      ...initial[key],
      ...decodePermissionValue(authArray[index]),
    };
  });

  return initial;
};

export const mapFormPermissionsToAuthArray = (permissions = {}) => {
  const valuesByApiKey = PERMISSION_FIELDS.reduce((acc, { key, apiKey }) => {
    acc[apiKey] = encodePermissionValue(permissions?.[key] || {});
    return acc;
  }, {});

  return AUTH_ARRAY_API_ORDER.map((apiKey) => valuesByApiKey?.[apiKey] ?? 0);
};

export const getEmptyPermissionPayload = () =>
  PERMISSION_FIELDS.reduce((acc, { apiKey }) => {
    acc[apiKey] = 0;
    return acc;
  }, {});

export const getInitialPermissionState = () =>
  buildPermissionState({
    role_name: "",
    ...getEmptyPermissionPayload(),
  }, false);

export const buildPermissionState = (payload = {}, isLoaded = true) => {
  const next = {
    role_name: payload?.role_name,
    isLoaded,
  };

  PERMISSION_FIELDS.forEach(({ key, apiKey }) => {
    const value = Number(payload?.[apiKey] ?? 0);
    const pascal = toPascalCase(key);
    next[key] = value;
    next[apiKey] = value;
    next[`canView${pascal}`] = (value & VIEW_PERMISSION_BIT) !== 0;
    next[`canEdit${pascal}`] = (value & EDIT_PERMISSION_BIT) !== 0;
    next[`canDelete${pascal}`] = (value & DELETE_PERMISSION_BIT) !== 0;
  });

  return next;
};

export const canAccessRoute = (role, routeName) => {
  const permissionKey = ROUTE_PERMISSION_MAP[routeName];
  if (!permissionKey) return true;

  if (permissionKey === "patients" && isAdminRole(role?.role_name)) {
    return true;
  }

  return hasAnyPermission(role, permissionKey);
};
