/**
 * PrescriptionModal Component
 * Modal for uploading patient prescriptions.
 * Following Figma design and component library.
 * 
 * @file src/pages/Userprescription/PrescriptionModal.jsx
 */

import React, { useEffect, useState, useRef } from "react";
import Webcam from "react-webcam";
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
import { FormControl, FormLabel, FormErrorMessage } from "../../component-library/primitives/FormControl";
import { Input } from "../../component-library/primitives/Input";
import { Select } from "../../component-library/primitives/Select";
import { VStack, HStack, Box, Flex } from "../../component-library/layout/Layout";
import { Text, Heading } from "../../component-library/primitives/Typography";

// APIs and Helpers
import { addPrescriptionById } from "../../ApiCalls/prescriptionApis";
import { getFileRes } from "../../helpers/fileuploadHelper";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import getCurrentDate from "../../helpers/formatDate";

const PrescriptionModal = ({ closeModal, user_id, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showWebcam, setShowWebcam] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const webcamRef = useRef(null);

  const fetchMedicalTeam = async (uid) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `${server_url}/patient/getMedicalTeam/${uid}`
      );
      setDoctorOptions(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedDoctorId(response.data.data[0].id);
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

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setCapturedImages((prev) => [...prev, imageSrc]);
    }
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
    if (!selectedImage && capturedImages.length === 0 && selectedImages.length === 0) {
      setErrorMsg("Please upload or capture at least one prescription page.");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalFileUrl = "";

      if (selectedImage) {
        const res = await getFileRes(selectedImage);
        finalFileUrl = res.data.objectUrl;
      } else if (capturedImages.length > 0 || selectedImages.length > 1) {
        // Create PDF for multiple images
        const doc = new jsPDF();
        const imagesToInclude = capturedImages.length > 0 ? capturedImages : selectedImages.map(img => img.data);

        imagesToInclude.forEach((imgData, i) => {
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
      <Modal isOpen={true} onClose={closeModal} isCentered>
        <ModalOverlay />
        <ModalContent className="p-10 flex items-center justify-center">
          <Text>Loading form details...</Text>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal isOpen={true} onClose={closeModal} size="lg" isCentered>
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" />
      <ModalContent className="rounded-xl overflow-hidden border-t-4 border-[#4164df]">
        <ModalHeader className="border-b bg-gray-50/50 py-4 px-6">
          <Heading size="md" weight="bold">Upload Prescription</Heading>
          <ModalCloseButton className="p-0" />
        </ModalHeader>

        <ModalBody className="py-6 overflow-y-auto max-h-[70vh]">
          <VStack spacing={6} align="stretch">
            {/* Date Field */}
            <FormControl isRequired isInvalid={!!errorMsg && !selectedDate}>
              <FormLabel className="text-gray-700 font-semibold mb-2">Prescription Date</FormLabel>
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

            {/* Doctor Field */}
            <FormControl isRequired isInvalid={!!errorMsg && (!selectedDoctorId || selectedDoctorId === "0")}>
              <FormLabel className="text-gray-700 font-semibold mb-2">Prescribing Doctor</FormLabel>
              <Select
                value={selectedDoctorId}
                onChange={(e) => {
                  setSelectedDoctorId(e.target.value);
                  setErrorMsg("");
                }}
                className="h-11 rounded-lg border-gray-200 focus:border-[#4164df]"
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
            <FormControl isRequired isInvalid={!!errorMsg && !selectedImage && capturedImages.length === 0 && selectedImages.length === 0}>
              <FormLabel className="text-gray-700 font-semibold mb-2">Prescription Document</FormLabel>
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
            </FormControl>

            {/* Webcam Section */}
            <Box className="mt-2 text-center">
              {showWebcam ? (
                <VStack spacing={4}>
                  <Box className="rounded-xl overflow-hidden border-2 border-gray-100 shadow-sm bg-black relative">
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ width: 1280, height: 720, facingMode: "user" }}
                      className="w-full h-auto"
                    />
                    <Button
                      size="sm"
                      onClick={capture}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#4164df] text-white hover:bg-[#3451c9] shadow-lg rounded-full px-6"
                    >
                      📸 Capture Page
                    </Button>
                  </Box>

                  {capturedImages.length > 0 && (
                    <Box className="w-full">
                      <Text size="xs" weight="bold" className="uppercase text-gray-400 mb-2">Captured Pages ({capturedImages.length})</Text>
                      <Flex gap={2} className="overflow-x-auto pb-2">
                        {capturedImages.map((img, i) => (
                          <Box key={i} className="w-20 h-24 shrink-0 rounded border border-gray-200 overflow-hidden shadow-sm">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </Box>
                        ))}
                      </Flex>
                    </Box>
                  )}

                  <Button variant="ghost" size="xs" onClick={() => setShowWebcam(false)} className="text-gray-400 underline">
                    Switch to File Upload
                  </Button>
                </VStack>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWebcam(true)}
                  className="rounded-full border-[#4164df] text-[#4164df] py-5 px-6"
                >
                  📷 Take a Photo instead
                </Button>
              )}
            </Box>

            {errorMsg && (
              <Box className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <Text size="sm" className="text-red-700 font-medium">⚠️ {errorMsg}</Text>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter className="bg-gray-50/50 border-t py-4 px-6 gap-3">
          <Button variant="ghost" onClick={closeModal} isDisabled={isSubmitting} className="flex-1 text-gray-500 hover:bg-gray-100">
            Cancel
          </Button>
          <Button
            variant="solid"
            isLoading={isSubmitting}
            loadingText="Uploading..."
            onClick={handleSubmit}
            className="flex-2 min-w-[140px] bg-[#4164df] hover:bg-[#3453c1] text-white shadow-md rounded-lg"
          >
            Submit Prescription
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PrescriptionModal;
