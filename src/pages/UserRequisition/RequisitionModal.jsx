/**
 * Requisition Upload Modal - Redesigned
 * Modal for uploading requisition reports
 * 
 * @file src/pages/UserRequisition/RequisitionModal.jsx
 */

import React, { useState } from "react";
import { getFileRes } from "../../helpers/fileuploadHelper";
import getCurrentDate from "../../helpers/formatDate";
import { addRequisition } from "../../ApiCalls/remainingApis";
import { createNewRequisitionAlert } from "../../ApiCalls/alertsApis";

// Component Library
import { FormModal } from "../../component-library/modals/FormModal";
import { Button } from "../../component-library/primitives/Button";
import { Text } from "../../component-library/primitives/Typography";
import { FormLabel } from "../../component-library/primitives/FormControl";
import { Input } from "../../component-library/primitives/Input";
import FormControl from "../../component-library/primitives/FormControl";

// shared component
import FileUploadWithCamera, { buildMergedPdfFile } from "../../components/FileUploadWithCamera";


const RequisitionModal = ({ closeModal, user_id, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [images, setImages] = useState([]);
  const [msg, setMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const email = localStorage.getItem("email");

  const handleImageChange = (next) => {
    setImages(next || []);
    setMsg("");
  };

  const handleSubmit = () => {
    const nextFieldErrors = {};
    if (!selectedDate) nextFieldErrors.date = true;
    if (images.length === 0) nextFieldErrors.images = true;
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      if (!selectedDate) setMsg("Please select a valid date");
      else setMsg("Please upload at least one document or image");
      return;
    }
    setFieldErrors({});

    setIsSubmitting(true);
    setMsg("");

    (async () => {
      try {
        let finalFileUrl = "";
        const mergedPdfFile = await buildMergedPdfFile(images, "Requisition.pdf");
        const res = await getFileRes(mergedPdfFile, mergedPdfFile.name);
        finalFileUrl = res.data.objectUrl;

        if (!finalFileUrl) throw new Error("failed upload");
        const data = {
          email: email,
          Patient_id: user_id,
          Date: selectedDate,
          Requisition: finalFileUrl,
        };
        await UploadRequisition(data);
        onSuccess();
        closeModal();
      } catch (err) {
        console.error(err);
        setMsg("Upload failed, please try again");
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  const UploadRequisition = async (data) => {
    try {
      const response = await addRequisition(data);
      if (response.success) {
        await createAlert(response?.data?.data);
      }
    } catch (error) {
      console.error("Error:", error?.message || error);
    }
  };

  const createAlert = async (id) => {
    const data = {
      requisitionId: id,
      patientId: user_id,
    };
    await createNewRequisitionAlert(data);
  };

  return (
    <FormModal
      isOpen={true}
      onClose={closeModal}
      onSubmit={handleSubmit}
      title="Upload Requisition"
      submitText="Upload"
      isLoading={isSubmitting}
      isSubmitDisabled={!selectedDate || images.length === 0}
      errorMessage={msg}
      size="lg"
      fieldErrors={fieldErrors}
      onFieldErrorClear={(field) => setFieldErrors((prev) => ({ ...prev, [field]: false }))}
    >
      <FormControl isRequired isInvalid={Boolean(fieldErrors.date)}>
        <FormLabel>Requisition Date:</FormLabel>
        <Input
          type="date"
          id="Date"
          value={selectedDate}
          max={getCurrentDate()}
          isInvalid={Boolean(fieldErrors.date)}
          onChange={(e) => { setSelectedDate(e.target.value); setFieldErrors((prev) => ({ ...prev, date: false })); }}
          size="md"
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Upload Document:</FormLabel>
        <FileUploadWithCamera
          size="xs"
          images={images}
          onChange={handleImageChange}
          accept="image/*,.pdf"
          multiple={true}
          showCamera={true}
        />
      </FormControl>
    </FormModal>
  );
};

export default RequisitionModal;
