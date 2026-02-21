import React, { useState, useEffect, useMemo } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import PageHeader from "../../components/PageHeader";
import ThemeProvider from "../../components/ThemeProvider";
import dummyadmin from "../../assets/dummyadmin.png";
import { server_url } from "../../constants/constants";
import { Navigate, useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes/routeConstants";
import { useSelector } from "react-redux";
import { UnifiedListTable, SearchBar } from "../../components";

// Component Library
import { Box, Container } from "../../component-library";

function UserProgramSelection() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [request, setrequest] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const role = useSelector((state) => state.permission);

  useEffect(() => {
    // Fetch patients data when component mounts
    getPatients();
  }, []);
  console.log(records);

  const getPatients = async () => {
    try {
      const response = await axiosInstance.get(
        `${server_url}/patient/getPatients`
      );
      setRecords(response.data.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  useEffect(()=>{
    const getProgramChangeAlert = async ()=>{
      try {
        const response= await axiosInstance.get(`${server_url}/alerts/byCategory`);
        console.log("Program",response);
        setrequest(response.data)
      }
      catch(error){
  console.log(error)
      }
    }
    getProgramChangeAlert();
  },[])

  const handleSubmit = async (program, patientId) => {
    try {
      if(!role?.canEditUserProgramSelection) {
        alert("You are not authorized to perform this action");
        return;
      }
      const response = await axiosInstance.put(
        `${server_url}/patient/updateProgram`,
        {
          id: patientId,
          program_id: program,
        }
      );

      // Update the records state with the updated program for the specific patient
      setRecords(
        records.map((record) =>
          record.id === patientId ? { ...record, program } : record
        )
      );

      console.log("Selected Program:", program);
      window.location.reload();
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            className={`admin-btn ${item.program === "Basic" ? "admin-btn--teal" : "admin-btn--outline"}`}
            style={{ minWidth: '100px' }}
            onClick={() => handleSubmit("Basic", item.id)}
          >
            Basic
          </button>
          <button
            className={`admin-btn ${item.program === "Standard" ? "admin-btn--teal" : "admin-btn--outline"}`}
            style={{ minWidth: '100px' }}
            onClick={() => handleSubmit("Standard", item.id)}
          >
            Standard
          </button>
          <button
            className={`admin-btn ${item.program === "Advanced" ? "admin-btn--teal" : "admin-btn--outline"}`}
            style={{ minWidth: '100px' }}
            onClick={() => handleSubmit("Advanced", item.id)}
          >
            Advanced
          </button>
        </div>
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
              enablePagination={true}
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
