/**
 * @jest-environment node
 */

// Helper function mirroring P2 effectiveSessionId resolution logic
function resolveP2SessionId({ propSessionId, state, localStorageValue, sessionStorageValue, patientId }) {
  if (propSessionId) return String(propSessionId).trim();
  try {
    const fromState = state?.sessionId || state?.session_id || state?.dialysis_session_id;
    if (fromState) return String(fromState).trim();
    const persisted = localStorageValue || sessionStorageValue;
    if (persisted) return String(persisted).trim();
  } catch {}
  return String(patientId || 1).trim();
}

// Helper function mirroring bed assignment response extraction logic
function extractDialysisSessionIdFromBedAssign(res) {
  if (!res) return null;
  const dataObj = res.data?.data || res.data || res;
  return (
    dataObj.dialysis_session_id ||
    dataObj.session_id ||
    dataObj.dialysisSessionId ||
    dataObj.sessionId ||
    res.dialysis_session_id ||
    res.session_id ||
    null
  );
}

describe('P2 dialysis_session_id wiring & resolution from api/dt/beds/assign', () => {
  describe('extractDialysisSessionIdFromBedAssign', () => {
    it('extracts dialysis_session_id from nested res.data.data object', () => {
      const res = {
        success: true,
        data: {
          data: {
            bed_id: 10,
            patient_id: 42,
            dialysis_session_id: 'DS-2026-99',
          },
        },
      };
      expect(extractDialysisSessionIdFromBedAssign(res)).toBe('DS-2026-99');
    });

    it('extracts dialysis_session_id from res.data object', () => {
      const res = {
        success: true,
        data: {
          bed_id: 10,
          patient_id: 42,
          dialysis_session_id: 8821,
        },
      };
      expect(extractDialysisSessionIdFromBedAssign(res)).toBe(8821);
    });

    it('extracts session_id from res.data object', () => {
      const res = {
        success: true,
        data: {
          session_id: 'S-771',
        },
      };
      expect(extractDialysisSessionIdFromBedAssign(res)).toBe('S-771');
    });

    it('returns null if response contains no session ID', () => {
      const res = { success: true, data: { bed_id: 10 } };
      expect(extractDialysisSessionIdFromBedAssign(res)).toBeNull();
    });
  });

  describe('resolveP2SessionId', () => {
    it('prioritizes explicit propSessionId when passed', () => {
      const result = resolveP2SessionId({
        propSessionId: 'DS-100',
        state: { dialysis_session_id: 'DS-200' },
        localStorageValue: 'DS-300',
        patientId: '42',
      });
      expect(result).toBe('DS-100');
    });

    it('uses location.state.dialysis_session_id when prop is missing', () => {
      const result = resolveP2SessionId({
        propSessionId: null,
        state: { dialysis_session_id: 'DS-200' },
        localStorageValue: 'DS-300',
        patientId: '42',
      });
      expect(result).toBe('DS-200');
    });

    it('uses location.state.session_id as secondary state field', () => {
      const result = resolveP2SessionId({
        propSessionId: null,
        state: { session_id: 'DS-555' },
        localStorageValue: 'DS-300',
        patientId: '42',
      });
      expect(result).toBe('DS-555');
    });

    it('falls back to persisted localStorage/sessionStorage value', () => {
      const result = resolveP2SessionId({
        propSessionId: null,
        state: {},
        localStorageValue: 'DS-300',
        patientId: '42',
      });
      expect(result).toBe('DS-300');
    });

    it('defaults to patientId when no session ID exists anywhere', () => {
      const result = resolveP2SessionId({
        propSessionId: null,
        state: {},
        localStorageValue: null,
        patientId: '42',
      });
      expect(result).toBe('42');
    });
  });
});
