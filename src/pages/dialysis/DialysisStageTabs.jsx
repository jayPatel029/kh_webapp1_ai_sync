import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/routeConstants';

export default function DialysisStageTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname || '';
  const state = location.state || {};

  // sessionId can come from route, state, or persisted storage
  const pathSessionId = (() => {
    const seg = location.pathname.split('/')[3];
    if ((pathname.includes('/during/') || pathname.includes('/post/')) && seg && !seg.startsWith('P')) return seg;
    return '';
  })();
  const persistedSessionId = (() => {
    try { return localStorage.getItem('lastDialysisSessionId') || sessionStorage.getItem('lastDialysisSessionId') || ''; } catch { return ''; }
  })();
  const sessionId = state.sessionId || state.session_id || pathSessionId || persistedSessionId || '';
  const patientId = state.patientId || state.patient_id || (() => { try { return localStorage.getItem('lastDialysisPatientId') || ''; } catch { return ''; } })();

  const isPre = pathname.startsWith('/dialysis/patients') || pathname === '/dialysis' || (!pathname.includes('/during/') && !pathname.includes('/post/'));
  const isDuring = pathname.includes('/dialysis/during/');
  const isPost = pathname.includes('/dialysis/post/');

  const goPre = () => {
    if (patientId) navigate(ROUTES.DIALYSIS_PATIENTS, { state: { patientId, view: 'dashboard', step: 'P2-03' } });
    else navigate(ROUTES.DIALYSIS_PATIENTS);
  };
  const goDuring = () => {
    if (!sessionId) return;
    navigate(`/dialysis/during/${sessionId}/P3-01`, { state: { patientId, sessionId } });
  };
  const goPost = () => {
    if (!sessionId) return;
    navigate(`/dialysis/post/${sessionId}/P4-01`, { state: { patientId, sessionId } });
  };

  const tabStyle = (active, disabled) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '40px',
    padding: '8px 14px',
    borderRadius: '9999px',
    border: active ? '1px solid #0f766e' : '1px solid #cbd5e1',
    background: active ? '#0f766e' : '#fff',
    color: active ? '#fff' : disabled ? '#94a3b8' : '#0f172a',
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: 1.3,
    whiteSpace: 'nowrap',
    overflow: 'visible',
    cursor: disabled ? 'not-allowed' : 'pointer',
  });

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 16px',
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        overflow: 'visible',
      }}
    >
      <button type="button" style={tabStyle(isPre, false)} onClick={goPre}>
        Pre-Dialysis
      </button>
      <button
        type="button"
        style={tabStyle(isDuring, !sessionId)}
        onClick={goDuring}
        disabled={!sessionId}
        title={!sessionId ? 'Start dialysis to enable' : ''}
      >
        During Dialysis
      </button>
      <button
        type="button"
        style={tabStyle(isPost, !sessionId)}
        onClick={goPost}
        disabled={!sessionId}
        title={!sessionId ? 'Complete during to enable' : ''}
      >
        Post-Dialysis
      </button>
      {patientId && (
        <span style={{ marginLeft: '4px', fontSize: '12px', color: '#64748b' }}>
          Patient #{patientId}{sessionId ? ` · Session ${sessionId}` : ''}
        </span>
      )}
    </div>
  );
}
