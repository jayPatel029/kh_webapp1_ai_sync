import React, { useState, useEffect, useMemo, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssignedDoctorData } from '../../../ApiCalls/doctorPatientApis';
import { getAssignedAdminData } from '../../../ApiCalls/adminPatientApis';
import { exportPatientDataById, exportPatientData, deletePatient } from '../../../ApiCalls/patientAPis';
import { ROUTES } from '../../../routes/routeConstants';
import {
  Box,
  Flex,
  VStack,
  Container,
} from '../../../component-library/layout/Layout';
import {
  Button
} from '../../../component-library/primitives/Button';
import {
  Text,
  Heading
} from '../../../component-library/primitives/Typography';
import { Spinner } from '../../../component-library/feedback/Spinner';
import { PageHeader } from '../../../components/PageHeader';
import { SearchBar } from '../../../components';
import { useIsMobile } from '../../../components/mobile/useIsMobile';
import UnifiedListTable from '../../../components/table/UnifiedListTable';

// Import icons
import PlusIcon from '../../../assets/icons/plus.svg';


const PatientList = ({ data, onAddClick }) => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();

  // State management
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [medicalTeamNames, setMedicalTeamNames] = useState({});
  const [adminNames, setAdminNames] = useState({});

  // Sync with prop data
  useEffect(() => {
    if (data) {
      setPatients(data);
      if (data.length > 0) {
        fetchAssociatedData(data);
      }
    }
  }, [data]);

  const fetchAssociatedData = async (patientData) => {
    // For each patient, fetch medical team and admin names
    // This follows the logic in the original DeletePatientList.js
    const promises = patientData.map(async (row) => {
      if (!row?.id) return;

      // Fetch Medical Team
      try {
        const docResponse = await getAssignedDoctorData(row.id);
        if (docResponse.success && docResponse.data?.data) {
          const names = docResponse.data.data.map((doc) => doc.name).join(', ');
          setMedicalTeamNames((prev) => ({ ...prev, [row.id]: names }));
        }
      } catch (err) {
        console.error(`Error fetching medical team for patient ${row.id}:`, err);
      }

      // Fetch Assigned Admin
      try {
        const adminResponse = await getAssignedAdminData(row.id);
        if (adminResponse.success && adminResponse.data?.data) {
          const names = adminResponse.data.data.map((admin) => admin.firstname).join(', ');
          setAdminNames((prev) => ({ ...prev, [row.id]: names }));
        }
      } catch (err) {
        console.error(`Error fetching assigned admin for patient ${row.id}:`, err);
      }
    });

    await Promise.all(promises);
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
      label: 'Medical team',
      type: 'custom',
      width: '170px',
      render: (row) =>
        medicalTeamNames[row.id]
          ? medicalTeamNames[row.id].split(',').map((name, i) => (
            <div key={i}>{name.trim()}</div>
          ))
          : '-',
    },
    {
      key: 'admin',
      label: 'Assigned to',
      type: 'custom',
      width: '157px',
      render: (row) =>
        adminNames[row.id]
          ? adminNames[row.id].split(',').map((name, i) => (
            <div key={i}>{name.trim()}</div>
          ))
          : '-',
    },
    { key: 'actions', label: 'Actions', type: 'actions', width: '90px' },
  ], [medicalTeamNames, adminNames]);

  // Profile Image or default
  const getProfileImageUrl = (photoUrl) => {
    if (!photoUrl) return '/assets/default-avatar.png';
    if (photoUrl.startsWith('http')) return photoUrl;
    return `${process.env.REACT_APP_API_BASE_URL}${photoUrl}`;
  };

  const tableData = useMemo(() =>
    filteredPatients.map((p) => ({
      ...p,
      profile: getProfileImageUrl(p.profile_photo),
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
              </Flex>
            </div>
          </div>
        </div>

        {/* unified list/table for patients (desktop + mobile) */}
        <UnifiedListTable
          columns={columns}
          data={tableData}
          onRowClick={handlePatientClick}
          onEdit={handlePatientClick}
          onDelete={(row) => handleDelete(row.id)}
          onDownload={(row) => handleDownload(row.id)}
          enableSearch={false}
          enablePagination={false}
          actionButtons={true}
          displayMode={undefined} /* auto-switch based on isMobile */
          cardTitleKey="name"
          cardSubtitleKey="number"
          cardImageKey="profile"
          cardFieldKeys={['program', 'registered_date']}
          cardStatusKey="condition"
        />
      </div>
    </div>
  );
};

export default PatientList;


