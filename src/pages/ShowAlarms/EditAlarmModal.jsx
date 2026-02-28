/**
 * EditAlarmModal Component - Refactored with FormModal  
 * Using component library FormModal and FormControl components
 * 
 * @file src/pages/ShowAlarms/EditAlarmModal.jsx
 */

import React, { useState, useEffect } from "react";
import { FaFilePdf } from "react-icons/fa6";

// Component Library - Modals & Forms
import { FormModal } from "../../component-library/modals/FormModal";
import { 
  FormControl, 
  FormLabel, 
  // FormHelperText
} from "../../component-library/primitives/FormControl";
import { Input } from "../../component-library/primitives/Input";
import { Select } from "../../component-library/primitives/Select";
import { Checkbox } from "../../component-library/primitives/Checkbox";

// Layout & Typography
import { Box, Flex } from "../../component-library/layout/Layout";

// APIs
import { getPatientMedicalTeam } from "../../ApiCalls/patientAPis";
import { getPrescriptionByPatient } from "../../ApiCalls/prescriptionApis";
import { alarmTypeOptions, timing, dosesOptions } from "./consts";
import { updateAlarm } from "../../ApiCalls/alarmsApis";
import {
  getDailyReadings,
  getDialysisReadings,
} from "../../ApiCalls/readingsApis";

// Import design system styles
import "../../design-system/styles/index.css";

const EditAlarmModal = ({ closeModal, alarmData, pid, dosesData, mutate, onSuccess }) => {
  // Form state
  const [selectedAlarmType, setSelectedAlarmType] = useState(alarmData?.type || "");
  const [selectedHealthParameter, setSelectedHealthParameter] = useState("");
  const [selectTimings, setSelectTimings] = useState(alarmData?.frequency || "Daily/Weekly");
  const [description, setDescription] = useState(alarmData?.description || "");
  const [weekdays, setWeekdays] = useState(alarmData?.weekdays?.split(",") || []);
  const [timesaday, setTimesaday] = useState(alarmData?.timesaday || 1);
  const [timings, setTimings] = useState(alarmData?.time?.split(",") || Array(1).fill(""));
  const [dateOfMonth, setDOM] = useState(alarmData?.dateofmonth?.split(",") || Array(1).fill(""));
  const [doctorid, setDoctorid] = useState(alarmData?.doctorId || "");
  const [selectedPrescription, setSelectedPrescription] = useState(alarmData?.prescriptionid || "");
  const [doses, setDoses] = useState([]);
  const [doseUnit, setDoseUnit] = useState([]);
  
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
    const errors = {};

    if (!selectedAlarmType) errors.alarmType = true;

    if (selectedAlarmType === "Health Reading" && !selectedHealthParameter) {
      errors.healthParameter = true;
    }

    if (selectedAlarmType === "Prescription") {
      if (!selectedPrescription) errors.prescription = true;
      if (doses.some(d => !d)) errors.doses = true;
      if (doseUnit.some(u => !u)) errors.doseUnit = true;
    }

    if (
      (selectedAlarmType === "Diet Details" || 
       selectedAlarmType === "Prescription" ||
       selectedAlarmType === "Dialysis") && 
      !description
    ) {
      errors.description = true;
    }

    if (selectTimings === "Daily/Weekly") {
      if (weekdays.length === 0) errors.weekdays = true;
      if (timings.some(t => !t)) errors.timings = true;
    } else if (selectTimings === "Monthly") {
      if (dateOfMonth.some(d => !d)) errors.dateOfMonth = true;
      if (timings.some(t => !t)) errors.timings = true;
    }

    if (!doctorid) errors.doctor = true;

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
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
        doctor: "Please select Doctor",
      };
      const firstErrorKey = Object.keys(errors)[0];
      setErrorMessage(errorMessages[firstErrorKey] || "Please fill all required fields");
      return false;
    }

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

      const updateRunner = () => updateAlarm(alarmData.id, payload);
      const res = mutate
        ? await mutate(updateRunner, {
            waitForRefetch: true,
            refetchKeys: [`alarms_${pid}`],
          })
        : await updateRunner();
      if (res.success) {
        if (onSuccess) {
          await onSuccess();
        }
        closeModal();
      } else {
        const msg = typeof res.data === 'string' ? res.data : res.data?.message || "Error updating alarm";
        setErrorMessage(msg);
      }
    } catch (error) {
      console.error("Error updating alarm:", error);
      const msg = error?.message || "Error updating alarm. Please try again.";
      setErrorMessage(msg.includes("Network") ? "Network error — please check your connection." : msg);
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
        }

        if (prescriptionData.success && prescriptionData.data.data?.length > 0) {
          setPrescription(prescriptionData.data.data);
        }

        // Load doses if Prescription type
        if (alarmData?.type === "Prescription" && dosesData?.length > 0) {
          const alarmDoses = dosesData.find((dose) => dose[0]?.alarmID === alarmData.id);
          if (alarmDoses) {
            setDoses(alarmDoses.map((d) => d.doses));
            setDoseUnit(alarmDoses.map((d) => d.unitType));
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage("Error loading form data");
      }
    };

    fetchData();
  }, [pid, alarmData.id, alarmData.type, dosesData]);

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
      <Flex key={index} gap={2} align="flex-end">
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
      </Flex>
    ));
  };

  return (
    <FormModal
      isOpen={true}
      onClose={closeModal}
      onSubmit={handleSubmit}
      title="Edit Alarm"
      submitText="Submit"
      cancelText="Cancel"
      isLoading={isSubmitting}
      errorMessage={errorMessage}
      fieldErrors={fieldErrors}
      onFieldErrorClear={(field) => setFieldErrors((prev) => ({ ...prev, [field]: false }))}
      size="2xl"
    >
      {/* Alarm Type */}
      <FormControl isRequired isInvalid={Boolean(fieldErrors.alarmType)}>
        <FormLabel>Alarm Type</FormLabel>
        <Select
          isInvalid={Boolean(fieldErrors.alarmType)}
          value={selectedAlarmType}
          onChange={(e) => {
            setSelectedAlarmType(e.target.value);
            setSelectedHealthParameter("");
            setFieldErrors((prev) => ({ ...prev, alarmType: false }));
            setErrorMessage("");
          }}
        >
          <option value="">Select Alarm Type</option>
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
            isInvalid={Boolean(fieldErrors.healthParameter)}
            value={selectedHealthParameter}
            onChange={(e) => {
              setSelectedHealthParameter(e.target.value);
              setFieldErrors((prev) => ({ ...prev, healthParameter: false }));
              setErrorMessage("");
            }}
          >
            <option value="">Select Parameter</option>
            {drOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Dialysis Parameter */}
      {selectedAlarmType === "Dialysis" && (
        <FormControl isRequired>
          <FormLabel>Set Dialysis Parameter</FormLabel>
          <Select
            value={selectedHealthParameter}
            onChange={(e) => setSelectedHealthParameter(e.target.value)}
          >
            <option value="">Select Parameter</option>
            {dirOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Prescription Selection */}
      {selectedAlarmType === "Prescription" && (
        <FormControl isRequired isInvalid={Boolean(fieldErrors.prescription)}>
          <FormLabel>Select Prescription</FormLabel>
          <Box className="border border-gray-200 rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
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
                          setFieldErrors((prev) => ({ ...prev, prescription: false }));
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
      )}

      {/* Description */}
      {(selectedAlarmType === "Diet Details" ||
        selectedAlarmType === "Prescription" ||
        selectedAlarmType === "Dialysis") && (
        <FormControl isRequired isInvalid={Boolean(fieldErrors.description)}>
          <FormLabel>Short Description</FormLabel>
          <Input
            isInvalid={Boolean(fieldErrors.description)}
            type="text"
            placeholder="Enter description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setFieldErrors((prev) => ({ ...prev, description: false }));
              setErrorMessage("");
            }}
          />
          {/* <FormHelperText>Provide brief description</FormHelperText> */}
        </FormControl>
      )}

      {/* Frequency */}
      <FormControl isRequired>
        {/* <FormLabel>Frequency</FormLabel> */}
        <Flex gap={6}>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="frequency"
              value="Daily/Weekly"
              checked={selectTimings === "Daily/Weekly"}
              onChange={(e) => {
                setSelectTimings(e.target.value);
                handleTimesChange(1);
                setErrorMessage("");
              }}
              className="w-4 h-4"
            />
            <span className="text-sm">Daily/Weekly</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="frequency"
              value="Monthly"
              checked={selectTimings === "Monthly"}
              onChange={(e) => {
                setSelectTimings(e.target.value);
                handleTimesChange(1);
                setErrorMessage("");
              }}
              className="w-4 h-4"
            />
            <span className="text-sm">Monthly</span>
          </label>
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
                  setFieldErrors((prev) => ({ ...prev, weekdays: false }));
                  setErrorMessage("");
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
          isInvalid={Boolean(fieldErrors.doctor)}
          value={doctorid}
          onChange={(e) => {
            setDoctorid(e.target.value);
            setFieldErrors((prev) => ({ ...prev, doctor: false }));
            setErrorMessage("");
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
    </FormModal>
  );
};

export default EditAlarmModal;
