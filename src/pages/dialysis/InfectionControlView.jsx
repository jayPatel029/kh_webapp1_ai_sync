import React, { useMemo, useState, useEffect } from 'react';
import { Box, Button } from '../../component-library';
import PreDialysisPatientProfileCard from '../../components/PreDialysisPatientProfileCard';
import ThemeProvider from '../../components/ThemeProvider';
import { useIsMobile } from '../../components/mobile/useIsMobile';
import { PRE_DIALYSIS_STEPS } from '../../hooks/usePreDialysisDashboard';
import { validateInfectionControl } from './infectionControlValidation';
import { submitInfectionControl, getPatientDetails } from '../../ApiCalls/preDialysisApis';

// Icons
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CleanHandsOutlinedIcon from '@mui/icons-material/CleanHandsOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import CleaningServicesOutlinedIcon from '@mui/icons-material/CleaningServicesOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import RepeatOutlinedIcon from '@mui/icons-material/RepeatOutlined';
import HealingOutlinedIcon from '@mui/icons-material/HealingOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

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

const INFECTION_CONTROL_OVERVIEW = {
  checkTime: '26 May 2025, 07:05 AM',
  checkPerformedBy: 'Rahul Singh',
  handHygienePerformed: 'Yes',
  ppeUsed: 'Yes',
  compliance: '100%',
};

const INFECTION_CONTROL_CHECKLIST = [
  { id: 'hand_hygiene', label: 'Hand Hygiene', icon: CleanHandsOutlinedIcon, status: 'Completed', details: 'Performed before patient contact', action: '—' },
  { id: 'ppe', label: 'Personal Protective Equipment (PPE)', icon: ShieldOutlinedIcon, status: 'Used', details: 'Gloves, Mask', action: '—' },
  { id: 'work_area', label: 'Work Area Clean & Disinfected', icon: CleaningServicesOutlinedIcon, status: 'Yes', details: 'Chair, bed, trolley, monitor surfaces cleaned', action: '—' },
  { id: 'machine_disinfected', label: 'Dialysis Machine Disinfected (Post Check)', icon: LocalHospitalOutlinedIcon, status: 'Yes', details: 'External surfaces disinfected', action: '—' },
  { id: 'ro_disinfection', label: 'RO System Disinfection', icon: WaterDropOutlinedIcon, status: 'Up to Date', details: 'Last disinfection on 22 May 2025', action: '—' },
  { id: 'dialyzer_reuse', label: 'Dialyzer Reuse (If applicable)', icon: RepeatOutlinedIcon, status: 'Not Applicable', details: 'Single-use dialyzer', action: '—' },
  { id: 'aseptic_technique', label: 'Aseptic Technique for Access', icon: HealingOutlinedIcon, status: 'Followed', details: 'Aseptic non-touch technique used', action: '—' },
  { id: 'sharps_handling', label: 'Sharps Handling', icon: ShieldOutlinedIcon, status: 'Safe', details: 'Sharps disposed in safety container', action: '—' },
  { id: 'biomedical_waste', label: 'Bio-medical Waste Disposal', icon: DeleteOutlineIcon, status: 'Compliant', details: 'Bags sealed and labeled', action: '—' },
  { id: 'isolation_precautions', label: 'Isolation Precautions (If applicable)', icon: ShieldOutlinedIcon, status: 'Not Applicable', details: 'No isolation required', action: '—' },
];

const InfectionControlView = ({ patientId, onBack, onNext }) => {
  const { isMobile } = useIsMobile();
  const [patientData, setPatientData] = useState(null);
  useEffect(() => {
    if (!patientId) return;
    let mounted = true;
    getPatientDetails(patientId).then((res) => { if (mounted && res?.success) setPatientData(res.data?.data || res.data); }).catch(()=>{});
    return () => { mounted = false; };
  }, [patientId]);
  const [additionalNotes, setAdditionalNotes] = useState('All infection control practices followed as per protocol.');
  const [notes, setNotes] = useState('');

  const isFormValid = useMemo(() => {
    return validateInfectionControl(INFECTION_CONTROL_CHECKLIST);
  }, []);

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB] pb-[80px]">
        {/* Header Section */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-[#0f172a]">P2-10 – Infection Control</h1>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" style={{ borderRadius: '20px' }}>
                <span className="flex items-center gap-1">📍 Main Center ▾</span>
              </Button>
            </div>
          </div>
          <p className="text-sm text-[#475569]">Ensure infection prevention measures are followed before starting dialysis.</p>
        </div>

        <div className={`admin-page-content ${isMobile ? 'px-3' : 'px-8'}`}>
          {/* 9-Step Progress Bar */}
          <div style={{ padding: '16px 24px', marginBottom: '24px', overflowX: 'auto', background: 'transparent' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: '780px' }}>
              {PRE_DIALYSIS_STEPS.map((step, idx) => {
                const isPast = step.id < 7;
                const isActive = step.id === 7;

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

          <PreDialysisPatientProfileCard patient={patientData} isMobile={isMobile} />

          {/* Main 12-Column Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, 1fr)',
              gap: '24px',
              alignItems: 'start',
            }}
          >
            {/* Left 8/12 Main Content */}
            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 8', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Infection Control Overview Card */}
              <div style={{ ...CARD_STYLE, padding: '24px' }}>
                <div className="flex items-center gap-2 mb-4">
                  <ShieldOutlinedIcon style={{ color: '#2563eb' }} />
                  <h3 style={SECTION_TITLE_STYLE} className="!mb-0">Infection Control Overview</h3>
                </div>
                <div className="grid grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#64748b] mb-1">Check Time</label>
                    <div className="flex items-center gap-2 border border-[#e2e8f0] px-3 py-2 rounded-md bg-gray-50 text-sm">
                      <span className="flex-1">{INFECTION_CONTROL_OVERVIEW.checkTime}</span>
                      <CalendarTodayIcon style={{ fontSize: '16px', color: '#64748b' }} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#64748b] mb-1">Check Performed By</label>
                    <input type="text" readOnly value={INFECTION_CONTROL_OVERVIEW.checkPerformedBy} className="w-full border border-[#e2e8f0] rounded-md px-3 py-2 text-sm bg-gray-50 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#64748b] mb-1">Hand Hygiene Performed</label>
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-[#dcfce7] border border-[#bbf7d0] text-[#166534] rounded-md font-semibold text-sm">
                      <CheckCircleIcon style={{ fontSize: '16px' }} /> Yes
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#64748b] mb-1">PPE Used</label>
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-[#dcfce7] border border-[#bbf7d0] text-[#166534] rounded-md font-semibold text-sm">
                      <CheckCircleIcon style={{ fontSize: '16px' }} /> Yes
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#64748b] mb-1">Compliance</label>
                    <div className="flex items-center justify-center px-3 py-2 bg-[#dcfce7] border border-[#bbf7d0] text-[#166534] rounded-md font-bold text-sm">
                      100%
                    </div>
                  </div>
                </div>
              </div>

              {/* Infection Control Checklist Card */}
              <div style={{ ...CARD_STYLE }}>
                <div className="p-6 pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldOutlinedIcon style={{ color: '#2563eb' }} />
                    <h3 style={SECTION_TITLE_STYLE} className="!mb-0">Infection Control Checklist</h3>
                  </div>
                  <p className="text-sm text-[#475569]">Verify all infection control practices have been followed.</p>
                </div>

                <div className="w-full text-sm mt-4">
                  {/* Table Header */}
                  <div className="flex border-b border-[#e2e8f0] px-6 py-3 text-[#64748b] font-semibold text-xs uppercase tracking-wider">
                    <div className="w-[40%]">Checklist Item</div>
                    <div className="w-[20%]">Status</div>
                    <div className="w-[30%]">Details / Observations</div>
                    <div className="w-[10%]">Action</div>
                  </div>

                  {/* Table Rows */}
                  <div className="flex flex-col">
                    {INFECTION_CONTROL_CHECKLIST.map((item, idx) => {
                      const Icon = item.icon;
                      const isNotApplicable = item.status === 'Not Applicable';

                      return (
                        <div key={item.id} className={`flex items-center px-6 py-3 ${idx !== INFECTION_CONTROL_CHECKLIST.length - 1 ? 'border-b border-[#f1f5f9]' : ''}`}>
                          <div className="w-[40%] flex items-center gap-3">
                            <div className={`flex items-center justify-center w-6 h-6 rounded-full ${isNotApplicable ? 'bg-[#f1f5f9] text-[#64748b]' : 'bg-[#eff6ff] text-[#2563eb]'}`}>
                              <Icon style={{ fontSize: '14px' }} />
                            </div>
                            <span className="font-semibold text-[#334155]">{item.label}</span>
                          </div>
                          
                          <div className="w-[20%] flex items-center">
                            {isNotApplicable ? (
                              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#eff6ff] border border-[#bfdbfe] text-[#1d4ed8] rounded-full font-semibold text-xs">
                                <RemoveCircleOutlineIcon style={{ fontSize: '14px' }} /> Not Applicable
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#dcfce7] border border-[#bbf7d0] text-[#166534] rounded-full font-semibold text-xs">
                                <CheckCircleIcon style={{ fontSize: '14px' }} /> {item.status}
                              </div>
                            )}
                          </div>

                          <div className="w-[30%] text-[#475569]">{item.details}</div>
                          <div className="w-[10%] text-[#94a3b8] font-semibold">{item.action}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Split (Additional Notes & Action Required) */}
              <div className="grid grid-cols-2 gap-6">
                {/* Additional Notes */}
                <div style={{ ...CARD_STYLE, padding: '24px' }}>
                  <h3 style={SECTION_TITLE_STYLE}>Additional Notes</h3>
                  <p className="text-sm text-[#475569] mb-3">Any additional observations or action taken.</p>
                  <textarea 
                    className="w-full border border-[#e2e8f0] rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-none h-24"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                  />
                  <div className="text-right text-xs text-[#94a3b8] mt-1">{additionalNotes.length} / 300</div>
                </div>

                {/* Action Required */}
                <div style={{ ...CARD_STYLE, padding: '24px' }}>
                  <h3 style={SECTION_TITLE_STYLE}>Action Required</h3>
                  <p className="text-sm text-[#475569] mb-3">Based on checklist status.</p>
                  <div className="p-4 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg flex items-center gap-3">
                    <CheckCircleIcon style={{ color: '#16a34a' }} />
                    <div>
                      <span className="font-bold text-[#166534] text-sm block">No action required.</span>
                      <span className="text-[#15803d] text-xs">All infection control measures are compliant.</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right 4/12 Sidebar */}
            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Infection Control Alerts Card */}
              <div style={{ ...CARD_STYLE, padding: '24px', background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircleIcon style={{ color: '#16a34a' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#166534' }}>Infection Control Alerts</h3>
                </div>
                <span className="text-sm font-semibold text-[#15803d]">No infection control alerts.</span>
              </div>

              {/* Infection Control Reference Card */}
              <div style={{ ...CARD_STYLE, padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>Infection Control Reference</h3>
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748b] flex items-center gap-1.5">
                      <CheckCircleIcon style={{ fontSize: '16px', color: '#16a34a' }} /> Hand Hygiene Compliance
                    </span>
                    <span className="font-semibold text-[#0f172a]">100%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748b] flex items-center gap-1.5">
                      <CheckCircleIcon style={{ fontSize: '16px', color: '#16a34a' }} /> PPE Compliance
                    </span>
                    <span className="font-semibold text-[#0f172a]">100%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748b] flex items-center gap-1.5">
                      <CheckCircleIcon style={{ fontSize: '16px', color: '#16a34a' }} /> Machine Disinfection
                    </span>
                    <span className="font-semibold text-[#0f172a]">Compliant</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748b] flex items-center gap-1.5">
                      <CheckCircleIcon style={{ fontSize: '16px', color: '#16a34a' }} /> Last RO Disinfection
                    </span>
                    <span className="font-semibold text-[#0f172a]">22 May 2025</span>
                  </div>
                </div>
                <div className="mt-4 text-right">
                  <a href="#" className="text-blue-600 text-sm font-semibold">View CDC Guidelines →</a>
                </div>
              </div>

              {/* Notes (Optional) Card */}
              <div style={{ ...CARD_STYLE, padding: '24px' }}>
                <div className="flex justify-between items-center mb-4">
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Notes <span className="font-normal text-[#64748b] text-sm">(Optional)</span></h3>
                  <a href="#" className="text-blue-600 text-sm font-semibold">Add Note</a>
                </div>
                <textarea 
                  className="w-full border border-[#e2e8f0] rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-none h-24"
                  placeholder="Enter any notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <div className="text-right mt-1 text-xs text-[#94a3b8]">{notes.length} / 300</div>
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
                  await submitInfectionControl(1, {
                    status: 'final',
                    access_type: 'AVF',
                    items: {
                      hand_hygiene: true,
                      aseptic_technique: true,
                      sharps_handling: true,
                      ppe: true,
                      work_area_clean: true,
                      dialysis_machine_disinfected: true,
                      ro_system_disinfection: 'not_applicable',
                      dialyzer_reuse: 'not_applicable',
                      biomedical_waste: true,
                      isolation_precautions: 'not_applicable',
                    },
                    scrub_the_hub_result: null,
                    notes: notes || '',
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

export default InfectionControlView;
