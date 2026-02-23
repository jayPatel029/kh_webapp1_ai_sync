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
import { getPatients } from "../../ApiCalls/patientAPis";
import { Flex, Box, Container } from "../../component-library/layout/Layout";

function Patient() {
  const [patientData, setPatientData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    getPatients()
      .then((response) => {
        if (response.success) {
          const data = (response.data?.data || []).filter((patient) => patient.name);
          setPatientData(data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  console.log(patientData);

  return (
     
    <PatientList data={patientData} patientId={id} className="!p-0 !md:-p-0" />
     
  );
}

export default Patient;
