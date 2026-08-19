#!/usr/bin/env node
/**
 * P3 Frontend Notes Verifier — enumerates every endpoint from
 * docs/dialysis_docs/P3/2026-08-15-dt-during-dialysis-frontend-notes.md
 * and hits it live via HTTP with real JWT + session.
 *
 * Base: https://api.kifaytihealth.com/api1/api
 * Token: dt.tech.p2test@kifayti.local (provided)
 * Session: 8 (RUNNING, created via /dt/dialysis/sessions/start patient 13)
 * Technician user id: 5 (from recorded_by)
 * Patient id: 13
 */
const BASE = 'https://api.kifaytihealth.com/api1/api';
const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImR0LnRlY2gucDJ0ZXN0QGtpZmF5dGkubG9jYWwiLCJpYXQiOjE3ODY4MTU1OTYsImV4cCI6MTc4Njk4ODM5Nn0.artnkRjhfSVSxtW0mMTAL2-ymwXASMiGcbgsdcTmWVQ';
const SESSION_ID = 8;
const TECHNICIAN_ID = 5;
const PATIENT_ID = 13;

const log = [];
async function call(label, method, path, body=null) {
  const url = BASE + path;
  const r = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${JWT}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const txt = await r.text();
  let j=null; try { j = JSON.parse(txt); } catch {}
  const code = j?.error_code || (j?.success ? 'OK' : `HTTP_${r.status}`);
  const msg = (j?.message || '').slice(0,120);
  console.log(`${label}: ${method} ${path} => ${r.status} ${code} ${msg}`);
  if (j && !j.success && j.error_code) console.log(`  error_code: ${j.error_code}`);
  if (j && j.success && j.data) {
    const snippet = JSON.stringify(j.data).slice(0,300);
    console.log(`  data: ${snippet}`);
  }
  log.push({label, method, path, status: r.status, code, body: j});
  return j;
}

(async()=>{
  console.log(`Base: ${BASE}  Session:${SESSION_ID}  Technician:${TECHNICIAN_ID}  Patient:${PATIENT_ID}\n`);

  // P3-01
  await call('P3-01 Dashboard', 'GET', `/dt/sessions/${SESSION_ID}/dashboard`);

  // P3-02
  const vitPayload = { bp_systolic: 118, bp_diastolic: 78, pulse: 76, temperature: 36.7, spo2: 98, observation_time: '2026-08-16 12:00:00', pain_score: 0, consciousness: 'Alert', symptoms: 'None', notify_flag: false };
  const vitRes = await call('P3-02 POST vitals-intradialytic', 'POST', `/dt/sessions/${SESSION_ID}/vitals-intradialytic`, vitPayload);
  await call('P3-02 GET vitals-intradialytic?range=2h', 'GET', `/dt/sessions/${SESSION_ID}/vitals-intradialytic?range=2h`);
  // Overdue vitals - need real logId; fetch first
  const overdueBefore = await call('P3-02 GET overdue-vitals (technician own)', 'GET', `/dt/technicians/${TECHNICIAN_ID}/overdue-vitals`);
  const logId = overdueBefore?.data?.items?.[0]?.log_id || 999999;
  // Wrong technician should be forbidden - test with 1
  await call('P3-02 GET overdue-vitals (wrong technician -> ERR_FORBIDDEN_ROLE)', 'GET', `/dt/technicians/1/overdue-vitals`);
  await call('P3-02 POST overdue-vitals/:logId/skip', 'POST', `/dt/overdue-vitals/${logId}/skip`, { reason: 'test skip reason 0/200' });
  await call('P3-02 POST overdue-vitals/skip-all', 'POST', `/dt/overdue-vitals/skip-all`, { technician_id: TECHNICIAN_ID, log_ids: [], reason: 'bulk test' });

  // P3-03
  await call('P3-03 POST machine-parameters', 'POST', `/dt/sessions/${SESSION_ID}/machine-parameters`, { bfr: 310, dfr: 500, ap: -75, vp: 115, tmp: 48, conductivity: 14, dialysate_temperature: 37, uf_rate: 750, uf_removed: 0.6, heparin_rate: 500 });
  await call('P3-03 GET machine-parameters?range=2h', 'GET', `/dt/sessions/${SESSION_ID}/machine-parameters?range=2h`);

  // P3-04
  const symRes = await call('P3-04 POST symptoms', 'POST', `/dt/sessions/${SESSION_ID}/symptoms`, { symptom: 'Muscle Cramps', severity: 'Mild', intervention: 'Reassured patient', event_time: '2026-08-16 12:10:00' });
  const symId = symRes?.data?.id || 1;
  await call('P3-04 PATCH symptoms/:symptomId', 'PATCH', `/dt/sessions/${SESSION_ID}/symptoms/${symId}`, { status: 'resolved' });
  // Auto-incident case
  await call('P3-04 POST symptoms (Severe Syncope -> auto_incident)', 'POST', `/dt/sessions/${SESSION_ID}/symptoms`, { symptom: 'Syncope', severity: 'Severe', intervention: 'Notified nephrologist', event_time: '2026-08-16 12:11:00' });

  // P3-05
  await call('P3-05 POST vascular-access-monitoring', 'POST', `/dt/sessions/${SESSION_ID}/vascular-access-monitoring`, { access_type: 'AVF', needle_security: 'Secure', bleeding: 'None', infiltration: 'No', blood_flow: 'Adequate', overall_status: 'Good / Functional', event_time: '2026-08-16 12:15:00' });
  // Auto-incident variant
  await call('P3-05 POST vascular-access severe (auto_incident)', 'POST', `/dt/sessions/${SESSION_ID}/vascular-access-monitoring`, { access_type: 'AVF', needle_security: 'Secure', bleeding: 'Excessive', infiltration: 'Yes (Severe)', blood_flow: 'Adequate', overall_status: 'At Risk', event_time: '2026-08-16 12:16:00' });

  // P3-06
  await call('P3-06 GET medications/due', 'GET', `/dt/sessions/${SESSION_ID}/medications/due`);
  await call('P3-06 GET patients/:id/allergies', 'GET', `/dt/patients/${PATIENT_ID}/allergies`);
  await call('P3-06 POST medications (numeric dose)', 'POST', `/dt/sessions/${SESSION_ID}/medications`, { medication: 'Heparin', dose: 2000, dose_unit: 'units', route: 'IV', administered_at: '2026-08-16 12:20:00', status: 'Administered' });
  // Hard block cases - we just check they return DB/meta, but document expected codes
  // Allergy block would need an allergen; patient has none, so this will succeed

  // P3-07
  const alarmRes = await call('P3-07 POST alarms (minimal)', 'POST', `/dt/sessions/${SESSION_ID}/alarms`, { alarm_type: 'TMP', action_taken: 'checked line', resolution_status: 'Resolved', patient_impact: 'No adverse effect', alarm_time: '2026-08-16 12:30:00' });
  const alarmId = alarmRes?.data?.id || 1;
  await call('P3-07 POST alarms missing action -> ERR_ALARM_ACTION_REQUIRED', 'POST', `/dt/sessions/${SESSION_ID}/alarms`, { alarm_type: 'TMP' });
  await call('P3-07 PATCH alarms/:alarmId', 'PATCH', `/dt/sessions/${SESSION_ID}/alarms/${alarmId}`, { resolution_status: 'Resolved' });

  // P3-08
  await call('P3-08 GET progress', 'GET', `/dt/sessions/${SESSION_ID}/progress`);
  await call('P3-08 POST events', 'POST', `/dt/sessions/${SESSION_ID}/events`, { event_type: 'treatment_note', description: 'verifier event 2', event_time: '2026-08-16 12:35:00' });

  // P3-09
  await call('P3-09 GET incidents', 'GET', `/dt/sessions/${SESSION_ID}/incidents`);
  await call('P3-09 POST incidents', 'POST', `/dt/sessions/${SESSION_ID}/incidents`, { incident_type: 'Clinical event', description: 'verifier incident', escalation: 'Nurse', outcome: 'observed', event_time: '2026-08-16 12:40:00' });

  // P3-10 - probe ERR_CONFIRMATION_REQUIRED then success (do not actually terminate session here unless confirmed)
  await call('P3-10 POST end-treatment (no confirm -> ERR_CONFIRMATION_REQUIRED)', 'POST', `/dt/sessions/${SESSION_ID}/end-treatment`, {});
  // Do not call confirmed:true to avoid terminating the RUNNING session used for future tests
  // await call('P3-10 POST end-treatment confirmed', 'POST', `/dt/sessions/${SESSION_ID}/end-treatment`, { confirmed: true });

  console.log('\n--- SUMMARY ---');
  console.log(`Total calls: ${log.length}`);
  const ok = log.filter(x=> x.body?.success).length;
  console.log(`Success responses: ${ok}, Error responses: ${log.length - ok}`);
  log.forEach(x=> {
    if (!x.body?.success) console.log(`  ERR ${x.label}: ${x.status} ${x.code}`);
  });
})();
