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
import {
  Button
} from '../../../component-library/primitives/Button';
import { Spinner } from '../../../component-library/feedback/Spinner';
import { BaseModal } from '../../../component-library/modals';
import { PageHeader } from '../../../components/PageHeader';
import { SearchBar } from '../../../components';
import { useIsMobile } from '../../../components/mobile/useIsMobile';
import UnifiedListTable from '../../../components/table/UnifiedListTable';

// Import icons and default avatars
import PlusIcon from '../../../assets/icons/plus.svg';
import DefaultAvatarFemale from '../../../assets/default-avatar-female.png';
import DefaultAvatarMale from '../../../assets/default-avatar-male.png';
import DefaultAvatar from '../../../assets/default-avatar.png';


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
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamActionLoading, setTeamActionLoading] = useState(false);

  // Sync with prop data
  useEffect(() => {
    if (data) {
      setPatients(data);
    }
  }, [data]);

  const getCollection = (res) => {
    if (Array.isArray(res?.data?.data)) return res.data.data;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  };

  const getDisplayName = (member) => {
    return member?.name || member?.firstname || member?.email || `#${member?.id || '-'}`;
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
        setCurrentTeamMembers(getCollection(assignedRes));
        setAvailableUsers(getCollection(allDoctorsRes));
      } else {
        const [assignedRes, allAdminsRes] = await Promise.all([
          getAssignedAdminData(patientId),
          getAdmins(),
        ]);
        setCurrentTeamMembers(getCollection(assignedRes));
        setAvailableUsers(getCollection(allAdminsRes));
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
    setTeamModal({ isOpen: true, type, patient });
    await loadTeamModalData(patient.id, type);
  };

  const closeTeamModal = () => {
    setTeamModal({ isOpen: false, type: null, patient: null });
    setSelectedUserId('');
    setCurrentTeamMembers([]);
    setAvailableUsers([]);
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
  const columns = useMemo(() => [
    { key: 'profile', label: 'Profile', type: 'image', width: '111px', justifyContent: 'start' },
    { key: 'name', label: 'Name', type: 'text', width: '107px' },
    { key: 'gender', label: 'Gender', type: 'text', width: '90px' },
    {
      key: 'condition', label: 'Condition', type: 'custom', width: '120px', render: (row) => (
        <span className={getConditionStyles(row.condition)}>{row.condition || '-'}</span>
      )
    },
    { key: 'number', label: 'Number', type: 'text', width: '125px' },
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
      render: (row) => (
        <Button
          variant="outline"
          onClick={(e) => openTeamModal(row, 'doctor', e)}
          style={{
            borderRadius: '8px',
            fontSize: '12px',
            padding: '6px 10px',
          }}
        >
          Manage Doctors
        </Button>
      ),
    },
    {
      key: 'admin',
      label: 'Assigned To',
      type: 'custom',
      width: '210px',
      render: (row) => (
        <Button
          variant="outline"
          onClick={(e) => openTeamModal(row, 'admin', e)}
          style={{
            borderRadius: '8px',
            fontSize: '12px',
            padding: '6px 10px',
          }}
        >
          Manage Admins
        </Button>
      ),
    },
    { key: 'actions', label: 'Actions', type: 'actions', width: '90px' },
  ], []);

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
    // Navigate to user profile page using route constants
    // Wrap navigation in startTransition to avoid suspending during synchronous input
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
              </Flex>
            </div>
          </div>
        </div>

        {/* unified list/table for patients (desktop + mobile) */}
        <UnifiedListTable
          columns={columns}
          data={tableData}
          onRowClick={handlePatientClick}
          // onEdit={handlePatientClick}
          onDelete={(row) => handleDelete(row.id)}
          onDownload={(row) => handleDownload(row.id)}
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
                <label htmlFor="team-member-select" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                  Select {teamModal.type === 'doctor' ? 'Doctor' : 'Admin'}
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
                      return (
                        <option key={candidateId} value={candidateId}>
                          {getDisplayName(candidate)}
                        </option>
                      );
                    })}
                </select>
              </div>

              <div>
                <h4 style={{ fontWeight: 700, marginBottom: '10px' }}>
                  Current {teamModal.type === 'doctor' ? 'Doctors' : 'Admins'}
                </h4>

                {currentTeamMembers.length === 0 ? (
                  <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No users assigned yet.</p>
                ) : (
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {currentTeamMembers.map((member, idx) => (
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
                        <span>{getDisplayName(member)}</span>
                        <Button
                          variant="danger"
                          onClick={() => handleRemoveMember(member)}
                          isDisabled={teamActionLoading}
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                        >
                          Remove
                        </Button>
                      </Flex>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </BaseModal>
      </div>
    </div>
  );
};

export default PatientList;


