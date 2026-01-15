import React from 'react'
import { useBP } from '../context/BPContext'
import BPEntryForm from '../components/forms/BPEntryForm'
import BPChart from '../components/charts/BPChart'
import StatsCard from '../components/analysis/StatsCard'
import InsightsPanel from '../components/analysis/InsightsPanel'
import { getBPStats } from '../utils/bpClassifier'
import { format, subDays } from 'date-fns'


const Dashboard = () => {
  const { state } = useBP()
  
  const recentReadings = state.readings.slice(0, 5)
  const stats = getBPStats(state.readings)
  
  const today = new Date()
  const yesterday = subDays(today, 1)
  
  const todayReadings = state.readings.filter(reading => 
    format(new Date(reading.timestamp), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  )
  
  const yesterdayReadings = state.readings.filter(reading => 
    format(new Date(reading.timestamp), 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')
  )

  const getTimeOfDayStats = () => {
    const times = {
      morning: { systolic: 0, diastolic: 0, count: 0 },
      afternoon: { systolic: 0, diastolic: 0, count: 0 },
      evening: { systolic: 0, diastolic: 0, count: 0 },
      night: { systolic: 0, diastolic: 0, count: 0 }
    }
    
    state.readings.forEach(reading => {
      if (times[reading.timeOfDay]) {
        times[reading.timeOfDay].systolic += reading.systolic
        times[reading.timeOfDay].diastolic += reading.diastolic
        times[reading.timeOfDay].count++
      }
    })
    
    return Object.entries(times).map(([time, data]) => ({
      time,
      avgSystolic: data.count ? Math.round(data.systolic / data.count) : 0,
      avgDiastolic: data.count ? Math.round(data.diastolic / data.count) : 0
    }))
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">BP Tracker Dashboard</h1>
        <p className="dashboard-subtitle">
          Monitor your blood pressure trends and stay healthy
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Left Column - Stats & Form */}
        <div className="dashboard-left">
          <div className="stats-grid">
            <StatsCard
              title="Today's Readings"
              value={todayReadings.length}
              subtitle={`vs ${yesterdayReadings.length} yesterday`}
              trend={todayReadings.length - yesterdayReadings.length}
              color="blue"
            />
            
            <StatsCard
              title="Average BP"
              value={`${stats.averageSystolic}/${stats.averageDiastolic}`}
              subtitle="Overall average"
              color="green"
            />
            
            <StatsCard
              title="Current Status"
              value={recentReadings[0]?.classification?.label || 'No Data'}
              subtitle={recentReadings[0]?.classification?.advice || ''}
              color={
                recentReadings[0]?.classification?.category === 'normal' 
                  ? 'green' 
                  : recentReadings[0]?.classification?.severity === 'high' 
                    ? 'red' 
                    : 'yellow'
              }
            />
            
            <StatsCard
              title="Pulse Average"
              value={stats.averagePulse || '--'}
              subtitle="bpm"
              color="purple"
            />
          </div>

          <div className="form-section">
            <BPEntryForm />
          </div>
        </div>

        {/* Right Column - Charts & Insights */}
        <div className="dashboard-right">
          <div className="chart-section">
            <BPChart period="week" />
          </div>

          <div className="insights-section">
            <InsightsPanel readings={state.readings} />
          </div>

          {/* Recent Readings Table */}
          <div className="recent-readings">
            <h3 className="section-title">Recent Readings</h3>
            {recentReadings.length > 0 ? (
              <div className="readings-table">
                <div className="table-header">
                  <div className="table-cell">Date & Time</div>
                  <div className="table-cell">BP Reading</div>
                  <div className="table-cell">Pulse</div>
                  <div className="table-cell">Status</div>
                  <div className="table-cell">Condition</div>
                </div>
                {recentReadings.map(reading => (
                  <div key={reading.id} className="table-row">
                    <div className="table-cell">
                      {format(new Date(reading.timestamp), 'MMM dd, HH:mm')}
                    </div>
                    <div className="table-cell bp-value">
                      <span className="systolic">{reading.systolic}</span>
                      /
                      <span className="diastolic">{reading.diastolic}</span>
                    </div>
                    <div className="table-cell">
                      {reading.pulse || '--'}
                    </div>
                    <div className="table-cell">
                      <span className={`status-badge ${reading.classification?.category}`}>
                        {reading.classification?.label}
                      </span>
                    </div>
                    <div className="table-cell">
                      {reading.condition.replace('_', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No readings yet. Add your first reading!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard