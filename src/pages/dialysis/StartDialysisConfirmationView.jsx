import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button } from '../../component-library';
import PreDialysisPatientProfileCard from '../../components/PreDialysisPatientProfileCard';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import { PRE_DIALYSIS_STEPS } from '../../hooks/usePreDialysisDashboard';
import { ROUTES } from '../../routes/routeConstants';
import './duringDialysis.css';
import { verifyPin, MAX_ATTEMPTS } from './startDialysisValidation';
import { startDialysis, unlockStartDialysis, getPatientDetails } from '../../ApiCalls/preDialysisApis';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const CARD_STYLE = {
  background: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const SECTION_TITLE_STYLE = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#0f172a',
  marginBottom: '8px',
};

const SUMMARY_ROWS = [
  { id: 1, item: 'Patient Verification', status: 'Completed', details: 'Identity and prescription verified', completedBy: 'Rahul Singh', time: '06:40 AM' },
  { id: 2, item: 'Vitals & Measurements', status: 'Completed', details: 'All vitals within acceptable range', completedBy: 'Rahul Singh', time: '06:42 AM' },
  { id: 3, item: 'Patient Assessment', status: 'Completed', details: 'No critical issues', completedBy: 'Rahul Singh', time: '06:45 AM' },
  { id: 4, item: 'Vascular Access Assessment', status: 'Completed', details: 'AV Fistula (Left) – Good', completedBy: 'Rahul Singh', time: '06:47 AM' },
  { id: 5, item: 'Machine Safety', status: 'Completed', details: 'All parameters normal', completedBy: 'Rahul Singh', time: '06:48 AM' },
  { id: 6, item: 'Water Safety', status: 'Completed', details: 'RO water quality normal', completedBy: 'Rahul Singh', time: '06:49 AM' },
  { id: 7, item: 'Infection Control', status: 'Completed', details: 'Checklist completed', completedBy: 'Rahul Singh', time: '06:50 AM' },
  { id: 8, item: 'Safety Validation', status: 'Completed', details: 'All safety criteria met', completedBy: 'Rahul Singh', time: '06:51 AM' },
];

const StartDialysisConfirmationView = ({ patientId, onBack, onNext, onNavigateStep }) => {
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const effectiveSessionId = React.useMemo(() => {
    try {
      const fromState = location.state?.sessionId || location.state?.session_id;
      if (fromState) return fromState;
      const persisted = localStorage.getItem('lastDialysisSessionId') || sessionStorage.getItem('lastDialysisSessionId');
      if (persisted) return persisted;
    } catch {}
    return patientId || 1;
  }, [location.state, patientId]);
  const [patientData, setPatientData] = useState(null);
  useEffect(() => {
    if (!patientId) return;
    let mounted = true;
    getPatientDetails(patientId).then((res) => { if (mounted && res?.success) setPatientData(res.data?.data || res.data); }).catch(()=>{});
    return () => { mounted = false; };
  }, [patientId]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  const isFormValid = isConfirmed && pin.trim().length > 0 && !isLocked;

  const handleStartDialysis = async () => {
    if (isLocked) return;

    const result = verifyPin(pin.trim(), attempts);
    
    if (result.isValid) {
      setErrorMsg('');
      let sessionId = null;
      try {
        const apiRes = await startDialysis(effectiveSessionId, {
          attestation: isConfirmed,
          pin: pin.trim(),
          machine_id: 'HD-01',
        });
        sessionId = apiRes?.data?.session_id || apiRes?.data?.data?.session_id || apiRes?.data?.id || null;
        if (!apiRes.success) {
          if (apiRes.status === 423) {
            setIsLocked(true);
            setErrorMsg(apiRes.message || 'Session locked due to multiple invalid PIN attempts. Requires Nurse or Nephrologist unlock.');
            return;
          }
        } else if (!sessionId) {
          sessionId = String(patientId || Date.now());
        }
      } catch (_) {
        sessionId = String(patientId || Date.now());
      }

      // Whole-workflow handoff: P2-12 → P3-01 During Dialysis
      if (sessionId) {
        try {
          localStorage.setItem('lastDialysisSessionId', String(sessionId));
          sessionStorage.setItem('lastDialysisSessionId', String(sessionId));
          if (patientId) {
            localStorage.setItem('lastDialysisPatientId', String(patientId));
            sessionStorage.setItem('lastDialysisPatientId', String(patientId));
          }
        } catch {}
        navigate(`/dialysis/during/${sessionId}/P3-01`, { state: { patientId, sessionId } });
        return;
      }
      if (onNext) onNext(sessionId);
    } else {
      setAttempts(result.attempts);
      setIsLocked(result.isLocked);
      setErrorMsg(result.error);
      setPin('');
    }
  };

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB] pb-[90px]">
        {/* Header Section */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-[#0f172a]">P2-12 – Start Dialysis Confirmation</h1>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" style={{ borderRadius: '20px' }}>
                <span className="flex items-center gap-1">📍 Main Center ▾</span>
              </Button>
            </div>
          </div>
          <p className="text-sm text-[#475569]">Final confirmation to start dialysis session.</p>
        </div>

        <div className={`admin-page-content ${isMobile ? 'px-3' : 'px-8'}`}>
          {/* 9-Step Progress Bar */}
          
          <nav className="during-stepper" aria-label="Pre-Dialysis steps">
            {PRE_DIALYSIS_STEPS.map((step, idx) => (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  className={step.id === 9 ? 'active' : ''}
                  onClick={() => { if (onNavigateStep) onNavigateStep(step.code); else navigate(ROUTES.DIALYSIS_PATIENTS, { state: { patientId, step: step.code } }); }}
                  aria-current={step.id === 9 ? 'step' : undefined}
                >
                  <span className="during-step-number">{step.id}</span>
                  <span>{step.name}</span>
                </button>
                {idx < PRE_DIALYSIS_STEPS.length - 1 && <span className="during-step-line" aria-hidden="true" />}
              </React.Fragment>
            ))}
          </nav>

          <PreDialysisPatientProfileCard patient={patientData} isMobile={isMobile} />

          {/* Pre-Dialysis Checklist Summary Table Card */}
          <div style={{ ...CARD_STYLE, marginBottom: '24px' }}>
            <div className="p-6 pb-2 flex justify-between items-center">
              <div>
                <h3 style={SECTION_TITLE_STYLE} className="!mb-0">Pre-Dialysis Checklist Summary</h3>
                <p className="text-sm text-[#475569]">All required checks must be completed before starting dialysis.</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#dcfce7] border border-[#bbf7d0] text-[#166534] rounded-full font-semibold text-xs">
                <CheckCircleIcon style={{ fontSize: '14px' }} /> All Clear
              </div>
            </div>

            <div className="w-full text-sm mt-4">
              {/* Header */}
              <div className="flex border-b border-[#e2e8f0] px-6 py-3 text-[#64748b] font-semibold text-xs uppercase tracking-wider">
                <div className="w-[30%]">Check Item</div>
                <div className="w-[15%]">Status</div>
                <div className="w-[30%]">Details</div>
                <div className="w-[15%]">Completed By</div>
                <div className="w-[10%]">Time</div>
              </div>

              {/* Rows */}
              <div className="flex flex-col">
                {SUMMARY_ROWS.map((row, idx) => (
                  <div key={row.id} className={`flex items-center px-6 py-3 ${idx !== SUMMARY_ROWS.length - 1 ? 'border-b border-[#f1f5f9]' : ''}`}>
                    <div className="w-[30%] font-semibold text-[#334155]">{row.item}</div>
                    <div className="w-[15%] flex items-center">
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#dcfce7] border border-[#bbf7d0] text-[#166534] rounded-full font-semibold text-xs">
                        <CheckCircleIcon style={{ fontSize: '14px' }} /> Completed
                      </div>
                    </div>
                    <div className="w-[30%] text-[#475569]">{row.details}</div>
                    <div className="w-[15%] text-[#475569]">{row.completedBy}</div>
                    <div className="w-[10%] text-[#475569]">{row.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2-Column Bottom Panel (Important Reminders & Confirm to Start Dialysis) */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            
            {/* Important Reminders */}
            <div style={{ ...CARD_STYLE, padding: '24px', background: '#fffbeb', borderColor: '#fde68a' }}>
              <div className="flex items-center gap-2 mb-3">
                <WarningAmberOutlinedIcon style={{ color: '#d97706' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#b45309' }}>Important Reminders</h3>
              </div>
              <ul className="list-disc pl-5 flex flex-col gap-2 text-sm text-[#78350f]">
                <li>Ensure vascular access is secure and visible.</li>
                <li>Monitor patient closely during first 15 minutes.</li>
                <li>Verify UF goal and treatment time as prescribed.</li>
                <li>Report any discomfort or alarms immediately.</li>
              </ul>
            </div>

            {/* Confirm to Start Dialysis */}
            <div style={{ ...CARD_STYLE, padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>Confirm to Start Dialysis</h3>
              
              {/* Attestation Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer mb-6">
                <input 
                  type="checkbox" 
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-[#334155] leading-relaxed">
                  I confirm that all pre-dialysis checks are complete and it is safe to start dialysis for this patient.
                </span>
              </label>

              {/* PIN Field */}
              <div>
                <label className="block text-xs font-semibold text-[#64748b] mb-1">
                  Your PIN <span className="text-gray-400 font-normal">(Default demo PIN: 1234)</span>
                </label>
                <div className="relative">
                  <input 
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    disabled={isLocked}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••••"
                    className={`w-full border ${errorMsg ? 'border-red-500 bg-red-50' : 'border-[#e2e8f0] bg-white'} rounded-lg px-3 py-2 text-sm pr-10 focus:outline-none focus:border-blue-500`}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPin ? <VisibilityOffIcon style={{ fontSize: '18px' }} /> : <VisibilityIcon style={{ fontSize: '18px' }} />}
                  </button>
                </div>

                {errorMsg && (
                  <p className="text-xs text-red-600 font-semibold mt-1.5 flex items-center gap-1">
                    <WarningAmberOutlinedIcon style={{ fontSize: '14px' }} />
                    {errorMsg}
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* Info Notice */}
          <div className="flex items-center gap-2 text-xs text-[#64748b] mb-4">
            <InfoOutlinedIcon style={{ fontSize: '16px', color: '#2563eb' }} />
            <span>Once started, you will be redirected to the During Dialysis session.</span>
          </div>

        </div>

        {/* Bottom Actions Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e2e8f0] p-4 flex justify-between items-center z-50">
          <Button variant="outline" onClick={onBack} style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: 600 }}>
            ← Back
          </Button>
          <div className="flex gap-4">
            <Button 
              colorScheme="primary" 
              onClick={handleStartDialysis} 
              isDisabled={!isFormValid}
              style={{ 
                padding: '10px 32px', 
                borderRadius: '8px', 
                background: isFormValid ? '#2563eb' : '#94a3b8', 
                color: '#fff', 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <PlayArrowIcon style={{ fontSize: '18px' }} /> Start Dialysis
            </Button>
          </div>
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default StartDialysisConfirmationView;
