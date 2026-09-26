/**
 * Patient Alert Card Component - Refactored
 * Uses component-library and Tailwind CSS
 *
 * interactionMode:
 * - "default" — show buttons when count > 0 (admin-style)
 * - "doctor"  — main DoctorContainer parity: show button if items exist;
 *               count is unread; unread>0 = highlighted, else gray
 *
 * @file src/pages/adminDashboard/components/PatientAlertCard.jsx
 */

import React from 'react';
import {
    Box,
    Flex,
    Button,
    Badge,
    Heading
} from '../../../component-library';
import { useIsMobile } from '../../../components/mobile/useIsMobile';
import dummyadmin from '../../../assets/dummyadmin.png';

const PatientAlertCard = ({ patient, onAction, interactionMode = 'default' }) => {
    const {
        name,
        prescriptionCount = 0,
        commentCount = 0,
        alertCount = 0,
        dialysisCount = 0,
        avatar,
        prescriptionAlerts = [],
        commentAlerts = [],
        alertAlerts = [],
        dialysisAlerts = [],
    } = patient;
    const { isMobile } = useIsMobile();
    const isDoctorMode = interactionMode === 'doctor';

    const showPrescription = isDoctorMode
        ? prescriptionAlerts.length > 0 || prescriptionCount > 0
        : prescriptionCount > 0;
    const showDialysis = isDoctorMode
        ? dialysisAlerts.length > 0 || dialysisCount > 0
        : dialysisCount > 0;
    const showComments = isDoctorMode
        ? commentAlerts.length > 0 || commentCount > 0
        : commentCount > 0;
    const showAlerts = isDoctorMode
        ? alertAlerts.length > 0 || alertCount > 0
        : alertCount > 0;

    const prescriptionLabel = prescriptionCount;
    const dialysisLabel = isDoctorMode ? dialysisCount : dialysisCount;
    const commentLabel = commentCount;
    const alertLabel = alertCount;

    const dialysisActive = !isDoctorMode || dialysisCount > 0;
    const commentsActive = !isDoctorMode || commentCount > 0;
    const alertsActive = !isDoctorMode || alertCount > 0;

    const hasAny =
        showPrescription || showDialysis || showComments || showAlerts;

    // Mobile compact card
    if (isMobile) {
        return (
            <Box
                className="py-3 bg-white"
                onClick={() => onAction && onAction(patient, 'view')}
            >
                <Flex align="center" gap={3}>
                    <img
                        src={avatar || dummyadmin}
                        alt={name}
                        className="w-12 h-12 rounded-full object-cover border border-gray-200 flex-shrink-0"
                    />
                    <Box className="flex-1 min-w-0">
                        <Heading as="h3" size="sm" className="text-black font-semibold truncate mb-2">
                            {name}
                        </Heading>
                        <Flex gap={2} wrap="wrap">
                            {showPrescription && (
                                <button
                                    className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold text-white border-none cursor-pointer"
                                    style={{ background: '#00cccc' }}
                                    onClick={(e) => { e.stopPropagation(); onAction(patient, 'prescription'); }}
                                >
                                    {prescriptionLabel} Rx
                                </button>
                            )}
                            {showDialysis && (
                                <button
                                    className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold text-white border-none cursor-pointer"
                                    style={{ background: dialysisActive ? '#6b21a8' : '#9ca3af' }}
                                    onClick={(e) => { e.stopPropagation(); onAction(patient, 'dialysis'); }}
                                >
                                    {dialysisLabel} DT
                                </button>
                            )}
                            {showComments && (
                                <button
                                    className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold text-white border-none cursor-pointer"
                                    style={{ background: commentsActive ? '#00c008' : '#9ca3af' }}
                                    onClick={(e) => { e.stopPropagation(); onAction(patient, 'comment'); }}
                                >
                                    {commentLabel} Cmt
                                </button>
                            )}
                            {showAlerts && (
                                <button
                                    className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold text-white border-none cursor-pointer"
                                    style={{ background: alertsActive ? '#fd0000' : '#9ca3af' }}
                                    onClick={(e) => { e.stopPropagation(); onAction(patient, 'alert'); }}
                                >
                                    {alertLabel} Alert
                                </button>
                            )}
                            {!hasAny && (
                                <span className="text-[11px] text-gray-400 font-medium">No alerts</span>
                            )}
                        </Flex>
                    </Box>
                </Flex>
            </Box>
        );
    }

    // Desktop card
    return (
        <Box
            className="p-6 bg-white hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-0"
            onClick={() => onAction && onAction(patient, 'view')}
        >
            <Flex align="center" gap={6} className="md:flex-row flex-col items-start md:items-center">
                <Box className="flex-shrink-0">
                    <img
                        src={avatar || dummyadmin}
                        alt={name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    />
                </Box>

                <Box className="flex-1 w-full">
                    <Heading as="h3" size="xl" className="mb-4 text-black font-semibold">
                        {name}
                    </Heading>

                    <Flex gap={4} wrap="wrap" className="w-full">
                        {showPrescription && (
                            <Button
                                variant="solid"
                                size="sm"
                                className="bg-[#00cccc] hover:bg-[#00b3b3] text-white font-bold px-6 border-none shadow-sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAction(patient, 'prescription');
                                }}
                            >
                                {prescriptionLabel} Approve Prescription
                            </Button>
                        )}

                        {showDialysis && (
                            <Button
                                variant="solid"
                                size="sm"
                                className={`${
                                    dialysisActive
                                        ? 'bg-[#6b21a8] hover:bg-[#581c87]'
                                        : 'bg-[#9ca3af] hover:bg-[#9ca3af]'
                                } text-white font-bold px-6 border-none shadow-sm`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAction(patient, 'dialysis');
                                }}
                            >
                                {dialysisLabel} Dialysis Tech Alerts
                            </Button>
                        )}

                        {showComments && (
                            <Button
                                variant="success"
                                size="sm"
                                className={`${
                                    commentsActive
                                        ? 'bg-[#00c008] hover:bg-[#00a807]'
                                        : 'bg-[#9ca3af] hover:bg-[#9ca3af]'
                                } text-white font-bold px-6 border-none shadow-sm`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAction(patient, 'comment');
                                }}
                            >
                                {commentLabel} Comments
                            </Button>
                        )}

                        {showAlerts && (
                            <Button
                                variant="danger"
                                size="sm"
                                className={`${
                                    alertsActive
                                        ? 'bg-[#fd0000] hover:bg-[#e00000]'
                                        : 'bg-[#9ca3af] hover:bg-[#9ca3af]'
                                } text-white font-bold px-6 border-none shadow-sm`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAction(patient, 'alert');
                                }}
                            >
                                {alertLabel} Alerts
                            </Button>
                        )}

                        {!hasAny && (
                            <Badge
                                variant="gray"
                                className="bg-[#989898] text-white px-6 py-2 rounded text-sm font-bold"
                            >
                                0 alerts
                            </Badge>
                        )}
                    </Flex>
                </Box>
            </Flex>
        </Box>
    );
};

export default PatientAlertCard;
