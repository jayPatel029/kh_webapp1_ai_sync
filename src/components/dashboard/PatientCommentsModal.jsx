/**
 * Patient Comments Modal
 * Displays comments for a selected patient in an overlay modal
 */

import React, { useState, useEffect } from 'react';
import { BaseModal } from '../../component-library/modals/BaseModal';
import { Text, Heading } from '../../component-library/primitives/Typography';
import { Flex, Box } from '../../component-library';
import { Spinner } from '../../component-library/feedback/Spinner';
import { getPatientComments } from '../../ApiCalls/commentApi';

const PatientCommentsModal = ({ isOpen, onClose, patient }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && patient) {
      const fetchComments = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const payload = {
            fileId: patient.id,
            fileType: 'patient'
          };
          
          const result = await getPatientComments(payload);
          
          if (result && result.success) {
            setComments(result.data || []);
          } else if (result && Array.isArray(result)) {
            setComments(result);
          } else {
            setComments([]);
          }
        } catch (err) {
          console.error('Error fetching comments:', err);
          setError('Failed to load comments');
          setComments([]);
        } finally {
          setLoading(false);
        }
      };

      fetchComments();
    }
  }, [isOpen, patient]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Comments - ${patient?.name || 'Patient'}`}
      size="lg"
    >
      {loading ? (
        <Flex justify="center" align="center" className="py-12">
          <Spinner size="md" />
        </Flex>
      ) : error ? (
        <Box className="p-6 text-center">
          <Text color="error">{error}</Text>
        </Box>
      ) : comments.length === 0 ? (
        <Box className="p-6 text-center">
          <Text color="muted">No comments for this patient</Text>
        </Box>
      ) : (
        <Box className="space-y-4">
          {comments.map((comment, index) => (
            <Box
              key={index}
              className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <Flex justify="between" align="start" className="mb-2">
                <Flex direction="column" className="flex-1">
                  {comment.fileType && (
                    <Text className="text-xs font-semibold text-red-500 mb-1">
                      {comment.fileType}
                    </Text>
                  )}
                  <Text className="text-sm font-medium text-gray-900">
                    {comment.content}
                  </Text>
                </Flex>
              </Flex>
              {comment.date && (
                <Text className="text-xs text-gray-500 mt-2">
                  {new Date(comment.date).toLocaleDateString()} {new Date(comment.date).toLocaleTimeString()}
                </Text>
              )}
            </Box>
          ))}
        </Box>
      )}
    </BaseModal>
  );
};

export default PatientCommentsModal;
