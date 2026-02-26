/**
 * Styled Sonner Toaster with design system integration.
 * 
 * Uses Tailwind classes + design tokens for consistent styling.
 * Replaces react-toastify with Sonner's modern toast system.
 * 
 * @file src/components/StyledToaster.jsx
 */

import { Toaster } from 'sonner';

export default function StyledToaster() {
  return (
    <Toaster
      position="top-right"
      expand={true}
      richColors
      closeButton
      theme="light"
      duration={4000}
      gap={8}
      visibleToasts={5}
      className="sonner-toaster"
      toastOptions={{
        classNameFunction: ({ type }) => {
          // Map Sonner toast types to design system colors
          const baseClasses =
            'bg-white border border-borderLight shadow-lg rounded-lg px-4 py-3 text-sm font-medium';

          const typeClasses = {
            success: 'border-success/30 text-success bg-success/5',
            error: 'border-danger/30 text-danger bg-danger/5',
            loading: 'border-info/30 text-info bg-info/5',
            default: 'border-borderLight text-text',
          };

          return `${baseClasses} ${typeClasses[type] || typeClasses.default}`;
        },
      }}
      style={{
        '--sonner-z-index': '9999',
        '--sonner-font-family': 'Sora, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        '--sonner-toast-background': '#ffffff',
        '--sonner-toast-border': '#d9d9d9',
        '--sonner-toast-text': '#393939',
        '--sonner-toast-padding': '12px 16px',
        '--sonner-toast-border-radius': '8px',
        '--sonner-toast-width': '356px',
        '--sonner-success-color': '#00c008',
        '--sonner-success-border-color': 'rgba(0, 192, 8, 0.3)',
        '--sonner-error-color': '#de425b',
        '--sonner-error-border-color': 'rgba(222, 66, 91, 0.3)',
        '--sonner-warning-color': '#ff9800',
        '--sonner-warning-border-color': 'rgba(255, 152, 0, 0.3)',
        '--sonner-info-color': '#4164df',
        '--sonner-info-border-color': 'rgba(65, 100, 223, 0.3)',
      }}
    />
  );
}
