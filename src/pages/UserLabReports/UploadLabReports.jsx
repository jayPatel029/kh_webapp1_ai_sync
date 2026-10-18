/**
 * UploadLabReports Component
 * Lab type: upload PDF → extract values → editable form → confirm (main flow).
 * Other types: upload only (no extraction).
 *
 * @file src/pages/UserLabReports/UploadLabReports.jsx
 */

import React, { useState } from "react";
import {
  postLabreportExtract,
  postLabreportConfirm,
} from "../../ApiCalls/remainingApis";
import { getFileRes } from "../../helpers/fileuploadHelper";
import getCurrentDate from "../../helpers/formatDate";

import FileUploadWithCamera, {
  buildMergedPdfFile,
} from "../../components/FileUploadWithCamera";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "../../component-library/primitives/Modal";
import { Button } from "../../component-library/primitives/Button";
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
} from "../../component-library/primitives/FormControl";
import { Input } from "../../component-library/primitives/Input";
import { Select } from "../../component-library/primitives/Select";
import { VStack, HStack, Box } from "../../component-library/layout/Layout";
import { Text, Heading } from "../../component-library/primitives/Typography";
import { useAdminToast } from "../../components/AdminToast";

const isPdfItem = (item) =>
  item?.type === "pdf" ||
  item?.file?.type === "application/pdf" ||
  /\.pdf$/i.test(item?.name || item?.file?.name || "");

const isExtractErrorPayload = (values) =>
  values &&
  typeof values === "object" &&
  (values.code === 1 || values.message === "Error processing PDF");

const UploadLabReports = ({ closeModal, user_id, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedReportType, setSelectedReportType] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [extractedValues, setExtractedValues] = useState(null);
  const [uploadedReportUrl, setUploadedReportUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [email] = useState(localStorage.getItem("email"));
  const [errorMsg, setErrorMsg] = useState("");
  const [extractHint, setExtractHint] = useState("");
  const { showToast } = useAdminToast();

  const isLabType = selectedReportType === "Lab";
  const isSingleOriginalPdf =
    selectedImages.length === 1 &&
    !!selectedImages[0]?.file &&
    isPdfItem(selectedImages[0]);
  // Main: Lab + PDF always extracts. Never silently skip for Lab.
  const willExtract = isLabType && isSingleOriginalPdf;

  const handleImageChange = (imagesArray) => {
    setSelectedImages(imagesArray || []);
    setExtractedValues(null);
    setUploadedReportUrl("");
    setErrorMsg("");
    setExtractHint("");
  };

  const uploadReportFile = async () => {
    if (willExtract) {
      const originalPdf = selectedImages[0].file;
      const fileName = originalPdf.name.replace(/\.pdf$/i, "") + ".pdf";
      const uploadRes = await getFileRes(originalPdf, fileName);
      return uploadRes?.data?.objectUrl || "";
    }
    const mergedPdfFile = await buildMergedPdfFile(
      selectedImages,
      "LabReport.pdf"
    );
    const uploadRes = await getFileRes(mergedPdfFile, mergedPdfFile.name);
    return uploadRes?.data?.objectUrl || "";
  };

  const handleExtract = async () => {
    if (!selectedImages || selectedImages.length === 0) {
      setErrorMsg("Please upload a file first.");
      return;
    }

    if (!selectedDate || !selectedReportType || selectedReportType === "Select") {
      setErrorMsg("Please fill all required fields!");
      return;
    }

    if (isLabType && !isSingleOriginalPdf) {
      setErrorMsg(
        "Lab type requires a single original PDF so values can be auto-detected (same as main)."
      );
      return;
    }

    setIsExtracting(true);
    setErrorMsg("");
    setExtractHint("");

    try {
      const pdfUrl = await uploadReportFile();

      if (!pdfUrl) {
        setErrorMsg("Failed to upload the document.");
        return;
      }

      const data = {
        patient_id: user_id,
        date: selectedDate,
        Report_Type: selectedReportType,
        email,
        Lab_Report: pdfUrl,
        // Only non-Lab uploads skip extraction (main: Lab always extracts)
        skipExtraction: !willExtract,
      };

      const extractRes = await postLabreportExtract(data);
      const body = extractRes.data || {};

      if (!extractRes.success) {
        const msg =
          (typeof body === "string" && body) ||
          body?.message ||
          "Failed to extract data.";
        setErrorMsg(msg);
        return;
      }

      // Non-Lab / skip path only: report already saved. Lab extract must stay open.
      if (
        !willExtract &&
        (body.reportId != null ||
          body.message === "Lab Report confirmed and saved successfully")
      ) {
        showToast("Lab report uploaded successfully.", "success");
        onSuccess?.();
        closeModal();
        return;
      }

      const values = body.extractedValues;
      if (isExtractErrorPayload(values)) {
        setErrorMsg(
          values.message ||
            "Could not read values from this PDF. Please check the file and try again."
        );
        return;
      }

      // Mirror main: show form even if empty so user can Add Field + Save
      const safeValues =
        values && typeof values === "object" && !Array.isArray(values)
          ? { ...values }
          : {};
      if (Object.keys(safeValues).length === 0) {
        setExtractHint(
          "No matching lab values were found in the PDF. Add fields manually or try another file."
        );
      }

      setUploadedReportUrl(pdfUrl);
      setExtractedValues(safeValues);
      showToast(
        Object.keys(safeValues).length > 0
          ? "Values extracted. Review and save."
          : "Upload ready. Add values manually if needed.",
        "success"
      );
    } catch (error) {
      console.error("Error during extraction:", error);
      const msg = error?.message || "Something went wrong while extracting data.";
      setErrorMsg(
        msg.includes("Network")
          ? "Network error. Please check your connection."
          : msg
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = async () => {
    if (!extractedValues) {
      setErrorMsg("No data to save.");
      showToast("No data to save.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const finalData = {
        patient_id: user_id,
        date: selectedDate,
        Report_Type: selectedReportType,
        email,
        Lab_Report: uploadedReportUrl,
        confirmedValues: extractedValues,
      };

      const result = await postLabreportConfirm(finalData);
      if (result.success) {
        showToast("Data saved successfully.", "success");
        onSuccess?.();
        closeModal();
      } else {
        const body = result.data || {};
        const msg =
          (typeof body === "string" && body) ||
          body?.message ||
          "Failed to save data.";
        setErrorMsg(msg);
        showToast(msg, "error");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      const msg = error?.message || "Something went wrong while saving the data.";
      setErrorMsg(
        msg.includes("Network")
          ? "Network error. Please check your connection."
          : msg
      );
      showToast(msg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditValue = (key, value) => {
    setExtractedValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddField = () => {
    const fieldName = prompt("Enter the name of the new field:");
    if (fieldName && fieldName.trim()) {
      setExtractedValues((prev) => ({
        ...(prev || {}),
        [fieldName.trim()]: "",
      }));
      setExtractHint("");
    }
  };

  return (
    <Modal isOpen={true} onClose={closeModal} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading size="md" weight="bold">
            Upload Lab Reports
          </Heading>
        </ModalHeader>

        <ModalBody className="py-6">
          <VStack spacing={6} align="stretch">
            <FormControl isRequired isInvalid={!!errorMsg && !selectedDate}>
              <FormLabel>Lab Report Date</FormLabel>
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

            <FormControl
              isRequired
              isInvalid={
                !!errorMsg &&
                (!selectedReportType || selectedReportType === "Select")
              }
            >
              <FormLabel>Report Type</FormLabel>
              <Select
                value={selectedReportType}
                placeholder="Select report type"
                onChange={(e) => {
                  setSelectedReportType(e.target.value);
                  setExtractedValues(null);
                  setUploadedReportUrl("");
                  setErrorMsg("");
                  setExtractHint("");
                }}
              >
                {[
                  "Lab",
                  "Ultrasound",
                  "X-Ray",
                  "Echo",
                  "MRI",
                  "Angiography",
                  "CT Scan",
                ].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl
              isRequired
              isInvalid={!!errorMsg && selectedImages.length === 0}
            >
              <FormLabel>
                Upload File
                {isLabType ? " (single PDF for auto-detect)" : ""}
              </FormLabel>
              <Box className="relative">
                <FileUploadWithCamera
                  images={selectedImages}
                  onChange={handleImageChange}
                  accept={isLabType ? ".pdf,application/pdf" : "image/*,.pdf"}
                  multiple={!isLabType}
                  showCamera={!isLabType}
                />
              </Box>
              {errorMsg && <FormErrorMessage>{errorMsg}</FormErrorMessage>}
            </FormControl>

            {extractedValues && (
              <Box className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <HStack justify="between" align="center" className="mb-3">
                  <Heading size="sm" weight="bold">
                    Extracted Values
                  </Heading>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleAddField}
                    className="text-primary font-bold"
                  >
                    + Add Field
                  </Button>
                </HStack>

                {extractHint ? (
                  <Text size="sm" className="text-amber-800 mb-3">
                    {extractHint}
                  </Text>
                ) : null}

                <Box className="max-h-[300px] overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(extractedValues).map((key) => (
                    <Box key={key}>
                      <Text
                        size="xs"
                        weight="medium"
                        className="mb-1 text-gray-500 uppercase"
                      >
                        {key}
                      </Text>
                      <Input
                        size="sm"
                        value={
                          extractedValues[key] == null
                            ? ""
                            : String(extractedValues[key])
                        }
                        onChange={(e) => handleEditValue(key, e.target.value)}
                        className="bg-white"
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          {!extractedValues && (
            <Button
              variant="solid"
              isLoading={isExtracting}
              loadingText={willExtract ? "Extracting Data..." : "Uploading..."}
              onClick={handleExtract}
            >
              {willExtract ? "Extract Data" : "Upload"}
            </Button>
          )}
          {extractedValues && (
            <Button
              variant="solid"
              colorScheme="success"
              isLoading={isSaving}
              onClick={handleSave}
            >
              Save Report
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UploadLabReports;
