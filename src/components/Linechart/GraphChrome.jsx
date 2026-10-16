import React from "react";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

/** Shared chrome for reading graphs — matches app primary/accent theme. */

export const graphActionBtnClass =
  "inline-flex items-center justify-center h-10 px-5 rounded-lg border-2 border-primary text-primary font-semibold bg-transparent hover:bg-primary hover:text-white transition-colors whitespace-nowrap text-sm";

export function GraphShell({ toolbar, children, className = "", shellRef }) {
  return (
    <div className={`line space-y-4 ${className}`} ref={shellRef}>
      <div className="rounded-xl border border-gray-200 bg-slate-50/80 px-3 py-3 sm:px-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          {toolbar}
        </div>
      </div>
      {children}
    </div>
  );
}

export function GraphToolbarGroup({ children, className = "" }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 sm:gap-3 ${className}`}>
      {children}
    </div>
  );
}

export function GraphActionButton({ children, onClick, type = "button", className = "", active = false, ...rest }) {
  return (
    <button
      type={type}
      onClick={onClick}
      aria-pressed={active || undefined}
      className={`${graphActionBtnClass} ${
        active ? "!bg-primary !text-white hover:!bg-primary hover:!text-white" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Patient-profile graph: toggles the side readings table. */
export function GraphEditButton({ active, onClick }) {
  return (
    <GraphActionButton active={active} onClick={onClick}>
      {active ? "Hide table" : "Edit"}
    </GraphActionButton>
  );
}

export function GraphCalendarButton({ active, onClick }) {
  return (
    <button
      type="button"
      aria-label="Open date range"
      aria-pressed={Boolean(active)}
      onClick={onClick}
      className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors ${
        active
          ? "border-primary bg-primary/10"
          : "border-gray-200 bg-white hover:border-primary/40 hover:bg-primary/5"
      }`}
    >
      <CalendarMonthIcon style={{ fontSize: 22, color: "#4164df" }} />
    </button>
  );
}

export function GraphColorPill({ label, color, active, onClick }) {
  const activeStyles =
    color === "red"
      ? "border-red-300 bg-red-50 text-red-700"
      : "border-orange-300 bg-orange-50 text-orange-700";
  const dotClass =
    color === "red"
      ? active
        ? "bg-red-600"
        : "bg-gray-300"
      : active
        ? "bg-orange-500"
        : "bg-gray-300";

  return (
    <button
      type="button"
      aria-pressed={Boolean(active)}
      onClick={onClick}
      className={`inline-flex items-center gap-2 h-9 px-3 rounded-full border text-sm font-semibold transition-colors ${
        active
          ? activeStyles
          : "border-gray-200 bg-white text-gray-600 hover:bg-slate-50"
      }`}
    >
      <span className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
      {label}
    </button>
  );
}

export function GraphPeriodSelect({ value, onChange }) {
  return (
    <select
      name="time"
      id="time"
      value={value}
      onChange={onChange}
      className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-[#32617d] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
    >
      <option value="week">Last Week</option>
      <option value="month">Last Month</option>
      <option value="6month">Last 6 month</option>
    </select>
  );
}

export function GraphDatePickerPanel({ children }) {
  return (
    <div className="absolute z-50 mt-2 left-0 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
      {children}
    </div>
  );
}

export function GraphDatePickerActions({ onApply, onClear }) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      <button
        type="button"
        onClick={onApply}
        className="h-9 px-4 rounded-lg bg-primary text-white font-semibold hover:opacity-90 transition-opacity text-sm"
      >
        Apply Filter
      </button>
      <button
        type="button"
        onClick={onClear}
        className="h-9 px-4 rounded-lg border border-gray-200 text-accent font-semibold bg-white hover:bg-slate-50 transition-colors text-sm"
      >
        Clear Filter
      </button>
    </div>
  );
}

export function GraphClearButton({ onClick, children = "Clear Filter" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-10 px-4 rounded-lg border border-gray-200 text-accent font-semibold bg-white hover:bg-slate-50 transition-colors text-sm whitespace-nowrap"
    >
      {children}
    </button>
  );
}

export function GraphAbnormalBanner({ count, children }) {
  if (!count) return null;
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 text-center">
      <span className="font-bold text-base mr-1">{count}</span>
      {children || "Abnormal Readings"}
    </div>
  );
}

export function GraphEmptyState() {
  return (
    <div className="flex justify-center">
      <div className="rounded-lg border border-dashed border-gray-200 bg-slate-50 px-4 py-3 text-sm text-accent">
        No Readings Present
      </div>
    </div>
  );
}

export function GraphChartFrame({ children }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-2 sm:p-3 overflow-hidden">
      {children}
    </div>
  );
}
