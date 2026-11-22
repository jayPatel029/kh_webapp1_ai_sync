import React, { useEffect, useMemo, useState } from 'react';
import { Button, Textarea } from '../../component-library';
import { getUsersByRole } from '../../ApiCalls/authapis';
import { saveSessionSignoff } from '../../ApiCalls/postDialysisApis';

import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import HotelOutlinedIcon from '@mui/icons-material/HotelOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import DrawOutlinedIcon from '@mui/icons-material/DrawOutlined';

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

const SIGNOFF_ROLE_QUERIES = {
  technician: ['Dialysis Technician', 'Technician'],
  nurse: ['Nurse', 'Medical Staff'],
  physician: ['Nephrologist', 'Doctor', 'Physician'],
};

function resolveLoggedInUser() {
  try {
    const id = localStorage.getItem('id')
      || localStorage.getItem('userId')
      || localStorage.getItem('user_id')
      || localStorage.getItem('technicianId')
      || '';
    const name = localStorage.getItem('name')
      || localStorage.getItem('userName')
      || localStorage.getItem('username')
      || '';
    let fromJson = {};
    try {
      fromJson = JSON.parse(localStorage.getItem('user') || '{}') || {};
    } catch {
      fromJson = {};
    }
    const display = name
      || fromJson.name
      || [fromJson.firstname, fromJson.lastname].filter(Boolean).join(' ')
      || (id ? `User #${id}` : '—');
    return { id: id || fromJson.id || null, display };
  } catch {
    return { id: null, display: '—' };
  }
}

function parseNotes(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {
    /* plain text summary */
  }
  return { summary: String(raw) };
}

function formatStaffLabel(user) {
  const name = [user?.firstname, user?.lastname].filter(Boolean).join(' ').trim()
    || user?.name
    || user?.email
    || (user?.id != null ? `User #${user.id}` : 'Unknown');
  const role = user?.role || user?.role_name || '';
  return role ? `${name} (${role})` : name;
}

function contactLabel(c) {
  return [c.role, c.name].filter(Boolean).join(' — ') || `Contact #${c.id}`;
}

function severityClass(sev) {
  const s = String(sev || '').toLowerCase();
  if (s === 'critical') return 'p409-notify-critical';
  if (s === 'important') return 'p409-notify-important';
  return 'p409-notify-notable';
}

function buildP409ApiPayload(form) {
  return {
    technician_notes: {
      summary: form.techSummary || '',
      machine_issues: form.machineIssues || 'None',
      actions: form.techActions || '',
      comments: form.techComments || '',
    },
    nursing_notes: {
      summary: form.nurseSummary || '',
      interventions: form.nurseInterventions || '',
      education: form.eduReinforced || '',
    },
    physician_comments: {
      comments: form.physicianComments || '',
      orders: form.physicianOrders || '',
    },
    any_incidents: form.incidentOccurred === 'Yes',
    incident_type: form.incidentOccurred === 'Yes' ? (form.incidentType || null) : null,
    incident_description: form.incidentOccurred === 'Yes' ? (form.incidentDescription || null) : null,
    corrective_actions: form.incidentOccurred === 'Yes' ? (form.correctiveActions || null) : null,
    reported_to: form.incidentOccurred === 'Yes' ? (form.reportedTo || null) : null,
    // camelCase aliases for older callers / draft merge
    technicianNotes: {
      summary: form.techSummary || '',
      machineIssues: form.machineIssues || 'None',
      actions: form.techActions || '',
      comments: form.techComments || '',
    },
    nursingNotes: {
      summary: form.nurseSummary || '',
      interventions: form.nurseInterventions || '',
      education: form.eduReinforced || '',
    },
    physicianComments: {
      comments: form.physicianComments || '',
      orders: form.physicianOrders || '',
    },
    incidentDocumentation: {
      occurred: form.incidentOccurred,
      type: form.incidentType,
      description: form.incidentDescription,
      correctiveActions: form.correctiveActions,
      reportedTo: form.reportedTo,
    },
  };
}

function SignoffCard({
  role,
  label,
  loggedIn,
  record,
  roster,
  busy,
  error,
  onSignSelf,
  onSignOther,
}) {
  const [mode, setMode] = useState(null); // null | 'self' | 'other'
  const [selectedId, setSelectedId] = useState('');
  const [attested, setAttested] = useState(false);

  if (record?.signed) {
    return (
      <div className="p409-sign-box p409-sign-box--done">
        <div className="p409-sign-lbl-row">
          <label>{label} <span className="p409-req">*</span></label>
        </div>
        <div className="p409-sig-canvas p409-sig-canvas--auth">
          <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 18 }} />
          <span className="p409-sig-script">{record.signedBy || 'Signed'}</span>
        </div>
        <div className="p409-sig-meta">
          <span>{record.isSelf ? 'Self-authenticated' : 'Authenticated (alternate)'}</span>
          <strong>{record.timestamp || '—'}</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="p409-sign-box">
      <div className="p409-sign-lbl-row">
        <label>{label} <span className="p409-req">*</span></label>
      </div>
      {!mode && (
        <div className="p409-sig-canvas p409-sig-canvas--auth">
          <DrawOutlinedIcon sx={{ fontSize: 18, color: '#64748b' }} />
          <span className="p409-sig-prompt">Is {loggedIn.display} the {role}?</span>
          <div className="p409-sign-actions">
            <button type="button" className="p409-sign-yes" disabled={busy} onClick={() => setMode('self')}>
              Yes
            </button>
            <button type="button" className="p409-sign-no" disabled={busy} onClick={() => setMode('other')}>
              No
            </button>
          </div>
        </div>
      )}
      {mode === 'self' && (
        <div className="p409-sig-canvas p409-sig-canvas--auth">
          <p className="p409-sig-prompt">
            Confirm authentication as <strong>{loggedIn.display}</strong> ({role}).
          </p>
          <label className="p409-radio-lbl">
            <input type="checkbox" checked={attested} onChange={(e) => setAttested(e.target.checked)} />
            I confirm this sign-off with my logged-in credentials
          </label>
          <div className="p409-sign-actions">
            <button type="button" className="p409-sign-no" onClick={() => { setMode(null); setAttested(false); }}>
              Cancel
            </button>
            <button
              type="button"
              className="p409-sign-yes"
              disabled={busy || !attested || !loggedIn.id}
              onClick={() => onSignSelf()}
            >
              Authenticate &amp; Sign
            </button>
          </div>
        </div>
      )}
      {mode === 'other' && (
        <div className="p409-sig-canvas p409-sig-canvas--auth">
          <p className="p409-sig-prompt">Select the {role} who completed this session, then authenticate.</p>
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            <option value="">Select staff…</option>
            {roster.map((u) => (
              <option key={u.id} value={u.id}>{u.label}</option>
            ))}
          </select>
          <label className="p409-radio-lbl">
            <input type="checkbox" checked={attested} onChange={(e) => setAttested(e.target.checked)} />
            Signer authenticated (login/PIN verified on this device)
          </label>
          <div className="p409-sign-actions">
            <button type="button" className="p409-sign-no" onClick={() => { setMode(null); setSelectedId(''); setAttested(false); }}>
              Cancel
            </button>
            <button
              type="button"
              className="p409-sign-yes"
              disabled={busy || !attested || !selectedId}
              onClick={() => onSignOther(selectedId)}
            >
              Authenticate &amp; Sign
            </button>
          </div>
        </div>
      )}
      {error && <div className="p409-sign-error">{error}</div>}
    </div>
  );
}

export default function P409DocumentationSignOff({
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
  const machineModel = session.machine_name || session.machine || patient.machine || '—';
  const bedStr = session.bed || session.bed_number || patient.bed || '—';

  const loggedIn = resolveLoggedInUser();
  const doc = data.documentation || {};
  const priorTech = parseNotes(doc.technician_notes || data.technician_notes || data.technicianNotes);
  const priorNurse = parseNotes(doc.nursing_notes || data.nursing_notes || data.nursingNotes);
  const priorPhys = parseNotes(doc.physician_comments || data.physician_comments || data.physicianComments);

  const [techSummary, setTechSummary] = useState(
    data.techSummary || priorTech.summary || '',
  );
  const [machineIssues, setMachineIssues] = useState(
    data.machineIssues || priorTech.machine_issues || priorTech.machineIssues || 'None',
  );
  const [techActions, setTechActions] = useState(
    data.techActions || priorTech.actions || '',
  );
  const [techComments, setTechComments] = useState(
    data.techComments || priorTech.comments || '',
  );

  const [nurseSummary, setNurseSummary] = useState(
    data.nurseSummary || priorNurse.summary || '',
  );
  const [nurseInterventions, setNurseInterventions] = useState(
    data.nurseInterventions || priorNurse.interventions || '',
  );
  const [eduReinforced, setEduReinforced] = useState(
    data.eduReinforced || priorNurse.education || '',
  );

  const [physicianComments, setPhysicianComments] = useState(
    data.physicianCommentsText || priorPhys.comments || '',
  );
  const [physicianOrders, setPhysicianOrders] = useState(
    data.physicianOrders || priorPhys.orders || '',
  );

  const anyFromDoc = doc.any_incidents != null
    ? (Number(doc.any_incidents) === 1 || doc.any_incidents === true ? 'Yes' : 'No')
    : null;
  const [incidentOccurred, setIncidentOccurred] = useState(
    data.incidentOccurred || anyFromDoc || 'No',
  );
  const [incidentType, setIncidentType] = useState(
    data.incidentType || doc.incident_type || '',
  );
  const [incidentDescription, setIncidentDescription] = useState(
    data.incidentDescription || doc.incident_description || '',
  );
  const [correctiveActions, setCorrectiveActions] = useState(
    data.correctiveActions || doc.corrective_actions || '',
  );
  const [reportedTo, setReportedTo] = useState(
    data.reportedTo != null
      ? String(data.reportedTo)
      : (doc.reported_to != null ? String(doc.reported_to) : ''),
  );

  const seedSignoffs = () => {
    const rows = Array.isArray(data.signoffs) ? data.signoffs : [];
    const map = { technician: null, nurse: null, physician: null };
    rows.forEach((row) => {
      const role = String(row.role || '').toLowerCase() === 'nephrologist'
        ? 'physician'
        : String(row.role || '').toLowerCase();
      if (!map[role]) {
        map[role] = {
          signed: true,
          signedBy: row.signed_by_name || (row.signed_by_user_id ? `User #${row.signed_by_user_id}` : 'Signed'),
          signedByUserId: row.signed_by_user_id,
          isSelf: Number(row.is_self) === 1 || row.is_self === true,
          timestamp: row.authenticated_at || row.timestamp || '',
        };
      }
    });
    return map;
  };

  const [signoffs, setSignoffs] = useState(seedSignoffs);
  const [rosterByRole, setRosterByRole] = useState({ technician: [], nurse: [], physician: [] });
  const [signBusy, setSignBusy] = useState('');
  const [signErrors, setSignErrors] = useState({});
  const [formError, setFormError] = useState('');

  const escalationContacts = Array.isArray(data.escalation_contacts)
    ? data.escalation_contacts
    : [];
  const notification = data.physician_notification || null;
  const notifyItems = Array.isArray(notification?.items) ? notification.items : [];

  useEffect(() => {
    let mounted = true;
    (async () => {
      const next = { technician: [], nurse: [], physician: [] };
      await Promise.all(Object.entries(SIGNOFF_ROLE_QUERIES).map(async ([role, queries]) => {
        const byId = new Map();
        const results = await Promise.all(queries.map((q) => getUsersByRole(q)));
        results.forEach((res) => {
          if (!res?.success) return;
          const raw = res.data?.data || res.data || [];
          const list = Array.isArray(raw) ? raw : (raw?.users || raw?.items || raw?.data || []);
          (list || []).forEach((user) => {
            if (user?.id == null) return;
            byId.set(String(user.id), { id: String(user.id), label: formatStaffLabel(user) });
          });
        });
        next[role] = Array.from(byId.values());
      }));
      if (mounted) setRosterByRole(next);
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    setSignoffs(seedSignoffs());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.signoffs]);

  const updateParentState = (updates) => {
    if (setData) setData((old) => ({ ...old, ...updates }));
  };

  const sectionsDone = useMemo(() => ({
    tech: Boolean(String(techSummary || '').trim()),
    nurse: Boolean(String(nurseSummary || '').trim()),
    physician: Boolean(String(physicianComments || '').trim() || String(physicianOrders || '').trim()),
    incident: incidentOccurred === 'No' || Boolean(String(incidentType || '').trim()),
    signoffs: Boolean(signoffs.technician?.signed && signoffs.nurse?.signed && signoffs.physician?.signed),
  }), [techSummary, nurseSummary, physicianComments, physicianOrders, incidentOccurred, incidentType, signoffs]);

  const completedCount = Object.values(sectionsDone).filter(Boolean).length;
  const statusPct = Math.round((completedCount / 5) * 100);
  const allSigned = sectionsDone.signoffs;
  const canComplete = sectionsDone.tech && sectionsDone.nurse && allSigned;

  const formatTs = (d = new Date()) => {
    try {
      return d.toLocaleString();
    } catch {
      return d.toISOString();
    }
  };

  const persistSignoff = async (role, signedByUserId, isSelf) => {
    setSignBusy(role);
    setSignErrors((prev) => ({ ...prev, [role]: '' }));
    const sessionId = session.id || session.session_id;
    const payload = {
      role,
      signed_by_user_id: Number(signedByUserId) || null,
      is_self: !!isSelf,
      authenticated_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    };
    if (sessionId && sessionId !== 'demo') {
      const result = await saveSessionSignoff(sessionId, payload);
      if (!result?.success) {
        const msg = result?.data?.message || result?.data?.error || 'Sign-off failed';
        setSignErrors((prev) => ({ ...prev, [role]: msg }));
        setSignBusy('');
        return false;
      }
      const checklist = result.data?.data || result.data || {};
      if (checklist.close_checklist_complete != null) {
        updateParentState({
          close_checklist_complete: checklist.close_checklist_complete,
          close_checklist_timestamp: checklist.close_checklist_timestamp,
        });
      }
    }
    const rosterHit = (rosterByRole[role] || []).find((u) => String(u.id) === String(signedByUserId));
    const nextRec = {
      signed: true,
      signedBy: isSelf ? loggedIn.display : (rosterHit?.label || `User #${signedByUserId}`),
      signedByUserId,
      isSelf: !!isSelf,
      timestamp: formatTs(),
    };
    setSignoffs((prev) => {
      const next = { ...prev, [role]: nextRec };
      updateParentState({ signoffsLocal: next });
      return next;
    });
    setSignBusy('');
    return true;
  };

  const handleFormSubmit = async () => {
    setFormError('');
    if (!String(techSummary || '').trim()) {
      setFormError('Technician Session Summary is required.');
      return;
    }
    if (!String(nurseSummary || '').trim()) {
      setFormError('Nursing Summary is required.');
      return;
    }
    if (!allSigned) {
      setFormError('All three roles must authenticate before Complete.');
      return;
    }
    if (incidentOccurred === 'Yes' && !incidentType) {
      setFormError('Incident Type is required when incidents are reported.');
      return;
    }

    const form = {
      techSummary,
      machineIssues,
      techActions,
      techComments,
      nurseSummary,
      nurseInterventions,
      eduReinforced,
      physicianComments,
      physicianOrders,
      incidentOccurred,
      incidentType,
      incidentDescription,
      correctiveActions,
      reportedTo,
    };
    const apiPayload = buildP409ApiPayload(form);
    updateParentState({ ...form, ...apiPayload, signoffs });
    if (onSave) {
      const ok = await onSave(apiPayload);
      if (ok === false) return;
    }
  };

  const handleDraft = () => {
    const form = {
      techSummary,
      machineIssues,
      techActions,
      techComments,
      nurseSummary,
      nurseInterventions,
      eduReinforced,
      physicianComments,
      physicianOrders,
      incidentOccurred,
      incidentType,
      incidentDescription,
      correctiveActions,
      reportedTo,
    };
    const apiPayload = { ...buildP409ApiPayload(form), draft: true };
    updateParentState({ ...form, ...apiPayload, signoffs });
    if (onSaveDraft) onSaveDraft(apiPayload);
  };

  const auditRows = [
    signoffs.technician?.signed && {
      label: `Created / technician signed by ${signoffs.technician.signedBy}`,
      ts: signoffs.technician.timestamp,
    },
    signoffs.nurse?.signed && {
      label: `Nursing notes signed by ${signoffs.nurse.signedBy}`,
      ts: signoffs.nurse.timestamp,
    },
    signoffs.physician?.signed && {
      label: `Physician comments signed by ${signoffs.physician.signedBy}`,
      ts: signoffs.physician.timestamp,
    },
    allSigned && {
      label: 'Documentation sign-offs complete',
      ts: signoffs.physician?.timestamp || signoffs.nurse?.timestamp || signoffs.technician?.timestamp,
    },
  ].filter(Boolean);

  return (
    <div className="p409-page-wrapper">
      <header className="p409-top-bar">
        <div className="p409-top-bar-left">
          <h1>P4-09 – Session Documentation &amp; Sign-off</h1>
          <p>Complete session documentation with notes, incident reporting and electronic sign-off.</p>
        </div>
      </header>

      <nav className="p409-stepper-bar" aria-label="Post-Dialysis 10-Step Progress">
        {SCREENS_STEPPER.map((s, idx) => {
          const isActive = s.step === 9;
          const isCompleted = s.step < 9;
          return (
            <React.Fragment key={s.step}>
              <div className={`p409-stepper-item ${isActive ? 'active' : isCompleted ? 'completed' : ''}`}>
                <div className="p409-stepper-circle">{isCompleted ? '✓' : s.step}</div>
                <span className="p409-stepper-label">{s.label}</span>
              </div>
              {idx < SCREENS_STEPPER.length - 1 && <div className="p409-stepper-line" />}
            </React.Fragment>
          );
        })}
      </nav>

      <div className="p409-patient-header-banner">
        <div className="p409-patient-left">
          <div className="p409-patient-avatar-box">
            {patient.avatarUrl ? (
              <img src={patient.avatarUrl} alt={patientName} />
            ) : (
              <div className="p409-patient-avatar-fallback">{String(patientName).slice(0, 1)}</div>
            )}
          </div>
          <div className="p409-patient-bio">
            <div className="p409-patient-name-row">
              <h2>{patientName}</h2>
              <span className="p409-pill-active">Active</span>
            </div>
            <div className="p409-patient-subrow1">
              <span>PID: <strong>{pid}</strong></span>
              <span className="p409-sep">|</span>
              <span><strong>{ageGender}</strong></span>
              <span className="p409-sep">|</span>
              <span>Blood Group: <strong>{bloodGroup}</strong></span>
            </div>
            <div className="p409-patient-subrow2">
              <span>Access: <strong>{accessDetail}</strong></span>
              <span className="p409-sep">|</span>
              <span>Nephrologist: <strong>{nephrologist}</strong></span>
              <span className="p409-sep">|</span>
              <span>Bed: <strong>{bedStr}</strong></span>
            </div>
          </div>
        </div>

        <div className="p409-patient-stats">
          <div className="p409-stat-box">
            <CalendarTodayOutlinedIcon className="p409-stat-icon" />
            <span className="p409-stat-lbl">Treatment Start</span>
            <strong className="p409-stat-val">{startTimeStr}</strong>
          </div>
          <div className="p409-stat-box">
            <AccessTimeOutlinedIcon className="p409-stat-icon" />
            <span className="p409-stat-lbl">Treatment End</span>
            <strong className="p409-stat-val">{endTimeStr}</strong>
          </div>
          <div className="p409-stat-box">
            <AccessTimeOutlinedIcon className="p409-stat-icon" />
            <span className="p409-stat-lbl">Duration</span>
            <strong className="p409-stat-val">{durationStr}</strong>
          </div>
          <div className="p409-stat-box">
            <WaterDropOutlinedIcon className="p409-stat-icon" />
            <span className="p409-stat-lbl">UF Removed</span>
            <strong className="p409-stat-val">{ufRemovedStr}</strong>
          </div>
          <div className="p409-stat-box">
            <HotelOutlinedIcon className="p409-stat-icon" />
            <span className="p409-stat-lbl">Machine</span>
            <strong className="p409-stat-val">{machineModel}</strong>
          </div>
        </div>
      </div>

      {(formError || apiError) && (
        <div className="during-error" style={{ margin: '0 16px 12px' }}>{formError || apiError}</div>
      )}

      <div className="p409-workspace-grid">
        <div className="p409-main-form-column">
          <div className="p409-top-3col-grid">
            <div className="p409-card">
              <div className="p409-card-title-row">
                <DescriptionOutlinedIcon sx={{ color: '#2563eb', fontSize: 18 }} />
                <h2>1. Technician Notes</h2>
              </div>
              <div className="p409-form-field">
                <div className="p409-notes-label">
                  <label>Session Summary / Observations <span className="p409-req">*</span></label>
                  <span className="p409-char-count">{techSummary.length}/500</span>
                </div>
                <Textarea maxLength={500} value={techSummary} onChange={(e) => setTechSummary(e.target.value)} style={{ minHeight: 65 }} />
              </div>
              <div className="p409-form-field">
                <label>Machine Issues (If any)</label>
                <select value={machineIssues} onChange={(e) => setMachineIssues(e.target.value)}>
                  <option value="None">None</option>
                  <option value="Minor Alarm Resolved">Minor Alarm Resolved</option>
                  <option value="Pressure Fluctuation">Pressure Fluctuation</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="p409-form-field">
                <div className="p409-notes-label"><label>Actions Taken</label><span className="p409-char-count">{techActions.length}/300</span></div>
                <Textarea maxLength={300} placeholder="Enter actions taken..." value={techActions} onChange={(e) => setTechActions(e.target.value)} style={{ minHeight: 40 }} />
              </div>
              <div className="p409-form-field">
                <div className="p409-notes-label"><label>Additional Comments</label><span className="p409-char-count">{techComments.length}/300</span></div>
                <Textarea maxLength={300} placeholder="Enter additional comments..." value={techComments} onChange={(e) => setTechComments(e.target.value)} style={{ minHeight: 40 }} />
              </div>
              <div className="p409-attach-box">
                <label>Attached Files (If any)</label>
                <div className="p409-upload-btn-wrap">
                  <button type="button" className="p409-upload-btn" disabled>
                    <UploadFileOutlinedIcon sx={{ fontSize: 16 }} /> Upload File
                  </button>
                  <span className="p409-upload-hint">JPG, PNG, PDF up to 5 MB</span>
                </div>
              </div>
            </div>

            <div className="p409-mid-col-stack">
              <div className="p409-card">
                <div className="p409-card-title-row">
                  <LocalHospitalOutlinedIcon sx={{ color: '#16a34a', fontSize: 18 }} />
                  <h2>2. Nursing Notes</h2>
                </div>
                <div className="p409-form-field">
                  <div className="p409-notes-label">
                    <label>Nursing Summary <span className="p409-req">*</span></label>
                    <span className="p409-char-count">{nurseSummary.length}/500</span>
                  </div>
                  <Textarea maxLength={500} value={nurseSummary} onChange={(e) => setNurseSummary(e.target.value)} style={{ minHeight: 50 }} />
                </div>
                <div className="p409-form-field">
                  <div className="p409-notes-label"><label>Nursing Interventions</label><span className="p409-char-count">{nurseInterventions.length}/300</span></div>
                  <Textarea maxLength={300} placeholder="Enter nursing interventions..." value={nurseInterventions} onChange={(e) => setNurseInterventions(e.target.value)} style={{ minHeight: 35 }} />
                </div>
                <div className="p409-form-field">
                  <div className="p409-notes-label"><label>Education Reinforced</label><span className="p409-char-count">{eduReinforced.length}/300</span></div>
                  <Textarea maxLength={300} value={eduReinforced} onChange={(e) => setEduReinforced(e.target.value)} style={{ minHeight: 35 }} />
                </div>
              </div>

              <div className="p409-card">
                <div className="p409-card-title-row">
                  <PersonOutlineOutlinedIcon sx={{ color: '#7c3aed', fontSize: 18 }} />
                  <h2>3. Physician / Nephrologist Comments</h2>
                </div>
                <div className="p409-form-field">
                  <div className="p409-notes-label"><label>Physician Comments</label><span className="p409-char-count">{physicianComments.length}/500</span></div>
                  <Textarea maxLength={500} value={physicianComments} onChange={(e) => setPhysicianComments(e.target.value)} style={{ minHeight: 45 }} />
                </div>
                <div className="p409-form-field">
                  <div className="p409-notes-label"><label>Orders / Recommendations</label><span className="p409-char-count">{physicianOrders.length}/300</span></div>
                  <Textarea maxLength={300} value={physicianOrders} onChange={(e) => setPhysicianOrders(e.target.value)} style={{ minHeight: 40 }} />
                </div>
              </div>
            </div>

            <div className="p409-card">
              <div className="p409-card-title-row">
                <WarningAmberOutlinedIcon sx={{ color: '#d97706', fontSize: 18 }} />
                <h2>4. Incident / Variance Documentation</h2>
              </div>
              <div className="p409-form-field">
                <label>Any Incidents During Session?</label>
                <div className="p409-radio-row">
                  <label className="p409-radio-lbl">
                    <input type="radio" name="incident" value="Yes" checked={incidentOccurred === 'Yes'} onChange={() => setIncidentOccurred('Yes')} /> Yes
                  </label>
                  <label className="p409-radio-lbl">
                    <input type="radio" name="incident" value="No" checked={incidentOccurred === 'No'} onChange={() => setIncidentOccurred('No')} /> No
                  </label>
                </div>
              </div>

              {incidentOccurred === 'No' ? (
                <div className="p409-empty-incidents">No incidents reported for this session.</div>
              ) : (
                <>
                  <div className="p409-form-field">
                    <label>Incident Type</label>
                    <select value={incidentType} onChange={(e) => setIncidentType(e.target.value)}>
                      <option value="">Select incident type</option>
                      <option value="Hypotension Event">Hypotension Event</option>
                      <option value="Machine Error">Machine Error</option>
                      <option value="Vascular Access Issue">Vascular Access Issue</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="p409-form-field">
                    <div className="p409-notes-label"><label>Description</label><span className="p409-char-count">{incidentDescription.length}/500</span></div>
                    <Textarea maxLength={500} placeholder="Enter incident details..." value={incidentDescription} onChange={(e) => setIncidentDescription(e.target.value)} style={{ minHeight: 45 }} />
                  </div>
                  <div className="p409-form-field">
                    <div className="p409-notes-label"><label>Corrective Actions Taken</label><span className="p409-char-count">{correctiveActions.length}/300</span></div>
                    <Textarea maxLength={300} placeholder="Enter corrective actions..." value={correctiveActions} onChange={(e) => setCorrectiveActions(e.target.value)} style={{ minHeight: 40 }} />
                  </div>
                  <div className="p409-form-field">
                    <label>Reported To</label>
                    <select value={reportedTo} onChange={(e) => setReportedTo(e.target.value)}>
                      <option value="">Select escalation contact</option>
                      {escalationContacts.map((c) => (
                        <option key={c.id} value={String(c.id)}>{contactLabel(c)}</option>
                      ))}
                    </select>
                    {!escalationContacts.length && (
                      <span className="p409-upload-hint">No escalation contacts configured for this facility.</span>
                    )}
                  </div>
                </>
              )}

              <div className="p409-form-field" style={{ marginTop: 12 }}>
                <label>Session Physician Notification Summary</label>
                {!notifyItems.length ? (
                  <div className="p409-empty-incidents">No physician notification items queued for this session.</div>
                ) : (
                  <div className="p409-notify-list">
                    {notifyItems.map((item) => (
                      <div key={item.id || `${item.severity}-${item.description}`} className={`p409-notify-row ${severityClass(item.severity)}`}>
                        <strong>{String(item.severity || 'notable').toUpperCase()}</strong>
                        <span>{item.description || item.event_type || '—'}</span>
                      </div>
                    ))}
                    {notification?.status && (
                      <div className="p409-upload-hint">Status: {notification.status}{notification.sent_at ? ` · sent ${notification.sent_at}` : ''}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p409-bottom-split">
            <div className="p409-card flex-2">
              <div className="p409-sign-head-row">
                <h2>5. Electronic Sign-off</h2>
                <span className="p409-sign-sub">By signing below, you confirm that all documentation is accurate and complete.</span>
              </div>
              <div className="p409-sign-grid">
                <SignoffCard
                  role="technician"
                  label="Technician Sign-off"
                  loggedIn={loggedIn}
                  record={signoffs.technician}
                  roster={rosterByRole.technician}
                  busy={signBusy === 'technician'}
                  error={signErrors.technician}
                  onSignSelf={() => persistSignoff('technician', loggedIn.id, true)}
                  onSignOther={(id) => persistSignoff('technician', id, false)}
                />
                <SignoffCard
                  role="nurse"
                  label="Nurse Sign-off"
                  loggedIn={loggedIn}
                  record={signoffs.nurse}
                  roster={rosterByRole.nurse}
                  busy={signBusy === 'nurse'}
                  error={signErrors.nurse}
                  onSignSelf={() => persistSignoff('nurse', loggedIn.id, true)}
                  onSignOther={(id) => persistSignoff('nurse', id, false)}
                />
                <SignoffCard
                  role="physician"
                  label="Physician Sign-off"
                  loggedIn={loggedIn}
                  record={signoffs.physician}
                  roster={rosterByRole.physician}
                  busy={signBusy === 'physician'}
                  error={signErrors.physician}
                  onSignSelf={() => persistSignoff('physician', loggedIn.id, true)}
                  onSignOther={(id) => persistSignoff('physician', id, false)}
                />
              </div>
            </div>

            <div className="p409-audit-trail-card flex-1">
              <h3>Session Audit Trail</h3>
              <div className="p409-audit-timeline">
                {!auditRows.length && (
                  <div className="p409-audit-item">
                    <span>No sign-offs captured yet</span>
                    <strong>—</strong>
                  </div>
                )}
                {auditRows.map((row) => (
                  <div className="p409-audit-item" key={`${row.label}-${row.ts}`}>
                    <span>{row.label}</span>
                    <strong>{row.ts || '—'}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p409-right-rail">
          <div className="p409-rail-card">
            <div className="p409-rail-header">
              <h3>Documentation Status</h3>
            </div>
            <div className="p409-compliance-body">
              <div className="p409-donut-wrap">
                <svg viewBox="0 0 100 100" width="84" height="84">
                  <circle cx="50" cy="50" r="40" stroke="#e2e8f0" strokeWidth="12" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={statusPct === 100 ? '#16a34a' : '#2563eb'}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * statusPct) / 100}
                    strokeLinecap="round"
                  />
                  <text x="50" y="55" textAnchor="middle" fontSize="16" fontWeight="800" fill="#0f172a">{statusPct}%</text>
                </svg>
              </div>
              <div className="p409-doc-status-text">
                <strong>{statusPct === 100 ? 'All documentation completed' : `${completedCount}/5 sections complete`}</strong>
              </div>
            </div>
            <div className="p409-doc-checklist">
              <div className="p409-doc-check-row">
                <CheckCircleOutlinedIcon sx={{ color: sectionsDone.tech ? '#16a34a' : '#cbd5e1', fontSize: 16 }} /> Technician Notes
              </div>
              <div className="p409-doc-check-row">
                <CheckCircleOutlinedIcon sx={{ color: sectionsDone.nurse ? '#16a34a' : '#cbd5e1', fontSize: 16 }} /> Nursing Notes
              </div>
              <div className="p409-doc-check-row">
                <CheckCircleOutlinedIcon sx={{ color: sectionsDone.physician ? '#16a34a' : '#cbd5e1', fontSize: 16 }} /> Physician Comments
              </div>
              <div className="p409-doc-check-row">
                <CheckCircleOutlinedIcon sx={{ color: sectionsDone.incident ? '#16a34a' : '#cbd5e1', fontSize: 16 }} /> Incident Documentation
              </div>
              <div className="p409-doc-check-row">
                <CheckCircleOutlinedIcon sx={{ color: sectionsDone.signoffs ? '#16a34a' : '#cbd5e1', fontSize: 16 }} /> Electronic Sign-offs
              </div>
            </div>
          </div>

          <div className="p409-rail-card p409-reminders-card">
            <div className="p409-rail-header">
              <LightbulbOutlinedIcon sx={{ color: '#b45309', fontSize: 18 }} />
              <h3 style={{ color: '#92400e' }}>Key Reminders</h3>
            </div>
            <div className="p409-reminders-checklist">
              <div className="p409-reminder-row"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /><span>Ensure all fields are completed</span></div>
              <div className="p409-reminder-row"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /><span>Report any incidents or variances</span></div>
              <div className="p409-reminder-row"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /><span>Obtain all required sign-offs</span></div>
              <div className="p409-reminder-row"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /><span>Documentation is legally binding</span></div>
              <div className="p409-reminder-row"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /><span>Maintain patient confidentiality</span></div>
              <div className="p409-reminder-row"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /><span>Physician notification sends on complete</span></div>
            </div>
          </div>

          <div className="p409-rail-card">
            <div className="p409-rail-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="p409-quick-flex">
              <button type="button" className="p409-action-btn" disabled>
                <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Preview Documentation</span>
              </button>
              <button type="button" className="p409-action-btn" disabled>
                <PrintOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Print Documentation</span>
              </button>
              <button type="button" className="p409-action-btn" disabled>
                <PictureAsPdfOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Export as PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="p409-footer-bar">
        <div className="p409-footer-left">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowBackOutlinedIcon sx={{ fontSize: 16 }} /> Back
          </Button>
        </div>
        <div className="p409-footer-right">
          <Button type="button" variant="outline" onClick={handleDraft}>
            Save as Draft
          </Button>
          <Button type="button" variant="primary" onClick={handleFormSubmit} disabled={!canComplete}>
            Complete &amp; Proceed to Dashboard <ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />
          </Button>
        </div>
      </footer>
    </div>
  );
}
