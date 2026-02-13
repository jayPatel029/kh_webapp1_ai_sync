
import React, { useState } from 'react';
import { Card, CardBody, CardHeader } from '../component-library/primitives/Card';
import { Text, Heading } from '../component-library/primitives/Typography';
import { IconButton, Button } from '../component-library/primitives/Button';
import { Flex, Box } from '../component-library/layout/Layout';
import getValidImageUrl, { formatDate } from '../helpers/utils';
import clsx from 'clsx';
import ParameterSection from './ParameterSection';
import QuestionsContainer from './questions/QuestionsContainer';
import upIcon from '../assets/up.png';
import { Edit } from '@mui/icons-material';
export const PatientProfileCard = ({
  userData,
  role,
  onEditName,
  onEditAilments,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getConditionStyle = (condition) => {
    switch (String(condition || '').toLowerCase()) {
      case 'stable': return 'bg-green-100 text-green-700';
      case 'unstable': return 'bg-yellow-100 text-yellow-700';
      case 'critical': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
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
    <Card variant="elevated" className="w-full self-stretch bg-white rounded-2xl !shadow-[2px_2px_8px_0px_rgba(0,0,0,0.35)] !shadow-[-2px_-2px_8px_0px_rgba(0,0,0,0.10)]">
      <CardHeader
        className="px-4 py-2  bg-white cursor-pointer select-none  "
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Flex align="center" justify="between" className="w-full">
          <Heading size="sm" weight="bold" className=" uppercase tracking-wide text-black font-16 font-bold">
            Basic details & ailment
          </Heading>
          {/* <Box className={clsx("h-6 w-6 p-0 hover:bg-transparent transition-transform duration-200", isExpanded ? 'rotate-90' : '')}>
            <img src={upIcon} alt='up' />
          </Box> */}
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 h-8 w-8 min-w-0"
          >
            <Box className={clsx("transition-transform duration-200", isExpanded ? 'rotate-90' : '')}>
              <img src={upIcon} alt='up' />
            </Box>
          </Button>
        </Flex>
      </CardHeader>

      {isExpanded && (
        <CardBody className="p-4 transition-all duration-300 ease-in-out">
          <Flex direction="flex-row" gap={8} align="start">
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
                  onClick={(e) => { e.stopPropagation(); onEditName(); }}
                  variant="ghost"
                  className="absolute bottom-0 right-0 bg-white shadow border rounded-full h-7 w-7 p-0 flex items-center justify-center"
                  icon={<Edit />}
                />

              </Box>

              <Box className={clsx('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight', getConditionStyle(userData?.condition))}>
                {userData?.condition || 'Unknown'}
              </Box>

              <Box className="w-full mt-2">
                <Box className="space-y-2 text-sm">
                  {infoItems.slice(0, 4).map((it, i) => (
                    <Flex key={i} className="items-center gap-2">
                      <Text size="xs" weight="bold" className="text-slate-400 uppercase mr-2" style={{ width: 80 }}>{it.label}</Text>
                      <Text size="sm" weight="semibold" className="text-slate-700 truncate">{it.value || '-'}</Text>
                    </Flex>
                  ))}
                </Box>

                <Box className="mt-3 text-sm">
                  {infoItems.slice(4).map((it, i) => (
                    <Flex key={i} className="items-center gap-2">
                      <Text size="xs" className="text-slate-400 uppercase mr-2" style={{ width: 80 }}>{it.label}</Text>
                      <Text size="sm" className="text-slate-700 truncate">{it.value || '-'}</Text>
                    </Flex>
                  ))}
                </Box>
              </Box>
            </Flex>
            {/* <hr className="border-2 w-full rotate-90 border-info self-stretch"/> */}
            <div className="w-0 self-stretch origin-top-left outline outline-[1px] outline-offset-[-0.5px] outline-info" />
            <Box className="flex-1 w-full">
              <Box className="space-y-4">
                <Box className="flex items-center gap-4">
                  <Box className="h-8 w-1 rounded-full" />
                  <Heading size="sm" weight="bold" className="text-2xl font-bold text-[#333]">Ailment Details</Heading>
                </Box>

                {userData?.ailments && userData.ailments.length > 0 ? (
                  userData.ailments.map((ailment, idx) => (
                    <ParameterSection key={idx} title={ailment}>
                      <QuestionsContainer aliment={ailment} user_id={userData?.id} />
                    </ParameterSection>
                  ))
                ) : (
                  <Text size="sm" className="text-slate-500">No ailments listed.</Text>
                )}
              </Box>
            </Box>
          </Flex>
        </CardBody>
      )}
    </Card>
  );
};

export default PatientProfileCard;

