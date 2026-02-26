/**
 * FileViewModal Component
 * Shared modal for viewing uploaded files (Prescriptions, Lab Reports) 
 * and managing comments.
 * 
 * @file src/components/modals/FileViewModal.jsx
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
// import jsPDF from "jspdf";

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
import { addComment, getComments } from "../../ApiCalls/commentApi";
import { getPatientByIdad } from "../../ApiCalls/patientAPis";
import MyPDFViewer from "../../components/pdf/MyPDFViewer";

// Styles
import '../../design-system/styles/index.css';

// Icons
import downloadIcon from "../../assets/icons/download.svg";


export const FileViewModal = ({
  isOpen,
  onClose,
  fileUrl,
  patientId,
  fileId,
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
  const [viewerWidth, setViewerWidth] = useState(null);
  const modalContentRef = useRef(null);
  const viewerRef = useRef(null);

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
      };
      const commentsRes = await getComments(commentData);
      setPrevComments(commentsRes?.data || []);
    } catch (err) {
      console.error("Error fetching modal context:", err);
    } finally {
      setLoading(false);
    }
  }, [isOpen, patientId, fileId, role, isPdf]);

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
      setIsSubmitting(false);
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

  const adjustViewerWidth = () => {
    try {
      const modalWidth = modalContentRef.current?.getBoundingClientRect().width || window.innerWidth * 0.85;
      let measured = viewerRef.current?.getBoundingClientRect().width || viewerRef.current?.scrollWidth || 0;
      // If nothing measurable yet, fallback to 60% of modal
      if (!measured || measured === 0) measured = modalWidth * 0.6;

      // clamp between 40% and 85% of modal width
      const minW = modalWidth * 0.4;
      const maxW = modalWidth * 0.85;
      const desired = Math.max(minW, Math.min(measured, maxW));
      setViewerWidth(desired);
    } catch (err) {
      // ignore
    }
  };

  // const handleDownloadPDF = async () => {
  //   setIsDownloading(true);
  //   const pdf = new jsPDF("p", "mm", "a4");
  //   const pageWidth = pdf.internal.pageSize.getWidth();

  //   try {
  //     if (isPdf) {
  //       const loadingTask = pdfjs.getDocument(fileUrl);
  //       const pdfDocument = await loadingTask.promise;
  //       const numPages = pdfDocument.numPages;

  //       for (let i = 1; i <= numPages; i++) {
  //         const page = await pdfDocument.getPage(i);
  //         const viewport = page.getViewport({ scale: 2 });
  //         const canvas = document.createElement("canvas");
  //         const context = canvas.getContext("2d");
  //         canvas.width = viewport.width;
  //         canvas.height = viewport.height;

  //         await page.render({ canvasContext: context, viewport: viewport }).promise;
  //         const imgData = canvas.toDataURL("image/png");
  //         const imgHeight = (canvas.height * pageWidth) / canvas.width;

  //         pdf.addImage(imgData, "PNG", 0, 10, pageWidth, imgHeight);
  //         if (i < numPages) pdf.addPage();
  //       }
  //     } else {
  //       const fetchImg = await fetch(fileUrl);
  //       const blob = await fetchImg.blob();
  //       const dataUrl = await new Promise((resolve) => {
  //         const reader = new FileReader();
  //         reader.onloadend = () => resolve(reader.result);
  //         reader.readAsDataURL(blob);
  //       });

  //       const img = new Image();
  //       img.src = dataUrl;
  //       await new Promise((resolve) => { img.onload = resolve; });

  //       const imgWidth = pageWidth;
  //       const imgHeight = (img.height * imgWidth) / img.width;
  //       pdf.addImage(dataUrl, "JPEG", 0, 10, imgWidth, imgHeight);
  //     }

  //     // Add Comments Page
  //     pdf.addPage();
  //     pdf.setFontSize(16);
  //     pdf.text("Comments", 10, 20);
  //     pdf.setFontSize(10);
  //     let y = 30;

  //     prevComments.forEach((comment) => {
  //       const author = comment.isDoctor ? `Dr. ${comment.doctorName}` : "Patient";
  //       const text = `${author}: ${comment.content} (${formatDate(comment.date)})`;
  //       const lines = pdf.splitTextToSize(text, pageWidth - 20);

  //       lines.forEach((line) => {
  //         if (y > 280) { pdf.addPage(); y = 20; }
  //         pdf.text(line, 10, y);
  //         y += 7;
  //       });
  //       y += 5;
  //     });

  //     pdf.save(`${ .replace(" ", "_")}_Summary.pdf`);
  //   } catch (error) {
  //     console.error("Error generating PDF:", error);
  //     alert("Failed to download PDF. Please try again.");
  //   } finally {
  //     setIsDownloading(false);
  //   }
  // };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" isCentered>
      <ModalOverlay className="modal-overlay-blur" />
      <ModalContent
        className="rounded-2xl overflow-hidden flex flex-col bg-white file-view-modal"
        style={{ height: '95vh', width: '85vw' }}
        
      >
        <ModalHeader className="border-b bg-surface/50 flex-none py-4 px-6">
          <HStack justify="between" align="center" className="w-full">
            <VStack spacing={0} align="start">
              <Heading size="sm" weight="bold" className="text-dark">{title}</Heading>
              <Text size="xs" className="text-muted">{ }</Text>
            </VStack>

            <HStack spacing={4}>
              <Button
                variant="outline"
                size="md"
                // onClick={handleDownloadPDF}
                isLoading={isDownloading}
                className="rounded-xl btn-outline-secondary"
              >
                <HStack spacing={2}>
                  <img src={downloadIcon} alt="" style={{ width: 16 }} />
                  <span>Print Summary</span>
                </HStack>
              </Button>
              <ModalCloseButton className="static p-0 hover:bg-surface rounded-full" />
            </HStack>
          </HStack>
        </ModalHeader>

        <ModalBody className="p-0 flex-1 overflow-hidden flex gap-0">
          {/* Left Side: File Preview (80%) */}
          <Box className="w-2/3 bg-surface overflow-auto flex items-center justify-center p-4 relative">
            {/* make it */}
            {loading && !imgError && (
              <VStack spacing={4} className="absolute inset-0 flex items-center justify-center bg-surface z-10">
                <Spinner size="lg" />
                <Text weight="medium">Loading file preview...</Text>
              </VStack>
            )}

            {imgError ? (
              <VStack spacing={2} align="center" justify="center" className="h-full text-muted">
                <Text size="2xl">⚠️</Text>
                <Text>Failed to load file</Text>
                <Text size="xs" className="text-muted-foreground">URL: {fileUrl || 'Empty'}</Text>
              </VStack>
            ) : isPdf ? (
              <div className="w-full h-full flex items-center justify-center">
                <MyPDFViewer
                  file={fileUrl}
                  onLoadSuccess={() => setLoading(false)}
                  onLoadError={() => {
                    setLoading(false);
                    setImgError(true);
                  }}
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center overflow-auto">
                <img
                  src={fileUrl}
                  alt="File Preview"
                  className={`max-h-full object-contain rounded-lg transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
                  onLoad={() => setLoading(false)}
                  onError={() => {
                    setLoading(false);
                    setImgError(true);
                  }}
                />
              </div>
            )}
          </Box>

          {/* Right Side: Comments Section (50%) */}
          <Box className="w-1/3 border-l border-border bg-white flex flex-col">
            <Box className="p-4 border-b border-border flex-none">
              <Heading size="sm" weight="bold" className="text-dark">
                Comments
              </Heading>
            </Box>

            <Box className="flex-1 overflow-y-auto p-4 space-y-4 noscrollbar">
              {patientProgram ? (
                prevComments.length > 0 ? (
                  prevComments.map((comment) => (
                    <Box key={comment.id}>
                      <HStack spacing={2} align="start">
                        <Box className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${comment.isDoctor ? 'bg-primary-dark' : 'bg-primary'}`}>
                          {comment.isDoctor ? 'D' : 'P'}
                        </Box>
                        <VStack spacing={1} align="start" className="flex-1 min-w-0">
                          <HStack justify="between" className="w-full gap-1">
                            <Text size="sm" weight="bold" className="text-dark truncate">
                              {comment.isDoctor ? `Dr. ${comment.doctorName}` : "Patient"}
                            </Text>
                            <Text size="xs" className="text-muted flex-shrink-0">
                              {formatDate(comment.date).split(',')[1]}
                            </Text>
                          </HStack>
                          <Box className={`p-2 rounded-lg text-sm ${comment.isDoctor ? 'bg-gray-100' : 'bg-primary/5 border border-primary/10'}`}>
                            <Text size="sm" className="text-dark break-words">
                              {comment.content}
                            </Text>
                          </Box>
                          <Text size="xs" className="text-muted-foreground">
                            {formatDate(comment.date).split(',')[0]}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  ))
                ) : (
                  <Flex direction="column" align="center" justify="center" className="h-full py-8 text-center">
                    <Text size="3xl" className="mb-2">💬</Text>
                    <Text size="sm" className="text-muted font-medium">No comments yet</Text>
                  </Flex>
                )
              ) : (
                <Box className="p-4 bg-warning/10 border border-warning/20 rounded-lg text-center">
                  <Text size="sm" weight="semibold" className="text-warning-dark mb-1">
                    🔒 Premium Feature
                  </Text>
                  <Text size="xs" className="text-warning/80">
                    Available for Advanced & Standard programs
                  </Text>
                </Box>
              )}
            </Box>

            {patientProgram && !isDialysisTech && (
              <Box className="p-4 border-t border-border bg-gray-50">
                <textarea
                  placeholder="Add comment..."
                  className="w-full p-2 text-sm border border-border rounded-lg bg-white focus:ring-2 focus:ring-primary/20 outline-none resize-none min-h-[80px] text-dark"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button
                  size="sm"
                  variant="primary"
                  className="mt-2 w-full rounded-lg"
                  onClick={handleUploadComment}
                  isLoading={isSubmitting}
                  isDisabled={!newComment.trim()}
                >
                  Post
                </Button>
              </Box>
            )}
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default FileViewModal;
