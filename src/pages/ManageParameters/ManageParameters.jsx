/**
 * Manage Parameters Page - Redesigned
 * Following Figma design with component library and design system
 * 
 * @file src/pages/ManageParameters/ManageParameters.jsx
 */

import React, { useState, useEffect, useLayoutEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { ROUTES } from "../../routes/routeConstants";

// Component Library
import {
  Box,
  Flex,
  Container,
  Stack,
} from "../../component-library";
import { Button } from "../../component-library/primitives/Button";
import { Input } from "../../component-library/primitives/Input";
import FormControl, { FormLabel, FormHelperText, FormErrorMessage, RequiredIndicator } from "../../component-library/primitives/FormControl";
import FormModal from "../../component-library/modals/FormModal";
import { Select } from "../../component-library/primitives/Select";
// Layout Components
import PatientDetailLayout from "../common/PatientDetailLayout";

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

// Mobile
import { useIsMobile } from "../../components/mobile/useIsMobile";

// Import design system styles
import "../../design-system/styles/index.css";

function ManageParameters() {
  const [parameterData, setParameterData] = useState(null);
  const [showRangeInputs, setShowRangeInputs] = useState(false);
  const [graphOption, setGraphOption] = useState(false);
  const [selectedAilments, setSelectedAilments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const { id: patientId } = useParams();
  const navigate = useNavigate();
  const role = useSelector((state) => state.permission);
  const { isMobile } = useIsMobile();

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
    getAllUserReadingsByPid(patientId).then((response) => {
      if (response.success) {
        setParameterData(response.data);
      } else {
        console.error("Failed to fetch parameter data:", response.data);
      }
    });
  }

  const fetchPatientData = async () => {
    try {
      const response = await axiosInstance.get(`${server_url}/patient/getPatient/${patientId}`);
      setUserData(response.data.data);
    } catch (error) {
      console.error("Error fetching patient data:", error);
    }
  };

  useEffect(() => {
    const getUnreadMessagesFromAdmin = async () => {
      try {
        const chatResult = await getAllChatsAdmin(patientId);
        if (chatResult.success) {
          const unreadMsgs = chatResult.data.filter((chat) => chat.unreadCount > 0);
          setTotalUnreadCount(unreadMsgs.reduce((acc, chat) => acc + chat.unreadCount, 0));
        }
      } catch (error) {
        console.error("Error fetching unread messages from admin:", error);
      }
    };
    getUnreadMessagesFromAdmin();
  }, [patientId]);

  useEffect(() => {
    getParameterData();
    fetchPatientData();
  }, [errMsg, patientId]);

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
    setSelectedAilments([]);
    setIsParamDisabled(false);
    setEditMode(false);
    setEditId(null);
  }

  const handleSubmit = async () => {
    try {
      var ailments = await selectedAilments.map((ailment) => ailment.value);
      const newData = {
        id: patientId,
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
              setIsModalOpen(false);
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
              setIsModalOpen(false);
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
            setIsModalOpen(false);
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
    <PatientDetailLayout
      title={userData?.name ? userData.name : "Patient's Alarms"}
      patientIdParam="id"
      userData={userData}
      totalUnreadCount={totalUnreadCount}
      totalUnreadCountDoc={totalUnreadCountDoc}
      onBackClick={() => navigate(ROUTES.PATIENTS)}
    >
      {false && ( /* Add/Edit Parameter Form (moved to modal) */
        <Box className="bg-white rounded-[15px]  p-8 mb-6">
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
            <FormControl id="param-name" isRequired>
              <FormLabel>Parameter Name</FormLabel>
              <Input
                id="param-name"
                type="text"
                value={selectTitle}
                onChange={(e) => setSelectTitle(e.target.value)}
                className="w-full"
                placeholder="Enter parameter name"
              />
            </FormControl>

            {/* Parameter Type */}
            <FormControl id="param-type" isRequired>
              <FormLabel>Parameter Type</FormLabel>
              <select
                id="param-type"
                value={selectParameterType}
                onChange={(e) => setSelectedParameterType(e.target.value)}
                className="w-full"
                disabled={isParamDisabled}
              >
                <option value="">Select Parameter Type</option>
                {parameterTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </FormControl>

            {/* Special Reading Type */}
            <FormControl id="reading-type" isRequired>
              <FormLabel>Special Reading Type</FormLabel>
              <select
                id="reading-type"
                value={selectReadingType}
                onChange={(e) => setSelectedReadingType(e.target.value)}
                className="w-full"
              >
                <option value="">Select Special Reading Type</option>
                {specialReadingTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </FormControl>

            {/* Range Inputs (conditional) */}
            {showRangeInputs && (
              <Flex gap={4}>
                <Box className="flex-1">
                  <FormControl id="low-range">
                    <FormLabel>Low Range</FormLabel>
                    <Input id="low-range" type="text" value={lowRange || ""} onChange={(e) => setLowRange(e.target.value)} className="w-full" placeholder="Enter low range" />
                  </FormControl>
                </Box>
                <Box className="flex-1">
                  <FormControl id="high-range">
                    <FormLabel>High Range</FormLabel>
                    <Input id="high-range" type="text" value={highRange || ""} onChange={(e) => setHighRange(e.target.value)} className="w-full" placeholder="Enter high range" />
                  </FormControl>
                </Box>
              </Flex>
            )}

            {/* Graph Option */}
            <FormControl id="graph-option">
              <FormLabel>Graph (Yes/No)</FormLabel>
              <select id="graph-option" value={graphOption ? "Yes" : "No"} onChange={(e) => setGraphOption(e.target.value === "Yes")} className="w-full">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </FormControl>

            {/* Ailments */}
            <FormControl id="ailments">
              <FormLabel>Ailments</FormLabel>
              <Select
                id="ailments"
                value={selectedAilments}
                isMulti
                options={ailments.map((ailment) => ({ value: ailment.id, label: ailment.name }))}
                styles={{ control: (baseStyles, state) => ({ ...baseStyles, borderColor: state.isFocused ? "#4164df" : "rgb(209 213 219)", outlineColor: state.isFocused ? "#4164df" : "rgb(209 213 219)", borderRadius: "10px", minHeight: "50px", fontSize: "16px", }), }}
                onChange={(selectedOptions) => setSelectedAilments(selectedOptions)}
              />
            </FormControl>

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
      )}

      {/* Parameters List */}

      <FormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); clearAllFields(); }}
        onSubmit={handleSubmit}
        title={editMode ? "Edit Parameter" : "Add New Parameter"}
        submitText={editMode ? "UPDATE" : "SUBMIT"}
        size="lg"
      >
        <FormControl id="param-name" isRequired>
          <FormLabel>Parameter Name</FormLabel>
          <Input id="param-name" type="text" value={selectTitle} onChange={(e) => setSelectTitle(e.target.value)} className="w-full" placeholder="Enter parameter name" />
        </FormControl>

        <FormControl id="param-type" isRequired>
          <FormLabel>Parameter Type</FormLabel>
          <Select id="param-type" value={selectParameterType} onChange={(e) => setSelectedParameterType(e.target.value)} className="w-full" disabled={isParamDisabled}>
            <option value="">Select Parameter Type</option>
            {parameterTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </Select>
        </FormControl>

        <FormControl id="reading-type" isRequired>
          <FormLabel>Special Reading Type</FormLabel>
          <Select id="reading-type" value={selectReadingType} onChange={(e) => setSelectedReadingType(e.target.value)} className="w-full">
            <option value="">Select Special Reading Type</option>
            {specialReadingTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          {showRangeInputs && (
            <Flex gap={6}>
              <Box className="flex-1">
                <FormControl id="low-range">
                  <FormLabel>Low Range</FormLabel>
                  <Input id="low-range" type="text" value={lowRange || ""} onChange={(e) => setLowRange(e.target.value)} className="w-full" placeholder="Enter low range" />
                </FormControl>
              </Box>
              <Box className="flex-1">
                <FormControl id="high-range">
                  <FormLabel>High Range</FormLabel>
                  <Input id="high-range" type="text" value={highRange || ""} onChange={(e) => setHighRange(e.target.value)} className="w-full" placeholder="Enter high range" />
                </FormControl>
              </Box>
            </Flex>
          )}
        </FormControl>

        <FormControl id="graph-option">
          <FormLabel>Graph (Yes/No)</FormLabel>
          <Select id="graph-option" value={graphOption ? "Yes" : "No"} onChange={(e) => setGraphOption(e.target.value === "Yes")} className="w-full">
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </Select>
        </FormControl>

        <FormControl id="ailments">
          <FormLabel>Ailments</FormLabel>
          <Select id="ailments" value={selectedAilments} isMulti styles={{ control: (baseStyles, state) => ({ ...baseStyles, borderColor: state.isFocused ? "#4164df" : "rgb(209 213 219)", outlineColor: state.isFocused ? "#4164df" : "rgb(209 213 219)", borderRadius: "10px", minHeight: "44px", fontSize: "15px", }), }}
            onChange={(e) => setSelectedAilments(e.target.value)} >
            {ailments.map((ailment) => (
              <option key={ailment.id} value={ailment.id}>{ailment.name}</option>
            ))}
          </Select>
        </FormControl>
      </FormModal>
      <Box className={`bg-white rounded-[15px] ${isMobile ? 'p-4' : 'p-8'}`}>
        <Flex justify="between" align="center" className={`pb-4 border-b border-gray-200 ${isMobile ? 'mb-3' : 'mb-6'}`}>
          <h2 className={`${isMobile ? 'text-[15px]' : 'text-[18px]'} font-bold text-[#393939]`}>Existing Parameters</h2>
          <Button
            variant="solid"
            onClick={() => { clearAllFields(); setIsModalOpen(true); }}
            className={`${isMobile ? 'h-[34px] px-3 rounded-[6px] text-[12px]' : 'h-[40px] px-4 rounded-[8px] text-[14px]'} bg-[#4164df] text-white font-semibold hover:bg-[#3451c9]`}
          >
            + Add Parameter
          </Button>
        </Flex>

        {isMobile ? (
          /* Mobile: Card-based parameter list */
          <Box className="space-y-3">
            {/* Daily Parameters */}
            {parameterData?.daily && parameterData.daily.length > 0 && parameterData.daily.map((data, index) => (
              <Box key={`daily-${index}`} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <Flex justify="between" align="start" className="mb-2">
                  <Box>
                    <h3 className="text-[14px] font-bold text-[#393939]">{data.title}</h3>
                    <span className="text-[11px] font-medium text-white bg-[#5886a5] rounded-full px-2 py-0.5 inline-block mt-1">General</span>
                  </Box>
                  <Flex align="center" gap={2}>
                    <button className="text-[#5886a5] hover:text-[#4164df] p-1.5" onClick={() => {
                      setEditMode(true); setEditId(data.id); setSelectedParameterType("General");
                      setSelectedAilments(data.daily_reading_ailments?.map((a) => ({ value: a.ailmentID, label: ailmentOptions.find((o) => o.id === a.ailmentID)?.name })) || []);
                      setSelectTitle(data.title); setSelectedReadingType(data.type);
                      setHighRange(data.high_range); setLowRange(data.low_range);
                      setGraphOption(data.isGraph === 1); setIsParamDisabled(true);
                      setErrMsg({ type: "success", msg: "" }); setIsModalOpen(true);
                    }}><BsPencilSquare size={16} /></button>
                    <button className="text-[#de425b] hover:text-[#c93850] p-1.5" onClick={async () => {
                      if (window.confirm("Are you sure you want to delete this parameter?")) {
                        try { await deleteDailyReading(data.id); setErrMsg({ type: "success", msg: "Deleted Successfully" }); getParameterData(); } catch (err) { console.error(err); }
                      }
                    }}><BsTrash size={16} /></button>
                  </Flex>
                </Flex>
                <Box className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[#989898]">
                  <span><strong>Type:</strong> {data.type}</span>
                  <span><strong>Graph:</strong> {data.isGraph ? "Yes" : "No"}</span>
                  {data.low_range && <span><strong>Range:</strong> {data.low_range}-{data.high_range}</span>}
                </Box>
              </Box>
            ))}

            {/* Dialysis Parameters */}
            {parameterData?.dialysis && parameterData.dialysis.length > 0 && parameterData.dialysis.map((data, index) => (
              <Box key={`dialysis-${index}`} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <Flex justify="between" align="start" className="mb-2">
                  <Box>
                    <h3 className="text-[14px] font-bold text-[#393939]">{data.title}</h3>
                    <span className="text-[11px] font-medium text-white bg-[#de425b] rounded-full px-2 py-0.5 inline-block mt-1">Dialysis</span>
                  </Box>
                  <Flex align="center" gap={2}>
                    <button className="text-[#5886a5] hover:text-[#4164df] p-1.5" onClick={() => {
                      setEditMode(true); setEditId(data.id); setSelectedParameterType("Dialysis");
                      setSelectedAilments(data.dialysis_reading_ailments?.map((a) => ({ value: a.ailmentID, label: ailmentOptions.find((o) => o.id === a.ailmentID)?.name })) || []);
                      setSelectTitle(data.title); setSelectedReadingType(data.type);
                      setHighRange(data.high_range); setLowRange(data.low_range);
                      setGraphOption(data.isGraph === 1); setIsParamDisabled(true);
                      setErrMsg({ type: "success", msg: "" }); setIsModalOpen(true);
                    }}><BsPencilSquare size={16} /></button>
                    <button className="text-[#de425b] hover:text-[#c93850] p-1.5" onClick={async () => {
                      if (window.confirm("Are you sure you want to delete this parameter?")) {
                        try { await deleteDialysisReading(data.id); setErrMsg({ type: "success", msg: "Deleted Successfully" }); getParameterData(); } catch (err) { console.error(err); }
                      }
                    }}><BsTrash size={16} /></button>
                  </Flex>
                </Flex>
                <Box className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[#989898]">
                  <span><strong>Type:</strong> {data.type}</span>
                  <span><strong>Graph:</strong> {data.isGraph ? "Yes" : "No"}</span>
                  {data.low_range && <span><strong>Range:</strong> {data.low_range}-{data.high_range}</span>}
                </Box>
              </Box>
            ))}

            {(!parameterData?.daily || parameterData.daily.length === 0) &&
              (!parameterData?.dialysis || parameterData.dialysis.length === 0) && (
                <Box className="py-8 text-center">
                  <p className="text-[#989898] text-[14px] italic">No parameters found</p>
                </Box>
              )}
          </Box>
        ) : (
        /* Desktop: Original Table */
        <Box className="overflow-x-auto">
          {/* Table Header */}
          <Box className="bg-[#5886a5] rounded-[5px] px-6 py-3 mb-0">
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
                  className="bg-white border-b border-gray-100 px-6 py-4 hover:bg-gray-50 transition-colors"
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
                          setErrMsg({ type: "success", msg: "" });
                          setIsModalOpen(true);
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
                              setErrMsg({ type: "success", msg: "Deleted Successfully" });
                              getParameterData();
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
                  className="bg-white border-b border-gray-100 px-6 py-4 hover:bg-gray-50 transition-colors"
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
                          setErrMsg({ type: "success", msg: "" });
                          setIsModalOpen(true);
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
                              setErrMsg({ type: "success", msg: "Deleted Successfully" });
                              getParameterData();
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
                <Box className="bg-white px-6 py-8 text-center">
                  <p className="text-[#989898] text-[16px] italic">No parameters found</p>
                </Box>
              )}
          </Box>
        </Box>
        )}
      </Box>
    </PatientDetailLayout>
  );
}

export default ManageParameters;

