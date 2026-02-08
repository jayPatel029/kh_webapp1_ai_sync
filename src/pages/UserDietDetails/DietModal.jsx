/**
 * DietModal Component - Redesigned
 * Modal for uploading patient diet details.
 * Following component library patterns.
 * 
 * @file src/pages/UserDietDetails/DietModal.jsx
 */

import React, { useState } from "react";
import jsPDF from "jspdf";

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
import { FormControl, FormLabel } from "../../component-library/primitives/FormControl";
import { Input } from "../../component-library/primitives/Input";
import { Select } from "../../component-library/primitives/Select";
import { VStack, Box } from "../../component-library/layout/Layout";
import { Text, Heading } from "../../component-library/primitives/Typography";

// APIs and Helpers
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { getFileRes } from "../../helpers/fileuploadHelper";
import getCurrentDate from "../../helpers/formatDate";

const DietModal = ({ closeModal, user_id, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedReportType, setSelectedReportType] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [description, setDescription] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setErrorMsg("");

    if (files.length === 1) {
      setSelectedImage(files[0]);
      setSelectedImages([]);
    } else if (files.length > 1) {
      setSelectedImage(null);
      const newImages = [];
      let loaded = 0;
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          newImages.push({
            data: reader.result,
            name: file.name,
          });
          loaded++;
          if (loaded === files.length) {
            setSelectedImages(newImages);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedDate) {
      setErrorMsg("Please select a diet date.");
      return;
    }
    if (!selectedReportType || selectedReportType === "Select") {
      setErrorMsg("Please select a diet type.");
      return;
    }
    if (!selectedImage && selectedImages.length === 0) {
      setErrorMsg("Please upload at least one image.");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalFileUrl = "";

      if (selectedImage) {
        const res = await getFileRes(selectedImage);
        if (!res.data.objectUrl) {
          throw new Error("Failed to upload document");
        }
        finalFileUrl = res.data.objectUrl;
      } else if (selectedImages.length > 1) {
        // Create PDF for multiple images
        const doc = new jsPDF();
        for (let i = 0; i < selectedImages.length; i++) {
          if (i > 0) {
            doc.addPage();
          }
          const image = selectedImages[i];
          doc.addImage(image.data, "JPEG", 10, 20, 200, 200);
        }

        doc.setProperties({ title: "DietDetail.pdf" });
        const pdfBlob = doc.output("blob");
        const res = await getFileRes(pdfBlob, "DietDetail.pdf");

        if (!res.data.objectUrl) {
          throw new Error("Failed to upload document");
        }
        finalFileUrl = res.data.objectUrl;
      }

      if (!finalFileUrl) {
        throw new Error("Failed to upload document");
      }

      const data = {
        date: selectedDate,
        type: selectedReportType,
        img: finalFileUrl,
        desc: description,
        patientId: user_id,
      };

      await uploadDietDetails(data);
      onSuccess();
      closeModal();
    } catch (error) {
      console.error("Error submitting diet details:", error);
      setErrorMsg("Failed to upload diet details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadDietDetails = async (data) => {
    try {
      const result = await axiosInstance.post(
        `${server_url}/dietdetails/insertDietDetailsAdmin`,
        data
      );
      console.log("Response:", result.data);
    } catch (error) {
      console.error("Error:", error.message);
      throw error;
    }
  };

  return (
    <Modal isOpen={true} onClose={closeModal} size="lg" isCentered>
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" />
      <ModalContent className="rounded-xl overflow-hidden border-t-4 border-[#4164df]">
        <ModalHeader className="border-b bg-gray-50/50 py-4 px-6">
          <Heading size="md" weight="bold">Upload Diet Reports</Heading>
          <ModalCloseButton className="p-0" />
        </ModalHeader>

        <ModalBody className="py-6 overflow-y-auto max-h-[70vh]">
          <VStack spacing={6} align="stretch">
            {/* Date Field */}
            <FormControl isRequired isInvalid={!!errorMsg && !selectedDate}>
              <FormLabel className="text-gray-700 font-semibold mb-2">Diet Date</FormLabel>
              <Input
                type="date"
                value={selectedDate}
                max={getCurrentDate()}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setErrorMsg("");
                }}
                className="h-11 rounded-lg border-gray-200 focus:border-[#4164df] focus:ring-1 focus:ring-[#4164df]"
              />
            </FormControl>

            {/* Diet Type Field */}
            <FormControl isRequired isInvalid={!!errorMsg && (!selectedReportType || selectedReportType === "Select")}>
              <FormLabel className="text-gray-700 font-semibold mb-2">Diet Type</FormLabel>
              <Select
                value={selectedReportType}
                onChange={(e) => {
                  setSelectedReportType(e.target.value);
                  setErrorMsg("");
                }}
                className="h-11 rounded-lg border-gray-200 focus:border-[#4164df]"
              >
                <option value="Select">Select</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Other">Other</option>
              </Select>
            </FormControl>

            {/* Description Field */}
            <FormControl>
              <FormLabel className="text-gray-700 font-semibold mb-2">Description</FormLabel>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="5"
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4164df] focus:ring-1 focus:ring-[#4164df] text-sm"
                placeholder="Add any notes about this meal..."
              />
            </FormControl>

            {/* File Upload */}
            <FormControl isRequired isInvalid={!!errorMsg && !selectedImage && selectedImages.length === 0}>
              <FormLabel className="text-gray-700 font-semibold mb-2">Image</FormLabel>
              <Box className="relative">
                <input
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  className="w-full text-sm text-gray-500
                    file:mr-4 file:py-2.5 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-[#4164df]
                    hover:file:bg-blue-100
                    cursor-pointer border border-dashed border-gray-300 p-2 rounded-lg"
                />
              </Box>
              {selectedImage && (
                <Text size="xs" className="mt-2 text-gray-500">
                  Selected: {selectedImage.name}
                </Text>
              )}
              {selectedImages.length > 0 && (
                <Text size="xs" className="mt-2 text-gray-500">
                  Selected: {selectedImages.length} images (will be combined into PDF)
                </Text>
              )}
            </FormControl>

            {errorMsg && (
              <Box className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <Text size="sm" className="text-red-700 font-medium">⚠️ {errorMsg}</Text>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter className="bg-gray-50/50 border-t py-4 px-6 gap-3">
          <Button
            variant="ghost"
            onClick={closeModal}
            isDisabled={isSubmitting}
            className="flex-1 text-gray-500 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            variant="solid"
            isLoading={isSubmitting}
            loadingText="Uploading..."
            onClick={handleSubmit}
            className="flex-2 min-w-[140px] bg-[#4164df] hover:bg-[#3453c1] text-white shadow-md rounded-lg"
          >
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DietModal;

