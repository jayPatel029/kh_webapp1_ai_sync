/**
 * Display helpers for audit log tables.
 * Raw API values stay stored as-is; this file only formats UI text.
 */

const EMPTY = "—";

const FIELD_LABELS = {
  _record: "Record",
  name: "Name",
  number: "Phone",
  phoneno: "Phone",
  dob: "Date of birth",
  address: "Address",
  state: "State",
  pincode: "Pincode",
  ailments: "Ailments",
  eGFR: "eGFR",
  GFR: "GFR",
  dry_weight: "Dry weight",
  account_deletion_request: "Account deletion",
  profile_photo: "Profile photo",
  photo: "Photo",
  role: "Role",
  email: "Email",
  license_no: "License no",
  "license no": "License no",
  practicing_at: "Practicing at",
  "practicing at": "Practicing at",
  experience: "Experience",
  ref: "Referral",
  resume: "Resume",
  doctors_code: "Doctor code",
  "doctors code": "Doctor code",
  institute: "Institute",
  description: "Description",
  email_notification: "Email notification",
  Dialysis_updates: "Dialysis updates",
  daily_update: "Daily updates",
  dailyReadingsAlerts: "Daily readings alerts",
  can_export: "Export access",
  clinic_id: "Clinic",
  organization_id: "Organization",
  lab_report: "Lab report",
  prescription: "Prescription",
  requisition: "Requisition",
};

function humanizeField(field) {
  if (!field) return "";
  if (FIELD_LABELS[field]) return FIELD_LABELS[field];
  return String(field)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function displayValue(value) {
  if (value == null) return EMPTY;
  const text = String(value).trim();
  if (!text || text.toLowerCase() === "null" || text.toLowerCase() === "undefined") {
    return EMPTY;
  }
  return text;
}

export function formatLogDate(value) {
  if (!value) return EMPTY;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return displayValue(value);
  return date.toLocaleString();
}

export function getRawField(log) {
  return log?.changed_field || log?.field || "";
}

export function getRawOld(log) {
  return log?.old_value ?? log?.oldValue;
}

export function getRawNew(log) {
  return log?.new_value ?? log?.newValue;
}

export function formatFieldLabel(log) {
  const field = getRawField(log);
  const next = String(getRawNew(log) || "").toUpperCase();
  if (field === "_record" && next === "CREATE") return "Created";
  if (field === "_record" && next === "DELETE") return "Deleted";
  if (field === "account_deletion_request" && next === "REQUESTED") {
    return "Account deletion";
  }
  if (field === "account_deletion_request" && next === "CANCELLED") {
    return "Account deletion";
  }
  return FIELD_LABELS[field] || field || EMPTY;
}

export function formatOldValue(log) {
  const field = getRawField(log);
  const next = String(getRawNew(log) || "").toUpperCase();
  if (field === "_record" && next === "CREATE") return EMPTY;
  if (field === "_record" && next === "DELETE") {
    const old = displayValue(getRawOld(log));
    return old === EMPTY ? "Active" : old;
  }
  if (field === "account_deletion_request" && next === "REQUESTED") return EMPTY;
  return displayValue(getRawOld(log));
}

export function formatNewValue(log) {
  const field = getRawField(log);
  const next = String(getRawNew(log) || "").toUpperCase();
  if (field === "_record" && next === "CREATE") {
    return displayValue(
      log.patientName || log.patient_name || log.subject_name || "New patient"
    );
  }
  if (field === "_record" && next === "DELETE") return "Deleted";
  if (field === "account_deletion_request" && next === "REQUESTED") return "Requested";
  if (field === "account_deletion_request" && next === "CANCELLED") return "Cancelled";
  return displayValue(getRawNew(log));
}

export function parseActor(changedBy) {
  const raw = displayValue(changedBy);
  if (raw === EMPTY) {
    return { source: "", kind: "unknown", id: "", identity: "" };
  }
  const tagged = raw.match(/^\[(web|app|system)\]\s*(.*)$/i);
  const source = tagged ? tagged[1].toLowerCase() : "";
  const identity = (tagged ? tagged[2] : raw).trim();
  const patientMatch = identity.match(/^patient:(\d+)$/i);
  if (patientMatch) {
    return {
      source: "app",
      kind: "patient",
      id: patientMatch[1],
      identity,
    };
  }
  return { source, kind: "staff", id: "", identity };
}

export function formatSourceLabel(source) {
  if (source === "web") return "Web";
  if (source === "app") return "App";
  if (source === "system") return "System";
  return "";
}

/**
 * Patient actors → name + phone.
 * Doctor / admin actors → name + email (from API actorName / actorEmail).
 */
export function formatChangedBy(log, options = {}) {
  const raw =
    log?.changed_by ||
    log?.changedBy ||
    log?.deletedBy ||
    log?.deleted_by ||
    log?.actor_label ||
    "";
  const actor = parseActor(raw);
  const sourceLabel = formatSourceLabel(log?.source || actor.source);

  const ip = displayValue(log?.ip);
  const ipLabel = ip !== EMPTY ? ip : "";

  if (actor.kind === "patient" || log?.actor_kind === "patient") {
    const name = displayValue(
      options.patientName ||
        log?.actor_name ||
        log?.patientName ||
        log?.patient_name
    );
    const phone = displayValue(
      options.patientNumber || log?.actor_contact || log?.number
    );
    const primary = name !== EMPTY ? name : `Patient ${actor.id || log?.actor_id || ""}`.trim();
    const secondary = phone !== EMPTY ? phone : "";
    return { primary, secondary, sourceLabel, ipLabel };
  }

  const staffName = displayValue(log?.actor_name || log?.actorName);
  const staffEmail = displayValue(
    log?.actor_contact || log?.actorEmail || actor.identity
  );
  const role = displayValue(log?.actor_role || log?.actorRole);
  const roleSuffix = role !== EMPTY ? ` · ${role}` : "";
  if (staffName !== EMPTY && staffEmail !== EMPTY && staffName !== staffEmail) {
    return { primary: staffName, secondary: `${staffEmail}${roleSuffix}`, sourceLabel, ipLabel };
  }
  if (staffEmail !== EMPTY) {
    return { primary: staffEmail, secondary: role !== EMPTY ? role : "", sourceLabel, ipLabel };
  }

  return {
    primary: actor.identity || EMPTY,
    secondary: "",
    sourceLabel,
    ipLabel,
  };
}

const SUBJECT_LABELS = {
  patient: "Patient",
  doctor: "Doctor",
  lab_report: "Lab report",
  prescription: "Prescription",
  requisition: "Requisition",
};

export function formatEventAction(log) {
  const summary = displayValue(log?.summary);
  if (summary !== EMPTY) return summary;

  const field = getRawField(log);
  const next = String(getRawNew(log) || "").trim().toUpperCase();
  const action = String(log?.action || "").trim().toUpperCase();
  const subject = SUBJECT_LABELS[log?.subject_type] || "Record";
  const fieldLabel = humanizeField(field);

  if (field === "_record" || !field) {
    if (next === "CREATE" || action === "CREATE") return `${subject} created`;
    if (next === "DELETE" || action === "DELETE") return `${subject} deleted`;
  }
  if (field === "account_deletion_request") {
    if (next === "REQUESTED" || action === "REQUEST") {
      return "Account deletion requested";
    }
    return "Account deletion cancelled";
  }
  if (action === "CREATE") return `${fieldLabel || subject} created`;
  if (action === "DELETE") return `${fieldLabel || subject} deleted`;
  if (fieldLabel) return `${fieldLabel} updated`;
  if (action === "UPDATE") return `${subject} updated`;
  return "Updated";
}

export function formatSubjectIdentity(log) {
  const name = displayValue(log?.subject_name);
  const contact = displayValue(log?.subject_contact);
  const id = displayValue(log?.subject_id);
  const type = SUBJECT_LABELS[log?.subject_type] || displayValue(log?.subject_type);
  return {
    name: name === EMPTY ? "" : name,
    contact: contact === EMPTY ? "" : contact,
    id: id === EMPTY ? "" : id,
    type: type === EMPTY ? "" : type,
  };
}

export function formatOutcome(log) {
  const raw = String(log?.outcome || "success").trim().toLowerCase();
  if (raw === "fail" || raw === "failed" || raw === "error" || raw === "failure") {
    return { label: "Failed", failed: true };
  }
  return { label: "Success", failed: false };
}
