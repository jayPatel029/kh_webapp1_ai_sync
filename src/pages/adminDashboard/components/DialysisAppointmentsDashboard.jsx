/**
 * Dialysis Technician Dashboard – High-Density Scheduler
 * 
 * Features:
 * - 24-Hour Grid Visualization
 * - Timezone-Aware Slot/Appointment Matching
 * - Robust Ad-hoc and Template-based Appointment Rendering
 * - Centered Bed Management Actions
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
    Heading,
    Input,
    Text,
} from '../../../component-library';
import useDialysisAppointments from '../../../hooks/useDialysisAppointments';
import {
    getOrganizations,
    getClinics
} from '../../../ApiCalls/clinicApis';

const HOUR_HEIGHT = 80;
const START_HOUR = 0;
const END_HOUR = 23;

const DialysisAppointmentsDashboard = ({ clinicId: initialClinicId, onSelectSlot, onSelectAppointment }) => {
    const { fetchSlots, availableSlots, slotsLoading, dashboardAppointments } = useDialysisAppointments();

    const [organizations, setOrganizations] = useState([]);
    const [clinics, setClinics] = useState([]);
    const [selectedOrgId, setSelectedOrgId] = useState('');
    const [selectedClinicId, setSelectedClinicId] = useState(initialClinicId || '');

    // Use local dates for the range selection to avoid UTC shift issues
    const todayLocal = useMemo(() => {
        const d = new Date();
        return d.toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
    }, []);

    const [fromDate, setFromDate] = useState(todayLocal);
    const [toDate, setToDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 6);
        return d.toLocaleDateString('en-CA');
    });

    const dayList = useMemo(() => {
        const list = [];
        let curr = new Date(fromDate + 'T00:00:00'); // Parse as local
        const endD = new Date(toDate + 'T00:00:00');
        let safety = 0;
        while (curr <= endD && safety < 14) { 
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
            // Fetch with ISO strings for the backend
            fetchSlots(selectedClinicId, `${fromDate}T00:00:00Z`, `${toDate}T23:59:59Z`);
        }
    }, [selectedClinicId, fromDate, toDate, fetchSlots]);

    const handleSlotClick = useCallback((slot) => {
        if (onSelectSlot) {
            onSelectSlot({
                start: new Date(slot.instance.startUTC),
                end: new Date(slot.instance.endUTC),
                slotId: slot.slotId,
                clinicId: selectedClinicId
            });
        }
    }, [onSelectSlot, selectedClinicId]);

    // Position calculation helpers
    const getTopPos = (timeStr) => {
        if (!timeStr) return 0;
        const [h, m] = timeStr.split(':').map(Number);
        return (h - START_HOUR + (m / 60)) * HOUR_HEIGHT;
    };

    const getHeight = (startStr, endStr) => {
        if (!startStr || !endStr) return HOUR_HEIGHT;
        const [h1, m1] = startStr.split(':').map(Number);
        const [h2, m2] = endStr.split(':').map(Number);
        let durationHours = (h2 + m2 / 60) - (h1 + m1 / 60);
        if (durationHours <= 0) durationHours = 1; // Default to 1h if parsing fails or 0 duration
        return durationHours * HOUR_HEIGHT;
    };

    const getLocalTimeStr = (dateObj) => {
        // Return HH:mm in local time
        return dateObj.toTimeString().slice(0, 5);
    };

    const getLocalDateStr = (dateObj) => {
        // Return YYYY-MM-DD in local time
        return dateObj.toLocaleDateString('en-CA');
    };

    return (
        <Box className="flex flex-col gap-6 p-4 h-full" style={{ maxHeight: '90vh', background: '#f8fafc' }}>
            {/* Controls */}
            <Box className="bg-white shadow-lg border border-blue-100 rounded-3xl p-6" style={{ boxShadow: '0 18px 40px rgba(37, 99, 235, 0.08)' }}>
                <Flex direction="column" gap={4}>
                    <Flex justify="between" align="center" className="flex-wrap gap-4">
                        <Box>
                            <Heading size="lg" fontWeight="800" color="gray.900">Dialysis Scheduler</Heading>
                            <Text color="gray.500" fontSize="sm" fontWeight="600">Use the queue-friendly calendar to book, inspect, and hand off dialysis sessions.</Text>
                        </Box>
                        <Flex gap={4} align="center" className="bg-blue-50 p-2 rounded-2xl">
                            <Box>
                                <Text fontSize="9px" fontWeight="900" color="gray.400" textTransform="uppercase" ml={2}>Start Date</Text>
                                <Input variant="unstyled" px={2} size="xs" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} fontWeight="700" color="blue.600" />
                            </Box>
                            <Box w="1px" h="20px" bg="gray.200" />
                            <Box>
                                <Text fontSize="9px" fontWeight="900" color="gray.400" textTransform="uppercase" ml={2}>End Date</Text>
                                <Input variant="unstyled" px={2} size="xs" type="date" value={toDate} onChange={e => setToDate(e.target.value)} fontWeight="700" color="blue.600" />
                            </Box>
                        </Flex>
                    </Flex>

                    <Flex gap={4}>
                        <FormControl size="sm">
                            <select 
                                value={selectedOrgId} 
                                onChange={e => { setSelectedOrgId(e.target.value); setSelectedClinicId(''); }}
                                style={{ width: '100%', height: '42px', borderRadius: '14px', border: '1px solid #DBEAFE', padding: '0 12px', fontSize: '14px', fontWeight: '600', backgroundColor: '#fff' }}
                            >
                                <option value="">Select Organization</option>
                                {organizations.map(org => (<option key={org.id} value={org.id}>{org.name}</option>))}
                            </select>
                        </FormControl>
                        <FormControl size="sm">
                            <select 
                                value={selectedClinicId} 
                                onChange={e => setSelectedClinicId(e.target.value)}
                                disabled={!selectedOrgId}
                                style={{ width: '100%', height: '42px', borderRadius: '14px', border: '1px solid #DBEAFE', padding: '0 12px', fontSize: '14px', fontWeight: '600', backgroundColor: selectedOrgId ? '#fff' : '#f9fafb' }}
                            >
                                <option value="">Select Clinic</option>
                                {clinics.map(clinic => (<option key={clinic.id} value={clinic.id}>{clinic.clinic_name || clinic.name}</option>))}
                            </select>
                        </FormControl>
                    </Flex>

                    <Flex gap={3} wrap="wrap">
                        {[
                            { label: 'Blue blocks', value: 'Appointments' },
                            { label: 'Outlined slots', value: 'Available capacity' },
                            { label: 'Date window', value: `${dayList.length} day${dayList.length === 1 ? '' : 's'}` },
                        ].map((item) => (
                            <Box key={item.label} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '9999px', padding: '8px 12px' }}>
                                <Text fontSize="11px" color="gray.500" fontWeight="700" textTransform="uppercase">{item.label}</Text>
                                <Text fontSize="13px" color="gray.800" fontWeight="700">{item.value}</Text>
                            </Box>
                        ))}
                    </Flex>
                </Flex>
            </Box>

            {/* Scheduler Grid Wrapper - Handles Horizontal Scroll */}
            <Box className="bg-white shadow-xl border border-gray-100 rounded-3xl flex flex-col flex-1 overflow-hidden" style={{ boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)' }}>
                <Box className="flex-1 overflow-x-auto">
                    <Box style={{ minWidth: `${(dayList.length * 250) + 80}px`, display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {selectedClinicId ? (
                            <>
                                {/* Header Row: Dates */}
                                <Box style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: `80px repeat(${dayList.length}, 1fr)`, 
                                    borderBottom: '1px solid #F3F4F6', 
                                    backgroundColor: '#FFFFFF', 
                                    zIndex: 10,
                                    position: 'sticky',
                                    top: 0
                                }}>
                                    <Box p={4} />
                                    {dayList.map((day, idx) => (
                                        <Box key={idx} p={4} textAlign="center" borderLeft="1px solid #F3F4F6">
                                            <Text fontSize="xs" fontWeight="900" color="gray.400" textTransform="uppercase" mb={1}>{day.toLocaleString('default', { weekday: 'short' })}</Text>
                                            <Text fontSize="lg" fontWeight="800" color="gray.900">{day.getDate()} {day.toLocaleString('default', { month: 'short' })}</Text>
                                        </Box>
                                    ))}
                                </Box>

                                {/* Body Area: Scrollable (Vertical) */}
                                <Box className="flex-1 overflow-y-auto relative" style={{ minHeight: '500px' }}>
                                    <Box style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: `80px repeat(${dayList.length}, 1fr)`,
                                        minHeight: `${hours.length * HOUR_HEIGHT}px`,
                                        position: 'relative'
                                    }}>
                                {/* Hour Markers & Background Grid */}
                                {hours.map((h) => (
                                    <React.Fragment key={h}>
                                        <Box style={{ height: HOUR_HEIGHT, borderBottom: '1px solid #F9FAFB', display: 'flex', alignItems: 'start', justifyContent: 'center', paddingTop: '10px', backgroundColor: '#F9FAFB' }}>
                                            <Text fontSize="xs" fontWeight="700" color="gray.500">{String(h).padStart(2, '0')}:00</Text>
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
                                    gridTemplateColumns: `repeat(${dayList.length}, 1fr)`
                                }}>
                                    {dayList.map((day, dayIdx) => {
                                        const dateStr = getLocalDateStr(day);
                                        
                                        // 1. Get template slots for this day (Timezone robust matching)
                                        const daySlots = availableSlots.filter(s => {
                                            const slotDate = getLocalDateStr(new Date(s.instance.startUTC));
                                            return slotDate === dateStr;
                                        });
                                        
                                        // 2. Get appointments for this day
                                        const dayApps = dashboardAppointments.filter(a => {
                                            const appDate = getLocalDateStr(new Date(a.date));
                                            return appDate === dateStr;
                                        });

                                        return (
                                            <Box key={dayIdx} style={{ position: 'relative', height: '100%' }}>
                                                {/* Render Template Slots (Dashed Backgrounds) */}
                                                {daySlots.map(slot => {
                                                    const start = new Date(slot.instance.startUTC);
                                                    const end = new Date(slot.instance.endUTC);
                                                    const top = getTopPos(getLocalTimeStr(start));
                                                    const height = getHeight(getLocalTimeStr(start), getLocalTimeStr(end));
                                                    
                                                    return (
                                                        <Box 
                                                            key={`slot-${slot.id}`}
                                                            style={{
                                                                position: 'absolute',
                                                                top: `${top}px`,
                                                                height: `${height}px`,
                                                                left: '4px',
                                                                right: '4px',
                                                                backgroundColor: 'rgba(59, 130, 246, 0.03)',
                                                                border: '2px dashed #BFDBFE',
                                                                borderRadius: '16px',
                                                                pointerEvents: 'auto',
                                                                padding: '12px',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                gap: '12px',
                                                                zIndex: 1,
                                                                transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            <Box textAlign="center">
                                                                <Text fontSize="10px" fontWeight="900" color="blue.500" textTransform="uppercase" letterSpacing="0.05em">Available Beds</Text>
                                                                <Text fontSize="xl" fontWeight="900" color="blue.700" lineHeight="1">
                                                                    {Number(slot.instance.capacity) - Number(slot.instance.bookedCount)}
                                                                </Text>
                                                                <Text fontSize="10px" fontWeight="700" color="blue.400" mt={1}>of {slot.instance.capacity} beds free</Text>
                                                            </Box>
                                                            {Number(slot.instance.capacity) > Number(slot.instance.bookedCount) && (
                                                                <Button 
                                                                    size="xs" 
                                                                    variant="brand" 
                                                                    onClick={() => handleSlotClick(slot)} 
                                                                    style={{ 
                                                                        height: '28px', 
                                                                        fontSize: '11px', 
                                                                        width: '90%', 
                                                                        borderRadius: '10px',
                                                                        boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)'
                                                                    }}
                                                                >
                                                                    Book Bed
                                                                </Button>
                                                            )}
                                                        </Box>
                                                    );
                                                })}

                                                {/* Render Actual Appointments (Solid Cards) */}
                                                {dayApps.map(app => {
                                                    const top = getTopPos(app.startTime);
                                                    const height = getHeight(app.startTime, app.endTime);
                                                    
                                                    return (
                                                        <Box 
                                                            key={`app-${app.id}`}
                                                            onClick={() => onSelectAppointment && onSelectAppointment(app)}
                                                            style={{
                                                                position: 'absolute',
                                                                top: `${top}px`,
                                                                height: `${height}px`,
                                                                left: '8px',
                                                                right: '8px',
                                                                backgroundColor: '#FFFFFF',
                                                                borderLeft: '5px solid #EF4444',
                                                                boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                                                                borderRadius: '12px',
                                                                pointerEvents: 'auto',
                                                                padding: '12px',
                                                                zIndex: 2,
                                                                overflow: 'hidden',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                border: '1px solid #F3F4F6',
                                                                borderLeftWidth: '5px'
                                                            }}
                                                        >
                                                            <Flex align="start" justify="between" mb={1} gap={2}>
                                                                <Text fontSize="sm" fontWeight="800" color="gray.900" noOfLines={2} lineHeight="1.2">
                                                                    {app.patientName || `Patient #${app.patientId || '???'}`}
                                                                </Text>
                                                                <Badge size="xs" variant="subtle" colorScheme="red" borderRadius="6px" fontSize="9px">
                                                                    {String(app.status).toUpperCase()}
                                                                </Badge>
                                                            </Flex>
                                                            <Text fontSize="10px" color="gray.500" fontWeight="700" mb={2}>
                                                                {app.startTime.slice(0, 5)} - {app.endTime.slice(0, 5)}
                                                            </Text>
                                                            
                                                            {height > 100 && (
                                                                <Box mt="auto" pt={2} borderTop="1px solid #F9FAFB">
                                                                    <Text fontSize="9px" color="gray.400" fontWeight="600" textTransform="uppercase">Treatment Session</Text>
                                                                    <Text fontSize="9px" color="gray.500" fontWeight="700">Bed: {app.bedId || 'Unassigned'}</Text>
                                                                </Box>
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
                            <Box p={6} bg="blue.50" borderRadius="3xl">
                                <Text fontSize="4xl">🏥</Text>
                            </Box>
                            <Heading size="md" color="gray.800" fontWeight="800">Clinic View Required</Heading>
                            <Text color="gray.500" maxW="300px" fontWeight="600">Please select an organization and clinic to initialize the scheduler grid.</Text>
                        </Flex>
                    </Box>
                )}
                    </Box> {/* End minWidth Box */}
                </Box> {/* End overflow-x-auto Box */}
            </Box> {/* End outer wrapper Box */}

            {/* Legend */}
            <Flex gap={6} p={4} bg="gray.50" borderRadius="2xl" border="1px solid #F1F5F9">
                <Flex align="center" gap={3}>
                    <Box w="16px" h="16px" borderRadius="4px" border="2px dashed #BFDBFE" bg="rgba(59, 130, 246, 0.05)" />
                    <Text fontSize="xs" fontWeight="800" color="gray.600">Available Slot</Text>
                </Flex>
                <Flex align="center" gap={3}>
                    <Box w="16px" h="16px" borderRadius="4px" bg="white" border="1px solid #F3F4F6" borderLeft="5px solid #EF4444" shadow="sm" />
                    <Text fontSize="xs" fontWeight="800" color="gray.600">Booked Session</Text>
                </Flex>
                <Box ml="auto">
                    <Text fontSize="xs" fontWeight="700" color="gray.400">Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</Text>
                </Box>
            </Flex>
        </Box>
    );
};

export default DialysisAppointmentsDashboard;
