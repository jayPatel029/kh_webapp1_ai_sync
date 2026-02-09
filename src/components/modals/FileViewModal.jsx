/**
 * FileViewModal Component
 * Shared modal for viewing uploaded files (Prescriptions, Lab Reports) 
 * and managing comments.
 * 
 * @file src/components/modals/FileViewModal.jsx
 */

import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { pdfjs } from "react-pdf";
import jsPDF from "jspdf";

// Component Library
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Box,
  Flex,
  Text,
  Heading,
  Spinner,
} from "../../component-library";

// APIs and Helpers
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { addComment } from "../../ApiCalls/commentApi";
import { getPatientByIdad } from "../../ApiCalls/patientAPis";
import MyPDFViewer from "../../components/pdf/MyPDFViewer";

// Styles
import '../../design-system/styles/index.css';

// Icons
import downloadIcon from "../../assets/icons/download.svg";

// Set PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export const FileViewModal = ({
  isOpen,
  onClose,
  fileUrl,
  patientId,
  fileId,
  fileType = "Prescription",
  title = "File View"
}) => {
  const [newComment, setNewComment] = useState("");
  const [prevComments, setPrevComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientProgram, setProgram] = useState(false);
  const [isDialysisTech, setIsDialysisTech] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshComments, setRefreshComments] = useState(false);
  const [imgError, setImgError] = useState(false);

  const role = useSelector((state) => state.permission);
  const isPdf = fileUrl && /.*\.pdf$/i.test(fileUrl);

  // Reset states when file changes
  useEffect(() => {
    setImgError(false);
    setLoading(true);
  }, [fileUrl]);

  const fetchContext = useCallback(async () => {
    if (!isOpen) return;

    setLoading(true);
    try {
      // Fetch patient program
      const res = await getPatientByIdad(patientId);
      if (["Advanced", "Standard"].includes(res?.data?.data?.program)) {
        setProgram(true);
      }

      // Check role
      if (role?.role_name === "Dialysis Technician") {
        setIsDialysisTech(true);
      }

      // Fetch comments
      const commentData = {
        fileId: fileId,
        fileType: fileType,
      };
      const commentsRes = await axiosInstance.post(`${server_url}/comments/getComments`, commentData);
      setPrevComments(commentsRes.data.data || []);
    } catch (err) {
      console.error("Error fetching modal context:", err);
    } finally {
      setLoading(false);
    }
  }, [isOpen, patientId, fileId, fileType, role, isPdf]);

  useEffect(() => {
    fetchContext();
  }, [fetchContext, refreshComments]);

  const handleUploadComment = async () => {
    const trimmedComment = newComment.trim();
    if (!trimmedComment) return;

    setIsSubmitting(true);
    try {
      const isDoctor = localStorage.getItem("isDoctor") === "true" ? 1 : 0;

      const response = await addComment(
        trimmedComment,
        fileId,
        fileType,
        patientId,
        isDoctor
      );

      if (response.success) {
        setNewComment("");
        setRefreshComments(prev => !prev);
      }
    } catch (error) {
      console.error("Error uploading comment:", error);
    } finally {
      setIsSubmitting(true);
      setTimeout(() => setIsSubmitting(false), 500);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const dateObject = new Date(dateString);
    const istDateObject = new Date(dateObject.getTime() + 330 * 60000);
    const day = istDateObject.getDate();
    const month = istDateObject.toLocaleString("default", { month: "short" });
    const year = istDateObject.getFullYear();
    let hours = istDateObject.getHours();
    const minutes = istDateObject.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();

    try {
      if (isPdf) {
        const loadingTask = pdfjs.getDocument(fileUrl);
        const pdfDocument = await loadingTask.promise;
        const numPages = pdfDocument.numPages;

        for (let i = 1; i <= numPages; i++) {
          const page = await pdfDocument.getPage(i);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: context, viewport: viewport }).promise;
          const imgData = canvas.toDataURL("image/png");
          const imgHeight = (canvas.height * pageWidth) / canvas.width;

          pdf.addImage(imgData, "PNG", 0, 10, pageWidth, imgHeight);
          if (i < numPages) pdf.addPage();
        }
      } else {
        const fetchImg = await fetch(fileUrl);
        const blob = await fetchImg.blob();
        const dataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });

        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve) => { img.onload = resolve; });

        const imgWidth = pageWidth;
        const imgHeight = (img.height * imgWidth) / img.width;
        pdf.addImage(dataUrl, "JPEG", 0, 10, imgWidth, imgHeight);
      }

      // Add Comments Page
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text("Comments", 10, 20);
      pdf.setFontSize(10);
      let y = 30;

      prevComments.forEach((comment) => {
        const author = comment.isDoctor ? `Dr. ${comment.doctorName}` : "Patient";
        const text = `${author}: ${comment.content} (${formatDate(comment.date)})`;
        const lines = pdf.splitTextToSize(text, pageWidth - 20);

        lines.forEach((line) => {
          if (y > 280) { pdf.addPage(); y = 20; }
          pdf.text(line, 10, y);
          y += 7;
        });
        y += 5;
      });

      pdf.save(`${fileType.replace(" ", "_")}_Summary.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
      <ModalOverlay className="modal-overlay-blur" />
      <ModalContent
        className="rounded-2xl overflow-hidden flex flex-col bg-white file-view-modal"
        style={{ height: '85vh', maxWidth: '1200px' }}
      >
        <ModalHeader className="border-b bg-surface/50 flex-none py-4 px-6">
          <HStack justify="between" align="center" className="w-full">
            <VStack spacing={0} align="start">
              <Heading size="sm" weight="bold" className="text-dark">{title}</Heading>
              <Text size="xs" className="text-muted">{fileType}</Text>
            </VStack>

            <HStack spacing={4}>
              <Button
                variant="outline"
                size="md"
                onClick={handleDownloadPDF}
                isLoading={isDownloading}
                className="rounded-xl btn-outline-secondary"
              >
                <HStack spacing={2}>
                  <img src={downloadIcon} alt="" style={{ width: 16 }} />
                  <span>Download Summary</span>
                </HStack>
              </Button>
              <ModalCloseButton className="static p-0 hover:bg-surface rounded-full" />
            </HStack>
          </HStack>
        </ModalHeader>

        <ModalBody className="p-0 flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Side: File Preview */}
          <Box className="flex-1 bg-surface overflow-auto flex items-center justify-center p-6 relative">
            {loading && !imgError && (
              <VStack spacing={4} className="absolute inset-0 flex items-center justify-center bg-surface z-10">
                <Spinner size="lg" />
                <Text weight="medium">Loading file preview...</Text>
              </VStack>
            )}

            {imgError ? (
              <VStack spacing={2} align="center" justify="center" className="h-full text-muted">
                <Text size="2xl">⚠️</Text>
                <Text>Failed to load image</Text>
                <Text size="xs" className="text-muted-foreground">URL: {fileUrl || 'Empty'}</Text>
              </VStack>
            ) : isPdf ? (
                <Box className="w-full h-full min-h-[500px] rounded-xl overflow-hidden shadow-sm border border-border">
                <MyPDFViewer file={fileUrl} />
              </Box>
            ) : (
              <Box className="relative group flex items-center justify-center p-4 w-full h-full">
                <img
                  src={fileUrl}
                  alt="File Preview"
                      className={`max-w-full max-h-[70vh] shadow-2xl rounded-lg border border-border transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
                  onLoad={() => setLoading(false)}
                  onError={() => {
                    setLoading(false);
                    setImgError(true);
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Right Side: Comments Section */}
          <Box className="w-full md:w-[380px] border-l border-border bg-white flex flex-col flex-none shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.02)]">
            <Box className="p-6 border-b border-border">
              <Heading size="xs" weight="bold" className="uppercase tracking-tight text-muted">
                Comments
              </Heading>
            </Box>

            <Box className="flex-1 overflow-y-auto p-6 space-y-6 noscrollbar">
              {patientProgram ? (
                prevComments.length > 0 ? (
                  prevComments.map((comment) => (
                    <Box key={comment.id} className="group">
                      <HStack spacing={3} align="start" className="mb-2">
                        <Box className={`mt-1 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${comment.isDoctor ? 'bg-primary-dark' : 'bg-primary'}`}>
                          {comment.isDoctor ? 'D' : 'P'}
                        </Box>
                        <VStack spacing={1} align="start" className="flex-1">
                          <HStack justify="between" className="w-full">
                            <Text size="sm" weight="bold" className="text-dark">
                              {comment.isDoctor ? `Dr. ${comment.doctorName}` : "Patient"}
                            </Text>
                            <Text size="xs" className="text-muted font-normal">
                              {formatDate(comment.date).split(',')[1]}
                            </Text>
                          </HStack>
                          <Box className={`p-3 rounded-2xl ${comment.isDoctor ? 'bg-surface rounded-tl-none' : 'bg-primary/5 rounded-tl-none border border-primary/10'}`}>
                            <Text size="sm" className="text-dark leading-relaxed font-normal">
                              {comment.content}
                            </Text>
                          </Box>
                          <Text size="xs" className="text-muted-foreground pl-1 mt-1">
                            {formatDate(comment.date).split(',')[0]}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  ))
                ) : (
                  <Flex direction="column" align="center" justify="center" className="h-full py-10">
                      <Box className="w-16 h-16 bg-surface rounded-full mb-4 flex items-center justify-center">
                      <Text size="lg">💬</Text>
                    </Box>
                      <Text size="sm" className="text-muted italic font-medium">No comments posted yet</Text>
                      <Text size="xs" className="text-muted-foreground mt-1">Be the first to share your thoughts</Text>
                  </Flex>
                )
              ) : (
                  <Box className="p-6 bg-warning/10 border border-warning/20 rounded-2xl text-center">
                    <Text size="sm" weight="semibold" className="text-warning-dark mb-1">
                    🔒 Premium Feature
                  </Text>
                    <Text size="xs" className="text-warning/80">
                    Discussions are available only for Advanced and Standard program patients.
                  </Text>
                </Box>
              )}
            </Box>

            {patientProgram && !isDialysisTech && (
              <Box className="p-6 border-t border-border bg-surface/30">
                <Box className="relative">
                  <textarea
                    placeholder="Share your observation..."
                    className="w-full p-4 text-sm border-none rounded-2xl bg-white shadow-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none min-h-[100px] text-dark textarea-comment"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="primary"
                    className="absolute bottom-3 right-3 rounded-xl"
                    onClick={handleUploadComment}
                    isLoading={isSubmitting}
                    isDisabled={!newComment.trim()}
                  >
                    Post
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default FileViewModal;
