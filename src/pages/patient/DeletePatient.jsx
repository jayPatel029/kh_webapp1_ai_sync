import React from "react";
// import "./patient.scss";

import DeletePatientList from "./PatientDetails/DeletePatientList"
import { useState, useEffect } from "react";
import { getPatients } from "../../ApiCalls/patientAPis";
import { useParams } from "react-router-dom";

function DeletePatient() {
  const [patientData, setPatientData] = useState([]);
  const [loading, setLoading] = useState(true);
  const {id} = useParams();

  useEffect(() => {
    getPatients()
      .then((response) => {
        if (response.success) {
          setPatientData(response.data?.data || []);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);
console.log(patientData)
  return (
    <div className="container flex justify-center overflow-x-hidden bg-blue-100">
      <DeletePatientList
        data={patientData}
        patientId={id}
      />
    </div>
  );
}


export default DeletePatient;
