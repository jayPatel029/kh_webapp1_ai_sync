/**
 * Requisition Upload Modal - Redesigned
 * Modal for uploading requisition reports
 * 
 * @file src/pages/UserRequisition/RequisitionModal.jsx
 */

import React, { useState } from "react";
import { getFileRes } from "../../helpers/fileuploadHelper";
import getCurrentDate from "../../helpers/formatDate";
import jsPDF from "jspdf";
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
import FileUploadWithCamera from "../../components/FileUploadWithCamera";


const RequisitionModal = ({ closeModal, user_id, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [images, setImages] = useState([]);
  const [msg, setMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const email = localStorage.getItem("email");

  const handleImageChange = (next) => {
    setImages(next || []);
    setMsg("");
  };

  const handleSubmit = () => {
    if (!selectedDate) {
      setMsg("Please select a valid date");
      return;
    }
    if (images.length === 0) {
      setMsg("Please upload at least one document or image");
      return;
    }

    setIsSubmitting(true);
    setMsg("");

    (async () => {
      try {
        let finalFileUrl = "";
        if (images.length === 1 && images[0].file) {
          const res = await getFileRes(images[0].file);
          finalFileUrl = res.data.objectUrl;
        } else {
          const doc = new jsPDF();
          images.forEach((img, i) => {
            if (i > 0) doc.addPage();
            doc.addImage(img.data, "JPEG", 10, 20, 200, 200);
          });
          doc.setProperties({ title: "Requisition.pdf" });
          const file = doc.output("blob");
          const res = await getFileRes(file, "Requisition.pdf");
          finalFileUrl = res.data.objectUrl;
        }

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
    >
      <FormControl isRequired>
        <FormLabel>Requisition Date:</FormLabel>
        <Input
          type="date"
          id="Date"
          value={selectedDate}
          max={getCurrentDate()}
          onChange={(e) => setSelectedDate(e.target.value)}
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
