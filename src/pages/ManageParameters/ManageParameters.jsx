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
  SortDropdown,
} from "../../component-library";
import { Button } from "../../component-library/primitives/Button";
import { Input } from "../../component-library/primitives/Input";
import FormControl, { FormLabel, FormHelperText, FormErrorMessage, RequiredIndicator } from "../../component-library/primitives/FormControl";
import FormModal from "../../component-library/modals/FormModal";
import { Select } from "../../component-library/primitives/Select";
import { MultiSelect } from "../../component-library/primitives/MultiSelect";
import UnifiedListTable from "../../components/table/UnifiedListTable";
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
import { getPatientGetPatientByid } from "../../ApiCalls/remainingApis";

// Icons
import { BsTrash, BsPencilSquare } from "react-icons/bs";

// Mobile
import { useIsMobile } from "../../components/mobile/useIsMobile";

// Import design system styles
import "../../design-system/styles/index.css";
import { Sort } from "@mui/icons-material";

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
  const [fieldErrors, setFieldErrors] = useState({});
  const [ailmentOptions, setAilmentOptions] = useState([]);
  const [ailments, setAilments] = useState([]);
  const [userData, setUserData] = useState({});
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [totalUnreadCountDoc, setTotalUnreadCountDoc] = useState(0);

  const { id: patientId } = useParams();
  const navigate = useNavigate();
  const role = useSelector((state) => state.permission);
  const { isMobile } = useIsMobile();

  // Sort / Filter state and helper functions
  const [selectedFilter, setSelectedFilter] = useState("");

  const SORT_OPTIONS = [
    { value: "", label: "None" },
    { value: "name_asc", label: "Name (A - Z)" },
    { value: "name_desc", label: "Name (Z - A)" },
    { value: "type_asc", label: "Parameter Type (A - Z)" },
    { value: "type_desc", label: "Parameter Type (Z - A)" },
    { value: "reading_asc", label: "Reading Type (A - Z)" },
    { value: "reading_desc", label: "Reading Type (Z - A)" },
  ];

  function handleSelectChange(e) {
    const value = e && e.target ? e.target.value : e;
    setSelectedFilter(value);
    // client-side sorting can be implemented here if needed
  }

  function handleClearFilters() {
    setSelectedFilter("");
    // refresh data to clear filters
    getParameterData();
  }

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
      const response = await getPatientGetPatientByid(patientId);
      if (response.success) {
        setUserData(response.data?.data);
      }
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
    setFieldErrors({});
  }

  const handleSubmit = async () => {
    // Validate required fields
    const nextFieldErrors = {};
    if (!selectTitle || selectTitle.trim() === "") nextFieldErrors.title = true;
    if (!selectParameterType) nextFieldErrors.parameterType = true;
    if (!selectReadingType) nextFieldErrors.readingType = true;
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }
    setFieldErrors({});

    try {
      const newData = {
        id: patientId,
        title: selectTitle,
        parameterType: selectParameterType,
        type: selectReadingType,
        readingType: selectReadingType,
        isGraph: graphOption ? 1 : 0,
        ailments: selectedAilments,
        assign_range: selectReadingType === "Numeric" ? "Yes" : "No",
        low_range: lowRange,
        high_range: highRange,
      };

      if (editMode) {
        const updateData = {
          id: editId,
          title: selectTitle,
          parameterType: selectParameterType,
          type: selectReadingType,
          readingType: selectReadingType,
          isGraph: graphOption ? 1 : 0,
          ailments: selectedAilments,
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
      title={`Manage Parameters`}
      patientIdParam="id"
      userData={userData}
      totalUnreadCount={totalUnreadCount}
      totalUnreadCountDoc={totalUnreadCountDoc}
      onBackClick={() => navigate(ROUTES.PATIENTS)}
    >

      {/* Add Parameter Button */}
      <Flex justify="between" align="center" className="mb-4">
        <Flex align="center" gap={isMobile ? 2 : 4} wrap={isMobile ? 'wrap' : 'nowrap'}>
          <SortDropdown
            value={selectedFilter}
            onChange={handleSelectChange}
            options={SORT_OPTIONS}
            // icon={<img src={sortIcon} alt="Sort" />}
            placeholder="Sort by"
          />
          <button
            onClick={handleClearFilters}
            className={`${isMobile ? 'text-[13px]' : 'text-[16px]'} font-semibold text-[#5886a5] underline hover:text-primary transition-colors cursor-pointer`}
          >
            Clear filters
          </button>
        </Flex>


        <Button
          variant="solid"
          onClick={() => { clearAllFields(); setIsModalOpen(true); }}
          className="h-[50px] px-6 rounded-[10px] bg-[#4164df] text-white text-[16px] font-semibold hover:bg-[#3451c9]"
        >
          + Add Parameter
        </Button>
      </Flex>
      {/* Prepare columns for UnifiedListTable */}
      {(() => {
        const parameterColumns = [
          { key: "name", label: "Parameter Name", type: "text", width: "200px" },
          { key: "type", label: "Parameter Type", type: "text", width: "150px" },
          { key: "readingType", label: "Reading Type", type: "text", width: "150px" },
          { key: "graph", label: "Graph", type: "text", width: "100px" },
          { key: "actions", label: "Actions", type: "actions", width: "100px" },
        ];

        // Transform parameter data for table
        const transformedParameterData = [];
        if (parameterData?.daily && parameterData.daily.length > 0) {
          parameterData.daily.forEach((data) => {
            transformedParameterData.push({
              id: data.id,
              name: data.title,
              type: "General",
              readingType: data.type,
              graph: data.isGraph ? "Yes" : "No",
              paramType: "daily",
              originalData: data,
              isGraph: data.isGraph,
              low_range: data.low_range,
              high_range: data.high_range,
              daily_reading_ailments: data.daily_reading_ailments,
            });
          });
        }

        if (parameterData?.dialysis && parameterData.dialysis.length > 0) {
          parameterData.dialysis.forEach((data) => {
            transformedParameterData.push({
              id: data.id,
              name: data.title,
              type: "Dialysis",
              readingType: data.type,
              graph: data.isGraph ? "Yes" : "No",
              paramType: "dialysis",
              originalData: data,
              isGraph: data.isGraph,
              low_range: data.low_range,
              high_range: data.high_range,
              dialysis_reading_ailments: data.dialysis_reading_ailments,
            });
          });
        }

        return (
          <UnifiedListTable
            columns={parameterColumns}
            data={transformedParameterData}
            onEdit={(row) => {
              setEditMode(true);
              setEditId(row.id);
              setSelectedParameterType(row.type);
              if (row.paramType === "daily") {
                setSelectedAilments(
                  row.daily_reading_ailments?.map((ailment) => ailment.ailmentID) || []
                );
              } else {
                setSelectedAilments(
                  row.dialysis_reading_ailments?.map((ailment) => ailment.ailmentID) || []
                );
              }
              setSelectTitle(row.name);
              setSelectedReadingType(row.readingType);
              setHighRange(row.high_range);
              setLowRange(row.low_range);
              setGraphOption(row.isGraph === 1 || row.isGraph === true);
              setIsParamDisabled(true);
              setErrMsg({ type: "success", msg: "" });
              setIsModalOpen(true);
            }}
            onDelete={(row) => {
              if (window.confirm("Are you sure you want to delete this parameter?")) {
                try {
                  if (row.paramType === "daily") {
                    deleteDailyReading(row.id).then(() => {
                      setErrMsg({ type: "success", msg: "Deleted Successfully" });
                      getParameterData();
                    });
                  } else {
                    deleteDialysisReading(row.id).then(() => {
                      setErrMsg({ type: "success", msg: "Deleted Successfully" });
                      getParameterData();
                    });
                  }
                } catch (err) {
                  console.error(err);
                }
              }
            }}
            displayMode="auto"
            cardTitleKey="name"
            cardSubtitleKey="type"
            cardFieldKeys={["readingType", "graph"]}
            emptyMessage="No parameters found"
            actionButtons={true}
          />
        );
      })()}
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
              <MultiSelect
                id="ailments"
                value={selectedAilments}
                onChange={(selectedIds) => setSelectedAilments(selectedIds)}
              >
                {ailments.map((ailment) => (
                  <option key={ailment.id} value={ailment.id}>
                    {ailment.name}
                  </option>
                ))}
              </MultiSelect>
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
        fieldErrors={fieldErrors}
        onFieldErrorClear={(field) => setFieldErrors((prev) => ({ ...prev, [field]: false }))}
      >
        {({ getFieldProps, clearFieldError }) => (
          <>
        <FormControl id="param-name" isRequired isInvalid={getFieldProps("title").isInvalid}>
          <FormLabel>Parameter Name<span className="text-red-500">*</span></FormLabel>
          <Input id="param-name" type="text" value={selectTitle} isInvalid={getFieldProps("title").isInvalid} onChange={(e) => { setSelectTitle(e.target.value); clearFieldError("title"); }} className="w-full" placeholder="Enter parameter name" />
        </FormControl>

        <FormControl id="param-type" isRequired isInvalid={getFieldProps("parameterType").isInvalid}>
          <FormLabel>Parameter Type<span className="text-red-500">*</span></FormLabel>
          <Select id="param-type" value={selectParameterType} isInvalid={getFieldProps("parameterType").isInvalid} onChange={(e) => { setSelectedParameterType(e.target.value); clearFieldError("parameterType"); }} className="w-full" disabled={isParamDisabled}>
            <option value="">Select Parameter Type</option>
            {parameterTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </Select>
        </FormControl>

        <FormControl id="reading-type" isRequired isInvalid={getFieldProps("readingType").isInvalid}>
          <FormLabel>Special Reading Type<span className="text-red-500">*</span></FormLabel>
          <Select id="reading-type" value={selectReadingType} isInvalid={getFieldProps("readingType").isInvalid} onChange={(e) => { setSelectedReadingType(e.target.value); clearFieldError("readingType"); }} className="w-full">
            <option value="">Select Special Reading Type</option>
            {specialReadingTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </Select>
        </FormControl>

        {/* <FormControl>
          {showRangeInputs && (
            <Flex gap={2}>
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
        </FormControl> */}

        <FormControl id="graph-option">
          <FormLabel>Graph (Yes/No)</FormLabel>
          <Select id="graph-option" value={graphOption ? "Yes" : "No"} onChange={(e) => setGraphOption(e.target.value === "Yes")} className="w-full">
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </Select>
        </FormControl>

        <FormControl id="ailments">
          <FormLabel>Ailments</FormLabel>
          <MultiSelect
            id="ailments"
            value={selectedAilments}
            onChange={(selectedIds) => setSelectedAilments(selectedIds)}
          >
            {ailments.map((ailment) => (
              <option key={ailment.id} value={ailment.id}>{ailment.name}</option>
            ))}
          </MultiSelect>
        </FormControl>
          </>
        )}
      </FormModal>


    </PatientDetailLayout>
  );
}

export default ManageParameters;

