import React, { useMemo, useState } from 'react';
import { Button, Textarea } from '../../component-library';

import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import HotelOutlinedIcon from '@mui/icons-material/HotelOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import CleanHandsOutlinedIcon from '@mui/icons-material/CleanHandsOutlined';
import SanitizerOutlinedIcon from '@mui/icons-material/SanitizerOutlined';
import VaccinesOutlinedIcon from '@mui/icons-material/VaccinesOutlined';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import BedOutlinedIcon from '@mui/icons-material/BedOutlined';
import CleaningServicesOutlinedIcon from '@mui/icons-material/CleaningServicesOutlined';
import OpacityOutlinedIcon from '@mui/icons-material/OpacityOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
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

function yn(v, fallback = '') {
  if (v === true || v === 1 || v === '1' || String(v).toLowerCase() === 'yes') return 'Yes';
  if (v === false || v === 0 || v === '0' || String(v).toLowerCase() === 'no') return 'No';
  return v != null && v !== '' ? String(v) : fallback;
}

function isPositiveInfection(raw) {
  const s = String(raw || '').toLowerCase();
  return s.includes('pos') || s === 'reactive' || s === '1' || s === 'true' || s === 'yes';
}

function isIsolationPatient(patient = {}, data = {}) {
  const p = patient.patient || patient;
  const candidates = [
    p.hiv_status, p.hiv, p.hivStatus,
    p.hbsag, p.hbsag_status, p.hepatitis_b, p.hepatitisB, p.hep_b,
    p.infection_status, p.isolation_required,
    data.hiv_status, data.hbsag_status, data.isolation_required,
  ];
  return candidates.some(isPositiveInfection);
}

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

function ToggleYesNo({ value, onChange, dangerYes = false }) {
  return (
    <div className="p407-toggle-pills">
      <button
        type="button"
        className={`p401-pill-btn ${value === 'Yes' ? (dangerYes ? 'active-early' : 'active') : ''}`}
        onClick={() => onChange('Yes')}
      >
        Yes
      </button>
      <button
        type="button"
        className={`p401-pill-btn ${value === 'No' ? (dangerYes ? 'active' : 'active-no') : ''}`}
        onClick={() => onChange('No')}
      >
        No
      </button>
    </div>
  );
}

function sectionComplete(values, { allowEmpty = false } = {}) {
  const answered = values.filter((v) => v === 'Yes' || v === 'No' || v === true || v === false);
  if (!answered.length) return allowEmpty ? 'empty' : 'pending';
  if (answered.some((v) => v === 'No' || v === false)) return 'failed';
  if (answered.length < values.length && !allowEmpty) return 'pending';
  return 'done';
}

export default function P407InfectionControlWaste({
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
  const machineModel = session.machine_name || session.machine || patient.machine || '—';

  const autoIsolation = isIsolationPatient(patient, data);
  const priorSections = data.sections || {};
  const priorIsolation = data.isolation || data.isolationCompliance || {};
  const loggedIn = resolveLoggedInUser();

  const [glovesRemoved, setGlovesRemoved] = useState(yn(data.glovesRemoved ?? priorSections.ppe?.glovesRemoved));
  const [gownRemoved, setGownRemoved] = useState(yn(data.gownRemoved ?? priorSections.ppe?.gownRemoved));
  const [maskRemoved, setMaskRemoved] = useState(yn(data.maskRemoved ?? priorSections.ppe?.maskRemoved));
  const [eyeProtRemoved, setEyeProtRemoved] = useState(yn(data.eyeProtRemoved ?? priorSections.ppe?.eyeProtRemoved));
  const [ppeHandHygiene, setPpeHandHygiene] = useState(yn(data.ppeHandHygiene ?? priorSections.ppe?.ppeHandHygiene));
  const [ppeComments, setPpeComments] = useState(data.ppeComments || priorSections.ppe?.comments || '');

  const [hhPerformed, setHhPerformed] = useState(yn(data.hhPerformed ?? priorSections.hand_hygiene?.hhPerformed ?? priorSections.handHygiene?.hhPerformed));
  const [hhMethod, setHhMethod] = useState(data.hhMethod || priorSections.hand_hygiene?.hhMethod || priorSections.handHygiene?.hhMethod || '');
  const [hhComments, setHhComments] = useState(data.hhComments || priorSections.hand_hygiene?.comments || '');

  const [needlesInSharps, setNeedlesInSharps] = useState(yn(data.needlesInSharps ?? priorSections.sharps_disposal?.needlesInSharps ?? priorSections.sharpsDisposal?.needlesInSharps));
  const [sharpsSealed, setSharpsSealed] = useState(yn(data.sharpsSealed ?? priorSections.sharps_disposal?.sharpsSealed));
  const [sharpsFillLevel, setSharpsFillLevel] = useState(data.sharpsFillLevel || priorSections.sharps_disposal?.sharpsFillLevel || '');
  const [sharpsComments, setSharpsComments] = useState(data.sharpsComments || '');

  const [yellowBag, setYellowBag] = useState(yn(data.yellowBag ?? priorSections.biomedical_waste?.yellowBag));
  const [redBag, setRedBag] = useState(yn(data.redBag ?? priorSections.biomedical_waste?.redBag));
  const [blueBag, setBlueBag] = useState(yn(data.blueBag ?? priorSections.biomedical_waste?.blueBag));
  const [blackBag, setBlackBag] = useState(yn(data.blackBag ?? priorSections.biomedical_waste?.blackBag));
  const [wasteComments, setWasteComments] = useState(data.wasteComments || '');

  const [linenBagged, setLinenBagged] = useState(yn(data.linenBagged ?? priorSections.linen_disposal?.linenBagged));
  const [linenLaundry, setLinenLaundry] = useState(yn(data.linenLaundry ?? priorSections.linen_disposal?.linenLaundry));
  const [linenBagSealed, setLinenBagSealed] = useState(yn(data.linenBagSealed ?? priorSections.linen_disposal?.linenBagSealed));
  const [linenComments, setLinenComments] = useState(data.linenComments || '');

  const [envExterior, setEnvExterior] = useState(yn(data.envExterior ?? priorSections.environmental_cleaning?.envExterior));
  const [envTouchpoints, setEnvTouchpoints] = useState(yn(data.envTouchpoints ?? priorSections.environmental_cleaning?.envTouchpoints));
  const [envBedChair, setEnvBedChair] = useState(yn(data.envBedChair ?? priorSections.environmental_cleaning?.envBedChair));
  const [envSideRails, setEnvSideRails] = useState(yn(data.envSideRails ?? priorSections.environmental_cleaning?.envSideRails));
  const [envFloor, setEnvFloor] = useState(yn(data.envFloor ?? priorSections.environmental_cleaning?.envFloor));
  const [envComments, setEnvComments] = useState(data.envComments || '');

  const [spillOccurred, setSpillOccurred] = useState(yn(data.spillOccurred ?? priorSections.spill_management?.spillOccurred, 'No'));
  const [spillComments, setSpillComments] = useState(data.spillComments || '');

  const [isolationRequired, setIsolationRequired] = useState(
    autoIsolation ? 'Yes' : yn(data.isolationRequired ?? priorIsolation.isolation_required ?? priorIsolation.isolationRequired, 'No'),
  );
  const [dedicatedEquipment, setDedicatedEquipment] = useState(
    yn(data.dedicatedEquipment ?? priorIsolation.dedicated_equipment ?? priorIsolation.dedicatedEquipment),
  );
  const [wasteSegregatedIsolation, setWasteSegregatedIsolation] = useState(
    yn(data.wasteSegregatedIsolation ?? priorIsolation.waste_segregated_isolation),
  );
  const [noCrossUse, setNoCrossUse] = useState(
    yn(data.noCrossUse ?? priorIsolation.no_cross_use ?? priorIsolation.noCrossUse),
  );
  const [isolationComments, setIsolationComments] = useState(
    data.isolationComments || priorIsolation.comments || '',
  );

  const [formError, setFormError] = useState('');

  const updateParentState = (updates) => {
    if (setData) setData((old) => ({ ...old, ...updates }));
  };

  const sectionStatuses = useMemo(() => {
    const isolationActive = isolationRequired === 'Yes';
    return {
      ppe: sectionComplete([glovesRemoved, gownRemoved, maskRemoved, eyeProtRemoved, ppeHandHygiene], { allowEmpty: true }),
      handHygiene: sectionComplete([hhPerformed]),
      sharps: sectionComplete([needlesInSharps, sharpsSealed]),
      waste: sectionComplete([yellowBag, redBag, blueBag, blackBag], { allowEmpty: true }),
      linen: sectionComplete([linenBagged, linenLaundry, linenBagSealed], { allowEmpty: true }),
      env: sectionComplete([envExterior, envTouchpoints, envBedChair, envSideRails, envFloor], { allowEmpty: true }),
      spill: spillOccurred === 'No' ? 'done' : sectionComplete([spillOccurred]),
      isolation: isolationActive
        ? sectionComplete([dedicatedEquipment, wasteSegregatedIsolation, noCrossUse])
        : 'done',
    };
  }, [
    glovesRemoved, gownRemoved, maskRemoved, eyeProtRemoved, ppeHandHygiene,
    hhPerformed, needlesInSharps, sharpsSealed,
    yellowBag, redBag, blueBag, blackBag,
    linenBagged, linenLaundry, linenBagSealed,
    envExterior, envTouchpoints, envBedChair, envSideRails, envFloor,
    spillOccurred, isolationRequired, dedicatedEquipment, wasteSegregatedIsolation, noCrossUse,
  ]);

  const compliance = useMemo(() => {
    const statuses = Object.values(sectionStatuses);
    const done = statuses.filter((s) => s === 'done').length;
    const failed = statuses.filter((s) => s === 'failed').length;
    const pending = statuses.filter((s) => s === 'pending' || s === 'empty').length;
    const total = statuses.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    return { done, failed, pending, total, pct };
  }, [sectionStatuses]);

  const checklistComplete = compliance.done === compliance.total && compliance.failed === 0;

  const buildPayload = () => {
    const sections = {
      ppe: {
        glovesRemoved, gownRemoved, maskRemoved, eyeProtRemoved, ppeHandHygiene, comments: ppeComments,
      },
      handHygiene: { hhPerformed, hhMethod, comments: hhComments },
      hand_hygiene: { hhPerformed, hhMethod, comments: hhComments },
      sharpsDisposal: { needlesInSharps, sharpsSealed, sharpsFillLevel, comments: sharpsComments },
      sharps_disposal: { needlesInSharps, sharpsSealed, sharpsFillLevel, comments: sharpsComments },
      biomedicalWaste: { yellowBag, redBag, blueBag, blackBag, comments: wasteComments },
      biomedical_waste: { yellowBag, redBag, blueBag, blackBag, comments: wasteComments },
      linenDisposal: { linenBagged, linenLaundry, linenBagSealed, comments: linenComments },
      linen_disposal: { linenBagged, linenLaundry, linenBagSealed, comments: linenComments },
      environmentalCleaning: { envExterior, envTouchpoints, envBedChair, envSideRails, envFloor, comments: envComments },
      environmental_cleaning: { envExterior, envTouchpoints, envBedChair, envSideRails, envFloor, comments: envComments },
      spillManagement: { spillOccurred, comments: spillComments },
      spill_management: { spillOccurred, comments: spillComments },
    };
    const isolation = {
      isolation_required: isolationRequired === 'Yes',
      isolationRequired,
      dedicated_equipment: dedicatedEquipment || null,
      dedicatedEquipment: dedicatedEquipment || null,
      waste_segregated_isolation: wasteSegregatedIsolation || null,
      wasteSegregatedIsolation: wasteSegregatedIsolation || null,
      no_cross_use: noCrossUse || null,
      noCrossUse: noCrossUse || null,
      comments: isolationComments || null,
    };
    return {
      sections,
      isolation,
      isolationCompliance: isolation,
      compliance_pct: compliance.pct,
      completedAt: new Date().toISOString(),
      completedBy: loggedIn.display,
    };
  };

  const handleFormSubmit = async () => {
    setFormError('');
    if (hhPerformed !== 'Yes') {
      setFormError('Hand Hygiene is critical — mark Hand Hygiene Performed = Yes before continuing.');
      return;
    }
    if (needlesInSharps !== 'Yes' || sharpsSealed !== 'Yes') {
      setFormError('Sharps Disposal is critical — needles disposed and container sealed must be Yes.');
      return;
    }
    if (isolationRequired === 'Yes') {
      if ([dedicatedEquipment, wasteSegregatedIsolation, noCrossUse].some((v) => v !== 'Yes')) {
        setFormError('Isolation Compliance requires all three confirmations = Yes (Safety Protocol §4).');
        return;
      }
    }
    if (spillOccurred === 'Yes' && !String(spillComments || '').trim()) {
      setFormError('Spill comments are required when a spill occurred.');
      return;
    }

    const payload = buildPayload();
    updateParentState(payload);
    if (onSave) {
      const ok = await onSave(payload);
      if (ok === false) return;
    }
  };

  const donutOffset = 251.2 - (251.2 * compliance.pct) / 100;

  return (
    <div className="p407-page-wrapper">
      <header className="p407-top-bar">
        <div className="p407-top-bar-left">
          <h1>P4-07 – Infection Control &amp; Waste Disposal</h1>
          <p>Ensure all infection control practices followed and waste disposed as per protocol.</p>
        </div>
      </header>

      <nav className="p407-stepper-bar" aria-label="Post-Dialysis 10-Step Progress">
        {SCREENS_STEPPER.map((s, idx) => {
          const isActive = s.step === 7;
          const isCompleted = s.step < 7;
          return (
            <React.Fragment key={s.step}>
              <div className={`p407-stepper-item ${isActive ? 'active' : isCompleted ? 'completed' : ''}`}>
                <div className="p407-stepper-circle">{isCompleted ? '✓' : s.step}</div>
                <span className="p407-stepper-label">{s.label}</span>
              </div>
              {idx < SCREENS_STEPPER.length - 1 && <div className="p407-stepper-line" />}
            </React.Fragment>
          );
        })}
      </nav>

      <div className="p407-patient-header-banner">
        <div className="p407-patient-left">
          <div className="p407-patient-avatar-box">
            {patient.avatarUrl ? (
              <img src={patient.avatarUrl} alt={patientName} />
            ) : (
              <div className="p407-patient-avatar-fallback" aria-hidden="true">
                {(patientName || '?').slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="p407-patient-bio">
            <div className="p407-patient-name-row">
              <h2>{patientName}</h2>
              <span className="p407-pill-active">Active</span>
            </div>
            <div className="p407-patient-subrow1">
              <span>PID: <strong>{pid}</strong></span>
              <span className="p407-sep">|</span>
              <span><strong>{ageGender}</strong></span>
              <span className="p407-sep">|</span>
              <span>Blood Group: <strong>{bloodGroup}</strong></span>
            </div>
            <div className="p407-patient-subrow2">
              <span>Access: <strong>{accessDetail}</strong></span>
              <span className="p407-sep">|</span>
              <span>Nephrologist: <strong>{nephrologist}</strong></span>
            </div>
          </div>
        </div>
        <div className="p407-patient-stats">
          <div className="p407-stat-box">
            <CalendarTodayOutlinedIcon className="p407-stat-icon" />
            <span className="p407-stat-lbl">Treatment Start</span>
            <strong className="p407-stat-val">{startTimeStr}</strong>
          </div>
          <div className="p407-stat-box">
            <AccessTimeOutlinedIcon className="p407-stat-icon" />
            <span className="p407-stat-lbl">Treatment End</span>
            <strong className="p407-stat-val">{endTimeStr}</strong>
          </div>
          <div className="p407-stat-box">
            <AccessTimeOutlinedIcon className="p407-stat-icon" />
            <span className="p407-stat-lbl">Duration</span>
            <strong className="p407-stat-val">{durationStr}</strong>
          </div>
          <div className="p407-stat-box">
            <WaterDropOutlinedIcon className="p407-stat-icon" />
            <span className="p407-stat-lbl">UF Removed</span>
            <strong className="p407-stat-val">{ufRemovedStr}</strong>
          </div>
          <div className="p407-stat-box">
            <HotelOutlinedIcon className="p407-stat-icon" />
            <span className="p407-stat-lbl">Machine / Bed</span>
            <strong className="p407-stat-val">{machineModel} / {bedStr}</strong>
          </div>
        </div>
      </div>

      {isolationRequired === 'Yes' && (
        <div className="during-error" style={{ margin: '0 16px 12px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <WarningAmberOutlinedIcon sx={{ fontSize: 18 }} />
          <span>
            Isolation patient — segregate and tag this session&apos;s biomedical waste distinctly.
            Use isolation-zone disposal containers only.
            {autoIsolation ? ' (Auto-set from HIV+/HBsAg+ status.)' : ''}
          </span>
        </div>
      )}

      <div className="p407-workspace-grid">
        <div className="p407-main-form-column">
          <div className="p407-cards-4col-grid">
            <div className="p407-card">
              <div className="p407-card-head theme-blue">
                <SanitizerOutlinedIcon sx={{ fontSize: 18, color: '#1d4ed8' }} />
                <h2>1. Personal Protective Equipment (PPE)</h2>
              </div>
              <div className="p407-checklist">
                {[
                  ['Gloves removed', glovesRemoved, setGlovesRemoved],
                  ['Gown removed', gownRemoved, setGownRemoved],
                  ['Mask removed', maskRemoved, setMaskRemoved],
                  ['Eye protection removed', eyeProtRemoved, setEyeProtRemoved],
                  ['Hand hygiene performed', ppeHandHygiene, setPpeHandHygiene],
                ].map(([label, value, setter]) => (
                  <div className="p407-check-row" key={label}>
                    <span className="p407-check-lbl">{label}</span>
                    <ToggleYesNo value={value} onChange={setter} />
                  </div>
                ))}
              </div>
              <div className="p407-form-field">
                <div className="p407-notes-label"><label>Comments</label><span className="p407-char-count">{ppeComments.length}/200</span></div>
                <Textarea maxLength={200} value={ppeComments} onChange={(e) => setPpeComments(e.target.value)} style={{ minHeight: 40 }} />
              </div>
            </div>

            <div className="p407-card">
              <div className="p407-card-head theme-green">
                <CleanHandsOutlinedIcon sx={{ fontSize: 18, color: '#15803d' }} />
                <h2>2. Hand Hygiene *</h2>
              </div>
              <div className="p407-checklist">
                <div className="p407-check-row">
                  <span className="p407-check-lbl">Hand hygiene performed after patient care</span>
                  <ToggleYesNo value={hhPerformed} onChange={setHhPerformed} />
                </div>
              </div>
              <div className="p407-form-field">
                <label>Method Used</label>
                <select value={hhMethod} onChange={(e) => setHhMethod(e.target.value)}>
                  <option value="">Select method</option>
                  <option value="Alcohol Based Hand Rub">Alcohol Based Hand Rub</option>
                  <option value="Soap and Water">Soap and Water</option>
                </select>
              </div>
              <div className="p407-form-field">
                <div className="p407-notes-label"><label>Comments</label><span className="p407-char-count">{hhComments.length}/200</span></div>
                <Textarea maxLength={200} value={hhComments} onChange={(e) => setHhComments(e.target.value)} style={{ minHeight: 40 }} />
              </div>
            </div>

            <div className="p407-card">
              <div className="p407-card-head theme-red">
                <VaccinesOutlinedIcon sx={{ fontSize: 18, color: '#b91c1c' }} />
                <h2>3. Sharps Disposal *</h2>
              </div>
              <div className="p407-checklist">
                <div className="p407-check-row">
                  <span className="p407-check-lbl">Needles disposed in sharps container</span>
                  <ToggleYesNo value={needlesInSharps} onChange={setNeedlesInSharps} />
                </div>
                <div className="p407-check-row">
                  <span className="p407-check-lbl">Sharps container sealed</span>
                  <ToggleYesNo value={sharpsSealed} onChange={setSharpsSealed} />
                </div>
              </div>
              <div className="p407-form-field">
                <label>Fill Level of Sharps Container</label>
                <select value={sharpsFillLevel} onChange={(e) => setSharpsFillLevel(e.target.value)}>
                  <option value="">Select fill level</option>
                  <option value="< 3/4 Full">&lt; 3/4 Full</option>
                  <option value="Full (Replaced)">Full (Replaced)</option>
                  <option value="Half Full">Half Full</option>
                </select>
              </div>
              <div className="p407-form-field">
                <div className="p407-notes-label"><label>Comments</label><span className="p407-char-count">{sharpsComments.length}/200</span></div>
                <Textarea maxLength={200} value={sharpsComments} onChange={(e) => setSharpsComments(e.target.value)} style={{ minHeight: 40 }} />
              </div>
            </div>

            <div className="p407-card">
              <div className="p407-card-head theme-gold">
                <DeleteSweepOutlinedIcon sx={{ fontSize: 18, color: '#b45309' }} />
                <h2>4. Biomedical Waste Segregation</h2>
              </div>
              <div className="p407-checklist">
                {[
                  ['Infectious waste in yellow bag', yellowBag, setYellowBag],
                  ['Soiled items in red bag', redBag, setRedBag],
                  ['Recyclable waste in blue bag', blueBag, setBlueBag],
                  ['General waste in black bag', blackBag, setBlackBag],
                ].map(([label, value, setter]) => (
                  <div className="p407-check-row" key={label}>
                    <span className="p407-check-lbl">{label}</span>
                    <ToggleYesNo value={value} onChange={setter} />
                  </div>
                ))}
              </div>
              <div className="p407-form-field">
                <div className="p407-notes-label"><label>Comments</label><span className="p407-char-count">{wasteComments.length}/200</span></div>
                <Textarea maxLength={200} value={wasteComments} onChange={(e) => setWasteComments(e.target.value)} style={{ minHeight: 40 }} />
              </div>
            </div>
          </div>

          <div className="p407-cards-4col-grid">
            <div className="p407-card">
              <div className="p407-card-head theme-green">
                <BedOutlinedIcon sx={{ fontSize: 18, color: '#15803d' }} />
                <h2>5. Linen Disposal</h2>
              </div>
              <div className="p407-checklist">
                {[
                  ['Soiled linen bagged', linenBagged, setLinenBagged],
                  ['Linen sent to laundry', linenLaundry, setLinenLaundry],
                  ['Bag sealed', linenBagSealed, setLinenBagSealed],
                ].map(([label, value, setter]) => (
                  <div className="p407-check-row" key={label}>
                    <span className="p407-check-lbl">{label}</span>
                    <ToggleYesNo value={value} onChange={setter} />
                  </div>
                ))}
              </div>
              <div className="p407-form-field">
                <div className="p407-notes-label"><label>Comments</label><span className="p407-char-count">{linenComments.length}/200</span></div>
                <Textarea maxLength={200} value={linenComments} onChange={(e) => setLinenComments(e.target.value)} style={{ minHeight: 40 }} />
              </div>
            </div>

            <div className="p407-card">
              <div className="p407-card-head theme-teal">
                <CleaningServicesOutlinedIcon sx={{ fontSize: 18, color: '#0f766e' }} />
                <h2>6. Environmental Cleaning</h2>
              </div>
              <div className="p407-checklist">
                {[
                  ['Machine exterior cleaned', envExterior, setEnvExterior],
                  ['Monitor & touch points cleaned', envTouchpoints, setEnvTouchpoints],
                  ['Bed / Chair cleaned', envBedChair, setEnvBedChair],
                  ['Side rails cleaned', envSideRails, setEnvSideRails],
                  ['Floor cleaned', envFloor, setEnvFloor],
                ].map(([label, value, setter]) => (
                  <div className="p407-check-row" key={label}>
                    <span className="p407-check-lbl">{label}</span>
                    <ToggleYesNo value={value} onChange={setter} />
                  </div>
                ))}
              </div>
              <div className="p407-form-field">
                <div className="p407-notes-label"><label>Comments</label><span className="p407-char-count">{envComments.length}/200</span></div>
                <Textarea maxLength={200} value={envComments} onChange={(e) => setEnvComments(e.target.value)} style={{ minHeight: 40 }} />
              </div>
            </div>

            <div className="p407-card">
              <div className="p407-card-head theme-amber">
                <OpacityOutlinedIcon sx={{ fontSize: 18, color: '#c2410c' }} />
                <h2>7. Spill Management (If any)</h2>
              </div>
              <div className="p407-checklist">
                <div className="p407-check-row">
                  <span className="p407-check-lbl">Spill Occurred</span>
                  <ToggleYesNo value={spillOccurred} onChange={setSpillOccurred} dangerYes />
                </div>
              </div>
              {spillOccurred !== 'Yes' ? (
                <div className="p407-info-box-sm">No spill reported during this session.</div>
              ) : (
                <div className="during-error" style={{ marginBottom: 8 }}>Document spill details in comments.</div>
              )}
              <div className="p407-form-field">
                <div className="p407-notes-label"><label>Comments</label><span className="p407-char-count">{spillComments.length}/200</span></div>
                <Textarea maxLength={200} value={spillComments} onChange={(e) => setSpillComments(e.target.value)} style={{ minHeight: 40 }} />
              </div>
            </div>

            <div className={`p407-card ${isolationRequired === 'Yes' ? 'p405-card-missed' : ''}`}>
              <div className="p407-card-head theme-blue">
                <ShieldOutlinedIcon sx={{ fontSize: 18, color: '#1d4ed8' }} />
                <h2>8. Isolation Compliance {isolationRequired === 'Yes' ? '*' : ''}</h2>
              </div>
              <div className="p407-checklist">
                <div className="p407-check-row">
                  <span className="p407-check-lbl">Isolation Required</span>
                  <ToggleYesNo
                    value={isolationRequired}
                    onChange={(v) => {
                      if (autoIsolation && v === 'No') return;
                      setIsolationRequired(v);
                      updateParentState({ isolationRequired: v });
                    }}
                    dangerYes
                  />
                </div>
                {isolationRequired === 'Yes' && (
                  <>
                    <div className="p407-check-row">
                      <span className="p407-check-lbl">Dedicated equipment used only</span>
                      <ToggleYesNo value={dedicatedEquipment} onChange={setDedicatedEquipment} />
                    </div>
                    <div className="p407-check-row">
                      <span className="p407-check-lbl">Waste segregated to isolation-zone containers</span>
                      <ToggleYesNo value={wasteSegregatedIsolation} onChange={setWasteSegregatedIsolation} />
                    </div>
                    <div className="p407-check-row">
                      <span className="p407-check-lbl">No cross-use with general floor confirmed</span>
                      <ToggleYesNo value={noCrossUse} onChange={setNoCrossUse} />
                    </div>
                  </>
                )}
              </div>
              {isolationRequired !== 'Yes' ? (
                <div className="p407-info-box-sm">No isolation precautions required.</div>
              ) : (
                <div className="during-error" style={{ marginBottom: 8 }}>
                  Any No on the isolation sub-checklist is a Critical hard block (Safety Protocol §4).
                </div>
              )}
              <div className="p407-form-field">
                <div className="p407-notes-label"><label>Comments</label><span className="p407-char-count">{isolationComments.length}/200</span></div>
                <Textarea maxLength={200} value={isolationComments} onChange={(e) => setIsolationComments(e.target.value)} style={{ minHeight: 40 }} />
              </div>
            </div>
          </div>

          <div className="p407-completion-banner-card">
            <div className="p407-banner-left">
              <div className="p407-banner-icon-wrap">
                {checklistComplete ? (
                  <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 22 }} />
                ) : (
                  <WarningAmberOutlinedIcon sx={{ color: '#b45309', fontSize: 22 }} />
                )}
              </div>
              <div className="p407-banner-text">
                <strong>
                  {checklistComplete
                    ? 'Infection Control Checklist Completed'
                    : 'Infection Control Checklist Incomplete'}
                </strong>
                <span>
                  {checklistComplete
                    ? 'All required infection control and waste disposal steps have been documented.'
                    : 'Complete critical items (Hand Hygiene, Sharps, Isolation when applicable) before continuing.'}
                </span>
              </div>
            </div>
            <div className="p407-banner-meta">
              <div className="p407-meta-item">
                <span>Completed At</span>
                <strong>{checklistComplete ? new Date().toLocaleString() : '—'}</strong>
              </div>
              <div className="p407-meta-item">
                <span>Completed By</span>
                <strong>{loggedIn.display}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="p407-right-rail">
          <div className="p407-rail-card">
            <div className="p407-rail-header"><h3>Compliance Overview</h3></div>
            <div className="p407-compliance-body">
              <div className="p407-donut-wrap">
                <svg viewBox="0 0 100 100" width="84" height="84">
                  <circle cx="50" cy="50" r="40" stroke="#e2e8f0" strokeWidth="12" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={compliance.failed ? '#dc2626' : '#16a34a'}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray="251.2"
                    strokeDashoffset={donutOffset}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                  <text x="50" y="55" textAnchor="middle" fontSize="16" fontWeight="800" fill="#0f172a">{compliance.pct}%</text>
                </svg>
              </div>
              <div className="p407-compliance-legend">
                <div className="p407-comp-row"><span className="p407-dot-green" /> Completed <strong>{compliance.done} / {compliance.total}</strong></div>
                <div className="p407-comp-row"><span className="p407-dot-amber" /> Pending <strong>{compliance.pending} / {compliance.total}</strong></div>
                <div className="p407-comp-row"><span className="p407-dot-red" /> Not Completed <strong>{compliance.failed} / {compliance.total}</strong></div>
              </div>
            </div>
          </div>

          <div className="p407-rail-card p407-reminders-card">
            <div className="p407-rail-header">
              <LightbulbOutlinedIcon sx={{ color: '#b45309', fontSize: 18 }} />
              <h3 style={{ color: '#92400e' }}>Key Reminders</h3>
            </div>
            <div className="p407-reminders-checklist">
              <div className="p407-reminder-row"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /><span>Always perform hand hygiene</span></div>
              <div className="p407-reminder-row"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /><span>Dispose sharps immediately</span></div>
              <div className="p407-reminder-row"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /><span>Segregate waste correctly</span></div>
              <div className="p407-reminder-row"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /><span>Clean all equipment &amp; surfaces</span></div>
              <div className="p407-reminder-row"><CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} /><span>Document any incidents/spills</span></div>
              {isolationRequired === 'Yes' && (
                <div className="p407-reminder-row"><WarningAmberOutlinedIcon sx={{ color: '#d97706', fontSize: 16 }} /><span>Complete isolation-zone confirmations</span></div>
              )}
            </div>
          </div>

          <div className="p407-rail-card">
            <div className="p407-rail-header"><h3>Quick Actions</h3></div>
            <div className="p407-quick-flex">
              <button type="button" className="p407-action-btn" disabled>
                <ReportProblemOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Report Incident</span>
              </button>
              <button type="button" className="p407-action-btn" disabled>
                <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />
                <span>View Infection Control SOP</span>
              </button>
              <button type="button" className="p407-action-btn" disabled>
                <PrintOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Print Checklist</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="p407-footer-bar">
        <div className="p407-footer-left">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowBackOutlinedIcon sx={{ fontSize: 16 }} /> Back
          </Button>
        </div>
        <div className="p407-footer-right">
          {(formError || apiError) && (
            <div className="during-error" style={{ marginRight: 12 }}>{formError || apiError}</div>
          )}
          <Button type="button" variant="outline" onClick={onSaveDraft}>Save as Draft</Button>
          <Button type="button" variant="primary" onClick={handleFormSubmit}>
            Save &amp; Continue <ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />
          </Button>
        </div>
      </footer>
    </div>
  );
}
