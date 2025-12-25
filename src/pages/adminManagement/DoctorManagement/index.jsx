import React, { useEffect } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";
import { BsTrash, BsPencilSquare, BsKey } from "react-icons/bs";
import { useState, useReducer } from "react";
import { practicingAtList, doctorSpeciality, staffSpeciality } from "../consts";
import { newDoctorReducer } from "../reducers";
import Select from "react-select";
import {
  registerDoctor,
  getDoctors,
  updateDoctor,
  deleteDoctor,
} from "../../../ApiCalls/doctorApis";
import ReadingsModal from "./readingsModal";
import { useSelector } from "react-redux";
import { uploadFile } from "../../../ApiCalls/dataUpload";

function AdminManagement() {
  const roleoptions = ["Doctor", "Medical Staff", "Dialysis Technician"].map(
    (role, index) => {
      return (
        <option key={index} value={role}>
          {role}
        </option>
      );
    }
  );

  const practicingAtOptions = practicingAtList.map((pat, index) => {
    return (
      <option key={index} value={pat}>
        {pat}
      </option>
    );
  });

  const myRole = useSelector((state) => state.permission);

  const [doctorsList, setDoctorsList] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("daily");
  const [successful, setSuccessful] = useState("");

  function searchDoctor(keyword) {
    setDoctors(
      doctorsList.filter((doc) => {
        if (doc["name"].toLowerCase().includes(keyword.toLowerCase())) {
          return doc;
        }
      })
    );
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDoctors();
        if (result.success) {
          console.log(result.data.data);
          setDoctorsList(result.data.data);
          setDoctors(result.data.data);
        } else {
          console.error("Failed to fetch doctors:", result.data);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchData();
  }, [successful]);

  const [editMode, setEditMode] = useState(false);

  const [newDoctor, newDoctorDispatch] = useReducer(newDoctorReducer, {
    id: null,
    name: "",
    specialities: [],
    email: "",
    phoneNo: "",
    practicingAt: practicingAtList[0],
    institute: "",
    licenseNo: "",
    doctorsCode: "",
    yearsOfExperience: 0,
    address: "",
    photo: null,
    resume: "",
    reference: "",
    description: "",
    role: "Doctor",
    dailyReadings: [],
    dialysisReadings: [],
    email_notification: "yes",
    Dialysis_updates: "yes",
    dailyReadingsAlerts: "no",
    can_export: "no",
  });

  const [errMsg, setErrMsg] = useState("");

  const validateDoctorData = (doctorData) => {
    const {
      name,
      email,
      licenseNo,
      doctorsCode,
      practicingAt,
      phoneNo,
      specialities,
    } = doctorData;
    if (!name || typeof name !== "string") {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return false;
    }
    if (specialities.length <= 0) {
      return false;
    }
    if (!licenseNo || typeof licenseNo !== "string") {
      return false;
    }
    if (!doctorsCode || typeof doctorsCode !== "string") {
      return false;
    }
    if (!practicingAt || typeof practicingAt !== "string") {
      return false;
    }
    const phoneRegex = /^[0-9]{10}$/;

    if (!phoneRegex.test(phoneNo)) {
      return false;
    }
    return true;
  };
  const validateMedicalData = (doctorData) => {
    const { name, email, phoneNo, specialities } = doctorData;
    if (!name || typeof name !== "string") {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return false;
    }
    if (specialities.length <= 0) {
      return false;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNo)) {
      return false;
    }
    return true;
  };

  const validateTechnicianData = (doctorData) => {
    const { name, email, phoneNo, specialities } = doctorData;
    if (!name || typeof name !== "string") {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return false;
    }
    if (specialities.length <= 0) {
      return false;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNo)) {
      return false;
    }
    return true;
  };


  const getFileRes = async (file) => {
    try {
      if (file) {
        let formData = new FormData();
        formData.append("file", file, file?.name);
        const fileRes = await uploadFile(formData);
        return fileRes;
      } else {
        return { data: { objectUrl: "" } };
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      return { data: { objectUrl: "" } };
    }
  };

  const handleSubmit = async () => {
    setErrMsg("");
    setSuccessful("Uploading Data");
    if (newDoctor.role == "Doctor" && validateDoctorData(newDoctor)) {
      const photourl = await getFileRes(newDoctor.photo);
      const payload = {
        name: newDoctor.name,
        role: newDoctor.role,
        email: newDoctor.email,
        practicingAt: newDoctor.practicingAt,
        experience: newDoctor.yearsOfExperience,
        doctorsCode: newDoctor.doctorsCode,
        licenseNo: newDoctor.licenseNo,
        phoneno: newDoctor.phoneNo,
        institute: newDoctor.institute,
        address: newDoctor.address,
        photo: photourl?.data?.objectUrl,
        description: newDoctor.description,
        email_notification: newDoctor.email_notification,
        Dialysis_updates: newDoctor.Dialysis_updates,
        dailyReadingsAlerts: newDoctor.dailyReadingsAlerts,
        can_export: newDoctor.can_export,
        specialities: newDoctor.specialities,
        dailyReadings: newDoctor.dailyReadings,
        dialysisReadings: newDoctor.dialysisReadings,
        changeby: localStorage.getItem("email"),
        doctorid: newDoctor.id,
      };
      console.log("ipdating with,", payload.dailyReadings);
      if (!editMode) {
        const response = await registerDoctor(payload);
        if (response.success) {
          setErrMsg("");
          setSuccessful("Registration Successful!");
          newDoctorDispatch({ type: "all", payload: { practicingAt: practicingAtList[0] } });
        } else {
          setErrMsg("Registration Error! " + response.data);
          setSuccessful("");
        }
      } else {
        const response = await updateDoctor(newDoctor.id, payload);
        if (response.success) {
          setErrMsg("");
          setSuccessful("Update Successful!");
          setEditMode(false);
          newDoctorDispatch({ type: "all", payload: { practicingAt: practicingAtList[0] } });
        } else {
          setErrMsg("Update Error! " + response.data);
          setSuccessful("");
        }
      }
    } else if (
      newDoctor.role == "Medical Staff" &&
      validateMedicalData(newDoctor)
    ) {
      const photourl = await getFileRes(newDoctor.photo);
      const resumeurl = await getFileRes(newDoctor.resume);
      const payload = {
        name: newDoctor.name,
        role: newDoctor.role,
        email: newDoctor.email,
        experience: newDoctor.yearsOfExperience,
        ref: newDoctor.reference || null,
        phoneno: newDoctor.phoneNo,
        institute: newDoctor.institute,
        address: newDoctor.address,
        practicingAt: newDoctor.practicingAt,
        resume: resumeurl.data.objectUrl || null,
        photo: photourl?.data.objectUrl,
        description: newDoctor.description,
        email_notification: newDoctor.email_notification,
        can_export: newDoctor.can_export,
        specialities: newDoctor.specialities,
        changeby: localStorage.getItem("email"),
        doctorid: newDoctor.id,
      };
      console.log("docs payload", payload);
      if (!editMode) {
        const response = await registerDoctor(payload);
        if (response.success) {
          setErrMsg("");
          setSuccessful("Registration Successful!");
          newDoctorDispatch({ type: "all", payload: { practicingAt: practicingAtList[0] } });
        } else {
          setErrMsg("Registration Error! " + response.data);
          setSuccessful("");
        }
      } else {
        const response = await updateDoctor(newDoctor.id, payload);
        if (response.success) {
          setErrMsg("");
          setSuccessful("Update Successful!");
          setEditMode(false);
          newDoctorDispatch({ type: "all", payload: {} });
        } else {
          setErrMsg("Update Error! " + response.data);
          setSuccessful("");
        }
      }
    } 
    
    // add Dialysis Technician here
    else if(newDoctor.role == "Dialysis Technician" && validateTechnicianData(newDoctor)) {
      const photourl = await getFileRes(newDoctor.photo);
      const payload = {
        name: newDoctor.name,
        role: newDoctor.role,
        email: newDoctor.email,
        experience: newDoctor.yearsOfExperience,
        phoneno: newDoctor.phoneNo,
        institute: newDoctor.institute,
        address: newDoctor.address,
        practicingAt: newDoctor.practicingAt,
        photo: photourl?.data?.objectUrl,
        description: newDoctor.description,
        email_notification: newDoctor.email_notification,
        // can_export: newDoctor.can_export,
        specialities: newDoctor.specialities,
        can_export: newDoctor.can_export,
        dailyReadings: newDoctor.dailyReadings,
        dialysisReadings: newDoctor.dialysisReadings,
        dialysisReadings: newDoctor.dialysisReadings,
        changeby: localStorage.getItem("email"),
        doctorid: newDoctor.id,
      };

      console.log("Dialysis Technician payload", payload);
      const response = editMode
        ? await updateDoctor(newDoctor.id, payload)
        : await registerDoctor(payload);
  
      if (response.success) {
        setErrMsg("");
        setSuccessful(editMode ? "Update Successful!" : "Registration Successful!");
        setEditMode(false);
        newDoctorDispatch({ type: "all", payload: {} });
      } else {
        setErrMsg((editMode ? "Update Error! " : "Registration Error! ") + response.data);
        setSuccessful("");
      }
  
  
    }
    
    else {
      setSuccessful("");
      setErrMsg("Please fill all the * fields correctly!");
    }
  };

  async function handleDelete(id) {
    try {
      // Display a confirmation dialog
      const confirmed = window.confirm(
        "Are you sure you want to delete this doctor?"
      );

      if (!confirmed) {
        return; // If the user cancels, exit the function
      }

      setErrMsg("");
      setSuccessful("Deleting Data");
      const response = await deleteDoctor(id);
      if (response.success) {
        setSuccessful("Delete Successful!");
        newDoctorDispatch({ type: "all", payload: {} });
      } else {
        setErrMsg(
          "Delete Error! (Please delete this doctor from the patients list for all the assigned patients before deleting it permantly!)");
        setSuccessful("");
      }
    } catch (error) {
      console.error("Error deleting doctor:", error);
    }
  }

  function closeModal() {
    setShowModal(false);
  }

  return (
    <div className="md:flex block">
      <div className="md:flex-1 hidden md:flex">
        <Sidebar />
      </div>

      <div className=" md:flex-[5] block w-screen">
        <Navbar />
        <div className="bg-gray-100 min-h-screen md:py-10 md:px-40">
          <div className=" bg-white md:p-6 border p-2 rounded-md border-t-primary border-t-4 shadow-md">
            <div className="w-full md:w-[50%] px-5 py-0">
              <label className="block mb-2 text-sm font-medium text-gray-500">
                User Role*
              </label>
              <select
                value={newDoctor.role}
                onChange={(event) => {
                  newDoctorDispatch({
                    type: "role",
                    payload: event.target.value,
                  });
                }}
                className="border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 focus:outline-primary"
              >
                {roleoptions}
              </select>
            </div>
            {showModal ? (
              <ReadingsModal
                closeModal={closeModal}
                newDoctor={newDoctor}
                newDoctorDispatch={newDoctorDispatch}
                modalType={modalType}
              />
            ) : null}
            <div className="border-b-gray border-b-2 p-2 pt-4 md:pb-4 font-semibold text-primary tracking-wide text-xl">
              Create Doctor/Medical Staff
            </div>
            <div className=" md:grid md:grid-cols-2">
              <div className="p-5">
                <label className="block mb-2 text-sm font-medium text-gray-500">
                  Name*
                </label>
                <input
                  type="text"
                  placeholder="Name"
                  value={newDoctor.name}
                  onChange={(event) => {
                    const nameArr = event.target.value.split(" ");
                    newDoctorDispatch({
                      type: "name",
                      payload: event.target.value,
                    });
                    newDoctorDispatch({
                      type: "doctorsCode",
                      payload:
                        nameArr[0][0] +
                        (nameArr.length > 1
                          ? nameArr[1][0]
                          : nameArr[0][1]
                          ? nameArr[0][1]
                          : "") +
                        Math.floor(Math.random() * 100000),
                    });
                  }}
                  className=" border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 focus:outline-primary"
                />
                <label className="block mb-2 text-sm pt-6 font-medium text-gray-500">
                  Email*
                </label>
                <input
                  type="email"
                  placeholder="Email"
                  value={newDoctor.email}
                  onChange={(event) => {
                    newDoctorDispatch({
                      type: "email",
                      payload: event.target.value,
                    });
                  }}
                  className=" border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 focus:outline-primary"
                />
                {newDoctor.role == "Doctor" ? (
                  <>
                    <label className="block mb-2 text-sm pt-6 font-medium text-gray-500">
                      License No*
                    </label>
                    <input
                      type="text"
                      placeholder="License No"
                      value={newDoctor.licenseNo}
                      onChange={(event) => {
                        newDoctorDispatch({
                          type: "licenseNo",
                          payload: event.target.value,
                        });
                      }}
                      className=" border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 focus:outline-primary"
                    />
                  </>
                ) : (
                  <></>
                )}
                <label className="block mb-2 text-sm font-medium text-gray-500 pt-6">
                  Practicing At*
                </label>
                <select
                  value={newDoctor.practicingAt}
                  onChange={(event) => {
                    newDoctorDispatch({
                      type: "practicingAt",
                      payload: event.target.value,
                    });
                  }}
                  className="border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 focus:outline-primary"
                >
                  {practicingAtOptions}
                </select>
                <label className="block mb-2 text-sm pt-6 font-medium text-gray-500">
                  Years Of Experience
                </label>
                <input
                  type="number"
                  placeholder="Years Of Experience"
                  value={newDoctor.yearsOfExperience}
                  onChange={(event) => {
                    newDoctorDispatch({
                      type: "yearsOfExperience",
                      payload: event.target.value,
                    });
                  }}
                  className=" border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 focus:outline-primary"
                />
                <label className="block mb-2 text-sm pt-6 font-medium text-gray-500">
                  Reference If Any
                </label>
                <input
                  type="text"
                  placeholder="Reference"
                  value={newDoctor.reference}
                  onChange={(event) => {
                    newDoctorDispatch({
                      type: "reference",
                      payload: event.target.value,
                    });
                  }}
                  className=" border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 focus:outline-primary"
                />
                {newDoctor.role == "Medical Staff" ? (
                  <>
                    <label className="block mb-2 text-sm pt-6 font-medium text-gray-500">
                      Resume
                    </label>
                    <input
                      type="file"
                      name="Resume"
                      id="file-input"
                      onChange={(event) => {
                        newDoctorDispatch({
                          type: "resume",
                          payload: event.target.files[0],
                        });
                      }}
                      className="block w-full border border-gray-300 text-gray-500 shadow-sm rounded-lg text-sm focus:z-10 focus:border-primary focus:ring-primary disabled:opacity-50 disabled:pointer-events-none 
                        file:border-0
                      file:bg-gray-300 file:me-4
                      file:text-gray-600
                        file:py-2.5 file:px-4"
                    />
                  </>
                ) : (
                  <>
                    <label className="block mb-2 pt-6 text-sm font-medium text-gray-500">
                      Required Daily Readings
                    </label>
                    <button
                      className=" flex-1 border md:inline-block text-white bg-primary text-base border-gray-300 w-full rounded-lg p-1.5"
                      onClick={() => {
                        setShowModal(true);
                        setModalType("daily");
                      }}
                    >
                      Select Daily Readings
                    </button>
                  </>
                )}
              </div>
              <div className="p-5">
                <label className="block mb-2 text-sm font-medium text-gray-500">
                  Specialities*
                </label>
                <Select
                  value={newDoctor.specialities}
                  isMulti
                  options={
                    newDoctor.role == "Doctor"
                      ? doctorSpeciality
                      : staffSpeciality
                  }
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      borderColor: state.isFocused
                        ? "#00c6be"
                        : "rgb(209 213 219)",
                      outlineColor: state.isFocused
                        ? "#00c6be"
                        : "rgb(209 213 219)",
                      borderRadius: "0.5rem",
                      padding: "0.14rem",
                      fontSize: "0.875rem",
                    }),
                  }}
                  onChange={(selectedOptions) => {
                    newDoctorDispatch({
                      type: "specialities",
                      payload: selectedOptions,
                    });
                  }}
                />
                <label className="block mb-2 text-sm pt-6 font-medium text-gray-500">
                  Phone No*
                </label>
                <input
                  type="number"
                  placeholder="Phone No"
                  value={newDoctor.phoneNo}
                  onChange={(event) => {
                    newDoctorDispatch({
                      type: "phoneNo",
                      payload: event.target.value,
                    });
                  }}
                  className=" border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 focus:outline-primary"
                />
                {newDoctor.role == "Doctor" ? (
                  <>
                    <label className="block mb-2 text-sm pt-6 font-medium text-gray-500">
                      Doctors Code*
                    </label>
                    <input
                      type="text"
                      placeholder="Doctors Code"
                      value={newDoctor.doctorsCode}
                      onChange={(event) => {
                        newDoctorDispatch({
                          type: "doctorsCode",
                          payload: event.target.value,
                        });
                      }}
                      className=" border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 focus:outline-primary"
                    />
                  </>
                ) : (
                  <></>
                )}
                <label className="block mb-2 text-sm pt-6 font-medium text-gray-500">
                  Name of the Institute/Hospital/Clinic
                </label>
                <input
                  type="text"
                  placeholder="Name of the Institute/Hospital/Clinic"
                  value={newDoctor.institute}
                  onChange={(event) => {
                    newDoctorDispatch({
                      type: "institute",
                      payload: event.target.value,
                    });
                  }}
                  className=" border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 focus:outline-primary"
                />
                <label className="block mb-2 text-sm pt-6 font-medium text-gray-500">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="Address"
                  value={newDoctor.address}
                  onChange={(event) => {
                    newDoctorDispatch({
                      type: "address",
                      payload: event.target.value,
                    });
                  }}
                  className=" border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 focus:outline-primary"
                />
                <label className="block mb-2 text-sm pt-6 font-medium text-gray-500">
                  Photo
                </label>
                <input
                  type="file"
                  name="Photo"
                  id="file-input"
                  onChange={(event) => {
                    newDoctorDispatch({
                      type: "photo",
                      payload: event.target.files[0],
                    });
                  }}
                  className="block w-full border border-gray-300 text-gray-500 shadow-sm rounded-lg text-sm focus:z-10 focus:border-primary focus:ring-primary disabled:opacity-50 disabled:pointer-events-none 
                        file:border-0
                      file:bg-gray-300 file:me-4
                      file:text-gray-600
                        file:py-2.5 file:px-4"
                />
                {newDoctor.role == "Doctor" ? (
                  <>
                    <label className="block mb-2 pt-6 text-sm font-medium text-gray-500">
                      Required Dialysis Readings*
                    </label>
                    <button
                      className=" flex-1 border md:inline-block text-white bg-primary text-base border-gray-300 w-full rounded-lg p-1.5"
                      onClick={() => {
                        setShowModal(true);
                        setModalType("dialysis");
                      }}
                    >
                      Select Dialysis Readings
                    </button>
                  </>
                ) : (
                  <></>
                )}
              </div>
            </div>
            <div className="w-full md:block p-6 pt-0">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-500">
                  Description
                </label>
                <textarea
                  rows={2}
                  type="text"
                  placeholder="Description"
                  value={newDoctor.description}
                  onChange={(event) => {
                    newDoctorDispatch({
                      type: "description",
                      payload: event.target.value,
                    });
                  }}
                  className=" border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 focus:outline-primary"
                />
                <div className="pt-6 mb-2 text-sm font-medium text-gray-500 grid grid-cols-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-green-600  rounded cursor-pointer"
                      checked={newDoctor.email_notification == "yes"}
                      onChange={(event) => {
                        newDoctorDispatch({
                          type: "email_notification",
                          payload: event.target.checked == true ? "yes" : "no",
                        });
                      }}
                    />
                    <label className="ms-2 text-sm font-medium text-gray-500">
                      Subscribe to Email Notifications
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-green-600  rounded cursor-pointer"
                      checked={newDoctor.dailyReadingsAlerts == "yes"}
                      onChange={(event) => {
                        console.log(event.target.checked);
                        newDoctorDispatch({
                          type: "dailyReadingsAlerts",
                          payload: event.target.checked == true ? "yes" : "no",
                        });
                      }}
                    />
                    <label className="ms-2 text-sm font-medium text-gray-500">
                      Daily Reading Alert
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-green-600  rounded cursor-pointer"
                      checked={newDoctor.Dialysis_updates == "yes"}
                      onChange={(event) => {
                        console.log(event.target.checked);
                        newDoctorDispatch({
                          type: "Dialysis_updates",
                          payload: event.target.checked == true ? "yes" : "no",
                        });
                      }}
                    />
                    <label className="ms-2 text-sm font-medium text-gray-500">
                      Dialysis Technician Alerts
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-green-600  rounded cursor-pointer"
                      checked={newDoctor.can_export == "yes"}
                      onChange={(event) => {
                        newDoctorDispatch({
                          type: "can_export",
                          payload: event.target.checked == true ? "yes" : "no",
                        });
                      }}
                    />
                    <label className="ms-2 text-sm font-medium text-gray-500">
                      Can Export patient data
                    </label>
                  </div>
                </div>
              </div>
              {editMode ? (
                <div>
                  <button
                    onClick={handleSubmit}
                    className=" flex-1 mr-2 mt-5 border md:inline-block text-white bg-primary font-semibold tracking-wide text-lg border-gray-300 w-[12vw] rounded-lg p-1.5"
                  >
                    UPDATE
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      newDoctorDispatch({ type: "all", payload: {} });
                    }}
                    className="flex-1 border text-[#ff0000] md:inline-block bg-white font-semibold tracking-wide text-lg border-[#ff0000] w-[12vw] rounded-lg  p-1.5"
                  >
                    CANCEL
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    onClick={handleSubmit}
                    className=" border mt-5 text-white bg-primary font-semibold tracking-wide text-lg border-gray-300 w-full md:w-[12vw] rounded-lg block p-1.5"
                  >
                    SUBMIT
                  </button>
                </div>
              )}
              <div className="text-[#ff0000] pt-6">
                {errMsg}
                <span className="text-primary">{successful}</span>
              </div>
            </div>
          </div>

          <div className=" bg-white md:p-12 p-6 border rounded-md  border-t-4 shadow-md mt-4">
            <div>
              <input
                type="text"
                placeholder="Search Name"
                className=" border border-gray-300 text-gray-500 inline-block text-sm rounded-lg w-full md:w-[22vw] p-2.5 focus:outline-primary"
                onChange={(event) => {
                  searchDoctor(event.target.value);
                }}
              />
            </div>

            <div className="relative overflow-x-auto mt-6">
              <span className=" text-gray-900 tracking-wide text-xl ">
                Doctor List{" "}
                <span className="text-gray-400 text-sm">
                  ({doctors.length} Records Found )
                </span>
              </span>
              <div className="mt-4">
                <table className=" w-full text-sm text-left rtl:text-right text-gray-800 ">
                  <thead className="text-sm text-gray-700 border-b-2 border-gray-800 ">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Unique Code
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 ">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map((u, index) => {
                      return (
                        <tr key={index} className="bg-white border-b ">
                          <td scope="row" className="px-6 py-4">
                            {u["doctors code"]}
                          </td>
                          <td scope="row" className="px-6 py-4">
                            {u.name}
                          </td>
                          <td className="px-6 py-4">{u.email}</td>
                          <td className="px-6 py-4">{u.role}</td>
                          <td className="px-6 py-4 text-2xl">
                            {myRole.createDoctor >= 2 && (
                              <button
                                className="text-primary inline-block mx-2"
                                onClick={() => {
                                  setSuccessful("");
                                  newDoctorDispatch({
                                    type: "all",
                                    payload: {
                                      id: u.id,
                                      name: u.name,
                                      specialities: u.specialities,
                                      email: u.email,
                                      phoneNo: u.phoneno,
                                      practicingAt: u["practicing at"],
                                      institute: u.institute,
                                      licenseNo: u["license no"],
                                      doctorsCode: u["doctors code"],
                                      yearsOfExperience: u.experience,
                                      address: u.address,
                                      photo: u.photo,
                                      resume: u.resume,
                                      reference: u.ref,
                                      description: u.description,
                                      role: u.role,
                                      dailyReadings: u.dailyReadings,
                                      dialysisReadings: u.dialysisReadings,
                                      email_notification: u.email_notification,
                                      dailyReadingsAlerts: u.daily_update,
                                      Dialysis_updates: u.Dialysis_updates,
                                      can_export: u.can_export,
                                    },
                                  });
                                  setEditMode(true);
                                  window.scrollTo({
                                    top: 0,
                                    left: 0,
                                    behavior: "smooth",
                                  });
                                }}
                              >
                                <BsPencilSquare />
                              </button>
                            )}
                            {myRole.createDoctor >= 4 && (
                              <button
                                className="text-[#ff0000] inline-block mx-2"
                                onClick={() => {
                                  handleDelete(u.id);
                                }}
                              >
                                <BsTrash />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
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

export default AdminManagement;
