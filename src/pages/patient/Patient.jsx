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
import AddPatientForm from "./AddPatientForm";
import { getPatients } from "../../ApiCalls/patientAPis";

function Patient() {
  const [patientData, setPatientData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { id } = useParams();

  const fetchPatients = () => {
    setLoading(true);
    getPatients()
      .then((response) => {
        if (response.success) {
          const data = (response.data?.data || []).filter((patient) => patient.name);
          setPatientData(data);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  console.log(patientData);

  const closeAddModal = () => setShowAddModal(false);
  const handleAddSuccess = () => {
    closeAddModal();
    fetchPatients();
  };

  return (
    <>
      <PatientList
        data={patientData}
        patientId={id}
        className="!p-0 !md:-p-0"
        onAddClick={() => setShowAddModal(true)}
      />

      {showAddModal && (
        <AddPatientForm
          isOpen={showAddModal}
          onSuccess={handleAddSuccess}
          onCancel={closeAddModal}
        />
      )}
    </>
  );
}

export default Patient;
