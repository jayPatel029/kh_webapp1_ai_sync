/**
 * DietModal Component - Redesigned
 * Modal for uploading patient diet details.
 * Following component library patterns.
 * 
 * @file src/pages/UserDietDetails/DietModal.jsx
 */

import React, { useState, useRef } from "react";
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
import { Textarea } from "../../component-library/primitives/Textarea";
import { Input } from "../../component-library/primitives/Input";
import { Select } from "../../component-library/primitives/Select";
import { VStack, Box, Flex } from "../../component-library/layout/Layout";
import { Text, Heading } from "../../component-library/primitives/Typography";
import attachIcon from "../../assets/attachIcon.svg";

// APIs and Helpers
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { getFileRes } from "../../helpers/fileuploadHelper";
import getCurrentDate from "../../helpers/formatDate";

// NOTE: unified file list (both uploaded and camera captures) stored in selectedImages
// each item: { name: string, data: dataURL string, file?: File }
const DietModal = ({ closeModal, user_id, userData, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedReportType, setSelectedReportType] = useState("");
  const [description, setDescription] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);

  const openCamera = async () => {
    setShowCamera(true);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera error", err);
      }
    }
  };

  const closeCamera = () => {
    setShowCamera(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureFromCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg");
    const name = `capture_${Date.now()}.jpg`;
    setSelectedImages((prev) => [...prev, { data: dataUrl, name }]);
    closeCamera();
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setErrorMsg("");
    if (!files.length) return;

    const newImages = [];
    let loaded = 0;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        newImages.push({ data: reader.result, name: file.name, file });
        loaded += 1;
        if (loaded === files.length) {
          // replace existing selection with newly picked files
          setSelectedImages(newImages);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setSelectedImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      // if input exists and all removed, clear native input
      if (next.length === 0 && fileInputRef.current) fileInputRef.current.value = null;
      return next;
    });
    setErrorMsg("");
  };

  const dataURLToBlob = (dataURL) => {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handleSubmit = async () => {
    if (!selectedDate) {
      setErrorMsg("Please select a diet date.");
      return;
    }
    if (selectedImages.length === 0) {
      setErrorMsg("Please attach or capture at least one image.");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalFileUrl = "";

      // Convert all selected images (even a single one) into a single PDF and upload
      if (selectedImages.length >= 1) {
        // preload images to get natural dimensions so we can preserve aspect ratio
        const loadedImages = await Promise.all(
          selectedImages.map(async (image) => {
            // ensure we have a dataURL for the image; fall back to reading File if needed
            let imgData = image.data;
            if (!imgData && image.file) {
              imgData = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(image.file);
              });
            }
            if (!imgData) return null;

            // create Image to read natural dimensions
            const imgEl = await new Promise((resolve) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.onerror = () => resolve(null);
              img.src = imgData;
            });
            if (!imgEl) return null;
            return { data: imgData, width: imgEl.naturalWidth, height: imgEl.naturalHeight, name: image.name };
          })
        );

        const imgs = loadedImages.filter(Boolean);
        if (imgs.length === 0) throw new Error("No valid images to create PDF");

        // create doc with orientation matching first image to avoid initial rotation issues
        const firstOrient = imgs[0].width > imgs[0].height ? "landscape" : "portrait";
        const doc = new jsPDF({ orientation: firstOrient, unit: "pt", format: "a4" });

        for (let i = 0; i < imgs.length; i++) {
          const img = imgs[i];
          if (i > 0) {
            const orient = img.width > img.height ? "landscape" : "portrait";
            doc.addPage(undefined, orient);
          }

          const pageW = doc.internal.pageSize.getWidth();
          const pageH = doc.internal.pageSize.getHeight();
          const margin = 20; // pts
          const maxW = pageW - margin * 2;
          const maxH = pageH - margin * 2;

          // keep aspect ratio and fit within page
          const scale = Math.min(maxW / img.width, maxH / img.height);
          const displayW = img.width * scale;
          const displayH = img.height * scale;
          const x = (pageW - displayW) / 2;
          const y = (pageH - displayH) / 2;

          doc.addImage(img.data, "JPEG", x, y, displayW, displayH);
        }

        doc.setProperties({ title: "DietDetail.pdf" });
        const pdfBlob = doc.output("blob");
        const res = await getFileRes(pdfBlob, "DietDetail.pdf");
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
    <Modal isOpen={true} onClose={closeModal} size="xl" isCentered>
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" />
      <ModalContent className="rounded-xl overflow-hidden">
        <ModalHeader className="border-b w-full bg-gray-50/50 gap-8 py-4 px-6 !border-info  ">
          <Heading as="h4" className="text-nowrap" weight="bold">Upload Diet Details</Heading>
          <Flex align="center" gap={3}>
            <Box className="w-[30px] h-[30px] rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-700">
                {userData?.name?.charAt(0)?.toUpperCase() || "P"}
              </span>
            </Box>
            <Heading as="h6" isTruncated  >{userData?.name || "User"}</Heading>
            <ModalCloseButton />
          </Flex>
        </ModalHeader>

        <ModalBody className="py-6 overflow-y-auto max-h-[70vh]">
          <VStack spacing={6} align="stretch">
            {/* Date Field */}
            <FormControl isRequired isInvalid={!!errorMsg && !selectedDate}>
              <FormLabel >Diet Date</FormLabel>
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

            {/* Diet Type Field */}
            <FormControl isRequired isInvalid={!!errorMsg && (!selectedReportType || selectedReportType === "Select")}>
              <FormLabel>Diet Type</FormLabel>
              <Select
                value={selectedReportType}
                onChange={(e) => {
                  setSelectedReportType(e.target.value);
                  setErrorMsg("");
                }}
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
              <FormLabel>Description</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="5"
                placeholder="Add any notes about this meal..."
              />
            </FormControl>

            {/* File Upload with Attach & Capture (unified previews + names) */}
            <FormControl isRequired isInvalid={!!errorMsg && selectedImages.length === 0}>
              <FormLabel className="text-gray-700 font-semibold mb-2">Upload file</FormLabel>
              <Box className="relative flex gap-2 items-center">
                <div className="w-full   border-2  border-accent rounded-lg flex items-center justify-between">
                  <div>
                    {/* <Text size="sm" className="font-medium">Upload file</Text>
                    <Text size="xs" className="text-gray-500">Attach file or capture using camera</Text> */}
                  </div>
                  <div className="flex gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => { closeCamera(); fileInputRef.current.click() }}
                      className="!border-none !font-normal !shadow-none"
                    >
                      Attach file <img src={attachIcon} alt="attach" className="inline-block ml-1" />
                    </Button>
                  </div>
                </div>
                {/* Camera Overlay */}
                {showCamera && (
                  <Box className="relative inset-0 z-50  p-4 flex items-center justify-center w-full">
                    <Box className="bg-white rounded-lg   w-full flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                        <Text size="lg" weight="bold">Camera</Text>
                        <Button variant="danger" onClick={() => { closeCamera(); }}>X</Button>
                      </div>
                      <div className="flex-1 bg-black flex items-center justify-center rounded-lg overflow-hidden">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      </div>
                      <div className="mt-4 flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => captureFromCamera()}>Capture</Button>
                      </div>
                    </Box>
                  </Box>
                )}
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowCamera(true);
                    openCamera();
                  }}
                  gap={2}
                  className="!bg-accent p-6"
                >
                  Capture image
                </Button>
              </Box>

              {selectedImages.length > 0 && (
                <Box mt={4}>
                  <Text size="sm" className="font-medium">Previews:</Text>
                  <Flex wrap="wrap" gap={3} className="mt-2">
                    {selectedImages.map((img, index) => (
                      <div key={index} style={{ position: 'relative', width: 120 }}>
                        <div style={{ borderRadius: 8, overflow: 'hidden', width: 120, height: 90, background: '#f3f4f6' }}>
                          <img src={img.data} alt={`Preview ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <Button
                          variant="danger"
                          onClick={() => handleRemoveImage(index)}
                          style={{ position: 'absolute', top: 6, right: 6, padding: '2px 6px' }}
                        >
                          X
                        </Button>
                        <Text size="xs" className="mt-2 text-gray-500" style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {img.name}
                        </Text>
                      </div>
                    ))}
                  </Flex>
                  <Text size="xs" className="mt-2 text-gray-500">
                    Selected: {selectedImages.length} {selectedImages.length === 1 ? 'image' : 'images'} {selectedImages.length > 1 ? '(will be combined into PDF)' : ''}
                  </Text>
                </Box>
              )}
            </FormControl>

            {errorMsg && (
              <Box className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <Text size="sm" className="text-red-700 font-medium">⚠️ {errorMsg}</Text>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter className="!border-none" >
          <Button
            variant="danger"
            onClick={closeModal}
            isDisabled={isSubmitting}
          // className="flex-1 text-gray-500 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            isLoading={isSubmitting}
            loadingText="Uploading..."
            onClick={handleSubmit}
          // className="flex-2 min-w-[140px] bg-[#4164df] hover:bg-[#3453c1] text-white shadow-md rounded-lg"
          >
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DietModal;

