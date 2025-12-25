import React, { useState, useEffect } from "react";
import "./ShowAlarms.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useParams, Link } from "react-router-dom";
import AlarmModal from "./AlarmModal";
import { server_url } from "../../constants/constants";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { BsTrash, BsPencilSquare, BsKey } from "react-icons/bs";
import EditAlarmModal from "./EditAlarmModal";
import DoctorAlarmModal from "./DoctorAlarmModal";

function ShowAlarms() {
  const [showModal, setShowModal] = useState(false);
  const { pid } = useParams();
  const [userAlarmData, setUserAlarmData] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [openAlarmId, setOpenAlarmId] = useState(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [dosesData, setDosesData] = useState(null);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = (data) => {
    setShowModal(false);
  };

  const openEditModal = (data) => {
    setEditData(data);
    setOpenAlarmId(data.id);
    setShowEditModal(true);
  };

  const closeEditModal = (data) => {
    setShowEditModal(false);
  };
  const deleteAlarm = async (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this alarm?"
    );
    if (isConfirmed) {
      try {
        console.log(id);
        const result = await axiosInstance.delete(`${server_url}/alarms/${id}`);

        console.log("Response:", result.data);
        // Update the UI by filtering out the deleted alarm
        setUserAlarmData((prevData) =>
          prevData.filter((alarm) => alarm.id !== id)
        );
      } catch (error) {
        console.error("Error:", error.message);
        alert("Failed to delete alarm. Please try again.");
      }
    }
  };

  const openDoctorModal = (data) => {
    setEditData(data);
    setShowDoctorModal(true);
  };
  const closeDoctorModal = (data) => {
    setShowDoctorModal(false);
  };
  const [isDoctor, setIsDoctor] = useState(false);

  const approveAlarm = async (id, status) => {
    const reqbody = {
      alarmId: id,
      status: status,
    };
    console.log("status:",status)
    const result = await axiosInstance.put(
      `${server_url}/alerts/approveOrDisapprovePrescription`,
      reqbody
    );
    if (status === "Approved") {
      alert("Prescription Approved Successfully");
      window.location.reload();
    } else {
      alert("Prescription Rejected Successfully");
      window.location.reload();
    }
  };

  useEffect(() => {
    const getData = async () => {
      const result = await axiosInstance.get(
        `${server_url}/alarms/byPatientId/${pid}`
      );
      console.log(result.data.data);
      await setUserAlarmData(result.data.data);
      console.log(userAlarmData);
      setDosesData(result.data.doses);
      return result;
    };
    const isDoctorfunc = async () => {
      const response = await axiosInstance.get(`${server_url}/roles/isDoctor`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setIsDoctor(response.data.data);
    };

    getData();
    isDoctorfunc();
  }, [showModal, showEditModal, showDoctorModal]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const dateObject = new Date(dateString);
    const day = String(dateObject.getDate()).padStart(2, "0");
    const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = dateObject.getFullYear();
    return `${day}-${month}-${year}`;
  };

  function AlarmCard({ alarm, onDelete, onApprove, onReject }) {
    console.log(alarm);
    const alarmId = localStorage.getItem("alarmId");
    const isHighlighted = alarmId && parseInt(alarmId) === alarm.id;
    return (
      <tr
        key={alarm.id}
        className={`${
          isHighlighted ? "bg-green-100" : ""
        } border-b border-gray-200`}>
        <td>{formatDate(alarm.dateadded)}</td>
        <td>{alarm.type ? alarm.type : "No type available"}</td>

        <td
          // align the text in center
          className="text-center">
          {alarm.time}
        </td>
        <td>{alarm.timesamonth ? alarm.timesamonth : "Not specified"}</td>
        <td>{alarm.status}</td>
        {isDoctor  ? (
          <></>
        ) : (
          <td className="align-middle">
            <button
              className="text-[#87ca9c] inline-block mx-2 text-2xl"
              onClick={() => openEditModal(alarm)}>
              <BsPencilSquare />
            </button>
            <button
              className="text-[#ff0000] inline-block mx-2 text-2xl"
              onClick={() => deleteAlarm(alarm.id)}>
              <BsTrash />
            </button>
          </td>
        )}
      </tr>
    );
  }

  return (
    <div className="ShowAlarms md:flex block">
      <div className="md:flex-1 hidden md:flex sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </div>
      <div className="md:flex-[5] block w-screen">
        <div className="sticky top-0 z-10">
          <Navbar />
        </div>
        <div className="container">
          <div className="bg-gray-100 min-h-screen sm:py-10 sm:px-20 ">
            <div className="w-full p-7 bg-white shadow-md border-t-4 border-primary">
              <Link
                to={`/userProfile/${pid}`}
                className="text-primary border-b-2 border-primary">
                go back
              </Link>
              <div className="mt-4 mb-4 flex items-center justify-end">
                {/* <h1 className="text-2xl">Dr. {localStorage.getItem("firstname")}</h1> */}
                {/* <img src="" alt="f" className="rounded-full h-12 w-12" /> */}
              </div>
              <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h2 className="text-2xl font-bold">Alarms</h2>
                <div className="flex items-center justify-end">
                  <button
                    className="block rounded-lg text-primary border-2 border-primary w-40 py-2"
                    onClick={() => openModal()}>
                    Add Alarm
                  </button>
                  {showModal && (
                    <AlarmModal closeModal={closeModal} pid={pid} />
                  )}
                  {showEditModal && !isDoctor && (
                    <EditAlarmModal
                      closeModal={closeEditModal}
                      alarmData={editData}
                      pid={pid}
                      dosesData={dosesData}
                    />
                  )}
                  {showDoctorModal && isDoctor && (
                    <DoctorAlarmModal
                      closeModal={closeModal}
                      alarmData={editData}
                      pid={pid}
                    />
                  )}
                </div>
              </div>

              <div className=" overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-white text-gray-700">
                    <tr className="border-b-2 border-black">
                      <th className="py-3 px-4 text-left">Date</th>
                      <th className="py-1 px-1 w-32 text-left">Alarm Type</th>
                      <th className="py-3 px-4 text-Left">Time Duration</th>
                      <th className="py-3 px-4 text-left">Monthly</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      {isDoctor ? (
                        <></>
                      ) : (
                        <th className="py-3 px-4 text-left">Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {userAlarmData ? (
                      // <tr>
                      //   <td>{userAlarmData.dateadded.slice(0,10)}</td>
                      //   <td>{userAlarmData.type}</td>
                      //   <td
                      //   // align the text in center
                      //     className="text-center"
                      //   >{userAlarmData.time}</td>
                      //   <td>{userAlarmData.timesamonth}</td>
                      //   <td>{userAlarmData.status}</td>
                      //   <td
                      //    className="align-middle"
                      //   >
                      //     <button
                      //     className="text-[#ff0000] inline-block mx-2
                      //     text-2xl"
                      //     onClick={() => deleteAlarm(userAlarmData.id)}
                      //     >
                      //     <BsTrash  />
                      //     </button>
                      //   </td>
                      // </tr>
                      // map it
                      userAlarmData.map((alarm) => (
                        <AlarmCard
                          key={alarm.id}
                          alarm={alarm}
                          onDelete={deleteAlarm}
                          onApprove={approveAlarm}
                          onReject={approveAlarm}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-left italic font-light">
                          No Alarms found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShowAlarms;
