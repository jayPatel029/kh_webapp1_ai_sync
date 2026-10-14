import React from "react";

export const PROGRAM_OPTIONS = ["Basic", "Standard", "Advanced"];

// Returns "" for a missing program so no option is shown as selected.
export const normalizeProgramName = (program) => {
  const raw = program == null ? "" : String(program).trim();
  const match = PROGRAM_OPTIONS.find((option) => option.toLowerCase() === raw.toLowerCase());
  return match || raw;
};

export const formatDate = (dateString) => {
  if (!dateString) return "-";
  const dateObject = new Date(dateString);
  if (Number.isNaN(dateObject.getTime())) return "-";
  const day = String(dateObject.getDate()).padStart(2, "0");
  const month = String(dateObject.getMonth() + 1).padStart(2, "0");
  const year = dateObject.getFullYear();
  return `${day}-${month}-${year}`;
};

export const ProgramButtons = ({ currentProgram, onSelect, isDisabled = false }) => {
  const selectedProgram = normalizeProgramName(currentProgram);
  return (
    <div className="flex flex-wrap gap-2">
      {PROGRAM_OPTIONS.map((option) => {
        const isSelected = option === selectedProgram;
        return (
          <button
            key={option}
            type="button"
            disabled={isDisabled}
            aria-pressed={isSelected}
            onClick={() => !isSelected && onSelect(option)}
            className={`min-w-[88px] rounded-lg border-2 border-primary px-3 py-1.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              isSelected
                ? "bg-primary text-white cursor-default"
                : "bg-white text-primary hover:bg-blue-50 cursor-pointer"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
};

export const ProgramRequestList = ({ requests, onAccept, isDisabled = false, emptyText = "" }) => {
  if (!requests.length) {
    return emptyText ? <p className="text-sm text-gray-500">{emptyText}</p> : null;
  }
  return (
    <div className="flex flex-col gap-3">
      {requests.map((request) => (
        <div key={request.id} className="flex flex-col items-start gap-1">
          <p className="text-sm font-semibold text-[#1A9A9A]">
            {normalizeProgramName(request.programName) || "-"}
          </p>
          <p className="text-xs text-gray-500">Requested on {formatDate(request.date)}</p>
          <button
            type="button"
            disabled={isDisabled || !request.programName}
            onClick={() => onAccept(request.programName)}
            className="mt-1 rounded-md bg-[#1A9A9A] px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-[#158282] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            Accept
          </button>
        </div>
      ))}
    </div>
  );
};
