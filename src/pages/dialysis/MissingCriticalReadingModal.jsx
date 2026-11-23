/**
 * Missing Critical Reading popup (v5 D8/D9).
 * Lists blank Critical fields with optional inline entry, Skip, and optional Reason.
 *
 * @file src/pages/dialysis/MissingCriticalReadingModal.jsx
 */

import React from 'react';
import { Button } from '../../component-library';

/**
 * @typedef {object} CriticalBlankField
 * @property {string} key - form / api field key
 * @property {string} field_name - snake_case API name for skips
 * @property {string} label
 * @property {'text'|'number'} [inputType]
 */

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {CriticalBlankField[]} props.fields
 * @param {Record<string, string>} props.values - draft values keyed by field.key
 * @param {(key: string, value: string) => void} props.onChangeValue
 * @param {Record<string, boolean>} props.skipped - which fields are marked Skip
 * @param {(key: string, skipped: boolean) => void} props.onToggleSkip
 * @param {Record<string, string>} props.reasons
 * @param {(key: string, reason: string) => void} props.onChangeReason
 * @param {() => void} props.onCancel
 * @param {() => void} props.onConfirm
 * @param {boolean} [props.saving]
 */
export default function MissingCriticalReadingModal({
  open,
  fields = [],
  values = {},
  onChangeValue,
  skipped = {},
  onToggleSkip,
  reasons = {},
  onChangeReason,
  onCancel,
  onConfirm,
  saving = false,
}) {
  if (!open || !fields.length) return null;

  const canConfirm = fields.every((field) => {
    const hasValue = String(values[field.key] || '').trim() !== '';
    return hasValue || Boolean(skipped[field.key]);
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        zIndex: 70,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          maxWidth: 560,
          width: '100%',
          padding: 20,
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
          Critical readings missing
        </h3>
        <p style={{ margin: '0 0 14px', fontSize: 13, color: '#64748b' }}>
          Enter each Critical reading now, or Skip it. Skipped Critical readings alert the doctor in real time; you may still continue.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {fields.map((field) => {
            const isSkipped = Boolean(skipped[field.key]);
            return (
              <div
                key={field.key}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: 12,
                  background: isSkipped ? '#fff7ed' : '#f8fafc',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{field.label}</div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isSkipped}
                      onChange={(e) => onToggleSkip(field.key, e.target.checked)}
                    />
                    Skip
                  </label>
                </div>
                {!isSkipped ? (
                  <input
                    type={field.inputType || 'number'}
                    value={values[field.key] || ''}
                    onChange={(e) => onChangeValue(field.key, e.target.value)}
                    placeholder={`Enter ${field.label}`}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      marginBottom: 8,
                    }}
                  />
                ) : null}
                <input
                  type="text"
                  maxLength={200}
                  placeholder="Reason (optional, 0/200)"
                  value={reasons[field.key] || ''}
                  onChange={(e) => onChangeReason(field.key, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 12,
                  }}
                />
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="solid"
            onClick={onConfirm}
            disabled={saving || !canConfirm}
            style={{ background: canConfirm ? '#2563eb' : '#94a3b8', color: '#fff' }}
          >
            {saving ? 'Saving…' : 'Confirm & Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
