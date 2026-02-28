/**
 * PrescriptionModal Component
 * Modal for uploading patient prescriptions.
 * Following Figma design and component library.
 * 
 * @file src/pages/Userprescription/PrescriptionModal.jsx
 */

import React, { useEffect, useState } from "react";

// Component Library
import { FormModal } from "../../component-library/modals/FormModal";
import { Button } from "../../component-library/primitives/Button";
import { FormControl, FormLabel } from "../../component-library/primitives/FormControl";
import { Input } from "../../component-library/primitives/Input";
import { Select } from "../../component-library/primitives/Select";
import { VStack } from "../../component-library/layout/Layout";
import { Text, Heading } from "../../component-library/primitives/Typography";

// Shared components
import FileUploadWithCamera, { buildMergedPdfFile } from "../../components/FileUploadWithCamera";

// APIs and Helpers
import { addPrescriptionById } from "../../ApiCalls/prescriptionApis";
import { getFileRes } from "../../helpers/fileuploadHelper";
import { getPatientGetMedicalTeamByid } from "../../ApiCalls/remainingApis";
import getCurrentDate from "../../helpers/formatDate";

const PrescriptionModal = ({ closeModal, user_id, onSuccess, mutate }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [images, setImages] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

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
    const nextFieldErrors = {};
    if (!selectedDate) nextFieldErrors.date = true;
    if (!selectedDoctorId || selectedDoctorId === "0") nextFieldErrors.doctor = true;
    if (images.length === 0) nextFieldErrors.images = true;
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      if (!selectedDate) setErrorMsg("Please select a prescription date.");
      else if (!selectedDoctorId || selectedDoctorId === "0") setErrorMsg("Please select the prescribing doctor.");
      else setErrorMsg("Please upload or capture at least one prescription page.");
      return;
    }
    setFieldErrors({});

    setIsSubmitting(true);
    try {
      let finalFileUrl = "";

      if (images.length > 0) {
        const mergedPdfFile = await buildMergedPdfFile(images, "Prescription.pdf");
        const res = await getFileRes(mergedPdfFile, mergedPdfFile.name);
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

      const mutationRunner = () => addPrescriptionById(prescriptionData);
      const result = mutate
        ? await mutate(mutationRunner, {
            waitForRefetch: true,
            refetchKeys: [`prescriptions_${user_id}`],
          })
        : await mutationRunner();

      if (!result?.success) {
        throw new Error(result?.data || "Failed to upload prescription");
      }

      onSuccess();
      closeModal();
    } catch (error) {
      console.error("Error submitting prescription:", error);
      const msg = error?.message || "Failed to upload prescription. Please try again.";
      setErrorMsg(msg.includes("Network") ? "Network error — please check your connection." : msg);
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
      fieldErrors={fieldErrors}
      onFieldErrorClear={(field) => setFieldErrors((prev) => ({ ...prev, [field]: false }))}
    >
      {/* Date Field */}
      <FormControl isRequired isInvalid={Boolean(fieldErrors.date)}>
        <FormLabel>Prescription Date</FormLabel>
        <Input
          type="date"
          value={selectedDate}
          max={getCurrentDate()}
          isInvalid={Boolean(fieldErrors.date)}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setErrorMsg("");
            setFieldErrors((prev) => ({ ...prev, date: false }));
          }}
          size="md"
        />
      </FormControl>

      {/* Doctor Field */}
      <FormControl isRequired isInvalid={Boolean(fieldErrors.doctor)}>
        <FormLabel>Prescribing Doctor</FormLabel>
        <Select
          value={selectedDoctorId}
          isInvalid={Boolean(fieldErrors.doctor)}
          onChange={(e) => {
            setSelectedDoctorId(e.target.value);
            setErrorMsg("");
            setFieldErrors((prev) => ({ ...prev, doctor: false }));
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
          accept="image/*,.pdf"
          multiple={true}
          showCamera={true}
        />
      </FormControl>
    </FormModal>
  );
};

export default PrescriptionModal;
