import React, { useMemo } from 'react';
import { Box } from '../component-library';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function ImmunizationChart({ items = [] }) {
  const data = useMemo(() => {
    const map = {};
    (items || []).forEach((it) => {
      const key = (it.vaccine || 'Unknown').trim();
      map[key] = (map[key] || 0) + 1;
    });
    return Object.keys(map).map((k) => ({ vaccine: k, count: map[k] }));
  }, [items]);

  if (!data || data.length === 0) {
    return <Box className="text-sm text-gray-400 italic">No immunization data to chart.</Box>;
  }

  return (
    <Box style={{ height: 220 }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="vaccine" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#4164df" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}

export default ImmunizationChart;
