import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../helpers/axios/axiosInstance.js';
import { server_url } from '../../../constants/constants';
import {
  Box,
  Flex,
  Stack,
  VStack,
  Container
} from '../../../component-library/layout/Layout';
import {
  Button,
  IconButton
} from '../../../component-library/primitives/Button';
import {
  Input,
  InputGroup,
  InputLeftElement
} from '../../../component-library/primitives/Input';
import {
  Text,
  Heading
} from '../../../component-library/primitives/Typography';
import { Spinner } from '../../../component-library/feedback/Spinner';
import { Alert } from '../../../component-library/feedback/Alert';

// Import icons
import SearchIcon from '../../../assets/icons/search.svg';
import DownloadIcon from '../../../assets/icons/download.svg';
import TrashIcon from '../../../assets/icons/trash.svg';
import PlusIcon from '../../../assets/icons/plus.svg';

const PatientList = ({ data, patientId }) => {
  const navigate = useNavigate();

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
        const docResponse = await axiosInstance.get(
          `${server_url}/assignedDoctor/getDoctor/${row.id}`
        );
        if (docResponse.data?.data) {
          const names = docResponse.data.data.map((doc) => doc.name).join(', ');
          setMedicalTeamNames((prev) => ({ ...prev, [row.id]: names }));
        }
      } catch (err) {
        console.error(`Error fetching medical team for patient ${row.id}:`, err);
      }

      // Fetch Assigned Admin
      try {
        const adminResponse = await axiosInstance.get(
          `${server_url}/assignedAdmin/getAdmin/${row.id}`
        );
        if (adminResponse.data?.data) {
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

  // Handle export single patient
  const handleDownload = async (id) => {
    try {
      const response = await axiosInstance.get(
        `${server_url}/patientdata/export/${id}`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `patient_${id}_data.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading patient data:', err);
      setError('Failed to download data.');
    }
  };

  // Handle export all
  const handleExportAll = async () => {
    try {
      const response = await axiosInstance.get(`${server_url}/patientdata/export`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `all_patients_data_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting all patients:', err);
      setError('Failed to export all data.');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return;
    try {
      await axiosInstance.delete(`${server_url}/patient/deletePatient/${id}`);
      setPatients(patients.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting patient:', err);
      setError('Failed to delete patient.');
    }
  };

  // Handle patient click
  const handlePatientClick = (patient) => {
    // Navigating to profile as per previous logic in DeletePatientList
    navigate(`/patients/${patient.id}`, { state: patient });
  };

  // Profile Image or default
  const getProfileImageUrl = (photoUrl) => {
    if (!photoUrl) return '/assets/default-avatar.png';
    if (photoUrl.startsWith('http')) return photoUrl;
    return `${process.env.REACT_APP_API_BASE_URL}${photoUrl}`;
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
      case 'stable': return "bg-green-200 text-green-800"; // green
      case 'unstable': return "bg-yellow-200 text-yellow-800"; // yellow/orange
      case 'critical': return "bg-red-200 text-red-800"; // red
      default: return "bg-gray-200 text-gray-800"; // gray
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
    <VStack spacing={6} align="stretch" className="w-full">
      {error && (
        <Alert status="error" isClosable onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Header section matches Figma */}
      <Box
        className="border-b-2 border-solid"
        style={{
          borderColor: 'var(--color-info)',
          height: '100px',
          position: 'relative'
        }}
      >
        <Heading
          as="h1"
          size="2xl"
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-accent)',
            fontFamily: 'Sora, sans-serif',
            fontWeight: 'bold'
          }}
        >
          My Patients
        </Heading>
      </Box>

      {/* Toolbar */}
      <Flex justify="between" align="center" className="w-full">
        <InputGroup style={{ width: '393px' }}>
          <InputLeftElement>
            <img src={SearchIcon} alt="Search" style={{ width: '20px', height: '20px' }} />
          </InputLeftElement>
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="lg"
            style={{
              borderRadius: '10px',
              fontFamily: 'Sora, sans-serif',
              fontSize: '16px',
            }}
          />
        </InputGroup>

        <Flex gap={4} align="right">
          <Flex gap={2} align="center">
            <Text style={{ fontFamily: 'Sora, sans-serif', fontSize: '16px' }}>Total patients:</Text>
            <Text style={{ fontFamily: 'Sora, sans-serif', fontSize: '16px', fontWeight: 'bold' }}>
              {filteredPatients.length}
            </Text>
          </Flex>

          <Button
            variant="solid"
            size="lg"
            onClick={() => navigate("/patients/new")}
            style={{
              backgroundColor: '#4164df',
              borderRadius: '10px',
              fontFamily: 'Sora, sans-serif',
              fontSize: '16px',
              fontWeight: '600',
              padding: '9px 15px',
              width: '160px'
            }}
          >
            <Flex gap={2} align="center">
              <img src={PlusIcon} alt="Add" style={{ width: '18px' }} />
              <Text style={{ color: 'white', fontWeight: '600' }}>Add Patient</Text>
            </Flex>
          </Button>

          <Button
            variant="solid"
            size="lg"
            onClick={handleExportAll}
            style={{
              backgroundColor: '#4164df',
              borderRadius: '10px',
              fontFamily: 'Sora, sans-serif',
              fontSize: '16px',
              fontWeight: '600',
              padding: '9px 15px',
              width: '152px'
            }}
          >
            Export all
          </Button>
        </Flex>
      </Flex>

      {/* Table Section */}
      <VStack spacing={0} align="stretch" className="w-full">
        {/* Table Header */}
        <Flex
          justify="between"
          align="center"
          className="px-5 py-4 bg-primary-dark border-xl fonr-Sora font-bold text-white"
          style={{
            backgroundColor: '#5886a5',
            borderRadius: '5px',
            fontFamily: 'Sora, sans-serif',
            fontSize: '16px',
            fontWeight: '600',
            color: 'white',

          }}
        >
          <Text className="min-w-[111px] text-white font-bold">Profile</Text>
          <Text className="min-w-[107px] text-white font-bold">Name</Text>
          <Text className="min-w-[125px] text-white font-bold">Number</Text>
          <Text className="min-w-[202px] text-white font-bold">Registration Date</Text>
          <Text className="min-w-[129px] text-white font-bold">Program</Text>
          <Text className="min-w-[170px] text-white font-bold">Medical team</Text>
          <Text className="min-w-[157px] text-white font-bold">Assigned to</Text>
          <Text className="min-w-[90px] text-white font-bold">Actions</Text>
        </Flex>

        {/* Rows */}
        {filteredPatients.length === 0 ? (
          <Box className="p-12 text-center">
            <Text color="gray" size="lg">No patients found</Text>
          </Box>
        ) : (
          filteredPatients.map((patient, index) => (
            <Flex
              key={patient.id || index}
              justify="space-between"
              align="start"
              className="px-5 py-4"
              style={{
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onClick={() => handlePatientClick(patient)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Box style={{ minWidth: '111px' }} align="center">
                <VStack spacing={2}>
                  <img
                    src={getProfileImageUrl(patient.profile_photo)}
                    alt="Profile"
                    style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                </VStack>
              </Box>

              <Box style={{ minWidth: '107px', paddingTop: '10px' }}>
                <Text style={{ color: '#989898', fontSize: '16px' }}>{patient.name || '-'}</Text>

                <Text className={`${getConditionStyles(patient.condition)} px-2 text-capitalize font-size-11 w-fit mt-4  rounded-full `} >
                  {patient.condition || '-'}
                </Text>
              </Box>

              <Box style={{ minWidth: '125px', paddingTop: '10px' }}>
                <Text style={{ color: '#989898', fontSize: '16px' }}>{patient.number || '-'}</Text>
              </Box>

              <Box style={{ minWidth: '202px', paddingTop: '10px' }}>
                <Text style={{ color: '#989898', fontSize: '16px' }}>{formatDateString(patient.registered_date)}</Text>
              </Box>

              <Box style={{ minWidth: '129px', paddingTop: '10px' }}>
                <Text style={{ color: '#989898', fontSize: '16px' }}>{patient.program || '-'}</Text>
              </Box>

              <Box style={{ minWidth: '170px', paddingTop: '10px' }}>
                {medicalTeamNames[patient.id] ? (
                  medicalTeamNames[patient.id].split(',').map((name, i) => (
                    <Text key={i} style={{ color: '#989898', fontSize: '16px', display: 'block' }}>{name.trim()}</Text>
                  ))
                ) : <Text style={{ color: '#989898', fontSize: '16px' }}>-</Text>}
              </Box>

              <Box style={{ minWidth: '157px', paddingTop: '10px' }}>
                {adminNames[patient.id] ? (
                  adminNames[patient.id].split(',').map((name, i) => (
                    <Text key={i} style={{ color: '#989898', fontSize: '16px', display: 'block' }}>{name.trim()}</Text>
                  ))
                ) : <Text style={{ color: '#989898', fontSize: '16px' }}>-</Text>}
              </Box>

              <Flex gap={3} style={{ minWidth: '90px', paddingTop: '5px' }}>
                <IconButton
                  aria-label="Download"
                  icon={<img src={DownloadIcon} style={{ width: '28px' }} />}
                  variant="ghost"
                  onClick={(e) => { e.stopPropagation(); handleDownload(patient.id); }}
                />
                <IconButton
                  aria-label="Delete"
                  icon={<img src={TrashIcon} style={{ width: '24px' }} />}
                  variant="ghost"
                  onClick={(e) => { e.stopPropagation(); handleDelete(patient.id); }}
                />
              </Flex>
            </Flex>
          ))
        )}
      </VStack>
    </VStack>
  );
};

export default PatientList;


