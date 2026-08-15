import React from 'react';

const DEFAULT_PROFILE = {
  id: 1,
  name: 'Ramesh Kumar',
  status: 'Active',
  patientCode: 'P10023',
  age: '58',
  gender: 'Male',
  phone: '+91 98765 43210',
  dryWeight: '68.5 kg',
  bloodGroup: 'O+',
  lastDialysis: '12 Jan 2023 (2y 4m)',
  lastDialysisDate: '12 Jan 2023',
  lastDialysisElapsed: '2y 4m',
  vascularAccess: 'AV Fistula (Left)',
  nextScheduleDate: 'Today, 26 May 2025',
  nextScheduleTime: '07:00 AM - Shift 1',
  nephrologist: 'Dr. Neha Mehta',
  dialysisType: 'Hemodialysis',
  assignment: {
    shift: 'Morning (07:00 AM)',
    bedMachine: 'B-02 / HD-01',
    technician: 'Rahul Singh',
  },
};

const readFirst = (source, keys) => {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value;
    }
  }
  return '';
};

export const normalizePreDialysisProfileData = (patient = {}) => {
  const patientCode = readFirst(patient, ['patientCode', 'patient_code', 'patientId']) || DEFAULT_PROFILE.patientCode;
  const age = readFirst(patient, ['age']) || DEFAULT_PROFILE.age;
  const gender = readFirst(patient, ['gender', 'sex']) || DEFAULT_PROFILE.gender;
  const phone = readFirst(patient, ['phone', 'number', 'phone_number', 'mobile_no']) || DEFAULT_PROFILE.phone;
  const dryWeightRaw = readFirst(patient, ['dryWeight', 'dry_weight', 'target_weight', 'weight_dry']);
  const bloodGroup = readFirst(patient, ['bloodGroup', 'blood_group']) || DEFAULT_PROFILE.bloodGroup;
  const lastDialysisRaw = readFirst(patient, ['lastDialysis', 'last_dialysis', 'lastDialysisDate', 'last_dialysis_date']) || DEFAULT_PROFILE.lastDialysis;
  // split last dialysis into date + elapsed if contains parentheses
  let lastDialysisDate = DEFAULT_PROFILE.lastDialysisDate;
  let lastDialysisElapsed = DEFAULT_PROFILE.lastDialysisElapsed;
  if (lastDialysisRaw && lastDialysisRaw.includes('(')) {
    const m = lastDialysisRaw.match(/^(.*?)\s*\((.*?)\)\s*$/);
    if (m) {
      lastDialysisDate = m[1].trim();
      lastDialysisElapsed = m[2].trim();
    } else {
      lastDialysisDate = lastDialysisRaw;
    }
  } else if (lastDialysisRaw) {
    lastDialysisDate = lastDialysisRaw;
    const elapsed = readFirst(patient, ['lastDialysisElapsed', 'lastDialysisDuration']);
    if (elapsed) lastDialysisElapsed = elapsed;
    else lastDialysisElapsed = DEFAULT_PROFILE.lastDialysisElapsed;
  }
  const lastDialysis = `${lastDialysisDate} (${lastDialysisElapsed})`;

  const nextScheduleRaw = readFirst(patient, ['nextSchedule', 'next_schedule', 'nextScheduleDate']);
  const nextScheduleDate = nextScheduleRaw || readFirst(patient, ['nextScheduleDate']) || DEFAULT_PROFILE.nextScheduleDate;
  const nextScheduleTime = readFirst(patient, ['nextScheduleTime', 'shift_time', 'shift', 'nextScheduleShift']) || DEFAULT_PROFILE.nextScheduleTime;
  const nephrologist = readFirst(patient, ['nephrologist', 'primary_doctor_name', 'doctor_name']) || DEFAULT_PROFILE.nephrologist;
  const dialysisType = readFirst(patient, ['dialysisType', 'dialysis_type']) || DEFAULT_PROFILE.dialysisType;
  const vascularAccess = readFirst(patient, ['vascularAccess', 'vascular_access', 'access_type']) || DEFAULT_PROFILE.vascularAccess;
  const bedMachine =
    readFirst(patient, ['bedMachine']) ||
    [readFirst(patient, ['bed_number', 'bedNo', 'bed']), readFirst(patient, ['machine_number', 'machineNo', 'machine'])].filter(Boolean).join(' / ');

  return {
    id: patient?.id || DEFAULT_PROFILE.id,
    photo: readFirst(patient, ['photo', 'avatar', 'profile_photo', 'profilePhoto']),
    name: readFirst(patient, ['name', 'patient_name']) || DEFAULT_PROFILE.name,
    status: readFirst(patient, ['statusBadge', 'status']) || DEFAULT_PROFILE.status,
    patientCode,
    age,
    gender,
    phone,
    dryWeight: dryWeightRaw ? (String(dryWeightRaw).includes('kg') ? String(dryWeightRaw) : `${dryWeightRaw} kg`) : DEFAULT_PROFILE.dryWeight,
    bloodGroup,
    lastDialysis,
    lastDialysisDate,
    lastDialysisElapsed,
    vascularAccess,
    nextScheduleDate,
    nextScheduleTime,
    nextSchedule: `${nextScheduleDate} ${nextScheduleTime}`,
    nephrologist,
    dialysisType,
    assignment: {
      shift: readFirst(patient?.assignment, ['shift']) || readFirst(patient, ['shift', 'shift_time']) || DEFAULT_PROFILE.assignment.shift,
      bedMachine: readFirst(patient?.assignment, ['bedMachine']) || bedMachine || DEFAULT_PROFILE.assignment.bedMachine,
      technician: readFirst(patient?.assignment, ['technician']) || readFirst(patient, ['attending_technician', 'technician_name']) || DEFAULT_PROFILE.assignment.technician,
    },
  };
};

const AvatarFallback = ({ name }) => (
  <div
    style={{
      width: 56,
      height: 56,
      borderRadius: 9999,
      background: '#dbeafe',
      color: '#1e40af',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 20,
      fontWeight: 800,
      flexShrink: 0,
      border: '1px solid #e0e7ff',
    }}
  >
    {(name?.[0] || 'P').toUpperCase()}
  </div>
);

// Icon shells matching reference: 28x28 light blue rounded square with blue icon
const IconBox = ({ children }) => (
  <div
    style={{
      width: 32,
      height: 32,
      borderRadius: 8,
      background: '#eff6ff',
      border: '1px solid #dbeafe',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      color: '#2563eb',
    }}
  >
    {children}
  </div>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
    <rect x="7" y="13" width="4" height="3" rx="0.5" strokeWidth="1.4" />
  </svg>
);
const VascularIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3v6l-3 3v6M15 3v6l3 3v6" />
    <path d="M9 9h6M9 15h6" />
    <circle cx="12" cy="6" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);
const ScheduleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L6 14h5l-1 8 7-12h-5l1-8z" />
  </svg>
);
const DoctorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7.5" r="3.5" />
    <path d="M5 19a7 7 0 0 1 14 0" />
  </svg>
);
const DialysisTypeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20s-6-4.2-8.3-8.1A4.6 4.6 0 0 1 12 5.2a4.6 4.6 0 0 1 8.3 6.7C18 15.8 12 20 12 20z" />
    <path d="M8 12h3l1.2-2.2L13.8 14H16" strokeWidth="1.4" />
  </svg>
);
const PhoneIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3.1 5.2 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.7l.4 2.7a2 2 0 0 1-.6 1.6l-1.5 1.5a16 16 0 0 0 6.1 6.1l1.5-1.5a2 2 0 0 1 1.6-.6l2.7.4A2 2 0 0 1 22 16.9z" />
  </svg>
);

const MetricItem = ({ icon, label, value, subValue }) => (
  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', minWidth: 0 }}>
    <IconBox>{icon}</IconBox>
    <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <span style={{ fontSize: 11.5, fontWeight: 500, color: '#64748b', lineHeight: 1.2, whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {value}
        {subValue ? <span style={{ fontWeight: 500, color: '#475569' }}> ({subValue})</span> : null}
      </span>
      {/* For Next Schedule time on second line */}
      {label === 'Next Schedule' && subValue == null && null}
    </div>
  </div>
);

const PreDialysisPatientProfileCard = ({ patient, isMobile = false, onViewProfile, showPatientId = true }) => {
  const profile = normalizePreDialysisProfileData(patient);

  const handleViewProfile = () => {
    if (onViewProfile) onViewProfile();
  };

  // Mobile layout: stacked sections
  if (isMobile) {
    return (
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
          padding: 16,
          marginBottom: 20,
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        {/* Patient identity */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
          {profile.photo ? (
            <img
              src={profile.photo}
              alt={profile.name}
              style={{ width: 56, height: 56, borderRadius: 9999, objectFit: 'cover', flexShrink: 0, border: '1px solid #e2e8f0' }}
            />
          ) : (
            <AvatarFallback name={profile.name} />
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{profile.name}</span>
              <span
                style={{
                  background: '#ecfdf5',
                  color: '#047857',
                  border: '1px solid #a7f3d0',
                  padding: '1px 8px',
                  borderRadius: 9999,
                  fontSize: 11,
                  fontWeight: 700,
                  lineHeight: 1.6,
                }}
              >
                {profile.status}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 10px', marginTop: 6, fontSize: 12.5, color: '#475569', lineHeight: 1.4 }}>
              {showPatientId ? (
                <>
                  <span>
                    <span style={{ color: '#64748b' }}>PID:</span> <span style={{ color: '#334155', fontWeight: 600 }}>{profile.patientCode}</span>
                  </span>
                  <span style={{ color: '#cbd5e1' }}>|</span>
                </>
              ) : null}
              <span>
                {profile.age} Years, {profile.gender}
              </span>
              <span style={{ color: '#cbd5e1' }}>|</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <PhoneIcon /> {profile.phone}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 10px', marginTop: 2, fontSize: 12.5, color: '#475569' }}>
              <span>
                <span style={{ color: '#64748b' }}>Weight (Dry):</span> <span style={{ color: '#334155', fontWeight: 600 }}>{profile.dryWeight}</span>
              </span>
              <span style={{ color: '#cbd5e1' }}>|</span>
              <span>
                <span style={{ color: '#64748b' }}>Blood Group:</span> <span style={{ color: '#334155', fontWeight: 600 }}>{profile.bloodGroup}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={handleViewProfile}
              style={{
                marginTop: 8,
                background: 'none',
                border: 'none',
                padding: 0,
                color: '#2563eb',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              View Full Profile <span style={{ fontSize: 14, lineHeight: 1 }}>→</span>
            </button>
          </div>
        </div>

        {/* Metrics grid 2 cols */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
          <MetricItem icon={<CalendarIcon />} label="Last Dialysis" value={profile.lastDialysisDate} subValue={profile.lastDialysisElapsed} />
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <IconBox>
              <ScheduleIcon />
            </IconBox>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11.5, fontWeight: 500, color: '#64748b', lineHeight: 1.2 }}>Next Schedule</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>{profile.nextScheduleDate}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#475569', lineHeight: 1.3 }}>{profile.nextScheduleTime}</div>
            </div>
          </div>
          <MetricItem icon={<VascularIcon />} label="Vascular Access" value={profile.vascularAccess} />
          <MetricItem icon={<DoctorIcon />} label="Nephrologist" value={profile.nephrologist} />
          <MetricItem icon={<DialysisTypeIcon />} label="Dialysis Type" value={profile.dialysisType} />
        </div>

        {/* Today's Assignment */}
        <div
          style={{
            marginTop: 14,
            background: '#f0f7ff',
            border: '1px solid #dbeafe',
            borderRadius: 10,
            padding: '12px 14px',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>Today&apos;s Assignment</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Shift / Time</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{profile.assignment.shift}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Bed / Machine</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{profile.assignment.bedMachine}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Attending Technician</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{profile.assignment.technician}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop: horizontal layout matching P2-03.jpeg
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
        padding: '14px 18px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'stretch',
        gap: 0,
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* Left: Patient Identity */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: '0 0 360px', minWidth: 0, paddingRight: 18 }}>
        {profile.photo ? (
          <img
            src={profile.photo}
            alt={profile.name}
            style={{ width: 56, height: 56, borderRadius: 9999, objectFit: 'cover', flexShrink: 0, border: '1px solid #e2e8f0' }}
          />
        ) : (
          <AvatarFallback name={profile.name} />
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', lineHeight: 1.2, whiteSpace: 'nowrap' }}>{profile.name}</span>
            <span
              style={{
                background: '#ecfdf5',
                color: '#047857',
                border: '1px solid #a7f3d0',
                padding: '0 8px',
                borderRadius: 9999,
                fontSize: 11,
                fontWeight: 700,
                lineHeight: '18px',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              {profile.status}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '4px 8px',
              fontSize: 12.5,
              color: '#475569',
              lineHeight: 1.4,
              whiteSpace: 'nowrap',
            }}
          >
            {showPatientId ? (
              <>
                <span>
                  <span style={{ color: '#64748b' }}>PID:</span> <span style={{ color: '#334155', fontWeight: 600 }}>{profile.patientCode}</span>
                </span>
                <span style={{ color: '#e2e8f0' }}>|</span>
              </>
            ) : null}
            <span>
              {profile.age} Years, {profile.gender}
            </span>
            <span style={{ color: '#e2e8f0' }}>|</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <PhoneIcon /> {profile.phone}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '4px 8px',
              fontSize: 12.5,
              color: '#475569',
              marginTop: 2,
              lineHeight: 1.4,
            }}
          >
            <span>
              <span style={{ color: '#64748b' }}>Weight (Dry):</span> <span style={{ color: '#334155', fontWeight: 600 }}>{profile.dryWeight}</span>
            </span>
            <span style={{ color: '#e2e8f0' }}>|</span>
            <span>
              <span style={{ color: '#64748b' }}>Blood Group:</span> <span style={{ color: '#334155', fontWeight: 600 }}>{profile.bloodGroup}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={handleViewProfile}
            style={{
              marginTop: 8,
              background: 'none',
              border: 'none',
              padding: 0,
              color: '#2563eb',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            View Full Profile <span style={{ fontSize: 14, lineHeight: 1 }}>→</span>
          </button>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, alignSelf: 'stretch', background: '#eef2f7', margin: '2px 0', flexShrink: 0 }} />

      {/* Center: Clinical metrics (2 rows x 3 cols) */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 0.95fr',
          columnGap: 18,
          rowGap: 18,
          alignContent: 'center',
          padding: '2px 18px',
        }}
      >
        <MetricItem icon={<CalendarIcon />} label="Last Dialysis" value={profile.lastDialysisDate} subValue={profile.lastDialysisElapsed} />
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', minWidth: 0 }}>
          <IconBox>
            <ScheduleIcon />
          </IconBox>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11.5, fontWeight: 500, color: '#64748b', lineHeight: 1.2 }}>Next Schedule</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1.3, whiteSpace: 'nowrap' }}>{profile.nextScheduleDate}</div>
            <div style={{ fontSize: 11.5, fontWeight: 500, color: '#475569', lineHeight: 1.2, whiteSpace: 'nowrap' }}>{profile.nextScheduleTime}</div>
          </div>
        </div>
        <MetricItem icon={<DialysisTypeIcon />} label="Dialysis Type" value={profile.dialysisType} />

        <MetricItem icon={<VascularIcon />} label="Vascular Access" value={profile.vascularAccess} />
        <MetricItem icon={<DoctorIcon />} label="Nephrologist" value={profile.nephrologist} />
        {/* empty cell under Dialysis Type for symmetry */}
        <div />
      </div>

      {/* Today's Assignment box */}
      <div
        style={{
          flex: '0 0 220px',
          background: '#f0f7ff',
          border: '1px solid #dbeafe',
          borderRadius: 10,
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 8,
          alignSelf: 'center',
          minHeight: 88,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1.2, marginBottom: 2 }}>Today&apos;s Assignment</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontSize: 11.5, color: '#64748b', whiteSpace: 'nowrap' }}>Shift / Time</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>{profile.assignment.shift}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontSize: 11.5, color: '#64748b', whiteSpace: 'nowrap' }}>Bed / Machine</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>{profile.assignment.bedMachine}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontSize: 11.5, color: '#64748b', whiteSpace: 'nowrap' }}>Attending Technician</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>{profile.assignment.technician}</span>
        </div>
      </div>
    </div>
  );
};

export default PreDialysisPatientProfileCard;
