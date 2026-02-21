/**
 * Patient Alert Card Component - Refactored
 * Uses component-library and Tailwind CSS
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

const PatientAlertCard = ({ patient, onAction }) => {
    const {
        name,
        prescriptionCount = 0,
        commentCount = 0,
        alertCount = 0,
        dialysisCount = 0,
        avatar,
    } = patient;
    const { isMobile } = useIsMobile();

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
                            {prescriptionCount > 0 && (
                                <button
                                    className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold text-white border-none cursor-pointer"
                                    style={{ background: '#00cccc' }}
                                    onClick={(e) => { e.stopPropagation(); onAction(patient, 'prescription'); }}
                                >
                                    {prescriptionCount} Rx
                                </button>
                            )}
                            {dialysisCount > 0 && (
                                <button
                                    className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold text-white border-none cursor-pointer"
                                    style={{ background: '#6b21a8' }}
                                    onClick={(e) => { e.stopPropagation(); onAction(patient, 'dialysis'); }}
                                >
                                    {dialysisCount} DT
                                </button>
                            )}
                            {commentCount > 0 && (
                                <button
                                    className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold text-white border-none cursor-pointer"
                                    style={{ background: '#00c008' }}
                                    onClick={(e) => { e.stopPropagation(); onAction(patient, 'comment'); }}
                                >
                                    {commentCount} Cmt
                                </button>
                            )}
                            {alertCount > 0 && (
                                <button
                                    className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold text-white border-none cursor-pointer"
                                    style={{ background: '#fd0000' }}
                                    onClick={(e) => { e.stopPropagation(); onAction(patient, 'alert'); }}
                                >
                                    {alertCount} Alert
                                </button>
                            )}
                            {prescriptionCount === 0 && commentCount === 0 && alertCount === 0 && dialysisCount === 0 && (
                                <span className="text-[11px] text-gray-400 font-medium">No alerts</span>
                            )}
                        </Flex>
                    </Box>
                </Flex>
            </Box>
        );
    }

    // Desktop card (original)
    return (
        <Box
            className="p-6 bg-white hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-0"
            onClick={() => onAction && onAction(patient, 'view')} // Optional click handler
        >
            <Flex align="center" gap={6} className="md:flex-row flex-col items-start md:items-center">

                {/* Patient Avatar */}
                <Box className="flex-shrink-0">
                    <img
                        src={avatar || dummyadmin}
                        alt={name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    />
                </Box>

                {/* Patient Info */}
                <Box className="flex-1 w-full">
                    <Heading as="h3" size="xl" className="mb-4 text-black font-semibold">
                        {name}
                    </Heading>

                    <Flex gap={4} wrap="wrap" className="w-full">
                        {prescriptionCount > 0 && (
                            <Button
                                variant="solid"
                                size="sm"
                                className="bg-[#00cccc] hover:bg-[#00b3b3] text-white font-bold px-6 border-none shadow-sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAction(patient, 'prescription');
                                }}
                            >
                                {prescriptionCount} Approve Prescription
                            </Button>
                        )}

                        {dialysisCount > 0 && (
                            <Button
                                variant="solid"
                                size="sm"
                                className="bg-[#6b21a8] hover:bg-[#581c87] text-white font-bold px-6 border-none shadow-sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAction(patient, 'dialysis');
                                }}
                            >
                                {dialysisCount} Dialysis Tech Alerts
                            </Button>
                        )}

                        {commentCount > 0 && (
                            <Button
                                variant="success" // Assuming success variant maps to green
                                size="sm"
                                className="bg-[#00c008] hover:bg-[#00a807] text-white font-bold px-6 border-none shadow-sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAction(patient, 'comment');
                                }}
                            >
                                {commentCount} Comments
                            </Button>
                        )}

                        {alertCount > 0 && (
                            <Button
                                variant="danger" // Assuming danger variant maps to red
                                size="sm"
                                className="bg-[#fd0000] hover:bg-[#e00000] text-white font-bold px-6 border-none shadow-sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAction(patient, 'alert');
                                }}
                            >
                                {alertCount} Alerts
                            </Button>
                        )}

                        {prescriptionCount === 0 && commentCount === 0 && alertCount === 0 && dialysisCount === 0 && (
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
