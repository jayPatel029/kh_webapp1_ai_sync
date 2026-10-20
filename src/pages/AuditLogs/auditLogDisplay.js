/**
 * Display helpers for audit log tables.
 * Raw API values stay stored as-is; this file only formats UI text.
 */

const EMPTY = "—";

const FIELD_LABELS = {
  _record: "Record",
  name: "Name",
  number: "Phone",
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
};

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
    return displayValue(log.patientName || log.patient_name || "New patient");
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
    return { source, kind: "patient", id: patientMatch[1], identity };
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
    "";
  const actor = parseActor(raw);
  const sourceLabel = formatSourceLabel(actor.source);

  if (actor.kind === "patient") {
    const name = displayValue(
      options.patientName || log?.patientName || log?.patient_name
    );
    const phone = displayValue(options.patientNumber || log?.number);
    const primary = name !== EMPTY ? name : `Patient ${actor.id || ""}`.trim();
    const secondary = phone !== EMPTY ? phone : "";
    return { primary, secondary, sourceLabel };
  }

  const staffName = displayValue(log?.actorName);
  const staffEmail = displayValue(log?.actorEmail || actor.identity);
  if (staffName !== EMPTY && staffEmail !== EMPTY && staffName !== staffEmail) {
    return { primary: staffName, secondary: staffEmail, sourceLabel };
  }
  if (staffEmail !== EMPTY) {
    return { primary: staffEmail, secondary: "", sourceLabel };
  }

  return {
    primary: actor.identity || EMPTY,
    secondary: "",
    sourceLabel,
  };
}

export function formatPatientIdentity(log) {
  const name = displayValue(log?.patientName || log?.patient_name);
  const phone = displayValue(log?.number);
  const id = displayValue(log?.patient_id || log?.patientId);
  return {
    name: name === EMPTY ? "" : name,
    phone: phone === EMPTY ? "" : phone,
    id: id === EMPTY ? "" : id,
  };
}
