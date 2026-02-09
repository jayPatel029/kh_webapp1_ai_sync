/**
 * Manage Parameters Page - Redesigned
 * Following Figma design with component library and design system
 * 
 * @file src/pages/ManageParameters/ManageParameters.jsx
 */

import React, { useState, useEffect, useLayoutEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Select from "react-select";

// Component Library
import {
  Box,
  Flex,
  Container,
  Stack,
} from "../../component-library";
import { Button } from "../../component-library/primitives/Button";
import { Input } from "../../component-library/primitives/Input";

// Components
import Sidebar from "../../components/sidebar/Sidebar";
import SideBarDoctor from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import PageHeader from "../../components/PageHeader";
import PatientNavTabs from "../../components/PatientNavTabs";
import ThemeProvider from "../../components/ThemeProvider";

// APIs
import { getAilments } from "../../ApiCalls/ailmentApis";
import {
  addReading,
  getAllUserReadingsByPid,
} from "../../ApiCalls/manageparameters";
import {
  deleteDailyReading,
  deleteDialysisReading,
  updateDailyReading,
  updateDialysisReading,
} from "../../ApiCalls/readingsApis";
import { getAllChatsAdmin } from "../../ApiCalls/chatApis";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";

// Icons
import { BsTrash, BsPencilSquare } from "react-icons/bs";

// Import design system styles
import "../../design-system/styles/index.css";

function ManageParameters() {
  const [parameterData, setParameterData] = useState(null);
  const [showRangeInputs, setShowRangeInputs] = useState(false);
  const [graphOption, setGraphOption] = useState(false);
  const [selectedAilments, setSelectedAilments] = useState();
  const [selectTitle, setSelectTitle] = useState("");
  const [isParamDisabled, setIsParamDisabled] = useState(false);
  const [selectParameterType, setSelectedParameterType] = useState("");
  const [selectReadingType, setSelectedReadingType] = useState("");
  const [highRange, setHighRange] = useState(null);
  const [lowRange, setLowRange] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [errMsg, setErrMsg] = useState({});
  const [ailmentOptions, setAilmentOptions] = useState([]);
  const [ailments, setAilments] = useState([]);
  const [userData, setUserData] = useState({});
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [totalUnreadCountDoc, setTotalUnreadCountDoc] = useState(0);

  const { pid } = useParams();
  const navigate = useNavigate();
  const role = useSelector((state) => state.permission);

  const parameterTypes = [
    { value: "General", label: "General" },
    { value: "Dialysis", label: "Dialysis" },
  ];

  const specialReadingTypes = [
    { value: "Numeric", label: "Numeric" },
    { value: "Text", label: "Text" },
    { value: "Date", label: "Date" },
    { value: "Yes/No", label: "Yes/No" },
  ];

  useEffect(() => {
    if (selectReadingType === "Numeric") {
      setShowRangeInputs(true);
    } else {
      setShowRangeInputs(false);
    }
  }, [selectReadingType]);

  useLayoutEffect(() => {
    getAilments().then((resultAilment) => {
      if (resultAilment.success && resultAilment.data.listOfAilments) {
        setAilmentOptions(resultAilment.data.listOfAilments);
      } else {
        console.error("Failed to fetch Ailments:", resultAilment.data);
      }
    });
  }, []);

  async function getParameterData() {
    getAllUserReadingsByPid(pid).then((response) => {
      if (response.success) {
        setParameterData(response.data);
      } else {
        console.error("Failed to fetch parameter data:", response.data);
      }
    });
  }

  const fetchPatientData = async () => {
    try {
      const response = await axiosInstance.get(`${server_url}/patient/getPatient/${pid}`);
      setUserData(response.data.data);
    } catch (error) {
      console.error("Error fetching patient data:", error);
    }
  };

  useEffect(() => {
    const getUnreadMessagesFromAdmin = async () => {
      try {
        const chatResult = await getAllChatsAdmin(pid);
        if (chatResult.success) {
          const unreadMsgs = chatResult.data.filter((chat) => chat.unreadCount > 0);
          setTotalUnreadCount(unreadMsgs.reduce((acc, chat) => acc + chat.unreadCount, 0));
        }
      } catch (error) {
        console.error("Error fetching unread messages from admin:", error);
      }
    };
    getUnreadMessagesFromAdmin();
  }, [pid]);

  useEffect(() => {
    getParameterData();
    fetchPatientData();
  }, [errMsg, pid]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        getAilments().then((resultAilment) => {
          if (resultAilment.success && resultAilment.data.listOfAilments) {
            setAilments(resultAilment.data.listOfAilments);
          } else {
            console.error("Failed to fetch Ailments:", resultAilment);
          }
        });
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchData();
  }, []);

  function clearAllFields() {
    setSelectTitle("");
    setSelectedParameterType("");
    setSelectedReadingType("");
    setHighRange(null);
    setLowRange(null);
    setGraphOption(false);
    setSelectedAilments({});
    setIsParamDisabled(false);
    setEditMode(false);
    setEditId(null);
  }

  const handleSubmit = async () => {
    try {
      var ailments = await selectedAilments.map((ailment) => ailment.value);
      const newData = {
        id: pid,
        title: selectTitle,
        parameterType: selectParameterType,
        type: selectReadingType,
        readingType: selectReadingType,
        isGraph: graphOption ? 1 : 0,
        ailments: ailments,
        ailmentID: selectedAilments.value,
        assign_range: selectReadingType === "Numeric" ? "Yes" : "No",
        low_range: lowRange,
        high_range: highRange,
      };

      if (editMode) {
        var ailments = await selectedAilments.map((ailment) => ailment.value);
        const updateData = {
          id: editId,
          title: selectTitle,
          parameterType: selectParameterType,
          ailments: ailments,
          type: selectReadingType,
          readingType: selectReadingType,
          isGraph: graphOption ? 1 : 0,
          ailmentID: selectedAilments.value,
          assign_range: selectReadingType === "Numeric" ? "Yes" : "No",
          low_range: lowRange,
          high_range: highRange,
        };
        if (selectParameterType === "General") {
          updateDailyReading(updateData).then((response) => {
            if (response.success) {
              console.log("Reading updated successfully:", response.data);
              getParameterData();
              clearAllFields();
              setErrMsg({
                type: "success",
                msg: "Updated Successfully",
              });
            } else {
              console.error("Failed to update reading:", response.data);
            }
          });
        } else {
          updateDialysisReading(updateData).then((response) => {
            if (response.success) {
              console.log("Reading updated successfully:", response.data);
              getParameterData();
              clearAllFields();
              setErrMsg({
                type: "success",
                msg: "Updated Successfully",
              });
            } else {
              console.error("Failed to update reading:", response.data);
            }
          });
        }
      } else {
        addReading(newData).then((response) => {
          if (response.success) {
            console.log("Reading added successfully:", response.data);
            clearAllFields();
            getParameterData();
          } else {
            console.error("Failed to add reading:", response.data);
          }
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ThemeProvider>
      <Box className="flex min-h-screen">
        <Box className="flex-shrink-0">
          {role?.role_name === "Doctor" ? <SideBarDoctor /> : <Sidebar />}
        </Box>

        <Box className="flex-1 flex flex-col min-w-0">
          <Navbar />

          {/* Sticky Header Section */}
          <Box className="sticky top-[56px] z-20 bg-white border-b border-gray-200">
            <Container className="py-4 px-4 md:px-6 max-w-[1440px] mx-auto">
              {/* Header with Breadcrumbs */}
              <PageHeader
                title="Manage Parameters"
                breadcrumbs={[
                  { label: "All Patients", path: "/patient" },
                  { label: "Patient", path: `/userProfile/${pid}`, active: false },
                  { label: "Manage Parameters", active: true }
                ]}
                onBack={() => navigate(`/userProfile/${pid}`)}
              />
            </Container>

            {/* Navigation Tabs */}
            <PatientNavTabs
              patientId={pid}
              userData={userData}
              unreadAdminCount={totalUnreadCount}
              unreadDoctorCount={totalUnreadCountDoc}
              role={role}
            />
          </Box>

          {/* Main Content */}
          <Box className="flex-1 bg-[#fafafa]">
            <Container className="py-8 px-4 md:px-12 max-w-[1440px] mx-auto">
              {/* Add/Edit Parameter Form */}
              <Box className="bg-white rounded-[15px] shadow-md p-8 mb-6">
                <Flex justify="between" align="center" className="pb-4 border-b border-gray-200 mb-6">
                  <h2 className="text-[18px] font-bold text-[#393939]">
                    {editMode ? "Edit Parameter" : "Add New Parameter"}
                  </h2>
                  <Flex align="center" gap={3}>
                    <Box className="flex items-center gap-2">
                      <Box className="w-[30px] h-[30px] rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-semibold text-gray-700">
                          {userData?.name?.charAt(0)?.toUpperCase() || "P"}
                        </span>
                      </Box>
                      <span className="text-[18px] text-[#393939]">{userData?.name || "Patient"}</span>
                    </Box>
                  </Flex>
                </Flex>

                <Stack spacing={4}>
                  {/* Parameter Name */}
                  <Box>
                    <label className="block text-[14px] font-semibold text-[#393939] mb-2">
                      Parameter Name *
                    </label>
                    <Input
                      type="text"
                      value={selectTitle}
                      onChange={(e) => setSelectTitle(e.target.value)}
                      className="w-full h-[50px] px-4 rounded-[10px] border border-gray-300 text-[16px] focus:outline-none focus:border-[#4164df]"
                      placeholder="Enter parameter name"
                    />
                  </Box>

                  {/* Parameter Type */}
                  <Box>
                    <label className="block text-[14px] font-semibold text-[#393939] mb-2">
                      Parameter Type *
                    </label>
                    <select
                      value={selectParameterType}
                      onChange={(e) => setSelectedParameterType(e.target.value)}
                      className="w-full h-[50px] px-4 rounded-[10px] border border-gray-300 text-[16px] focus:outline-none focus:border-[#4164df] bg-white"
                      disabled={isParamDisabled}
                    >
                      <option value="">Select Parameter Type</option>
                      {parameterTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </Box>

                  {/* Special Reading Type */}
                  <Box>
                    <label className="block text-[14px] font-semibold text-[#393939] mb-2">
                      Special Reading Type *
                    </label>
                    <select
                      value={selectReadingType}
                      onChange={(e) => setSelectedReadingType(e.target.value)}
                      className="w-full h-[50px] px-4 rounded-[10px] border border-gray-300 text-[16px] focus:outline-none focus:border-[#4164df] bg-white"
                    >
                      <option value="">Select Special Reading Type</option>
                      {specialReadingTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </Box>

                  {/* Range Inputs (conditional) */}
                  {showRangeInputs && (
                    <Flex gap={4}>
                      <Box className="flex-1">
                        <label className="block text-[14px] font-semibold text-[#393939] mb-2">
                          Low Range
                        </label>
                        <Input
                          type="text"
                          value={lowRange || ""}
                          onChange={(e) => setLowRange(e.target.value)}
                          className="w-full h-[50px] px-4 rounded-[10px] border border-gray-300 text-[16px] focus:outline-none focus:border-[#4164df]"
                          placeholder="Enter low range"
                        />
                      </Box>
                      <Box className="flex-1">
                        <label className="block text-[14px] font-semibold text-[#393939] mb-2">
                          High Range
                        </label>
                        <Input
                          type="text"
                          value={highRange || ""}
                          onChange={(e) => setHighRange(e.target.value)}
                          className="w-full h-[50px] px-4 rounded-[10px] border border-gray-300 text-[16px] focus:outline-none focus:border-[#4164df]"
                          placeholder="Enter high range"
                        />
                      </Box>
                    </Flex>
                  )}

                  {/* Graph Option */}
                  <Box>
                    <label className="block text-[14px] font-semibold text-[#393939] mb-2">
                      Graph (Yes/No)
                    </label>
                    <select
                      value={graphOption ? "Yes" : "No"}
                      onChange={(e) => setGraphOption(e.target.value === "Yes")}
                      className="w-full h-[50px] px-4 rounded-[10px] border border-gray-300 text-[16px] focus:outline-none focus:border-[#4164df] bg-white"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </Box>

                  {/* Ailments */}
                  <Box>
                    <label className="block text-[14px] font-semibold text-[#393939] mb-2">
                      Ailments
                    </label>
                    <Select
                      value={selectedAilments}
                      isMulti
                      options={ailments.map((ailment) => ({
                        value: ailment.id,
                        label: ailment.name,
                      }))}
                      styles={{
                        control: (baseStyles, state) => ({
                          ...baseStyles,
                          borderColor: state.isFocused ? "#4164df" : "rgb(209 213 219)",
                          outlineColor: state.isFocused ? "#4164df" : "rgb(209 213 219)",
                          borderRadius: "10px",
                          minHeight: "50px",
                          fontSize: "16px",
                        }),
                      }}
                      onChange={(selectedOptions) => {
                        setSelectedAilments(selectedOptions);
                      }}
                    />
                  </Box>

                  {/* Action Buttons */}
                  <Flex gap={3} className="pt-4">
                    <Button
                      variant="solid"
                      onClick={handleSubmit}
                      className="h-[50px] px-8 rounded-[10px] bg-[#4164df] text-white text-[16px] font-semibold hover:bg-[#3451c9]"
                    >
                      {editMode ? "UPDATE" : "SUBMIT"}
                    </Button>
                    {editMode && (
                      <Button
                        variant="outline"
                        onClick={clearAllFields}
                        className="h-[50px] px-8 rounded-[10px] border-2 border-gray-300 text-gray-700 text-[16px] font-semibold hover:bg-gray-50"
                      >
                        CANCEL
                      </Button>
                    )}
                  </Flex>
                </Stack>
              </Box>

              {/* Parameters List */}
              <Box className="bg-white rounded-[15px] shadow-md p-8">
                <h2 className="text-[18px] font-bold text-[#393939] pb-4 border-b border-gray-200 mb-6">
                  Existing Parameters
                </h2>

                {/* Table */}
                <Box className="overflow-x-auto">
                  {/* Table Header */}
                  <Box className="bg-[#5886a5] rounded-[5px] px-[70px] py-4 mb-0">
                    <Flex justify="between" align="center" className="text-white text-[16px] font-semibold">
                      <Box style={{ flex: "0 0 200px" }}>Parameter Name</Box>
                      <Box style={{ flex: "0 0 150px" }}>Parameter Type</Box>
                      <Box style={{ flex: "0 0 150px" }}>Reading Type</Box>
                      <Box style={{ flex: "0 0 100px", textAlign: "center" }}>Graph</Box>
                      <Box style={{ flex: "0 0 100px", textAlign: "center" }}>Actions</Box>
                    </Flex>
                  </Box>

                  {/* Table Body */}
                  <Box>
                    {/* Daily Parameters */}
                    {parameterData?.daily && parameterData.daily.length > 0 ? (
                      parameterData.daily.map((data, index) => (
                        <Box
                          key={`daily-${index}`}
                          className="bg-white border-b border-gray-100 px-[70px] py-5 hover:bg-gray-50 transition-colors"
                        >
                          <Flex justify="between" align="center">
                            <Box style={{ flex: "0 0 200px" }} className="text-[16px] font-semibold text-[#989898]">
                              {data.title}
                            </Box>
                            <Box style={{ flex: "0 0 150px" }} className="text-[16px] font-semibold text-[#989898]">
                              General
                            </Box>
                            <Box style={{ flex: "0 0 150px" }} className="text-[16px] font-semibold text-[#989898]">
                              {data.type}
                            </Box>
                            <Box style={{ flex: "0 0 100px", textAlign: "center" }} className="text-[16px] font-semibold text-[#989898]">
                              {data.isGraph ? "Yes" : "No"}
                            </Box>
                            <Box style={{ flex: "0 0 100px" }} className="flex justify-center gap-3">
                              <button
                                className="text-[#5886a5] hover:text-[#4164df] transition-colors"
                                onClick={() => {
                                  setEditMode(true);
                                  setEditId(data.id);
                                  setSelectedParameterType("General");
                                  setSelectedAilments(
                                    data.daily_reading_ailments?.map((ailment) => ({
                                      value: ailment.ailmentID,
                                      label: ailmentOptions.find(
                                        (ailmentOption) => ailmentOption.id === ailment.ailmentID,
                                      )?.name,
                                    })) || []
                                  );
                                  setSelectTitle(data.title);
                                  setSelectedReadingType(data.type);
                                  setHighRange(data.high_range);
                                  setLowRange(data.low_range);
                                  setGraphOption(data.isGraph === 1);
                                  setIsParamDisabled(true);
                                  setErrMsg({
                                    type: "success",
                                    msg: "",
                                  });
                                  // Scroll to top
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                              >
                                <BsPencilSquare size={20} />
                              </button>
                              <button
                                className="text-[#de425b] hover:text-[#c93850] transition-colors"
                                onClick={async () => {
                                  const isConfirmed = window.confirm(
                                    "Are you sure you want to delete this parameter?"
                                  );
                                  if (isConfirmed) {
                                    try {
                                      await deleteDailyReading(data.id);
                                      setErrMsg({
                                        type: "success",
                                        msg: "Deleted Successfully",
                                      });
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }
                                }}
                              >
                                <BsTrash size={20} />
                              </button>
                            </Box>
                          </Flex>
                        </Box>
                      ))
                    ) : null}

                    {/* Dialysis Parameters */}
                    {parameterData?.dialysis && parameterData.dialysis.length > 0 ? (
                      parameterData.dialysis.map((data, index) => (
                        <Box
                          key={`dialysis-${index}`}
                          className="bg-white border-b border-gray-100 px-[70px] py-5 hover:bg-gray-50 transition-colors"
                        >
                          <Flex justify="between" align="center">
                            <Box style={{ flex: "0 0 200px" }} className="text-[16px] font-semibold text-[#989898]">
                              {data.title}
                            </Box>
                            <Box style={{ flex: "0 0 150px" }} className="text-[16px] font-semibold text-[#989898]">
                              Dialysis
                            </Box>
                            <Box style={{ flex: "0 0 150px" }} className="text-[16px] font-semibold text-[#989898]">
                              {data.type}
                            </Box>
                            <Box style={{ flex: "0 0 100px", textAlign: "center" }} className="text-[16px] font-semibold text-[#989898]">
                              {data.isGraph ? "Yes" : "No"}
                            </Box>
                            <Box style={{ flex: "0 0 100px" }} className="flex justify-center gap-3">
                              <button
                                className="text-[#5886a5] hover:text-[#4164df] transition-colors"
                                onClick={() => {
                                  setEditMode(true);
                                  setEditId(data.id);
                                  setSelectedParameterType("Dialysis");
                                  setSelectedAilments(
                                    data.dialysis_reading_ailments?.map((ailment) => ({
                                      value: ailment.ailmentID,
                                      label: ailmentOptions.find(
                                        (ailmentOption) => ailmentOption.id === ailment.ailmentID,
                                      )?.name,
                                    })) || []
                                  );
                                  setSelectTitle(data.title);
                                  setSelectedReadingType(data.type);
                                  setHighRange(data.high_range);
                                  setLowRange(data.low_range);
                                  setGraphOption(data.isGraph === 1);
                                  setIsParamDisabled(true);
                                  setErrMsg({
                                    type: "success",
                                    msg: "",
                                  });
                                  // Scroll to top
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                              >
                                <BsPencilSquare size={20} />
                              </button>
                              <button
                                className="text-[#de425b] hover:text-[#c93850] transition-colors"
                                onClick={async () => {
                                  const isConfirmed = window.confirm(
                                    "Are you sure you want to delete this parameter?"
                                  );
                                  if (isConfirmed) {
                                    try {
                                      await deleteDialysisReading(data.id);
                                      setErrMsg({
                                        type: "success",
                                        msg: "Deleted Successfully",
                                      });
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }
                                }}
                              >
                                <BsTrash size={20} />
                              </button>
                            </Box>
                          </Flex>
                        </Box>
                      ))
                    ) : null}

                    {/* No Data Message */}
                    {(!parameterData?.daily || parameterData.daily.length === 0) &&
                      (!parameterData?.dialysis || parameterData.dialysis.length === 0) && (
                        <Box className="bg-white px-[70px] py-8 text-center">
                          <p className="text-[#989898] text-[16px] italic">No parameters found</p>
                        </Box>
                      )}
                  </Box>
                </Box>
              </Box>
            </Container>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default ManageParameters;
