import React, { useState, useEffect } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import PageHeader from "../../components/PageHeader";
import ThemeProvider from "../../components/ThemeProvider";
import dummyadmin from "../../assets/dummyadmin.png";
import { server_url } from "../../constants/constants";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Component Library
import { Box, Container } from "../../component-library";

function UserProgramSelection() {
  const recordsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [records, setRecords] = useState([]);
  const [request, setrequest] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
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
      setTotalPages(Math.ceil(response.data.data.length / recordsPerPage));
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const paginatedRecords = records.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

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
 
  function handleFilter(event) {
    const newData = records.filter((row) => {
      return row.name.toLowerCase().includes(event.target.value.toLowerCase());
    });
    setRecords(newData);
    setCurrentPage(1);
  }

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleAccept= async(program,patientId)=>{
    const response = await axiosInstance.put(`${server_url}/patient/updateProgram`,{
      id:patientId,
      program_id:program
    })
  }
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
      // location.reload();
      window.location.reload();
      // Handle success response if needed
    } catch (error) {
      console.error("Error updating patient program:", error);
      // Handle error
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const dateObject = new Date(dateString);
    const day = String(dateObject.getDate()).padStart(2, "0");
    const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = dateObject.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">

        {/* Sticky Header Section */}
        <Box className="sticky top-[56px] z-20 bg-white border-b border-gray-200">
          <Container className="py-4 px-4 md:px-6 mx-0">
            <PageHeader
              title="User Program Selection"
              breadcrumbs={[
                { label: "Dashboard", path: "/" },
                { label: "User Program Selection", active: true }
              ]}
            />
          </Container>
        </Box>

         
          {/* User Program Selection Card */}
          <div className="admin-card">
            <div className="admin-card__body">
              <div className="admin-toolbar">
                <div className="admin-toolbar__left">
                  <div className="admin-search">
                    <svg className="admin-search__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search by name..."
                      className="admin-search__input"
                      onChange={handleFilter}
                    />
                  </div>
                </div>
                <div className="admin-toolbar__right">
                  <span className="admin-toolbar__count">
                    {records.length} Records Found
                  </span>
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Profile Photo</th>
                      <th>Name</th>
                      <th>Number</th>
                      <th>Registration Date</th>
                      <th>Request For</th>
                      <th>Program</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length > 0 ? (
                      paginatedRecords.map((record) => (
                        <tr key={record.id}>
                          <td>
                            <div className="flex justify-center items-center">
                              <img
                                src={dummyadmin}
                                alt={record.name}
                                className="rounded-full w-12 h-12"
                              />
                            </div>
                          </td>
                          <td>{record.name}</td>
                          <td>{record.number}</td>
                          <td>{formatDate(record.registered_date)}</td>
                          <td>
                            {request?.filter(alert => alert.patientId === record.id).map(alert => (
                              <div key={alert.id} style={{ marginBottom: '0.5rem' }}>
                                <p style={{ fontWeight: 600, color: '#1A9A9A' }}>{alert.programName}</p>
                                <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Date: {new Date(alert.date).toLocaleDateString()}</p>
                                <button
                                  className="admin-btn admin-btn--teal"
                                  style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', marginTop: '0.25rem' }}
                                  onClick={() => handleSubmit(alert.programName, record.id)}
                                >
                                  Accept
                                </button>
                              </div>
                            ))}
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <button
                                className={`admin-btn ${record.program === "Basic" ? "admin-btn--teal" : "admin-btn--outline"}`}
                                style={{ minWidth: '100px' }}
                                onClick={() => handleSubmit("Basic", record.id)}
                              >
                                Basic
                              </button>
                              <button
                                className={`admin-btn ${record.program === "Standard" ? "admin-btn--teal" : "admin-btn--outline"}`}
                                style={{ minWidth: '100px' }}
                                onClick={() => handleSubmit("Standard", record.id)}
                              >
                                Standard
                              </button>
                              <button
                                className={`admin-btn ${record.program === "Advanced" ? "admin-btn--teal" : "admin-btn--outline"}`}
                                style={{ minWidth: '100px' }}
                                onClick={() => handleSubmit("Advanced", record.id)}
                              >
                                Advanced
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
                          No records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {records.length > recordsPerPage && (
                <div className="admin-pagination">
                  <button
                    className="admin-pagination__btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ←
                  </button>
                  <span className="admin-pagination__info">Page {currentPage} of {totalPages}</span>
                  <button
                    className="admin-pagination__btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          </div>
      </Box>
    </ThemeProvider>
  );
}


export default UserProgramSelection;
