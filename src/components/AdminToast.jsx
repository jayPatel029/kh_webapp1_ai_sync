/**
 * Custom Admin Toast Notification Component
 * 
 * A bigger, custom-styled toast for admin pages.
 * Does NOT use Sonner - fully custom implementation with portals.
 * 
 * Usage:
 *   import { useAdminToast } from '../components/AdminToast';
 * 
 *   const { showToast, ToastContainer } = useAdminToast();
 *   showToast('Admin created successfully!', 'success');
 *   showToast('Failed to delete user', 'error');
 * 
 *   // Render <ToastContainer /> in your component JSX
 * 
 * @file src/components/AdminToast.jsx
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

/* ─── Icon SVGs ─── */
const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const ErrorIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const InfoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const WarningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ─── Style config per type ─── */
const TOAST_STYLES = {
  success: {
    bg: '#f0fdf0',
    border: '#00c008',
    color: '#15803d',
    iconBg: '#dcfce7',
    icon: CheckIcon,
    title: 'Success',
  },
  error: {
    bg: '#fef2f2',
    border: '#de425b',
    color: '#b91c3c',
    iconBg: '#fee2e2',
    icon: ErrorIcon,
    title: 'Error',
  },
  info: {
    bg: '#eff6ff',
    border: '#4164df',
    color: '#1d4ed8',
    iconBg: '#dbeafe',
    icon: InfoIcon,
    title: 'Info',
  },
  warning: {
    bg: '#fffbeb',
    border: '#ff9800',
    color: '#b45309',
    iconBg: '#fef3c7',
    icon: WarningIcon,
    title: 'Warning',
  },
};

/* ─── Single Toast UI ─── */
function AdminToastItem({ id, message, type = 'success', onClose }) {
  const [isExiting, setIsExiting] = useState(false);
  const style = TOAST_STYLES[type] || TOAST_STYLES.success;
  const Icon = style.icon;

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300);
  }, [id, onClose]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [handleClose]);

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '18px 20px',
        minWidth: '400px',
        maxWidth: '520px',
        background: style.bg,
        border: `2px solid ${style.border}`,
        borderRadius: '12px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        fontFamily: 'Sora, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        animation: isExiting
          ? 'adminToastSlideOut 0.3s ease-in forwards'
          : 'adminToastSlideIn 0.35s ease-out',
        pointerEvents: 'auto',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '3px',
          background: style.border,
          borderRadius: '0 0 12px 12px',
          animation: 'adminToastProgress 4.5s linear forwards',
        }}
      />

      {/* Icon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '42px',
          height: '42px',
          minWidth: '42px',
          borderRadius: '10px',
          background: style.iconBg,
          color: style.border,
        }}
      >
        <Icon />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '15px',
            fontWeight: 700,
            color: style.color,
            marginBottom: '3px',
            letterSpacing: '0.01em',
          }}
        >
          {style.title}
        </div>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: '#4b5563',
            lineHeight: '1.5',
            wordBreak: 'break-word',
          }}
        >
          {message}
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        aria-label="Close notification"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          minWidth: '32px',
          border: 'none',
          borderRadius: '8px',
          background: 'transparent',
          color: '#9ca3af',
          cursor: 'pointer',
          transition: 'background 0.15s, color 0.15s',
          marginTop: '-2px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#f3f4f6';
          e.currentTarget.style.color = '#6b7280';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#9ca3af';
        }}
      >
        <CloseIcon />
      </button>
    </div>
  );
}

/* ─── Keyframes (injected once) ─── */
let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  stylesInjected = true;

  const css = `
    @keyframes adminToastSlideIn {
      from { opacity: 0; transform: translateX(80px) scale(0.95); }
      to   { opacity: 1; transform: translateX(0) scale(1); }
    }
    @keyframes adminToastSlideOut {
      from { opacity: 1; transform: translateX(0) scale(1); }
      to   { opacity: 0; transform: translateX(80px) scale(0.95); }
    }
    @keyframes adminToastProgress {
      from { width: 100%; }
      to   { width: 0%; }
    }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

/* ─── Toast Container (portal) ─── */
function AdminToastContainer({ toasts, onRemove }) {
  useEffect(() => {
    injectStyles();
  }, []);

  if (toasts.length === 0) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <AdminToastItem
          key={t.id}
          id={t.id}
          message={t.message}
          type={t.type}
          onClose={onRemove}
        />
      ))}
    </div>,
    document.body
  );
}

/* ─── Custom Hook ─── */
let idCounter = 0;

/**
 * Hook that provides a custom admin toast system.
 * 
 * @returns {{ showToast: (message: string, type?: 'success'|'error'|'info'|'warning') => void, ToastContainer: React.FC }}
 */
export function useAdminToast() {
  const [toasts, setToasts] = useState([]);
  const toastsRef = useRef(toasts);
  toastsRef.current = toasts;

  const showToast = useCallback((message, type = 'success') => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const ToastContainer = useCallback(
    () => <AdminToastContainer toasts={toasts} onRemove={removeToast} />,
    [toasts, removeToast]
  );

  return { showToast, ToastContainer };
}

export default AdminToastContainer;
