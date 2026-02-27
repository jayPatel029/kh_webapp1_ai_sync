/**
 * AlarmModal Component - Refactored with FormModal
 * Using component library FormModal and FormControl components
 * 
 * @file src/pages/ShowAlarms/AlarmModal.jsx
 */

import React, { useState, useEffect } from "react";
import { FaFilePdf } from "react-icons/fa6";

// Component Library - Modals & Forms
import { FormModal } from "../../component-library/modals/FormModal";
import {
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage
} from "../../component-library/primitives/FormControl";
import { Input } from "../../component-library/primitives/Input";
import { Select } from "../../component-library/primitives/Select";
import { Checkbox, CheckboxGroup } from "../../component-library/primitives/Checkbox";

// Layout & Typography
import { Box, Flex, VStack, HStack, Stack, GridItem } from "../../component-library/layout/Layout";
import { Text } from "../../component-library/primitives/Typography";
import MyPDFViewer from "../../components/pdf/MyPDFViewer";

// APIs
import { getPatientMedicalTeam } from "../../ApiCalls/patientAPis";
import { getPrescriptionByPatient } from "../../ApiCalls/prescriptionApis";
import { alarmTypeOptions, timing, dosesOptions } from "./consts";
import { insertAlarm } from "../../ApiCalls/alarmsApis";
import {
  getDailyReadings,
  getDialysisReadings,
} from "../../ApiCalls/readingsApis";

// Import design system styles
import "../../design-system/styles/index.css";
import { Grid } from "../../component-library/layout/Layout";

const AlarmModal = ({ closeModal, pid, patient }) => {
  // Form state
  const [selectedAlarmType, setSelectedAlarmType] = useState("Dialysis");
  const [selectedHealthParameter, setSelectedHealthParameter] = useState("");
  const [selectTimings, setSelectTimings] = useState("Daily/Weekly");
  const [description, setDescription] = useState("");
  const [weekdays, setWeekdays] = useState([]);
  const [timesaday, setTimesaday] = useState(1);
  const [timings, setTimings] = useState(Array(1).fill(""));
  const [dateOfMonth, setDOM] = useState(Array(1).fill(""));
  const [doctorid, setDoctorid] = useState("");
  const [selectedPrescription, setSelectedPrescription] = useState("");
  const [doses, setDoses] = useState(Array(1).fill(""));
  const [doseUnit, setDoseUnit] = useState(Array(1).fill(""));

  // UI state
  const [consultDoctor, setConsultDoctor] = useState([]);
  const [prescription, setPrescription] = useState([]);
  const [drOptions, setDrOptions] = useState([]);
  const [dirOptions, setDirOptions] = useState([]);
  const [viewPrescription, setViewPrescription] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation
  const validate = () => {
    setErrorMessage("");
    const nextFieldErrors = {};

    if (!selectedAlarmType) {
      nextFieldErrors.alarmType = true;
    }

    if (selectedAlarmType === "Health Reading") {
      if (!selectedHealthParameter) {
        nextFieldErrors.healthParameter = true;
      }
    }

    if (selectedAlarmType === "Prescription") {
      if (!selectedPrescription) {
        nextFieldErrors.prescription = true;
      }
      if (doses.some(d => !d)) {
        nextFieldErrors.doses = true;
      }
      if (doseUnit.some(u => !u)) {
        nextFieldErrors.doseUnit = true;
      }
      if (timings.some(t => !t)) {
        nextFieldErrors.timings = true;
      }
    }

    if (selectedAlarmType === "Diet Details" || selectedAlarmType === "Prescription" || selectedAlarmType === "Dialysis") {
      if (!description) {
        nextFieldErrors.description = true;
      }
    }

    if (selectTimings === "Daily/Weekly") {
      if (weekdays.length === 0) {
        nextFieldErrors.weekdays = true;
      }
      if (timings.some(t => !t)) {
        nextFieldErrors.timings = true;
      }
    } else if (selectTimings === "Monthly") {
      if (dateOfMonth.some(d => !d)) {
        nextFieldErrors.dateOfMonth = true;
      }
      if (timings.some(t => !t)) {
        nextFieldErrors.timings = true;
      }
    }

    if (!doctorid) {
      nextFieldErrors.doctor = true;
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      // Set the first error message
      const firstKey = Object.keys(nextFieldErrors)[0];
      const errorMessages = {
        alarmType: "Please select Alarm Type",
        healthParameter: "Please select Parameter",
        prescription: "Please select Prescription",
        doses: "Please enter Dose for all times",
        doseUnit: "Please select Dose Unit for all times",
        description: "Please enter Description",
        weekdays: "Please select at least one weekday",
        timings: "Please select Time for all entries",
        dateOfMonth: "Please select Date for all entries",
        doctor: "Please select Doctor for approval",
      };
      setErrorMessage(errorMessages[firstKey] || "Please fill all required fields");
      return false;
    }

    setFieldErrors({});
    return true;
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        doctorId: doctorid,
        type: selectedAlarmType,
        parameter: selectedAlarmType === "Health Reading" ? selectedHealthParameter : "",
        description: description,
        frequency: selectTimings,
        status: selectedAlarmType === "Prescription" ? "Pending" : "Approved",
        pid: pid,
        prescriptionid: selectedAlarmType === "Prescription" ? selectedPrescription : null,
        doses: null,
        doseUnit: null,
      };

      if (selectedAlarmType === "Prescription") {
        payload.doses = doses.map((dose, index) => ({
          dose: dose,
          doseUnit: doseUnit[index],
          time: timings[index],
        }));
      }

      if (selectTimings === "Daily/Weekly") {
        payload.weekdays = weekdays.toString();
        payload.timesaday = timesaday;
        payload.time = timings.toString();
      } else if (selectTimings === "Monthly") {
        payload.dateofmonth = dateOfMonth.toString();
        payload.timesamonth = timesaday;
        payload.time = timings.toString();
      }

      const res = await insertAlarm(payload);
      if (res.success) {
        closeModal();
        // Refresh page to show new alarm
        setTimeout(() => window.location.reload(), 500);
      } else {
        setErrorMessage(res.message || "Error inserting alarm");
      }
    } catch (error) {
      console.error("Error inserting alarm:", error);
      setErrorMessage("Error inserting alarm. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [drResult, dirResult, medicalTeam, prescriptionData] = await Promise.all([
          getDailyReadings(),
          getDialysisReadings(),
          getPatientMedicalTeam(pid),
          getPrescriptionByPatient(pid),
        ]);

        if (drResult.success) {
          setDrOptions(
            drResult.data.map((dr) => ({
              value: dr.title,
              label: dr.title,
            }))
          );
        }

        if (dirResult.success) {
          setDirOptions(
            dirResult.data.map((dr) => ({
              value: dr.title,
              label: dr.title,
            }))
          );
        }

        if (medicalTeam.success && medicalTeam.data.data?.length > 0) {
          setConsultDoctor(medicalTeam.data.data);
          setDoctorid(medicalTeam.data.data[0]?.id || "");
        }

        if (prescriptionData.success && prescriptionData.data.data?.length > 0) {
          setPrescription(prescriptionData.data.data);
          setSelectedPrescription(prescriptionData.data.data[0]?.id || "");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage("Error loading form data");
      }
    };

    fetchData();
  }, [pid]);

  // Handle timing changes
  const handleTimesChange = (newTimes) => {
    const numTimes = parseInt(newTimes) || 1;
    setTimesaday(numTimes);
    setTimings(Array(numTimes).fill(""));
    setDOM(Array(numTimes).fill(""));
    setDoses(Array(numTimes).fill(""));
    setDoseUnit(Array(numTimes).fill(""));
  };

  const renderTimingInputs = () => {
    return Array.from(Array(parseInt(timesaday))).map((_, index) => (
      // <Flex key={index} gap={2} align="flex-end">
      <>
        {selectTimings === "Monthly" && (
          <FormControl isRequired>
            <FormLabel>Date</FormLabel>
            <Select
              value={dateOfMonth[index] || ""}
              onChange={(e) => {
                const temp = [...dateOfMonth];
                temp[index] = e.target.value;
                setDOM(temp);
              }}
            >
              <option value="">Select date</option>
              {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </Select>
          </FormControl>
        )}

        <FormControl isRequired flex="1">
          <FormLabel>Time</FormLabel>
          <Input
            type="time"
            value={timings[index] || ""}
            onChange={(e) => {
              const temp = [...timings];
              temp[index] = e.target.value;
              setTimings(temp);
            }}
          />
        </FormControl>

        {selectedAlarmType === "Prescription" && (
          <>
            <FormControl isRequired>
              <FormLabel>Dose</FormLabel>
              <Input
                type="number"
                placeholder="Enter dose"
                value={doses[index] || ""}
                onChange={(e) => {
                  const temp = [...doses];
                  temp[index] = e.target.value;
                  setDoses(temp);
                }}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Unit</FormLabel>
              <Select
                value={doseUnit[index] || ""}
                onChange={(e) => {
                  const temp = [...doseUnit];
                  temp[index] = e.target.value;
                  setDoseUnit(temp);
                }}
              >
                <option value="">Select unit</option>
                {dosesOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormControl>
          </>
        )}
      </>
      // </Flex>
    ));
  };

  return (
    <>
      <FormModal
        isOpen={true}
        onClose={closeModal}
        onSubmit={handleSubmit}
        title="Add Alarm"
        submitText="Submit"
        cancelText="Cancel"
        submitVariant="secondary"
        cancelVariant="danger"
        isLoading={isSubmitting}
        errorMessage={errorMessage}
        size={selectedAlarmType === "Prescription" ? "7xl" : "lg"}
        fieldErrors={fieldErrors}
        onFieldErrorClear={(field) => setFieldErrors((prev) => ({ ...prev, [field]: false }))}
      >
        <Grid gap={6} className="!min-w-full" templateColumns="repeat(8, 1fr)">
          <GridItem colSpan={selectedAlarmType === "Prescription" ? 2 : 8} className="gap-8 !min-w-60">
            {/* Alarm Type */}
            <FormControl isRequired isInvalid={Boolean(fieldErrors.alarmType)}>
              <FormLabel>Alarm Type</FormLabel>
              <Select
                value={selectedAlarmType}
                isInvalid={Boolean(fieldErrors.alarmType)}
                onChange={(e) => {
                  setSelectedAlarmType(e.target.value);
                  setSelectedHealthParameter("");
                  setErrorMessage("");
                  setFieldErrors((prev) => ({ ...prev, alarmType: false }));
                }}
              >
                {alarmTypeOptions.map((type) => (
                  <option key={type.label} value={type.label}>
                    {type.label}
                  </option>
                ))}
              </Select>
              {/* <FormHelperText>Select the type of alarm</FormHelperText> */}
            </FormControl>

            {/* Health Parameter */}
            {selectedAlarmType === "Health Reading" && (
              <FormControl isRequired isInvalid={Boolean(fieldErrors.healthParameter)}>
                <FormLabel>Health Parameter</FormLabel>
                <Select
                  value={selectedHealthParameter}
                  isInvalid={Boolean(fieldErrors.healthParameter)}
                  onChange={(e) => {
                    setSelectedHealthParameter(e.target.value);
                    setErrorMessage("");
                    setFieldErrors((prev) => ({ ...prev, healthParameter: false }));
                  }}
                  placeholder="Select parameter"
                >
                  {drOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Dialysis Parameter */}
            {/* {selectedAlarmType === "Dialysis" && (
        <FormControl isRequired>
          <FormLabel>Set Dialysis Parameter</FormLabel>
          <Select
            value={selectedHealthParameter}
            onChange={(e) => setSelectedHealthParameter(e.target.value)}
           >
            {dirOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormControl>
      )} */}

            {/* Prescription Selection */}
            {selectedAlarmType === "Prescription" && (
              <Flex className="mb-4 mt-4" gap={4} align="start">
                <Box>
                  <FormControl isRequired isInvalid={Boolean(fieldErrors.prescription)}>
                    <FormLabel>Select Prescription</FormLabel>
                    <Box className="border-[1px] border-accent rounded-md overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-accent">
                          <tr>
                            <th className="px-4 py-3 text-left">Image</th>
                            <th className="px-4 py-3 text-left">Date</th>
                            <th className="px-4 py-3 text-left">Select</th>
                          </tr>
                        </thead>
                        <tbody>
                          {prescription.map((pres, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3">
                                {pres.Prescription?.endsWith(".pdf") ? (
                                  <FaFilePdf className="w-8 h-8 text-red-500" />
                                ) : (
                                  <img
                                    src={pres.Prescription}
                                    alt={`prescription-${index}`}
                                    className="h-10 w-10 object-cover rounded cursor-pointer hover:opacity-80"
                                    onClick={() => {
                                      setViewPrescription(
                                        viewPrescription === index + 1 ? null : index + 1
                                      );
                                    }}
                                  />
                                )}
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {new Date(pres.Date).toDateString()}
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="radio"
                                  name="prescription"
                                  value={pres.id}
                                  checked={selectedPrescription === pres.id}
                                  onChange={(e) => {
                                    setSelectedPrescription(e.target.value);
                                    setViewPrescription(index + 1);
                                    setErrorMessage("");
                                  }}
                                  className="w-4 h-4 cursor-pointer"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Box>
                  </FormControl>
                </Box>


              </Flex>
            )}

            {/* Description */}
            {(selectedAlarmType === "Diet Details" ||
              selectedAlarmType === "Prescription" ||
              selectedAlarmType === "Dialysis") && (
                <FormControl className="mb-4 mt-4" isRequired isInvalid={Boolean(fieldErrors.description)}>
                  <FormLabel>Short Description</FormLabel>
                  <Input
                    type="text"
                    placeholder="Enter description"
                    value={description}
                    isInvalid={Boolean(fieldErrors.description)}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setErrorMessage("");
                      setFieldErrors((prev) => ({ ...prev, description: false }));
                    }}
                  />
                  {/* <FormHelperText>Provide brief description</FormHelperText> */}
                </FormControl>
              )}

            {/* Frequency */}
            <FormControl isRequired>
              {/* <FormLabel>Frequency</FormLabel> */}
              <Flex gap={6}>
                {/* <label className="flex items-center gap-2 cursor-pointer"> */}
                <Checkbox
                  type="radio"
                  name="frequency"
                  value="Daily/Weekly"
                  checked={selectTimings === "Daily/Weekly"}
                  onChange={(e) => {
                    setSelectTimings(e.target.value);
                    handleTimesChange(1);
                    setErrorMessage("");
                  }}
                  // className="w-4 h-4"
                  label="Daily/Weekly"
                >Daily/Weekly</Checkbox>
                {/* </label> */}
                {/* <label className="flex items-center gap-2 cursor-pointer"> */}
                <Checkbox
                  type="radio"
                  name="frequency"
                  value="Monthly"
                  checked={selectTimings === "Monthly"}
                  onChange={(e) => {
                    setSelectTimings(e.target.value);
                    handleTimesChange(1);
                    setErrorMessage("");
                  }}
                  // className="w-4 h-4"
                  label="Monthly"
                >Monthly</Checkbox>
                {/* </label> */}
              </Flex>
            </FormControl>

            {/* Weekdays - for Daily/Weekly */}
            {selectTimings === "Daily/Weekly" && (
              <FormControl isRequired isInvalid={Boolean(fieldErrors.weekdays)}>
                {/* <FormLabel>Select Days</FormLabel> */}
                <Flex gap={2} wrap="wrap">
                  {["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"].map((day) => (
                    <Checkbox
                      key={day}
                      value={day}
                      isChecked={weekdays.includes(day)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setWeekdays([...weekdays, day]);
                        } else {
                          setWeekdays(weekdays.filter((d) => d !== day));
                        }
                        setErrorMessage("");
                        setFieldErrors((prev) => ({ ...prev, weekdays: false }));
                      }}
                    >
                      {day}
                    </Checkbox>
                  ))}
                </Flex>
                {/* <FormHelperText>Select day(s) for the alarm</FormHelperText> */}
              </FormControl>
            )}

            {/* Times per period */}
            <FormControl isRequired>
              <FormLabel>
                {selectTimings === "Monthly" ? "How many times a month?" : "How many times a day?"}
              </FormLabel>
              <Select
                value={timesaday}
                onChange={(e) => {
                  handleTimesChange(e.target.value);
                  setErrorMessage("");
                }}
              >
                {timing.map((time) => (
                  <option key={time.value} value={time.value}>
                    {time.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Dynamic timing inputs */}
            {renderTimingInputs()}

            {/* Doctor Selection */}
            <FormControl isRequired isInvalid={Boolean(fieldErrors.doctor)}>
              <FormLabel>Select Doctor for Approval</FormLabel>
              <Select
                value={doctorid}
                isInvalid={Boolean(fieldErrors.doctor)}
                onChange={(e) => {
                  setDoctorid(e.target.value);
                  setErrorMessage("");
                  setFieldErrors((prev) => ({ ...prev, doctor: false }));
                }}
              >
                <option value="">Select Doctor</option>
                {consultDoctor.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name}
                  </option>
                ))}
              </Select>

              {/* <FormHelperText>Choose doctor who will approve this alarm</FormHelperText> */}
            </FormControl>
          </GridItem>
          {/* Right column viewer inside modal (not floating) */}
          <GridItem colSpan={6} >
            {/* <Box width="420px" className="border-l pl-4"> */}
            {selectedAlarmType === "Prescription" && viewPrescription && prescription[viewPrescription - 1] && (
              <Box className="p-2">
                {prescription[viewPrescription - 1].Prescription?.endsWith('.pdf') ? (
                  <div className="h-[100vh]">
                    <MyPDFViewer
                      file={prescription[viewPrescription - 1].Prescription}
                      onLoadSuccess={() => { }}
                      onLoadError={() => { }}
                    />
                  </div>
                ) : (
                  <img
                    src={prescription[viewPrescription - 1].Prescription}
                    alt="prescription-view"
                    className="w-full h-auto rounded"
                  />
                )}
              </Box>
            )}
          </GridItem>
          {/* </Box> */}
        </Grid>

      </FormModal >



      {/* Floating right-side prescription viewer (outside modal) */}
      {/* {viewPrescription && prescription[viewPrescription - 1] && (
        <div
          className="fixed right-5 top-16 z-[9999]"
          style={{ width: 420, height: 'calc(100vh - 140px)' }}
        >
          <Box className="border-[1px] border-accent rounded-md p-4 bg-white shadow-lg h-full overflow-auto">
            <div className="flex justify-between items-center mb-3 pb-3 border-b">
              <Text className="font-semibold">
                {new Date(prescription[viewPrescription - 1].Date).toDateString()}
              </Text>
              <button
                onClick={() => setViewPrescription(null)}
                className="text-gray-500 hover:text-gray-700 text-lg"
              >
                ✕
              </button>
            </div>

            {prescription[viewPrescription - 1].Prescription?.endsWith('.pdf') ? (
              <div className="h-full">
                <iframe
                  src={prescription[viewPrescription - 1].Prescription}
                  title="prescription-pdf"
                  className="w-full h-[calc(100%-72px)]"
                />
                <div className="mt-2">
                  <a
                    href={prescription[viewPrescription - 1].Prescription}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Open PDF in new tab
                  </a>
                </div>
              </div>
            ) : (
              <img
                src={prescription[viewPrescription - 1].Prescription}
                alt="prescription-view"
                className="w-full h-auto rounded"
              />
            )}
          </Box>
        </div>
      )} */}

    </>
  );
};

export default AlarmModal;
