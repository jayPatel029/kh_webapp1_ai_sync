const BASE_URL = (process.env.P3_API_BASE || 'https://api.kifaytihealth.com/api1/api').replace(/\/$/, '');
const TOKEN = process.env.P3_VERIFY_TOKEN;
const TECHNICIAN_ID = process.env.P3_TECHNICIAN_ID;
const requestedSessionId = process.env.P3_SESSION_ID;

if (!TOKEN) {
  console.error('Usage: P3_VERIFY_TOKEN=<jwt> [P3_SESSION_ID=<active-session-id>] node scripts/verify_p3_api.js');
  process.exit(2);
}

const request = async (path, options = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${TOKEN}`,
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => null);
  return { status: response.status, body };
};

const resultState = (response) => {
  if (response.body?.success === true) return 'PASS';
  if (response.body?.error_code) return response.body.error_code;
  return `HTTP_${response.status}`;
};

const check = async (label, path) => {
  const response = await request(path);
  console.log(`${label}: ${response.status} ${resultState(response)}`);
  return response;
};

async function main() {
  await check('Health', '/../health');

  const today = await check('P2 session discovery', '/dt/sessions/today');
  const items = today.body?.data?.items || [];
  const sessionId = requestedSessionId || items.find((item) =>
    ['STARTED', 'RUNNING', 'IN_PROGRESS'].includes(String(item.state || item.status).toUpperCase())
  )?.session_id || items.find((item) => item.session_id)?.session_id;

  if (!sessionId) {
    console.log('P3 workflow: BLOCKED_NO_ACTIVE_SESSION');
    return;
  }

  console.log(`P3 session selected: ${sessionId}`);
  const sessionChecks = [
    ['P3-01 dashboard', `/dt/sessions/${sessionId}/dashboard`],
    ['P3-02 vitals history', `/dt/sessions/${sessionId}/vitals-intradialytic?range=2h`],
    ['P3-03 machine history', `/dt/sessions/${sessionId}/machine-parameters?range=2h`],
    ['P3-06 due medications', `/dt/sessions/${sessionId}/medications/due`],
    ['P3-08 progress', `/dt/sessions/${sessionId}/progress`],
    ['P3-09 incidents', `/dt/sessions/${sessionId}/incidents`],
  ];
  for (const [label, path] of sessionChecks) await check(label, path);

  const patientId = items.find((item) => String(item.session_id) === String(sessionId))?.patient_id;
  if (patientId) await check('P3-06 patient allergies', `/dt/patients/${patientId}/allergies`);
  if (TECHNICIAN_ID) await check('P3-02 overdue vitals', `/dt/technicians/${TECHNICIAN_ID}/overdue-vitals`);
}

main().catch((error) => {
  console.error(`P3 verifier failed: ${error.message}`);
  process.exitCode = 1;
});
