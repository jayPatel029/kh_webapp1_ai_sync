/**
 * Chart Component
 * Wrapper for chart.js or simple canvas-based charts
 * 
 * @file src/components/primitives/Chart.jsx
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

/**
 * Chart Component
 * 
 * @example
 * <Chart type="line" data={chartData} height={300} />
 */
export const Chart = forwardRef(({
  children,
  type = 'line',
  data,
  options = {},
  height = 300,
  width = '100%',
  className,
  ...props
}, ref) => {
  const chartClasses = clsx(
    'chart',
    `chart--${type}`,
    className
  );

  return (
    <div
      ref={ref}
      className={chartClasses}
      style={{ height, width, position: 'relative' }}
      {...props}
    >
      {/* Chart rendering logic can be implemented here */}
      {/* For now, this is a placeholder that accepts an SVG/image as children */}
      {children}
    </div>
  );
});

Chart.displayName = 'Chart';

Chart.propTypes = {
  children: PropTypes.node,
  type: PropTypes.oneOf(['line', 'bar', 'pie', 'area', 'scatter']),
  data: PropTypes.object,
  options: PropTypes.object,
  height: PropTypes.number,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
};

export default Chart;
