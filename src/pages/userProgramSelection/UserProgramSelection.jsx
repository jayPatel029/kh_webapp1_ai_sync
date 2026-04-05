import React, { useState, useEffect, useMemo } from "react";
import { getPatients, updateProgram } from "../../ApiCalls/patientAPis";
import { getAlertByCategory } from "../../ApiCalls/alertsApis";
import PageHeader from "../../components/PageHeader";
import ThemeProvider from "../../components/ThemeProvider";
import dummyadmin from "../../assets/dummyadmin.png";
import { Navigate, useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes/routeConstants";
import { useSelector } from "react-redux";
import { UnifiedListTable, SearchBar } from "../../components";

// Component Library
import { Box, Container } from "../../component-library";
import { usePageCache, PAGE_CACHE } from "../../cache";
import RefreshButton from "../../components/RefreshButton/RefreshButton";

function UserProgramSelection() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [request, setrequest] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const role = useSelector((state) => state.permission);
  const { fetchWithCache, mutate, refreshKey } = usePageCache(PAGE_CACHE.USER_PROGRAM);

  useEffect(() => {
    // Fetch patients data when component mounts
    getPatientsList();
  }, [refreshKey]);
  console.log(records);

  const getPatientsList = async () => {
    try {
      const response = await fetchWithCache('patients', () => getPatients());
      if (response.success) {
        setRecords(response?.data?.data || []);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  useEffect(()=>{
    const getProgramChangeAlert = async ()=>{
      try {
        const response = await fetchWithCache('programAlerts', () => getAlertByCategory());
        console.log("Program",response);
        setrequest(response)
      }
      catch(error){
  console.log(error)
      }
    }
    getProgramChangeAlert();
  },[refreshKey])

  const handleSubmit = async (program, patientId) => {
    try {
      if(!role?.canEditUserProgramSelection) {
        alert("You are not authorized to perform this action");
        return;
      }
      await mutate(() => updateProgram({
        id: patientId,
        program_id: program,
      }));

      // Update the records state with the updated program for the specific patient
      setRecords(
        records.map((record) =>
          record.id === patientId ? { ...record, program } : record
        )
      );

      console.log("Selected Program:", program);
    } catch (error) {
      console.error("Error updating patient program:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const dateObject = new Date(dateString);
    const day = String(dateObject.getDate()).padStart(2, "0");
    const month = String(dateObject.getMonth() + 1).padStart(2, "0");
    const year = dateObject.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const columns = useMemo(() => [
    { key: 'photo', label: 'Profile Photo', type: 'image', width: '80px' },
    { key: 'name', label: 'Name', type: 'text', width: '150px' },
    { key: 'number', label: 'Number', type: 'text', width: '120px' },
    { 
      key: 'registered_date', 
      label: 'Registration Date', 
      type: 'custom',
      renderCell: (item) => formatDate(item.registered_date),
      width: '130px'
    },
    {
      key: 'requestFor',
      label: 'Request For',
      type: 'custom',
      renderCell: (item) => (
        <div>
          {request?.filter(alert => alert.patientId === item.id).map(alert => (
            <div key={alert.id} style={{ marginBottom: '0.5rem' }}>
              <p style={{ fontWeight: 600, color: '#1A9A9A' }}>{alert.programName}</p>
              <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Date: {new Date(alert.date).toLocaleDateString()}</p>
              <button
                className="admin-btn admin-btn--teal"
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', marginTop: '0.25rem' }}
                onClick={() => handleSubmit(alert.programName, item.id)}
              >
                Accept
              </button>
            </div>
          ))}
        </div>
      ),
      width: '200px'
    },
    {
      key: 'program',
      label: 'Program',
      type: 'custom',
      renderCell: (item) => (
        <select
          value={item.program || ''}
          onChange={(e) => handleSubmit(e.target.value, item.id)}
          style={{
            padding: '0.5rem',
            borderRadius: '0.375rem',
            border: '1px solid #D1D5DB',
            backgroundColor: '#FFFFFF',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#1A9A9A',
            minWidth: '120px'
          }}
        >
          <option value="Basic">Basic</option>
          <option value="Standard">Standard</option>
          <option value="Advanced">Advanced</option>
        </select>
      ),
      width: '150px'
    }
  ], [request, handleSubmit]);

  const formattedData = records.map(record => ({
    ...record,
    photo: dummyadmin,
  }));

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">

        {/* Sticky Header Section */}
        <Box className="sticky top-[56px] z-20 bg-white">
           
            <PageHeader
              title="User Program Selection"
              breadcrumbs={[
                { label: "Dashboard", path: "/" },
                { label: "User Program Selection", active: true }
              ]}
              onBack={() => navigate(ROUTES.HOME)}
              rightAction={<RefreshButton pageName={PAGE_CACHE.USER_PROGRAM.name} />}
            />
           
        </Box>

         
        {/* User Program Selection Table */}
        <div className="admin-card">
          <div className="admin-card__header">
            <div className="admin-toolbar">
              <div className="admin-toolbar__left">
                <SearchBar
                  placeholder="Search by name..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: "250px" }}
                />
              </div>
              <div className="admin-toolbar__right">
                <span className="admin-toolbar__count">
                  {formattedData.filter(record => 
                    record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    record.number.toLowerCase().includes(searchTerm.toLowerCase())
                  ).length} Records Found
                </span>
              </div>
            </div>
          </div>
          <div className="admin-card__body">
            <UnifiedListTable
              columns={columns}
              data={formattedData.filter(record => 
                record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.number.toLowerCase().includes(searchTerm.toLowerCase())
              )}
              enableSearch={true}
              renderSearchUI={false}
              searchKeys={['name', 'number']}
              rowsPerPage={5}
              loadingMessage="Loading patient records..."
              emptyMessage="No patient records found."
            />
          </div>
        </div>
      </Box>
    </ThemeProvider>
  );
}


export default UserProgramSelection;
