/**
 * DietModal Component - Redesigned
 * Modal for uploading patient diet details.
 * Following component library patterns.
 * 
 * @file src/pages/UserDietDetails/DietModal.jsx
 */

import React, { useState } from "react";

// Component Library
import { FormModal } from "../../component-library/modals/FormModal";
import { FormControl, FormLabel } from "../../component-library/primitives/FormControl";
import { Textarea } from "../../component-library/primitives/Textarea";
import { Input } from "../../component-library/primitives/Input";
import { Select } from "../../component-library/primitives/Select";
import { Box } from "../../component-library/layout/Layout";
import { Text } from "../../component-library/primitives/Typography";

// shared upload component
import FileUploadWithCamera, { buildMergedPdfFile } from "../../components/FileUploadWithCamera";

// APIs and Helpers
import { postDietdetailsInsertDietDetailsAdmin } from "../../ApiCalls/remainingApis";
import { getFileRes } from "../../helpers/fileuploadHelper";
import getCurrentDate from "../../helpers/formatDate";

const DietModal = ({ closeModal, user_id, userData, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedReportType, setSelectedReportType] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (next) => {
    setImages(next || []);
    setErrorMsg("");
  };

  const handleSubmit = async () => {
    if (!selectedDate) {
      setErrorMsg("Please select a diet date.");
      return;
    }
    if (images.length === 0) {
      setErrorMsg("Please attach or capture at least one image.");
      return;
    }
    setIsSubmitting(true);
    try {
      let finalFileUrl = "";

      if (images.length >= 1) {
        const mergedPdfFile = await buildMergedPdfFile(images, "DietDetail.pdf");
        const res = await getFileRes(mergedPdfFile, mergedPdfFile.name);
        if (!res.data.objectUrl) throw new Error("Failed to upload document");
        finalFileUrl = res.data.objectUrl;
      }

      if (!finalFileUrl) throw new Error("Failed to upload document");

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
      const result = await postDietdetailsInsertDietDetailsAdmin(data);
      if (!result.success) {
        throw new Error("Upload failed");
      }
      console.log("Response:", result.data);
    } catch (error) {
      console.error("Error:", error.message);
      throw error;
    }
  };

  return (
    <FormModal
      isOpen={true}
      onClose={closeModal}
      onSubmit={handleSubmit}
      title="Upload Diet Details"
      submitText="Submit"
      isLoading={isSubmitting}
      isSubmitDisabled={!selectedDate || images.length === 0}
      errorMessage={errorMsg}
      size="xl"
    >
      <FormControl isRequired>
        <FormLabel>Diet Date</FormLabel>
        <Input
          type="date"
          value={selectedDate}
          max={getCurrentDate()}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setErrorMsg("");
          }}
          size="md"
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Diet Type</FormLabel>
        <Select
          value={selectedReportType}
          onChange={(e) => {
            setSelectedReportType(e.target.value);
            setErrorMsg("");
          }}
          size="md"
        >
          <option value="">Select</option>
          <option value="Breakfast">Breakfast</option>
          <option value="Lunch">Lunch</option>
          <option value="Dinner">Dinner</option>
          <option value="Other">Other</option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>Description</FormLabel>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          // rows="5"


          placeholder="Add any notes about this meal..."
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Upload File</FormLabel>
        <FileUploadWithCamera
          size="xs"
          images={images}
          onChange={handleImageChange}
          accept="*"
          multiple={true}
          showCamera={true}
        />
      </FormControl>

      {errorMsg && (
        <Box className="p-3 bg-red-50 border border-red-100 rounded-lg">
          <Text size="sm" className="text-red-700 font-medium">⚠️ {errorMsg}</Text>
        </Box>
      )}
    </FormModal>
  );
};

export default DietModal;
