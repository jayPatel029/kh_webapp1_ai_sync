import React from "react";
// import "./patient.scss";

import DeletePatientList from "./PatientDetails/DeletePatientList"
import { useState, useEffect } from "react";
import { server_url } from "../../constants/constants";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { useParams } from "react-router-dom";

function DeletePatient() {
  const [patientData, setPatientData] = useState([]);
  const [loading, setLoading] = useState(true);
  const {id} = useParams();

  useEffect(() => {
    axiosInstance
      .get(`${server_url}/patient/getPatients`)
      .then((response) => {
        setPatientData(response.data.data);
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
