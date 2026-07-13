import React, { useState } from 'react';
import { Box, Button, Heading, Text, VStack } from '../../../component-library';
import DialysisParametersModal from './DialysisParametersModal';

export default function DialysisParametersTestPage() {
  const [isOpen, setIsOpen] = useState(true);

  const fakeDemoData = {
    patient: {
      id: 9001,
      patient_id: 9001,
      patient_name: 'John Doe',
      name: 'John Doe',
      dry_weight: 68.5,
      body_weight: 70.2,
      blood_group: 'O+',
      ailments: ['Hemo Dialysis'],
      program: 'Standard',
      doctor_heparin_dose_units: 5000,
      doctor_heparin_strategy: 'standard',
    },
    readings: [
      { id: 1, title: 'Systolic BP', value: '120 mmHg', date: '2026-06-28 10:00' },
      { id: 2, title: 'Diastolic BP', value: '80 mmHg', date: '2026-06-28 10:00' },
    ],
    appointment: {
      id: 7001,
      metadata: { dialysisDuration: 4 },
      start_time: '08:00',
      end_time: '12:00',
      services: [
        { id: 1, name: 'Standard Dialysis Service', price: 2000 },
      ],
      totalAmount: 2400,
      amountPaid: 500,
    },
    appointmentServices: [
      { id: 1, name: 'Standard Dialysis Service', price: 2000 },
    ],
    hemoParams: [
      { id: 101, title: 'Systolic BP', unit: 'mmHg', isGraph: 1 },
      { id: 102, title: 'Diastolic BP', unit: 'mmHg', isGraph: 1 },
      { id: 103, title: 'Weight Before', unit: 'kg', isGraph: 0 },
      { id: 104, title: 'Weight After', unit: 'kg', isGraph: 0 },
      { id: 105, title: 'Blood Flow Rate', unit: 'ml/min', isGraph: 0 },
    ],
    hemoParamsResponses: {
      101: '128',
      102: '82',
      103: '70.1',
      104: '69.8',
      105: '350',
    },
    inventoryItems: [
      { id: 1, name: 'Heparin', unit_price: 12 },
      { id: 2, name: 'Saline', unit_price: 5 },
    ],
    inventoryStock: [
      { item_id: 1, unit_price: 12 },
      { item_id: 2, unit_price: 5 },
    ],
    dialyzers: [
      { id: 1, usage_count: 2, max_usage: 5, unit_price: 150 },
    ],
    consumedItems: [],
    selectedDialyzerId: '',
    sessionId: 9991,
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Box className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white">
      <VStack spacing={6} align="center" className="max-w-md w-full text-center">
        <Heading size="lg" className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 font-extrabold">
          Dialysis Modal Test Page
        </Heading>
        <Text color="slate.300">
          This page renders the <code>DialysisParametersModal</code> pre-populated with simulated demo/fake data.
        </Text>
        <Button
          onClick={() => setIsOpen(true)}
          colorScheme="blue"
          size="lg"
          className="shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Open Dialysis Parameters Modal
        </Button>
      </VStack>

      <DialysisParametersModal
        isOpen={isOpen}
        onClose={handleClose}
        patient={fakeDemoData.patient}
        bed={{ id: 501, bed_number: 'Bed 12', organization_id: 201 }}
        demoMode={true}
        demoData={fakeDemoData}
        demoAutoOpenFirstParameter={true}
      />
    </Box>
  );
}
