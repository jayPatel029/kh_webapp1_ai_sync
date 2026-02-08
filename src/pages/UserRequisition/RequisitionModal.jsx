/**
 * Requisition Upload Modal - Redesigned
 * Modal for uploading requisition reports
 * 
 * @file src/pages/UserRequisition/RequisitionModal.jsx
 */

import React, { useState } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { getFileRes } from "../../helpers/fileuploadHelper";
import getCurrentDate from "../../helpers/formatDate";
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
import { VStack, Box } from "../../component-library/layout/Layout";
import { Text } from "../../component-library/primitives/Typography";

// Import design system styles
import "../../design-system/styles/index.css";

const RequisitionModal = ({ closeModal, user_id, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [msg, setMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const email = localStorage.getItem("email");

  const handleImageChange = (e) => {
    // const file = e.target.files[0];
    // setSelectedImage(file);
    // console.log("Image Selected:", file);
    const files = Array.from(e.target.files);
    if (files.length === 1) {
      setSelectedImage(files[0]);
    } else {
      const newImages = [];
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          newImages.push({
            data: reader.result,
            name: file.name,
          });
          setSelectedImages(newImages);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = () => {
    if(!selectedDate) {
      setMsg("Please select a valid date");
      return;
    }
    if(!selectedImage) {
      setMsg("Please upload at least one document or image");
      return;
    }

    setIsSubmitting(true);
    setMsg("");

    if (selectedImage) {
      getFileRes(selectedImage)
        .then((res) => {
          if (res.data.objectUrl === undefined) {
            alert("Failed to upload your document, please try again later");
            setIsSubmitting(false);
            return;
          }
          let data = {
            email: email,
            Patient_id: user_id,
            Date: selectedDate,
            Requisition: res.data.objectUrl,
          };

          UploadRequisition(data).then(() => {
            onSuccess();
          });
        })
        .catch((err) => {
          console.log("error in adding msg with image", err);
          setIsSubmitting(false);
          return;
        })
        .finally(() => {
          setIsSubmitting(false);
          closeModal();
        });
    } else if (selectedImages.length > 1) {
      const doc = new jsPDF();
      for (let i = 0; i < selectedImages.length; i++) {
        if (i > 0) {
          doc.addPage();
        }
        const image = selectedImages[i];
        doc.addImage(image.data, "JPEG", 10, 20, 200, 200);
      }

      doc.setProperties({
        title: "Requisition.pdf",
      });
      const file = doc.output("blob");
      getFileRes(file, "Requisition.pdf")
        .then(async (res) => {
          if (res.data.objectUrl === undefined) {
            alert("Failed to upload your document, please try again later");
            setIsSubmitting(false);
            return;
          }
          let data = {
            email: email,
            Patient_id: user_id,
            Date: selectedDate,
            Requisition: res.data.objectUrl,
          };
          UploadRequisition(data).then(() => {
            onSuccess();
            closeModal();
          });
        })
        .catch((err) => {
          console.log("error in adding msg with image", err);
          setIsSubmitting(false);
          return;
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  };

  const UploadRequisition = async (data) => {
    axiosInstance
      .post(`${server_url}/requisition/add`, data)
      .then((response) => {
        createAlert(response.data.data);
      })
      .catch((error) => {
        console.error("Error:", error.message);
      });
  };

  const createAlert = async (id) => {
    const data = {
      requisitionId: id,
      patientId: user_id,
    };
    const response = await axiosInstance.post(
      `${server_url}/alerts/newRequisition`,
      data
    );
  };

  return (
    <Modal isOpen={true} onClose={closeModal} size="lg" isCentered>
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent className="rounded-2xl overflow-hidden bg-white">
        <ModalHeader className="border-b bg-gray-50/50 py-4 px-6">
          <Text size="lg" weight="bold" className="text-gray-900">Upload Requisition</Text>
          <ModalCloseButton className="absolute top-4 right-4" />
        </ModalHeader>

        <ModalBody className="p-6">
          <VStack spacing={4} align="stretch">
            {/* Date Input */}
            <Box>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Requisition Date:
              </label>
              <input
                type="date"
                id="Date"
                className="w-full border-2 border-gray-200 py-3 px-4 rounded-lg focus:outline-none focus:border-[#4164df] transition-colors"
                value={selectedDate}
                max={getCurrentDate()}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </Box>

            {/* File Input */}
            <Box>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Upload Document:
              </label>
              <input
                multiple
                type="file"
                onChange={handleImageChange}
                className="w-full py-3 px-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#4164df] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#4164df] file:text-white hover:file:bg-[#3451c9] cursor-pointer"
                accept="image/*,.pdf"
                required
              />
              <Text size="xs" className="text-gray-500 mt-1">
                Supports: Images and PDF files
              </Text>
            </Box>

            {/* Error Message */}
            {msg && (
              <Box className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <Text size="sm" className="text-red-600">{msg}</Text>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter className="border-t bg-gray-50/30 px-6 py-4">
          <Box className="flex gap-3 w-full justify-end">
            <Button
              variant="outline"
              onClick={closeModal}
              className="px-6 py-2 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              onClick={handleSubmit}
              className="px-6 py-2 rounded-lg bg-[#4164df] text-white hover:bg-[#3451c9]"
              isLoading={isSubmitting}
              isDisabled={isSubmitting}
            >
              Upload
            </Button>
          </Box>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RequisitionModal;
