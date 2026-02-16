/**
 * UploadLabReports Component
 * Modal for uploading and extracting lab reports
 * 
 * @file src/pages/UserLabReports/UploadLabReports.jsx
 */

import React, { useState } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { getFileRes } from "../../helpers/fileuploadHelper";
import getCurrentDate from "../../helpers/formatDate";

// Component Library
import { 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  ModalCloseButton
} from "../../component-library/primitives/Modal";
import { Button } from "../../component-library/primitives/Button";
import { FormControl, FormLabel, FormErrorMessage } from "../../component-library/primitives/FormControl";
import { Input } from "../../component-library/primitives/Input";
import { Select } from "../../component-library/primitives/Select";
import { VStack, HStack, Box, Flex } from "../../component-library/layout/Layout";
import { Text, Heading } from "../../component-library/primitives/Typography";

const UploadLabReports = ({ closeModal, user_id, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedReportType, setSelectedReportType] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [extractedValues, setExtractedValues] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [email] = useState(localStorage.getItem("email"));
  const [errorMsg, setErrorMsg] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
    setErrorMsg("");
  };

  const handleExtract = async () => {
    if (!selectedImage) {
      setErrorMsg("Please upload a file first.");
      return;
    }

    if (!selectedDate || !selectedReportType || selectedReportType === "Select") {
      setErrorMsg("Please fill all required fields!");
      return;
    }

    setIsExtracting(true);
    setErrorMsg("");

    try {
      const uploadRes = await getFileRes(selectedImage);
      const pdfUrl = uploadRes.data.objectUrl;

      if (!pdfUrl) {
        setErrorMsg("Failed to upload the document.");
        setIsExtracting(false);
        return;
      }

      const data = {
        patient_id: user_id,
        date: selectedDate,
        Report_Type: selectedReportType,
        email,
        Lab_Report: pdfUrl,
      };

      const extractRes = await axiosInstance.post(
        `${server_url}/labReport/extract`, data
      );

      if (extractRes.data.message === "Lab Report confirmed and saved successfully") {
        alert("Data saved successfully.");
        onSuccess();
        closeModal();
      }
      setExtractedValues(extractRes.data.extractedValues);
    } catch (error) {
      console.error("Error during extraction:", error);
      setErrorMsg("Something went wrong while extracting data.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = async () => {
    if (!extractedValues) {
      alert("No data to save.");
      return;
    }

    setIsSaving(true);
    try {
      const uploadRes = await getFileRes(selectedImage);
      const pdfUrl = uploadRes.data.objectUrl;

      const finalData = {
        patient_id: user_id,
        date: selectedDate,
        Report_Type: selectedReportType,
        email,
        Lab_Report: pdfUrl,
        confirmedValues: extractedValues,
      };

      await axiosInstance.post(`${server_url}/labReport/confirm`, finalData);
      alert("Data saved successfully.");
      onSuccess();
      closeModal();
    } catch (error) {
      console.error("Error saving data:", error);
      setErrorMsg("Something went wrong while saving the data.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditValue = (key, value) => {
    setExtractedValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddField = () => {
    const fieldName = prompt("Enter the name of the new field:");
    if (fieldName) {
      setExtractedValues((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  return (
    <Modal isOpen={true} onClose={closeModal} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent
        // className="rounded-xl overflow-hidden border-t-4 border-primary"
      >
        
        <ModalHeader >
          <Heading size="md" weight="bold">Upload Lab Reports</Heading>
          <ModalCloseButton />
        </ModalHeader>

        <ModalBody className="py-6">
          <VStack spacing={6} align="stretch">
            {/* Form Fields */}
            <FormControl isRequired isInvalid={!!errorMsg && !selectedDate}>
              <FormLabel>Lab Report Date</FormLabel>
              <Input
                type="date"
                value={selectedDate}
                max={getCurrentDate()}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setErrorMsg("");
                }}
              />
            </FormControl>

            <FormControl isRequired isInvalid={!!errorMsg && (!selectedReportType || selectedReportType === "Select")}>
              <FormLabel>Report Type</FormLabel>
              <Select
                value={selectedReportType}
                placeholder="Select report type"
                onChange={(e) => {
                  setSelectedReportType(e.target.value);
                  setErrorMsg("");
                }}
              >
                {["Lab", "Ultrasound", "X-Ray", "Echo", "MRI", "Angiography", "CT Scan"].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired isInvalid={!!errorMsg && !selectedImage}>
              <FormLabel>Upload File</FormLabel>
              <Box className="relative">
                <Input
                  type="file"
                  onChange={handleImageChange}
                  className="w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary-50 file:text-primary
                    hover:file:bg-primary-100
                    cursor-pointer"
                />
              </Box>
              {errorMsg && <FormErrorMessage>{errorMsg}</FormErrorMessage>}
            </FormControl>

            {!extractedValues && (
              <Button
                variant="solid"
                isFullWidth
                isLoading={isExtracting}
                loadingText="Extracting Data..."
                onClick={handleExtract}
                className="mt-2 h-12"
              >
                Extract Data
              </Button>
            )}

            {/* Extracted Data Section */}
            {extractedValues && (
              <Box className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <HStack justify="between" align="center" className="mb-4">
                  <Heading size="sm" weight="bold">Extracted Values</Heading>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={handleAddField}
                    className="text-primary font-bold"
                  >
                    + Add Field
                  </Button>
                </HStack>
                
                <Box className="max-h-[300px] overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(extractedValues).map((key) => (
                    <Box key={key}>
                      <Text size="xs" weight="medium" className="mb-1 text-gray-500 uppercase">{key}</Text>
                      <Input
                        size="sm"
                        value={extractedValues[key]}
                        onChange={(e) => handleEditValue(key, e.target.value)}
                        className="bg-white"
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter >
          <Button variant="outline" onClick={closeModal} className="flex-1">
            Cancel
          </Button>
          {extractedValues && (
            <Button 
              variant="solid" 
              colorScheme="success" 
              // className="flex-1 bg-green-600 hover:bg-green-700"
              isLoading={isSaving}
              onClick={handleSave}
            >
              Save Report
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UploadLabReports;
