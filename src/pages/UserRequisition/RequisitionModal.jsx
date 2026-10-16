/**
 * Requisition Upload Modal - Redesigned
 * Modal for uploading requisition reports
 * Doctor selection mirrors PrescriptionModal (prescriptionGivenBy).
 *
 * @file src/pages/UserRequisition/RequisitionModal.jsx
 */

import React, { useEffect, useState } from "react";
import { getFileRes } from "../../helpers/fileuploadHelper";
import getCurrentDate from "../../helpers/formatDate";
import { addRequisition, getPatientGetMedicalTeamByid } from "../../ApiCalls/remainingApis";
import { createNewRequisitionAlert } from "../../ApiCalls/alertsApis";

// Component Library
import { FormModal } from "../../component-library/modals/FormModal";
import { FormLabel } from "../../component-library/primitives/FormControl";
import { Input } from "../../component-library/primitives/Input";
import { Select } from "../../component-library/primitives/Select";
import FormControl from "../../component-library/primitives/FormControl";
import { Text } from "../../component-library/primitives/Typography";

// shared component
import FileUploadWithCamera, { buildMergedPdfFile } from "../../components/FileUploadWithCamera";


const RequisitionModal = ({ closeModal, user_id, onSuccess, mutate }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [msg, setMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const email = localStorage.getItem("email");

  const fetchMedicalTeam = async (uid) => {
    setLoading(true);
    try {
      const response = await getPatientGetMedicalTeamByid(uid);
      if (response.success) {
        const doctors = response?.data?.data || [];
        setDoctorOptions(doctors);
        if (doctors.length > 0) {
          setSelectedDoctorId(doctors[0].id);
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

  const handleImageChange = (next) => {
    setImages(next || []);
    setMsg("");
  };

  const handleSubmit = () => {
    const nextFieldErrors = {};
    if (!selectedDate) nextFieldErrors.date = true;
    if (!selectedDoctorId || selectedDoctorId === "0") nextFieldErrors.doctor = true;
    if (images.length === 0) nextFieldErrors.images = true;
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      if (!selectedDate) setMsg("Please select a valid date");
      else if (!selectedDoctorId || selectedDoctorId === "0") setMsg("Please select the doctor.");
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
          requisitionGivenBy: selectedDoctorId,
        };
        const mutationRunner = () => UploadRequisition(data);
        const result = mutate
          ? await mutate(mutationRunner, {
              waitForRefetch: true,
              refetchKeys: [`requisition_${user_id}`],
            })
          : await mutationRunner();

        if (!result?.success) {
          throw new Error(result?.data || "Upload failed");
        }

        onSuccess();
        closeModal();
      } catch (err) {
        console.error(err);
        const msg = err?.message || "Upload failed, please try again";
        setMsg(msg.includes("Network") ? "Network error — please check your connection." : msg);
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
      return response;
    } catch (error) {
      console.error("Error:", error?.message || error);
      throw error;
    }
  };

  const createAlert = async (id) => {
    const data = {
      requisitionId: id,
      patientId: user_id,
    };
    await createNewRequisitionAlert(data);
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
      title="Upload Requisition"
      submitText="Upload"
      isLoading={isSubmitting}
      isSubmitDisabled={!selectedDate || !selectedDoctorId || selectedDoctorId === "0" || images.length === 0}
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

      <FormControl isRequired isInvalid={Boolean(fieldErrors.doctor)}>
        <FormLabel>Doctor:</FormLabel>
        <Select
          value={selectedDoctorId}
          isInvalid={Boolean(fieldErrors.doctor)}
          onChange={(e) => {
            setSelectedDoctorId(e.target.value);
            setMsg("");
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
