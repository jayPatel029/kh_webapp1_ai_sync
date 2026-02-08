/**
 * Patient Page Component
 * Main container for patient management interface
 * Refactored to use component library and design system
 * 
 * @file src/pages/patient/Patient.jsx
 */

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import PatientList from "./PatientDetails/PatientList";
import { server_url } from "../../constants/constants";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { Flex, Box, Container } from "../../component-library/layout/Layout";

function Patient() {
  const [patientData, setPatientData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    axiosInstance
      .get(`${server_url}/patient/getPatients`)
      .then((response) => {
        const data = response.data.data.filter((patient) => patient.name);
        setPatientData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  console.log(patientData);

  return (
    <Flex className="w-full h-screen">
      {/* Sidebar */}
      <Box
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto'
        }}
      >
        <Sidebar />
      </Box>

      {/* Main Content */}
      <Flex
        direction="column"
        className="flex-1"
        style={{
          minWidth: 0,
          overflowX: 'hidden'
        }}
      >
        {/* Navbar */}
        <Box
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}
        >
          <Navbar />
        </Box>

        {/* Patient List Content */}
        <Container
          style={{
            flex: 1,
            backgroundColor: 'white',
            padding: '50px',
            overflowY: 'auto'
          }}
        >
          <PatientList data={patientData} patientId={id} />
        </Container>
      </Flex>
    </Flex>
  );
}

export default Patient;
