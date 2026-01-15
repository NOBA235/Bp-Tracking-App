import React, { useMemo } from 'react'
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
  AreaChart
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { useBP } from '../../context/BPContext'
import { getBPStats } from '../../utils/bpClassifier'


const BPChart = ({ period = 'week' }) => {
  const { state } = useBP()
  
  const chartData = useMemo(() => {
    const now = new Date()
    let cutoffDate = new Date()
    
    switch (period) {
      case 'day':
        cutoffDate.setDate(now.getDate() - 1)
        break
      case 'week':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        cutoffDate.setDate(now.getDate() - 7)
    }
    
    const filteredReadings = state.readings.filter(reading => 
      new Date(reading.timestamp) >= cutoffDate
    )
    
    return filteredReadings
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(reading => ({
        ...reading,
        date: format(parseISO(reading.timestamp), 'MMM dd'),
        time: format(parseISO(reading.timestamp), 'HH:mm'),
        fullDate: reading.timestamp
      }))
  }, [state.readings, period])

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-date">{label}</p>
          <p className="tooltip-item">
            <span className="tooltip-label">Systolic:</span>
            <span className="tooltip-value systolic">{payload[0].value}</span>
          </p>
          <p className="tooltip-item">
            <span className="tooltip-label">Diastolic:</span>
            <span className="tooltip-value diastolic">{payload[1].value}</span>
          </p>
          {payload[2] && (
            <p className="tooltip-item">
              <span className="tooltip-label">Pulse:</span>
              <span className="tooltip-value pulse">{payload[2].value}</span>
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const stats = getBPStats(chartData)

  if (chartData.length === 0) {
    return (
      <div className="no-data-chart">
        <p>No BP readings available for the selected period.</p>
        <p>Add your first reading to see the chart.</p>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">Blood Pressure Trends</h3>
        <div className="chart-stats">
          <div className="stat-item">
            <span className="stat-label">Avg Systolic:</span>
            <span className="stat-value">{stats.averageSystolic}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Avg Diastolic:</span>
            <span className="stat-value">{stats.averageDiastolic}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Avg Pulse:</span>
            <span className="stat-value">{stats.averagePulse || '-'}</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#666' }}
            axisLine={{ stroke: '#ddd' }}
          />
          <YAxis 
            tick={{ fill: '#666' }}
            axisLine={{ stroke: '#ddd' }}
            label={{ 
              value: 'mmHg', 
              angle: -90, 
              position: 'insideLeft',
              offset: -10 
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Normal Range Area */}
          <Area
            type="monotone"
            dataKey="normalMin"
            stroke="transparent"
            fill="#e8f5e9"
            fillOpacity={0.3}
            dot={false}
            name="Normal Range"
          />
          
          {/* Warning Range Area */}
          <Area
            type="monotone"
            dataKey="warningMin"
            stroke="transparent"
            fill="#fff3cd"
            fillOpacity={0.3}
            dot={false}
            name="Elevated Range"
          />
          
          <Line
            type="monotone"
            dataKey="systolic"
            stroke="#ff6b6b"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
            name="Systolic"
          />
          <Line
            type="monotone"
            dataKey="diastolic"
            stroke="#4d96ff"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
            name="Diastolic"
          />
          
          {/* Add pulse line if available */}
          {chartData.some(r => r.pulse) && (
            <Line
              type="monotone"
              dataKey="pulse"
              stroke="#6bcf7f"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={{ r: 3 }}
              name="Pulse"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>

      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color systolic"></div>
          <span>Systolic (Top Number)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color diastolic"></div>
          <span>Diastolic (Bottom Number)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color pulse"></div>
          <span>Pulse Rate</span>
        </div>
      </div>
    </div>
  )
}

export default BPChart