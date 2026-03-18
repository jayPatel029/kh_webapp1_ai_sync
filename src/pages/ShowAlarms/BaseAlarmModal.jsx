/**
 * BaseAlarmModal Component - Shared alarm form logic
 * Used by both AddAlarmModal and EditAlarmModal
 * 
 * @file src/pages/ShowAlarms/BaseAlarmModal.jsx
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { FaFilePdf } from "react-icons/fa6";

// Component Library - Modals & Forms
import { FormModal } from "../../component-library/modals/FormModal";
import {
  FormControl,
  FormLabel,
} from "../../component-library/primitives/FormControl";
import { Input } from "../../component-library/primitives/Input";
import { Select } from "../../component-library/primitives/Select";
import { Checkbox } from "../../component-library/primitives/Checkbox";

// Layout & Typography
import { Box, Flex, GridItem } from "../../component-library/layout/Layout";
import { Text } from "../../component-library/primitives/Typography";
import MyPDFViewer from "../../components/pdf/MyPDFViewer";

// APIs
import { getPatientMedicalTeam } from "../../ApiCalls/patientAPis";
import { getPrescriptionByPatient } from "../../ApiCalls/prescriptionApis";
import { alarmTypeOptions, timing, dosesOptions } from "./consts";
import {
  getDailyReadings,
  getDialysisReadings,
} from "../../ApiCalls/readingsApis";

// Import design system styles
import "../../design-system/styles/index.css";
import { Grid } from "../../component-library/layout/Layout";

// Request cache and deduplication
const requestCache = new Map();
const pendingRequests = new Map();

const getCachedRequest = (key, ttlMs = 5 * 60 * 1000) => {
  const cached = requestCache.get(key);
  if (cached && Date.now() - cached.timestamp < ttlMs) {
    // Cache valid for ttlMs
    return cached.data;
  }
  requestCache.delete(key);
  return null;
};

const setCachedRequest = (key, data) => {
  requestCache.set(key, { data, timestamp: Date.now() });
};

const makeDedupedRequest = async (
  key,
  requestFn,
  options = { force: false, ttlMs: 5 * 60 * 1000 }
) => {
  // If a request for this key is already in flight, reuse it
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  // Try to return cached result when not forcing
  const cached = getCachedRequest(key, options.ttlMs);
  if (cached && !options.force) {
    // Start a background refresh to keep cache up-to-date (stale-while-revalidate)
    const bgPromise = (async () => {
      try {
        const fresh = await requestFn();
        setCachedRequest(key, fresh);
        return fresh;
      } catch (err) {
        // Swallow background errors; we'll continue returning cached data
        console.debug(`Background refresh for ${key} failed:`, err);
        throw err;
      } finally {
        pendingRequests.delete(key);
      }
    })();

    pendingRequests.set(key, bgPromise);
    // Return cached immediately while refresh happens in background
    return cached;
  }

  // No cache or force refresh requested: perform the request now
  const promise = (async () => {
    try {
      const result = await requestFn();
      setCachedRequest(key, result);
      return result;
    } finally {
      pendingRequests.delete(key);
    }
  })();

  pendingRequests.set(key, promise);
  return promise;
};

const BaseAlarmModal = ({
  closeModal,
  isEdit = false,
  alarmData = null,
  pid,
  dosesData = [],
  mutate,
  onSuccess,
  title = "Add Alarm",
  submitText = "Submit",
  onSubmit,
  showPrescriptionViewer = true,
}) => {
  const extractArrayFromResponse = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.result)) return res.result;
    if (Array.isArray(res.items)) return res.items;

    // Find first array in the object values
    const nestedArray = Object.values(res).find(Array.isArray);
    return Array.isArray(nestedArray) ? nestedArray : [];
  };
  // Request tracking refs to prevent duplicate requests
  const hasInitialized = useRef(false);
  const lastFetchTimeRef = useRef(0);
  const fetchTimeoutRef = useRef(null);
  const FETCH_THROTTLE_MS = 1000; // Wait at least 1 second between fetches
  // Form state
  const [selectedAlarmType, setSelectedAlarmType] = useState(
    alarmData?.type || "Dialysis"
  );
  const [selectedHealthParameter, setSelectedHealthParameter] = useState(
    alarmData?.parameter || ""
  );
  const [selectTimings, setSelectTimings] = useState(
    alarmData?.frequency || "Daily/Weekly"
  );
  const [description, setDescription] = useState(alarmData?.description || "");
  const [weekdays, setWeekdays] = useState(
    alarmData?.weekdays?.split(",") || []
  );
  const [timesaday, setTimesaday] = useState(alarmData?.timesaday || 1);
  const [timings, setTimings] = useState(
    alarmData?.time?.split(",") || Array(1).fill("")
  );
  const [dateOfMonth, setDOM] = useState(
    alarmData?.dateofmonth?.split(",") || Array(1).fill("")
  );
  const [doctorid, setDoctorid] = useState(
    alarmData?.doctorId
      ? String(alarmData.doctorId)
      : alarmData?.doctor_id
      ? String(alarmData.doctor_id)
      : ""
  );
  const [selectedPrescription, setSelectedPrescription] = useState(
    alarmData?.prescriptionid || alarmData?.prescription_id || ""
  );
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
      if (doses.some((d) => !d)) {
        nextFieldErrors.doses = true;
      }
      if (doseUnit.some((u) => !u)) {
        nextFieldErrors.doseUnit = true;
      }
      if (timings.some((t) => !t)) {
        nextFieldErrors.timings = true;
      }
    }

    if (
      selectedAlarmType === "Diet Details" ||
      selectedAlarmType === "Prescription" ||
      selectedAlarmType === "Dialysis"
    ) {
      if (!description) {
        nextFieldErrors.description = true;
      }
    }

    if (selectTimings === "Daily/Weekly") {
      if (weekdays.length === 0) {
        nextFieldErrors.weekdays = true;
      }
      if (timings.some((t) => !t)) {
        nextFieldErrors.timings = true;
      }
    } else if (selectTimings === "Monthly") {
      if (dateOfMonth.some((d) => !d)) {
        nextFieldErrors.dateOfMonth = true;
      }
      if (timings.some((t) => !t)) {
        nextFieldErrors.timings = true;
      }
    }

    if (!doctorid) {
      nextFieldErrors.doctor = true;
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
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
        parameter:
          selectedAlarmType === "Health Reading" ? selectedHealthParameter : "",
        description: description,
        frequency: selectTimings,
        status: selectedAlarmType === "Prescription" ? "Pending" : "Approved",
        pid: pid,
        prescriptionid:
          selectedAlarmType === "Prescription" ? selectedPrescription : null,
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

      const res = await onSubmit(payload);
      if (res.success) {
        if (onSuccess) {
          await onSuccess();
        }
        closeModal();
      } else {
        const msg =
          typeof res.data === "string"
            ? res.data
            : res.data?.message || `Error ${isEdit ? "updating" : "inserting"} alarm`;
        setErrorMessage(msg);
      }
    } catch (error) {
      console.error(`Error ${isEdit ? "updating" : "inserting"} alarm:`, error);
      const msg = error?.message || `Error ${isEdit ? "updating" : "inserting"} alarm. Please try again.`;
      setErrorMessage(
        msg.includes("Network")
          ? "Network error — please check your connection."
          : msg
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch data when pid changes (or on initial mount) with throttling
  useEffect(() => {
    if (!pid) return;

    const abortController = new AbortController();
    let isMounted = true;

    const fetchData = async () => {
      // Prevent rapid successive fetches
      const now = Date.now();
      if (now - lastFetchTimeRef.current < FETCH_THROTTLE_MS) {
        return;
      }
      lastFetchTimeRef.current = now;

      try {
        // Use deduped requests to prevent multiple identical API calls
        const [drResult, dirResult, medicalTeam, prescriptionData] =
          await Promise.all([
            makeDedupedRequest("daily-readings", getDailyReadings),
            makeDedupedRequest("dialysis-readings", getDialysisReadings),
            makeDedupedRequest(`medical-team-${pid}`, () =>
              getPatientMedicalTeam(pid)
            ),
            makeDedupedRequest(`prescriptions-${pid}`, () =>
              getPrescriptionByPatient(pid)
            ),
          ]);

        if (!isMounted) return;

        if (drResult?.success) {
          const drList = extractArrayFromResponse(drResult.data);
          setDrOptions(
            drList.map((dr) => ({
              value: dr?.title || dr?.name || dr?.label || "",
              label: dr?.title || dr?.name || dr?.label || "",
            }))
          );
        }

        if (dirResult?.success) {
          const dirList = extractArrayFromResponse(dirResult.data);
          setDirOptions(
            dirList.map((dr) => ({
              value: dr?.title || dr?.name || dr?.label || "",
              label: dr?.title || dr?.name || dr?.label || "",
            }))
          );
        }

        if (medicalTeam?.success) {
          const team = extractArrayFromResponse(medicalTeam.data);
          if (team.length > 0) {
            setConsultDoctor(team);
            if (!doctorid) {
              const firstMember = team[0];
              setDoctorid(
                firstMember?.id
                  ? String(firstMember.id)
                  : firstMember?._id
                  ? String(firstMember._id)
                  : firstMember?.doctor_id
                  ? String(firstMember.doctor_id)
                  : ""
              );
            }
          }
        }

        if (prescriptionData?.success) {
          const prescriptionList = extractArrayFromResponse(prescriptionData.data);
          if (prescriptionList.length > 0) {
            setPrescription(prescriptionList);
            if (!selectedPrescription) {
              setSelectedPrescription(prescriptionList[0]?.id || "");
            }
          }
        }

        // Load doses if Prescription type and isEdit
        if (
          isEdit &&
          alarmData?.type === "Prescription" &&
          dosesData?.length > 0
        ) {
          const alarmDoses = dosesData.find(
            (dose) => dose[0]?.alarmID === alarmData.id
          );
          if (alarmDoses) {
            setDoses(alarmDoses.map((d) => d.doses));
            setDoseUnit(alarmDoses.map((d) => d.unitType));
          }
        }
      } catch (error) {
        // Only handle non-abort errors
        if (error.name !== "AbortError" && isMounted) {
          console.error("Error fetching data:", error);
          setErrorMessage("Error loading form data");
        }
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      isMounted = false;
      abortController.abort();
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [pid, isEdit, alarmData?.id, alarmData?.type, dosesData]);
  // When Prescription type is selected, ensure prescriptions are loaded and a selection is made
  useEffect(() => {
    if (selectedAlarmType !== "Prescription" || !pid) return;

    let isMounted = true;

    const loadPrescriptions = async () => {
      // If we don't have prescriptions yet, fetch them
      if (prescription.length === 0) {
        try {
          const prescriptionData = await makeDedupedRequest(`prescriptions-${pid}`, () =>
            getPrescriptionByPatient(pid)
          );

          if (!isMounted) return;

          if (prescriptionData?.success && prescriptionData.data.data?.length > 0) {
            setPrescription(prescriptionData.data.data);
          }
        } catch (error) {
          if (error.name !== "AbortError") {
            console.error("Error fetching prescriptions:", error);
            setErrorMessage("Error loading prescriptions");
          }
        }
      }

      // Once prescriptions are available, ensure a default selection is set
      if (prescription.length > 0) {
        setSelectedPrescription((prev) => prev || prescription[0]?.id || "");
        if (showPrescriptionViewer) {
          setViewPrescription(1);
        }
      }
    };

    loadPrescriptions();

    return () => {
      isMounted = false;
    };
  }, [selectedAlarmType, pid, prescription.length, showPrescriptionViewer]);

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
      <React.Fragment key={index}>
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
      </React.Fragment>
    ));
  };

  const modalSize = showPrescriptionViewer && selectedAlarmType === "Prescription" ? "8xl" : "2xl";
  const gridColumns = showPrescriptionViewer && selectedAlarmType === "Prescription" ? "1fr 2fr" : "1fr";

  return (
    <>
      <FormModal
        isOpen={true}
        onClose={closeModal}
        onSubmit={handleSubmit}
        title={title}
        submitText={submitText}
        cancelText="Cancel"
        submitVariant="secondary"
        cancelVariant="danger"
        isLoading={isSubmitting}
        errorMessage={errorMessage}
        size={modalSize}
        fieldErrors={fieldErrors}
        onFieldErrorClear={(field) =>
          setFieldErrors((prev) => ({ ...prev, [field]: false }))
        }
      >
        <Grid gap={6} className="!min-w-full" templateColumns={gridColumns}>
          <GridItem colSpan={1} className="gap-8 min-w-0">
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
            </FormControl>

            {/* Health Parameter */}
            {selectedAlarmType === "Health Reading" && (
              <FormControl
                isRequired
                isInvalid={Boolean(fieldErrors.healthParameter)}
              >
                <FormLabel>Health Parameter</FormLabel>
                <Select
                  value={selectedHealthParameter}
                  isInvalid={Boolean(fieldErrors.healthParameter)}
                  onChange={(e) => {
                    setSelectedHealthParameter(e.target.value);
                    setErrorMessage("");
                    setFieldErrors((prev) => ({
                      ...prev,
                      healthParameter: false,
                    }));
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
            {selectedAlarmType === "Dialysis" && (
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
            )}

            {/* Prescription Selection */}
            {selectedAlarmType === "Prescription" && (
              <Flex className="mb-4 mt-4" gap={4} align="start">
                <Box>
                  <FormControl
                    isRequired
                    isInvalid={Boolean(fieldErrors.prescription)}
                  >
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
                            <tr
                              key={index}
                              className={`border-b hover:bg-gray-50 ${
                                selectedPrescription === pres.id
                                  ? "bg-blue-50"
                                  : ""
                              }`}
                              onClick={() => {
                                setSelectedPrescription(pres.id);
                                if (showPrescriptionViewer) {
                                  setViewPrescription(index + 1);
                                }
                                setErrorMessage("");
                              }}
                            >
                              <td className="px-4 py-3">
                                {pres.Prescription?.endsWith(".pdf") ? (
                                  <FaFilePdf className="w-8 h-8 text-red-500" />
                                ) : (
                                  <img
                                    src={pres.Prescription}
                                    alt={`prescription-${index}`}
                                    className="h-10 w-10 object-cover rounded cursor-pointer hover:opacity-80"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setViewPrescription(
                                        viewPrescription === index + 1
                                          ? null
                                          : index + 1
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
                                    if (showPrescriptionViewer) {
                                      setViewPrescription(index + 1);
                                    }
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
              <FormControl
                className="mb-4 mt-4"
                isRequired
                isInvalid={Boolean(fieldErrors.description)}
              >
                <FormLabel>Short Description</FormLabel>
                <Input
                  type="text"
                  placeholder="Enter description"
                  value={description}
                  isInvalid={Boolean(fieldErrors.description)}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setErrorMessage("");
                    setFieldErrors((prev) => ({
                      ...prev,
                      description: false,
                    }));
                  }}
                />
              </FormControl>
            )}

            {/* Frequency */}
            <FormControl isRequired>
              <Flex gap={6}>
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
                  label="Daily/Weekly"
                >
                  Daily/Weekly
                </Checkbox>
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
                  label="Monthly"
                >
                  Monthly
                </Checkbox>
              </Flex>
            </FormControl>

            {/* Weekdays - for Daily/Weekly */}
            {selectTimings === "Daily/Weekly" && (
              <FormControl
                isRequired
                isInvalid={Boolean(fieldErrors.weekdays)}
              >
                <Flex gap={2} wrap="wrap">
                  {["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"].map(
                    (day) => (
                      <Checkbox
                        key={day}
                        value={day}
                        isChecked={weekdays.includes(day)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setWeekdays([...weekdays, day]);
                          } else {
                            setWeekdays(
                              weekdays.filter((d) => d !== day)
                            );
                          }
                          setErrorMessage("");
                          setFieldErrors((prev) => ({
                            ...prev,
                            weekdays: false,
                          }));
                        }}
                      >
                        {day}
                      </Checkbox>
                    )
                  )}
                </Flex>
              </FormControl>
            )}

            {/* Times per period */}
            <FormControl isRequired>
              <FormLabel>
                {selectTimings === "Monthly"
                  ? "How many times a month?"
                  : "How many times a day?"}
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
                {consultDoctor.map((doc) => {
                  const rawValue =
                    doc?.id ||
                    doc?._id ||
                    doc?.doctor_id ||
                    doc?.user_id ||
                    "";
                  const value = rawValue ? String(rawValue) : "";
                  const label =
                    doc?.name ||
                    doc?.fullName ||
                    doc?.fullname ||
                    doc?.doctorName ||
                    doc?.doctor_name ||
                    doc?.email ||
                    value;
                  return (
                    <option key={value || label} value={value}>
                      {label}
                    </option>
                  );
                })}
              </Select>
            </FormControl>
          </GridItem>

          {/* Right column viewer inside modal (only for add mode with Prescription) */}
          {showPrescriptionViewer &&
            selectedAlarmType === "Prescription" &&
            viewPrescription && (
              <GridItem colSpan={1}>
                <Box className="p-2 max-h-[70vh] overflow-auto">
                  {prescription[viewPrescription - 1]?.Prescription?.endsWith(
                    ".pdf"
                  ) ? (
                    <div className="h-full">
                      <MyPDFViewer
                        file={prescription[viewPrescription - 1].Prescription}
                        onLoadSuccess={() => {}}
                        onLoadError={() => {}}
                      />
                    </div>
                  ) : (
                    <img
                      src={prescription[viewPrescription - 1]?.Prescription}
                      alt="prescription-view"
                      className="w-full h-auto rounded"
                    />
                  )}
                </Box>
              </GridItem>
            )}
        </Grid>
      </FormModal>
    </>
  );
};

export default BaseAlarmModal;
