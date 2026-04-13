/**
 * DialysisBedSeat Demo & Examples
 * @file src/components/DialysisBedSeat/DialysisBedSeat.demo.jsx
 *
 * Examples of the DialysisBedSeat component in various states.
 * Use this as reference for integrating into your bed management dashboard.
 */

import React, { useState } from 'react';
import { DialysisBedSeat } from './index';

/**
 * Demo: Grid Layout Example (50-100 beds)
 */
export function DialysisBedSeatGridDemo() {
  const [selectedBed, setSelectedBed] = useState(null);

  // Sample bed data
  const beds = [
    { bedId: 'B101', status: 'AVAILABLE' },
    { bedId: 'B102', status: 'OCCUPIED' },
    { bedId: 'B103', status: 'DIALYSIS_RUNNING' },
    { bedId: 'B104', status: 'PAUSED' },
    { bedId: 'B105', status: 'ALERT', hasAlert: true },
    { bedId: 'B106', status: 'MAINTENANCE' },
    { bedId: 'B107', status: 'DIALYSIS_RUNNING', isRunning: true },
    { bedId: 'B108', status: 'OCCUPIED', hasAlert: true },
    { bedId: 'B109', status: 'AVAILABLE' },
    { bedId: 'B110', status: 'DIALYSIS_RUNNING', isRunning: true, hasAlert: true },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2>Dialysis Bed Seat Grid Demo</h2>
      <p>Selected Bed: {selectedBed || 'None'}</p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, 80px)',
          gap: '12px',
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          maxWidth: '600px',
        }}
      >
        {beds.map((bed) => (
          <DialysisBedSeat
            key={bed.bedId}
            bedId={bed.bedId}
            status={bed.status}
            hasAlert={bed.hasAlert || false}
            isRunning={bed.isRunning || false}
            onClick={() => setSelectedBed(bed.bedId)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Demo: All Status States
 */
export function DialysisBedSeatStatusDemo() {
  const statuses = [
    'AVAILABLE',
    'OCCUPIED',
    'DIALYSIS_RUNNING',
    'PAUSED',
    'ALERT',
    'MAINTENANCE',
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2>Dialysis Bed Seat Status States</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, 120px)',
          gap: '20px',
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
        }}
      >
        {statuses.map((status) => (
          <div key={status} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '12px', marginBottom: '8px', fontWeight: 'bold' }}>
              {status}
            </p>
            <DialysisBedSeat
              bedId="B101"
              status={status}
              hasAlert={status === 'ALERT'}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Demo: With Badge Indicators
 */
export function DialysisBedSeatBadgeDemo() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Dialysis Bed Seat with Badge Indicators</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, 120px)',
          gap: '20px',
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
        }}
      >
        {/* Alert Badge */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '12px', marginBottom: '8px' }}>Alert Badge</p>
          <DialysisBedSeat
            bedId="B101"
            status="ALERT"
            hasAlert={true}
          />
        </div>

        {/* Running Indicator */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '12px', marginBottom: '8px' }}>Running Badge</p>
          <DialysisBedSeat
            bedId="B102"
            status="DIALYSIS_RUNNING"
            isRunning={true}
          />
        </div>

        {/* Both Badges */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '12px', marginBottom: '8px' }}>Alert + Running</p>
          <DialysisBedSeat
            bedId="B103"
            status="DIALYSIS_RUNNING"
            hasAlert={true}
            isRunning={true}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Demo: Large Grid (Example for 50+ beds)
 */
export function DialysisBedSeatLargeGridDemo() {
  const generateBeds = (count) => {
    const statuses = ['AVAILABLE', 'OCCUPIED', 'DIALYSIS_RUNNING', 'PAUSED', 'MAINTENANCE'];
    const beds = [];
    for (let i = 1; i <= count; i++) {
      beds.push({
        bedId: `B${String(i).padStart(3, '0')}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        hasAlert: Math.random() < 0.1, // 10% chance of alert
        isRunning: Math.random() < 0.2, // 20% chance of running
      });
    }
    return beds;
  };

  const beds = generateBeds(72); // 6×12 grid

  return (
    <div style={{ padding: '20px' }}>
      <h2>Large Dialysis Bed Grid (72 beds)</h2>
      <p style={{ fontSize: '12px', color: '#666' }}>
        Demonstrating dense grid layout with realistic bed distribution
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 80px)',
          gap: '12px',
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          overflowX: 'auto',
        }}
      >
        {beds.map((bed) => (
          <DialysisBedSeat
            key={bed.bedId}
            bedId={bed.bedId}
            status={bed.status}
            hasAlert={bed.hasAlert}
            isRunning={bed.isRunning}
            onClick={() => console.log(`Clicked bed: ${bed.bedId}`)}
          />
        ))}
      </div>
    </div>
  );
}

// Default export for Storybook-style stories
export default {
  title: 'Components/DialysisBedSeat',
  component: DialysisBedSeat,
  argTypes: {
    bedId: { control: 'text', defaultValue: 'B101' },
    status: {
      control: 'select',
      options: ['AVAILABLE', 'OCCUPIED', 'DIALYSIS_RUNNING', 'PAUSED', 'ALERT', 'MAINTENANCE'],
      defaultValue: 'AVAILABLE',
    },
    hasAlert: { control: 'boolean', defaultValue: false },
    isRunning: { control: 'boolean', defaultValue: false },
  },
};
