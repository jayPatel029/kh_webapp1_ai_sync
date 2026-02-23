import React, { useEffect, useState, useReducer, useMemo } from "react";
import { practicingAtList, doctorSpeciality, staffSpeciality } from "../consts";
import { newDoctorReducer } from "../reducers";
import {
  registerDoctor,
  getDoctors,
  updateDoctor,
  deleteDoctor,
} from "../../../ApiCalls/doctorApis";
import ReadingsModal from "./readingsModal";
import { useSelector } from "react-redux";
import { uploadFile } from "../../../ApiCalls/dataUpload";
import PageHeader from "../../../components/PageHeader";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../routes/routeConstants";
import ThemeProvider from "../../../components/ThemeProvider";
import { useIsMobile } from "../../../components/mobile/useIsMobile";
import { FormModal } from "../../../component-library/modals/FormModal";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  Textarea,
  Checkbox
} from "../../../component-library";
import UnifiedListTable from "../../../components/table/UnifiedListTable";

function AdminManagement() {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const myRole = useSelector((state) => state.permission);

  const roleoptions = ["Doctor", "Medical Staff", "Dialysis Technician"].map(
    (role, index) => (
      <option key={index} value={role}>
        {role}
      </option>
    )
  );

  const practicingAtOptions = practicingAtList.map((pat, index) => (
    <option key={index} value={pat}>
      {pat}
    </option>
  ));

  const [doctorsList, setDoctorsList] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [showReadingsModal, setShowReadingsModal] = useState(false);
  const [readingsModalType, setReadingsModalType] = useState("daily");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  function searchDoctor(keyword) {
    setSearchTerm(keyword);
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
  }, [successMessage]);

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
    setSuccessMessage("Uploading Data");
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
          setSuccessMessage("Registration Successful!");
          clearDoctorFields();
          setIsFormModalOpen(false);
        } else {
          setErrMsg("Registration Error! " + response.data);
          setSuccessMessage("");
        }
      } else {
        const response = await updateDoctor(newDoctor.id, payload);
        if (response.success) {
          setErrMsg("");
          setSuccessMessage("Update Successful!");
          clearDoctorFields();
          setIsFormModalOpen(false);
        } else {
          setErrMsg("Update Error! " + response.data);
          setSuccessMessage("");
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
          setSuccessMessage("Registration Successful!");
          clearDoctorFields();
          setIsFormModalOpen(false);
        } else {
          setErrMsg("Registration Error! " + response.data);
          setSuccessMessage("");
        }
      } else {
        const response = await updateDoctor(newDoctor.id, payload);
        if (response.success) {
          setErrMsg("");
          setSuccessMessage("Update Successful!");
          clearDoctorFields();
          setIsFormModalOpen(false);
        } else {
          setErrMsg("Update Error! " + response.data);
          setSuccessMessage("");
        }
      }
    }

    // add Dialysis Technician here
    else if (newDoctor.role == "Dialysis Technician" && validateTechnicianData(newDoctor)) {
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
        specialities: newDoctor.specialities,
        can_export: newDoctor.can_export,
        dailyReadings: newDoctor.dailyReadings,
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
        setSuccessMessage(editMode ? "Update Successful!" : "Registration Successful!");
        clearDoctorFields();
        setIsFormModalOpen(false);
      } else {
        setErrMsg((editMode ? "Update Error! " : "Registration Error! ") + response.data);
        setSuccessMessage("");
      }
    } else {
      setSuccessMessage("");
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
      setSuccessMessage("Deleting Data");
      const response = await deleteDoctor(id);
      if (response.success) {
        setSuccessMessage("Delete Successful!");
      } else {
        setErrMsg(
          "Delete Error! (Please delete this doctor from the patients list for all the assigned patients before deleting it permantly!)");
        setSuccessMessage("");
      }
    } catch (error) {
      console.error("Error deleting doctor:", error);
    }
  }

  const clearDoctorFields = () => {
    newDoctorDispatch({
      type: "all",
      payload: {
        practicingAt: practicingAtList[0],
        role: "Doctor"
      }
    });
    setEditMode(false);
    setErrMsg("");
  };

  const prepareEditDoctor = (doctor) => {
    setSuccessMessage("");
    newDoctorDispatch({
      type: "all",
      payload: {
        id: doctor.id,
        name: doctor.name,
        specialities: doctor.specialities,
        email: doctor.email,
        phoneNo: doctor.phoneno,
        practicingAt: doctor["practicing at"] || doctor.practicingAt,
        institute: doctor.institute,
        licenseNo: doctor["license no"] || doctor.licenseNo,
        doctorsCode: doctor["doctors code"] || doctor.doctorsCode,
        yearsOfExperience: doctor.experience,
        address: doctor.address,
        photo: doctor.photo,
        resume: doctor.resume,
        reference: doctor.ref,
        description: doctor.description,
        role: doctor.role,
        dailyReadings: doctor.dailyReadings,
        dialysisReadings: doctor.dialysisReadings,
        email_notification: doctor.email_notification,
        dailyReadingsAlerts: doctor.daily_update,
        Dialysis_updates: doctor.Dialysis_updates,
        can_export: doctor.can_export,
      },
    });
    setEditMode(true);
    setIsFormModalOpen(true);
  };

  const openCreateForm = () => {
    setSuccessMessage("");
    clearDoctorFields();
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    clearDoctorFields();
  };

  function closeReadingsModal() {
    setShowReadingsModal(false);
  }

  const tableData = useMemo(
    () =>
      doctors.map((doctor) => ({
        ...doctor,
        doctorCode:
          doctor["doctors code"] || doctor.doctorsCode || doctor.doctorCode || "",
        actions: doctor,
      })),
    [doctors]
  );

  const columns = [
    { key: "doctorCode", label: "Unique Code", type: "text", width: "180px" },
    { key: "name", label: "Name", type: "text", width: "200px" },
    { key: "email", label: "Email", type: "text", width: "240px" },
    { key: "role", label: "Role", type: "text", width: "160px" },
    { key: "actions", label: "Action", type: "actions", width: "220px" },
  ];

  return (
    <ThemeProvider>
      <Box className="flex-1 flex flex-col min-w-0">
        <Box className="sticky top-[56px] z-20 bg-white">
          <PageHeader
            title="Doctor Management"
            breadcrumbs={[
              { label: "Dashboard", path: "/" },
              { label: "Doctor Management", active: true }
            ]}
            onBack={() => navigate(ROUTES.USERS_DOCTORS)}
          />
        </Box>

        <div className={`admin-page-content ${isMobile ? "px-3 pb-20" : "pb-20"}`}>
          {/* List Section */}
          <div className="admin-card">
            <div className={`admin-card__header flex justify-between pb-6 items-center ${isMobile ? "flex-col gap-4" : ""}`}>
              <div className="flex items-center gap-4">
                <h3 className="admin-card__title">Total Doctors: <span className="font-bold">{doctors.length}</span>
                </h3>
              </div>
              <div className={`flex items-center gap-3 ${isMobile ? "w-full" : "w-auto"}`}>
                <div className={isMobile ? "flex-1" : "w-64"}>
                  <Input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(event) => {
                      searchDoctor(event.target.value);
                    }}
                    style={isMobile ? {} : {}}
                  />
                </div>
                <Button variant="primary" onClick={openCreateForm} className="whitespace-nowrap">
                  Add Doctor
                </Button>
              </div>
            </div>

            <div className="admin-card__body">
              <div className="admin-table-container">
                <UnifiedListTable
                  columns={columns}
                  data={tableData}
                  rowsPerPage={8}
                  enablePagination
                  emptyMessage="No doctor records found"
                  actionButtons={true}
                  displayMode="table"
                  onEdit={myRole.createDoctor >= 2 ? prepareEditDoctor : undefined}
                  onDelete={myRole.createDoctor >= 4 ? (row) => handleDelete(row.id) : undefined}
                />
              </div>
            </div>

            {successMessage && (
              <div className="mt-4 admin-message admin-message--success" style={{ marginLeft: "16px", marginRight: "16px" }}>
                {successMessage}
              </div>
            )}
          </div>
        </div>

        {/* Form Modal */}
        <FormModal
          isOpen={isFormModalOpen}
          onClose={closeFormModal}
          onSubmit={handleSubmit}
          title={editMode ? "Edit Doctor" : "Add Doctor"}
          submitText={editMode ? "Update" : "Submit"}
          size="3xl"
          errorMessage={errMsg}
        >
          {/* User Role */}
          <div className="w-full md:w-1/2 mb-6">
            <FormControl>
              <FormLabel>User Role*</FormLabel>
              <Select
                value={newDoctor.role}
                onChange={(event) => {
                  newDoctorDispatch({
                    type: "role",
                    payload: event.target.value,
                  });
                }}
              >
                {roleoptions}
              </Select>
            </FormControl>
          </div>

          {/* Readings Modal Trigger */}
          {showReadingsModal && (
            <ReadingsModal
              closeModal={closeReadingsModal}
              newDoctor={newDoctor}
              newDoctorDispatch={newDoctorDispatch}
              modalType={readingsModalType}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <FormControl>
                <FormLabel>Name*</FormLabel>
                <Input
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
                />
              </FormControl>

              <FormControl>
                <FormLabel>Email*</FormLabel>
                <Input
                  type="email"
                  placeholder="Email"
                  value={newDoctor.email}
                  onChange={(event) => {
                    newDoctorDispatch({
                      type: "email",
                      payload: event.target.value,
                    });
                  }}
                />
              </FormControl>

              {newDoctor.role === "Doctor" && (
                <FormControl>
                  <FormLabel>License No*</FormLabel>
                  <Input
                    type="text"
                    placeholder="License No"
                    value={newDoctor.licenseNo}
                    onChange={(event) => {
                      newDoctorDispatch({
                        type: "licenseNo",
                        payload: event.target.value,
                      });
                    }}
                  />
                </FormControl>
              )}

              <FormControl>
                <FormLabel>Practicing At*</FormLabel>
                <Select
                  value={newDoctor.practicingAt}
                  onChange={(event) => {
                    newDoctorDispatch({
                      type: "practicingAt",
                      payload: event.target.value,
                    });
                  }}
                >
                  {practicingAtOptions}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Years Of Experience</FormLabel>
                <Input
                  type="number"
                  placeholder="Years Of Experience"
                  value={newDoctor.yearsOfExperience}
                  onChange={(event) => {
                    newDoctorDispatch({
                      type: "yearsOfExperience",
                      payload: event.target.value,
                    });
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Reference If Any</FormLabel>
                <Input
                  type="text"
                  placeholder="Reference"
                  value={newDoctor.reference}
                  onChange={(event) => {
                    newDoctorDispatch({
                      type: "reference",
                      payload: event.target.value,
                    });
                  }}
                />
              </FormControl>

              {newDoctor.role === "Medical Staff" ? (
                <FormControl>
                  <FormLabel>Resume</FormLabel>
                  <Input
                    type="file"
                    name="Resume"
                    id="file-input"
                    onChange={(event) => {
                      newDoctorDispatch({
                        type: "resume",
                        payload: event.target.files[0],
                      });
                    }}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                  />
                </FormControl>
              ) : (
                <FormControl>
                  {/* <FormLabel>Required Daily Readings</FormLabel> */}
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      setShowReadingsModal(true);
                      setReadingsModalType("daily");
                    }}
                  >
                    Select Daily Readings
                  </Button>
                </FormControl>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <FormControl>
                <FormLabel>Specialities*</FormLabel>
                {/* <Select
                        value={newDoctor.specialities}
                        isMulti
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
                      >
                        <option value="General">General</option>
                        {newDoctor.role === "Doctor"
                          ? doctorSpeciality.map((spec, index) => (
                            <option key={index} value={spec}>
                              {spec}
                            </option>
                          ))
                          : staffSpeciality.map((spec, index) => (
                            <option key={index} value={spec}>
                              {spec}
                            </option>
                          ))}
                        
                      </Select> */}


                <Select
                  onChange={(selectedOptions) => {
                    newDoctorDispatch({
                      type: "specialities",
                      payload: selectedOptions,
                    });
                  }}
                  value={newDoctor.specialities}
                  isMulti
                >
                  <option value="General">General</option>
                  {newDoctor.role === "Doctor"
                    ? doctorSpeciality.map((spec, index) => (
                      <option key={index} value={spec}>
                        {spec.label}
                      </option>
                    ))
                    : staffSpeciality.map((spec, index) => (
                      <option key={index} value={spec}>
                        {spec.label}
                      </option>
                    ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Phone No*</FormLabel>
                <Input
                  type="number"
                  placeholder="Phone No"
                  value={newDoctor.phoneNo}
                  onChange={(event) => {
                    newDoctorDispatch({
                      type: "phoneNo",
                      payload: event.target.value,
                    });
                  }}
                />
              </FormControl>

              {newDoctor.role === "Doctor" && (
                <FormControl>
                  <FormLabel>Doctors Code*</FormLabel>
                  <Input
                    type="text"
                    placeholder="Doctors Code"
                    value={newDoctor.doctorsCode}
                    onChange={(event) => {
                      newDoctorDispatch({
                        type: "doctorsCode",
                        payload: event.target.value,
                      });
                    }}
                  />
                </FormControl>
              )}

              <FormControl>
                <FormLabel isTruncated >Name of the Institute/Hospital/Clinic</FormLabel>
                <Input
                  type="text"
                  placeholder="Name of the Institute/Hospital/Clinic"
                  value={newDoctor.institute}
                  onChange={(event) => {
                    newDoctorDispatch({
                      type: "institute",
                      payload: event.target.value,
                    });
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Address</FormLabel>
                <Input
                  type="text"
                  placeholder="Address"
                  value={newDoctor.address}
                  onChange={(event) => {
                    newDoctorDispatch({
                      type: "address",
                      payload: event.target.value,
                    });
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Photo</FormLabel>
                <Input
                  type="file"
                  name="Photo"
                  id="file-input"
                  onChange={(event) => {
                    newDoctorDispatch({
                      type: "photo",
                      payload: event.target.files[0],
                    });
                  }}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                />
                {/* <FileUploadWithCamera
                        images= {newDoctor.photo ? [newDoctor.photo] : []}
                        onChange={(file) => {
                        newDoctorDispatch({
                          type: "photo",
                          payload: file,
                        });
                      }}
                      accept = "image/*"
                      multiple
                      append 
                      attachLabel = "Attach file"
                      captureLabel = "Capture image"
                      previewWidth="120"
                      previewHeight="90"
                      showCountInfo 
                      showCamera
                        
                      /> */}
              </FormControl>

              {newDoctor.role === "Doctor" && (
                <FormControl>
                  {/* <FormLabel>Required Dialysis Readings*</FormLabel> */}
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      setShowReadingsModal(true);
                      setReadingsModalType("dialysis");
                    }}
                  >
                    Select Dialysis Readings
                  </Button>
                </FormControl>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                rows={2}
                placeholder="Description"
                value={newDoctor.description}
                onChange={(event) => {
                  newDoctorDispatch({
                    type: "description",
                    payload: event.target.value,
                  });
                }}
              />
            </FormControl>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-teal-600 rounded"
                  checked={newDoctor.email_notification === "yes"}
                  onChange={(event) => {
                    newDoctorDispatch({
                      type: "email_notification",
                      payload: event.target.checked ? "yes" : "no",
                    });
                  }}
                />
                <span className="text-sm font-medium text-gray-700">Subscribe to Email Notifications</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-teal-600 rounded"
                  checked={newDoctor.dailyReadingsAlerts === "yes"}
                  onChange={(event) => {
                    newDoctorDispatch({
                      type: "dailyReadingsAlerts",
                      payload: event.target.checked ? "yes" : "no",
                    });
                  }}
                />
                <span className="text-sm font-medium text-gray-700">Daily Reading Alert</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-teal-600 rounded"
                  checked={newDoctor.Dialysis_updates === "yes"}
                  onChange={(event) => {
                    newDoctorDispatch({
                      type: "Dialysis_updates",
                      payload: event.target.checked ? "yes" : "no",
                    });
                  }}
                />
                <span className="text-sm font-medium text-gray-700">Dialysis Technician Alerts</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-teal-600 rounded"
                  checked={newDoctor.can_export === "yes"}
                  onChange={(event) => {
                    newDoctorDispatch({
                      type: "can_export",
                      payload: event.target.checked ? "yes" : "no",
                    });
                  }}
                />
                <span className="text-sm font-medium text-gray-700">Can Export patient data</span>
              </label>
            </div>
          </div>
        </FormModal>
      </Box>
    </ThemeProvider>
  );
}

export default AdminManagement;
