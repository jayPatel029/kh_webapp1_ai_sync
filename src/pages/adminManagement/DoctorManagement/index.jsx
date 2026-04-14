import React, { useEffect, useState, useReducer, useMemo } from "react";
// import Select from 'react-select';
import { practicingAtList, doctorSpeciality, staffSpeciality } from "../consts";
import { newDoctorReducer } from "../reducers";
import { REPORT_OPTIONS } from "./reportOptions";
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
  Checkbox,
  Grid,
  GridItem,
  MultiSelect,
  CheckboxMultiSelect
} from "../../../component-library";
import UnifiedListTable from "../../../components/table/UnifiedListTable";
import { useAdminToast } from "../../../components/AdminToast";
import { usePageCache, PAGE_CACHE } from "../../../cache";
import { hasEditPermission, hasDeletePermission } from "../../../helpers/permissions";
import RefreshButton from "../../../components/RefreshButton/RefreshButton";


function AdminManagement() {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const devLog = (...args) => {
    try {
      if (process && process.env && process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log(...args);
      }
    } catch (e) {
      // fallback for environments without process
      // eslint-disable-next-line no-console
      if (typeof window !== "undefined" && window.location && window.location.hostname) {
        // check common dev hosts
        const host = window.location.hostname;
        if (host === "localhost" || host === "127.0.0.1") console.log(...args);
      }
    }
  };
  const myRole = useSelector((state) => state.permission);
  const canEditDoctors = hasEditPermission(myRole, "createDoctor");
  const canDeleteDoctors = hasDeletePermission(myRole, "createDoctor");
  const { showToast, ToastContainer } = useAdminToast();
  const { fetchWithCache, mutate, refreshKey } = usePageCache(PAGE_CACHE.DOCTOR_MANAGEMENT);

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
    devLog("searchDoctor called", { keyword });
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
        devLog("fetchData: starting");
        const result = await fetchWithCache('getDoctors', () => getDoctors(), {
          transform: (apiData) => apiData?.data || [],
        });
        devLog("fetchData: result", result);
        if (result.success) {
          setDoctorsList(result.data);
          setDoctors(result.data);
          devLog("fetchData: set doctors", result.data.length, "records");
        } else {
          console.error("Failed to fetch doctors:", result.data);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchData();
  }, [successMessage, refreshKey]);

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
    reports: [],
    dialysisCenterRole: "",
    dialysisCenterRoleOther: "",
  });

  const specialitiesOptions = useMemo(() => {
    const base = newDoctor.role === "Doctor" ? doctorSpeciality : staffSpeciality;
    return [{ value: "General", label: "General" }, ...base];
  }, [newDoctor.role]);


  const [errMsg, setErrMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

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

  const getFieldErrors = (doctorData) => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!doctorData.role || typeof doctorData.role !== "string") errors.role = true;
    if (!doctorData.name || typeof doctorData.name !== "string") errors.name = true;
    if (!doctorData.email || !emailRegex.test(doctorData.email)) errors.email = true;
    if (!doctorData.specialities || doctorData.specialities.length <= 0) errors.specialities = true;
    if (!phoneRegex.test(doctorData.phoneNo)) errors.phoneNo = true;

    if (doctorData.role === "Doctor") {
      if (!doctorData.licenseNo || typeof doctorData.licenseNo !== "string") errors.licenseNo = true;
      if (!doctorData.doctorsCode || typeof doctorData.doctorsCode !== "string") errors.doctorsCode = true;
      if (!doctorData.practicingAt || typeof doctorData.practicingAt !== "string") errors.practicingAt = true;
    } else {
      // for other roles ensure practicingAt exists
      if (!doctorData.practicingAt || typeof doctorData.practicingAt !== "string") errors.practicingAt = true;
    }

    if (doctorData.role === "Dialysis Technician") {
      if (!doctorData.dialysisCenterRole || typeof doctorData.dialysisCenterRole !== "string") errors.dialysisCenterRole = true;
      if (doctorData.dialysisCenterRole === "Other" && (!doctorData.dialysisCenterRoleOther || doctorData.dialysisCenterRoleOther.trim() === "")) errors.dialysisCenterRoleOther = true;
    }

    return errors;
  };


  const getFileRes = async (file) => {
    try {
      devLog("getFileRes called", { file });
      if (file) {
        let formData = new FormData();
        formData.append("file", file, file?.name);
        const fileRes = await uploadFile(formData);
        devLog("getFileRes response", fileRes);
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
    try {
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
          reports: newDoctor.reports,
          changeby: localStorage.getItem("email"),
          doctorid: newDoctor.id,
        };
        console.log("ipdating with,", payload.dailyReadings);
        if (!editMode) {
          const response = await mutate(() => registerDoctor(payload));
          if (response.success) {
            setErrMsg("");
            setSuccessMessage("Registration Successful!");
            showToast("Doctor registered successfully!", "success");
            clearDoctorFields();
            setIsFormModalOpen(false);
          } else {
            setErrMsg("Registration Error! " + response.data);
            setSuccessMessage("");
          }
        } else {
          const response = await mutate(() => updateDoctor(newDoctor.id, payload));
          if (response.success) {
            setErrMsg("");
            setSuccessMessage("Update Successful!");
            showToast("Doctor updated successfully!", "success");
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
          reports: newDoctor.reports,
          changeby: localStorage.getItem("email"),
          doctorid: newDoctor.id,
        };
        console.log("docs payload", payload);
        if (!editMode) {
          const response = await mutate(() => registerDoctor(payload));
          if (response.success) {
            setErrMsg("");
            setSuccessMessage("Registration Successful!");
            showToast("Medical Staff registered successfully!", "success");
            clearDoctorFields();
            setIsFormModalOpen(false);
          } else {
            setErrMsg("Registration Error! " + response.data);
            setSuccessMessage("");
          }
        } else {
          const response = await mutate(() => updateDoctor(newDoctor.id, payload));
          if (response.success) {
            setErrMsg("");
            setSuccessMessage("Update Successful!");
            showToast("Medical Staff updated successfully!", "success");
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
          dialysisCenterRole: newDoctor.dialysisCenterRole,
          dialysisCenterRoleOther: newDoctor.dialysisCenterRoleOther,
          email_notification: newDoctor.email_notification,
          specialities: newDoctor.specialities,
          can_export: newDoctor.can_export,
          dailyReadings: newDoctor.dailyReadings,
          dialysisReadings: newDoctor.dialysisReadings,
          reports: newDoctor.reports,
          changeby: localStorage.getItem("email"),
          doctorid: newDoctor.id,
        };

        console.log("Dialysis Technician payload", payload);
        const response = editMode
          ? await mutate(() => updateDoctor(newDoctor.id, payload))
          : await mutate(() => registerDoctor(payload));

        if (response.success) {
          setErrMsg("");
          setSuccessMessage(editMode ? "Update Successful!" : "Registration Successful!");
          showToast(editMode ? "Technician updated successfully!" : "Technician registered successfully!", "success");
          clearDoctorFields();
          setIsFormModalOpen(false);
        } else {
          setErrMsg((editMode ? "Update Error! " : "Registration Error! ") + response.data);
          setSuccessMessage("");
          setErrMsg("Please fill all the * fields correctly!");
        }
      } else {
        // Validation failed — highlight the invalid fields
        const errors = getFieldErrors(newDoctor);
        setFieldErrors(errors);
        setSuccessMessage("");
        setErrMsg("Please fill all the * fields correctly!");
        return;
      }
    } catch (error) {
      console.error("Error in submission:", error);
      const msg = error?.message || "An unexpected error occurred. Please try again.";
      const displayMsg = msg.includes("Network") ? "Network error — please check your connection." : msg;
      setErrMsg(displayMsg);
      setSuccessMessage("");
    }


  };

  async function handleDelete(id) {
    try {
      devLog("handleDelete called", { id });
      // Display a confirmation dialog
      const confirmed = window.confirm(
        "Are you sure you want to delete this doctor?"
      );

      if (!confirmed) {
        return; // If the user cancels, exit the function
      }

      setErrMsg("");
      setSuccessMessage("Deleting Data");
      const response = await mutate(() => deleteDoctor(id));
      devLog("handleDelete response", response);
      if (response.success) {
        setSuccessMessage("Delete Successful!");
        showToast("Doctor deleted successfully!", "success");
      } else {
        setErrMsg(
          "Delete Error! (Please delete this doctor from the patients list for all the assigned patients before deleting it permantly!)");
        setSuccessMessage("");
      }
    } catch (error) {
      console.error("Error deleting doctor:", error);
      devLog("handleDelete caught error", error);
    }
  }

  const clearDoctorFields = () => {
    newDoctorDispatch({
      type: "all",
      payload: {
        practicingAt: practicingAtList[0],
        role: "Doctor",
        dialysisCenterRole: "",
        dialysisCenterRoleOther: "",
      }
    });
    setEditMode(false);
    setErrMsg("");
    setFieldErrors({});
    devLog("clearDoctorFields executed");
  };

  const prepareEditDoctor = (doctor) => {
    setSuccessMessage("");
    setFieldErrors({});
    devLog("prepareEditDoctor called", doctor);
    newDoctorDispatch({
      type: "all",
      payload: {
        id: doctor.id,
        name: doctor.name,
        specialities: Array.isArray(doctor.specialities) ? doctor.specialities : [],
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
            reports: Array.isArray(doctor.reports) ? doctor.reports : [],
            dialysisCenterRole:
              doctor["dialysis center role"] ||
              doctor.dialysisCenterRole ||
              doctor.dialysis_center_role ||
              doctor.role_in_dialysis_center ||
              doctor.dialysisRole ||
              doctor.roleInDialysis ||
              "",
            dialysisCenterRoleOther:
              doctor.dialysisCenterRoleOther ||
              doctor.dialysis_center_role_other ||
              doctor.dialysisRoleOther ||
              "",
      },
    });
    setEditMode(true);
    setIsFormModalOpen(true);
  };

  const openCreateForm = () => {
    setSuccessMessage("");
    clearDoctorFields();
    setIsFormModalOpen(true);
    devLog("openCreateForm called");
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
            rightAction={<RefreshButton pageName={PAGE_CACHE.DOCTOR_MANAGEMENT.name} />}
          />
        </Box>

        <div className={`admin-page-content ${isMobile ? "px-3 pb-20" : "pb-20"}`}>
          {/* List Section */}
          <div className="admin-card">
            <div className={`admin-card__header flex justify-between mb-6 items-center ${isMobile ? "flex-col gap-4" : ""}`}>
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
                { canEditDoctors && (
                  <Button variant="primary" onClick={openCreateForm} className="whitespace-nowrap">
                    Add Doctor
                  </Button>
                )}
              </div>
            </div>

            <div className="admin-card__body">
              <div className="admin-table-container">
                <UnifiedListTable
                  columns={columns}
                  data={tableData}
                  rowsPerPage={8}
                  emptyMessage="No doctor records found"
                  actionButtons={true}
                  displayMode="table"
                  onEdit={canEditDoctors ? prepareEditDoctor : undefined}
                  onDelete={canDeleteDoctors ? (row) => handleDelete(row.id) : undefined}
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
          fieldErrors={fieldErrors}
          onFieldErrorClear={(field) => setFieldErrors((prev) => ({ ...prev, [field]: false }))}
        >
          {/* User Role */}
          <Box className="w-full md:w-1/2 mb-4 flex flex-row gap-8">
            <Box className="flex-1">
              <FormControl isInvalid={Boolean(fieldErrors.role)}>
                <FormLabel>User Role<span className="text-red-500">*</span></FormLabel>
                <Select
                  value={newDoctor.role}
                  isInvalid={Boolean(fieldErrors.role)}
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
            </Box>
            <Box className="flex-1">
              <FormControl>
                <FormLabel>Qualification</FormLabel>
                <Textarea
                  rows={1}
                  placeholder="Qualification"
                  value={newDoctor.description}
                  onChange={(event) => {
                    newDoctorDispatch({
                      type: "description",
                      payload: event.target.value,
                    });
                  }}
                />
              </FormControl>

              
              

            </Box>
            
          </Box>

          {newDoctor.role === "Dialysis Technician" && (
            <Box>
              <FormControl isInvalid={Boolean(fieldErrors.dialysisCenterRole)} className="mb-4">
                <FormLabel>Role in Dialysis Center<span className="text-red-500">*</span></FormLabel>
                <Select
                  value={newDoctor.dialysisCenterRole}
                  isInvalid={Boolean(fieldErrors.dialysisCenterRole)}
                  onChange={(event) => {
                    newDoctorDispatch({
                      type: "dialysisCenterRole",
                      payload: event.target.value,
                    });
                    setFieldErrors((prev) => ({ ...prev, dialysisCenterRole: false }));
                  }}
                >
                  <option value="">Select role</option>
                  <option value="Manager">Manager</option>
                  <option value="Technician">Technician</option>
                  <option value="Frontdesk">Frontdesk</option>
                  <option value="Other">Other</option>
                </Select>
              </FormControl>

              {newDoctor.dialysisCenterRole === "Other" && (
                <Box className="mt-6 mb-4">
                  <FormControl>
                    <FormLabel>Please specify</FormLabel>
                    <Input
                      type="text"
                      placeholder="Specify role"
                      value={newDoctor.dialysisCenterRoleOther}
                      onChange={(event) => {
                        newDoctorDispatch({
                          type: "dialysisCenterRoleOther",
                          payload: event.target.value,
                        });
                        setFieldErrors((prev) => ({ ...prev, dialysisCenterRoleOther: false }));
                      }}
                    />
                  </FormControl>
                </Box>
              )}
            </Box>
          )}
          
          {/* Readings Modal Trigger */}
          {showReadingsModal && (
            <ReadingsModal
              closeModal={closeReadingsModal}
              newDoctor={newDoctor}
              newDoctorDispatch={newDoctorDispatch}
              modalType={readingsModalType}
            />
          )}

          <Box className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            {/* <Box className=""> */}
            <Box>
              <FormControl isInvalid={Boolean(fieldErrors.name)}>
                <FormLabel>Name<span className="text-red-500">*</span></FormLabel>
                <Input
                  type="text"
                  placeholder="Name"
                  value={newDoctor.name}
                  isInvalid={Boolean(fieldErrors.name)}
                  onChange={(event) => {
                    const nameArr = event.target.value.split(" ");
                    newDoctorDispatch({
                      type: "name",
                      payload: event.target.value,
                    });
                    setFieldErrors((prev) => ({ ...prev, name: false }));
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
            </Box>

            <Box>
              <FormControl isInvalid={Boolean(fieldErrors.email)}>
                <FormLabel>Email<span className="text-red-500">*</span></FormLabel>
                <Input
                  type="email"
                  placeholder="Email"
                  value={newDoctor.email}
                  isInvalid={Boolean(fieldErrors.email)}
                  onChange={(event) => {
                    newDoctorDispatch({
                      type: "email",
                      payload: event.target.value,
                    });
                    setFieldErrors((prev) => ({ ...prev, email: false }));
                  }}
                />
              </FormControl>
            </Box>

            {newDoctor.role === "Doctor" && (
              <Box>
                <FormControl isInvalid={Boolean(fieldErrors.licenseNo)}>
                  <FormLabel>License No<span className="text-red-500">*</span></FormLabel>
                  <Input
                    type="text"
                    placeholder="License No"
                    value={newDoctor.licenseNo}
                    isInvalid={Boolean(fieldErrors.licenseNo)}
                    onChange={(event) => {
                      newDoctorDispatch({
                        type: "licenseNo",
                        payload: event.target.value,
                      });
                      setFieldErrors((prev) => ({ ...prev, licenseNo: false }));
                    }}
                  />
                </FormControl>
              </Box>
            )}

            <Box>
              <FormControl>
                <FormLabel>Practicing At<span className="text-red-500">*</span></FormLabel>
                <Select
                  value={newDoctor.practicingAt}
                  isInvalid={Boolean(fieldErrors.practicingAt)}
                  onChange={(event) => {
                    newDoctorDispatch({
                      type: "practicingAt",
                      payload: event.target.value,
                    });
                    setFieldErrors((prev) => ({ ...prev, practicingAt: false }));
                  }}
                >
                  {practicingAtOptions}
                </Select>
              </FormControl>
            </Box>

            <Box>
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
                    setFieldErrors((prev) => ({ ...prev, yearsOfExperience: false }));
                  }}
                />
              </FormControl>
            </Box>

            <Box>
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
                    setFieldErrors((prev) => ({ ...prev, reference: false }));
                  }}
                />
              </FormControl>
            </Box>

            {/* </Box> */}

            {/* Right Column */}
            {/* <Box className="space-y-4"> */}
            <Box>
              <FormControl isInvalid={Boolean(fieldErrors.specialities)}>
                <FormLabel>Specialities<span className="text-red-500">*</span></FormLabel>
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


                {/* <Select
                  value={newDoctor.specialities}
                  isMulti
                  className={fieldErrors.specialities ? "border border-red-500" : ""}
                  onChange={(event) => {
                    // native <select multiple> gives selectedOptions collection
                    const vals = Array.from(event.target.selectedOptions).map(
                      (opt) => opt.value
                    );
                    newDoctorDispatch({ type: "specialities", payload: vals });
                    setFieldErrors((prev) => ({ ...prev, specialities: false }));
                  }}
                >
                  {specialitiesOptions.map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select> */}

                <MultiSelect
                  value={newDoctor.specialities}
                  onChange={(vals) => {
                    newDoctorDispatch({ type: "specialities", payload: vals });
                    setFieldErrors((prev) => ({ ...prev, specialities: false }));
                  }}
                  isInvalid={Boolean(fieldErrors.specialities)}
                >
                  {specialitiesOptions.map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </MultiSelect>
              </FormControl>
            </Box>

            <Box>
              <FormControl isInvalid={Boolean(fieldErrors.phoneNo)}>
                <FormLabel>Phone No<span className="text-red-500">*</span></FormLabel>
                <Input
                  type="number"
                  placeholder="Phone No"
                  value={newDoctor.phoneNo}
                  isInvalid={Boolean(fieldErrors.phoneNo)}
                  onChange={(event) => {
                    newDoctorDispatch({
                      type: "phoneNo",
                      payload: event.target.value,
                    });
                    setFieldErrors((prev) => ({ ...prev, phoneNo: false }));
                  }}
                />
              </FormControl>
            </Box>

            {newDoctor.role === "Doctor" && (
              <Box>
                <FormControl isInvalid={Boolean(fieldErrors.doctorsCode)}>
                  <FormLabel>Doctors Code<span className="text-red-500">*</span></FormLabel>
                  <Input
                    type="text"
                    placeholder="Doctors Code"
                    value={newDoctor.doctorsCode}
                    isInvalid={Boolean(fieldErrors.doctorsCode)}
                    onChange={(event) => {
                      newDoctorDispatch({
                        type: "doctorsCode",
                        payload: event.target.value,
                      });
                      setFieldErrors((prev) => ({ ...prev, doctorsCode: false }));
                    }}
                  />
                </FormControl>
              </Box>
            )}

            <Box>
              <FormControl>
                <FormLabel isTruncated >Institute/Hospital/Clinic</FormLabel>
                <Input
                  type="text"
                  placeholder="Institute/Hospital/Clinic"
                  value={newDoctor.institute}
                  onChange={(event) => {
                    newDoctorDispatch({
                      type: "institute",
                      payload: event.target.value,
                    });
                    setFieldErrors((prev) => ({ ...prev, institute: false }));
                  }}
                />
              </FormControl>
            </Box>

            <Box>
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
                    setFieldErrors((prev) => ({ ...prev, address: false }));
                  }}
                />
              </FormControl>
            </Box>

            <Box>
              <FormControl>
                <FormLabel>Photo</FormLabel>
                <Input
                  type="file"
                  name="Photo"
                  id="file-input"
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                  onChange={(event) => {
                    newDoctorDispatch({
                      type: "photo",
                      payload: event.target.files[0],
                    });
                    setFieldErrors((prev) => ({ ...prev, photo: false }));
                  }}
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
            </Box>

            {newDoctor.role === "Medical Staff" ? (
              <Box>
                <FormControl>
                  <FormLabel>Resume</FormLabel>
                  <Input
                    type="file"
                    name="Resume"
                    id="file-input"
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                    onChange={(event) => {
                      newDoctorDispatch({
                        type: "resume",
                        payload: event.target.files[0],
                      });
                      setFieldErrors((prev) => ({ ...prev, resume: false }));
                    }}
                  />
                </FormControl>
              </Box>
            ) : (
              <Box>
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
              </Box>
            )}

            {newDoctor.role === "Doctor" && (
              <Box>
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
              </Box>
            )}

            
            {/* </Box> */}
          </Box>

          {/* Reports Section */}
          <Box className="mt-6">
            <FormControl>
              <FormLabel>Reports Access</FormLabel>
              <CheckboxMultiSelect
                value={newDoctor.reports}
                onChange={(reports) => {
                  newDoctorDispatch({
                    type: "reports",
                    payload: reports,
                  });
                }}
                options={REPORT_OPTIONS}
                maxHeight="150px"
                showSelected={true}
              />
            </FormControl>
          </Box>

          <Box className="mt-6">
            <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={8}>
              <GridItem>
                <FormControl>
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
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl>
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
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl>
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
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl>
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
                </FormControl>
              </GridItem>
            </Grid>
          </Box>
        </FormModal>
        <ToastContainer />
      </Box>
    </ThemeProvider>
  );
}

export default AdminManagement;
