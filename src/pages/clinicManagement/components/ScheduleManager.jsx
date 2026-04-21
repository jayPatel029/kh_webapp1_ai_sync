import React, { useState } from 'react';
import { Box } from '../../../component-library';

export function ScheduleManager({ slotTemplates, onChange }) {
  const [frequency, setFrequency] = useState('weekly');
  const [selectedDays, setSelectedDays] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

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

  const handleAdd = () => {
    if (selectedDays.length === 0 || !startTime || !endTime) return;

    // Validation: startTime must strictly precede endTime
    if (startTime >= endTime) {
      alert("Error: Start time must be before end time. Slots spanning across midnight are not supported on a single entry.");
      return;
    }

    // Create individual slot templates for each selected day/time combination
    const newTemplates = [...slotTemplates];
    selectedDays.forEach(day => {
      const newSlot = {
        id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        frequency,
        daysOfWeek: [day],
        dayOfMonth: null,
        startTime,
        endTime,
        maxPatientsPerSlot: 1, // Default, can be extended later
        bufferMinutes: 30, // Default
        price: 0 // Default
      };
      newTemplates.push(newSlot);
    });

    onChange(newTemplates);
    setSelectedDays([]); // Reset days after adding
  };

  const removeSlot = (id) => {
    onChange(slotTemplates.filter(s => s.id !== id));
  };

  // Group slots by Day and Frequency for presentation
  const grouped = {};
  slotTemplates.forEach(s => {
    s.daysOfWeek.forEach(day => {
      const key = `${s.frequency}-${day}`;
      if (!grouped[key]) {
        grouped[key] = { frequency: s.frequency, day, slots: [] };
      }
      grouped[key].slots.push(s);
    });
  });

  return (
    <div className="space-y-6">
      {/* Builder Form */}
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

        {/* Selected Days Pills */}
        {selectedDays.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedDays.map(day => (
              <span key={day} className="flex items-center gap-1 px-3 py-1 bg-[#e2e8f0] text-gray-800 text-sm rounded-md">
                {day}
                <button
                  type="button"
                  onClick={() => handleDayToggle(day)}
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
              onChange={(e) => setStartTime(e.target.value)}
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
            className="bg-[#3b82f6] hover:bg-blue-600 text-white text-sm font-medium py-2 px-5 rounded-full transition-colors ml-2 shadow-sm"
          >
            Set Timing for Selected Days
          </button>
        </div>
      </Box>

      {/* Generated Cards */}
      {Object.keys(grouped).length > 0 && (
        <div className="space-y-3 mt-6">
          {Object.values(grouped).map(group => (
            <div key={`${group.frequency}-${group.day}`} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              <h5 className="font-bold text-black mb-3">
                {group.day} {group.frequency !== 'weekly' && <span className="text-xs font-normal text-gray-500 ml-2 capitalize">({group.frequency})</span>}
              </h5>
              <div className="space-y-2">
                {group.slots.map(slot => (
                  <div key={slot.id} className="flex items-center gap-3 text-sm text-gray-700">
                    <span>{slot.startTime} to {slot.endTime}</span>
                    <button
                      type="button"
                      onClick={() => removeSlot(slot.id)}
                      className="w-6 h-6 bg-[#ef4444] hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold leading-none cursor-pointer"
                    >
                      X
                    </button>
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
