/**
 * PageSkeleton – Lightweight shimmer placeholders that replace loading spinners.
 *
 * Usage:
 *   <PageSkeleton variant="table" rows={8} />
 *   <PageSkeleton variant="cards" count={6} />
 *   <PageSkeleton variant="detail" />
 *   <PageSkeleton variant="dashboard" />
 *   <PageSkeleton variant="form" fields={5} />
 *
 * @file src/components/PageSkeleton.jsx
 */
import React from 'react';

/* ── Shimmer keyframes (injected once) ──────────────────────────── */
const shimmerCSS = `
@keyframes skeletonShimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
`;

let injected = false;
function injectShimmer() {
  if (injected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = shimmerCSS;
  document.head.appendChild(style);
  injected = true;
}

/* ── Base block ──────────────────────────────────────────────────── */
const bar = (w = '100%', h = '16px', extra = {}) => ({
  width: w,
  height: h,
  borderRadius: '6px',
  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
  backgroundSize: '800px 100%',
  animation: 'skeletonShimmer 1.5s infinite linear',
  ...extra,
});

/* ── Variant renderers ───────────────────────────────────────────── */

function TableSkeleton({ rows = 6 }) {
  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* header bar */}
      <div style={bar('60%', '28px')} />
      {/* search bar */}
      <div style={bar('40%', '36px', { borderRadius: '8px' })} />
      {/* rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={bar('32px', '32px', { borderRadius: '50%', flexShrink: 0 })} />
          <div style={bar('30%', '14px')} />
          <div style={bar('20%', '14px')} />
          <div style={bar('15%', '14px')} />
          <div style={bar('10%', '14px')} />
        </div>
      ))}
    </div>
  );
}

function CardsSkeleton({ count = 4 }) {
  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={bar('50%', '28px')} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '16px' }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ padding: '16px', borderRadius: '12px', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={bar('60%', '18px')} />
            <div style={bar('90%', '12px')} />
            <div style={bar('40%', '12px')} />
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* back + title */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={bar('32px', '32px', { borderRadius: '8px', flexShrink: 0 })} />
        <div style={bar('40%', '24px')} />
      </div>
      {/* profile card */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px', borderRadius: '12px', background: '#fafafa' }}>
        <div style={bar('64px', '64px', { borderRadius: '50%', flexShrink: 0 })} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={bar('50%', '18px')} />
          <div style={bar('35%', '14px')} />
          <div style={bar('25%', '14px')} />
        </div>
      </div>
      {/* tabs */}
      <div style={{ display: 'flex', gap: '12px' }}>
        {[80, 100, 90, 70].map((w, i) => <div key={i} style={bar(`${w}px`, '32px', { borderRadius: '8px' })} />)}
      </div>
      {/* content rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={bar('100%', '48px', { borderRadius: '8px' })} />
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '12px' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ padding: '16px', borderRadius: '12px', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={bar('50%', '14px')} />
            <div style={bar('60%', '28px')} />
          </div>
        ))}
      </div>
      {/* chart area */}
      <div style={bar('100%', '200px', { borderRadius: '12px' })} />
      {/* list rows */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={bar('32px', '32px', { borderRadius: '50%', flexShrink: 0 })} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={bar('40%', '14px')} />
            <div style={bar('25%', '12px')} />
          </div>
        </div>
      ))}
    </div>
  );
}

function FormSkeleton({ fields = 4 }) {
  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={bar('45%', '28px')} />
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={bar('25%', '12px')} />
          <div style={bar('100%', '40px', { borderRadius: '8px' })} />
        </div>
      ))}
      <div style={bar('120px', '40px', { borderRadius: '8px', marginTop: '8px' })} />
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────── */
const VARIANTS = {
  table: TableSkeleton,
  cards: CardsSkeleton,
  detail: DetailSkeleton,
  dashboard: DashboardSkeleton,
  form: FormSkeleton,
};

export default function PageSkeleton({ variant = 'table', ...props }) {
  injectShimmer();
  const Comp = VARIANTS[variant] || TableSkeleton;
  return <Comp {...props} />;
}

export { TableSkeleton, CardsSkeleton, DetailSkeleton, DashboardSkeleton, FormSkeleton };
