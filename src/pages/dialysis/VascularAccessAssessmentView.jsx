import React, { useState, useMemo } from 'react';
import { Box, Button, Input, Textarea } from '../../component-library';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import { PRE_DIALYSIS_STEPS } from '../../hooks/usePreDialysisDashboard';
import { AVF_AVG_CONFIG, CVC_CONFIG, validateVascularAccess } from './vascularAccessValidation';
import { submitVascularAccess } from '../../ApiCalls/preDialysisApis';

// Icons
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HealingIcon from '@mui/icons-material/Healing';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import TimelineIcon from '@mui/icons-material/Timeline';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import SpeedIcon from '@mui/icons-material/Speed';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

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

const ICON_MAP = {
  signsOfInfection: ShieldOutlinedIcon,
  bleedingDischarge: BloodtypeIcon,
  thrillBruit: HealingIcon,
  accessFlow: SpeedIcon,
  accessSiteAppearance: VisibilityOutlinedIcon,
  cannulationZone: GpsFixedIcon,
  aneurysm: TimelineIcon,
  signsOfInfectionCVC: ShieldOutlinedIcon,
  catheterPatent: CheckCircleOutlineIcon,
  tendernessPain: WarningAmberIcon,
  dressingIntact: MedicalServicesOutlinedIcon,
  exitSiteClean: VisibilityOutlinedIcon,
};

const VascularAccessAssessmentView = ({ patientId, onBack, onNext }) => {
  const isMobile = useIsMobile();
  const [accessType, setAccessType] = useState('AVF'); // Default to AVF as seen in P2-07-3
  const [formData, setFormData] = useState({ thrillBruit: 'Present', accessSiteAppearance: 'Normal', signsOfInfection: 'No', bleedingDischarge: 'No', aneurysm: 'No', cannulationZone: 'Good', accessFlow: '650' });
  const [detailsData, setDetailsData] = useState({});
  const [additionalObservations, setAdditionalObservations] = useState('Good thrill and bruit. No signs of infection. Ready for cannulation.');

  // Auto-calculation and Validation
  const currentConfig = useMemo(() => {
    if (accessType === 'AVF' || accessType === 'AVG') return AVF_AVG_CONFIG;
    if (accessType === 'CVC') return CVC_CONFIG;
    return [];
  }, [accessType]);

  const { isCriticalFailed, criticalErrors, validationErrors } = useMemo(() => {
    return validateVascularAccess(accessType, currentConfig, formData);
  }, [accessType, currentConfig, formData]);

  const isFormValid = !isCriticalFailed && validationErrors.length === 0;

  const handleFieldChange = (id, val) => {
    setFormData(prev => ({ ...prev, [id]: val }));
  };

  const handleDetailsChange = (id, val) => {
    setDetailsData(prev => ({ ...prev, [id]: val }));
  };

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB] pb-[80px]">
        {/* Header section similar to image (P2-07-3) */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-[#0f172a]">P2-07 – Vascular Access Assessment</h1>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" style={{ borderRadius: '20px' }}>
                <span className="flex items-center gap-1">📍 Main Center ▾</span>
              </Button>
            </div>
          </div>
          <p className="text-sm text-[#475569]">Assess vascular access site for patency and safety before cannulation.</p>
        </div>

        <div className={`admin-page-content ${isMobile ? 'px-3' : 'px-8'}`}>
          {/* 9-Step Progress Bar */}
          <div style={{ padding: '16px 24px', marginBottom: '24px', overflowX: 'auto', background: 'transparent' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: '780px' }}>
              {PRE_DIALYSIS_STEPS.map((step, idx) => {
                const isPast = step.id < 4;
                const isActive = step.id === 4;

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

          {/* Main Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, 1fr)',
              gap: '24px',
              alignItems: 'start',
            }}
          >
            {/* Left 8/12 Main Form */}
            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 8', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Access Type Selection */}
              <div style={{ ...CARD_STYLE, padding: '24px' }}>
                <div className="flex justify-between items-start mb-4">
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>Access Type</h3>
                  <div className="flex items-center gap-2 text-sm text-[#475569]">
                    <span>Assessment Time</span>
                    <div className="flex items-center gap-2 border border-[#e2e8f0] px-3 py-1 rounded-md bg-[#f8fafc]">
                      <span>26 May 2025, 06:52 AM</span>
                      <CalendarTodayIcon style={{ fontSize: '16px', color: '#64748b' }} />
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  {['AV Fistula (AVF)', 'AV Graft (AVG)', 'Central Venous Catheter (CVC)'].map(type => {
                    const typeKey = type.includes('AVF') ? 'AVF' : type.includes('AVG') ? 'AVG' : 'CVC';
                    const isSelected = accessType === typeKey;
                    return (
                      <label key={type} className={`flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer transition-colors ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-[#e2e8f0] hover:bg-gray-50'}`}>
                        <input 
                          type="radio" 
                          name="accessType" 
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" 
                          checked={isSelected}
                          onChange={() => {
                            setAccessType(typeKey);
                            setFormData({});
                            setDetailsData({});
                          }}
                        />
                        <span className={`text-sm ${isSelected ? 'font-semibold text-blue-700' : 'text-[#334155]'}`}>{type}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Assessment Table */}
              {accessType && (
                <div style={{ ...CARD_STYLE }}>
                  <div className="p-6 pb-2">
                    <h3 style={SECTION_TITLE_STYLE}>Access Assessment</h3>
                    <p className="text-sm text-[#475569]">Examine access site and function.</p>
                  </div>
                  
                  {criticalErrors.length > 0 && (
                    <div className="mx-6 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                      <p className="text-red-700 font-bold mb-2">Action Required / Escalation</p>
                      <ul className="list-disc pl-5 text-sm text-red-800">
                        {criticalErrors.map((err, i) => <li key={i}>{err}</li>)}
                      </ul>
                    </div>
                  )}

                  <div className="w-full text-sm">
                    {/* Header row */}
                    <div className="flex border-b border-[#e2e8f0] px-6 py-3 text-[#64748b] font-semibold text-xs uppercase tracking-wider">
                      <div className="w-2/5">Assessment Item</div>
                      <div className="w-2/5">Findings</div>
                      <div className="w-1/5">Details (if Abnormal)</div>
                    </div>

                    {/* Table Rows */}
                    <div className="flex flex-col">
                      {currentConfig.map((field, idx) => {
                        const Icon = ICON_MAP[field.id] || InfoOutlinedIcon;
                        return (
                          <div key={field.id} className={`flex items-center px-6 py-4 ${idx !== currentConfig.length - 1 ? 'border-b border-[#f1f5f9]' : ''}`}>
                            {/* Column 1: Item */}
                            <div className="w-2/5 flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#f0fdf4] text-[#16a34a]">
                                <Icon style={{ fontSize: '18px' }} />
                              </div>
                              <span className="font-semibold text-[#334155]">{field.label}</span>
                              <InfoOutlinedIcon style={{ fontSize: '14px', color: '#94a3b8' }} />
                            </div>

                            {/* Column 2: Findings */}
                            <div className="w-2/5 pr-4">
                              {field.type === 'radio' && (
                                <div className="flex gap-4 flex-wrap">
                                  {field.options.map(opt => {
                                    const isSelected = formData[field.id] === opt;
                                    const isGreenOpt = opt === 'No' && field.critical || opt === 'Normal' || opt === 'Good' || opt === 'Present' || opt === 'Yes' && !field.critical; // Rough heuristics for green
                                    return (
                                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                        {isSelected ? (
                                          <CheckCircleIcon style={{ fontSize: '18px', color: '#16a34a' }} />
                                        ) : (
                                          <div className="w-[16px] h-[16px] rounded-full border border-gray-300" />
                                        )}
                                        <span className={`text-sm ${isSelected ? 'font-semibold text-[#0f172a]' : 'text-[#475569]'}`}>{opt}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              )}
                              {field.type === 'number' && (
                                <div className="flex items-center gap-3">
                                  <input 
                                    type="number" 
                                    className="border border-[#e2e8f0] rounded-md px-3 py-1.5 w-24 text-sm focus:outline-none focus:border-blue-500"
                                    value={formData[field.id] || ''}
                                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                  />
                                  <span className="text-[#64748b]">mL/min</span>
                                  {field.id === 'accessFlow' && formData[field.id] && (
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${Number(formData[field.id]) >= 500 ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#fee2e2] text-[#991b1b]'}`}>
                                      {Number(formData[field.id]) >= 500 ? 'Adequate (≥ 500 mL/min)' : 'Low (< 500 mL/min)'}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Column 3: Details */}
                            <div className="w-1/5">
                              <input 
                                type="text"
                                className="w-full border border-[#e2e8f0] rounded-md px-3 py-1.5 text-sm placeholder-[#94a3b8] focus:outline-none focus:border-blue-500"
                                placeholder={field.type === 'number' ? '—' : 'Describe (if abnormal)'}
                                value={detailsData[field.id] || ''}
                                onChange={(e) => handleDetailsChange(field.id, e.target.value)}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom split: Additional Observations & Action Required */}
              <div className="flex gap-6 w-full">
                <div style={{ ...CARD_STYLE, padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Additional Observations</h4>
                  <p className="text-sm text-[#475569] mb-4">Any additional notes or concerns.</p>
                  <textarea 
                    className="w-full border border-[#e2e8f0] rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-none flex-1"
                    rows={3} 
                    value={additionalObservations}
                    onChange={(e) => setAdditionalObservations(e.target.value)}
                  />
                  <div className="text-right mt-1 text-xs text-[#94a3b8]">{additionalObservations.length} / 300</div>
                </div>

                <div style={{ ...CARD_STYLE, padding: '24px', flex: 1 }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Action Required</h4>
                  <p className="text-sm text-[#475569] mb-4">Based on assessment findings.</p>
                  {isFormValid ? (
                    <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-4 flex items-start gap-3">
                      <CheckCircleIcon style={{ color: '#16a34a', marginTop: '2px' }} />
                      <div>
                        <p className="font-bold text-[#166534] text-sm">Access suitable for use.</p>
                        <p className="text-[#15803d] text-sm mt-1">Proceed to next step.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                      <WarningAmberIcon style={{ color: '#dc2626', marginTop: '2px' }} />
                      <div>
                        <p className="font-bold text-red-700 text-sm">Assessment Incomplete/Failed</p>
                        <p className="text-red-600 text-sm mt-1">Please review the critical fields.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right 4/12 Sidebar */}
            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Patient Summary Card */}
              <div style={{ ...CARD_STYLE, padding: '24px' }}>
                <h3 style={SECTION_TITLE_STYLE}>Patient Summary</h3>
                <div className="flex gap-4 items-center mb-6 mt-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                    <img src="https://ui-avatars.com/api/?name=Ramesh+Kumar&background=cbd5e1&color=334155" alt="Patient" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-[#0f172a] text-lg">Ramesh Kumar</h4>
                      <span className="px-2 py-0.5 bg-[#dcfce7] text-[#166534] text-xs font-semibold rounded-full">Active Patient</span>
                    </div>
                    <p className="text-sm text-[#475569] mt-1">PID: P10023 &nbsp;|&nbsp; 58 Years, Male</p>
                    <p className="text-sm font-semibold text-[#0f172a] mt-1">Blood Group: <span className="font-bold">O+</span></p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 text-sm border-t border-[#f1f5f9] pt-4">
                  <div className="flex justify-between"><span className="text-[#64748b]">Last Dialysis</span><span className="font-semibold text-[#0f172a]">12 Jan 2023 (2y 4m)</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Schedule</span><span className="font-semibold text-[#0f172a]">Mon, Wed, Fri</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Shift / Time</span><span className="font-semibold text-[#0f172a]">Morning (07:00 AM)</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Machine / Bed</span><span className="font-semibold text-[#0f172a]">B-02 / HD-01</span></div>
                </div>
              </div>

              {/* Access Details Card */}
              <div style={{ ...CARD_STYLE, padding: '24px' }}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 p-1 rounded">
                      <TimelineIcon style={{ fontSize: '18px', color: '#2563eb' }} />
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Access Details</h3>
                  </div>
                  <a href="#" className="text-blue-600 text-sm font-semibold">Edit</a>
                </div>
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between"><span className="text-[#64748b]">Access Type</span><span className="font-semibold text-[#0f172a]">AV Fistula (Left)</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Location</span><span className="font-semibold text-[#0f172a]">Left Forearm</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Date Created</span><span className="font-semibold text-[#0f172a]">15 Mar 2022</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Surgeon / Center</span><span className="font-semibold text-[#0f172a]">City Vascular Center</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Last Reviewed</span><span className="font-semibold text-[#0f172a]">12 May 2025</span></div>
                </div>
                <div className="mt-4 text-right">
                  <a href="#" className="text-blue-600 text-sm font-semibold">View Access History →</a>
                </div>
              </div>

              {/* Pre-Dialysis Alerts */}
              <div style={{ ...CARD_STYLE, padding: '24px', background: '#fef2f2', borderColor: '#fecaca' }}>
                <div className="flex items-center gap-2 mb-4">
                  <WarningAmberIcon style={{ color: '#dc2626' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#991b1b' }}>Pre-Dialysis Alerts</h3>
                </div>
                <ul className="list-disc pl-5 flex flex-col gap-2 text-sm text-[#991b1b] font-semibold">
                  <li>High Potassium (5.2 mEq/L)</li>
                  <li>Low Hemoglobin (9.6 g/dL)</li>
                </ul>
                <div className="mt-4 text-right">
                  <a href="#" className="text-blue-600 text-sm font-semibold">View All Alerts →</a>
                </div>
              </div>

              {/* Quick Reference */}
              <div style={{ ...CARD_STYLE, padding: '24px', background: '#fffbeb', borderColor: '#fde68a' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', mb: '16px' }}>Quick Reference</h3>
                <div className="flex flex-col gap-3 text-sm mt-4">
                  <div className="flex justify-between"><span className="text-[#64748b]">Access Flow Goal</span><span className="font-semibold text-[#0f172a]">≥ 500 mL/min</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Minimum Blood Flow (BFR)</span><span className="font-semibold text-[#0f172a]">250–300 mL/min</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Recirculation Target</span><span className="font-semibold text-[#0f172a]">&lt; 10 %</span></div>
                </div>
                <div className="mt-4 text-right">
                  <a href="#" className="text-blue-600 text-sm font-semibold">View KDOQI Guidelines →</a>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e2e8f0] p-4 flex justify-between items-center z-50">
          <Button variant="outline" onClick={onBack} style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: 600 }}>
            ← Back
          </Button>
          <div className="flex gap-4">
            <Button variant="outline" style={{ padding: '10px 24px', borderRadius: '8px', color: '#2563eb', borderColor: '#2563eb', fontWeight: 600 }}>
              Save as Draft
            </Button>
            <Button 
              colorScheme="primary" 
              onClick={async () => {
                try {
                  await submitVascularAccess(1, {
                    status: 'final',
                    access_type: accessType,
                    thrill_bruit: String(formData.thrillBruit || '').toLowerCase(),
                    access_site_appearance: String(formData.accessSiteAppearance || '').toLowerCase(),
                    signs_of_infection: String(formData.signsOfInfection || '').toLowerCase(),
                    bleeding_discharge: String(formData.bleedingDischarge || '').toLowerCase(),
                    aneurysm: String(formData.aneurysm || '').toLowerCase(),
                    cannulation_zone: String(formData.cannulationZone || '').toLowerCase(),
                    access_flow_ml_min: parseFloat(formData.accessFlow) || 600,
                    additional_observations: additionalObservations || '',
                    skips: [],
                  });
                } catch (_) {}
                if (onNext) onNext();
              }} 
              isDisabled={!isFormValid}
              style={{ padding: '10px 32px', borderRadius: '8px', background: isFormValid ? '#2563eb' : '#94a3b8', color: '#fff', fontWeight: 600 }}
            >
              Save & Continue →
            </Button>
          </div>
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default VascularAccessAssessmentView;
