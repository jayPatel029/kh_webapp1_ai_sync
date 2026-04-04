import React, { useState, useEffect } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter } from '../../component-library/primitives/Modal';
import { Button } from '../../component-library/primitives/Button';
import { Heading, Text } from '../../component-library/primitives/Typography';
import { Spinner } from '../../component-library/feedback/Spinner';
import { toast } from 'sonner';
import { GetComments } from '../../ApiCalls/GetComments';
import { getComments } from '../../ApiCalls/commentApi';
import { FileViewModal } from './FileViewModal';

const PatientCommentsModal = ({
  isOpen,
  onClose,
  patientName,
  patientId,
  onViewProfile,
  onConsultDoctor,
  onMessage
}) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileViewModalOpen, setFileViewModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (isOpen && patientId) {
      fetchComments();
    }
  }, [isOpen, patientId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const payload = {
        fileId: patientId,
        fileType: 'patient'
      };
      const result = await getComments(payload);
      if (result.success) {
        setComments(Array.isArray(result.data) ? result.data : [result.data].filter(Boolean));
      } else if (Array.isArray(result)) {
        setComments(result);
      } else {
        toast.error('Failed to load comments');
        setComments([]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Error loading comments');
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const getCommentIcon = (comment) => {
    const text = `${comment.category || ''} ${comment.type || ''} ${comment.message || ''}`.toLowerCase();
    if (text.includes('requisition')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
        </svg>
      );
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const day = date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const time = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
      return { day, time };
    } catch {
      return { day: dateString, time: '' };
    }
  };

  const handleCommentClick = (comment) => {
    setSelectedFile({
      fileId: comment.fileId || comment.id,
      fileUrl: comment.fileUrl || '',
      fileType: comment.fileType || comment.category || 'Document',
      patientId: patientId,
      title: comment.fileType || comment.category || 'File'
    });
    setFileViewModalOpen(true);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
        <ModalOverlay />
        <ModalContent className="bg-white rounded-lg shadow-lg">

          {/* Header */}
          <ModalHeader className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <Heading as="h2" size="lg" className="font-semibold text-gray-900">
              Comments
            </Heading>
            <div className="flex items-center gap-3 ml-auto">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
                {patientName ? patientName.charAt(0).toUpperCase() : 'U'}
              </div>
              <Text className="text-gray-700 font-medium text-sm">{patientName || 'Unknown'}</Text>
              <button
                onClick={onClose}
                className="ml-2 p-1 hover:bg-gray-100 rounded-full text-gray-500 transition"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </ModalHeader>

          {/* Body */}
          <ModalBody className="p-6 space-y-0 max-h-[50vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="md" />
              </div>
            ) : comments && comments.length > 0 ? (
              comments.map((comment, idx) => {
                const { day, time } = formatDate(comment.date || comment.createdAt);
                return (
                  <div key={comment._id || idx} className={`py-4 ${idx !== comments.length - 1 ? 'border-b border-gray-200' : ''}`}>
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0 pt-1">
                        {getCommentIcon(comment)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Category/Type */}
                        {comment.category && (
                          <Text as="span" size="sm" weight="semibold" className="text-gray-700">
                            {comment.category}
                          </Text>
                        )}

                        {/* Date and Time */}
                        <div className="flex gap-2 mt-1">
                          <Text as="span" size="sm" className="text-gray-600">
                            {day}
                          </Text>
                          <Text as="span" size="sm" className="text-gray-600">
                            {time}
                          </Text>
                        </div>

                        {/* Comment Text */}
                        <Text as="p" size="sm" className="text-gray-600 mt-1">
                          {comment.message || comment.text || 'No message'}
                        </Text>
                      </div>

                      {/* View Comment Link */}
                      <div className="flex-shrink-0">
                        <a
                          href="#"
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap"
                          onClick={(e) => {
                            e.preventDefault();
                            handleCommentClick(comment);
                          }}
                        >
                          View / comment
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center py-12">
                <Text size="sm" color="muted">
                  No comments available.
                </Text>
              </div>
            )}
          </ModalBody>

          {/* Footer */}
          <ModalFooter className="border-t border-gray-200 bg-gray-50">
            {/* <button
              onClick={onClose}
              className="text-red-500 font-medium hover:text-red-600 transition text-sm"
            >
              Close
            </button> */}

            <div className="flex gap-3 ml-auto">
              <a
                href="#"
                className="text-blue-600 font-medium hover:text-blue-700 transition text-sm"
                onClick={(e) => {
                  e.preventDefault();
                  onViewProfile?.();
                }}
              >
                View profile
              </a>

              <button
                onClick={onConsultDoctor}
                // variant="danger-outline"
                // size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 border-none shadow-sm"
              >
                Consult Doctor
              </button>

              <Button
                onClick={onMessage}
                variant="solid"
                size="sm"
              >
                Message
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="ml-2 h-4 w-4" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.40,22.99 3.50612381,23.1 4.13399899,22.9429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.15349042 C3.50612381,-0.0909217275 2.40000000,0.0661757310 1.77946707,0.5374678 C0.994623095,1.00876589 0.837654326,2.10036617 1.15159189,2.88585306 L3.03521743,9.3268461 C3.03521743,9.4839435 3.34915502,9.64104088 3.50612381,9.64104088 L16.6915026,10.4265277 C16.6915026,10.4265277 17.1624089,10.4265277 17.1624089,9.97788954 L17.1624089,10.95 C17.1624089,11.4966907 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
                </svg>
              </Button>
            </div>
          </ModalFooter>

        </ModalContent>
      </Modal>

      {/* File View Modal - opened when a comment is clicked */}
      {selectedFile && (
        <FileViewModal
          isOpen={fileViewModalOpen}
          onClose={() => {
            setFileViewModalOpen(false);
            setSelectedFile(null);
          }}
          fileUrl={selectedFile.fileUrl}
          fileId={selectedFile.fileId}
          fileType={selectedFile.fileType}
          patientId={selectedFile.patientId}
          title={selectedFile.title}
        />
      )}
    </>
  );
};

export default PatientCommentsModal;
