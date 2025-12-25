import React from "react";
import "./patient.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
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
    <div className="md:flex block">
      {/* Sidebar */}
      <div className="md:flex-1 hidden md:flex sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="md:flex-[5] block w-screen">
        <div className="sticky top-0 z-10">
          <Navbar />
        </div>
        <div className="container flex justify-center overflow-x-hidden bg-blue-100">
          <DelPatientList
              data={patientData}
              patientId={id}
            />
          </div>
        
      </div>
    </div>

  )
}



export default DelPatient;
