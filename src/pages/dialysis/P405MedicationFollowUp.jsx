import React, { useEffect, useMemo, useState } from 'react';
import { Button, Textarea } from '../../component-library';
import {
  createMedicationAdministration,
  getDueMedications,
} from '../../ApiCalls/dialysisSessionApis';
import { getSessionMedications } from '../../ApiCalls/postDialysisApis';

import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import HotelOutlinedIcon from '@mui/icons-material/HotelOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import VaccinesOutlinedIcon from '@mui/icons-material/VaccinesOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

const SCREENS_STEPPER = [
  { step: 1, label: 'Blood Return & Termination' },
  { step: 2, label: 'Vascular Access Hemostasis' },
  { step: 3, label: 'Post Dialysis Vitals' },
  { step: 4, label: 'Outcome Summary' },
  { step: 5, label: 'Medication & Follow-up' },
  { step: 6, label: 'Disinfection & Turnover' },
  { step: 7, label: 'Infection Control & Waste Disposal' },
  { step: 8, label: 'Discharge' },
  { step: 9, label: 'Documentation & Sign-off' },
  { step: 10, label: 'Session Complete' },
];

const INVESTIGATIONS_LIST = [
  { id: 'hb', label: 'Hemoglobin' },
  { id: 'ferritin', label: 'Serum Ferritin' },
  { id: 'pth', label: 'PTH' },
  { id: 'calcium', label: 'Calcium' },
  { id: 'phosphorus', label: 'Phosphorus' },
  { id: 'other', label: 'Other' },
];

const EDUCATION_ITEMS = [
  { id: 'adherence', label: 'Medication adherence' },
  { id: 'diet', label: 'Diet & fluid restrictions' },
  { id: 'access', label: 'Access care' },
  { id: 'seek_help', label: 'When to seek help' },
];

function formatDose(row) {
  if (row.dose == null && !row.dose_unit) return row.doseDisplay || '—';
  const unit = row.dose_unit || row.unit || '';
  return `${row.dose}${unit ? ` ${unit}` : ''}`.trim() || '—';
}

function formatWhen(raw) {
  if (!raw) return '—';
  try {
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return String(raw);
    return d.toLocaleString();
  } catch {
    return String(raw);
  }
}

function normalizeStatus(raw) {
  const s = String(raw || 'Given').trim();
  const lower = s.toLowerCase();
  if (lower.includes('miss')) return 'Missed';
  if (lower.includes('hold') || lower.includes('held')) return 'Held';
  if (lower.includes('giv') || lower.includes('admin')) return 'Given';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function mapMedicationRow(row, index) {
  const status = normalizeStatus(row.status || row.administration_status || (row.source === 'prescription' ? 'Missed' : 'Given'));
  const name = row.name || row.medication || row.medication_name || `Medication ${index + 1}`;
  return {
    id: row.id ?? `med-${index}`,
    name,
    dose: formatDose(row),
    route: row.route || '—',
    indication: row.indication || '—',
    scheduledTime: formatWhen(row.scheduled_time || row.scheduledTime || row.due_at || row.administration_time),
    status,
    givenAt: status === 'Given' ? formatWhen(row.given_at || row.administration_time) : '—',
    givenBy: status === 'Given'
      ? (row.given_by || row.administered_by_name || row.administered_by || '—')
      : '—',
    source: row.source || 'administration',
    raw: row,
  };
}

function parseInvestigations(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      return raw.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  if (typeof raw === 'object') return Object.keys(raw).filter((k) => raw[k]);
  return [];
}

function yesNoFromTruthy(v, fallback = 'No') {
  if (v === true || v === 1 || v === '1' || String(v).toLowerCase() === 'yes' || String(v).toLowerCase() === 'true') return 'Yes';
  if (v === false || v === 0 || v === '0' || String(v).toLowerCase() === 'no' || String(v).toLowerCase() === 'false') return 'No';
  return fallback;
}

function splitDateTime(raw) {
  if (!raw) return { date: '', time: '' };
  const s = String(raw);
  const m = s.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/);
  if (m) return { date: m[1], time: m[2] };
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return { date: s, time: '' };
  return { date: '', time: '' };
}

function buildP405ApiPayload(form) {
  const investigations = [...form.selectedInvestigations];
  if (form.otherInvestigationText && investigations.includes('other')) {
    investigations.push(form.otherInvestigationText);
  }
  return {
    missed_held_reason: form.missedReason || null,
    has_missed_held: form.hasMissedHeld,
    notified_physician: form.notifiedPhysician === 'Yes',
    physician_instruction: form.physicianInstruction || null,
    follow_up_action: form.followupAction || null,
    missed_comments: form.missedComments || null,
    adr_observed: form.adrObserved === 'Yes',
    adr_details: form.adrDetails || null,
    adr_severity: form.adrSeverity || null,
    adr_action_taken: form.adrActionTaken || null,
    next_med_date: form.nextMedDate || null,
    next_med_time: form.nextMedTime || null,
    next_medication_due: form.nextMedDate
      ? `${form.nextMedDate} ${form.nextMedTime || '00:00'}`.trim()
      : null,
    follow_up_investigations: investigations,
    selectedInvestigations: form.selectedInvestigations,
    other_investigation_text: form.otherInvestigationText || null,
    physician_review_required: form.physicianReviewRequired === 'Yes',
    review_date: form.reviewDate || null,
    notes: form.followupNotes || null,
    education_items: form.educationItems,
    education_datetime: form.educationDateTime || null,
  };
}

export default function P405MedicationFollowUp({
  data = {},
  setData,
  session = {},
  patient = {},
  onSave,
  onSaveDraft,
  onBack,
  apiError = '',
}) {
  const p = patient.patient || patient;
  const patientName = p.name || p.patient_name || (p.id ? `Patient #${p.id}` : '—');
  const pid = p.patient_code || p.patientCode || p.pid || p.patient_id || (p.id ? `P${p.id}` : '—');
  const rawGender = p.gender || p.sex;
  const gender = rawGender === 'F' ? 'Female' : rawGender === 'M' ? 'Male' : (rawGender || '—');
  const ageVal = p.age ? String(p.age) : '—';
  const ageGender = ageVal !== '—' && gender !== '—' ? `${ageVal} Years, ${gender}` : (ageVal !== '—' ? `${ageVal} Years` : gender);
  const bloodGroup = p.bloodGroup || p.blood_group || '—';
  const accessDetail = p.vascular_access || p.access || session.access || data.access || '—';
  const nephrologist = p.primary_doctor_name || p.nephrologist || session.nephrologist || p.doctor_name || '—';

  const startTimeStr = session.started_at || session.start_time || data.started_at || '—';
  const endTimeStr = data.endTime || session.ended_at || session.end_time || '—';
  const durationStr = data.treatmentDuration || session.treatmentDuration || session.duration || '—';
  const ufRemovedStr = data.totalUfRemoved != null && data.totalUfRemoved !== ''
    ? `${data.totalUfRemoved} L`
    : (session.totalUfRemoved != null ? `${session.totalUfRemoved} L` : '—');
  const bedStr = session.bed || session.bed_number || patient.bed || '—';

  const sessionId = session.id || session.session_id || data.session_id;
  const followup = data.followup || {};
  const nextDueSplit = splitDateTime(followup.next_medication_due || data.next_medication_due);

  const [activeTab, setActiveTab] = useState('All');
  const [medications, setMedications] = useState(() => {
    const rows = Array.isArray(data.medications) ? data.medications : [];
    return rows.map(mapMedicationRow);
  });
  const [loadingMeds, setLoadingMeds] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    medication: '',
    dose: '',
    dose_unit: '',
    route: 'IV',
    indication: '',
    administration_time: '',
    quantity_used: '',
    quantity_unit: '',
  });
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  const [missedReason, setMissedReason] = useState(
    data.missedReason || followup.missed_held_reason || '',
  );
  const [notifiedPhysician, setNotifiedPhysician] = useState(
    yesNoFromTruthy(data.notifiedPhysician ?? followup.notified_physician, 'No'),
  );
  const [physicianInstruction, setPhysicianInstruction] = useState(
    data.physicianInstruction || followup.physician_instruction || '',
  );
  const [followupAction, setFollowupAction] = useState(
    data.followupAction || followup.follow_up_action || '',
  );
  const [missedComments, setMissedComments] = useState(data.missedComments || '');

  const [adrObserved, setAdrObserved] = useState(
    yesNoFromTruthy(data.adrObserved ?? followup.adr_observed, 'No'),
  );
  const [adrDetails, setAdrDetails] = useState(data.adrDetails || followup.adr_details || '');
  const [adrSeverity, setAdrSeverity] = useState(data.adrSeverity || followup.adr_severity || '');
  const [adrActionTaken, setAdrActionTaken] = useState(
    data.adrActionTaken || followup.adr_action_taken || '',
  );

  const [nextMedDate, setNextMedDate] = useState(data.nextMedDate || nextDueSplit.date || '');
  const [nextMedTime, setNextMedTime] = useState(data.nextMedTime || nextDueSplit.time || '');
  const [selectedInvestigations, setSelectedInvestigations] = useState(() => {
    if (Array.isArray(data.selectedInvestigations)) return data.selectedInvestigations;
    return parseInvestigations(followup.follow_up_investigations || data.follow_up_investigations);
  });
  const [otherInvestigationText, setOtherInvestigationText] = useState(data.otherInvestigationText || '');
  const [physicianReviewRequired, setPhysicianReviewRequired] = useState(
    yesNoFromTruthy(data.physicianReviewRequired ?? followup.physician_review_required, 'No'),
  );
  const [reviewDate, setReviewDate] = useState(
    data.reviewDate || followup.review_date || '',
  );
  const [followupNotes, setFollowupNotes] = useState(
    data.followupNotes || followup.notes || '',
  );

  const [educationItems, setEducationItems] = useState(
    () => (Array.isArray(data.educationItems) ? data.educationItems : []),
  );
  const [educationDateTime, setEducationDateTime] = useState(data.educationDateTime || '');
  const [formError, setFormError] = useState('');

  const updateParentState = (updates) => {
    if (setData) setData((old) => ({ ...old, ...updates }));
  };

  const refreshMedications = async () => {
    if (!sessionId || sessionId === 'demo') return;
    setLoadingMeds(true);
    try {
      const [medRes, dueRes] = await Promise.all([
        getSessionMedications(sessionId),
        getDueMedications(sessionId).catch(() => ({ success: false })),
      ]);
      let rows = [];
      if (medRes.success) {
        const payload = medRes.data?.data || medRes.data || {};
        rows = Array.isArray(payload.medications) ? payload.medications : [];
        updateParentState({
          medications: rows,
          summary: payload.summary,
          followup: payload.followup || data.followup,
          missed_held: payload.missed_held,
        });
      }
      // If P4 GET already merged missed, use it; otherwise merge due leftovers.
      if ((!rows.length || !rows.some((r) => normalizeStatus(r.status) !== 'Given')) && dueRes?.success) {
        const duePayload = dueRes.data?.data || dueRes.data || {};
        const administered = (duePayload.administered || []).map((r) => ({ ...r, status: 'Given', source: 'administration' }));
        const reminders = (duePayload.reminders || []).filter((rem) => {
          const name = String(rem.medication || '').toLowerCase();
          return !administered.some((a) => String(a.medication || '').toLowerCase() === name);
        }).map((rem) => ({
          ...rem,
          status: 'Missed',
          source: 'prescription',
          scheduled_time: rem.due_at,
        }));
        rows = [...administered, ...reminders];
        updateParentState({ medications: rows });
      }
      setMedications(rows.map(mapMedicationRow));
    } finally {
      setLoadingMeds(false);
    }
  };

  useEffect(() => {
    const rows = Array.isArray(data.medications) ? data.medications : [];
    if (rows.length) {
      setMedications(rows.map(mapMedicationRow));
    } else if (sessionId && sessionId !== 'demo') {
      refreshMedications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, data.medications]);

  const handleInvestigationToggle = (invId) => {
    setSelectedInvestigations((prev) => {
      const next = prev.includes(invId) ? prev.filter((id) => id !== invId) : [...prev, invId];
      updateParentState({ selectedInvestigations: next });
      return next;
    });
  };

  const handleEducationToggle = (eduId) => {
    setEducationItems((prev) => {
      const next = prev.includes(eduId) ? prev.filter((id) => id !== eduId) : [...prev, eduId];
      updateParentState({ educationItems: next });
      return next;
    });
  };

  const filteredMeds = medications.filter((m) => {
    if (activeTab === 'Given') return m.status === 'Given';
    if (activeTab === 'Missed/Held') return m.status === 'Missed' || m.status === 'Held';
    return true;
  });

  const totalScheduled = medications.length;
  const givenCount = medications.filter((m) => m.status === 'Given').length;
  const missedCount = medications.filter((m) => m.status === 'Missed' || m.status === 'Held').length;
  const hasMissedHeld = missedCount > 0;
  const givenPct = totalScheduled ? Math.round((givenCount / totalScheduled) * 100) : 0;
  const missedPct = totalScheduled ? Math.round((missedCount / totalScheduled) * 100) : 0;

  const pendingActions = useMemo(() => {
    const items = [];
    if (missedCount > 0) items.push(`${missedCount} medication${missedCount === 1 ? '' : 's'} missed/held`);
    if (physicianReviewRequired === 'Yes') items.push('Physician review required');
    if (selectedInvestigations.length > 0) items.push('Follow-up investigations pending');
    if (adrObserved === 'Yes') items.push('ADR documented — critical notification');
    return items;
  }, [missedCount, physicianReviewRequired, selectedInvestigations.length, adrObserved]);

  const handleAddMedication = async () => {
    setAddError('');
    if (!sessionId || sessionId === 'demo') {
      setAddError('No live session available for retrospective medication entry.');
      return;
    }
    const {
      medication, dose, dose_unit, route, indication, administration_time, quantity_used, quantity_unit,
    } = addForm;
    if (!medication || dose === '' || !route || !administration_time || quantity_used === '') {
      setAddError('Medication, Dose, Route, Administration Time, and Quantity Used are required.');
      return;
    }
    const administeredBy = (() => {
      try {
        return localStorage.getItem('id')
          || localStorage.getItem('userId')
          || localStorage.getItem('user_id')
          || localStorage.getItem('technicianId')
          || data.userId
          || null;
      } catch {
        return data.userId || null;
      }
    })();
    if (!administeredBy) {
      setAddError('Unable to resolve Administered By (logged-in user id).');
      return;
    }
    setAdding(true);
    const res = await createMedicationAdministration(sessionId, {
      medication,
      dose: Number(dose),
      dose_unit: dose_unit || null,
      route,
      indication: indication || null,
      administration_time,
      quantity_used: Number(quantity_used),
      quantity_unit: quantity_unit || null,
      administered_by: Number(administeredBy) || administeredBy,
    });
    setAdding(false);
    if (!res.success) {
      setAddError(res.data?.message || res.data?.error || 'Unable to save retrospective medication.');
      return;
    }
    setShowAddForm(false);
    setAddForm({
      medication: '',
      dose: '',
      dose_unit: '',
      route: 'IV',
      indication: '',
      administration_time: '',
      quantity_used: '',
      quantity_unit: '',
    });
    await refreshMedications();
  };

  const handleFormSubmit = async () => {
    setFormError('');
    if (hasMissedHeld && !String(missedReason || '').trim()) {
      setFormError('Reason is required for missed/held medications.');
      return;
    }
    if (adrObserved === 'Yes') {
      if (!String(adrSeverity || '').trim() || !String(adrActionTaken || '').trim()) {
        setFormError('Severity and Action Taken are required when ADR is observed.');
        return;
      }
    }
    if (selectedInvestigations.includes('other') && !String(otherInvestigationText || '').trim()) {
      setFormError('Specify the Other investigation before continuing.');
      return;
    }

    const form = {
      missedReason,
      hasMissedHeld,
      notifiedPhysician,
      physicianInstruction,
      followupAction,
      missedComments,
      adrObserved,
      adrDetails,
      adrSeverity,
      adrActionTaken,
      nextMedDate,
      nextMedTime,
      selectedInvestigations,
      otherInvestigationText,
      physicianReviewRequired,
      reviewDate,
      followupNotes,
      educationItems,
      educationDateTime,
    };
    const apiPayload = buildP405ApiPayload(form);
    updateParentState({ ...form, ...apiPayload });
    if (onSave) {
      const ok = await onSave(apiPayload);
      if (ok === false) return;
    }
  };

  return (
    <div className="p405-page-wrapper">
      <header className="p405-top-bar">
        <div className="p405-top-bar-left">
          <h1>P4-05 – Medication &amp; Follow-up</h1>
          <p>Review medications given, missed or held and plan follow-up care.</p>
        </div>
      </header>

      <nav className="p405-stepper-bar" aria-label="Post-Dialysis 10-Step Progress">
        {SCREENS_STEPPER.map((s, idx) => {
          const isActive = s.step === 5;
          const isCompleted = s.step < 5;
          return (
            <React.Fragment key={s.step}>
              <div className={`p405-stepper-item ${isActive ? 'active' : isCompleted ? 'completed' : ''}`}>
                <div className="p405-stepper-circle">{isCompleted ? '✓' : s.step}</div>
                <span className="p405-stepper-label">{s.label}</span>
              </div>
              {idx < SCREENS_STEPPER.length - 1 && <div className="p405-stepper-line" />}
            </React.Fragment>
          );
        })}
      </nav>

      <div className="p405-patient-header-banner">
        <div className="p405-patient-left">
          <div className="p405-patient-avatar-box">
            {patient.avatarUrl ? (
              <img src={patient.avatarUrl} alt={patientName} />
            ) : (
              <div className="p405-patient-avatar-fallback" aria-hidden="true">
                {(patientName || '?').slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="p405-patient-bio">
            <div className="p405-patient-name-row">
              <h2>{patientName}</h2>
              <span className="p405-pill-active">Active</span>
            </div>
            <div className="p405-patient-subrow1">
              <span>PID: <strong>{pid}</strong></span>
              <span className="p405-sep">|</span>
              <span><strong>{ageGender}</strong></span>
              <span className="p405-sep">|</span>
              <span>Blood Group: <strong>{bloodGroup}</strong></span>
            </div>
            <div className="p405-patient-subrow2">
              <span>Access: <strong>{accessDetail}</strong></span>
              <span className="p405-sep">|</span>
              <span>Nephrologist: <strong>{nephrologist}</strong></span>
            </div>
          </div>
        </div>

        <div className="p405-patient-stats">
          <div className="p405-stat-box">
            <CalendarTodayOutlinedIcon className="p405-stat-icon" />
            <span className="p405-stat-lbl">Treatment Start</span>
            <strong className="p405-stat-val">{startTimeStr}</strong>
          </div>
          <div className="p405-stat-box">
            <AccessTimeOutlinedIcon className="p405-stat-icon" />
            <span className="p405-stat-lbl">Treatment End</span>
            <strong className="p405-stat-val">{endTimeStr}</strong>
          </div>
          <div className="p405-stat-box">
            <AccessTimeOutlinedIcon className="p405-stat-icon" />
            <span className="p405-stat-lbl">Duration</span>
            <strong className="p405-stat-val">{durationStr}</strong>
          </div>
          <div className="p405-stat-box">
            <WaterDropOutlinedIcon className="p405-stat-icon" />
            <span className="p405-stat-lbl">UF Removed</span>
            <strong className="p405-stat-val">{ufRemovedStr}</strong>
          </div>
          <div className="p405-stat-box">
            <HotelOutlinedIcon className="p405-stat-icon" />
            <span className="p405-stat-lbl">Bed</span>
            <strong className="p405-stat-val">{bedStr}</strong>
          </div>
        </div>
      </div>

      <div className="p405-workspace-grid">
        <div className="p405-main-form-column">
          <div className="p405-card">
            <div className="p405-card-header-flex">
              <h2>1. Medications Administered During Dialysis</h2>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="p405-add-med-btn"
                onClick={() => setShowAddForm((v) => !v)}
              >
                <AddOutlinedIcon sx={{ fontSize: 16 }} /> Add Medication
              </Button>
            </div>

            {showAddForm && (
              <div className="p405-card" style={{ marginBottom: 12, background: '#f8fafc' }}>
                <p style={{ marginTop: 0, color: '#64748b', fontSize: 13 }}>
                  Retrospective entry for a dose forgotten during treatment (same P3-06 fields).
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  <label>Medication *<input value={addForm.medication} onChange={(e) => setAddForm((f) => ({ ...f, medication: e.target.value }))} /></label>
                  <label>Dose *<input type="number" value={addForm.dose} onChange={(e) => setAddForm((f) => ({ ...f, dose: e.target.value }))} /></label>
                  <label>Unit<input value={addForm.dose_unit} onChange={(e) => setAddForm((f) => ({ ...f, dose_unit: e.target.value }))} /></label>
                  <label>Route *
                    <select value={addForm.route} onChange={(e) => setAddForm((f) => ({ ...f, route: e.target.value }))}>
                      <option value="IV">IV</option>
                      <option value="PO">PO</option>
                      <option value="SC">SC</option>
                      <option value="IM">IM</option>
                    </select>
                  </label>
                  <label>Indication<input value={addForm.indication} onChange={(e) => setAddForm((f) => ({ ...f, indication: e.target.value }))} /></label>
                  <label>Administration Time *<input type="datetime-local" value={addForm.administration_time} onChange={(e) => setAddForm((f) => ({ ...f, administration_time: e.target.value }))} /></label>
                  <label>Quantity Used *<input type="number" value={addForm.quantity_used} onChange={(e) => setAddForm((f) => ({ ...f, quantity_used: e.target.value }))} /></label>
                  <label>Qty Unit<input value={addForm.quantity_unit} onChange={(e) => setAddForm((f) => ({ ...f, quantity_unit: e.target.value }))} /></label>
                </div>
                {addError && <div className="during-error" style={{ marginTop: 8 }}>{addError}</div>}
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  <Button type="button" variant="primary" size="sm" onClick={handleAddMedication} disabled={adding}>
                    {adding ? 'Saving…' : 'Save Retrospective Entry'}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
              </div>
            )}

            <div className="p405-tabs-row">
              <button type="button" className={`p405-tab ${activeTab === 'All' ? 'active' : ''}`} onClick={() => setActiveTab('All')}>
                All ({totalScheduled})
              </button>
              <button type="button" className={`p405-tab ${activeTab === 'Given' ? 'active' : ''}`} onClick={() => setActiveTab('Given')}>
                Given ({givenCount})
              </button>
              <button type="button" className={`p405-tab ${activeTab === 'Missed/Held' ? 'active' : ''}`} onClick={() => setActiveTab('Missed/Held')}>
                Missed/Held ({missedCount})
              </button>
            </div>

            <div className="p405-table-wrap">
              <table className="p405-meds-table">
                <thead>
                  <tr>
                    <th>Medication</th>
                    <th>Dose</th>
                    <th>Route</th>
                    <th>Indication</th>
                    <th>Scheduled Time</th>
                    <th>Status</th>
                    <th>Given At</th>
                    <th>Given By</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingMeds && (
                    <tr><td colSpan={8} style={{ color: '#64748b' }}>Loading medications…</td></tr>
                  )}
                  {!loadingMeds && filteredMeds.length === 0 && (
                    <tr><td colSpan={8} style={{ color: '#64748b' }}>No medications logged for this session yet.</td></tr>
                  )}
                  {!loadingMeds && filteredMeds.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div className="p405-med-cell">
                          {m.status === 'Given' ? (
                            <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                          ) : (
                            <CancelOutlinedIcon sx={{ color: '#dc2626', fontSize: 16 }} />
                          )}
                          <strong>{m.name}</strong>
                        </div>
                      </td>
                      <td>{m.dose}</td>
                      <td>{m.route}</td>
                      <td>{m.indication}</td>
                      <td>{m.scheduledTime}</td>
                      <td>
                        <span className={`p405-status-pill ${m.status.toLowerCase()}`}>{m.status}</span>
                      </td>
                      <td>{m.givenAt}</td>
                      <td>{m.givenBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p405-table-legend">
              <span className="p405-legend-item"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 14 }} /> Given</span>
              <span className="p405-legend-item"><span className="p405-dot-held" /> Held</span>
              <span className="p405-legend-item"><CancelOutlinedIcon sx={{ color: '#dc2626', fontSize: 14 }} /> Missed</span>
            </div>
          </div>

          <div className="p405-bottom-3col-grid">
            {hasMissedHeld && (
              <div className="p405-card p405-card-missed">
                <div className="p405-card-title-row">
                  <h2>2. Missed / Held Medication Details</h2>
                </div>
                <div className="p405-form-field">
                  <label>Reason *</label>
                  <select
                    value={missedReason}
                    onChange={(e) => {
                      setMissedReason(e.target.value);
                      updateParentState({ missedReason: e.target.value });
                    }}
                  >
                    <option value="">Select reason</option>
                    <option value="Patient Refused">Patient Refused</option>
                    <option value="Low Blood Pressure">Low Blood Pressure</option>
                    <option value="Physician Hold">Physician Hold</option>
                    <option value="Not Available">Not Available</option>
                  </select>
                </div>
                <div className="p405-form-field">
                  <label>Notified Physician</label>
                  <div className="p405-toggle-pills">
                    <button type="button" className={`p401-pill-btn ${notifiedPhysician === 'Yes' ? 'active' : ''}`} onClick={() => { setNotifiedPhysician('Yes'); updateParentState({ notifiedPhysician: 'Yes' }); }}>Yes</button>
                    <button type="button" className={`p401-pill-btn ${notifiedPhysician === 'No' ? 'active-no' : ''}`} onClick={() => { setNotifiedPhysician('No'); updateParentState({ notifiedPhysician: 'No' }); }}>No</button>
                  </div>
                </div>
                <div className="p405-form-field">
                  <div className="p405-notes-label">
                    <label>Physician Instruction</label>
                    <span className="p405-char-count">{physicianInstruction.length} / 200</span>
                  </div>
                  <Textarea maxLength={200} placeholder="Enter instructions..." value={physicianInstruction} onChange={(e) => { setPhysicianInstruction(e.target.value); updateParentState({ physicianInstruction: e.target.value }); }} style={{ minHeight: 50 }} />
                </div>
                <div className="p405-form-field">
                  <label>Follow-up Action</label>
                  <select value={followupAction} onChange={(e) => { setFollowupAction(e.target.value); updateParentState({ followupAction: e.target.value }); }}>
                    <option value="">Select action</option>
                    <option value="Reschedule for next session">Reschedule for next session</option>
                    <option value="Administer at discharge">Administer at discharge</option>
                    <option value="Discontinue">Discontinue</option>
                  </select>
                </div>
                <div className="p405-form-field">
                  <div className="p405-notes-label">
                    <label>Comments</label>
                    <span className="p405-char-count">{missedComments.length} / 300</span>
                  </div>
                  <Textarea maxLength={300} placeholder="Enter comments..." value={missedComments} onChange={(e) => { setMissedComments(e.target.value); updateParentState({ missedComments: e.target.value }); }} style={{ minHeight: 50 }} />
                </div>
              </div>
            )}

            <div className={`p405-card ${adrObserved === 'Yes' ? 'p405-card-missed' : ''}`}>
              <div className="p405-card-title-row">
                <h2>3. Adverse Drug Reaction (If any)</h2>
              </div>
              <div className="p405-form-field">
                <label>Any ADR Observed?</label>
                <div className="p405-toggle-pills">
                  <button type="button" className={`p401-pill-btn ${adrObserved === 'Yes' ? 'active-early' : ''}`} onClick={() => { setAdrObserved('Yes'); updateParentState({ adrObserved: 'Yes' }); }}>Yes</button>
                  <button type="button" className={`p401-pill-btn ${adrObserved === 'No' ? 'active' : ''}`} onClick={() => { setAdrObserved('No'); updateParentState({ adrObserved: 'No' }); }}>No</button>
                </div>
              </div>
              {adrObserved === 'Yes' && (
                <>
                  <div className="during-error" style={{ marginBottom: 8 }}>
                    ADR observed — this contributes a Critical physician notification.
                  </div>
                  <div className="p405-form-field">
                    <div className="p405-notes-label">
                      <label>ADR Details</label>
                      <span className="p405-char-count">{adrDetails.length} / 200</span>
                    </div>
                    <Textarea maxLength={200} placeholder="Enter reaction details..." value={adrDetails} onChange={(e) => { setAdrDetails(e.target.value); updateParentState({ adrDetails: e.target.value }); }} style={{ minHeight: 50 }} />
                  </div>
                  <div className="p405-form-field">
                    <label>Severity *</label>
                    <select value={adrSeverity} onChange={(e) => { setAdrSeverity(e.target.value); updateParentState({ adrSeverity: e.target.value }); }}>
                      <option value="">Select severity</option>
                      <option value="Mild">Mild</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Severe">Severe</option>
                    </select>
                  </div>
                  <div className="p405-form-field">
                    <div className="p405-notes-label">
                      <label>Action Taken *</label>
                      <span className="p405-char-count">{adrActionTaken.length} / 300</span>
                    </div>
                    <Textarea maxLength={300} placeholder="Enter action taken..." value={adrActionTaken} onChange={(e) => { setAdrActionTaken(e.target.value); updateParentState({ adrActionTaken: e.target.value }); }} style={{ minHeight: 50 }} />
                  </div>
                </>
              )}
            </div>

            <div className="p405-card">
              <div className="p405-card-title-row">
                <h2>4. Follow-up Plan</h2>
              </div>
              <div className="p405-form-field">
                <label>Next Medication Due</label>
                <div className="p405-date-time-flex">
                  <input type="date" value={nextMedDate} onChange={(e) => { setNextMedDate(e.target.value); updateParentState({ nextMedDate: e.target.value }); }} />
                  <input type="time" value={nextMedTime} onChange={(e) => { setNextMedTime(e.target.value); updateParentState({ nextMedTime: e.target.value }); }} />
                </div>
              </div>
              <div className="p405-form-field">
                <label>Follow-up Investigations</label>
                <div className="p405-investigations-grid">
                  {INVESTIGATIONS_LIST.map((inv) => (
                    <label key={inv.id} className="p405-inv-checkbox">
                      <input type="checkbox" checked={selectedInvestigations.includes(inv.id)} onChange={() => handleInvestigationToggle(inv.id)} />
                      <span>{inv.label}</span>
                    </label>
                  ))}
                </div>
                {selectedInvestigations.includes('other') && (
                  <input
                    type="text"
                    style={{ marginTop: 8 }}
                    placeholder="Specify other investigation..."
                    value={otherInvestigationText}
                    onChange={(e) => {
                      setOtherInvestigationText(e.target.value);
                      updateParentState({ otherInvestigationText: e.target.value });
                    }}
                  />
                )}
              </div>
              <div className="p405-form-field">
                <label>Physician Review Required</label>
                <div className="p405-toggle-pills">
                  <button type="button" className={`p401-pill-btn ${physicianReviewRequired === 'Yes' ? 'active' : ''}`} onClick={() => { setPhysicianReviewRequired('Yes'); updateParentState({ physicianReviewRequired: 'Yes' }); }}>Yes</button>
                  <button type="button" className={`p401-pill-btn ${physicianReviewRequired === 'No' ? 'active-no' : ''}`} onClick={() => { setPhysicianReviewRequired('No'); updateParentState({ physicianReviewRequired: 'No' }); }}>No</button>
                </div>
              </div>
              {physicianReviewRequired === 'Yes' && (
                <div className="p405-form-field">
                  <label>Review Date</label>
                  <input type="date" value={reviewDate} onChange={(e) => { setReviewDate(e.target.value); updateParentState({ reviewDate: e.target.value }); }} />
                </div>
              )}
              <div className="p405-form-field">
                <div className="p405-notes-label">
                  <label>Notes / Instructions</label>
                  <span className="p405-char-count">{followupNotes.length} / 300</span>
                </div>
                <Textarea maxLength={300} placeholder="Enter notes for follow-up..." value={followupNotes} onChange={(e) => { setFollowupNotes(e.target.value); updateParentState({ followupNotes: e.target.value }); }} style={{ minHeight: 50 }} />
              </div>
            </div>
          </div>
        </div>

        <div className="p405-right-rail">
          <div className="p405-rail-card">
            <div className="p405-rail-header"><h3>Medication Summary</h3></div>
            <div className="p405-summary-rows">
              <div className="p405-summary-row">
                <div className="p405-sum-left">
                  <VaccinesOutlinedIcon sx={{ color: '#2563eb', fontSize: 18 }} />
                  <span>Total Scheduled</span>
                </div>
                <strong>{totalScheduled}</strong>
              </div>
              <div className="p405-summary-row">
                <div className="p405-sum-left">
                  <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 18 }} />
                  <span>Given</span>
                </div>
                <strong>{givenCount} ({givenPct}%)</strong>
              </div>
              <div className="p405-summary-row">
                <div className="p405-sum-left">
                  <CancelOutlinedIcon sx={{ color: '#dc2626', fontSize: 18 }} />
                  <span>Missed / Held</span>
                </div>
                <strong>{missedCount} ({missedPct}%)</strong>
              </div>
            </div>
          </div>

          <div className="p405-rail-card p405-pending-card">
            <div className="p405-rail-header">
              <LightbulbOutlinedIcon sx={{ color: '#b45309', fontSize: 18 }} />
              <h3 style={{ color: '#92400e' }}>Pending Actions</h3>
            </div>
            <div className="p405-pending-list">
              {pendingActions.length === 0 ? (
                <div className="p405-pending-row" style={{ color: '#64748b' }}>
                  <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                  <span>No pending medication actions</span>
                </div>
              ) : pendingActions.map((item) => (
                <div className="p405-pending-row" key={item}>
                  <WarningAmberOutlinedIcon sx={{ color: '#d97706', fontSize: 16 }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p405-rail-card">
            <div className="p405-rail-header"><h3>Patient Education Provided</h3></div>
            <div className="p405-edu-list">
              {EDUCATION_ITEMS.map((item) => (
                <label key={item.id} className="p405-edu-checkbox">
                  <input type="checkbox" checked={educationItems.includes(item.id)} onChange={() => handleEducationToggle(item.id)} />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
            <div className="p405-edu-time-box">
              <label>Education Date &amp; Time</label>
              <input
                type="datetime-local"
                value={educationDateTime}
                onChange={(e) => {
                  setEducationDateTime(e.target.value);
                  updateParentState({ educationDateTime: e.target.value });
                }}
              />
            </div>
          </div>

          <div className="p405-rail-card">
            <div className="p405-rail-header"><h3>Quick Actions</h3></div>
            <div className="p405-quick-flex">
              <button type="button" className="p405-action-btn" disabled>
                <SendOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Send to Nephrologist</span>
              </button>
              <button type="button" className="p405-action-btn" disabled>
                <PrintOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Print Medication Summary</span>
              </button>
              <button type="button" className="p405-action-btn" disabled>
                <NotificationsActiveOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Add Follow-up Reminder</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="p405-footer-bar">
        <div className="p405-footer-left">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowBackOutlinedIcon sx={{ fontSize: 16 }} /> Back
          </Button>
        </div>
        <div className="p405-footer-right">
          {(formError || apiError) && (
            <div className="during-error" style={{ marginRight: 12 }}>
              {formError || apiError}
            </div>
          )}
          <Button type="button" variant="outline" onClick={onSaveDraft}>
            Save as Draft
          </Button>
          <Button type="button" variant="primary" onClick={handleFormSubmit}>
            Save &amp; Continue <ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />
          </Button>
        </div>
      </footer>
    </div>
  );
}
