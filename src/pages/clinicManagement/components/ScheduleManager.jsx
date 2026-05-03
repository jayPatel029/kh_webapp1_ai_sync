import React, { useState } from 'react';
import { Box } from '../../../component-library';

export function ScheduleManager({ slotTemplates, onChange, capacity = 1, existingAppointments = [], duration = 0 }) {
  const [frequency, setFrequency] = useState('weekly');
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0); // 0 for Week 1, 1 for Week 2
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Update endTime when duration or startTime changes
  React.useEffect(() => {
    if (duration && startTime) {
      setEndTime(addMinutes(startTime, duration));
    }
  }, [duration, startTime]);

  // Helper to add minutes to time
  const addMinutes = (timeStr, minutes) => {
    if (!timeStr || !minutes) return '';
    const [hours, mins] = timeStr.split(':').map(Number);
    const date = new Date(0, 0, 0, hours, mins + Number(minutes));
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const DAYS = [
    { label: 'Monday', value: 'Monday' },
    { label: 'Tuesday', value: 'Tuesday' },
    { label: 'Wednesday', value: 'Wednesday' },
    { label: 'Thursday', value: 'Thursday' },
    { label: 'Friday', value: 'Friday' },
    { label: 'Saturday', value: 'Saturday' },
    { label: 'Sunday', value: 'Sunday' },
  ];

  const handleDayToggle = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const isSlotFull = (day, time) => {
    // Count how many appointments already exist for this day and time
    const count = existingAppointments.filter(a => {
      if (!a.appointment_date || !a.start_time) return false;
      const aptDate = new Date(a.appointment_date);
      const aptDay = aptDate.toLocaleDateString('en-US', { weekday: 'long' });
      const aptTime = a.start_time.slice(0, 5);

      // Simple match for now: same day of week and same start time
      // For recurring, this is a reasonable approximation for the technician
      return aptDay === day && aptTime === time;
    }).length;
    return count >= capacity;
  };

  const handleAdd = () => {
    if (selectedDays.length === 0 || !startTime || !endTime) return;

    // Validation: startTime must strictly precede endTime
    if (startTime >= endTime) {
      alert("Error: Start time must be before end time. Slots spanning across midnight are not supported on a single entry.");
      return;
    }

    // Create individual slot templates
    const newTemplates = [...slotTemplates];

    if (frequency === 'monthly') {
      if (selectedDates.length === 0) return;
      selectedDates.forEach(date => {
        const newSlot = {
          id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          frequency,
          daysOfWeek: [],
          dayOfMonth: date,
          startTime,
          endTime,
          timings: [{ startTime, endTime }],
          maxPatientsPerSlot: capacity,
          bufferMinutes: 30,
          price: 0
        };
        newTemplates.push(newSlot);
      });
      setSelectedDates([]);
    } else {
      if (selectedDays.length === 0) return;
      selectedDays.forEach(day => {
        const newSlot = {
          id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          frequency,
          daysOfWeek: [day],
          dayOfMonth: null,
          weekOffset: frequency === 'bi-weekly' ? weekOffset : null,
          startTime,
          endTime,
          timings: [{ startTime, endTime }],
          maxPatientsPerSlot: capacity,
          bufferMinutes: 30,
          price: 0
        };
        newTemplates.push(newSlot);
      });
      setSelectedDays([]);
    }

    onChange(newTemplates);
  };

  const removeSlot = (id) => {
    onChange(slotTemplates.filter(s => s.id !== id));
  };

  // Group slots for presentation
  const grouped = {};
  slotTemplates.forEach(s => {
    // Determine which days this template applies to
    const days = s.frequency === 'monthly'
      ? [null]
      : (Array.isArray(s.daysOfWeek) && s.daysOfWeek.length > 0
        ? s.daysOfWeek
        : [s.daysOfWeek || 'Monday']);

    days.forEach(day => {
      let key, label;
      if (s.frequency === 'monthly') {
        key = `monthly-${s.dayOfMonth}`;
        label = `Every ${s.dayOfMonth}${getOrdinal(s.dayOfMonth)} of the month`;
      } else if (s.frequency === 'bi-weekly') {
        key = `biweekly-${s.weekOffset}-${day}`;
        label = `${day} (Week ${s.weekOffset + 1})`;
      } else {
        key = `weekly-${day}`;
        label = day;
      }

      if (!grouped[key]) {
        grouped[key] = { frequency: s.frequency, label, slots: [] };
      }
      // Avoid duplicate entries if daysOfWeek had multiple entries
      if (!grouped[key].slots.find(existing => existing.id === s.id)) {
        grouped[key].slots.push(s);
      }
    });
  });

  function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest"></span>
        <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-600 rounded-md border border-blue-100">
          Clinic Capacity: {capacity} Bed(s)
        </span>
      </div>
      <Box className="p-2 border border-secondary rounded-lg">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-[#3b4b60] mb-2">Select Frequency</label>
          <div className="flex gap-4">
            {['weekly', 'bi-weekly', 'monthly'].map(freq => (
              <label key={freq} className="flex items-center gap-2 cursor-pointer text-[#1f2937]">
                <input
                  type="radio"
                  name="frequency"
                  value={freq}
                  checked={frequency === freq}
                  onChange={() => setFrequency(freq)}
                  className="w-4 h-4 text-[#3b82f6] focus:ring-[#3b82f6]"
                />
                <span className="text-sm capitalize">{freq.replace('-', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        {frequency !== 'monthly' ? (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#3b4b60] mb-3">Select Weekdays</label>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {DAYS.map((day) => (
                <label key={day.value} className="flex items-center gap-2 cursor-pointer text-[#1f2937]">
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(day.value)}
                    onChange={() => handleDayToggle(day.value)}
                    className="w-4 h-4 rounded border-gray-300 text-[#3b82f6] focus:ring-[#3b82f6]"
                  />
                  <span className="text-sm">{day.label}</span>
                </label>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#3b4b60] mb-3">Select Days of Month</label>
            <div className="grid grid-cols-7 gap-2 max-w-sm">
              {Array.from({ length: 31 }, (_, i) => i + 1).map(date => (
                <button
                  key={date}
                  type="button"
                  onClick={() => {
                    if (selectedDates.includes(date)) setSelectedDates(selectedDates.filter(d => d !== date));
                    else setSelectedDates([...selectedDates, date]);
                  }}
                  className={`w-8 h-8 rounded-md text-xs font-medium border transition-all ${selectedDates.includes(date)
                      ? 'bg-[#3b82f6] text-white border-[#3b82f6]'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-[#3b82f6]'
                    }`}
                >
                  {date}
                </button>
              ))}
            </div>
          </div>
        )}

        {frequency === 'bi-weekly' && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <label className="block text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Week Rotation</label>
            <div className="flex gap-4">
              {[0, 1].map(offset => (
                <label key={offset} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="weekOffset"
                    value={offset}
                    checked={weekOffset === offset}
                    onChange={() => setWeekOffset(offset)}
                    className="w-3 h-3 text-[#3b82f6]"
                  />
                  <span className="text-xs text-blue-900 font-medium">
                    {offset === 0 ? 'Week 1 & 3 (Starting Now)' : 'Week 2 & 4 (Starting Next Week)'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Selected Items Pills */}
        {(frequency === 'monthly' ? selectedDates : selectedDays).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {(frequency === 'monthly' ? selectedDates : selectedDays).map(item => (
              <span key={item} className="flex items-center gap-1 px-3 py-1 bg-[#e2e8f0] text-gray-800 text-sm rounded-md">
                {frequency === 'monthly' ? `Day ${item}` : item}
                <button
                  type="button"
                  onClick={() => {
                    if (frequency === 'monthly') setSelectedDates(selectedDates.filter(d => d !== item));
                    else handleDayToggle(item);
                  }}
                  className="ml-1 w-5 h-5 bg-[#ef4444] hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold leading-none cursor-pointer"
                >
                  X
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 bg-white">
            <input
              type="time"
              value={startTime}
              onChange={(e) => {
                const newStart = e.target.value;
                setStartTime(newStart);
                if (duration && newStart) {
                  setEndTime(addMinutes(newStart, duration));
                }
              }}
              className="py-2 border-none text-sm focus:outline-none focus:ring-0 bg-transparent"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <span className="text-gray-600 text-sm font-medium">to</span>
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 bg-white">
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="py-2 border-none text-sm focus:outline-none focus:ring-0 bg-transparent"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={selectedDays.some(day => isSlotFull(day, startTime))}
            className={`text-white text-sm font-medium py-2 px-5 rounded-full transition-colors ml-2 shadow-sm ${selectedDays.some(day => isSlotFull(day, startTime))
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#3b82f6] hover:bg-blue-600'
              }`}
          >
            {selectedDays.some(day => isSlotFull(day, startTime))
              ? 'Slot Full (Capacity Reached)'
              : 'Set Timing for Selected Days'}
          </button>
        </div>
      </Box>

      {/* Generated Cards */}
      {Object.keys(grouped).length > 0 && (
        <div className="space-y-3 mt-6">
          {Object.values(grouped).map(group => (
            <div key={group.label} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              <h5 className="font-bold text-black mb-3">
                {group.label} {group.frequency !== 'weekly' && <span className="text-xs font-normal text-gray-500 ml-2 capitalize">({group.frequency})</span>}
              </h5>
              <div className="space-y-2">
                {group.slots.map(slot => (
                  <div key={slot.id} className="flex flex-col gap-1 border-b border-gray-100 last:border-0 pb-2 mb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {(slot.timings && slot.timings.length > 0 ? slot.timings : [{ startTime: slot.startTime, endTime: slot.endTime }]).map((t, idx) => (
                          <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100 text-xs font-semibold shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>{t.startTime} to {t.endTime}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                          Cap: {slot.maxPatientsPerSlot}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSlot(slot.id)}
                          className="w-6 h-6 bg-[#ef4444] hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold leading-none cursor-pointer"
                        >
                          X
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
