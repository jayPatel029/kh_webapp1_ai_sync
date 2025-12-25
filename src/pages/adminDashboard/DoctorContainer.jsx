import React, { useEffect, useState } from "react";
import { admindashblue, admindashred, dummyadmin } from "../../assets";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { getDoctorAlerts } from "../../ApiCalls/adminDashApis";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import PrescriptionModal from "./ApprovePrescriptionModal";
import AlertModal from "./AlertModal";

import { getDoctorComments } from "../../ApiCalls/GetComments";
import CommentConatainer from "./CommentConatainer";
import { set } from "date-fns";
import { tr } from "date-fns/locale";
import { se } from "date-fns/locale";
import { FaS } from "react-icons/fa6";
import axios from "axios";
import DiaAlertModal from "./DialysisTechModal";

const UserCard = ({ title, Alerts }) => {
  const [modal, setModal] = React.useState(false);
  const [showModalPrescription, setShowModalPrescription] =
    React.useState(false);
  const [prescriptionCount, setPrescriptionCount] = React.useState(10);
  // set the number of alerts ranging from 0 to 5
  const [alertsCount, setAlertsCount] = React.useState();
  const [commentsCount, setCommentsCount] = React.useState(0);
  const [prescriptionAlerts, setPrescriptionAlerts] = React.useState([]);
  const [prescriptionAlarm, setPrescriptionAlarm] = React.useState([]);
  const [Dialysis_updates,setDialysis_updates] = React.useState([]);
  const [alertAlerts, setAlertAlerts] = React.useState([]);
  const [showAlertModal, setShowAlertModal] = React.useState(false);
  const [showDialysisModal, setDialysisModal] = React.useState(false);
  const [patientComments, setPatientComments] = React.useState([]);
  const [commentsModal, setCommentsModal] = React.useState(false);
  const [comments, setComments] = React.useState([]);
  const [userid, setUserId] = React.useState();
  const navigate = useNavigate();
  const [diaUpdates,setdiaUpdates]=useState(false)
  const [DailyAlerts,setDailyAlerts]=useState(false)
  const getDialysisUpdate = async()=>{
    try {
      const token = localStorage.getItem("token"); // Fetch token from local storage
      const response = await axiosInstance.get(
        server_url + "/patientdata/canReceive",
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send token in headers
          },
        }
      );
      console.log("response from canExportPatient : ", response);
      if (response.status === 403) {
        return { success: false };
      } else if (response.status === 200) {
        setdiaUpdates(true)
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (error) {
      return { success: false, data: error.response.data.message };
    }


  }
  const getDailyAlerts = async () => {
    try {
      const token = localStorage.getItem("token"); // Fetch token from local storage
      const response = await axiosInstance.get(
        server_url + "/alerts/dailyAlerts",
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send token in headers
          },
        }
      );
      console.log("response from daily alerts : ", response);
      if (response.status === 403) {
        return { success: false };
      } else if (response.status === 200) {
        setDailyAlerts(true)
        
      } else {
        return { success: false };
      }
    } catch (error) {
      return { success: false, data: error.response.data.message };
    }
  };
  const openCommentsModal = (comments) => {
    setComments(comments);
    setCommentsModal(true);
  };

  const closeCommentsModal = async (comments) => {
    const email = localStorage.getItem("email");
  

    try {
      var unreadComments = comments.filter(
        (comment) => comment?.isRead === false
      );
      var commentIds = unreadComments.map((comment) => comment.id);

      const data = {
        email: email,
        commentIds: commentIds,
      };
      
      await axiosInstance.post(`${server_url}/comments/updateReadTable`, data);
    } catch (error) {
      console.error("Error updating read table:", error);
    }

    setCommentsModal(false);
    setCommentsCount(0);
  };

  const openModalPrescription = () => {
    localStorage.setItem(
      "prescriptionAlerts",
      JSON.stringify(prescriptionAlerts)
    );
    setShowModalPrescription(true);
  };

  const openAlertModal = () => {
    localStorage.setItem("alertAlerts", JSON.stringify(alertAlerts));
    setShowAlertModal(true);
  };
  const openDiaModal = () => {
    localStorage.setItem("Dialysis_updates", JSON.stringify(Dialysis_updates));
    setDialysisModal(true);
  };

  const closeModalPrescription = () => {
    setShowModalPrescription(false);
  };

  const closeAlertModal = () => {
    setShowAlertModal(false);
    setAlertsCount(0);
  };
  const closeDiaModal = () => {
    setDialysisModal(false);
  };
  useState(() => {
    getDialysisUpdate();

    
    
    var pAlerts = Alerts.filter((alert) => alert.name === title);
    var presAlerts = pAlerts.filter(
      (alert) => alert.type === `New Prescription Alarm for ${title}` 
    );
    var notApprovedPrescriptions = presAlerts.filter(
      (alert)=>alert.type ===`Doctor Please Check Digital Prescription its been more than 3 days for ${title}`);
    var diaAlerts = pAlerts.filter(
      (alert) => alert.type.includes("Dialysis Tech")
    );
    setPrescriptionAlarm(notApprovedPrescriptions);
    
    setDialysis_updates(diaAlerts)
    setPrescriptionCount(presAlerts.length);
    setPrescriptionAlerts(presAlerts);
    var alerts = pAlerts.filter(
      (alert) => alert.type !== `New Prescription Alarm for ${title} `
    );
    var alerts= alerts.filter(
      (alert) => !alert.type.includes("Dialysis Tech")

    )
    var calerts = alerts.filter((alert) => alert.isRead === 0) || [];
   
    var sortedByDateAlerts = [];
    console.log("thi",alerts)
    sortedByDateAlerts = alerts.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    sortedByDateAlerts = sortedByDateAlerts.slice(0, 50);
    // const randomAlertsCount = Math.floor(Math.random() * 5);
    setAlertsCount(calerts.length);
    setAlertAlerts(sortedByDateAlerts);
    getDoctorComments(localStorage.getItem("email"), title)
      .then((data) => {
        
        var commentsCount = 0;
        for (var i = 0; i < data.comments.length; i++) {
          if(data.comments[i].fileType === "Lab"){
            data.comments[i].fileType = "Lab Report";
          }
          if (data.comments[i].isRead === false) {
            commentsCount++;
          }
        }
        // const randomCommentsCount = Math.floor(Math.random() * 2);
        var comms = data.comments;
        var sortedByDate = comms.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        sortedByDate = sortedByDate.slice(0, 50);
        setCommentsCount(commentsCount);
        setPatientComments(sortedByDate);
      })
      .catch((err) => {
        console.log("Error fetching comments:", err);
      });
  }, []);
  var subtext = "";
  // get all alerts for this patient
  var patientAlerts = Alerts.filter((alert) => alert.name === title);
  // get the most recent alert according to date
  var recentAlert = patientAlerts.reduce((prev, current) =>
    prev.Date > current.Date ? prev : current
  );
  // get the type of the most recent alert
  subtext = recentAlert.type;
  
  function getValidImageUrl(url) {
    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    const isValidUrl = urlRegex.test(url);
    const profilePhotoUrl = isValidUrl ? url : dummyadmin;
    return profilePhotoUrl;
  }
 
  const viewProfile = async () => {
    try {
      const patientId = patientAlerts[0].patientId;
      navigate(`/userProfile/${patientId}`, {});
    } catch (error) {}
  };
  return (
    <>
      <div className="w-full bg-white p-4 m-2 border rounded shadow flex  sm:flex-row items-center">
        {/* User Card Left Content */}
        <div className="flex items-center mb-2 sm:mb-0">
          <img
            src={getValidImageUrl(patientAlerts[0]?.patientProfilePhoto)}
            alt="profile photo"
            className="mr-4 h-12 w-12 rounded-full cursor-pointer"
            onClick={viewProfile}
          />
          <div>
            <p className="font-semibold">{title}</p>
            <p style={{ color: "red" }}></p>
          </div>
        </div>

        {/* User Card Right Content */}
        <div className="ml-2 flex items-center">
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-center mt-2 sm:mt-0">
            {" "}
            {/* This is the new container */}
            {prescriptionCount > 0 && (
              <div className="mb-2 sm:mb-0">
                {" "}
                {/* Wrapping each button in a div */}
                <button
                  className="bg-primary mr-2 hover:bg-[#317581] text-white p-2 rounded transition duration-300 ease-in-out transform hover:scale-105"
                  onClick={() => openModalPrescription()}>
                  {prescriptionCount} Approve Prescription
                </button>
              </div>
            )}
            {diaUpdates && (<>
              {Dialysis_updates.length > 0 && (
              <div className="mb-2 sm:mb-0">
                {" "}
                {/* Wrapping each button in a div */}
                <button
                className="bg-violet-900 mr-2 hover:bg-violet-700 text-white p-2 rounded transition duration-300 ease-in-out transform hover:scale-105"
                  onClick={()=>openDiaModal()}>
                  {Dialysis_updates.length} Dialysis Tech Alerts
                </button>
              </div>
            )

            }
            </>)}
            {alertAlerts.length > 0 && (
              <div className="mb-2 sm:mb-0 mr-2">
                {" "}
                {/* Wrapping each button in a div */}
                <button
                  className="text-white p-2 rounded transition duration-300 ease-in-out transform hover:scale-105"
                  onClick={() => openAlertModal()}
                  style={{ backgroundColor: alertsCount > 0 ? "red" : "gray" }}>
                  {alertsCount} Alerts
                </button>
              </div>
            )}
            {patientComments.length > 0 && (
              <div className="mb-2 sm:mb-0 justify-start sm:ml-0">
                {" "}
                {/* Wrapping each button in a div */}
                <button
                  className={`text-white p-2 rounded transition duration-300 ease-in-out transform hover:scale-105 ${
                    commentsCount > 0
                      ? "bg-yellow-600 hover:bg-yellow-800"
                      : "bg-gray-500"
                  }`}
                  onClick={() => openCommentsModal()}>
                  {commentsCount} comments
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModalPrescription && (
        <PrescriptionModal closeModal={closeModalPrescription} />
      )}
      {commentsModal && (
        <CommentConatainer
          comments={patientComments}
          closeModal={() => {
            closeCommentsModal(patientComments);
          }}
        />
      )}
      {showAlertModal && <AlertModal closeModal={closeAlertModal} />}
      {showDialysisModal && <DiaAlertModal closeModal={closeDiaModal}/>}
    </>
  );
};

const DoctorContainer = () => {
  const [Alerts, setAlerts] = React.useState([]);
  const [groupedAlerts, setGroupedAlerts] = useState({});
  const [DailyAlerts, setDailyAlerts] = useState(0);

  const getDailyAlerts = async () => {
    try {
      console.log("in daily alerts");
      const token = localStorage.getItem("token"); // Fetch token from local storage
      console.log("the server url:", server_url);
      const response = await axiosInstance.get(
        `${server_url}/alerts/dailyAlerts`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send token in headers
          },
        }
      );
      console.log("response from daily alerts : ", response);

      if (response.status === 403) {
        return 0; // No daily alerts
      } else if (response.status === 200) {
        return 1; // Daily alerts exist
      } else {
        return 0; // Default to 0 on unexpected response
      }
    } catch (error) {
      console.log("error in daily alerts", error);
      return 0; // Default to 0 on error
    }
  };

  useEffect(() => {
    const fetchAlerts = async () => {
      const dailyAlertsStatus = await getDailyAlerts();
      setDailyAlerts(dailyAlertsStatus); // Update the state here

      try {
        const res1 = await axiosInstance.post(`${server_url}/doctor/byEmail/id`, {
          email: localStorage.getItem("email"),
        });
        
        localStorage.setItem("id", res1.data.data);
        const res = await axiosInstance.get(
          `${server_url}/sortAlerts/doctor/${res1.data.data}`
        );
        console.log("got these doc daily alerts:",res.data );
        let alerts = res.data;
        if (dailyAlertsStatus === 0) {
          // Filter alerts only if there are no daily alerts
          alerts = alerts.filter((alert) => alert.dailyordia !== "daily" &&  alert.dailyordia !== "dialysis" );
        }

        setAlerts(alerts);
        console.log("ALERTS", alerts);

      } catch (error) {
        console.error("Error fetching alerts:", error);
      }
    };
    fetchAlerts();
  }, []);

  // Get unique patient names from alerts
  let names;
  try {
    names = [
      ...new Set(Array.isArray(Alerts) && Alerts.map((alert) => alert.name)),
    ];
    console.log("Names:", names);
  } catch (error) {
    console.log(error);
  }

  useEffect(() => {
    // Grouping alerts when Alerts changes
    const grouped = Alerts.reduce((accumulator, alert) => {
      const { patientId } = alert;

      if (!accumulator[patientId]) {
        accumulator[patientId] = [];
      }

      accumulator[patientId].push({
        name: alert.name,
        patientId: alert.patientId,
        patientProfilePhoto: alert.patientProfilePhoto,
      });

      return accumulator;
    }, {});

    setGroupedAlerts(grouped);
  }, [Alerts]);

  console.log("groupedAlerts", groupedAlerts);

  return (
    <div className="bg-gray-100 min-h-screen lg:py-10 lg:px-40 overflow-y-auto">
      <div className="flex flex-col lg:flex-row lg:justify-center">
        <div className="bg-white p-5 rounded-lg border-t-primary border-t-4 shadow-lg my-10 min-w-min">
          <p className="text-lg font-semibold text-center lg:sticky lg:top-0 bg-white pt-2">
            Important Alerts
          </p>
          <div className="flex justify-center overflow-hidden flex-col sm:overflow-auto max-h-screen sm:max-h-[calc(100%-2rem)]">
            {Array.isArray(names) &&
              names.map((name) => (
                <div key={name} className="mb-5 text-center sm:mb-2">
                  <UserCard title={name} Alerts={Alerts} />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};


export default DoctorContainer;
