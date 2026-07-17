import React, { useState } from 'react';
import { Box, Flex } from '../component-library/layout/Layout';
import { Button, IconButton } from '../component-library/primitives/Button';
import { Heading, Text } from '../component-library/primitives/Typography';
import { Close } from '@mui/icons-material';

const TOTAL_STEPS = 17;

const ABDMWalkthroughModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Box className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <Box className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col relative">
        
        {/* Header */}
        <Flex justify="between" align="center" className="p-4 border-b border-gray-100">
          <Heading as="h3" size="md" weight="bold">
            ABDM Access Walkthrough
          </Heading>
          <IconButton 
            icon={<Close />} 
            onClick={onClose} 
            variant="ghost" 
            className="hover:bg-gray-100 rounded-full"
          />
        </Flex>

        {/* Content Area - Cropping Top and Bottom Mobile Navigation */}
        <Box className="relative w-full bg-gray-50 flex items-center justify-center" style={{ height: '600px' }}>
          
          <Box 
            className="relative overflow-hidden w-[320px] rounded-lg shadow-sm border border-gray-200 bg-white"
            style={{ height: '550px' }}
          >
            <img 
              src={`/assets/abdm_walkthrough/step-${currentStep}.jpeg`} 
              alt={`Step ${currentStep}`}
              className="absolute w-full object-cover"
              style={{
                top: '-45px', // Adjust to hide mobile status bar
                height: '660px', // Original height proportionately scaled to hide bottom nav
                maxWidth: 'none'
              }}
            />
          </Box>
        </Box>

        {/* Footer Navigation */}
        <Flex justify="between" align="center" className="p-4 border-t border-gray-100 bg-white">
          <Button 
            onClick={handlePrev} 
            disabled={currentStep === 1}
            variant="outline"
          >
            Previous
          </Button>
          <Text size="sm" weight="medium" className="text-gray-500">
            Step {currentStep} of {TOTAL_STEPS}
          </Text>
          {currentStep < TOTAL_STEPS ? (
            <Button onClick={handleNext} variant="primary">
              Next
            </Button>
          ) : (
            <Button onClick={onClose} variant="primary">
              Finish
            </Button>
          )}
        </Flex>

      </Box>
    </Box>
  );
};

export default ABDMWalkthroughModal;
