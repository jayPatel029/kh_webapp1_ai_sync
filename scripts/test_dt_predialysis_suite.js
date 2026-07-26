const fs = require('fs');
const http = require('http');
const https = require('https');
const { URL } = require('url');

const BASE_URL = process.env.API_BASE_URL || 'https://api.kifaytihealth.com/api1/api';
const AUTH_EMAIL = process.env.AUTH_EMAIL || 'hima@test.com';
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || 'hima1234';
const REPORT_PATH = process.env.TEST_REPORT_PATH || 'API_AUDIT_REPORT.md';

const reportLines = [];
let passedCount = 0;
let failedCount = 0;
let authToken = null;

const testState = {
  patientId: 1,
  sessionId: 1,
  bedId: 1,
  machineId: 'HD-01',
  roPlantId: 'RO-1',
  shiftId: 1,
  technicianUserId: 1,
};

function addResult(name, ok, details = '') {
  const status = ok ? 'PASSED' : 'FAILED';
  reportLines.push(`- **[${status}]** ${name}${details ? `: ${details}` : ''}`);
  if (ok) passedCount++;
  else failedCount++;
  console.log(`[${status}] ${name}${details ? `: ${details}` : ''}`);
}

function request(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve) => {
    const finalPath = path.startsWith('/../') ? path : path;
    const parsed = new URL(`${BASE_URL}${finalPath}`);
    const client = parsed.protocol === 'https:' ? https : http;

    const reqHeaders = {
      'Content-Type': 'application/json',
      'x-user-role': process.env.TEST_USER_ROLE || 'Dialysis Technician',
      'x-user-id': process.env.TEST_USER_ID || '1',
      ...headers,
    };

    if (authToken) {
      reqHeaders.Authorization = `Bearer ${authToken}`;
    }

    const req = client.request(
      parsed.href,
      {
        method,
        headers: reqHeaders,
        timeout: 10000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(data);
          } catch (e) {
            json = null;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            json,
            raw: data,
          });
        });
      }
    );

    req.on('error', (err) => {
      resolve({ status: 0, error: err.message, json: null, raw: null });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 408, error: 'Request Timeout', json: null, raw: null });
    });

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function login() {
  console.log(`Authenticating as ${AUTH_EMAIL}...`);
  const paths = ['/auth/login', '/app/login', '/../auth/login', '/../app/login'];
  const payload = { email: AUTH_EMAIL, password: AUTH_PASSWORD };

  for (const p of paths) {
    const res = await request(p, 'POST', payload);
    if (res.status === 200 && res.json && (res.json.token || res.json.data?.token)) {
      authToken = res.json.token || res.json.data?.token;
      console.log(`Successfully authenticated via ${p}. Token length: ${authToken.length}`);
      return true;
    }
  }

  console.error('Login failed on all attempted endpoints.');
  return false;
}

async function runAuditSuite() {
  console.log('--- Starting API Audit and Workflow Test Suite ---');
  reportLines.push(`# Pre-Dialysis (Part 2) & /dt/ API Audit Report`);
  reportLines.push(`Generated: ${new Date().toISOString()}`);
  reportLines.push(`Base URL: ${BASE_URL}\n`);

  const authed = await login();
  if (!authed) {
    addResult('Authentication', false, 'Failed to obtain JWT token with provided credentials');
  } else {
    addResult('Authentication', true, 'Successfully obtained JWT token');
  }

  // -------------------------------------------------------------------------
  // 1. Audit Existing /dt/ Endpoints
  // -------------------------------------------------------------------------
  reportLines.push(`\n## 1. Audit of Existing /dt/ Endpoints\n`);

  // Health
  const resHealth = await request('/../health');
  addResult('Health Endpoint (/health)', resHealth.status === 200, `Status ${resHealth.status}`);

  // Clinics
  const resClinics = await request('/dt/clinics');
  addResult('GET /dt/clinics', resClinics.status === 200, `Status ${resClinics.status}`);

  // Beds
  const resBeds = await request('/dt/beds/all');
  addResult('GET /dt/beds/all', resBeds.status === 200, `Status ${resBeds.status}`);

  const resBedsAvail = await request('/dt/beds/status/AVAILABLE');
  addResult('GET /dt/beds/status/AVAILABLE', resBedsAvail.status === 200, `Status ${resBedsAvail.status}`);

  // Appointments
  const resAppts = await request('/dt/appointments');
  addResult('GET /dt/appointments', resAppts.status === 200, `Status ${resAppts.status}`);

  // Shifts
  const resShifts = await request('/dt/shifts');
  addResult('GET /dt/shifts', resShifts.status === 200, `Status ${resShifts.status}`);

  // Inventory Stock & Dialyzers
  const resStock = await request('/dt/inventory/stock');
  addResult('GET /dt/inventory/stock', resStock.status === 200, `Status ${resStock.status}`);

  const resDialyzers = await request('/dt/inventory/dialyzers');
  addResult('GET /dt/inventory/dialyzers', resDialyzers.status === 200, `Status ${resDialyzers.status}`);

  // Billing (known gap check)
  const resBilling = await request('/dt/billing/bills');
  addResult(
    'GET /dt/billing/bills',
    resBilling.status === 200,
    `Status ${resBilling.status} ${resBilling.status === 404 ? '(Route Not Found on server)' : ''}`
  );

  // -------------------------------------------------------------------------
  // 2. Audit Part 2 Pre-Dialysis (P2-01 to P2-12) Endpoints
  // -------------------------------------------------------------------------
  reportLines.push(`\n## 2. Audit of Part 2 Pre-Dialysis (P2-01 to P2-12) Endpoints\n`);

  // P2-01: GET /api/dt/sessions/today
  const resToday = await request('/dt/sessions/today?shift=1');
  addResult(
    'P2-01: GET /api/dt/sessions/today',
    resToday.status === 200,
    `Status ${resToday.status} — ${resToday.json?.message || (resToday.json?.data ? `Found ${resToday.json.data.length || 0} sessions` : resToday.raw?.slice(0, 100))}`
  );

  // P2-01: POST /api/dt/sessions/:id/mark-emergency
  const resEmerg = await request(`/dt/sessions/${testState.sessionId}/mark-emergency`, 'POST', {});
  addResult(
    'P2-01: POST /api/dt/sessions/:id/mark-emergency',
    [200, 201].includes(resEmerg.status),
    `Status ${resEmerg.status} — ${resEmerg.json?.message || resEmerg.raw?.slice(0, 100)}`
  );

  // P2-02: GET /api/dt/patients/:id
  const resPatient = await request(`/dt/patients/${testState.patientId}`);
  addResult(
    'P2-02: GET /api/dt/patients/:id',
    resPatient.status === 200,
    `Status ${resPatient.status} — ${resPatient.json?.message || (resPatient.json?.data ? 'Patient data returned' : resPatient.raw?.slice(0, 100))}`
  );

  // P2-02: Patient Sub-resource Endpoints
  const resPrescr = await request(`/dt/patients/${testState.patientId}/prescriptions/latest`);
  addResult('P2-02: GET /api/dt/patients/:id/prescriptions/latest', resPrescr.status === 200, `Status ${resPrescr.status}`);

  const resPatientVitals = await request(`/dt/patients/${testState.patientId}/vitals/latest`);
  addResult('P2-02: GET /api/dt/patients/:id/vitals/latest', resPatientVitals.status === 200, `Status ${resPatientVitals.status}`);

  const resPatientLabs = await request(`/dt/patients/${testState.patientId}/labs/latest`);
  addResult('P2-02: GET /api/dt/patients/:id/labs/latest', resPatientLabs.status === 200, `Status ${resPatientLabs.status}`);

  const resPatientAlerts = await request(`/dt/patients/${testState.patientId}/alerts`);
  addResult('P2-02: GET /api/dt/patients/:id/alerts', resPatientAlerts.status === 200, `Status ${resPatientAlerts.status}`);

  const resPatientNotes = await request(`/dt/patients/${testState.patientId}/notes`);
  addResult('P2-02: GET /api/dt/patients/:id/notes', resPatientNotes.status === 200, `Status ${resPatientNotes.status}`);

  // P2-02: POST /api/dt/patients/:id/proceed-predialysis
  const resProceed = await request(`/dt/patients/${testState.patientId}/proceed-predialysis`, 'POST', {});
  addResult('P2-02: POST /api/dt/patients/:id/proceed-predialysis', [200, 201].includes(resProceed.status), `Status ${resProceed.status}`);

  // P2-03: GET /api/dt/sessions/:id/predialysis-status
  const resStatus = await request(`/dt/sessions/${testState.sessionId}/predialysis-status`);
  addResult('P2-03: GET /api/dt/sessions/:id/predialysis-status', resStatus.status === 200, `Status ${resStatus.status}`);

  // P2-03: POST /api/dt/sessions/:id/print-summary
  const resPrint = await request(`/dt/sessions/${testState.sessionId}/print-summary`, 'POST', {});
  addResult(
    'P2-03: POST /api/dt/sessions/:id/print-summary',
    [200, 201, 403].includes(resPrint.status),
    `Status ${resPrint.status} (Note: 403 expected if non-nephrologist role)`
  );

  // P2-04: GET /api/dt/patients/:id/dialyzer-status
  const resDlzrStatus = await request(`/dt/patients/${testState.patientId}/dialyzer-status`);
  addResult('P2-04: GET /api/dt/patients/:id/dialyzer-status', resDlzrStatus.status === 200, `Status ${resDlzrStatus.status}`);

  // P2-08: Machine endpoints
  const resMachineQc = await request(`/dt/machines/${testState.machineId}/qc/today`);
  addResult('P2-08: GET /api/dt/machines/:id/qc/today', resMachineQc.status === 200, `Status ${resMachineQc.status}`);

  const resMachineSelf = await request(`/dt/machines/${testState.machineId}/self-test/today`);
  addResult('P2-08: GET /api/dt/machines/:id/self-test/today', resMachineSelf.status === 200, `Status ${resMachineSelf.status}`);

  // P2-09: RO plant endpoints
  const resRoCheck = await request(`/dt/ro-plants/${testState.roPlantId}/shift-check/current?shift_id=${testState.shiftId}`);
  addResult('P2-09: GET /api/dt/ro-plants/:id/shift-check/current', resRoCheck.status === 200, `Status ${resRoCheck.status}`);

  const resRoVerif = await request(`/dt/ro-plants/${testState.roPlantId}/verification/today`);
  addResult('P2-09: GET /api/dt/ro-plants/:id/verification/today', resRoVerif.status === 200, `Status ${resRoVerif.status}`);

  // -------------------------------------------------------------------------
  // 3. End-to-End Pre-Dialysis Workflow Simulation (P2-04 to P2-12)
  // -------------------------------------------------------------------------
  reportLines.push(`\n## 3. End-to-End Pre-Dialysis Workflow (P2-04 to P2-12)\n`);

  // P2-04: Patient Verification
  const payloadP2_04_Verif = {
    status: 'final',
    identity_matched: true,
    identity_name_match: true,
    identity_dob_match: true,
    identity_pid_match: true,
    identity_phone_match: true,
    wristband_scan_result: 'matched',
    prescription_valid: true,
    hiv_status: 'Negative',
    hepatitis_status: 'Negative',
    hiv_skipped: false,
    hepatitis_skipped: false,
    notes: 'Verification test',
  };
  const resVerif = await request(`/dt/sessions/${testState.sessionId}/verification`, 'POST', payloadP2_04_Verif);
  addResult('Step P2-04 (Verification)', [200, 201].includes(resVerif.status), `Status ${resVerif.status} — ${resVerif.json?.message || resVerif.raw?.slice(0, 80)}`);

  // P2-04: Consumables
  const payloadP2_04_Consum = {
    dialyzer_type: 'MULTI_USE',
    dialyzer_id: 'DLZ-1001',
    reuse_action: 'none',
    old_dialyzer_discard_confirmed: false,
    tubing_set_qty: 1,
    needles_qty: 2,
  };
  const resConsum = await request(`/dt/sessions/${testState.sessionId}/consumables`, 'POST', payloadP2_04_Consum);
  addResult('Step P2-04 (Consumables)', [200, 201].includes(resConsum.status), `Status ${resConsum.status} — ${resConsum.json?.message || resConsum.raw?.slice(0, 80)}`);

  // P2-05: Pre-dialysis Vitals
  const payloadP2_05_Vitals = {
    status: 'final',
    bp_systolic: 120,
    bp_diastolic: 80,
    pulse: 72,
    temperature: 36.8,
    spo2: 98,
    weight_pre: 68.5,
    edw: 66.0,
    heparin_dose_units: 2000,
    heparin_concentration: 5000,
    saline_flush_ml: 100,
    treatment_duration_hours: 4,
    respiratory_rate: 16,
    height_cm: 170,
    pain_score: 0,
    glucose: 110,
    kt_v_assessment_flag: false,
    notes: 'Vitals test',
    skips: [],
  };
  const resVitals = await request(`/dt/sessions/${testState.sessionId}/vitals`, 'POST', payloadP2_05_Vitals);
  addResult('Step P2-05 (Vitals)', [200, 201].includes(resVitals.status), `Status ${resVitals.status} — ${resVitals.json?.message || resVitals.raw?.slice(0, 80)}`);

  // P2-06: Assessment
  const payloadP2_06_Assess = {
    status: 'final',
    section: 'Subjective Assessment',
    assessment: {
      shortness_of_breath: 'no',
      chest_pain: 'no',
      bleeding_bruising: 'no',
      dizziness_giddiness: 'no',
      fever_chills: 'no',
      any_abnormal_finding: 'no',
      consciousness: 'alert',
      lung_sounds: 'clear',
      heart_sounds: 'normal',
    },
    skips: [],
  };
  const resAssess = await request(`/dt/sessions/${testState.sessionId}/assessment`, 'POST', payloadP2_06_Assess);
  addResult('Step P2-06 (Assessment)', [200, 201].includes(resAssess.status), `Status ${resAssess.status} — ${resAssess.json?.message || resAssess.raw?.slice(0, 80)}`);

  // P2-07: Vascular Access
  const payloadP2_07_Access = {
    status: 'final',
    access_type: 'AVF',
    thrill_bruit: 'present',
    access_site_appearance: 'normal',
    signs_of_infection: 'no',
    bleeding_discharge: 'no',
    aneurysm: 'no',
    cannulation_zone: 'adequate',
    access_flow_ml_min: 600,
    additional_observations: '',
    skips: [],
  };
  const resAccess = await request(`/dt/sessions/${testState.sessionId}/vascular-access`, 'POST', payloadP2_07_Access);
  addResult('Step P2-07 (Vascular Access)', [200, 201].includes(resAccess.status), `Status ${resAccess.status} — ${resAccess.json?.message || resAccess.raw?.slice(0, 80)}`);

  // P2-08: Machine Safety Review
  const payloadP2_08_Machine = { machine_id: testState.machineId };
  const resMachineRev = await request(`/dt/sessions/${testState.sessionId}/machine-safety/review`, 'POST', payloadP2_08_Machine);
  addResult('Step P2-08 (Machine Safety Review)', [200, 201].includes(resMachineRev.status), `Status ${resMachineRev.status} — ${resMachineRev.json?.message || resMachineRev.raw?.slice(0, 80)}`);

  // P2-09: Water Safety Review
  const payloadP2_09_Water = { ro_plant_id: testState.roPlantId, shift_id: testState.shiftId };
  const resWaterRev = await request(`/dt/sessions/${testState.sessionId}/water-safety/review`, 'POST', payloadP2_09_Water);
  addResult('Step P2-09 (Water Safety Review)', [200, 201].includes(resWaterRev.status), `Status ${resWaterRev.status} — ${resWaterRev.json?.message || resWaterRev.raw?.slice(0, 80)}`);

  // P2-10: Infection Control
  const payloadP2_10_Infection = {
    status: 'final',
    access_type: 'AVF',
    items: {
      hand_hygiene: true,
      aseptic_technique: true,
      sharps_handling: true,
      ppe: true,
      work_area_clean: true,
      dialysis_machine_disinfected: true,
      ro_system_disinfection: 'not_applicable',
      dialyzer_reuse: 'not_applicable',
      biomedical_waste: true,
      isolation_precautions: 'not_applicable',
    },
    scrub_the_hub_result: null,
    notes: '',
    skips: [],
  };
  const resInfection = await request(`/dt/sessions/${testState.sessionId}/infection-control`, 'POST', payloadP2_10_Infection);
  addResult('Step P2-10 (Infection Control)', [200, 201].includes(resInfection.status), `Status ${resInfection.status} — ${resInfection.json?.message || resInfection.raw?.slice(0, 80)}`);

  // P2-11: Safety Validation
  const payloadP2_11_Validate = { notes: 'Validation step' };
  const resValidate = await request(`/dt/sessions/${testState.sessionId}/validate`, 'POST', payloadP2_11_Validate);
  addResult('Step P2-11 (Validate)', [200, 201].includes(resValidate.status), `Status ${resValidate.status} — ${resValidate.json?.message || resValidate.raw?.slice(0, 80)}`);

  // P2-12: Start Dialysis Confirmation
  const payloadP2_12_Start = { attestation: true, pin: '1234', machine_id: testState.machineId };
  const resStart = await request(`/dt/sessions/${testState.sessionId}/start`, 'POST', payloadP2_12_Start);
  addResult(
    'Step P2-12 (Start Dialysis)',
    [200, 201].includes(resStart.status),
    `Status ${resStart.status} — ${resStart.json?.message || resStart.raw?.slice(0, 80)}`
  );

  // Logout digest
  const resLogout = await request('/dt/predialysis/logout-digest', 'POST', {});
  addResult('Logout Digest', [200, 201].includes(resLogout.status), `Status ${resLogout.status}`);

  // Summary statistics
  reportLines.push(`\n## Summary`);
  reportLines.push(`- **Passed**: ${passedCount}`);
  reportLines.push(`- **Failed**: ${failedCount}`);

  fs.writeFileSync(REPORT_PATH, reportLines.join('\n'));
  console.log(`\nAudit completed! Report saved to ${REPORT_PATH}`);
}

runAuditSuite().catch(console.error);
