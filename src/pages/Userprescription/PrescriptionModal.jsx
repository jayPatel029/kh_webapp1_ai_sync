/**
 * PrescriptionModal Component
 * Modal for uploading patient prescriptions.
 * Following Figma design and component library.
 * 
 * @file src/pages/Userprescription/PrescriptionModal.jsx
 */

import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";

// Component Library
import { FormModal } from "../../component-library/modals/FormModal";
import { Button } from "../../component-library/primitives/Button";
import { FormControl, FormLabel } from "../../component-library/primitives/FormControl";
import { Input } from "../../component-library/primitives/Input";
import { Select } from "../../component-library/primitives/Select";
import { VStack } from "../../component-library/layout/Layout";
import { Text, Heading } from "../../component-library/primitives/Typography";

// Shared components
import FileUploadWithCamera from "../../components/FileUploadWithCamera";

// APIs and Helpers
import { addPrescriptionById } from "../../ApiCalls/prescriptionApis";
import { getFileRes } from "../../helpers/fileuploadHelper";
import { getPatientGetMedicalTeamByid } from "../../ApiCalls/remainingApis";
import getCurrentDate from "../../helpers/formatDate";

const PrescriptionModal = ({ closeModal, user_id, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [images, setImages] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchMedicalTeam = async (uid) => {
    setLoading(true);
    try {
      const response = await getPatientGetMedicalTeamByid(uid);
      if (response.success) {
        setDoctorOptions(response?.data?.data || []);
        if (response.data.data.length > 0) {
          setSelectedDoctorId(response.data.data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching medical team:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicalTeam(user_id);
  }, [user_id]);

  // images state is managed by FileUploadWithCamera: each item has {data,name,file}
  const handleImageChange = (next) => {
    setImages(next || []);
    setErrorMsg("");
  };


  const handleSubmit = async () => {
    if (!selectedDate) {
      setErrorMsg("Please select a prescription date.");
      return;
    }
    if (!selectedDoctorId || selectedDoctorId === "0") {
      setErrorMsg("Please select the prescribing doctor.");
      return;
    }
    if (images.length === 0) {
      setErrorMsg("Please upload or capture at least one prescription page.");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalFileUrl = "";

      if (images.length === 1 && images[0].file) {
        // single file upload
        const res = await getFileRes(images[0].file);
        finalFileUrl = res.data.objectUrl;
      } else if (images.length > 0) {
        // combine into pdf
        const doc = new jsPDF();
        images.forEach((img, i) => {
          const imgData = img.data;
          if (i > 0) doc.addPage();
          doc.addImage(imgData, "JPEG", 10, 10, 190, 250);
        });
        doc.setProperties({ title: "Prescription.pdf" });
        const pdfBlob = doc.output("blob");
        const res = await getFileRes(pdfBlob, "Prescription.pdf");
        finalFileUrl = res.data.objectUrl;
      }

      if (!finalFileUrl) {
        throw new Error("Failed to upload document");
      }

      const prescriptionData = {
        email: localStorage.getItem("email"),
        patient_id: user_id,
        date: selectedDate,
        Prescription: finalFileUrl,
        prescriptionGivenBy: selectedDoctorId,
      };

      await addPrescriptionById(prescriptionData);
      onSuccess();
      closeModal();
    } catch (error) {
      console.error("Error submitting prescription:", error);
      setErrorMsg("Failed to upload prescription. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <FormModal isOpen={true} onClose={closeModal} onSubmit={() => {}} title="" isLoading={true} size="lg">
        <Text>Loading form details...</Text>
      </FormModal>
    );
  }

  return (
    <FormModal
      isOpen={true}
      onClose={closeModal}
      onSubmit={handleSubmit}
      title="Upload Prescription"
      submitText="Submit Prescription"
      isLoading={isSubmitting}
      isSubmitDisabled={images.length === 0 || !selectedDate || !selectedDoctorId || selectedDoctorId === "0"}
      errorMessage={errorMsg}
      size="lg"
    >
      {/* Date Field */}
      <FormControl isRequired>
        <FormLabel>Prescription Date</FormLabel>
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

      {/* Doctor Field */}
      <FormControl isRequired>
        <FormLabel>Prescribing Doctor</FormLabel>
        <Select
          value={selectedDoctorId}
          onChange={(e) => {
            setSelectedDoctorId(e.target.value);
            setErrorMsg("");
          }}
          size="md"
        >
          <option value="0">Select Doctor</option>
          {doctorOptions.map((doctor, index) => (
            <option key={index} value={doctor.id}>
              {doctor.name}
            </option>
          ))}
        </Select>
      </FormControl>

      {/* File Upload */}
      <FormControl isRequired>
        <FormLabel>Prescription Document</FormLabel>
        <FileUploadWithCamera
          size="xs"
          images={images}
          onChange={handleImageChange}
          accept="image/*"
          multiple={true}
          showCamera={true}
        />
      </FormControl>
    </FormModal>
  );
};

export default PrescriptionModal;
