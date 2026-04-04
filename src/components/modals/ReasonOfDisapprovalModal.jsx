import React, { useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter } from '../../component-library/primitives/Modal';
import { Button } from '../../component-library/primitives/Button';
import { Heading, Text } from '../../component-library/primitives/Typography';
import { toast } from 'sonner';

const ReasonOfDisapprovalModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  medicationName,
  isLoading 
}) => {
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');

  const predefinedReasons = [
    'Incorrect Dosage',
    'Drug Interaction',
    'Patient Allergy',
    'Expired Medication',
    'Incomplete Information',
    'Duplicate Prescription',
    'Other'
  ];

  const handleConfirm = () => {
    if (!reason.trim() && !selectedReason) {
      toast.error('Please select or enter a reason for disapproval');
      return;
    }

    const finalReason = reason.trim() || selectedReason;
    onConfirm(finalReason);
    setReason('');
    setSelectedReason('');
  };

  const handleClose = () => {
    setReason('');
    setSelectedReason('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="sm" isCentered>
      <ModalOverlay />
      <ModalContent className="bg-white rounded-lg shadow-xl">
        
        {/* Header */}
        <ModalHeader className="px-6 py-4 border-b border-red-200 bg-red-50">
          <Heading as="h2" size="md" className="font-semibold text-red-800">
            Reason of Disapproval
          </Heading>
          <Text size="xs" className="text-red-600 mt-1">
            {medicationName && `Medication: ${medicationName}`}
          </Text>
        </ModalHeader>

        {/* Body */}
        <ModalBody className="px-6 py-6 space-y-4">
          {/* Info Text */}
          <Text size="sm" className="text-gray-700">
            Please provide a reason for disapproving this medication:
          </Text>

          {/* Predefined Reasons */}
          <div className="space-y-2">
            <Text size="xs" weight="semibold" className="text-gray-600 uppercase">
              Quick Select
            </Text>
            <div className="grid grid-cols-2 gap-2">
              {predefinedReasons.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setSelectedReason(r === selectedReason ? '' : r);
                    setReason('');
                  }}
                  className={`px-3 py-2 rounded-md text-xs font-medium transition ${
                    selectedReason === r
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-600">or</span>
            </div>
          </div>

          {/* Custom Reason Textarea */}
          <div className="space-y-2">
            <Text size="xs" weight="semibold" className="text-gray-600 uppercase">
              Custom Reason
            </Text>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setSelectedReason('');
              }}
              placeholder="Enter custom reason for disapproval..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows="4"
            />
            <Text size="xs" className="text-gray-500">
              {reason.length}/500 characters
            </Text>
          </div>
        </ModalBody>

        {/* Footer */}
        <ModalFooter className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || (!reason.trim() && !selectedReason)}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Disapproving...' : 'Confirm Disapproval'}
          </Button>
        </ModalFooter>

      </ModalContent>
    </Modal>
  );
};

export default ReasonOfDisapprovalModal;
