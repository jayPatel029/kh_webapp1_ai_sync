import React, { useMemo, useState } from 'react';
import { Button, Input, Textarea } from '../../component-library';
import { calculateKtV } from '../../ApiCalls/postDialysisApis';

import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import HotelOutlinedIcon from '@mui/icons-material/HotelOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import ElectricBoltOutlinedIcon from '@mui/icons-material/ElectricBoltOutlined';
import WavesOutlinedIcon from '@mui/icons-material/WavesOutlined';
import BloodtypeOutlinedIcon from '@mui/icons-material/BloodtypeOutlined';
import VaccinesOutlinedIcon from '@mui/icons-material/VaccinesOutlined';
import ThermostatOutlinedIcon from '@mui/icons-material/ThermostatOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
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

const ROW_ICONS = {
  duration: AccessTimeOutlinedIcon,
  uf: WaterDropOutlinedIcon,
  bfr: ElectricBoltOutlinedIcon,
  dfr: WavesOutlinedIcon,
  bvp: BloodtypeOutlinedIcon,
  heparin: VaccinesOutlinedIcon,
  temp: ThermostatOutlinedIcon,
  dialysate: ScienceOutlinedIcon,
};

const DEVIATIONS_LIST = [
  { id: 'hypotension', label: 'Hypotension' },
  { id: 'cramps', label: 'Muscle cramps' },
  { id: 'access', label: 'Access issues' },
  { id: 'nausea', label: 'Nausea / Vomiting' },
  { id: 'early_term', label: 'Early termination' },
  { id: 'other', label: 'Other' },
];

function num(v) {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parseDurationMins(raw) {
  if (raw === undefined || raw === null || raw === '') return null;
  if (Number.isFinite(Number(raw)) && !String(raw).includes(':')) return Number(raw);
  const m = String(raw).match(/(-?\d+)\s*:\s*(\d+)/);
  if (!m) return null;
  const sign = String(raw).trim().startsWith('-') ? -1 : 1;
  return sign * (Math.abs(Number(m[1])) * 60 + Number(m[2]));
}

function minsToHrLabel(mins) {
  if (!Number.isFinite(mins)) return null;
  const h = Math.floor(Math.abs(mins) / 60);
  const m = Math.round(Math.abs(mins) % 60);
  const sign = mins < 0 ? '-' : '';
  return `${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} hr`;
}

function litersFromMlOrL(raw, mlThreshold = 50) {
  const n = num(raw);
  if (n == null) return null;
  return n > mlThreshold ? n / 1000 : n;
}

function fmtNum(n, digits, unit) {
  if (n == null || !Number.isFinite(n)) return null;
  const s = Number(n).toFixed(digits);
  return unit ? `${s} ${unit}` : s;
}

function varianceStatus(rx, del, { pctTolerance = 10, categorical = false } = {}) {
  if (categorical) {
    if (rx == null || del == null) return { varStr: '—', varPct: '—', status: '—' };
    const same = String(rx).trim().toLowerCase() === String(del).trim().toLowerCase();
    return { varStr: '—', varPct: '—', status: same ? 'Achieved' : 'Below Target' };
  }
  if (rx == null || del == null || !Number.isFinite(rx) || !Number.isFinite(del) || rx === 0) {
    return { varStr: '—', varPct: '—', status: '—' };
  }
  const diff = del - rx;
  const pct = (diff / Math.abs(rx)) * 100;
  return {
    diff,
    pct,
    varPct: `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`,
    status: Math.abs(pct) <= pctTolerance ? 'Achieved' : 'Below Target',
  };
}

function buildComparisonRows(session = {}, data = {}) {
  const fromApi = data.comparison || data.prescribed_vs_delivered || data.prescribedVsDelivered;
  if (Array.isArray(fromApi) && fromApi.length) {
    return fromApi.map((r) => ({
      id: r.id || String(r.parameter || r.param || '').toLowerCase().replace(/\s+/g, '_'),
      param: r.parameter || r.param,
      rx: r.prescribed || r.rx || '—',
      del: r.delivered || r.del || '—',
      varStr: r.variance || r.varStr || '—',
      varPct: r.variance_pct || r.variancePct || r.varPct || '—',
      status: r.status || '—',
    }));
  }

  const dash = session.dashboard || {};
  const settings = dash.settings || {};
  const term = data.termination || {};

  const rxDurationMins =
    num(session.prescribed_duration_mins) ??
    parseDurationMins(data.prescribedDuration) ??
    240;
  const delDurationMins =
    num(term.duration_mins) ??
    parseDurationMins(data.treatmentDuration || session.treatmentDuration || session.duration) ??
    null;

  const rxUfL = litersFromMlOrL(session.uf_goal_ml ?? session.uf_goal ?? data.ufGoal);
  const delUfL = litersFromMlOrL(
    data.totalUfRemoved ?? term.total_uf_removed ?? session.total_uf_removed ?? session.uf_removed,
  );

  const rxBfr = num(session.prescribed_bfr) ?? num(settings.bfr_ml_min) ?? num(session.bfr);
  const delBfr = num(data.bfrDelivered) ?? num(session.bfr) ?? num(dash.bfr);

  const rxDfr = num(session.prescribed_dfr) ?? num(settings.dfr_ml_min) ?? num(session.dfr);
  const delDfr = num(data.dfrDelivered) ?? num(session.dfr) ?? num(dash.dfr);

  const rxBvpL = rxBfr != null && rxDurationMins != null ? (rxBfr * rxDurationMins) / 1000 : null;
  const delBvpL = litersFromMlOrL(
    data.bloodVolumeProcessed ?? term.blood_volume_processed ?? session.blood_volume_processed,
    500,
  );

  const rxHeparin = num(session.heparin_bolus_iu) ?? num(data.prescribedHeparin);
  const delHeparin = num(data.heparinUsed) ?? num(term.heparin_used) ?? num(session.heparin_used);

  const rxTemp = num(session.dialysate_temp) ?? num(settings.dialysate_temp) ?? 36.5;
  const delTemp = num(data.dialysateTemp) ?? num(dash.latest_machine?.dialysate_temp) ?? rxTemp;

  const rxDialysate = session.dialysate_type || session.dialysate || 'Standard Bicarbonate';
  const delDialysate = data.dialysate || rxDialysate;

  const durationVar = varianceStatus(rxDurationMins, delDurationMins);
  const ufVar = varianceStatus(rxUfL, delUfL);
  const bfrVar = varianceStatus(rxBfr, delBfr);
  const dfrVar = varianceStatus(rxDfr, delDfr);
  const bvpVar = varianceStatus(rxBvpL, delBvpL);
  const hepVar = varianceStatus(rxHeparin, delHeparin);
  const tempVar = varianceStatus(rxTemp, delTemp, { pctTolerance: 2 });
  const dialVar = varianceStatus(rxDialysate, delDialysate, { categorical: true });

  return [
    {
      id: 'duration',
      param: 'Prescribed Duration',
      rx: minsToHrLabel(rxDurationMins) || '—',
      del: minsToHrLabel(delDurationMins) || '—',
      varStr: delDurationMins != null ? minsToHrLabel(delDurationMins - rxDurationMins) : '—',
      varPct: durationVar.varPct || '—',
      status: durationVar.status || '—',
    },
    {
      id: 'uf',
      param: 'UF Goal',
      rx: fmtNum(rxUfL, 2, 'L') || '—',
      del: fmtNum(delUfL, 2, 'L') || '—',
      varStr: ufVar.diff != null ? `${ufVar.diff > 0 ? '+' : ''}${ufVar.diff.toFixed(2)} L` : '—',
      varPct: ufVar.varPct || '—',
      status: ufVar.status || '—',
    },
    {
      id: 'bfr',
      param: 'Blood Flow Rate (BFR)',
      rx: rxBfr != null ? `${Math.round(rxBfr)} mL/min` : '—',
      del: delBfr != null ? `${Math.round(delBfr)} mL/min` : '—',
      varStr: bfrVar.diff != null ? `${bfrVar.diff > 0 ? '+' : ''}${Math.round(bfrVar.diff)} mL/min` : '—',
      varPct: bfrVar.varPct || '—',
      status: bfrVar.status || '—',
    },
    {
      id: 'dfr',
      param: 'Dialysate Flow Rate (DFR)',
      rx: rxDfr != null ? `${Math.round(rxDfr)} mL/min` : '—',
      del: delDfr != null ? `${Math.round(delDfr)} mL/min` : '—',
      varStr: dfrVar.diff != null ? `${dfrVar.diff > 0 ? '+' : ''}${Math.round(dfrVar.diff)} mL/min` : '—',
      varPct: dfrVar.varPct || '—',
      status: dfrVar.status || '—',
    },
    {
      id: 'bvp',
      param: 'Blood Volume Processed',
      rx: fmtNum(rxBvpL, 1, 'L') || '—',
      del: fmtNum(delBvpL, 1, 'L') || '—',
      varStr: bvpVar.diff != null ? `${bvpVar.diff > 0 ? '+' : ''}${bvpVar.diff.toFixed(1)} L` : '—',
      varPct: bvpVar.varPct || '—',
      status: bvpVar.status || '—',
    },
    {
      id: 'heparin',
      param: 'Heparin Dose',
      rx: rxHeparin != null ? String(rxHeparin) : '—',
      del: delHeparin != null ? String(delHeparin) : '—',
      varStr: hepVar.diff != null ? `${hepVar.diff > 0 ? '+' : ''}${hepVar.diff}` : '—',
      varPct: hepVar.varPct || '—',
      status: hepVar.status || '—',
    },
    {
      id: 'temp',
      param: 'Dialysate Temperature',
      rx: rxTemp != null ? `${rxTemp} °C` : '—',
      del: delTemp != null ? `${delTemp} °C` : '—',
      varStr: tempVar.diff != null ? `${tempVar.diff > 0 ? '+' : ''}${tempVar.diff.toFixed(1)} °C` : '—',
      varPct: tempVar.varPct || '—',
      status: tempVar.status || '—',
    },
    {
      id: 'dialysate',
      param: 'Dialysate',
      rx: rxDialysate || '—',
      del: delDialysate || '—',
      varStr: '—',
      varPct: '—',
      status: dialVar.status || '—',
    },
  ];
}

function adequacyLabel(status, value, kind) {
  if (value == null || value === '') return { text: 'Not calculated', ok: null };
  if (kind === 'ktv') {
    if (status === 'met' || Number(value) >= 1.4) return { text: 'Adequate', ok: true };
    if (status === 'minimum' || Number(value) >= 1.2) return { text: 'Minimum', ok: true };
    return { text: 'Below target', ok: false };
  }
  if (kind === 'urr') {
    return Number(value) >= 65
      ? { text: 'Adequate', ok: true }
      : { text: 'Below target', ok: false };
  }
  if (kind === 'pcr') {
    return Number(value) >= 0.8
      ? { text: 'Adequate', ok: true }
      : { text: 'Below target', ok: false };
  }
  return { text: '—', ok: null };
}

function normalizeDeviations(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((d) => (typeof d === 'string' ? d : d?.id)).filter(Boolean);
  }
  if (typeof raw === 'object') {
    return Object.keys(raw).filter((k) => raw[k]);
  }
  return [];
}

function buildP404ApiPayload({
  comparisonRows,
  selectedDeviations,
  otherDeviationNotes,
  physicianReview,
  outcomeNotes,
  preBun,
  postBun,
  ktvSingle,
  ktvEquil,
  urrVal,
  pcrVal,
}) {
  return {
    comparison: comparisonRows.map((r) => ({
      id: r.id,
      parameter: r.param,
      prescribed: r.rx,
      delivered: r.del,
      variance: r.varStr,
      variance_pct: r.varPct,
      status: r.status,
    })),
    prescribed_vs_delivered: comparisonRows.map((r) => ({
      id: r.id,
      parameter: r.param,
      prescribed: r.rx,
      delivered: r.del,
      variance: r.varStr,
      variance_pct: r.varPct,
      status: r.status,
    })),
    deviations: selectedDeviations,
    selectedDeviations,
    other_deviation_notes: otherDeviationNotes || null,
    notes: outcomeNotes || null,
    physician_review_required: physicianReview === 'Yes',
    physicianReview,
    pre_dialysis_bun: preBun === '' ? null : Number(preBun),
    post_dialysis_bun: postBun === '' ? null : Number(postBun),
    adequacy: {
      kt_v_sp: ktvSingle === '' || ktvSingle == null ? null : Number(ktvSingle),
      kt_v_eq: ktvEquil === '' || ktvEquil == null ? null : Number(ktvEquil),
      urr: urrVal === '' || urrVal == null ? null : Number(urrVal),
      pcr: pcrVal === '' || pcrVal == null ? null : Number(pcrVal),
    },
  };
}

export default function P404TreatmentOutcomeSummary({
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
  const machineModel = session.machine || session.machine_name || patient.machine || '—';
  const bedStr = session.bed || session.bed_number || patient.bed || '—';

  const adequacySrc = data.adequacy || {};
  const priorAdequacy = data.prior_adequacy || null;
  const ktvAvailable = data.kt_v_assessment_available === true
    || data.kt_v_assessment_available === 1
    || (data.pre_dialysis_bun != null && data.pre_dialysis_bun !== '');

  const initialPreBun = data.pre_dialysis_bun ?? data.preBun ?? data.pre_bun ?? '';
  const initialPostBun = adequacySrc.post_dialysis_bun ?? data.postBun ?? data.post_bun ?? '';

  const [ktvTaken, setKtvTaken] = useState(
    Boolean(data.ktvTaken || data.kt_v_taken || adequacySrc.kt_v_sp != null),
  );
  const [preBun, setPreBun] = useState(initialPreBun !== '' && initialPreBun != null ? String(initialPreBun) : '');
  const [postBun, setPostBun] = useState(initialPostBun !== '' && initialPostBun != null ? String(initialPostBun) : '');
  const [ktvSingle, setKtvSingle] = useState(
    adequacySrc.kt_v_sp != null ? String(adequacySrc.kt_v_sp) : (data.ktvSingle != null ? String(data.ktvSingle) : ''),
  );
  const [ktvEquil, setKtvEquil] = useState(
    adequacySrc.kt_v_eq != null ? String(adequacySrc.kt_v_eq) : (data.ktvEquil != null ? String(data.ktvEquil) : ''),
  );
  const [urrVal, setUrrVal] = useState(
    adequacySrc.urr != null ? String(adequacySrc.urr) : (data.urr != null ? String(data.urr) : ''),
  );
  const [pcrVal, setPcrVal] = useState(
    adequacySrc.pcr != null ? String(adequacySrc.pcr) : (data.pcr != null ? String(data.pcr) : ''),
  );
  const [adequacyStatuses, setAdequacyStatuses] = useState(adequacySrc.statuses || {});
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcError, setCalcError] = useState('');
  const [formError, setFormError] = useState('');

  const [selectedDeviations, setSelectedDeviations] = useState(
    () => normalizeDeviations(data.deviations || data.selectedDeviations || data.outcome?.deviations_json),
  );
  const [otherDeviationNotes, setOtherDeviationNotes] = useState(data.otherDeviationNotes || '');
  const [physicianReview, setPhysicianReview] = useState(() => {
    if (data.physicianReview === 'Yes' || data.physicianReview === 'No') return data.physicianReview;
    if (data.physician_review_required === true || data.physician_review_required === 1) return 'Yes';
    if (data.physician_review_required === false || data.physician_review_required === 0) return 'No';
    return 'No';
  });
  const [outcomeNotes, setOutcomeNotes] = useState(data.outcomeNotes || data.notes || data.outcome?.notes || '');

  const comparisonRows = useMemo(
    () => buildComparisonRows(session, data),
    [session, data],
  );

  const updateParentState = (updates) => {
    if (setData) setData((old) => ({ ...old, ...updates }));
  };

  const ktvSpLabel = adequacyLabel(adequacyStatuses.kt_v_sp, ktvSingle, 'ktv');
  const ktvEqLabel = adequacyLabel(null, ktvEquil, 'ktv');
  const urrLabel = adequacyLabel(adequacyStatuses.urr, urrVal, 'urr');
  const pcrLabel = adequacyLabel(adequacyStatuses.pcr, pcrVal, 'pcr');
  const overallAdequate =
    ktvSingle !== '' && Number(ktvSingle) >= 1.2 && (urrVal === '' || Number(urrVal) >= 65);

  const belowRows = comparisonRows.filter((r) => String(r.status).toLowerCase().includes('below'));
  const priorLabel = priorAdequacy
    ? `Last measured: Kt/V ${priorAdequacy.kt_v_sp ?? priorAdequacy.kt_v ?? '—'} (session ${priorAdequacy.session_id || 'prior'})`
    : 'No adequacy history available for this patient yet';

  const handleCalculateKtV = async () => {
    setCalcError('');
    if (!ktvAvailable) {
      setCalcError('Pre-dialysis BUN was not recorded on P2-05 — Kt/V assessment is unavailable for this session.');
      return;
    }
    if (postBun === '' || !Number.isFinite(Number(postBun))) {
      setCalcError('Post-dialysis BUN is required to calculate adequacy metrics.');
      return;
    }
    const sessionId = session.id || session.session_id || data.session_id;
    if (!sessionId || sessionId === 'demo') {
      setCalcError('No live session available for Kt/V calculation.');
      return;
    }
    setIsCalculating(true);
    const res = await calculateKtV(sessionId, {
      pre_dialysis_bun: preBun === '' ? undefined : Number(preBun),
      post_dialysis_bun: Number(postBun),
      duration: data.treatmentDuration || session.treatmentDuration || session.duration,
      uf_liters: litersFromMlOrL(data.totalUfRemoved ?? session.total_uf_removed ?? session.uf_removed),
      post_dialysis_weight_kg: num(data.postWeight ?? data.post_weight ?? session.post_weight_kg),
      access_type: data.access || session.access_type || session.access,
    });
    setIsCalculating(false);
    if (!res.success) {
      setCalcError(res.data?.message || res.data?.error || 'Unable to calculate adequacy metrics.');
      return;
    }
    const d = res.data?.data || res.data || {};
    const adeq = d.adequacy || d;
    const newKtvSingle = adeq.kt_v_sp ?? adeq.ktvSingle ?? adeq.single_pool_kt_v;
    const newKtvEquil = adeq.kt_v_eq ?? adeq.ktvEquil ?? adeq.equilibrated_kt_v;
    const newUrr = adeq.urr;
    const newPcr = adeq.pcr;
    setKtvSingle(newKtvSingle != null ? String(newKtvSingle) : '');
    setKtvEquil(newKtvEquil != null ? String(newKtvEquil) : '');
    setUrrVal(newUrr != null ? String(newUrr) : '');
    setPcrVal(newPcr != null ? String(newPcr) : '');
    setAdequacyStatuses(adeq.statuses || {});
    updateParentState({
      preBun,
      postBun,
      ktvSingle: newKtvSingle,
      ktvEquil: newKtvEquil,
      urr: newUrr,
      pcr: newPcr,
      adequacy: adeq,
      ktvTaken: true,
    });
  };

  const handleDeviationToggle = (devId) => {
    setSelectedDeviations((prev) => {
      const next = prev.includes(devId) ? prev.filter((id) => id !== devId) : [...prev, devId];
      updateParentState({ selectedDeviations: next, deviations: next });
      return next;
    });
  };

  const handleFormSubmit = async () => {
    setFormError('');
    if (ktvTaken) {
      if (!ktvAvailable) {
        setFormError('Kt/V assessment is checked but pre-dialysis BUN is missing from P2-05.');
        return;
      }
      if (postBun === '' || !Number.isFinite(Number(postBun))) {
        setFormError('Post-dialysis BUN is required when Kt/V assessment is taken.');
        return;
      }
    }
    if (selectedDeviations.includes('other') && !String(otherDeviationNotes || '').trim()) {
      setFormError('Specify the Other deviation before continuing.');
      return;
    }

    const apiPayload = buildP404ApiPayload({
      comparisonRows,
      selectedDeviations,
      otherDeviationNotes,
      physicianReview,
      outcomeNotes,
      preBun,
      postBun,
      ktvSingle,
      ktvEquil,
      urrVal,
      pcrVal,
    });
    const uiPayload = {
      ...apiPayload,
      ktvTaken,
      preBun,
      postBun,
      ktvSingle,
      ktvEquil,
      urr: urrVal,
      pcr: pcrVal,
      outcomeNotes,
      physicianReview,
      selectedDeviations,
      otherDeviationNotes,
      prescribedVsDelivered: apiPayload.comparison,
    };
    updateParentState(uiPayload);
    if (onSave) {
      const ok = await onSave(apiPayload);
      if (ok === false) return;
    }
  };

  return (
    <div className="p404-page-wrapper">
      <header className="p404-top-bar">
        <div className="p404-top-bar-left">
          <h1>P4-04 – Treatment Outcome Summary</h1>
          <p>Review prescribed vs delivered treatment and evaluate dialysis adequacy.</p>
        </div>
      </header>

      <nav className="p404-stepper-bar" aria-label="Post-Dialysis 10-Step Progress">
        {SCREENS_STEPPER.map((s, idx) => {
          const isActive = s.step === 4;
          const isCompleted = s.step < 4;
          return (
            <React.Fragment key={s.step}>
              <div className={`p404-stepper-item ${isActive ? 'active' : isCompleted ? 'completed' : ''}`}>
                <div className="p404-stepper-circle">
                  {isCompleted ? '✓' : s.step}
                </div>
                <span className="p404-stepper-label">{s.label}</span>
              </div>
              {idx < SCREENS_STEPPER.length - 1 && <div className="p404-stepper-line" />}
            </React.Fragment>
          );
        })}
      </nav>

      <div className="p404-patient-header-banner">
        <div className="p404-patient-left">
          <div className="p404-patient-avatar-box">
            {patient.avatarUrl ? (
              <img src={patient.avatarUrl} alt={patientName} />
            ) : (
              <div className="p404-patient-avatar-fallback" aria-hidden="true">
                {(patientName || '?').slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="p404-patient-bio">
            <div className="p404-patient-name-row">
              <h2>{patientName}</h2>
              <span className="p404-pill-active">Active</span>
            </div>
            <div className="p404-patient-subrow1">
              <span>PID: <strong>{pid}</strong></span>
              <span className="p404-sep">|</span>
              <span><strong>{ageGender}</strong></span>
              <span className="p404-sep">|</span>
              <span>Blood Group: <strong>{bloodGroup}</strong></span>
            </div>
            <div className="p404-patient-subrow2">
              <span>Access: <strong>{accessDetail}</strong></span>
              <span className="p404-sep">|</span>
              <span>Nephrologist: <strong>{nephrologist}</strong></span>
            </div>
          </div>
        </div>

        <div className="p404-patient-stats">
          <div className="p404-stat-box">
            <CalendarTodayOutlinedIcon className="p404-stat-icon" />
            <span className="p404-stat-lbl">Treatment Start</span>
            <strong className="p404-stat-val">{startTimeStr}</strong>
          </div>
          <div className="p404-stat-box">
            <AccessTimeOutlinedIcon className="p404-stat-icon" />
            <span className="p404-stat-lbl">Treatment End</span>
            <strong className="p404-stat-val">{endTimeStr}</strong>
          </div>
          <div className="p404-stat-box">
            <AccessTimeOutlinedIcon className="p404-stat-icon" />
            <span className="p404-stat-lbl">Duration</span>
            <strong className="p404-stat-val">{durationStr}</strong>
          </div>
          <div className="p404-stat-box">
            <WaterDropOutlinedIcon className="p404-stat-icon" />
            <span className="p404-stat-lbl">Machine</span>
            <strong className="p404-stat-val">{machineModel}</strong>
          </div>
          <div className="p404-stat-box">
            <HotelOutlinedIcon className="p404-stat-icon" />
            <span className="p404-stat-lbl">Bed</span>
            <strong className="p404-stat-val">{bedStr}</strong>
          </div>
        </div>
      </div>

      <div className="p404-workspace-grid">
        <div className="p404-main-form-column">
          <div className="p404-card">
            <div className="p404-card-title-row">
              <h2>1. Prescribed vs Delivered</h2>
            </div>
            <div className="p404-rx-table-wrap">
              <table className="p404-rx-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Prescribed</th>
                    <th>Delivered</th>
                    <th>Variance</th>
                    <th>Variance %</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((r) => {
                    const IconComponent = ROW_ICONS[r.id] || ScienceOutlinedIcon;
                    const neg = String(r.varStr || '').startsWith('-') || String(r.varPct || '').startsWith('-');
                    return (
                      <tr key={r.id}>
                        <td>
                          <div className="p404-param-cell">
                            <IconComponent sx={{ color: '#2563eb', fontSize: 16 }} />
                            <span>{r.param}</span>
                          </div>
                        </td>
                        <td><strong>{r.rx}</strong></td>
                        <td><strong>{r.del}</strong></td>
                        <td className={neg ? 'p404-neg-var' : ''}>{r.varStr}</td>
                        <td className={neg ? 'p404-neg-var' : ''}>{r.varPct}</td>
                        <td>
                          <span className={`p404-status-badge ${r.status === 'Achieved' ? 'achieved' : r.status === '—' ? '' : 'below'}`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p404-card">
            <div className="p404-card-title-row">
              <h2>2. Kt/V Assessment (Monthly)</h2>
            </div>
            <div className="p404-checkline" style={{ marginBottom: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={ktvTaken}
                  disabled={!ktvAvailable && !ktvTaken}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setKtvTaken(checked);
                    updateParentState({ ktvTaken: checked });
                  }}
                />
                <span>
                  Kt/V Assessment Due / Taken This Session
                  <span title="Per protocol, typically once monthly" style={{ marginLeft: 6 }}>ⓘ</span>
                </span>
              </label>
            </div>
            <p style={{ margin: '0 0 12px', color: '#64748b', fontSize: 13 }}>{priorLabel}</p>
            {!ktvAvailable && (
              <div className="during-error" style={{ marginBottom: 12 }}>
                Pre-dialysis BUN was not recorded on P2-05 — calculate is unavailable for this session.
              </div>
            )}
            {ktvTaken && (
              <div className="p404-notes-field" style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr auto', alignItems: 'end' }}>
                <label>
                  <span>Pre-dialysis BUN (mg/dL)</span>
                  <Input value={preBun} readOnly placeholder="From P2-05" />
                </label>
                <label>
                  <span>Post-dialysis BUN (mg/dL) *</span>
                  <Input
                    type="number"
                    value={postBun}
                    onChange={(e) => {
                      setPostBun(e.target.value);
                      updateParentState({ postBun: e.target.value });
                    }}
                    placeholder=""
                  />
                </label>
                <Button type="button" variant="outline" onClick={handleCalculateKtV} disabled={isCalculating || !ktvAvailable}>
                  <CalculateOutlinedIcon sx={{ fontSize: 16 }} />
                  {isCalculating ? 'Calculating…' : 'Calculate Adequacy Metrics'}
                </Button>
              </div>
            )}
            {calcError && <div className="during-error" style={{ marginTop: 8 }}>{calcError}</div>}
          </div>

          <div className="p404-card">
            <div className="p404-card-title-row">
              <h2>3. Dialysis Adequacy Metrics</h2>
            </div>
            <div className="p404-adequacy-grid">
              <div className="p404-adeq-card">
                <span className="p404-adeq-label">Kt/V (Single Pool)</span>
                <strong className="p404-adeq-val">{ktvSingle !== '' ? Number(ktvSingle).toFixed(2) : '—'}</strong>
                <div className="p404-adeq-foot">
                  <span>Target &ge; 1.2</span>
                  <span className={`p404-adeq-badge ${ktvSpLabel.ok === false ? 'below' : ''}`}>{ktvSpLabel.text}</span>
                </div>
              </div>
              <div className="p404-adeq-card">
                <span className="p404-adeq-label">Kt/V (Equilibrated)</span>
                <strong className="p404-adeq-val">{ktvEquil !== '' ? Number(ktvEquil).toFixed(2) : '—'}</strong>
                <div className="p404-adeq-foot">
                  <span>Corrected for urea rebound</span>
                  <span className={`p404-adeq-badge ${ktvEqLabel.ok === false ? 'below' : ''}`}>{ktvEqLabel.text}</span>
                </div>
              </div>
              <div className="p404-adeq-card">
                <span className="p404-adeq-label">URR (If Available)</span>
                <strong className="p404-adeq-val">{urrVal !== '' ? `${Number(urrVal).toFixed(1)}%` : '—'}</strong>
                <div className="p404-adeq-foot">
                  <span>Target &ge; 65%</span>
                  <span className={`p404-adeq-badge ${urrLabel.ok === false ? 'below' : ''}`}>{urrLabel.text}</span>
                </div>
              </div>
              <div className="p404-adeq-card">
                <span className="p404-adeq-label">PCR (g/kg/day)</span>
                <strong className="p404-adeq-val">{pcrVal !== '' ? Number(pcrVal).toFixed(2) : '—'}</strong>
                <div className="p404-adeq-foot">
                  <span>Target &ge; 0.8</span>
                  <span className={`p404-adeq-badge ${pcrLabel.ok === false ? 'below' : ''}`}>{pcrLabel.text}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p404-card">
            <div className="p404-card-title-row">
              <h2>4. Treatment Notes / Variances</h2>
            </div>
            <div className="p404-notes-field">
              <Textarea
                maxLength={300}
                placeholder="Enter any deviations, issues or other observations..."
                value={outcomeNotes}
                onChange={(e) => {
                  setOutcomeNotes(e.target.value);
                  updateParentState({ outcomeNotes: e.target.value, notes: e.target.value });
                }}
                style={{ minHeight: 70 }}
              />
              <span className="p404-char-count">{outcomeNotes.length} / 300</span>
            </div>
          </div>

          <div className="p404-row-sections-456">
            <div className="p404-card p404-trends-card">
              <div className="p404-card-title-row flex-between">
                <h2>5. Parameter Trends (Last Sessions)</h2>
              </div>
              {!priorAdequacy && ktvSingle === '' ? (
                <p style={{ color: '#64748b', margin: 0 }}>No adequacy history available for this patient yet.</p>
              ) : (
                <div className="p404-trends-table-wrap">
                  <table className="p404-trends-table">
                    <thead>
                      <tr>
                        <th>Parameter</th>
                        {priorAdequacy && <th>Prior</th>}
                        <th>This session</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Kt/V (Single Pool)</td>
                        {priorAdequacy && <td>{priorAdequacy.kt_v_sp ?? priorAdequacy.kt_v ?? '—'}</td>}
                        <td>{ktvSingle !== '' ? Number(ktvSingle).toFixed(2) : '—'}</td>
                      </tr>
                      <tr>
                        <td>URR (%)</td>
                        {priorAdequacy && <td>{priorAdequacy.urr ?? '—'}</td>}
                        <td>{urrVal !== '' ? Number(urrVal).toFixed(1) : '—'}</td>
                      </tr>
                      <tr>
                        <td>Post Weight (kg)</td>
                        {priorAdequacy && <td>{priorAdequacy.post_dialysis_weight_kg ?? '—'}</td>}
                        <td>{data.postWeight || data.post_weight || '—'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p404-stacked-col">
              <div className="p404-card">
                <div className="p404-card-title-row">
                  <h2>6. Deviation / Issues (If any)</h2>
                </div>
                <div className="p404-deviations-grid">
                  {DEVIATIONS_LIST.map((dev) => (
                    <label key={dev.id} className="p404-dev-checkbox-row">
                      <input
                        type="checkbox"
                        checked={selectedDeviations.includes(dev.id)}
                        onChange={() => handleDeviationToggle(dev.id)}
                      />
                      <span>{dev.label}</span>
                      {dev.id === 'other' && selectedDeviations.includes('other') && (
                        <input
                          type="text"
                          className="p404-other-input"
                          placeholder="Specify issue..."
                          value={otherDeviationNotes}
                          onChange={(e) => {
                            setOtherDeviationNotes(e.target.value);
                            updateParentState({ otherDeviationNotes: e.target.value });
                          }}
                        />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div className="p404-card">
                <div className="p404-card-title-row">
                  <h2>7. Physician Review Required</h2>
                </div>
                <div className="p404-physician-review-box">
                  <span className="p404-review-lbl">Send summary to nephrologist</span>
                  <div className="p404-radio-group">
                    <label className="p404-radio-item">
                      <input
                        type="radio"
                        name="physicianReview"
                        value="Yes"
                        checked={physicianReview === 'Yes'}
                        onChange={() => {
                          setPhysicianReview('Yes');
                          updateParentState({ physicianReview: 'Yes', physician_review_required: true });
                        }}
                      />
                      <span>Yes</span>
                    </label>
                    <label className="p404-radio-item">
                      <input
                        type="radio"
                        name="physicianReview"
                        value="No"
                        checked={physicianReview === 'No'}
                        onChange={() => {
                          setPhysicianReview('No');
                          updateParentState({ physicianReview: 'No', physician_review_required: false });
                        }}
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p404-right-rail">
          <div className="p404-rail-card p404-adeq-summary-card">
            <div className="p404-adeq-head">
              <div className="p404-adeq-icon">
                {overallAdequate ? (
                  <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 24 }} />
                ) : (
                  <WarningAmberOutlinedIcon sx={{ color: '#b45309', fontSize: 24 }} />
                )}
              </div>
              <div className="p404-adeq-text">
                <strong>{ktvSingle === '' ? 'Pending assessment' : overallAdequate ? 'Adequate' : 'Review needed'}</strong>
                <span>
                  {ktvSingle === ''
                    ? 'Calculate Kt/V when monthly assessment is due.'
                    : overallAdequate
                      ? 'Treatment delivered within adequacy targets.'
                      : 'One or more adequacy metrics are below target.'}
                </span>
              </div>
            </div>
            <div className="p404-adeq-metric-row">
              <div className="p404-adeq-submetric">
                <span className="p404-sub-label">Kt/V (Single Pool)</span>
                <div className="p404-sub-val-row">
                  <strong>{ktvSingle !== '' ? Number(ktvSingle).toFixed(2) : '—'}</strong>
                  <span className="p404-adeq-pill">{ktvSpLabel.text}</span>
                </div>
                <span className="p404-sub-target">Target &ge; 1.2</span>
              </div>
              <div className="p404-adeq-submetric">
                <span className="p404-sub-label">URR (If Available)</span>
                <div className="p404-sub-val-row">
                  <strong>{urrVal !== '' ? `${Number(urrVal).toFixed(1)}%` : '—'}</strong>
                  <span className="p404-adeq-pill">{urrLabel.text}</span>
                </div>
                <span className="p404-sub-target">Target &ge; 65%</span>
              </div>
            </div>
          </div>

          <div className="p404-rail-card p404-reminders-card">
            <div className="p404-rail-header">
              <LightbulbOutlinedIcon sx={{ color: '#b45309', fontSize: 18 }} />
              <h3 style={{ color: '#92400e' }}>Key Reminders</h3>
            </div>
            <div className="p404-reminders-checklist">
              <div className="p404-reminder-row">
                <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                <span>Review variance and ensure adequacy</span>
              </div>
              {belowRows.slice(0, 2).map((r) => (
                <div className="p404-reminder-row" key={r.id}>
                  <WarningAmberOutlinedIcon sx={{ color: '#b45309', fontSize: 16 }} />
                  <span>{r.param}: {r.varPct} ({r.status})</span>
                </div>
              ))}
              {ktvSingle !== '' && (
                <div className="p404-reminder-row">
                  <CheckCircleOutlinedIcon sx={{ color: overallAdequate ? '#16a34a' : '#b45309', fontSize: 16 }} />
                  <span>{overallAdequate ? 'Kt/V within target range' : 'Kt/V below target — notify physician'}</span>
                </div>
              )}
              {selectedDeviations.length > 0 && (
                <div className="p404-reminder-row">
                  <WarningAmberOutlinedIcon sx={{ color: '#b45309', fontSize: 16 }} />
                  <span>{selectedDeviations.length} deviation(s) flagged</span>
                </div>
              )}
            </div>
          </div>

          <div className="p404-rail-card">
            <div className="p404-rail-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="p404-quick-actions-grid">
              <button type="button" className="p404-action-btn" disabled>
                <ShowChartOutlinedIcon sx={{ fontSize: 16 }} />
                <span>View Treatment Trends</span>
              </button>
              <button type="button" className="p404-action-btn" disabled>
                <SendOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Send to Nephrologist</span>
              </button>
              <button type="button" className="p404-action-btn" disabled>
                <PrintOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Print Summary</span>
              </button>
              <button type="button" className="p404-action-btn" disabled>
                <PictureAsPdfOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="p404-footer-bar">
        <div className="p404-footer-left">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowBackOutlinedIcon sx={{ fontSize: 16 }} /> Back
          </Button>
        </div>
        <div className="p404-footer-right">
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
