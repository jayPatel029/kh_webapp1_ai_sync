import React from "react";
// import "./patient.scss";
import PatientList from "./PatientDetails/PatientList";
import { useState, useEffect } from "react";
import { server_url } from "../../constants/constants";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { useParams } from "react-router-dom";
import DelPatientList from "./PatientDetails/DeletePatientList";
import { da } from "date-fns/locale";

function DelPatient() {
  const [patientData, setPatientData] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const {id} = useParams();

  useEffect(() => {
    axiosInstance
      .get(`${server_url}/patient/getDeletdPatients`)
      .then((response) => {
        const data = response.data.data.filter((patient) => !patient.name);
        setPatientData(data);
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
      <DelPatientList
        data={patientData}
        patientId={id}
      />
    </div>
  );
}

export default DelPatient;
