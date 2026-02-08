/**
 * AlarmModal Component - Redesigned
 * Following component library and design system patterns
 * 
 * @file src/pages/ShowAlarms/AlarmModal.jsx
 */

import React, { useState, useEffect } from "react";
import { FaFilePdf } from "react-icons/fa6";

// Component Library
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from "../../component-library/primitives/Modal";
import { Button } from "../../component-library/primitives/Button";
import { Box, Flex, VStack, HStack } from "../../component-library/layout/Layout";
import { Heading, Text } from "../../component-library/primitives/Typography";

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

const AlarmModal = ({ closeModal, pid }) => {
  const [selectedAlarmType, setSelectedAlarmType] = useState("Dialysis");
  const [selectedHealthParameter, setSelectedHealthParameter] = useState("");
  const [selectTimings, setSelectTimings] = useState("Daily/Weekly");
  const [description, setDescription] = useState("");
  const [weekdays, setweekdays] = useState([]);
  const [timesaday, setTimesaday] = useState(1);
  const [timings, setTimings] = useState([]);
  const [dateOfMonth, setDOM] = useState([]);
  const [doctorid, setDoctorid] = useState();
  const [consultDoctor, setConsultDoctor] = useState([]);
  const [prescription, setPrescription] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState("");
  const [viewPrescription, setViewPrescription] = useState(null);
  const [msg, setMsg] = useState("");
  const [drOptions, setDrOptions] = useState([]);
  const [dirOptions, setDirOptions] = useState([]);
  const [messageToDoctor, setMessageToDoctor] = useState("");
  const [doses, setDoses] = useState([]);
  const [doseUnit, setDoseUnit] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheck = (event) => {
    var updatedList = [...weekdays];
    if (event.target.checked) {
      updatedList = [...weekdays, event.target.value];
    } else {
      updatedList.splice(weekdays.indexOf(event.target.value), 1);
    }
    setweekdays(updatedList);
  };

  const validate = () => {
    if (selectedAlarmType === "Health Reading") {
      if (selectedHealthParameter === "") {
        setMsg("Please select Parameter");
        return false;
      }
    } else if (selectedAlarmType === "Prescription") {
      if (timings.length === 0) {
        setMsg("Please select Time");
        return false;
      }
      if (doses.length === 0) {
        setMsg("Please enter Dose");
        return false;
      }
      if (doseUnit.length === 0) {
        setMsg("Please select Dose Unit");
        return false;
      }
      if (selectTimings === "Daily/Weekly" && weekdays.length === 0) {
        setMsg("Please select Week Days");
        return false;
      }

      if (selectedPrescription === "") {
        setMsg("Please select Prescription");
        return false;
      }
    } else if (
      description === "" &&
      (selectedAlarmType === "Diet Details" ||
        selectedAlarmType === "Prescription")
    ) {
      setMsg("Please enter Description");
      return false;
    } else if (selectTimings === "Daily/Weekly") {
      if (weekdays.length === 0) {
        setMsg("Please select Week Days");
        return false;
      } else if (timesaday === 0) {
        setMsg("Please select How Many Times A Day");
        return false;
      } else if (timings.length < timesaday) {
        setMsg("Please select Time");
        return false;
      }
    } else if (selectTimings === "Monthly") {
      if (timesaday === 0) {
        setMsg("Please select How Many Times A Month");
        return false;
      } else if (dateOfMonth.length < timesaday) {
        setMsg("Please select Date Of The Month");
        return false;
      } else if (timings.length < timesaday) {
        setMsg("Please select Time");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (validate()) {
      setIsSubmitting(true);
      let missingFields = [];

      // Common required fields
      if (!doctorid) missingFields.push("Doctor ID");
      if (!selectedAlarmType) missingFields.push("Alarm Type");
      if (!selectTimings) missingFields.push("Timing Selection");
      if (!pid) missingFields.push("Patient ID");

      // Conditional validations based on Alarm Type
      if (selectedAlarmType === "Health Reading") {
        if (!selectedHealthParameter) {
          missingFields.push("Health Parameter");
        }
      } else {
        if (!description) missingFields.push("Description");
      }

      if (selectedAlarmType === "Prescription") {
        let prescriptionMissingFields = [];

        if (!selectedPrescription)
          prescriptionMissingFields.push("Prescription ID");
        if (doses.length === 0) prescriptionMissingFields.push("Doses");
        if (doseUnit.length === 0) prescriptionMissingFields.push("Dose Unit");
        if (timings.length === 0) prescriptionMissingFields.push("Timings");

        if (prescriptionMissingFields.length > 0) {
          setMsg(
            `Please provide all prescription details: ${prescriptionMissingFields.join(
              ", "
            )}`
          );
          setIsSubmitting(false);
          return;
        }
      }

      if (selectTimings === "Daily/Weekly") {
        let dailyMissingFields = [];
        if (!weekdays.length) dailyMissingFields.push("Weekdays");
        if (!timesaday) dailyMissingFields.push("Times a Day");
        if (!timings.length) dailyMissingFields.push("Timings");

        if (dailyMissingFields.length > 0) {
          setMsg(
            `Please provide valid daily/weekly scheduling details: ${dailyMissingFields.join(
              ", "
            )}`
          );
          setIsSubmitting(false);
          return;
        }
      } else if (selectTimings === "Monthly") {
        let monthlyMissingFields = [];
        if (!dateOfMonth.length) monthlyMissingFields.push("Date of Month");
        if (!timesaday) monthlyMissingFields.push("Times a Month");
        if (!timings.length) monthlyMissingFields.push("Timings");

        if (monthlyMissingFields.length > 0) {
          setMsg(
            `Please provide valid monthly scheduling details: ${monthlyMissingFields.join(
              ", "
            )}`
          );
          setIsSubmitting(false);
          return;
        }
      }

      // If there are any general missing fields, show them
      if (missingFields.length > 0) {
        setMsg(
          `Please fill in all required fields: ${missingFields.join(", ")}`
        );
        setIsSubmitting(false);
        return;
      }

      // Prepare the payload
      const payload = {
        doctorId: doctorid,
        type: selectedAlarmType,
        description: description,
        message: messageToDoctor,
        frequency: selectTimings,
        status: "Pending",
        reason: "",
        pid: pid,
        prescriptionid: null,
        doses: null,
        doseUnit: null,
      };

      if (selectedAlarmType === "Health Reading") {
        payload.parameter = selectedHealthParameter;
      }

      if (selectedAlarmType === "Prescription") {
        payload.prescriptionid = selectedPrescription;
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

      // Submit the alarm
      try {
        const res = await insertAlarm(payload);
        if (res.success) {
          console.log("Alarm inserted successfully");
          closeModal();
        } else {
          console.log("Error inserting alarm", res);
          setMsg("Error inserting alarm");
        }
      } catch (error) {
        console.error("Error inserting alarm:", error);
        setMsg("Error inserting alarm");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  useEffect(() => {
    const fetchPatientData = async () => {
      const result = await getDailyReadings();
      const DirResult = await getDialysisReadings();
      if (result.success && DirResult.success) {
        setDrOptions(
          result.data.map((dr) => {
            return { value: dr.title, label: dr.title };
          })
        );
        setDirOptions(
          DirResult.data.map((dr) => {
            return { value: dr.title, label: dr.title };
          })
        );
      } else {
        console.error("Failed to Readings:", result.data, DirResult.data);
      }
      const response = await getPatientMedicalTeam(pid);
      if (response.success) {
        setConsultDoctor(response.data.data);
        setDoctorid(response.data.data[0].id);
      }
      const responsePres = await getPrescriptionByPatient(pid);
      if (responsePres.success) {
        setPrescription(responsePres.data.data);
        setSelectedPrescription(responsePres.data?.data[0]?.id);
      }
    };
    fetchPatientData();
  }, []);

  const renderComponent = () => {
    if (selectTimings === "Daily/Weekly") {
      return (
        <VStack spacing={4} align="stretch">
          <Box>
            <Text weight="semibold" className="mb-3 text-[#393939]">Select Week Days*</Text>
            <Flex gap={3} wrap="wrap">
              {["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"].map((day) => (
                <label key={day} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={day}
                    onChange={handleCheck}
                    className="w-4 h-4 text-[#4164df] border-gray-300 rounded focus:ring-[#4164df]"
                  />
                  <span className="text-sm text-gray-700">{day}</span>
                </label>
              ))}
            </Flex>
          </Box>

          <Box>
            <label className="block text-sm font-semibold text-[#393939] mb-2">
              How Many Times A Day*
            </label>
            <select
              value={timesaday}
              className="w-full px-4 py-3 border border-gray-300 rounded-[10px] focus:outline-none focus:border-[#4164df] text-gray-700"
              onChange={(e) => {
                setTimings(Array(parseInt(e.target.value)));
                setTimesaday(e.target.value);
                setDOM(Array(parseInt(e.target.value)));
                setDoses(Array(parseInt(e.target.value)));
                setDoseUnit(Array(parseInt(e.target.value)));
              }}
            >
              {timing.map((time, index) => (
                <option key={index} value={time.value}>
                  {time.label}
                </option>
              ))}
            </select>
          </Box>

          <Box>
            <label className="block text-sm font-semibold text-[#393939] mb-2">
              Time*
            </label>
            <VStack spacing={3} align="stretch">
              {Array.from(Array(parseInt(timesaday))).map((_, index) => (
                <Flex key={index} gap={2} align="center">
                  <input
                    type="time"
                    value={timings[index]}
                    onChange={(e) => {
                      let temp = [...timings];
                      temp[index] = e.target.value;
                      setTimings(temp);
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-[10px] focus:outline-none focus:border-[#4164df]"
                  />
                  {selectedAlarmType === "Prescription" && (
                    <>
                      <input
                        type="number"
                        value={doses[index]}
                        placeholder="Dose"
                        onChange={(e) => {
                          let temp = [...doses];
                          temp[index] = e.target.value;
                          setDoses(temp);
                        }}
                        className="w-24 px-4 py-3 border border-gray-300 rounded-[10px] focus:outline-none focus:border-[#4164df]"
                      />
                      <select
                        name="doseUnit"
                        className="w-28 px-4 py-3 border border-gray-300 rounded-[10px] focus:outline-none focus:border-[#4164df]"
                        value={doseUnit[index]}
                        onChange={(e) => {
                          let temp = [...doseUnit];
                          temp[index] = e.target.value;
                          setDoseUnit(temp);
                        }}
                      >
                        <option value={null}>Unit</option>
                        {dosesOptions.map((option, index) => (
                          <option key={index} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                </Flex>
              ))}
            </VStack>
          </Box>

          <Box>
            <label className="block text-sm font-semibold text-[#393939] mb-2">
              Select Doctor For Approval*
            </label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-[10px] focus:outline-none focus:border-[#4164df] text-gray-700"
              onChange={(e) => setDoctorid(e.target.value)}
            >
              {consultDoctor.map((doc, index) => (
                <option key={index} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
          </Box>
        </VStack>
      );
    } else if (selectTimings === "Monthly") {
      return (
        <VStack spacing={4} align="stretch">
          <Box>
            <label className="block text-sm font-semibold text-[#393939] mb-2">
              How Many Times A Month*
            </label>
            <select
              value={timesaday}
              className="w-full px-4 py-3 border border-gray-300 rounded-[10px] focus:outline-none focus:border-[#4164df] text-gray-700"
              onChange={(e) => {
                setTimings(Array(parseInt(e.target.value)));
                setTimesaday(e.target.value);
                setDOM(Array(parseInt(e.target.value)));
                setDoses(Array(parseInt(e.target.value)));
                setDoseUnit(Array(parseInt(e.target.value)));
              }}
            >
              {timing.map((time, index) => (
                <option key={index} value={time.value}>
                  {time.label}
                </option>
              ))}
            </select>
          </Box>

          <VStack spacing={3} align="stretch">
            {Array.from(Array(parseInt(timesaday))).map((_, index) => (
              <Box key={index}>
                <label className="block text-sm font-semibold text-[#393939] mb-2">
                  Date Of The Month*
                </label>
                <Flex gap={2} align="center">
                  <select
                    name="dateOfMonth"
                    className="w-24 px-4 py-3 border border-gray-300 rounded-[10px] focus:outline-none focus:border-[#4164df]"
                    value={dateOfMonth[index]}
                    onChange={(e) => {
                      let temp = [...dateOfMonth];
                      temp[index] = e.target.value;
                      setDOM(temp);
                    }}
                  >
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(
                      (number, index) => (
                        <option key={index} value={number}>
                          {number}
                        </option>
                      )
                    )}
                  </select>

                  <input
                    type="time"
                    value={timings[index]}
                    onChange={(e) => {
                      let temp = [...timings];
                      temp[index] = e.target.value;
                      setTimings(temp);
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-[10px] focus:outline-none focus:border-[#4164df]"
                  />
                  {selectedAlarmType === "Prescription" && (
                    <>
                      <input
                        type="number"
                        value={doses[index]}
                        placeholder="Dose"
                        onChange={(e) => {
                          let temp = [...doses];
                          temp[index] = e.target.value;
                          setDoses(temp);
                        }}
                        className="w-24 px-4 py-3 border border-gray-300 rounded-[10px] focus:outline-none focus:border-[#4164df]"
                      />
                      <select
                        name="doseUnit"
                        className="w-28 px-4 py-3 border border-gray-300 rounded-[10px] focus:outline-none focus:border-[#4164df]"
                        value={doseUnit[index]}
                        onChange={(e) => {
                          let temp = [...doseUnit];
                          temp[index] = e.target.value;
                          setDoseUnit(temp);
                        }}
                      >
                        <option value={null}>Unit</option>
                        {dosesOptions.map((option, index) => (
                          <option key={index} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                </Flex>
              </Box>
            ))}
          </VStack>

          <Box>
            <label className="block text-sm font-semibold text-[#393939] mb-2">
              Select Doctor For Approval*
            </label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-[10px] focus:outline-none focus:border-[#4164df] text-gray-700">
              {consultDoctor.map((doc, index) => (
                <option key={index} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
          </Box>
        </VStack>
      );
    }
    return null;
  };

  return (
    <Modal isOpen={true} onClose={closeModal} size="4xl" isCentered>
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent className="rounded-2xl overflow-hidden" style={{ maxHeight: '90vh' }}>
        <ModalHeader className="border-b bg-gray-50/50 py-4 px-6">
          <HStack justify="between" align="center">
            <Heading size="md" weight="bold" className="text-[#393939]">
              Add Alarm
            </Heading>
            <ModalCloseButton className="static p-0 hover:bg-gray-100 rounded-full" />
          </HStack>
        </ModalHeader>

        <ModalBody className="p-6 overflow-y-auto">
          <VStack spacing={4} align="stretch">
            {/* Alarm Type */}
            <Box>
              <label className="block text-sm font-semibold text-[#393939] mb-2">
                Alarm Type*
              </label>
              <select
                onChange={(e) => {
                  setSelectedAlarmType(e.target.value);
                  setSelectedHealthParameter("");
                }}
                value={selectedAlarmType}
                className="w-full px-4 py-3 border border-gray-300 rounded-[10px] focus:outline-none focus:border-[#4164df] text-gray-700"
              >
                <option className="text-gray-400">Select Alarm Type</option>
                {alarmTypeOptions.map((type, index) => (
                  <option key={index} value={type.label}>
                    {type.label}
                  </option>
                ))}
              </select>
            </Box>

            {/* Health Parameter */}
            {selectedAlarmType !== "Diet Details" &&
              selectedAlarmType !== "Prescription" &&
              selectedAlarmType !== "Dialysis" && (
              <Box>
                <label className="block text-sm font-semibold text-[#393939] mb-2">
                    {selectedAlarmType &&
                      alarmTypeOptions.find(
                        (type) => type.label === selectedAlarmType
                      )?.title}
                  </label>
                  <select
                    value={selectedHealthParameter}
                    onChange={(e) => setSelectedHealthParameter(e.target.value)}
                    disabled={!selectedAlarmType}
                  className="w-full px-4 py-3 border border-gray-300 rounded-[10px] focus:outline-none focus:border-[#4164df] text-gray-700"
                  >
                  <option>Select Parameter</option>
                    {selectedAlarmType === "Dialysis"
                      ? dirOptions.map((option, index) => (
                          <option key={index} value={option.value}>
                            {option.label}
                          </option>
                        ))
                      : drOptions.map((option, index) => (
                          <option key={index} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                  </select>
              </Box>
              )}

            {/* Prescription Selection */}
            {selectedAlarmType === "Prescription" && (
              <Box>
                <label className="block text-sm font-semibold text-[#393939] mb-2">
                  Select Prescription*
                </label>
                <Box className="border border-gray-200 rounded-[10px] overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="text-sm text-gray-700 border-b-2 border-gray-200 bg-gray-50">
                      <tr>
                        <th className="px-6 py-3">Image</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Select</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescription.map((pres, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="px-6 py-4">
                            {pres.Prescription?.endsWith(".pdf") ? (
                              <FaFilePdf className="w-12 h-12 text-red-500" />
                            ) : (
                              <img
                                src={pres.Prescription}
                                  alt="prescription"
                                  className="h-12 w-12 object-cover rounded cursor-pointer"
                                onClick={() => {
                                  if (viewPrescription === index + 1) {
                                    setViewPrescription(null);
                                  } else {
                                    setViewPrescription(index + 1);
                                  }
                                }}
                              />
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {new Date(pres.Date).toDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="radio"
                              name="prescription"
                              value={pres.id}
                              onChange={(e) => {
                                setSelectedPrescription(e.target.value);
                              }}
                              className="w-4 h-4 text-[#4164df] border-gray-300 focus:ring-[#4164df]"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </Box>
            )}

            {/* Description */}
            {(selectedAlarmType === "Diet Details" ||
              selectedAlarmType === "Prescription" ||
              selectedAlarmType === "Dialysis") && (
                <Box>
                  <label className="block text-sm font-semibold text-[#393939] mb-2">
                    Short Description*
                  </label>
                <input
                  type="text"
                  value={description}
                  className="w-full px-4 py-3 border border-gray-300 rounded-[10px] focus:outline-none focus:border-[#4164df]"
                  onChange={(e) => setDescription(e.target.value)}
                />
                </Box>
              )}

            {/* Frequency Selection */}
            <Box>
              <label className="block text-sm font-semibold text-[#393939] mb-3">
                Frequency*
              </label>
              <Flex gap={6}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    name="regularity"
                    type="radio"
                    value="Daily/Weekly"
                    checked={selectTimings === "Daily/Weekly"}
                    onChange={(e) => setSelectTimings(e.target.value)}
                    className="w-4 h-4 text-[#4164df] border-gray-300 focus:ring-[#4164df]"
                  />
                  <span className="text-sm text-gray-700">Daily/Weekly</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    name="regularity"
                    type="radio"
                    value="Monthly"
                    checked={selectTimings === "Monthly"}
                    onChange={(e) => setSelectTimings(e.target.value)}
                    className="w-4 h-4 text-[#4164df] border-gray-300 focus:ring-[#4164df]"
                  />
                  <span className="text-sm text-gray-700">Monthly</span>
                </label>
              </Flex>
            </Box>

            {/* Dynamic Component */}
            {renderComponent()}

            {/* Error Message */}
            {msg && (
              <Box className="p-3 bg-red-50 border border-red-200 rounded-[10px]">
                <Text size="sm" className="text-red-600">{msg}</Text>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter className="border-t bg-gray-50/50 px-6 py-4">
          <HStack spacing={3} justify="end">
            <Button
              variant="outline"
              onClick={closeModal}
              className="px-6 py-2 rounded-[10px] border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              className="px-6 py-2 rounded-[10px] bg-[#4164df] text-white hover:bg-[#3451c9]"
            >
              Submit
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AlarmModal;
