import React, { useState, useEffect, useMemo, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  getAssignedDoctorData,
  addDoctorToPatient,
  deleteAssignedDoctor,
} from '../../../ApiCalls/doctorPatientApis';
import {
  getAssignedAdminData,
  addAdminToPatient,
  deleteAssignedAdmin,
} from '../../../ApiCalls/adminPatientApis';
import { exportPatientDataById, exportPatientData, deletePatient } from '../../../ApiCalls/patientAPis';
import { getDoctors } from '../../../ApiCalls/doctorApis';
import { getAdmins } from '../../../ApiCalls/authapis';
import { ROUTES } from '../../../routes/routeConstants';
import {
  Flex,
} from '../../../component-library/layout/Layout';
import { isAdminRole } from '../../../helpers/permissions';
import {
  Button
} from '../../../component-library/primitives/Button';
import { Spinner } from '../../../component-library/feedback/Spinner';
import { BaseModal } from '../../../component-library/modals';
import { PageHeader } from '../../../components/PageHeader';
import { SearchBar } from '../../../components';
import { useIsMobile } from '../../../components/mobile/useIsMobile';
import UnifiedListTable from '../../../components/table/UnifiedListTable';

import PatientAppointmentTimeline from '../../../components/PatientAppointmentTimeline';
import { getAllAppointmentsById } from '../../../ApiCalls';

// Import icons and default avatars
import PlusIcon from '../../../assets/icons/plus.svg';
import DefaultAvatarFemale from '../../../assets/default-avatar-female.png';
import DefaultAvatarMale from '../../../assets/default-avatar-male.png';
import DefaultAvatar from '../../../assets/default-avatar.png';
import Edit from "../../../assets/Edit.svg"; // Assuming you have an Edit icon in your assets

import RefreshButton from "../../../components/RefreshButton/RefreshButton";
import { usePageCache, PAGE_CACHE } from "../../../cache";
import { isRole } from '../../../helpers/roleUtils';
import { CalendarIcon, ClipboardIcon } from '../../dashboard/components/DashboardIcons';
import UserLabReports from '../../UserLabReports/UserLabReports';


const PatientList = ({ data, onAddClick }) => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const role = useSelector((state) => state.permission);

  // State management
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamModal, setTeamModal] = useState({
    isOpen: false,
    type: null,
    patient: null,
  });
  const [currentTeamMembers, setCurrentTeamMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('');
  const [hospitalOptions, setHospitalOptions] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamActionLoading, setTeamActionLoading] = useState(false);
  const [assignedDoctorsByPatient, setAssignedDoctorsByPatient] = useState({});
  const [assignedAdminsByPatient, setAssignedAdminsByPatient] = useState({});
  // Appointment modal / timeline state (for dialysis technician view)
  const [appointmentModal, setAppointmentModal] = useState({ isOpen: false, patient: null });
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [appointmentLoading, setAppointmentLoading] = useState(false);
  const [appointmentError, setAppointmentError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  // Lab reports modal state (for dialysis technician)
  const [labModal, setLabModal] = useState({ isOpen: false, patientId: null, patientName: '' });

  // Sync with prop data and load assigned users for all patients
  useEffect(() => {
    if (data) {
      setPatients(data);
      loadAssignedUsersForAllPatients(data);
    }
  }, [data]);

  const loadAssignedUsersForAllPatients = async (patientList) => {
    try {
      const doctorsMap = {};
      const adminsMap = {};

      // Load assigned doctors and admins for all patients in parallel
      const promises = patientList.map(async (patient) => {
        try {
          const [doctorsRes, adminsRes] = await Promise.all([
            getAssignedDoctorData(patient.id),
            getAssignedAdminData(patient.id),
          ]);
          doctorsMap[patient.id] = getCollection(doctorsRes);
          adminsMap[patient.id] = getCollection(adminsRes);
        } catch (err) {
          console.error(`Error loading assigned users for patient ${patient.id}:`, err);
          doctorsMap[patient.id] = [];
          adminsMap[patient.id] = [];
        }
      });

      await Promise.all(promises);
      setAssignedDoctorsByPatient(doctorsMap);
      setAssignedAdminsByPatient(adminsMap);
    } catch (err) {
      console.error('Error loading assigned users:', err);
    }
  };

  const getCollection = (res) => {
    if (Array.isArray(res?.data?.data)) return res.data.data;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  };

  const getDisplayName = (member) => {
    return member?.name || member?.firstname || member?.email || `#${member?.id || '-'}`;
  };

  const getMemberRole = (member) => {
    // Try common fields that may contain a role/designation
    return (
      member?.role || member?.designation || member?.role_name || member?.user_role || member?.speciality || member?.specialization || null
    );
  };

  const getMemberHospital = (member) => {
    return member?.practicingAt || member?.institute || member?.hospital || member?.facility || '';
  };

  const getEntityId = (member, type) => {
    if (type === 'doctor') return member?.doctor_id || member?.id;
    return member?.admin_id || member?.id;
  };

  const getAssignmentId = (member) => {
    return member?.assignment_id || member?.assigned_id || member?.id;
  };

  const loadTeamModalData = async (patientId, type) => {
    setTeamLoading(true);
    try {
      if (type === 'doctor') {
        const [assignedRes, allDoctorsRes] = await Promise.all([
          getAssignedDoctorData(patientId),
          getDoctors(),
        ]);
        const doctors = getCollection(allDoctorsRes);
        const hospitals = Array.from(
          new Set(
            doctors
              .map((doc) => doc?.practicingAt || doc?.institute || doc?.hospital || '')
              .filter(Boolean)
          )
        );
        setCurrentTeamMembers(getCollection(assignedRes));
        setAvailableUsers(doctors);
        setHospitalOptions(hospitals);
        setSelectedHospital('');
      } else {
        const [assignedRes, allAdminsRes] = await Promise.all([
          getAssignedAdminData(patientId),
          getAdmins(),
        ]);
        setCurrentTeamMembers(getCollection(assignedRes));
        setAvailableUsers(getCollection(allAdminsRes));
        setHospitalOptions([]);
        setSelectedHospital('');
      }
      setError(null);
    } catch (err) {
      console.error('Error loading team data:', err);
      setError('Failed to load team details.');
    } finally {
      setTeamLoading(false);
    }
  };

  const openTeamModal = async (patient, type, event) => {
    event?.stopPropagation?.();
    setSelectedUserId('');
    setSelectedHospital('');
    setTeamModal({ isOpen: true, type, patient });
    await loadTeamModalData(patient.id, type);
  };

  const closeTeamModal = () => {
    setTeamModal({ isOpen: false, type: null, patient: null });
    setSelectedUserId('');
    setSelectedHospital('');
    setCurrentTeamMembers([]);
    setAvailableUsers([]);
    setHospitalOptions([]);
  };

  // Load appointments for a patient (uses existing ApiCalls helper)
  const loadAppointmentsForPatient = async (patientId) => {
    setAppointmentLoading(true);
    setAppointmentError(null);
    try {
      const res = await getAllAppointmentsById();
      if (res && res.success) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const filtered = list.filter((apt) => String(apt.patient_id) === String(patientId) || String(apt.patientId) === String(patientId));
        if (!filtered || filtered.length === 0) {
          // fallback to dummy data when no appointments for this patient
          setPatientAppointments(generateDummyAppointments(patientId));
        } else {
          setPatientAppointments(filtered);
        }
      } else {
        // API returned failure — provide dummy data so UI remains useful
        setAppointmentError(res?.data?.message || 'Failed to fetch appointments; showing sample data');
        setPatientAppointments(generateDummyAppointments(patientId));
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setAppointmentError('Failed to fetch appointments; showing sample data');
      setPatientAppointments(generateDummyAppointments(patientId));
    } finally {
      setAppointmentLoading(false);
    }
  };

  // Generate lightweight dummy appointments for demo/fallback
  const generateDummyAppointments = (patientId) => {
    const statuses = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'MISSED', 'PENDING', 'COMPLETED', 'CANCELLED'];
    const doctors = ['Dr. Shah', 'Dr. Mehta', 'Dr. Singh', 'Dr. Patel'];
    const services = ['Hemodialysis', 'Peritoneal dialysis', 'Consultation'];
    const items = [];
    const today = new Date();

    // create appointments spanning ~4 months in the past to ~1 month future
    const startOffset = -120; // days
    const endOffset = 30; // days
    const step = 2; // every 2 days to keep list manageable (~75 entries)

    for (let i = startOffset; i <= endOffset; i += step) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);

      const idx = Math.abs(i) % statuses.length;
      const status = statuses[idx];

      const hour = 6 + (Math.abs(i) % 10); // varying hour between 6..15
      const minute = (Math.abs(i) % 2) === 0 ? '00' : '30';

      const doctor = doctors[Math.abs(i) % doctors.length];
      const service = services[Math.abs(i) % services.length];

      items.push({
        id: `sample-${patientId}-${i}-${Math.abs(i)}`,
        patient_id: patientId,
        appointment_date: d.toISOString(),
        appointment_time: `${String(hour).padStart(2, '0')}:${minute}`,
        status,
        duration_minutes: status === 'COMPLETED' ? 240 : 30,
        doctor_name: doctor,
        service_name: service,
        notes: status === 'MISSED' ? 'Patient did not arrive' : (status === 'PENDING' ? 'Awaiting confirmation' : ''),
      });
    }

    return items;
  };

  const openAppointmentModal = async (patient, event) => {
    event?.stopPropagation?.();
    setAppointmentModal({ isOpen: true, patient });
    setPatientAppointments([]);
    await loadAppointmentsForPatient(patient.id);
  };

  const openLabModal = (patient, event) => {
    event?.stopPropagation?.();
    setLabModal({ isOpen: true, patientId: patient.id, patientName: patient.name });
  };

  const closeLabModal = () => {
    setLabModal({ isOpen: false, patientId: null, patientName: '' });
  };

  const closeAppointmentModal = () => {
    setAppointmentModal({ isOpen: false, patient: null });
    setPatientAppointments([]);
    setAppointmentError(null);
    setSelectedAppointment(null);
  };

  const handleAssignMember = async () => {
    if (!teamModal?.patient?.id || !selectedUserId) return;

    setTeamActionLoading(true);
    try {
      if (teamModal.type === 'doctor') {
        await addDoctorToPatient(teamModal.patient.id, { doctor_id: selectedUserId });
      } else {
        await addAdminToPatient(teamModal.patient.id, { admin_id: selectedUserId });
      }
      setSelectedUserId('');
      await loadTeamModalData(teamModal.patient.id, teamModal.type);
      // Reload assigned users cache for this patient
      try {
        if (teamModal.type === 'doctor') {
          const doctorsRes = await getAssignedDoctorData(teamModal.patient.id);
          setAssignedDoctorsByPatient(prev => ({
            ...prev,
            [teamModal.patient.id]: getCollection(doctorsRes)
          }));
        } else {
          const adminsRes = await getAssignedAdminData(teamModal.patient.id);
          setAssignedAdminsByPatient(prev => ({
            ...prev,
            [teamModal.patient.id]: getCollection(adminsRes)
          }));
        }
      } catch (cacheErr) {
        console.error('Error updating cache:', cacheErr);
      }
      setError(null);
    } catch (err) {
      console.error('Error assigning team member:', err);
      setError('Failed to assign user.');
    } finally {
      setTeamActionLoading(false);
    }
  };

  const handleRemoveMember = async (member) => {
    const userId = getEntityId(member, teamModal.type);
    if (!userId) return;

    setTeamActionLoading(true);
    try {
      if (teamModal.type === 'doctor') {
        await deleteAssignedDoctor(teamModal.patient.id, userId);
      } else {
        await deleteAssignedAdmin(teamModal.patient.id, userId);
      }
      await loadTeamModalData(teamModal.patient.id, teamModal.type);
      // Reload assigned users cache for this patient
      try {
        if (teamModal.type === 'doctor') {
          const doctorsRes = await getAssignedDoctorData(teamModal.patient.id);
          setAssignedDoctorsByPatient(prev => ({
            ...prev,
            [teamModal.patient.id]: getCollection(doctorsRes)
          }));
        } else {
          const adminsRes = await getAssignedAdminData(teamModal.patient.id);
          setAssignedAdminsByPatient(prev => ({
            ...prev,
            [teamModal.patient.id]: getCollection(adminsRes)
          }));
        }
      } catch (cacheErr) {
        console.error('Error updating cache:', cacheErr);
      }
      setError(null);
    } catch (err) {
      console.error('Error removing team member:', err);
      setError('Failed to remove user.');
    } finally {
      setTeamActionLoading(false);
    }
  };

  // Filter patients based on search term
  const filteredPatients = useMemo(() => {
    const list = patients || [];
    if (!searchTerm.trim()) return list;

    const lowerSearch = searchTerm.toLowerCase();
    return list.filter(patient =>
      patient.name?.toLowerCase().includes(lowerSearch) ||
      patient.number?.toString().includes(searchTerm) ||
      patient.program?.toLowerCase().includes(lowerSearch)
    );
  }, [patients, searchTerm]);

  // prepare columns for unified table (desktop + mobile card support)
  const columns = useMemo(() => {
    const isAdmin = isAdminRole(role?.role_name);
    const isDialysisTechnician = isRole(role, 'dialysis');

    // When user is dialysis technician show a compact set of columns
    if (isDialysisTechnician) {
    // if (true) {
      return [
        { key: 'profile', label: 'Profile', type: 'image', width: '111px', justifyContent: 'start' },
        { 
          key: 'patient_details', 
          label: 'PATIENT DETAILS', 
          type: 'custom', 
          width: '300px',
          render: (row) => {
            const code = row.patientCode || row.patient_code || row.id || '-';
            const name = row.name || '-';
            const age = row.age || '-';
            const gender = row.gender || '-';
            const phone = row.number || row.phone || '-';
            return <div style={{ fontSize: '13px', fontWeight: 600 }}>{`${code} / ${name} / ${age} / ${gender} / ${phone}`}</div>;
          }
        },
        { key: 'ailment', label: 'Ailment', type: 'text', width: '120px' },
        {
          key: 'condition', label: 'Condition', type: 'custom', width: '120px', render: (row) => (
            <span className={getConditionStyles(row.condition)}>{row.condition || '-'}</span>
          )
        },
        {
          key: 'labreports',
          label: 'Lab Reports',
          type: 'custom',
          width: '120px',
          render: (row) => (
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', height: '100%', paddingLeft: 12 }}>
              <Button
                variant="outline"
                onClick={(e) => openLabModal(row, e)}
                aria-label={`Open lab reports for ${row.name}`}
                style={{ justifyContent: 'center', fontSize: '14px', padding: '6px', minWidth: '34px', height: '34px' }}
              >
                <ClipboardIcon className="w-5 h-5" />
              </Button>
              <span style={{ marginLeft: 8, fontSize: 13, color: '#374151', display: 'none' }} className="hidden md:inline">Reports</span>
            </div>
          )
        },
        {
          key: 'appointments',
          label: 'Appointment Details',
          type: 'custom',
          width: '120px',
          render: (row) => (
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', height: '100%', paddingLeft: 12 }}>
              <Button
                variant="outline"
                onClick={(e) => openAppointmentModal(row, e)}
                aria-label={`Open appointments for ${row.name}`}
                style={{ justifyContent: 'center', fontSize: '14px', padding: '6px', minWidth: '34px', height: '34px' }}
              >
                <CalendarIcon className="w-5 h-5" />
              </Button>
              {/** Small label next to icon (hidden on small screens) */}
              <span style={{ marginLeft: 8, fontSize: 13, color: '#374151', display: 'none' }} className="hidden md:inline">View</span>
            </div>
          )
        },
      ];
    }

    const cols = [
      { key: 'profile', label: 'Profile', type: 'image', width: '111px', justifyContent: 'start' },
      { 
        key: 'patient_details', 
        label: 'PATIENT DETAILS', 
        type: 'custom', 
        width: '300px',
        render: (row) => {
          const code = row.patientCode || row.patient_code || row.id || '-';
          const name = row.name || '-';
          const age = row.age || '-';
          const gender = row.gender || '-';
          const phone = row.number || row.phone || '-';
          return <div style={{ fontSize: '13px', fontWeight: 600 }}>{`${code} / ${name} / ${age} / ${gender} / ${phone}`}</div>;
        }
      },
      {
        key: 'condition', label: 'Condition', type: 'custom', width: '120px', render: (row) => (
          <span className={getConditionStyles(row.condition)}>{row.condition || '-'}</span>
        )
      },
      {
        key: 'registered_date',
        label: 'Registration Date',
        type: 'custom',
        width: '202px',
        render: (row) => formatDateString(row.registered_date),
      },
      { key: 'program', label: 'Program', type: 'text', width: '129px' },
      {
        key: 'medical_team',
        label: 'Medical Team',
        type: 'custom',
        width: '210px',
        render: (row) => {
          const doctors = assignedDoctorsByPatient[row.id] || [];
          return (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', color: '#4b5563' }}>
                {doctors.length > 0 ? (
                  doctors.map((doc, i) => {
                    const roleLabel = getMemberRole(doc);
                    return (
                      <div key={getEntityId(doc, 'doctor') || i}>
                        {getDisplayName(doc)}{roleLabel ? ` (${roleLabel})` : ''}
                      </div>
                    );
                  })
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </div>

              {isAdmin && (
                <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <Button
                    variant="outline"
                    onClick={(e) => openTeamModal(row, 'doctor', e)}
                    style={{
                      justifyContent: 'center',
                      fontSize: '12px',
                      padding: '6px 8px',
                      border: '0px',
                      minWidth: '34px',
                      height: '34px',
                      alignSelf: 'center',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0)',
                    }}
                    aria-label="Manage Doctors"
                  >
                    <img src={Edit} alt="Manage" style={{ width: '22px', height: '22px' }} />
                  </Button>
                </div>
              )}
            </div>
          );
        },
      },

      // Only show assigned admins column to admin users
      ...(isAdmin ? [
        {
          key: 'admin',
          label: 'Assigned To',
          type: 'custom',
          width: '210px',
          render: (row) => {
            const admins = assignedAdminsByPatient[row.id] || [];
            return (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', color: '#4b5563' }}>
                  {admins.length > 0 ? (
                    admins.map((admin, i) => {
                      const roleLabel = getMemberRole(admin);
                      return (
                        <div key={getEntityId(admin, 'admin') || i}>
                          {getDisplayName(admin)}{roleLabel ? ` (${roleLabel})` : ''}
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <Button
                    variant="outline"
                    onClick={(e) => openTeamModal(row, 'admin', e)}
                    style={{
                      justifyContent: 'center',
                      fontSize: '12px',
                      padding: '6px 8px',
                      border: '0px',
                      minWidth: '34px',
                      height: '34px',
                      alignSelf: 'center',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0)',
                    }}
                    aria-label="Manage Admins"
                  >
                    <img src={Edit} alt="Manage" style={{ width: '22px', height: '22px' }} />
                  </Button>
                </div>
              </div>
            );
          },
        }
      ] : []),
      { key: 'actions', label: 'Actions', type: 'actions', width: '90px' },
    ];

    return cols;
  }, [assignedDoctorsByPatient, assignedAdminsByPatient, role]);

  // Profile Image or default with gender-based avatar fallback
  const getProfileImageUrl = (photoUrl, gender) => {
    if (photoUrl) {
      if (photoUrl.startsWith('http')) return photoUrl;
      return `${process.env.REACT_APP_API_BASE_URL}${photoUrl}`;
    }
    // Use gender-based default avatar
    const genderLower = gender?.toLowerCase();
    if (genderLower === 'female') return DefaultAvatarFemale;
    if (genderLower === 'male') return DefaultAvatarMale;
    return DefaultAvatar;
  };

  const tableData = useMemo(() =>
    filteredPatients.map((p) => ({
      ...p,
      profile: getProfileImageUrl(p.profile_photo, p.gender),
    })),
    [filteredPatients]
  );

  // Handle export single patient
  const handleDownload = async (id) => {
    try {
      const response = await exportPatientDataById(id, { responseType: 'blob' });
      if (response.success) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `patient_${id}_data.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        setError('Failed to download data.');
      }
    } catch (err) {
      console.error('Error downloading patient data:', err);
      setError('Failed to download data.');
    }
  };

  // Handle export all
  const handleExportAll = async () => {
    try {
      const response = await exportPatientData({ responseType: 'blob' });
      if (response.success) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `all_patients_data_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        setError('Failed to export all data.');
      }
    } catch (err) {
      console.error('Error exporting all patients:', err);
      setError('Failed to export all data.');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return;
    try {
      await deletePatient(id);
      setPatients(patients.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting patient:', err);
      setError('Failed to delete patient.');
    }
  };

  // Handle patient click
  const handlePatientClick = (patient) => {
    // If dialysis technician, open appointment timeline modal instead of navigating
    const isDialysisTechnician = isRole(role, 'dialysis');
    if (isDialysisTechnician) {
    // if (true) {
      openAppointmentModal(patient);
      return;
    }

    // Default: navigate to user profile
    startTransition(() => {
      navigate(ROUTES.userProfile(patient.id), { state: patient });
    });
  };

  // Date Formatter (DD-MM-YYYY as per original)
  const formatDateString = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Condition color mapping
  const getConditionStyles = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'stable': return "bg-green-200 text-green-800 p-2"; // green
      case 'unstable': return "bg-yellow-200 text-yellow-800 p-2"; // yellow/orange
      case 'critical': return "bg-red-200 text-red-800 p-2"; // red
      default: return "bg-gray-200 text-gray-800 p-2"; // gray
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: '400px' }}>
        <Spinner size="lg" color="primary" />
      </Flex>
    );
  }

  return (
    <div className={`admin-page-content ${isMobile ? 'px-3 pb-20' : ''}`}>
      <div className="">

        {/* Header & toolbar section */}
        {/* {!isMobile && (
        <Box
          className={`border-b-2 border-solid ${isMobile ? 'pb-2' : ''}`}
          style={{
            borderColor: 'var(--color-info)',
            height: isMobile ? 'auto' : '100px',
            position: 'relative'
          }}
        >
          <Heading
            as="h1"
            size={isMobile ? 'none' : '2xl'}
            style={{
              ...(isMobile ? {} : {
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
              }),
              color: 'var(--color-accent)',
              fontFamily: 'Sora, sans-serif',
              fontWeight: 'bold'
            }}
          >
            My Patients
          </Heading>
        </Box>
      )} */}

        {!isMobile && (
          <PageHeader
            title="My Patients"
            breadcrumbs={["Dashboard", "My Patients"]}
            onBack={() => navigate(ROUTES.HOME)}
          />
        )}
        <div className={`admin-card__header`}>
          <div className={`admin-toolbar ${isMobile ? 'flex-col gap-2' : ''}`}>
            <div className="admin-toolbar__left" style={isMobile ? { width: '100%' } : {}}>
              <SearchBar
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={isMobile ? { width: '100%' } : { flex: 1, minWidth: '200px' }}
              />
            </div>
            <div className={`admin-toolbar__right ${isMobile ? 'w-full justify-between' : ''}`}>
              <span className={`admin-toolbar__count ${isMobile ? 'text-xs' : ''}`}>Total patients: <span className='font-bold'>{filteredPatients.length}</span></span>
              <Flex gap={4} className={isMobile ? '' : ''}>
                {role.canEditPatients && (
                  <>
                    <Button
                      variant="solid"
                      // size="lg"
                      onClick={() => {
                        if (onAddClick) onAddClick();
                        else navigate("/patients/new");
                      }}
                      style={{
                        backgroundColor: '#4164df',
                        borderRadius: '10px',
                        fontFamily: 'Sora, sans-serif',
                        fontSize: isMobile ? '13px' : '16px',
                        fontWeight: '600',
                        padding: isMobile ? '6px 12px' : '9px 15px',
                      }}
                    >
                      <Flex gap={isMobile ? 1 : 2} justify="start" align="start">
                        <img src={PlusIcon} alt="Add" style={{ width: isMobile ? '14px' : '18px' }} />
                        <span style={{ color: 'white', fontWeight: 600 }}>{isMobile ? 'Add' : 'Add Patient'}</span>
                      </Flex>
                    </Button>
                    <Button
                      variant="solid"
                      // size="lg"
                      onClick={handleExportAll}
                      style={{
                        backgroundColor: '#4164df',
                        borderRadius: '10px',
                        fontFamily: 'Sora, sans-serif',
                        fontSize: isMobile ? '13px' : '16px',
                        fontWeight: '600',
                        padding: isMobile ? '6px 12px' : '9px 15px',
                      }}
                    >
                      Export all
                    </Button>
                  </>
                )}
                <RefreshButton pageName={PAGE_CACHE.PATIENTS.name} />
              </Flex>
            </div>
          </div>
        </div>

        {/* unified list/table for patients (desktop + mobile) */}
        <UnifiedListTable
          columns={columns}
          data={tableData}
          onRowClick={handlePatientClick}
          onEdit={role.canEditPatients ? handlePatientClick : null}
          onDelete={role.canDeletePatients ? (row) => handleDelete(row.id) : null}
          onDownload={role.canEditPatients ? (row) => handleDownload(row.id) : null}
          enableSearch={false}
          actionButtons={true}
          displayMode={undefined} /* auto-switch based on isMobile */
          cardTitleKey="name"
          cardSubtitleKey="number"
          cardImageKey="profile"
          cardFieldKeys={['program', 'registered_date']}
          cardStatusKey="condition"
        />

        <BaseModal
          isOpen={teamModal.isOpen}
          onClose={closeTeamModal}
          title={`${teamModal.type === 'doctor' ? 'Medical Team' : 'Assigned To'}`}
          size="lg"
          footer={
            <Flex justify="end" gap={3}>
              <Button variant="outline" onClick={closeTeamModal} isDisabled={teamActionLoading}>
                Close
              </Button>
              <Button
                variant="solid"
                onClick={handleAssignMember}
                isDisabled={!selectedUserId || teamActionLoading || teamLoading}
                isLoading={teamActionLoading}
              >
                Add Selected
              </Button>
            </Flex>
          }
        >
          {teamLoading ? (
            <Flex justify="center" align="center" style={{ minHeight: '180px' }}>
              <Spinner size="md" color="primary" />
            </Flex>
          ) : (
            <div>
              <div className="mb-4">
                {teamModal.type === 'doctor' ? (
                  <>
                    <label htmlFor="hospital-select" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                      Select Hospital
                    </label>
                    <select
                      id="hospital-select"
                      value={selectedHospital}
                      onChange={(e) => {
                        setSelectedHospital(e.target.value);
                        setSelectedUserId('');
                      }}
                      style={{
                        width: '100%',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        outline: 'none',
                        marginBottom: '12px',
                      }}
                    >
                      <option value="">Select hospital...</option>
                      {hospitalOptions.map((hospital) => (
                        <option key={hospital} value={hospital}>
                          {hospital}
                        </option>
                      ))}
                    </select>

                    <label htmlFor="team-member-select" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                      Select Medical Staff
                    </label>
                    <select
                      id="team-member-select"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      disabled={!selectedHospital}
                      style={{
                        width: '100%',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        outline: 'none',
                      }}
                    >
                      <option value="">Select...</option>
                      {availableUsers
                        .filter((candidate) => {
                          const candidateId = String(getEntityId(candidate, teamModal.type));
                          const candidateHospital = getMemberHospital(candidate);
                          return (
                            candidateHospital === selectedHospital &&
                            !currentTeamMembers.some((member) => String(getEntityId(member, teamModal.type)) === candidateId)
                          );
                        })
                        .map((candidate) => {
                          const candidateId = getEntityId(candidate, teamModal.type);
                          const hospitalLabel = getMemberHospital(candidate);
                          const roleLabel = getMemberRole(candidate);
                          return (
                            <option key={candidateId} value={candidateId}>
                              {getDisplayName(candidate)}{hospitalLabel ? ` — ${hospitalLabel}` : ''}{roleLabel ? ` (${roleLabel})` : ''}
                            </option>
                          );
                        })}
                    </select>
                  </>
                ) : (
                  <>
                    <label htmlFor="team-member-select" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                      Select Admin
                    </label>
                    <select
                      id="team-member-select"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      style={{
                        width: '100%',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        outline: 'none',
                      }}
                    >
                      <option value="">Select...</option>
                      {availableUsers
                        .filter((candidate) => {
                          const candidateId = String(getEntityId(candidate, teamModal.type));
                          return !currentTeamMembers.some((member) => String(getEntityId(member, teamModal.type)) === candidateId);
                        })
                        .map((candidate) => {
                          const candidateId = getEntityId(candidate, teamModal.type);
                          const roleLabel = getMemberRole(candidate);
                          return (
                            <option key={candidateId} value={candidateId}>
                              {getDisplayName(candidate)}{roleLabel ? ` (${roleLabel})` : ''}
                            </option>
                          );
                        })}
                    </select>
                  </>
                )}
              </div>

              <div>
                <h4 style={{ fontWeight: 700, marginBottom: '10px' }}>
                  Current {teamModal.type === 'doctor' ? 'Doctors' : 'Admins'}
                </h4>

                {currentTeamMembers.length === 0 ? (
                  <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No users assigned yet.</p>
                ) : (
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {currentTeamMembers.map((member, idx) => {
                      const roleLabel = getMemberRole(member);
                      const hospitalLabel = getMemberHospital(member);
                      return (
                        <Flex
                          key={`${getAssignmentId(member) || idx}`}
                          justify="between"
                          align="center"
                          style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '8px 10px',
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span>{getDisplayName(member)}</span>
                            {(hospitalLabel || roleLabel) && (
                              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                {hospitalLabel ? `${hospitalLabel}` : ''}
                                {hospitalLabel && roleLabel ? ' • ' : ''}
                                {roleLabel ? `${roleLabel}` : ''}
                              </span>
                            )}
                          </div>
                          <Button
                            variant="danger"
                            onClick={() => handleRemoveMember(member)}
                            isDisabled={teamActionLoading}
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                          >
                            Remove
                          </Button>
                        </Flex>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </BaseModal>

        {/* Lab reports modal (for dialysis technicians) */}
        <BaseModal
          isOpen={labModal.isOpen}
          onClose={closeLabModal}
          title={`${labModal.patientName ? `${labModal.patientName} — ` : ''}Lab Reports`}
          size="8xl"
          contentStyle={{ width: '80vw', maxWidth: '80vw', height: '88vh' }}
          bodyStyle={{ paddingTop: 12 }}
          footer={
            <Flex justify="end" gap={3}>
              <Button variant="outline" onClick={closeLabModal}>Close</Button>
            </Flex>
          }
        >
          <div style={{ minHeight: 200 }}>
            {labModal.patientId ? (
              <UserLabReports patientId={labModal.patientId} />
            ) : (
              <div style={{ padding: 20, color: '#6b7280' }}>No patient selected.</div>
            )}
          </div>
        </BaseModal>
        {/* Appointment timeline modal (for dialysis technicians) */}
        <BaseModal
          isOpen={appointmentModal.isOpen}
          onClose={closeAppointmentModal}
          title={`${appointmentModal.patient?.name || ''} — Appointments`}
          size="8xl"
          contentStyle={{ width: '80vw', maxWidth: '80vw', height: '88vh' }}
          bodyStyle={{ paddingTop: 12 }}
          footer={
            <Flex justify="end" gap={3}>
              <Button variant="outline" onClick={closeAppointmentModal}>Close</Button>
            </Flex>
          }
        >
          {appointmentLoading ? (
            <Flex justify="center" align="center" style={{ minHeight: '180px' }}>
              <Spinner size="md" color="primary" />
            </Flex>
          ) : (
            <div>
              <div style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 30, padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                {appointmentError && (
                  <div style={{ color: '#b91c1c', marginBottom: 8 }}>{appointmentError}</div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ fontWeight: 700 }}>Appointment Timeline</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>
                    {patientAppointments && patientAppointments.length > 0 ? (
                      (() => {
                        const dates = patientAppointments
                          .map((a) => new Date(a.appointment_date || a.date || a.createdAt))
                          .filter((d) => !Number.isNaN(d?.getTime()))
                          .sort((x, y) => x - y);
                        const first = dates[0];
                        const last = dates[dates.length - 1];
                        return `${first ? formatDateString(first.toISOString()) : '-'} → ${last ? formatDateString(last.toISOString()) : '-'}`;
                      })()
                    ) : 'No appointments'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginTop: 10 }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}><span style={{ width: 10, height: 10, background: '#22C55E', borderRadius: 10 }}></span> Completed</div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}><span style={{ width: 10, height: 10, background: '#EF4444', borderRadius: 10 }}></span> Missed</div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}><span style={{ width: 10, height: 10, background: '#EAB308', borderRadius: 10 }}></span> Pending</div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}><span style={{ width: 10, height: 10, background: '#6B7280', borderRadius: 10 }}></span> Cancelled</div>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <PatientAppointmentTimeline appointments={patientAppointments} onCellClick={(apt) => setSelectedAppointment(apt)} />
              </div>
            </div>
          )}
        </BaseModal>

        {/* Appointment detail modal */}
        <BaseModal
          isOpen={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          title="Appointment details"
          size="sm"
          footer={
            <Flex justify="end" gap={3}>
              <Button variant="outline" onClick={() => setSelectedAppointment(null)}>Close</Button>
            </Flex>
          }
        >
          {selectedAppointment ? (
            <div style={{ display: 'grid', gap: 8 }}>
              <div><strong>Date:</strong> {formatDateString(selectedAppointment.appointment_date || selectedAppointment.date || selectedAppointment.createdAt)}</div>
              <div><strong>Time:</strong> {selectedAppointment.appointment_time || (selectedAppointment.date ? new Date(selectedAppointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-')}</div>
              <div><strong>Status:</strong> {String(selectedAppointment.status || selectedAppointment.statusName || '-')}</div>
              {selectedAppointment.notes && <div><strong>Notes:</strong> {selectedAppointment.notes}</div>}
            </div>
          ) : null}
        </BaseModal>
      </div>
    </div>
  );
};

export default PatientList;


