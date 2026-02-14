/**
 * DoctorAlarmModal Component - Refactored with FormModal
 * Using component library FormModal and FormControl components
 * Doctor approval/rejection interface for alarms
 * 
 * @file src/pages/ShowAlarms/DoctorAlarmModal.jsx
 */

import React, { useState, useEffect } from "react";
import { FaFilePdf } from "react-icons/fa6";

// Component Library - Modals & Forms
import { FormModal } from "../../component-library/modals/FormModal";
import { 
  FormControl, 
  FormLabel, 
  FormHelperText
} from "../../component-library/primitives/FormControl";
import { Input } from "../../component-library/primitives/Input";

// Layout & Typography
import { Box, Flex, VStack } from "../../component-library/layout/Layout";
import { Text } from "../../component-library/primitives/Typography";

// APIs
import { getPrescriptionByPatient } from "../../ApiCalls/prescriptionApis";
import { updateReason } from "../../ApiCalls/alarmsApis";

// Import design system styles
import "../../design-system/styles/index.css";

const DoctorAlarmModal = ({ closeModal, alarmData }) => {
  const {
    id,
    type,
    parameter,
    description,
    frequency,
    patientid,
    prescriptionid,
    weekdays,
    timesaday,
    time,
    dateofmonth,
    messagefordoctor
  } = alarmData;

  // Form state
  const [approvalStatus, setApprovalStatus] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [prescription, setPrescription] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch prescription data if needed
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (type === "Prescription") {
          const responsePres = await getPrescriptionByPatient(patientid);
          if (responsePres.success && responsePres.data.data?.length > 0) {
            setPrescription(responsePres.data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching prescription data:", error);
      }
    };

    fetchData();
  }, [patientid, type]);

  // Submit handler
  const handleSubmit = async () => {
    if (!approvalStatus) {
      setErrorMessage("Please select an approval status");
      return;
    }

    if (approvalStatus === "rejected" && !rejectionReason.trim()) {
      setErrorMessage("Please enter a reason for rejection");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateReason(id, approvalStatus, rejectionReason, patientid);
      closeModal();
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error("Error updating alarm:", error);
      setErrorMessage("Error updating alarm. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormModal
      isOpen={true}
      onClose={closeModal}
      onSubmit={handleSubmit}
      title="Review Alarm"
      submitText="Submit"
      cancelText="Close"
      isLoading={isSubmitting}
      errorMessage={errorMessage}
      size="2xl"
    >
      {/* Alarm Information Section */}
      <VStack spacing={6} align="stretch">
        {/* Alarm Details */}
        <Box>
          <Text as="h3" weight="bold" size="md" className="mb-4">
            Alarm Information
          </Text>
          <VStack spacing={2} align="stretch">
            <Flex justify="between">
              <Text weight="semibold">Type:</Text>
              <Text>{type}</Text>
            </Flex>
            {parameter && (
              <Flex justify="between">
                <Text weight="semibold">Parameter:</Text>
                <Text>{parameter}</Text>
              </Flex>
            )}
            {description && (
              <Flex justify="between">
                <Text weight="semibold">Description:</Text>
                <Text>{description}</Text>
              </Flex>
            )}
            <Flex justify="between">
              <Text weight="semibold">Frequency:</Text>
              <Text>{frequency}</Text>
            </Flex>
            {weekdays && weekdays.length > 0 && (
              <Flex justify="between">
                <Text weight="semibold">Weekdays:</Text>
                <Text>{weekdays}</Text>
              </Flex>
            )}
            <Flex justify="between">
              <Text weight="semibold">Times:</Text>
              <Text>{timesaday}</Text>
            </Flex>
            {time && (
              <Flex justify="between">
                <Text weight="semibold">Time(s):</Text>
                <Text>{time}</Text>
              </Flex>
            )}
            {dateofmonth && (
              <Flex justify="between">
                <Text weight="semibold">Date(s):</Text>
                <Text>{dateofmonth}</Text>
              </Flex>
            )}
            {messagefordoctor && (
              <Flex justify="between">
                <Text weight="semibold">Message:</Text>
                <Text>{messagefordoctor}</Text>
              </Flex>
            )}
          </VStack>
        </Box>

        {/* Prescription Details - if applicable */}
        {type === "Prescription" && prescriptionid && prescription.length > 0 && (
          <Box className="border border-gray-200 rounded-md p-4">
            <Text as="h3" weight="bold" size="md" className="mb-4">
              Prescription Details
            </Text>
            {prescription[prescriptionid - 1] && (
              <Flex gap={4} align="flex-start">
                {prescription[prescriptionid - 1].Prescription?.endsWith(".pdf") ? (
                  <FaFilePdf className="w-12 h-12 text-red-500 flex-shrink-0" />
                ) : (
                  <img
                    src={prescription[prescriptionid - 1].Prescription}
                    alt="Prescription"
                    className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80"
                    onClick={() =>
                      window.open(
                        prescription[prescriptionid - 1].Prescription,
                        "_blank"
                      )
                    }
                  />
                )}
                <VStack spacing={1} align="stretch">
                  <Text weight="semibold">
                    Date: {new Date(prescription[prescriptionid - 1].Date).toDateString()}
                  </Text>
                  <Text size="sm" className="text-gray-600">
                    Click image to view full prescription
                  </Text>
                </VStack>
              </Flex>
            )}
          </Box>
        )}

        {/* Approval Status Selection */}
        <FormControl isRequired isInvalid={!approvalStatus && errorMessage}>
          <FormLabel>Approval Status</FormLabel>
          <VStack spacing={3} align="stretch">
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="approval"
                value="approved"
                checked={approvalStatus === "approved"}
                onChange={(e) => {
                  setApprovalStatus(e.target.value);
                  setErrorMessage("");
                }}
                className="w-4 h-4"
              />
              <Flex align="center" gap={2}>
                <span className="text-green-600 font-semibold">✓</span>
                <span>Approve this alarm</span>
              </Flex>
            </label>

            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="approval"
                value="rejected"
                checked={approvalStatus === "rejected"}
                onChange={(e) => {
                  setApprovalStatus(e.target.value);
                  setErrorMessage("");
                }}
                className="w-4 h-4"
              />
              <Flex align="center" gap={2}>
                <span className="text-red-600 font-semibold">✗</span>
                <span>Reject this alarm</span>
              </Flex>
            </label>
          </VStack>
          <FormHelperText>Select your decision on this alarm request</FormHelperText>
        </FormControl>

        {/* Rejection Reason - shown only when rejected */}
        {approvalStatus === "rejected" && (
          <FormControl isRequired isInvalid={!rejectionReason.trim() && errorMessage}>
            <FormLabel>Reason for Rejection</FormLabel>
            <Input
              as="textarea"
              placeholder="Please explain why you are rejecting this alarm..."
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                setErrorMessage("");
              }}
              className="min-h-[100px] p-3 border border-gray-300 rounded-md"
            />
            <FormHelperText>Provide details to help the patient understand your decision</FormHelperText>
          </FormControl>
        )}
      </VStack>
    </FormModal>
  );
};

export default DoctorAlarmModal;