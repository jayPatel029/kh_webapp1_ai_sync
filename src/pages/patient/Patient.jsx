/**
 * Patient Page Component
 * Main container for patient management interface
 * Refactored to use component library and design system
 * 
 * @file src/pages/patient/Patient.jsx
 */

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
     
      <PatientList data={patientData} patientId={id} />
     
  );
}

export default Patient;
