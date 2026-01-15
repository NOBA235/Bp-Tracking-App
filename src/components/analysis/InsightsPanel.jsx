import React, { useMemo } from 'react'
import { format, subDays } from 'date-fns'
import { getBPStats } from '../../utils/bpClassifier'
import './InsightsPanel.css'

const InsightsPanel = ({ readings }) => {
  const insights = useMemo(() => {
    if (readings.length === 0) return []
    
    const stats = getBPStats(readings)
    const today = new Date()
    const weekAgo = subDays(today, 7)
    
    const recentReadings = readings.filter(r => 
      new Date(r.timestamp) >= weekAgo
    )
    
    const insightsList = []
    
    // Insight 1: Overall trend
    if (recentReadings.length >= 3) {
      const first = recentReadings[recentReadings.length - 1]
      const last = recentReadings[0]
      
      const systolicChange = last.systolic - first.systolic
      const diastolicChange = last.diastolic - first.diastolic
      
      if (systolicChange > 10 || diastolicChange > 5) {
        insightsList.push({
          type: 'warning',
          title: 'BP Increasing',
          message: 'Your blood pressure shows an upward trend over the past week. Consider consulting your doctor.',
          icon: '📈'
        })
      } else if (systolicChange < -10 || diastolicChange < -5) {
        insightsList.push({
          type: 'info',
          title: 'BP Decreasing',
          message: 'Your blood pressure shows improvement over the past week. Keep up the good work!',
          icon: '📉'
        })
      }
    }
    
    // Insight 2: High readings frequency
    const highReadings = readings.filter(r => 
      r.classification?.severity === 'high' || r.classification?.severity === 'moderate'
    ).length
    
    if (highReadings > readings.length * 0.3) {
      insightsList.push({
        type: 'danger',
        title: 'Frequent High Readings',
        message: `${Math.round((highReadings / readings.length) * 100)}% of your readings are elevated. Please consult your doctor.`,
        icon: '⚠️'
      })
    }
    
    // Insight 3: Time of day patterns
    const timeStats = readings.reduce((acc, r) => {
      if (!acc[r.timeOfDay]) {
        acc[r.timeOfDay] = { systolic: 0, diastolic: 0, count: 0 }
      }
      acc[r.timeOfDay].systolic += r.systolic
      acc[r.timeOfDay].diastolic += r.diastolic
      acc[r.timeOfDay].count++
      return acc
    }, {})
    
    Object.entries(timeStats).forEach(([time, data]) => {
      if (data.count >= 3) {
        const avgSys = Math.round(data.systolic / data.count)
        const avgDia = Math.round(data.diastolic / data.count)
        
        if (avgSys > 135 || avgDia > 85) {
          insightsList.push({
            type: 'warning',
            title: `High ${time} Readings`,
            message: `Your average BP in the ${time} is ${avgSys}/${avgDia}. Consider monitoring your ${time} routine.`,
            icon: '⏰'
          })
        }
      }
    })
    
    // Insight 4: Consistency
    if (readings.length >= 5) {
      const systolicVariance = Math.sqrt(
        readings.reduce((sum, r) => 
          sum + Math.pow(r.systolic - stats.averageSystolic, 2), 0
        ) / readings.length
      )
      
      if (systolicVariance > 15) {
        insightsList.push({
          type: 'info',
          title: 'Inconsistent Readings',
          message: 'Your blood pressure readings vary significantly. Try taking readings at consistent times and conditions.',
          icon: '🔄'
        })
      }
    }
    
    return insightsList.slice(0, 4) // Limit to 4 insights
  }, [readings])

  if (insights.length === 0) {
    return (
      <div className="insights-panel">
        <h3 className="insights-title">Insights</h3>
        <div className="no-insights">
          <p>Add more readings to get personalized insights</p>
        </div>
      </div>
    )
  }

  return (
    <div className="insights-panel">
      <h3 className="insights-title">Health Insights</h3>
      <div className="insights-list">
        {insights.map((insight, index) => (
          <div key={index} className={`insight-card ${insight.type}`}>
            <div className="insight-icon">{insight.icon}</div>
            <div className="insight-content">
              <h4 className="insight-title">{insight.title}</h4>
              <p className="insight-message">{insight.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default InsightsPanel