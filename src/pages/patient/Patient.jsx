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
import { usePageCache, PAGE_CACHE } from "../../cache";

function Patient() {
  const [patientData, setPatientData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { id } = useParams();
  const { fetchWithCache, mutate } = usePageCache(PAGE_CACHE.PATIENTS);

  const fetchPatients = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const result = await fetchWithCache(
        'getPatients',
        () => getPatients(),
        {
          forceRefresh,
          transform: (apiData) => (apiData?.data || []).filter((patient) => patient.name),
        }
      );
      if (result.success) {
        setPatientData(result.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  console.log(patientData);

  const closeAddModal = () => setShowAddModal(false);
  const handleAddSuccess = () => {
    closeAddModal();
    fetchPatients(true); // Force refresh after adding a patient
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
