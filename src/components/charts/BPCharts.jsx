// src/components/charts/BPChart.js
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { Paper, Typography, Box, useTheme } from '@mui/material';
import { getBPColor, analyzeBP } from '../../store/bpStore';

const BPChart = ({ readings, range }) => {
  const theme = useTheme();

  // Prepare data for chart
  const chartData = readings
    .filter((reading) => {
      const readingDate = new Date(reading.timestamp);
      return readingDate >= new Date(range.start) && readingDate <= new Date(range.end);
    })
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .map((reading) => ({
      ...reading,
      timestamp: format(new Date(reading.timestamp), 'MM/dd HH:mm'),
      date: format(new Date(reading.timestamp), 'yyyy-MM-dd'),
      category: analyzeBP(reading.systolic, reading.diastolic),
      time: format(new Date(reading.timestamp), 'HH:mm'),
    }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <Paper sx={{ p: 2, border: 1, borderColor: 'divider', maxWidth: 250 }}>
          <Typography variant="body2" color="textSecondary">
            {data?.timestamp}
          </Typography>
          <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
            Systolic: <strong>{data?.systolic} mmHg</strong>
          </Typography>
          <Typography variant="body2" color="secondary">
            Diastolic: <strong>{data?.diastolic} mmHg</strong>
          </Typography>
          <Typography variant="body2" color="text.primary">
            Pulse: <strong>{data?.pulse || '--'} BPM</strong>
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
            Condition: {data?.condition ? data.condition.replace('_', ' ') : 'Not specified'}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: getBPColor(data?.category),
              fontWeight: 'bold',
              display: 'block',
              mt: 0.5
            }}
          >
            {data?.category ? data.category.replace(/_/g, ' ').toUpperCase() : 'UNKNOWN'}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <Box sx={{ width: '100%', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No readings available for the selected period
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis
            dataKey="timestamp"
            tick={{ fill: theme.palette.text.secondary }}
            axisLine={{ stroke: theme.palette.divider }}
            tickFormatter={(value) => {
              try {
                return format(parseISO(value.split(' ')[0] + 'T' + value.split(' ')[1]), 'MM/dd HH:mm');
              } catch {
                return value;
              }
            }}
          />
          <YAxis
            label={{ 
              value: 'mmHg', 
              angle: -90, 
              position: 'insideLeft',
              style: { fill: theme.palette.text.secondary }
            }}
            tick={{ fill: theme.palette.text.secondary }}
            axisLine={{ stroke: theme.palette.divider }}
            domain={[60, 180]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Reference lines for normal ranges */}
          <ReferenceLine y={120} stroke="#4caf50" strokeDasharray="3 3" label="Normal Sys" />
          <ReferenceLine y={80} stroke="#4caf50" strokeDasharray="3 3" label="Normal Dia" />
          <ReferenceLine y={140} stroke="#ff9800" strokeDasharray="3 3" label="Stage 1" />
          <ReferenceLine y={90} stroke="#ff9800" strokeDasharray="3 3" />
          
          {/* Areas for systolic and diastolic */}
          <Area
            type="monotone"
            dataKey="systolic"
            stroke="#ff6b6b"
            fill="#ff6b6b"
            fillOpacity={0.3}
            name="Systolic"
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
          <Area
            type="monotone"
            dataKey="diastolic"
            stroke="#4d96ff"
            fill="#4d96ff"
            fillOpacity={0.3}
            name="Diastolic"
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="pulse"
            stroke="#6bc46d"
            name="Pulse"
            strokeWidth={1}
            dot={{ r: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default BPChart;