
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardBody, CardHeader } from '../component-library/primitives/Card';
import { Text, Heading } from '../component-library/primitives/Typography';
import { IconButton, Button } from '../component-library/primitives/Button';
import { Flex, Box } from '../component-library/layout/Layout';
import { Skeleton } from '../component-library/feedback/Skeleton';
import getValidImageUrl, { formatDate } from '../helpers/utils';
import clsx from 'clsx';
import QuestionsContainer from './questions/QuestionsContainer';
import upIcon from '../assets/up.png';
import { Edit } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { getPatientAilments, getPatientById } from '../ApiCalls/patientAPis';

const normalizeAilments = (data = {}) => {
  if (Array.isArray(data?.ailments)) return data.ailments;

  if (typeof data?.ailments === 'string' && data.ailments.trim() !== '') {
    return data.ailments.split(',').map((a) => a.trim()).filter(Boolean);
  }

  if (typeof data?.aliments === 'string' && data.aliments.trim() !== '') {
    return data.aliments.split(',').map((a) => a.trim()).filter(Boolean);
  }

  return [];
};

export const PatientProfileCard = ({
  userData,
  role,
  onEditName,
  onEditAilments,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [resolvedUserData, setResolvedUserData] = useState({ ailments: [] });
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const { id: routePatientId } = useParams();

  const mergedUserData = useMemo(() => {
    const source = userData && Object.keys(userData).length > 0
      ? userData
      : resolvedUserData;
    return {
      ...source,
      ailments: normalizeAilments(source),
    };
  }, [resolvedUserData, userData]);

  useEffect(() => {
    let isMounted = true;

    const hasIncomingData = Boolean(userData?.id || userData?.name || userData?.ailments?.length);
    const patientId = userData?.id || routePatientId;

    if (hasIncomingData || !patientId) {
      return () => {
        isMounted = false;
      };
    }

    const fetchCardData = async () => {
      setIsFetchingProfile(true);
      try {
        const profileRes = await getPatientById(patientId);
        let profileData = profileRes?.data?.data || profileRes?.data || {};

        let normalizedAilments = normalizeAilments(profileData);
        if (normalizedAilments.length === 0) {
          const ailmentsRes = await getPatientAilments(patientId);
          const ailmentsPayload = ailmentsRes?.data?.data || ailmentsRes?.data || {};
          normalizedAilments = normalizeAilments(ailmentsPayload);
        }

        if (isMounted) {
          setResolvedUserData({
            ...profileData,
            ailments: normalizedAilments,
          });
        }
      } catch (error) {
        console.error('Error loading patient profile card data:', error);
      } finally {
        if (isMounted) {
          setIsFetchingProfile(false);
        }
      }
    };

    fetchCardData();

    return () => {
      isMounted = false;
    };
  }, [routePatientId, userData]);

  const getConditionStyle = (condition) => {
    switch (String(condition || '').toLowerCase()) {
      case 'stable': return 'bg-green-100 text-green-700';
      case 'unstable': return 'bg-yellow-100 text-yellow-700';
      case 'critical': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const hasAilment = (ailment) =>
    mergedUserData?.ailments?.some((item) => String(item || '').toLowerCase() === String(ailment || '').toLowerCase());

  const hasDialysisAilment = () =>
    hasAilment('Hemo Dialysis') || hasAilment('Peritoneal Dialysis') || hasAilment('Dialysis');

  const shouldShowGfrMetrics = () =>
    hasAilment('CKD') && hasAilment('Diabetes') && hasAilment('BP');

  const infoItems = [
    { label: 'Name:', value: mergedUserData?.name },
    { label: 'Number:', value: mergedUserData?.number },
    { label: 'Program:', value: mergedUserData?.program },
    { label: 'Ailments:', value: mergedUserData?.ailments?.join(', '), isEditable: role?.role_name !== 'Dialysis Technician' && role?.role_name !== 'Medical Staff', onEdit: onEditAilments },
    { label: 'DOB:', value: mergedUserData?.dob ? formatDate(mergedUserData.dob) : '-' },
    { label: 'Address:', value: mergedUserData?.address },
    { label: 'State:', value: mergedUserData?.state },
    { label: 'Pincode:', value: mergedUserData?.pincode },
    ...(shouldShowGfrMetrics() ? [
      { label: 'eGFR:', value: mergedUserData?.eGFR || '-' },
      { label: 'GFR:', value: mergedUserData?.GFR || '-' }
    ] : []),
    ...(hasDialysisAilment() ? [
      { label: 'Dry Weight:', value: mergedUserData?.dry_weight || '-' }
    ] : []),
    ...(hasAilment('CKD') ? [
      { label: 'KFRE:', value: mergedUserData?.kfre ? `${(parseFloat(mergedUserData.kfre) * 100).toFixed(2)}%` : '-' }
    ] : [])
  ];

  const showCardSkeleton = isFetchingProfile && !mergedUserData?.id && !mergedUserData?.name;

  return (
    <Card variant="elevated" className="w-full mt-4 mb-4 self-stretch bg-white rounded-2xl shadow-[2px_2px_8px_0px_rgba(0,0,0,0.35)]">
      <CardHeader
        className="px-4 py-2  bg-white cursor-pointer select-none  "
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Flex align="center" justify="between" className="w-full">
          <Heading as="h4" size="sm" weight="bold" >
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
          {showCardSkeleton ? (
            <Flex direction="flex-row" gap={8} align="start">
              <Flex direction="column" align="center" gap={3}>
                <Flex align="end" justify="between" className="w-full">
                  <Flex align="center" direction="column" gap={2}>
                    <Skeleton width="130px" height="130px" borderRadius="9999px" />
                    <Skeleton width="72px" height="18px" borderRadius="9999px" />
                  </Flex>
                  <Skeleton width="36px" height="36px" borderRadius="9999px" />
                </Flex>

                <Box className="w-full mt-2 space-y-2">
                  <Skeleton width="220px" height="16px" borderRadius="6px" />
                  <Skeleton width="190px" height="16px" borderRadius="6px" />
                  <Skeleton width="200px" height="16px" borderRadius="6px" />
                  <Skeleton width="180px" height="16px" borderRadius="6px" />
                  <Skeleton width="210px" height="16px" borderRadius="6px" />
                </Box>
              </Flex>

              <div className="w-0 self-stretch origin-top-left outline outline-[1px] outline-offset-[-0.5px] outline-info" />

              <Box className="flex-1 w-full space-y-3">
                <Skeleton width="160px" height="18px" borderRadius="6px" />
                <Skeleton width="95%" height="16px" borderRadius="6px" />
                <Skeleton width="88%" height="16px" borderRadius="6px" />
                <Skeleton width="92%" height="16px" borderRadius="6px" />
                <Skeleton width="84%" height="16px" borderRadius="6px" />
              </Box>
            </Flex>
          ) : (
          <Flex direction="flex-row" gap={8} align="start">
            <Flex direction="column" align="center" gap={3}>
              <Flex align="end" justify="between" className="w-full">
                <Flex align="center" direction="column" gap={2}>
                  <Box
                    as="img"
                    src={getValidImageUrl(mergedUserData?.profile_photo)}
                    alt={mergedUserData?.name}
                    className="rounded-full object-cover shadow-sm"
                    style={{
                      width: 130,
                      height: 130,
                      border: '4px solid #fff',
                      objectPosition: 'center top'
                    }}
                  />
                  <Box className={clsx('px-2 py-0.5 rounded-full w-fit text-[10px] font-bold uppercase tracking-tight', getConditionStyle(mergedUserData?.condition))}>
                    {mergedUserData?.condition || 'Unknown'}
                  </Box>
                </Flex>
                <IconButton
                  onClick={(e) => { e.stopPropagation(); onEditName?.(); }}
                  variant="ghost"
                  className="bg-white shadow rounded-full h-9 w-9 p-0 flex items-center justify-center hover:bg-gray-100"
                  icon={<Edit style={{ fontSize: 20, color: '#00A89B' }} />}
                />
              </Flex>

             

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
                <Heading as="h4" size="sm" weight="bold">Ailment Details</Heading>

                {isFetchingProfile && mergedUserData?.ailments?.length === 0 ? (
                  <Text size="sm" className="text-slate-500">Loading profile details...</Text>
                ) : mergedUserData?.ailments && mergedUserData.ailments.length > 0 ? (
                  mergedUserData.ailments.map((ailment, idx) => (
                    <React.Fragment key={`${ailment}-${idx}`}>
                      <Heading as="h5" size="xs" weight="bold" className="text-accent mb-2">{ailment}</Heading>
                      <QuestionsContainer aliment={ailment} user_id={mergedUserData?.id || routePatientId} />
                    </React.Fragment>
                  ))
                ) : (
                  <Text size="sm" className="text-slate-500">No ailments listed.</Text>
                )}
              </Box>
            </Box>
          </Flex>
          )}
        </CardBody>
      )}
    </Card>
  );
};

export default PatientProfileCard;

