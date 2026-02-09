/**
 * Patient Profile Card Component
 * Displays patient basic details and ailment information in a compact, dynamic layout.
 * 
 * @file src/components/PatientProfileCard.jsx
 */

import React from 'react';
import clsx from 'clsx';
import {
  Card,
  CardBody,
  CardHeader,
  Text,
  Heading,
  IconButton,
  Box,
  Flex,
} from '../component-library';
import getValidImageUrl, { formatDate } from '../helpers/utils';
import ParameterSection from './ParameterSection';
import QuestionsContainer from './questions/QuestionsContainer';
import '../design-system/styles/index.css';

export const PatientProfileCard = ({
  userData,
  role,
  onEditName,
  onEditAilments,
}) => {
  const getConditionStyle = (condition) => {
    switch (String(condition || '').toLowerCase()) {
      case 'stable': return 'badge-success';
      case 'unstable': return 'badge-warning';
      case 'critical': return 'badge-error';
      default: return 'badge-default';
    }
  };

  const infoItems = [
    { label: 'Name:', value: userData?.name },
    { label: 'Number:', value: userData?.number },
    { label: 'Program:', value: userData?.program },
    { label: 'Ailments:', value: userData?.ailments?.join(', '), isEditable: role?.role_name !== 'Dialysis Technician' && role?.role_name !== 'Medical Staff', onEdit: onEditAilments },
    { label: 'DOB:', value: userData?.dob ? formatDate(userData.dob) : '-' },
    { label: 'Address:', value: userData?.address },
    { label: 'State:', value: userData?.state },
    { label: 'Pincode:', value: userData?.pincode },
    ...(userData?.ailments?.includes('CKD') ? [
      { label: 'eGFR:', value: userData?.eGFR || '-' },
      { label: 'GFR:', value: userData?.GFR || '-' }
    ] : []),
    ...(userData?.ailments?.includes('Hemo Dialysis') ? [
      { label: 'Dry Weight:', value: userData?.dry_weight || '-' }
    ] : []),
    ...(userData?.ailments?.includes('CKD') && !userData?.ailments?.includes('Hemo Dialysis') && !userData?.ailments?.includes('Peritoneal Dialysis') ? [
      { label: 'KFRE:', value: userData?.kfre ? `${(parseFloat(userData.kfre) * 100).toFixed(2)}%` : '-' }
    ] : [])
  ];

  return (
    <Card variant="elevated" className="w-full card-elevated">
      <CardHeader className="px-4 py-2 border-b border-border bg-white">
        <Flex align="center" justify="start" className="w-full">
          <Heading size="sm" weight="bold" className="uppercase tracking-wide text-muted">
            Basic details & ailment
          </Heading>
        </Flex>
      </CardHeader>

      <CardBody className="p-4">
        <Flex className="flex-col md:flex-row" gap={4} align="start">
          <Box className="flex-shrink-0 w-full md:w-56">
            <Flex direction="column" align="center" gap={3}>
              <Box className="relative">
                <Box
                  as="img"
                  src={getValidImageUrl(userData?.profile_photo)}
                  alt={userData?.name}
                  className="rounded-full object-cover shadow-sm"
                  style={{ width: 84, height: 84, border: '4px solid #fff' }}
                />
                <IconButton
                  onClick={onEditName}
                  variant="ghost"
                  className="absolute bottom-0 right-0 bg-white shadow border rounded-full h-7 w-7 p-0 flex items-center justify-center"
                  aria-label="Edit name"
                >
                  <span style={{ fontSize: 10 }}>✎</span>
                </IconButton>
              </Box>

              <Box className={clsx('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight', getConditionStyle(userData?.condition))}>
                {userData?.condition || 'Unknown'}
              </Box>

              <Box className="w-full mt-2">
                <Box className="space-y-2 text-sm">
                  {infoItems.slice(0, 4).map((it, i) => (
                    <Flex key={i} className="items-center gap-2">
                      <Text size="xs" weight="bold" className="text-muted uppercase mr-2" style={{ width: 80 }}>{it.label}</Text>
                      <Text size="sm" weight="semibold" className="text-dark truncate">{it.value || '-'}</Text>
                    </Flex>
                  ))}
                </Box>

                <Box className="mt-3 text-sm">
                  {infoItems.slice(4).map((it, i) => (
                    <Flex key={i} className="items-center gap-2">
                      <Text size="xs" className="text-muted uppercase mr-2" style={{ width: 80 }}>{it.label}</Text>
                      <Text size="sm" className="text-dark truncate">{it.value || '-'}</Text>
                    </Flex>
                  ))}
                </Box>
              </Box>
            </Flex>
          </Box>

          <Box className="hidden md:block divider-vertical" style={{ width: 1, marginLeft: 16, marginRight: 16 }} />

          <Box className="flex-1 w-full">
            <Box className="space-y-4">
              <Box className="flex items-center gap-4">
                <Box className="h-8 w-1 bg-primary rounded-full" />
                <Heading size="sm" weight="bold" className="text-2xl font-bold text-dark">Ailment Details</Heading>
              </Box>

              {userData?.ailments && userData.ailments.length > 0 ? (
                userData.ailments.map((ailment, idx) => (
                  <ParameterSection key={idx} title={ailment}>
                    <QuestionsContainer aliment={ailment} user_id={userData?.id} />
                  </ParameterSection>
                ))
              ) : (
                  <Text size="sm" className="text-muted">No ailments listed.</Text>
              )}

            </Box>
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default PatientProfileCard;
