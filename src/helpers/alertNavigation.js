/**
 * Alert navigation helpers — main AdminContainer.actionFunc parity
 * mapped onto current ROUTES.
 *
 * @file src/helpers/alertNavigation.js
 */

import { updateIsReadAlert } from "../ApiCalls/alertsApis";
import { ROUTES } from "../routes/routeConstants";

const cat = (alert) =>
  String(alert?.category || alert?.type || alert?.type0 || alert?.message || "").trim();

export function getAlertCategory(alert) {
  return cat(alert);
}

export function persistAlertLocalIds(alert) {
  if (alert?.alarmId != null) localStorage.setItem("alarmId", String(alert.alarmId));
  if (alert?.labReportId != null) localStorage.setItem("labReportId", String(alert.labReportId));
  if (alert?.requisitionId != null) {
    localStorage.setItem("requisitionId", String(alert.requisitionId));
  }
}

export async function markAlertOpenedIfNeeded(alert) {
  const category = cat(alert);
  if (category.includes("New Program Enrollment")) return;

  const isClosed =
    alert?.isOpened === 0 ||
    alert?.isOpened === "0" ||
    alert?.isOpened === false;

  if (!isClosed) return;

  if (alert?.missedAlertId != null) {
    await updateIsReadAlert({ id: alert.missedAlertId });
  }
  if (alert?.id != null) {
    await updateIsReadAlert({ id: alert.id });
  }
}

/**
 * Port of main AdminContainer.actionFunc with current ROUTES.
 * Returns null when the alert should stay in a modal (readings / generic).
 */
export function resolveAlertDestination(alert) {
  if (!alert) return null;

  const category = cat(alert);
  const patientId = alert.patientId || alert.patient_id || alert.pid;
  const normalizedDisapproved = category.replace(/\s+$/, "");

  if (patientId && (category === "New Enrollment" || category === "New Program")) {
    return { path: ROUTES.userProfile(patientId) };
  }

  if (
    patientId &&
    (category.includes("Doctor Message to Admin") || category.includes("Admin Chat"))
  ) {
    return { path: ROUTES.chatAdmin(patientId) };
  }

  if (
    patientId &&
    (category === "New Prescription" ||
      category === "Prescription Not Viewed" ||
      category === "New Prescription Alarm")
  ) {
    return { path: ROUTES.patientPrescriptions(patientId) };
  }

  if (patientId && normalizedDisapproved === "Prescription Disapproved") {
    return { path: ROUTES.patientAlarms(patientId) };
  }

  if (
    patientId &&
    (category === "Delete patient Alert" ||
      category === "Account Deletion" ||
      category === "Delete Account")
  ) {
    return { path: ROUTES.userProfile(patientId) };
  }

  if (patientId && category === "New Lab Report") {
    return { path: ROUTES.patientLabs(patientId) };
  }

  if (category === "New Feedback" || category === "Contact Us") {
    return { path: ROUTES.supportTicket(alert.contactUsId) };
  }

  if (
    patientId &&
    (category.includes("New Program Enrollment") || category === "Change In Program")
  ) {
    return { path: ROUTES.programDetail(patientId) };
  }

  if (alert.redirect && String(alert.redirect).startsWith("/")) {
    return { path: String(alert.redirect) };
  }

  return null;
}

export function isNavigableSystemAlert(alert) {
  return resolveAlertDestination(alert) != null;
}

/**
 * Mark read + navigate. Falls back to patient profile when no mapped route.
 */
export async function openAlertDestination(alert, navigate) {
  if (!alert || typeof navigate !== "function") return false;

  let dest = resolveAlertDestination(alert);
  if (!dest?.path) {
    const patientId = alert.patientId || alert.patient_id || alert.pid;
    if (patientId) {
      dest = { path: ROUTES.userProfile(patientId) };
    }
  }

  if (!dest?.path) return false;

  persistAlertLocalIds(alert);
  try {
    await markAlertOpenedIfNeeded(alert);
  } catch (err) {
    console.error("markAlertOpenedIfNeeded failed", err);
  }
  navigate(dest.path, dest.state ? { state: dest.state } : undefined);
  return true;
}
