import React from "react";
import "./adminDashboard.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useState, useEffect } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import {
  getTotalUsers,
  getUsersThisWeek,
  getAlerts,
  getDoctorAlerts,
  getUsersThisWeekSub,
} from "../../ApiCalls/adminDashApis";
import AdminContainer from "./AdminContainer";
import DoctorContainer from "./DoctorContainer";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  // Separate doctor alerts and patient alerts
  const [patientAlertsData, setPatientAlertsData] = useState([]);
  // Placeholder data for new users and total users
  const [newUsers, setNewUsers] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [NewUsersSub, setNewUsersSub] = useState(0);
  const [isDoctor, setIsDoctor] = useState(false);
  const [allAlerts, setAllAlerts] = useState([]);
  const [doctorAlerts, setDoctorAlerts] = useState([]);
  const [patientAlerts, setPatientAlerts] = useState([]);

  const navigate = useNavigate();

  // Redirect to login page if token is not present or expired
  useEffect(() => {
    getAdminid();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
    const role = localStorage.getItem("role");
    // console.log("object");
    if (role == "Dialysis Technician") {
      navigate("/patient");
    }
  }, []);

  const getAdminid = async () => {
    const email = localStorage.getItem("email");
    const id = await axiosInstance.post(`${server_url}/users/byEmail/id`, {
      email: email,
    });
    localStorage.setItem("id", id.data.id);
  };
  useEffect(() => {
    // setTimeout(() => {
    //   window.location.reload();
    // }, 300000);
    const getTotalUsersData = async () => {
      var total = await getTotalUsers();
      if (!total) total = 0;
      setTotalUsers(total);
    };

    const getNewUsersData = async () => {
      var newU = await getUsersThisWeek();
      if (!newU) newU = 0;
      setNewUsers(newU);
    };

    const isDoctorfunc = async () => {
      try {
        const response = await axiosInstance.get(
          `${server_url}/roles/isDoctor`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setIsDoctor(response.data.data);
        localStorage.setItem("isDoctor", response.data.data);
      } catch (error) {
        console.log("Error fetching Doctor: ", error);
      }
    };

    const getPatientAlertsData = async () => {
      try {
        const response = await axiosInstance.get(
          `${server_url}/alerts/byType/patient`
        );
        setPatientAlertsData(response.data);
        console.log("Patient Alerts: ", response.data);
      } catch (error) {
        console.log(error);
      }
    };

    const getDoctorAlertsData = async () => {
      try {
        const response = await axiosInstance.get(
          `${server_url}/alerts/byType/doctor`
        );
        setDoctorAlerts(response.data);
        console.log("Doctor Alerts: ", response.data);
      } catch (error) {
        console.log(error);
      }
    };

    const getAllAlerts = async () => {
      if (isDoctor) {
        return;
      } else {
        try {
          getAlerts()
            .then((response) => {
              // console.log("Doctor Alerts: ", response.data);
              setAllAlerts(response.data);
              setPatientAlerts(
                response.data
                  .filter(
                    (alert) =>
                      alert.type0 === "patient" || alert.type === "patient"
                  )
                  .reverse()
              );
            })
            .catch((error) => {
              console.log("Error fetching alerts: ", error);
            });
        } catch (error) {
          console.log(error);
        }
      }
    };
    const getNewUsersDataSub = async () => {
      var newU = await getUsersThisWeekSub();
      console.log("New Users Sub: ", newU);
      if (!newU) newU = 0;
      setNewUsersSub(newU);
    };
    const getAllData = async () => {
      await getTotalUsersData();
      await getNewUsersData();
      await isDoctorfunc();
      await getPatientAlertsData();
      await getAllAlerts();
      await getDoctorAlertsData();
      await getNewUsersDataSub();
    };
    getAllData();
    // const interval = setInterval(() => {
    //   getAllData();
    // }, 300000);
    // return () => clearInterval(interval);

    // call getallData() every 5 minutes

    const interval = setInterval(() => {
      getAllData();
    }, 300000);

    return () => clearInterval(interval);
  }, [totalUsers, isDoctor]);

  // useEffect(() => {
  //   console.log("Updated patientAlertsData: ", patientAlertsData);
  // }, [patientAlertsData]);

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

        {isDoctor ? (
          <DoctorContainer />
        ) : localStorage.getItem("id") == 1 ? (
          <AdminContainer
            newUsers={newUsers}
            totalUsers={totalUsers}
            doctorAlerts={doctorAlerts}
            patientAlerts={patientAlertsData}
          />
        ) : (
          <AdminContainer
            newUsers={NewUsersSub}
            totalUsers={totalUsers}
            doctorAlerts={doctorAlerts}
            patientAlerts={patientAlerts}
          />
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
