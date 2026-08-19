import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../component-library';
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

  return (
    <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
      <Button variant={isPre ? 'primary' : 'outline'} size="sm" onClick={goPre}>Pre-Dialysis</Button>
      <Button variant={isDuring ? 'primary' : 'outline'} size="sm" onClick={goDuring} disabled={!sessionId} title={!sessionId ? 'Start dialysis to enable' : ''}>During Dialysis</Button>
      <Button variant={isPost ? 'primary' : 'outline'} size="sm" onClick={goPost} disabled={!sessionId} title={!sessionId ? 'Complete during to enable' : ''}>Post-Dialysis</Button>
      {patientId && <span style={{ marginLeft: '12px', fontSize: '12px', color: '#64748b', alignSelf: 'center' }}>Patient #{patientId} {sessionId ? `· Session ${sessionId}` : ''}</span>}
    </div>
  );
}
