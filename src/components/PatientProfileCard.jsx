/**
 * Patient Profile Card Component
 * Displays patient basic details and ailment information
 * 
 * @file src/components/PatientProfileCard.jsx
 */

import React from 'react';
import { Card, CardBody } from './primitives/Card';
import { Text, Heading } from './primitives/Typography';
import { Button, IconButton } from './primitives/Button';
import { Flex, Box } from './layout/Layout';
import { colors, spacing } from '../design-system/tokens';

export const PatientProfileCard = ({
  patient,
  ailmentDetails,
  onEditClick,
  imageUrl,
}) => {
  return (
    <Card
      variant="elevated"
      className="w-full"
      style={{ borderRadius: '15px' }}
    >
      <CardBody className="p-0">
        <Flex
          gap={30}
          align="start"
          className="p-12"
          style={{ paddingLeft: '50px', paddingRight: '50px' }}
        >
          {/* Left side: Profile image and patient meta */}
          <Box className="flex-col gap-5 items-end relative">
            <Flex align="end" gap={4} direction="column" justify="between">
              {imageUrl && (
                <Box
                  as="img"
                  src={imageUrl}
                  alt={patient?.name || 'Patient'}
                  className="rounded-full"
                  style={{
                    width: '130px',
                    height: '130px',
                    objectFit: 'cover',
                  }}
                />
              )}
              <IconButton
                onClick={onEditClick}
                className="rounded-full"
                style={{
                  background: colors.surface.DEFAULT,
                  width: '35px',
                  height: '35px',
                }}
              >
                ✎
              </IconButton>
            </Flex>

            {/* Patient details grid */}
            <Box className="mt-8">
              <Heading
                size="lg"
                weight="semibold"
                color="text.DEFAULT"
                className="mb-8"
              >
                {patient?.name || 'Patient Name'}
              </Heading>

              <Box className="space-y-6">
                {[
                  { label: 'Number:', value: patient?.phoneNumber || '1234567890' },
                  { label: 'DOB:', value: patient?.dob || '1996-05-28' },
                  { label: 'Ailments:', value: patient?.ailments?.join(', ') || 'Hemo Dialysis, CKD' },
                  { label: 'eGFR:', value: patient?.eGFR || '-' },
                  { label: 'GFR:', value: patient?.GFR || '-' },
                  { label: 'Dry Weight:', value: patient?.dryWeight || '75 kgs' },
                ].map((item, idx) => (
                  <Flex key={idx} gap={4} justify="start" align="center">
                    <Text size="sm" weight="bold" color="text.muted">
                      {item.label}
                    </Text>
                    <Text size="sm" weight="semibold" color="text.DEFAULT">
                      {item.value}
                    </Text>
                  </Flex>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Vertical divider */}
          <Box
            className="w-0.5 h-auto min-h-[400px]"
            style={{ background: colors.border.DEFAULT }}
          />

          {/* Right side: Ailment details */}
          <Box className="flex-1">
            <Heading size="md" weight="bold" color="text.DEFAULT" className="mb-8">
              Ailment details
            </Heading>

            <Box className="space-y-8">
              {ailmentDetails && ailmentDetails.length > 0 ? (
                ailmentDetails.map((detail, idx) => (
                  <Box key={idx} className="space-y-2">
                    <Text
                      size="sm"
                      weight="bold"
                      color="text.muted"
                      className="mb-2"
                    >
                      {detail.question || 'What is the question?'}
                    </Text>
                    <Text
                      size="sm"
                      weight="normal"
                      color="text.DEFAULT"
                      className="leading-relaxed"
                    >
                      {detail.answer || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus neque massa, vulputate et venenatis a, pulvinar nec arcu.'}
                    </Text>
                  </Box>
                ))
              ) : (
                <Text size="sm" weight="normal" color="text.muted">
                  No ailment details available.
                </Text>
              )}
            </Box>
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default PatientProfileCard;
