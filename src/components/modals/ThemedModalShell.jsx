/**
 * ThemedModalShell — shared dashboard modal chrome.
 * White header, inset teal separator, × close, consistent overlay/panel.
 *
 * @file src/components/modals/ThemedModalShell.jsx
 */

import React from "react";
import PropTypes from "prop-types";
import { useIsMobile } from "../mobile/useIsMobile";

export const THEMED_MODAL = {
  ink: "#32617d",
  slate: "#3F6B85",
  cyan: "#00cccc",
  blue: "#4164df",
  border: "#e5eef3",
  danger: "#dc2626",
};

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
    aria-hidden
  >
    <path
      fillRule="evenodd"
      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * @param {object} props
 * @param {string|React.ReactNode} props.title
 * @param {string|React.ReactNode} [props.subtitle]
 * @param {() => void} props.onClose
 * @param {React.ReactNode} [props.toolbar] — actions row under header
 * @param {React.ReactNode} [props.footer]
 * @param {React.ReactNode} props.children
 * @param {string|number} [props.width] — desktop width CSS (default min(960px, 96vw))
 * @param {string|number} [props.maxHeight]
 * @param {string|number} [props.height] — fixed height when set
 * @param {number} [props.zIndex]
 * @param {boolean} [props.bodyScroll] — body scrolls (default true)
 * @param {string} [props.bodyClassName]
 * @param {object} [props.bodyStyle]
 * @param {boolean} [props.fillBody] — body is flex column min-h-0 (for split layouts)
 */
const ThemedModalShell = ({
  title,
  subtitle,
  onClose,
  toolbar,
  footer,
  children,
  width,
  maxHeight = "90vh",
  height,
  zIndex = 50,
  bodyScroll = true,
  bodyClassName = "",
  bodyStyle,
  fillBody = false,
}) => {
  const { isMobile } = useIsMobile();

  const panelWidth = isMobile ? "100%" : width || "min(960px, 96vw)";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto"
      style={{ zIndex }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full"
        style={{
          width: panelWidth,
          maxHeight: height ? undefined : maxHeight,
          height: height || undefined,
          textAlign: "left",
        }}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 pt-4 pb-0 flex-shrink-0 relative bg-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{ color: THEMED_MODAL.slate }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f1f5f9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
            aria-label="Close"
            title="Close"
          >
            <CloseIcon />
          </button>

          <div className="pr-10 text-left pb-3">
            <h2
              className="text-lg sm:text-xl font-bold leading-tight"
              style={{ color: THEMED_MODAL.ink }}
            >
              {title}
            </h2>
            {subtitle ? (
              <div
                className="text-sm font-medium mt-1"
                style={{ color: THEMED_MODAL.slate }}
              >
                {subtitle}
              </div>
            ) : null}
          </div>

          <div
            aria-hidden
            style={{
              height: 3,
              marginLeft: 5,
              marginRight: 5,
              background: THEMED_MODAL.cyan,
              borderRadius: 2,
            }}
          />
        </div>

        {toolbar ? (
          <div
            className="px-5 sm:px-6 py-2.5 flex flex-wrap items-center justify-start gap-2 border-b flex-shrink-0"
            style={{
              borderColor: THEMED_MODAL.border,
              background: "#f8fafc",
            }}
          >
            {toolbar}
          </div>
        ) : null}

        <div
          className={`${
            fillBody
              ? "flex-1 min-h-0 flex flex-col overflow-hidden"
              : bodyScroll
                ? "flex-1 min-h-0 overflow-y-auto"
                : "flex-1 min-h-0"
          } ${bodyClassName}`.trim()}
          style={bodyStyle}
        >
          {children}
        </div>

        {footer ? (
          <div
            className="px-5 sm:px-6 py-3 border-t flex-shrink-0"
            style={{
              borderColor: THEMED_MODAL.border,
              background: "#f8fafc",
            }}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
};

ThemedModalShell.propTypes = {
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  onClose: PropTypes.func.isRequired,
  toolbar: PropTypes.node,
  footer: PropTypes.node,
  children: PropTypes.node,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  maxHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  zIndex: PropTypes.number,
  bodyScroll: PropTypes.bool,
  bodyClassName: PropTypes.string,
  bodyStyle: PropTypes.object,
  fillBody: PropTypes.bool,
};

export default ThemedModalShell;
