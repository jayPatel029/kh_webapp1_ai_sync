import React, { useMemo, useState } from 'react';
import { Box, Button } from '../../component-library';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import { PRE_DIALYSIS_STEPS } from '../../hooks/usePreDialysisDashboard';
import { verifyPin, MAX_ATTEMPTS } from './startDialysisValidation';
import { startDialysis, unlockStartDialysis } from '../../ApiCalls/preDialysisApis';

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

const StartDialysisConfirmationView = ({ onBack, onNext }) => {
  const isMobile = useIsMobile();
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
      try {
        const apiRes = await startDialysis(1, {
          attestation: isConfirmed,
          pin: pin.trim(),
          machine_id: 'HD-01',
        });
        if (!apiRes.success) {
          if (apiRes.status === 423) {
            setIsLocked(true);
            setErrorMsg(apiRes.message || 'Session locked due to multiple invalid PIN attempts. Requires Nurse or Nephrologist unlock.');
            return;
          }
        }
      } catch (_) {}

      if (onNext) onNext();
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
          <div style={{ padding: '16px 24px', marginBottom: '24px', overflowX: 'auto', background: 'transparent' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: '780px' }}>
              {PRE_DIALYSIS_STEPS.map((step, idx) => {
                const isPast = step.id < 9;
                const isActive = step.id === 9;

                return (
                  <React.Fragment key={step.id}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '9999px',
                          background: isPast ? '#10b981' : isActive ? '#2563eb' : '#f1f5f9',
                          color: isPast || isActive ? '#ffffff' : '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          fontWeight: 700,
                        }}
                      >
                        {isPast ? '✓' : step.id}
                      </div>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? '#2563eb' : isPast ? '#10b981' : '#64748b',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {step.name}
                      </span>
                    </div>
                    {idx < PRE_DIALYSIS_STEPS.length - 1 && (
                      <div
                        style={{
                          flex: 1,
                          height: '2px',
                          background: isPast ? '#10b981' : '#e2e8f0',
                          margin: '0 8px',
                          marginTop: '-16px',
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Patient Banner */}
          <div style={{ ...CARD_STYLE, padding: '20px', marginBottom: '24px' }}>
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                  <img src="https://ui-avatars.com/api/?name=Ramesh+Kumar&background=cbd5e1&color=334155" alt="Ramesh Kumar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#0f172a] text-lg">Ramesh Kumar</h3>
                    <span className="px-2 py-0.5 bg-[#dcfce7] text-[#166534] text-xs font-semibold rounded-full">Active Patient</span>
                  </div>
                  <p className="text-xs text-[#64748b] mt-0.5">PID: P10023 &nbsp;|&nbsp; 58y &nbsp;|&nbsp; Blood Group: <span className="font-bold text-[#0f172a]">O+</span></p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div><span className="text-[#64748b] text-xs block">Weight (Dry)</span><span className="font-bold text-[#0f172a]">68.5 kg</span></div>
                <div className="h-8 w-px bg-gray-200" />
                <div><span className="text-[#64748b] text-xs block">Today's Schedule</span><span className="font-bold text-[#0f172a]">12 Jan 2023 (2y 4m)</span></div>
                <div className="h-8 w-px bg-gray-200" />
                <div><span className="text-[#64748b] text-xs block">Shift</span><span className="font-bold text-[#2563eb]">Morning (07:00 AM)</span></div>
                <div className="h-8 w-px bg-gray-200" />
                <div><span className="text-[#64748b] text-xs block">Bed / Machine</span><span className="font-bold text-[#2563eb]">B-02 / HD-01</span></div>
              </div>
            </div>
          </div>

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
