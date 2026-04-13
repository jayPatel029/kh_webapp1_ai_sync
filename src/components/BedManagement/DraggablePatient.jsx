/**
 * Draggable Patient Component
 * @file src/components/BedManagement/DraggablePatient.jsx
 *
 * Component that represents a patient and can be dragged to a bed
 */

import React from 'react';
import {
  Box,
  Flex,
  HStack,
  Text,
  Badge,
  VStack,
} from '../../component-library';

/**
 * DraggablePatient Component
 *
 * @param {Object} patient - Patient object with id, name, is_infectious, etc.
 * @param {Function} onDragStart - Callback when drag starts
 */
export default function DraggablePatient({
  patient,
  onDragStart,
  isDragging = false,
}) {
  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    const dragData = {
      patient_id: patient.id,
      patient_name: patient.name,
      is_infectious: patient.is_infectious,
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    onDragStart?.(dragData);
  };

  return (
    <Box
      draggable
      onDragStart={handleDragStart}
      cursor="grab"
      _active={{ cursor: 'grabbing' }}
      border="2px"
      borderColor={isDragging ? 'brand.500' : 'gray.300'}
      p={3}
      borderRadius="md"
      bg={isDragging ? 'brand.50' : 'white'}
      opacity={isDragging ? 0.7 : 1}
      transition="all 0.2s"
      _hover={{
        borderColor: 'brand.400',
        shadow: 'md',
      }}
      role="button"
      tabIndex={0}
      ariaLabel={`Drag patient: ${patient.name}`}
    >
      <VStack spacing={2} align="start">
        <HStack justify="space-between" width="full">
          <Text fontWeight="600">{patient.name}</Text>
          {patient.is_infectious && (
            <Badge colorScheme="red">🚨 Infectious</Badge>
          )}
        </HStack>

        <Text fontSize="sm" color="gray.600">
          ID: {patient.id}
        </Text>

        {patient.patient_code && (
          <Text fontSize="sm" color="gray.600">
            Code: {patient.patient_code}
          </Text>
        )}

        <Text fontSize="xs" color="gray.500">
          💡 Drag to a bed to assign
        </Text>
      </VStack>
    </Box>
  );
}
