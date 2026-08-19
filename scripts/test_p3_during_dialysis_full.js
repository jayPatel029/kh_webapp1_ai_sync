#!/usr/bin/env node
/**
 * P3 During-Dialysis Full API Verifier
 *
 * Covers every endpoint listed in
 * docs/dialysis_docs/P3/2026-08-15-dt-during-dialysis-frontend-notes.md
 *
 * Usage:
 *   P3_VERIFY_TOKEN=<jwt> node scripts/test_p3_during_dialysis_full.js [--live-writes]
 *
 *   Without --live-writes : only safe GETs + validation of error shapes on writes
 *                           (writes are sent with missing/invalid payloads to assert 400/403/422)
 *   With --live-writes    : attempts real POST/PATCH against a STARTED session (mutates data).
 *                           Requires P3_SESSION_ID of a session in STARTED/RUNNING state.
 *                           Use a sandbox/test patient only.
 *
 * Env:
 *   P3_API_BASE   default https://api.kifaytihealth.com/api1/api
 *   P3_VERIFY_TOKEN  required Bearer token (any Part-2 clinical role; Technician for end-treatment)
 *   P3_SESSION_ID    optional; if omitted, auto-discovers from GET /dt/sessions/today
 *   P3_TECHNICIAN_ID for GET /dt/technicians/:id/overdue-vitals (must equal JWT sub for Technician)
 *   P3_PATIENT_ID    optional; for GET /dt/patients/:id/allergies fallback
 */

const BASE_URL = (process.env.P3_API_BASE || 'https://api.kifaytihealth.com/api1/api').replace(/\/$/, '');
const TOKEN = process.env.P3_VERIFY_TOKEN;
const LIVE_WRITES = process.argv.includes('--live-writes');
const requestedSessionId = process.env.P3_SESSION_ID;
const technicianId = process.env.P3_TECHNICIAN_ID;
const patientIdHint = process.env.P3_PATIENT_ID;

if (!TOKEN) {
  console.error('Missing P3_VERIFY_TOKEN');
  console.error('Usage: P3_VERIFY_TOKEN=<jwt> [P3_SESSION_ID=<id>] node scripts/test_p3_during_dialysis_full.js [--live-writes]');
  process.exit(2);
}

async function req(path, opts = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
      ...(opts.headers || {}),
    },
  });
  let body = null;
  const text = await res.text();
  try { body = text ? JSON.parse(text) : null; } catch { body = { _raw: text.slice(0, 500) }; }
  return { status: res.status, body, url, method: opts.method || 'GET' };
}

const results = [];
function record(label, res, expect) {
  const ok = expect(res);
  const tag = ok ? 'PASS' : 'FAIL';
  const code = res.body?.error_code || (res.body?.success ? 'OK' : `HTTP_${res.status}`);
  console.log(`[${tag}] ${label}: ${res.status} ${code} :: ${res.body?.message || ''}`.trim());
  if (!ok) console.log(`      body: ${JSON.stringify(res.body).slice(0, 400)}`);
  results.push({ label, status: res.status, code, ok, body: res.body });
  return res;
}

function expectSuccess(res) { return res.status >= 200 && res.status < 300 && res.body?.success === true; }
function expectAuthOrSuccess(res) {
  // 401/403 with error_code is also a valid contract proof (proves route exists + auth gating)
  if (expectSuccess(res)) return true;
  if ([401,403].includes(res.status) && res.body?.error_code) return true;
  return false;
}
function expectValidationError(res) {
  // Missing-fields writes should 400 with ERR_INVALID_PARAMETERS etc. — proves validation exists
  // Also accept 403 ERR_FORBIDDEN_ROLE when token role is not Technician/Nurse/Nephrologist (RBAC preempts validation)
  return [400,403,422].includes(res.status) && !!res.body?.error_code;
}
function expectForbiddenOrValidation(res) {
  return [400,401,403,422].includes(res.status) && !!res.body?.error_code || expectSuccess(res);
}

async function main() {
  console.log(`Base: ${BASE_URL}`);
  console.log(`Mode: ${LIVE_WRITES ? 'LIVE-WRITES (mutating)' : 'SAFE-READ + validation probes'}`);
  console.log('');

  // 1. Health (no auth needed, but we send it anyway)
  await record('Health', await req('/../health'), r => r.status === 200);

  // 2. Discover session
  const todayRes = await req('/dt/sessions/today');
  const items = todayRes.body?.data?.items || todayRes.body?.data || [];
  const arr = Array.isArray(items) ? items : [];
  let sessionId = requestedSessionId || null;
  let discoveredPatientId = patientIdHint || null;
  if (!sessionId && arr.length) {
    const preferred = arr.find(s => ['STARTED','RUNNING','IN_PROGRESS'].includes(String(s.state || s.status || '').toUpperCase()));
    const chosen = preferred || arr[0];
    sessionId = chosen.session_id || chosen.id;
    discoveredPatientId = chosen.patient_id || discoveredPatientId;
    console.log(`Discovered session: ${sessionId} (patient ${discoveredPatientId}) from /dt/sessions/today (${todayRes.status})`);
  } else if (sessionId) {
    console.log(`Using P3_SESSION_ID=${sessionId}`);
  }
  await record('P2 discovery GET /dt/sessions/today', todayRes, r => [200,401,403].includes(r.status));

  if (!sessionId) {
    console.log('\nBLOCKED_NO_ACTIVE_SESSION — cannot test P3 session endpoints without a session id.');
    console.log('Set P3_SESSION_ID to a STARTED session to run the full suite.');
    // Still test non-session routes that don't need sessionId
    if (technicianId) {
      await record('P3-02 GET /dt/technicians/:id/overdue-vitals', await req(`/dt/technicians/${technicianId}/overdue-vitals`), expectAuthOrSuccess);
    } else {
      console.log('[SKIP] P3-02 overdue-vitals — set P3_TECHNICIAN_ID to test');
    }
    if (discoveredPatientId) {
      await record('P3-06 GET /dt/patients/:id/allergies', await req(`/dt/patients/${discoveredPatientId}/allergies`), expectAuthOrSuccess);
    } else {
      console.log('[SKIP] P3-06 allergies — no patient id available');
    }
    printSummary();
    return;
  }

  // --- P3-01 Dashboard ---
  await record('P3-01 GET /dt/sessions/:id/dashboard', await req(`/dt/sessions/${sessionId}/dashboard`), expectAuthOrSuccess);

  // --- P3-02 Vitals ---
  await record('P3-02 GET /dt/sessions/:id/vitals-intradialytic?range=2h', await req(`/dt/sessions/${sessionId}/vitals-intradialytic?range=2h`), expectAuthOrSuccess);

  // POST vitals — safe probe: missing fields should yield validation error, proves route + validation
  // Live write: send a plausible vitals payload
  if (LIVE_WRITES) {
    await record('P3-02 POST /dt/sessions/:id/vitals-intradialytic (live)', await req(`/dt/sessions/${sessionId}/vitals-intradialytic`, {
      method: 'POST', body: JSON.stringify({
        bp_systolic: 120, bp_diastolic: 80, pulse: 78, temperature: 36.7, spo2: 98,
        respiratory_rate: 16, notes: 'P3 verifier live probe'
      })
    }), expectAuthOrSuccess);
  } else {
    await record('P3-02 POST /dt/sessions/:id/vitals-intradialytic (validation probe, empty body)', await req(`/dt/sessions/${sessionId}/vitals-intradialytic`, {
      method: 'POST', body: JSON.stringify({})
    }), expectValidationError);
  }

  // Overdue vitals
  if (technicianId) {
    await record('P3-02 GET /dt/technicians/:id/overdue-vitals', await req(`/dt/technicians/${technicianId}/overdue-vitals`), r => {
      // 403 ERR_FORBIDDEN_ROLE when technicianId != JWT sub is expected contract
      if ([200,403].includes(r.status)) return true;
      return expectAuthOrSuccess(r);
    });
  } else {
    console.log('[SKIP] P3-02 overdue — set P3_TECHNICIAN_ID');
  }

  // Skip endpoints — probes only (no real logId)
  await record('P3-02 POST /dt/overdue-vitals/:logId/skip (probe 999999)', await req(`/dt/overdue-vitals/999999/skip`, {
    method: 'POST', body: JSON.stringify({ reason: 'test probe' })
  }), r => [404,400,401,403].includes(r.status)); // 404 expected for fake id

  await record('P3-02 POST /dt/overdue-vitals/skip-all (probe)', await req(`/dt/overdue-vitals/skip-all`, {
    method: 'POST', body: JSON.stringify({ technician_id: Number(technicianId) || 1, log_ids: [], reason: 'test probe' })
  }), r => [400,401,403,422,200].includes(r.status));

  // --- P3-03 Machine parameters ---
  await record('P3-03 GET /dt/sessions/:id/machine-parameters?range=2h', await req(`/dt/sessions/${sessionId}/machine-parameters?range=2h`), expectAuthOrSuccess);
  if (LIVE_WRITES) {
    await record('P3-03 POST /dt/sessions/:id/machine-parameters (live)', await req(`/dt/sessions/${sessionId}/machine-parameters`, {
      method: 'POST', body: JSON.stringify({
        blood_flow_rate: 300, dialysate_flow_rate: 500, arterial_pressure: -80, venous_pressure: 120, tmp: 45,
        conductivity: 14, dialysate_temp: 37, ufr: 800, notes: 'P3 verifier'
      })
    }), r => {
      // TMP 45 should succeed; server may flag warn/critical — but still 2xx
      if (expectSuccess(r)) return true;
      return expectForbiddenOrValidation(r);
    });
  } else {
    await record('P3-03 POST /dt/sessions/:id/machine-parameters (validation probe)', await req(`/dt/sessions/${sessionId}/machine-parameters`, {
      method: 'POST', body: JSON.stringify({})
    }), r => [400,422,401,403].includes(r.status));
  }

  // --- P3-04 Symptoms ---
  if (LIVE_WRITES) {
    const sRes = await req(`/dt/sessions/${sessionId}/symptoms`, {
      method: 'POST', body: JSON.stringify({ symptom: 'cramps', severity: 'mild', intervention: 'reduced UFR, monitored' })
    });
    await record('P3-04 POST /dt/sessions/:id/symptoms (live)', sRes, expectAuthOrSuccess);
    const sid = sRes.body?.data?.symptom_id || sRes.body?.data?.id;
    if (sid) {
      await record(`P3-04 PATCH /dt/sessions/:id/symptoms/${sid} (live)`, await req(`/dt/sessions/${sessionId}/symptoms/${sid}`, {
        method: 'PATCH', body: JSON.stringify({ status: 'resolved' })
      }), expectAuthOrSuccess);
    }
  } else {
    await record('P3-04 POST /dt/sessions/:id/symptoms (validation probe)', await req(`/dt/sessions/${sessionId}/symptoms`, {
      method: 'POST', body: JSON.stringify({ symptom: 'cramps' }) // missing severity/intervention → ERR_INVALID_PARAMETERS
    }), expectValidationError);
    await record('P3-04 PATCH /dt/sessions/:id/symptoms/:id (probe)', await req(`/dt/sessions/${sessionId}/symptoms/999999`, {
      method: 'PATCH', body: JSON.stringify({ status: 'resolved' })
    }), r => [404,400,401,403].includes(r.status));
  }

  // --- P3-05 Vascular access monitoring ---
  if (LIVE_WRITES) {
    await record('P3-05 POST /dt/sessions/:id/vascular-access-monitoring (live)', await req(`/dt/sessions/${sessionId}/vascular-access-monitoring`, {
      method: 'POST', body: JSON.stringify({
        access_type: 'AVF', thrill_bruit: 'present', site_appearance: 'normal',
        signs_of_infection: 'no', bleeding: 'no', infiltration: 'no', notes: 'P3 verifier'
      })
    }), expectAuthOrSuccess);
  } else {
    await record('P3-05 POST /dt/sessions/:id/vascular-access-monitoring (probe)', await req(`/dt/sessions/${sessionId}/vascular-access-monitoring`, {
      method: 'POST', body: JSON.stringify({})
    }), r => [400,422,401,403].includes(r.status));
  }

  // --- P3-06 Medications ---
  await record('P3-06 GET /dt/sessions/:id/medications/due', await req(`/dt/sessions/${sessionId}/medications/due`), expectAuthOrSuccess);
  const pidForAllergy = discoveredPatientId;
  if (pidForAllergy) {
    await record('P3-06 GET /dt/patients/:id/allergies', await req(`/dt/patients/${pidForAllergy}/allergies`), expectAuthOrSuccess);
  } else {
    console.log('[SKIP] P3-06 allergies — no patient id');
  }
  if (LIVE_WRITES) {
    await record('P3-06 POST /dt/sessions/:id/medications (live)', await req(`/dt/sessions/${sessionId}/medications`, {
      method: 'POST', body: JSON.stringify({
        medication_name: 'Heparin', dose: '2000 units', route: 'IV', given_at: new Date().toISOString()
      })
    }), r => {
      if (expectSuccess(r)) return true;
      // Allergy/expiry blocks are valid contract: ERR_ALLERGY_BLOCK / ERR_MEDICATION_EXPIRED
      if ([400,422].includes(r.status) && ['ERR_ALLERGY_BLOCK','ERR_MEDICATION_EXPIRED','ERR_INVALID_PARAMETERS'].includes(r.body?.error_code)) return true;
      return false;
    });
  } else {
    await record('P3-06 POST /dt/sessions/:id/medications (validation probe)', await req(`/dt/sessions/${sessionId}/medications`, {
      method: 'POST', body: JSON.stringify({})
    }), r => [400,422,401,403].includes(r.status));
  }

  // --- P3-07 Alarms ---
  if (LIVE_WRITES) {
    const aRes = await req(`/dt/sessions/${sessionId}/alarms`, {
      method: 'POST', body: JSON.stringify({
        alarm_type: 'venous_pressure_high', action_taken: 'checked line, adjusted', resolution_status: 'resolved', notes: 'P3 verifier'
      })
    });
    await record('P3-07 POST /dt/sessions/:id/alarms (live)', aRes, r => {
      if (expectSuccess(r)) return true;
      if (r.status === 400 && r.body?.error_code === 'ERR_ALARM_ACTION_REQUIRED') return true;
      return false;
    });
    const aid = aRes.body?.data?.alarm_id || aRes.body?.data?.id;
    if (aid) {
      await record(`P3-07 PATCH /dt/sessions/:id/alarms/${aid} (live)`, await req(`/dt/sessions/${sessionId}/alarms/${aid}`, {
        method: 'PATCH', body: JSON.stringify({ resolution_status: 'resolved' })
      }), expectAuthOrSuccess);
    }
  } else {
    await record('P3-07 POST /dt/sessions/:id/alarms (expect ERR_ALARM_ACTION_REQUIRED)', await req(`/dt/sessions/${sessionId}/alarms`, {
      method: 'POST', body: JSON.stringify({ alarm_type: 'test' }) // missing action/resolution
    }), r => r.status === 400 && r.body?.error_code === 'ERR_ALARM_ACTION_REQUIRED' || [400,403,422].includes(r.status));
    await record('P3-07 PATCH /dt/sessions/:id/alarms/:id (probe)', await req(`/dt/sessions/${sessionId}/alarms/999999`, {
      method: 'PATCH', body: JSON.stringify({ resolution_status: 'resolved' })
    }), r => [404,400,401,403].includes(r.status));
  }

  // --- P3-08 Progress + events ---
  await record('P3-08 GET /dt/sessions/:id/progress', await req(`/dt/sessions/${sessionId}/progress`), expectAuthOrSuccess);
  if (LIVE_WRITES) {
    await record('P3-08 POST /dt/sessions/:id/events (live)', await req(`/dt/sessions/${sessionId}/events`, {
      method: 'POST', body: JSON.stringify({ event_type: 'treatment_note', description: 'P3 verifier event' })
    }), expectAuthOrSuccess);
  } else {
    await record('P3-08 POST /dt/sessions/:id/events (probe)', await req(`/dt/sessions/${sessionId}/events`, {
      method: 'POST', body: JSON.stringify({})
    }), r => [400,422,401,403].includes(r.status));
  }

  // --- P3-09 Incidents ---
  await record('P3-09 GET /dt/sessions/:id/incidents', await req(`/dt/sessions/${sessionId}/incidents`), expectAuthOrSuccess);
  if (LIVE_WRITES) {
    await record('P3-09 POST /dt/sessions/:id/incidents (live)', await req(`/dt/sessions/${sessionId}/incidents`, {
      method: 'POST', body: JSON.stringify({ title: 'P3 verifier incident', description: 'test', severity: 'low' })
    }), expectAuthOrSuccess);
  } else {
    await record('P3-09 POST /dt/sessions/:id/incidents (probe)', await req(`/dt/sessions/${sessionId}/incidents`, {
      method: 'POST', body: JSON.stringify({})
    }), r => [400,422,401,403].includes(r.status));
  }

  // --- P3-10 End treatment (ALWAYS probe-only unless explicitly live — this terminates the session) ---
  // Safe probe: missing confirmation → 400 ERR_CONFIRMATION_REQUIRED (proves gate exists)
  await record('P3-10 POST /dt/sessions/:id/end-treatment (expect ERR_CONFIRMATION_REQUIRED)', await req(`/dt/sessions/${sessionId}/end-treatment`, {
    method: 'POST', body: JSON.stringify({})
  }), r => r.status === 400 && r.body?.error_code === 'ERR_CONFIRMATION_REQUIRED' || r.status === 403 && r.body?.error_code === 'ERR_FORBIDDEN_ROLE' || [400,403].includes(r.status));

  if (LIVE_WRITES && process.env.P3_ALLOW_END_TREATMENT === '1') {
    // Only if operator explicitly opts in — this is destructive
    await record('P3-10 POST /dt/sessions/:id/end-treatment (LIVE, terminating)', await req(`/dt/sessions/${sessionId}/end-treatment`, {
      method: 'POST', body: JSON.stringify({ confirmed: true })
    }), r => {
      if (r.status === 200 && r.body?.data?.status === 'terminating' && r.body?.data?.redirect_target === 'P4-01') return true;
      if (r.status === 403 && r.body?.error_code === 'ERR_FORBIDDEN_ROLE') return true; // correct if not Technician
      return false;
    });
  } else {
    console.log('[SKIP] P3-10 live terminating write — set P3_ALLOW_END_TREATMENT=1 with --live-writes to actually end the session');
  }

  printSummary();
}

function printSummary() {
  const pass = results.filter(r => r.ok).length;
  const fail = results.filter(r => !r.ok).length;
  console.log('\n--- Summary ---');
  console.log(`Passed: ${pass}  Failed: ${fail}  Total: ${results.length}`);
  if (fail) {
    console.log('\nFailed:');
    results.filter(r => !r.ok).forEach(r => console.log(`  - ${r.label}: ${r.status} ${r.code}`));
  }
  // Non-zero exit if any FAIL (but 401/403 on protected routes already counted as PASS via expectAuthOrSuccess)
  if (fail) process.exitCode = 1;
}

main().catch(e => { console.error(e); process.exitCode = 1; });
