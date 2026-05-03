/**
 * Dialysis Technician Dashboard – High-Density Scheduler
 * 
 * Features:
 * - Days as Columns
 * - Hours as Rows
 * - Slot Templates as Cards
 * - Appointments as Span-Row Cards
 *
 * @file src/pages/adminDashboard/components/DialysisAppointmentsDashboard.jsx
 */

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
    Badge,
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Spinner,
    Text,
} from '../../../component-library';
import useDialysisAppointments from '../../../hooks/useDialysisAppointments';
import {
    getOrganizations,
    getClinics
} from '../../../ApiCalls/clinicApis';
import {
    formatShortDate,
} from '../../../utils/appointmentDateUtils';

const HOUR_HEIGHT = 80;
const START_HOUR = 0;
const END_HOUR = 23;

const DialysisAppointmentsDashboard = ({ clinicId: initialClinicId, onSelectSlot, onSelectAppointment }) => {
    const { fetchSlots, availableSlots, slotsLoading, dashboardAppointments } = useDialysisAppointments();

    const [organizations, setOrganizations] = useState([]);
    const [clinics, setClinics] = useState([]);
    const [selectedOrgId, setSelectedOrgId] = useState('');
    const [selectedClinicId, setSelectedClinicId] = useState(initialClinicId || '');

    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
    const [fromDate, setFromDate] = useState(todayStr);
    const [toDate, setToDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 6);
        return d.toISOString().split('T')[0];
    });

    const dayList = useMemo(() => {
        const list = [];
        let curr = new Date(fromDate);
        const endD = new Date(toDate);
        let safety = 0;
        while (curr <= endD && safety < 31) { // Limit to 31 days for sanity
            list.push(new Date(curr));
            curr.setDate(curr.getDate() + 1);
            safety++;
        }
        return list;
    }, [fromDate, toDate]);

    const hours = useMemo(() => Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR), []);

    useEffect(() => {
        getOrganizations().then(res => {
            if (res.success) setOrganizations(res.data?.data || res.data || []);
        });
    }, []);

    useEffect(() => {
        if (selectedOrgId) {
            getClinics({ params: { orgId: selectedOrgId } }).then(res => {
                if (res.success) setClinics(res.data?.data || res.data || []);
            });
        } else {
            setClinics([]);
        }
    }, [selectedOrgId]);

    useEffect(() => {
        if (selectedClinicId) {
            fetchSlots(selectedClinicId, `${fromDate}T00:00:00Z`, `${toDate}T23:59:59Z`);
        }
    }, [selectedClinicId, fromDate, toDate, fetchSlots]);

    const handleSlotClick = useCallback((slot) => {
        if (onSelectSlot) {
            onSelectSlot({
                start: new Date(slot.instance.startUTC),
                end: new Date(slot.instance.endUTC),
                slotId: slot.slot_id,
                clinicId: selectedClinicId
            });
        }
    }, [onSelectSlot, selectedClinicId]);

    // Position calculation helpers
    const getTopPos = (timeStr) => {
        const [h, m] = timeStr.split(':').map(Number);
        return (h - START_HOUR + (m / 60)) * HOUR_HEIGHT;
    };

    const getHeight = (startStr, endStr) => {
        const [h1, m1] = startStr.split(':').map(Number);
        const [h2, m2] = endStr.split(':').map(Number);
        const durationHours = (h2 + m2 / 60) - (h1 + m1 / 60);
        return durationHours * HOUR_HEIGHT;
    };

    const getUtcTimeStr = (dateObj) => {
        return dateObj.toISOString().split('T')[1].slice(0, 5);
    };

    const getLocalTimeStr = (dateObj) => {
        return dateObj.toTimeString().slice(0, 5);
    };

    return (
        <Box className="flex flex-col gap-6 p-4 h-full" style={{ maxHeight: '90vh' }}>
            {/* Controls */}
            <Box className="bg-white shadow-lg border border-gray-100 rounded-3xl p-6">
                <Flex direction="column" gap={4}>
                    <Flex justify="between" align="center" className="flex-wrap gap-4">
                        <Box>
                            <Heading size="lg" fontWeight="800">Dialysis Scheduler</Heading>
                            <Text color="gray.500" fontSize="sm">Hour-wise bed management across the week</Text>
                        </Box>
                        <Flex gap={4} align="center" className="bg-gray-50 p-2 rounded-2xl">
                            <Box>
                                <Text fontSize="9px" fontWeight="900" color="gray.400" textTransform="uppercase" ml={2}>From</Text>
                                <Input variant="unstyled" px={2} size="xs" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} fontWeight="700" color="blue.600" />
                            </Box>
                            <Box w="1px" h="20px" bg="gray.200" />
                            <Box>
                                <Text fontSize="9px" fontWeight="900" color="gray.400" textTransform="uppercase" ml={2}>To</Text>
                                <Input variant="unstyled" px={2} size="xs" type="date" value={toDate} onChange={e => setToDate(e.target.value)} fontWeight="700" color="blue.600" />
                            </Box>
                        </Flex>
                    </Flex>

                    <Flex gap={4} align="center">
                        <Flex gap={4} flex={1}>
                            <FormControl size="sm">
                                <select 
                                    value={selectedOrgId} 
                                    onChange={e => { setSelectedOrgId(e.target.value); setSelectedClinicId(''); }}
                                    style={{ width: '100%', height: '40px', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '0 12px', fontSize: '14px', fontWeight: '600' }}
                                >
                                    <option value="">Organization</option>
                                    {organizations.map(org => (<option key={org.id} value={org.id}>{org.name}</option>))}
                                </select>
                            </FormControl>
                            <FormControl size="sm">
                                <select 
                                    value={selectedClinicId} 
                                    onChange={e => setSelectedClinicId(e.target.value)}
                                    disabled={!selectedOrgId}
                                    style={{ width: '100%', height: '40px', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '0 12px', fontSize: '14px', fontWeight: '600' }}
                                >
                                    <option value="">Clinic</option>
                                    {clinics.map(clinic => (<option key={clinic.id} value={clinic.id}>{clinic.clinic_name || clinic.name}</option>))}
                                </select>
                            </FormControl>
                        </Flex>

                        {/* Legend moved beside selectors */}
                        <Flex gap={4} align="center" bg="gray.50" px={4} py={2} borderRadius="xl" border="1px solid #E5E7EB">
                            <Flex align="center" gap={2}>
                                <Box style={{ width: '12px', height: '12px', borderRadius: '3px', border: '2px dashed #3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.15)' }} />
                                <Text fontSize="10px" fontWeight="800" color="gray.600">Available</Text>
                            </Flex>
                            <Flex align="center" gap={2}>
                                <Box style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#FFFFFF', borderLeft: '4px solid #EF4444', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }} />
                                <Text fontSize="10px" fontWeight="800" color="gray.600">Booked</Text>
                            </Flex>
                            <Flex align="center" gap={2}>
                                <Box style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#10B981' }} />
                                <Text fontSize="10px" fontWeight="800" color="gray.600">Full</Text>
                            </Flex>
                        </Flex>
                    </Flex>
                </Flex>
            </Box>


            {/* Scheduler Grid */}
            <Box className="bg-white shadow-xl border border-gray-100 rounded-3xl overflow-x-auto flex flex-col flex-1 relative">
                {selectedClinicId ? (
                    <>
                        {/* Header Row: Dates */}
                        <Box style={{ display: 'grid', gridTemplateColumns: `80px repeat(${dayList.length}, minmax(200px, 1fr))`, borderBottom: '1px solid #F3F4F6', backgroundColor: '#F9FAFB', zIndex: 10 }}>
                            <Box p={4} />
                            {dayList.map((day, idx) => (
                                <Box key={idx} p={4} textAlign="center" borderLeft="1px solid #F3F4F6">
                                    <Text fontSize="xs" fontWeight="900" color="gray.400" textTransform="uppercase">{day.toLocaleString('default', { weekday: 'short' })}</Text>
                                    <Text fontSize="lg" fontWeight="800" color="gray.900">{day.getDate()} {day.toLocaleString('default', { month: 'short' })}</Text>
                                </Box>
                            ))}
                        </Box>

                        {/* Body Area: Scrollable */}
                        <Box className="flex-1 overflow-y-auto relative" style={{ minHeight: '500px' }}>
                            <Box style={{ 
                                display: 'grid', 
                                gridTemplateColumns: `80px repeat(${dayList.length}, minmax(200px, 1fr))`,
                                minHeight: `${hours.length * HOUR_HEIGHT}px`,
                                position: 'relative'
                            }}>
                                {/* Hour Markers */}
                                {hours.map((h, i) => (
                                    <React.Fragment key={h}>
                                        <Box style={{ height: HOUR_HEIGHT, borderBottom: '1px solid #F9FAFB', display: 'flex', alignItems: 'start', justifyContent: 'center', paddingTop: '10px' }}>
                                            <Text fontSize="xs" fontWeight="700" color="gray.400">{String(h).padStart(2, '0')}:00</Text>
                                        </Box>
                                        {dayList.map((_, idx) => (
                                            <Box key={idx} style={{ height: HOUR_HEIGHT, borderBottom: '1px solid #F3F4F6', borderLeft: '1px solid #F3F4F6' }} />
                                        ))}
                                    </React.Fragment>
                                ))}

                                {/* Overlay for Slots and Appointments */}
                                <Box style={{ 
                                    position: 'absolute', 
                                    top: 0, 
                                    left: '80px', 
                                    right: 0, 
                                    bottom: 0, 
                                    pointerEvents: 'none',
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${dayList.length}, minmax(200px, 1fr))`
                                }}>
                                    {dayList.map((day, dayIdx) => {
                                        const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
                                        
                                        // 1. Get template slots for this day
                                        const daySlots = availableSlots.filter(s => {
                                            const sDateObj = new Date(s.instance.startUTC);
                                            const sDateStr = `${sDateObj.getFullYear()}-${String(sDateObj.getMonth() + 1).padStart(2, '0')}-${String(sDateObj.getDate()).padStart(2, '0')}`;
                                            return sDateStr === dateStr;
                                        });
                                        
                                        // 2. Get appointments for this day
                                        const dayApps = dashboardAppointments.filter(a => {
                                            const aDate = new Date(a.date);
                                            const aDateStr = `${aDate.getFullYear()}-${String(aDate.getMonth() + 1).padStart(2, '0')}-${String(aDate.getDate()).padStart(2, '0')}`;
                                            return aDateStr === dateStr;
                                        });

                                        return (
                                            <Box key={dayIdx} style={{ position: 'relative', height: '100%' }}>
                                                {/* Render Template Slots */}
                                                {daySlots.map(slot => {
                                                    const start = new Date(slot.instance.startUTC);
                                                    const end = new Date(slot.instance.endUTC);
                                                    const top = getTopPos(getLocalTimeStr(start));
                                                    const height = getHeight(getLocalTimeStr(start), getLocalTimeStr(end));
                                                    
                                                    return (
                                                        <Box 
                                                            key={slot.id}
                                                            style={{
                                                                position: 'absolute',
                                                                top: `${top}px`,
                                                                height: `${height}px`,
                                                                left: '4px',
                                                                right: '4px',
                                                                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                                                                border: '2px dashed #3B82F6',
                                                                borderRadius: '16px',
                                                                pointerEvents: 'auto',
                                                                padding: '12px',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                gap: '10px',
                                                                zIndex: 1,
                                                                boxShadow: 'inset 0 0 10px rgba(59, 130, 246, 0.05)'
                                                            }}
                                                        >
                                                            <Box textAlign="center">
                                                                <Text fontSize="10px" fontWeight="900" color="blue.600" textTransform="uppercase">Available Beds</Text>
                                                                <Text fontSize="xl" fontWeight="900" color="blue.800">
                                                                    {Number(slot.clinic_capacity || slot.instance.capacity) - Number(slot.instance.bookedCount)} Left
                                                                </Text>
                                                                <Text fontSize="10px" fontWeight="800" color="blue.500">({slot.instance.bookedCount}/{slot.clinic_capacity || slot.instance.capacity} Clinic Capacity)</Text>
                                                            </Box>
                                                            <Button size="xs" variant="brand" onClick={() => handleSlotClick(slot)} style={{ height: '28px', fontSize: '11px', width: '90%', borderRadius: '10px', fontWeight: '800', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)' }}>Book Bed</Button>
                                                        </Box>
                                                    );
                                                })}

                                                {/* Render Actual Appointments (Longer cards over hours) */}
                                                {dayApps.map(app => {
                                                    const top = getTopPos(app.startTime);
                                                    const height = getHeight(app.startTime, app.endTime);
                                                    
                                                    return (
                                                        <Box 
                                                            key={app.id}
                                                            onClick={() => onSelectAppointment && onSelectAppointment(app)}
                                                            style={{
                                                                position: 'absolute',
                                                                top: `${top}px`,
                                                                height: `${height}px`,
                                                                left: '8px',
                                                                right: '8px',
                                                                backgroundColor: '#FEF2F2',
                                                                borderLeft: '6px solid #EF4444',
                                                                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)',
                                                                borderRadius: '12px',
                                                                pointerEvents: 'auto',
                                                                padding: '12px',
                                                                zIndex: 2,
                                                                overflow: 'hidden',
                                                                cursor: 'pointer',
                                                                border: '1px solid #FEE2E2'
                                                            }}
                                                        >
                                                            <Flex align="start" justify="between" mb={1}>
                                                                <Text fontSize="xs" fontWeight="800" color="gray.900" noOfLines={1}>{app.patientName}</Text>
                                                                <Badge size="xs" colorScheme="red" variant="solid">BOOKED</Badge>
                                                            </Flex>
                                                            <Text fontSize="10px" color="gray.500" fontWeight="600">{app.startTime} - {app.endTime}</Text>
                                                            {height > 60 && (
                                                                <Text fontSize="9px" color="gray.400" mt={2} noOfLines={2}>Dialysis Treatment Session</Text>
                                                            )}
                                                        </Box>
                                                    );
                                                })}
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Box>
                        </Box>
                    </>
                ) : (
                    <Box p={20} textAlign="center">
                        <Flex direction="column" align="center" gap={4}>
                            <Box p={4} bg="blue.50" borderRadius="full">🏥</Box>
                            <Heading size="md" color="gray.800">Select Clinic</Heading>
                            <Text color="gray.500">Pick an organization and clinic to view the live scheduler.</Text>
                        </Flex>
                    </Box>
                )}
            </Box>


        </Box>
    );
};

export default DialysisAppointmentsDashboard;