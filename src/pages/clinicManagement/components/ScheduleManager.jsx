import React, { useState, useEffect, useMemo } from 'react';
import { Box } from '../../../component-library';
import { getAvailableSlots } from '../../../ApiCalls/clinicApis';

export function ScheduleManager({ 
  slotTemplates = [], 
  availableClinicTemplates = [],
  onChange, 
  capacity = 1, 
  bufferMinutes = 30,
  existingAppointments = [], 
  duration = 240, // default 4 hours in minutes
  clinicId = null,
  date = null,
  isManagementMode = false
}) {
  const DAYS = [
    { label: 'Monday', value: 'Monday' },
    { label: 'Tuesday', value: 'Tuesday' },
    { label: 'Wednesday', value: 'Wednesday' },
    { label: 'Thursday', value: 'Thursday' },
    { label: 'Friday', value: 'Friday' },
    { label: 'Saturday', value: 'Saturday' },
    { label: 'Sunday', value: 'Sunday' },
  ];

  const [frequency, setFrequency] = useState('weekly');
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0); 

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [availableInstances, setAvailableInstances] = useState([]);
  const [activeAppointments, setActiveAppointments] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [pendingSlots, setPendingSlots] = useState([]); // Slots selected but not yet "Added"

  // Pre-select the day of the week if a specific date is provided
  useEffect(() => {
    if (date && !isManagementMode) {
      const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
      if (!selectedDays.includes(dayName)) {
        setSelectedDays(prev => Array.from(new Set([...prev, dayName])));
      }
    }
  }, [date, isManagementMode]);

  // Helper to add minutes to time
  const addMinutes = (timeStr, minutes) => {
    if (!timeStr || !minutes) return '';
    const [hours, mins] = timeStr.split(':').map(Number);
    const dateObj = new Date(0, 0, 0, hours, mins + Number(minutes));
    return `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
  };

  // Fetch available slot instances (wide ranges) for a 14-day window to check availability
  useEffect(() => {
    async function fetchInstances() {
      if (!clinicId) {
        setAvailableInstances([]);
        setActiveAppointments([]);
        return;
      }

      // Use a fixed 14-day window to check for overall day availability
      const start = date || new Date().toISOString().split('T')[0];
      const endD = new Date(start);
      endD.setDate(endD.getDate() + 14);
      const end = endD.toISOString().split('T')[0];

      setIsLoadingSlots(true);
      try {
        const from = `${start}T00:00:00Z`;
        const to = `${end}T23:59:59Z`;
        const res = await getAvailableSlots(clinicId, from, to);
        if (res.success && res.data) {
          setAvailableInstances(res.data.data || []);
          setActiveAppointments(res.data.appointments || []);
        }
      } catch (err) {
        console.error("Failed to fetch slots in ScheduleManager:", err);
      } finally {
        setIsLoadingSlots(false);
      }
    }
    fetchInstances();
  }, [clinicId, date]);

  // Determine which days of the week have any availability
  const dayAvailability = useMemo(() => {
    const availability = {};
    DAYS.forEach(d => { availability[d.value] = false; });

    const templatesToUse = availableClinicTemplates.length > 0 ? availableClinicTemplates : slotTemplates;

    if (templatesToUse.length > 0) {
      templatesToUse.forEach(template => {
        if (template.status !== 'inactive' && template.daysOfWeek) {
          template.daysOfWeek.forEach(day => {
            availability[day] = true;
          });
        }
      });
    } else if (availableInstances.length > 0 && isManagementMode) {
      availableInstances.forEach(instance => {
        const dayName = new Date(instance.instance.startUTC).toLocaleDateString('en-US', { weekday: 'long' });
        if (instance.instance.bookedCount < instance.instance.capacity) {
          availability[dayName] = true;
        }
      });
    }
    return availability;
  }, [availableInstances, slotTemplates, availableClinicTemplates, isManagementMode]);


  // Materialize specific slots from slotTemplates or wide instance ranges
  const materializedSlots = useMemo(() => {
    const sessionDurationMin = Number(duration);
    if (!sessionDurationMin) return [];

    const slots = [];
    const allRelevantAppts = [...existingAppointments, ...activeAppointments];

    const templatesToUse = (!isManagementMode && availableClinicTemplates.length > 0)
      ? availableClinicTemplates
      : slotTemplates;

    if (templatesToUse.length > 0) {
      const relevantDays = (frequency !== 'monthly' && selectedDays.length > 0) 
        ? selectedDays 
        : (isManagementMode ? DAYS.map(d => d.value) : DAYS.map(d => d.value));

      relevantDays.forEach(dayName => {
        const matchingTemplates = templatesToUse.filter(t => 
          (t.daysOfWeek?.includes(dayName) || (t.frequency === 'monthly' && frequency === 'monthly')) && 
          t.status !== 'inactive'
        );

        matchingTemplates.forEach(template => {
          const timings = (template.timings && template.timings.length > 0) 
            ? template.timings 
            : [{ startTime: template.startTime, endTime: template.endTime }];
          
          const buffer = Number(template.bufferMinutes || bufferMinutes);
          const slotCap = Number(template.maxPatientsPerSlot || capacity);

          timings.forEach(timing => {
            if (!timing.startTime || !timing.endTime) return;

            // Use a dummy date for time calculation
            let current = new Date(`1970-01-01T${timing.startTime}:00`);
            const end = new Date(`1970-01-01T${timing.endTime}:00`);

            while (new Date(current.getTime() + sessionDurationMin * 60000) <= end) {
              const sStr = current.toTimeString().slice(0, 5);
              const endTimeObj = new Date(current.getTime() + sessionDurationMin * 60000);
              const eStr = endTimeObj.toTimeString().slice(0, 5);

              // Basic overlap check if a date is provided
              let remaining = slotCap;
              if (date) {
                const sDate = new Date(date).toISOString().split('T')[0];
                const overlaps = allRelevantAppts.filter(appt => {
                  if (!appt.startTime || !appt.endTime || ['CANCELLED', 'MISSED', 'REJECTED'].includes(appt.status?.toUpperCase())) return false;
                  const aDate = new Date(appt.date).toISOString().split('T')[0];
                  if (aDate !== sDate) return false;
                  const aStart = appt.startTime.slice(0, 5);
                  const aEnd = appt.endTime.slice(0, 5);
                  return (aStart < eStr && aEnd > sStr);
                });
                remaining = slotCap - overlaps.length;
              }

              if (remaining > 0 || isManagementMode) {
                slots.push({
                  id: `tpl-${template.id}-${sStr}-${dayName}`,
                  dayName,
                  date: date || '',
                  startTime: sStr,
                  endTime: eStr,
                  remainingCapacity: remaining,
                  totalCapacity: slotCap,
                  templateId: template.id,
                  price: template.price || 0
                });
              }
              current = new Date(current.getTime() + (sessionDurationMin + buffer) * 60000);
            }
          });
        });
      });
    }

    return slots;
  }, [availableInstances, activeAppointments, existingAppointments, duration, capacity, selectedDays, frequency, slotTemplates, isManagementMode, date, bufferMinutes, availableClinicTemplates]);

  // Group slots for the table view: rows = times, cols = days
  const slotGrid = useMemo(() => {
    if (!materializedSlots.length || !selectedDays.length) return { times: [], grid: {} };

    // Group by unique time ranges (Start - End)
    const timeRanges = [...new Set(materializedSlots.map(s => `${s.startTime} - ${s.endTime}`))].sort();
    const grid = {};

    timeRanges.forEach(range => {
      grid[range] = {};
      selectedDays.forEach(day => {
        grid[range][day] = materializedSlots.find(s => `${s.startTime} - ${s.endTime}` === range && s.dayName === day);
      });
    });

    return { times: timeRanges, grid };
  }, [materializedSlots, selectedDays]);

  const isBundledBookingMode = !isManagementMode && frequency !== 'monthly' && selectedDays.length > 1;

  const getBundledSlotsForCell = (slot) => {
    if (!isBundledBookingMode) return [slot];

    return materializedSlots.filter(s =>
      s.startTime === slot.startTime &&
      s.endTime === slot.endTime &&
      selectedDays.includes(s.dayName)
    );
  };


  const handleDayToggle = (day) => {
    // Block selection of unavailable days ONLY if NOT in management mode and clinicId is present
    if (!isManagementMode && clinicId && !dayAvailability[day]) return; 
    
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleAdd = (slot) => {
    const sTime = slot.startTime || startTime;
    const eTime = slot.endTime || endTime;
    
    if (!sTime || !eTime) return;
    if (frequency !== 'monthly' && selectedDays.length === 0) return;
    if (frequency === 'monthly' && selectedDates.length === 0) return;

    const newTemplates = [...slotTemplates];

    if (frequency === 'monthly') {
      selectedDates.forEach(d => {
        const id = `slot-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        newTemplates.push({
          id,
          frequency,
          dayOfMonth: d,
          date: slot.date || date,
          startTime: sTime,
          endTime: eTime,
          timings: [{ startTime: sTime, endTime: eTime }],
          maxPatientsPerSlot: capacity,
          bufferMinutes: bufferMinutes,
          price: slot.price || 0,
          status: 'active'
        });
      });
    } else {
      selectedDays.forEach(day => {
        const id = `slot-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        newTemplates.push({
          id,
          frequency,
          daysOfWeek: [day],
          weekOffset: frequency === 'bi-weekly' ? weekOffset : null,
          date: slot.date || date,
          startTime: sTime,
          endTime: eTime,
          timings: [{ startTime: sTime, endTime: eTime }],
          maxPatientsPerSlot: capacity,
          bufferMinutes: bufferMinutes,
          price: slot.price || 0,
          status: 'active'
        });
      });
    }

    onChange(newTemplates);
    // Reset selection
    if (frequency === 'monthly') setSelectedDates([]);
    else setSelectedDays([]);
    setStartTime('');
    setEndTime('');
    setPendingSlots([]);
  };

  const handleBulkAdd = () => {
    if (pendingSlots.length === 0) return;

    const newTemplates = [...slotTemplates];
    pendingSlots.forEach(slot => {
      newTemplates.push({
        id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        frequency,
        daysOfWeek: [slot.dayName],
        weekOffset: frequency === 'bi-weekly' ? weekOffset : null,
        date: slot.date || date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        timings: [{ startTime: slot.startTime, endTime: slot.endTime }],
        maxPatientsPerSlot: capacity,
        bufferMinutes: bufferMinutes,
        price: slot.price || 0,
        status: 'active',
        slot_id: slot.originalSlotId,
        templateId: slot.templateId
      });
    });

    onChange(newTemplates);
    setPendingSlots([]);
  };

  const togglePendingSlot = (slot) => {
    const bundledSlots = getBundledSlotsForCell(slot);

    const selectedIds = new Set(pendingSlots.map(s => s.id));
    const bundleIsAlreadySelected = bundledSlots.length > 0 && bundledSlots.every(s => selectedIds.has(s.id));

    if (bundleIsAlreadySelected) {
      setPendingSlots(pendingSlots.filter(s => !bundledSlots.some(bs => bs.id === s.id)));
      return;
    }

    setPendingSlots([
      ...pendingSlots,
      ...bundledSlots.filter(s => !selectedIds.has(s.id)),
    ]);
  };

  const removeSlot = (id) => {
    onChange(slotTemplates.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-4">
      <Box className="p-4 border border-secondary rounded-xl bg-white shadow-sm">
        {!isManagementMode && (
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              {clinicId ? 'Booking Frequency' : 'Schedule Pattern'}
            </label>
            <div className="flex gap-6">
              {['weekly', 'bi-weekly', 'monthly'].map(freq => (
                <label key={freq} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="frequency"
                    value={freq}
                    checked={frequency === freq}
                    onChange={() => setFrequency(freq)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors capitalize">
                    {freq.replace('-', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {frequency !== 'monthly' ? (
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Select days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => {
                const isSelected = selectedDays.includes(day.value);
                const isAvailable = isManagementMode ? true : (clinicId ? dayAvailability[day.value] : true);
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleDayToggle(day.value)}
                    disabled={!isAvailable}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      isSelected 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                        : isAvailable 
                          ? 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                          : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {day.label}
                    {clinicId && !isAvailable && <span className="ml-1 text-[8px]">(Full)</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Days of Month</label>
            <div className="grid grid-cols-7 gap-1.5 max-w-sm">
              {Array.from({ length: 31 }, (_, i) => i + 1).map(dateVal => (
                <button
                  key={dateVal}
                  type="button"
                  onClick={() => {
                    if (selectedDates.includes(dateVal)) setSelectedDates(selectedDates.filter(d => d !== dateVal));
                    else setSelectedDates([...selectedDates, dateVal]);
                  }}
                  className={`w-9 h-9 rounded-lg text-xs font-bold border transition-all ${
                    selectedDates.includes(dateVal)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {dateVal}
                </button>
              ))}
            </div>
          </div>
        )}

        {frequency === 'bi-weekly' && (
          <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Rotation</div>
              <div className="text-sm font-bold text-blue-900">Alternating Weeks</div>
            </div>
            <div className="flex gap-4">
              {[0, 1].map(offset => (
                <label key={offset} className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-blue-200 shadow-sm">
                  <input
                    type="radio"
                    name="weekOffset"
                    value={offset}
                    checked={weekOffset === offset}
                    onChange={() => setWeekOffset(offset)}
                    className="w-3 h-3 text-blue-600"
                  />
                  <span className="text-xs font-bold text-blue-800">
                    {offset === 0 ? 'Week 1 & 3' : 'Week 2 & 4'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-gray-100 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-tight">
              {clinicId ? 'Available Sessions' : 'Session Timings'}
            </h4>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold px-2 py-1 bg-gray-50 text-gray-500 rounded border border-gray-100 uppercase">
                Buffer: {bufferMinutes}m
              </span>
              <span className="text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded border border-blue-100 uppercase">
                Capacity: {capacity} Bed(s)
              </span>
            </div>
          </div>

          {/* Manual Entry Form - only in management mode or if starting from scratch */}
          {(!clinicId || isManagementMode) && (
            <div className="flex flex-wrap items-center gap-4 bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200 mb-6">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Start Time</label>
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 bg-white">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="py-2 border-none text-sm focus:outline-none focus:ring-0 bg-transparent"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">End Time</label>
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 bg-white">
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="py-2 border-none text-sm focus:outline-none focus:ring-0 bg-transparent"
                  />
                </div>
              </div>
              <div className="ml-auto flex items-center gap-4">
                 <div className="text-right">
                    <div className="text-[10px] font-bold text-gray-400 uppercase">Preview</div>
                    <div className="text-xs font-bold text-blue-600">
                      {selectedDays.length || selectedDates.length || 0} {frequency === 'monthly' ? 'Day(s)' : 'Weekday(s)'}
                    </div>
                 </div>
                 <button
                   type="button"
                   onClick={() => handleAdd({ startTime, endTime })}
                   disabled={!startTime || !endTime || (frequency !== 'monthly' && selectedDays.length === 0) || (frequency === 'monthly' && selectedDates.length === 0)}
                   className={`text-white text-sm font-bold py-2.5 px-6 rounded-lg transition-all shadow-md ${
                     !startTime || !endTime || (frequency !== 'monthly' && selectedDays.length === 0) || (frequency === 'monthly' && selectedDates.length === 0)
                       ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                       : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5'
                   }`}
                 >
                   Add to Schedule
                 </button>
              </div>
            </div>
          )}

          {/* Table Preview / Booking Grid */}
          {(clinicId || isManagementMode) && (
            isLoadingSlots ? (
              <div className="flex items-center gap-3 py-6 text-sm text-blue-500 italic bg-blue-50 rounded-xl px-4 border border-blue-100">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                Searching for available sessions {frequency !== 'monthly' && selectedDays.length > 0 ? `on future ${selectedDays[0]}s` : 'on selected date'}...
              </div>
            ) : slotGrid.times.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="p-3 text-[10px] font-bold text-gray-400 uppercase border-b border-gray-100">Session Timing</th>
                        {selectedDays.map(day => (
                          <th key={day} className="p-3 text-[10px] font-bold text-gray-400 uppercase border-b border-gray-100 text-center">
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {slotGrid.times.map(range => (
                        <tr key={range} className="hover:bg-blue-50/20 transition-colors">
                          <td className="p-3 border-b border-gray-50">
                            <span className="text-sm font-bold text-gray-700 whitespace-nowrap">{range}</span>
                          </td>
                          {selectedDays.map(day => {
                            const slot = slotGrid.grid[range][day];
                            if (!slot) return <td key={day} className="p-2 border-b border-gray-50 text-center text-gray-200">--</td>;

                            const isFull = slot.remainingCapacity <= 0;
                            const isAlreadyAdded = (isManagementMode && !!slot.templateId) || slotTemplates.some(t => 
                              t.daysOfWeek?.includes(day) &&
                              t.frequency === frequency &&
                              (t.startTime === slot.startTime || (t.timings && t.timings.some(tm => (tm.startTime <= slot.startTime && tm.endTime > slot.startTime) || (tm.startTime < slot.endTime && tm.endTime >= slot.endTime))))
                            );
                            const isPending = pendingSlots.some(s => s.id === slot.id);

                            return (
                              <td key={day} className="p-2 border-b border-gray-50">
                                <button
                                  type="button"
                                  onClick={() => !isFull && !isAlreadyAdded && togglePendingSlot(slot)}
                                  disabled={isFull || isAlreadyAdded}
                                  className={`w-full p-2 rounded-lg border transition-all text-center flex flex-col items-center gap-0.5 ${
                                    isAlreadyAdded
                                      ? 'border-gray-100 bg-gray-100 text-gray-400 cursor-default'
                                      : isPending
                                        ? 'border-blue-500 bg-blue-500 text-white shadow-md'
                                        : isFull
                                          ? 'border-gray-50 bg-gray-50 text-gray-300 cursor-not-allowed'
                                          : 'border-gray-200 hover:border-blue-300 hover:bg-white bg-white text-gray-600'
                                  }`}
                                >
                                  <span className="text-[11px] font-bold">
                                    {isAlreadyAdded ? 'Added' : isFull ? 'Full' : `${slot.remainingCapacity}/${slot.totalCapacity}`}
                                  </span>
                                  {!isFull && !isAlreadyAdded && (
                                    <span className={`text-[8px] uppercase tracking-tighter ${isPending ? 'text-blue-100' : 'opacity-60'}`}>
                                      {isPending ? 'Staged' : 'Select'}
                                    </span>
                                  )}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {pendingSlots.length > 0 && (
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg">
                        <span className="text-sm font-bold">{pendingSlots.length}</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-blue-900">Sessions Selected</div>
                        <div className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Ready to add to schedule</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleBulkAdd}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      <span>Add Slots</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-10 text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                <div className="text-3xl mb-3">🕒</div>
                <p className="text-sm font-bold text-gray-700 mb-1">
                  {frequency !== 'monthly' && selectedDays.length === 0 
                    ? "Select a Weekday to view timings" 
                    : "No available sessions found"}
                </p>
                <p className="text-[11px] text-gray-400 max-w-[200px] mx-auto">
                  Try adjusting the dialysis duration or selecting a different day.
                </p>
              </div>
            )
          )}
        </div>
      </Box>

      {/* Selected Slots List */}
      {slotTemplates.length > 0 && (
        <div className="space-y-2 mt-4">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Selected Schedule</label>
          {slotTemplates.map(slot => (
            <div key={slot.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-blue-900">{slot.startTime} to {slot.endTime}</div>
                  <div className="text-[10px] text-blue-700 font-medium uppercase">{slot.daysOfWeek?.[0]}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeSlot(slot.id)}
                className="p-1.5 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

