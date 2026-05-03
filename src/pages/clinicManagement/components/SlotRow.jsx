import React from 'react';
import { Box, Button } from '../../../component-library';

// Replaces the old SlotRow to match the requested weekday/timing UI
export function SlotRow({ slot, onChange, onRemove }) {
  const DAYS = [
    { label: 'Monday', value: 'Monday' },
    { label: 'Tuesday', value: 'Tuesday' },
    { label: 'Wednesday', value: 'Wednesday' },
    { label: 'Thursday', value: 'Thursday' },
    { label: 'Friday', value: 'Friday' },
    { label: 'Saturday', value: 'Saturday' },
    { label: 'Sunday', value: 'Sunday' },
  ];

  const currentDays = slot.daysOfWeek || [];

  const handleDayToggle = (dayValue) => {
    let newDays;
    if (currentDays.includes(dayValue)) {
      newDays = currentDays.filter((d) => d !== dayValue);
    } else {
      newDays = [...currentDays, dayValue];
    }
    onChange({ ...slot, daysOfWeek: newDays });
  };

  const changeField = (field, value) => {
    onChange({ ...slot, [field]: value });
  };

  return (
    <Box className="p-6 border border-gray-100 shadow-sm rounded-xl mb-4 bg-white relative">
      <button 
        type="button"
        onClick={() => onRemove(slot.id)}
        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
        title="Remove"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-[#3b4b60] mb-3">Select days</label>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {DAYS.map((day) => (
            <label key={day.value} className="flex items-center gap-2 cursor-pointer text-[#1f2937]">
              <input
                type="checkbox"
                checked={currentDays.includes(day.value)}
                onChange={() => handleDayToggle(day.value)}
                className="w-4 h-4 rounded border-gray-300 text-[#3b82f6] focus:ring-[#3b82f6]"
              />
              <span className="text-sm">{day.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="time"
              value={slot.startTime || ''}
              onChange={(e) => changeField('startTime', e.target.value)}
              className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
            />
          </div>
          <span className="text-gray-600 text-sm font-medium">to</span>
          <div className="relative">
            <input
              type="time"
              value={slot.endTime || ''}
              onChange={(e) => changeField('endTime', e.target.value)}
              className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
            />
          </div>
        </div>

        <button
          type="button"
          className="bg-[#3b82f6] hover:bg-blue-600 text-white text-sm font-medium py-2 px-5 rounded-full transition-colors ml-2"
        >
          Set Timing for Selected Days
        </button>
      </div>
      
      {/* Hidden fields / extra metadata could remain but are hidden to match UI exactly, or placed underneath if needed */}
      <div className="bg-gray-50 p-4 rounded-lg mt-5 border border-gray-100 flex flex-wrap gap-4 items-center">
        <div className="flex flex-col gap-1">
           <span className="text-xs text-gray-500 font-medium">Max Patients</span>
           <input type="number" className="w-20 border border-gray-200 rounded px-2 py-1 text-sm" value={slot.maxPatientsPerSlot} onChange={(e) => changeField('maxPatientsPerSlot', Number(e.target.value))} min={1} />
        </div>
        <div className="flex flex-col gap-1">
           <span className="text-xs text-gray-500 font-medium">Buffer (min)</span>
           <input type="number" className="w-20 border border-gray-200 rounded px-2 py-1 text-sm" value={slot.bufferMinutes} onChange={(e) => changeField('bufferMinutes', Number(e.target.value))} min={0} />
        </div>
        <div className="flex flex-col gap-1">
           <span className="text-xs text-gray-500 font-medium">Price (INR)</span>
           <input type="number" className="w-24 border border-gray-200 rounded px-2 py-1 text-sm" value={slot.price} onChange={(e) => changeField('price', Number(e.target.value))} min={0} />
        </div>
      </div>
    </Box>
  );
}
