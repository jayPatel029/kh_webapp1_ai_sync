const baseUrl = (process.env.P4_API_BASE || 'https://api.kifaytihealth.com/api1/api/dt').replace(/\/$/, '');
const token = process.env.P4_VERIFY_TOKEN;
const sessionId = process.env.P4_SESSION_ID;

if (!token || !sessionId) {
  console.error('Usage: P4_VERIFY_TOKEN=<jwt> P4_SESSION_ID=<id> node scripts/verify_p4_api.js');
  process.exit(2);
}

const checks = [
  ['GET', `/sessions/${sessionId}/outcome`],
  ['GET', `/sessions/${sessionId}/medications`],
  ['GET', `/sessions/${sessionId}/discharge-readiness`],
  ['GET', `/sessions/${sessionId}/complete-summary`],
];

async function main() {
  for (const [method, path] of checks) {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    const body = await response.json().catch(() => null);
    const result = body?.success === true ? 'SUCCESS' : body?.error_code || 'INVALID_RESPONSE';
    console.log(`${method} ${path} -> HTTP ${response.status} ${result}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
