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
import { SortDropdown } from "../../component-library/primitives";

// Layout & Typography
import { Box, Flex, VStack, HStack, Stack } from "../../component-library/layout/Layout";
import { Text } from "../../component-library/primitives/Typography";

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
import sortIcon from "../../assets/Sort_Amount_Up.svg";

const ALARM_TYPE_DROPDOWN_OPTIONS = alarmTypeOptions.map((option) => ({
  value: option.label,
  label: option.label,
}));

const AlarmModal = ({ closeModal, pid }) => {
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation
  const validate = () => {
    setErrorMessage("");

    if (!selectedAlarmType) {
      setErrorMessage("Please select Alarm Type");
      return false;
    }

    if (selectedAlarmType === "Health Reading") {
      if (!selectedHealthParameter) {
        setErrorMessage("Please select Parameter");
        return false;
      }
    }

    if (selectedAlarmType === "Prescription") {
      if (!selectedPrescription) {
        setErrorMessage("Please select Prescription");
        return false;
      }
      if (doses.some(d => !d)) {
        setErrorMessage("Please enter Dose for all times");
        return false;
      }
      if (doseUnit.some(u => !u)) {
        setErrorMessage("Please select Dose Unit for all times");
        return false;
      }
      if (timings.some(t => !t)) {
        setErrorMessage("Please select Time for all entries");
        return false;
      }
    }

    if (selectedAlarmType === "Diet Details" || selectedAlarmType === "Prescription") {
      if (!description) {
        setErrorMessage("Please enter Description");
        return false;
      }
    }

    if (selectTimings === "Daily/Weekly") {
      if (weekdays.length === 0) {
        setErrorMessage("Please select at least one weekday");
        return false;
      }
      if (timings.some(t => !t)) {
        setErrorMessage("Please select Time for all entries");
        return false;
      }
    } else if (selectTimings === "Monthly") {
      if (dateOfMonth.some(d => !d)) {
        setErrorMessage("Please select Date for all entries");
        return false;
      }
      if (timings.some(t => !t)) {
        setErrorMessage("Please select Time for all entries");
        return false;
      }
    }

    if (!doctorid) {
      setErrorMessage("Please select Doctor for approval");
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
          const defaultDoctorId = medicalTeam.data.data[0]?.id;
          setDoctorid(defaultDoctorId ? String(defaultDoctorId) : "");
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

  const doctorDropdownOptions = consultDoctor.map((doc) => ({
    value: String(doc.id),
    label: doc.name,
  }));

  return (
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
      size="xl"
    >
      {/* Alarm Type */}
      <FormControl isRequired isInvalid={!selectedAlarmType && errorMessage}>
        <FormLabel>Alarm Type</FormLabel>
        <SortDropdown
          value={selectedAlarmType}
          onChange={(e) => {
            setSelectedAlarmType(e.target.value);
            setSelectedHealthParameter("");
            setErrorMessage("");
          }}
          options={ALARM_TYPE_DROPDOWN_OPTIONS}
          placeholder="Select Alarm Type"
          icon={<img src={sortIcon} alt="Sort" />}
          className="sort-dropdown--block"
        />
        {/* <FormHelperText>Select the type of alarm</FormHelperText> */}
      </FormControl>

      {/* Health Parameter */}
      {selectedAlarmType === "Health Reading" && (
        <FormControl isRequired isInvalid={!selectedHealthParameter && errorMessage}>
          <FormLabel>Health Parameter</FormLabel>
          <SortDropdown
            value={selectedHealthParameter}
            onChange={(e) => {
              setSelectedHealthParameter(e.target.value);
              setErrorMessage("");
            }}
            options={drOptions}
            placeholder="Select Parameter"
            icon={<img src={sortIcon} alt="Sort" />}
            className="sort-dropdown--block"
          />
        </FormControl>
      )}

      {/* Dialysis Parameter */}
      {selectedAlarmType === "Dialysis" && (
        <FormControl isRequired>
          <FormLabel>Set Dialysis Parameter</FormLabel>
          <SortDropdown
            value={selectedHealthParameter}
            onChange={(e) => setSelectedHealthParameter(e.target.value)}
            options={dirOptions}
            placeholder="Select Parameter"
            icon={<img src={sortIcon} alt="Sort" />}
            className="sort-dropdown--block"
          />
        </FormControl>
      )}

      {/* Prescription Selection */}
      {selectedAlarmType === "Prescription" && (
        <FormControl isRequired isInvalid={!selectedPrescription && errorMessage}>
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
          <FormControl isRequired>
            <FormLabel>Short Description</FormLabel>
            <Input
              type="text"
              placeholder="Enter description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
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
        <FormControl isRequired isInvalid={weekdays.length === 0 && errorMessage}>
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
      <FormControl isRequired isInvalid={!doctorid && errorMessage}>
        <FormLabel>Select Doctor for Approval</FormLabel>
        <SortDropdown
          value={doctorid}
          onChange={(e) => {
            setDoctorid(e.target.value);
            setErrorMessage("");
          }}
          options={doctorDropdownOptions}
          placeholder="Select Doctor"
          icon={<img src={sortIcon} alt="Sort" />}
          className="sort-dropdown--block"
        />
        {/* <FormHelperText>Choose doctor who will approve this alarm</FormHelperText> */}
      </FormControl>
    </FormModal>
  );
};

export default AlarmModal;
