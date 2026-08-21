/**
 * @jest-environment node
 */
// Pure helper mirrors DuringDialysisPage resolution after fix
function resolveSessionId({ embeddedSessionId, routeSessionId, paramScreenId, state, search, localStorageValue, sessionStorageValue }) {
  const isScreenId = (v) => /^P[34]-/.test(String(v || ''));
  let resolvedRouteSessionId = routeSessionId;
  let resolvedScreenId = paramScreenId;
  if (isScreenId(routeSessionId) && !isScreenId(paramScreenId)) {
    resolvedScreenId = routeSessionId;
    resolvedRouteSessionId = '';
  }
  const querySessionId = (() => { try { const sp = new URLSearchParams(search || ''); return sp.get('sessionId') || sp.get('session_id') || sp.get('sessionID') || ''; } catch { return ''; } })();
  const persistedSessionId = sessionStorageValue || localStorageValue || '';
  const raw = embeddedSessionId || resolvedRouteSessionId || state?.sessionId || state?.session_id || state?.sessionID || querySessionId || persistedSessionId || '';
  return String(raw || '').trim();
}

describe('P3 sessionId resolution (bugfix)', () => {
  it('route param takes precedence', () => {
    expect(resolveSessionId({ routeSessionId: '123', paramScreenId: 'P3-01', state: {}, search: '', localStorageValue: '', sessionStorageValue: '' })).toBe('123');
  });

  it('localStorage fallback when sessionStorage empty (the reported bug)', () => {
    // Before fix: only sessionStorage was checked -> would return ''
    // After fix: localStorage is fallback -> returns '999'
    const v = resolveSessionId({ routeSessionId: 'P3-02', paramScreenId: undefined, state: {}, search: '', localStorageValue: '999', sessionStorageValue: '' });
    expect(v).toBe('999');
  });

  it('sessionStorage takes precedence over localStorage', () => {
    expect(resolveSessionId({ routeSessionId: 'P3-02', paramScreenId: undefined, state: {}, search: '', localStorageValue: '999', sessionStorageValue: '111' })).toBe('111');
  });

  it('query param ?sessionId=777', () => {
    expect(resolveSessionId({ routeSessionId: 'P3-02', paramScreenId: undefined, state: {}, search: '?sessionId=777', localStorageValue: '', sessionStorageValue: '' })).toBe('777');
  });

  it('embedded prop takes precedence over persisted', () => {
    expect(resolveSessionId({ embeddedSessionId: '555', routeSessionId: 'P3-01', paramScreenId: undefined, state: {}, search: '', localStorageValue: '999', sessionStorageValue: '' })).toBe('555');
  });

  it('handles /during/P3-03 without session using persisted', () => {
    expect(resolveSessionId({ routeSessionId: 'P3-03', paramScreenId: undefined, state: {}, search: '', localStorageValue: '321', sessionStorageValue: '' })).toBe('321');
  });

  it('state sessionId', () => {
    expect(resolveSessionId({ routeSessionId: '', paramScreenId: 'P3-01', state: { sessionId: '888' }, search: '', localStorageValue: '', sessionStorageValue: '' })).toBe('888');
  });

  it('returns empty when no source', () => {
    expect(resolveSessionId({ routeSessionId: '', paramScreenId: 'P3-01', state: {}, search: '', localStorageValue: '', sessionStorageValue: '' })).toBe('');
  });
});

function getValidSessionId(sessionId, currentPatientId) {
  const activeSessionId = String(sessionId || '').trim();
  const pid = String(currentPatientId || '').trim();
  if (!activeSessionId || activeSessionId === 'preview' || activeSessionId === 'demo') {
    return null;
  }
  if (pid && (activeSessionId === pid || activeSessionId === `P${pid}` || activeSessionId.toLowerCase() === pid.toLowerCase())) {
    return null;
  }
  return activeSessionId;
}

describe('getValidSessionId patientId rejection', () => {
  it('rejects sessionId when equal to patientId', () => {
    expect(getValidSessionId('P10023', 'P10023')).toBeNull();
    expect(getValidSessionId('23', '23')).toBeNull();
  });

  it('accepts real sessionId distinct from patientId', () => {
    expect(getValidSessionId('sess-999', 'P10023')).toBe('sess-999');
    expect(getValidSessionId('123', 'P10023')).toBe('123');
  });

  it('rejects preview or demo as sessionId', () => {
    expect(getValidSessionId('preview', 'P10023')).toBeNull();
    expect(getValidSessionId('demo', 'P10023')).toBeNull();
  });
});
