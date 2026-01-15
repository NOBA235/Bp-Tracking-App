export const classifyBP = (systolic, diastolic) => {
  const sys = parseInt(systolic)
  const dia = parseInt(diastolic)

  if (sys < 90 || dia < 60) {
    return {
      category: 'hypotension',
      label: 'Low BP',
      severity: 'low',
      advice: 'Consult doctor if symptomatic'
    }
  } else if (sys < 120 && dia < 80) {
    return {
      category: 'normal',
      label: 'Normal',
      severity: 'normal',
      advice: 'Maintain healthy lifestyle'
    }
  } else if (sys >= 120 && sys <= 129 && dia < 80) {
    return {
      category: 'elevated',
      label: 'Elevated',
      severity: 'warning',
      advice: 'Monitor closely, lifestyle changes recommended'
    }
  } else if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) {
    return {
      category: 'hypertension_stage_1',
      label: 'Stage 1 Hypertension',
      severity: 'moderate',
      advice: 'Consult doctor, lifestyle changes required'
    }
  } else if (sys >= 140 || dia >= 90) {
    return {
      category: 'hypertension_stage_2',
      label: 'Stage 2 Hypertension',
      severity: 'high',
      advice: 'Immediate medical attention recommended'
    }
  } else if (sys >= 180 || dia >= 120) {
    return {
      category: 'hypertensive_crisis',
      label: 'Hypertensive Crisis',
      severity: 'critical',
      advice: 'Seek emergency care immediately'
    }
  }

  return {
    category: 'unknown',
    label: 'Check Values',
    severity: 'unknown',
    advice: 'Please verify readings'
  }
}

export const getBPStats = (readings) => {
  if (!readings || readings.length === 0) {
    return {
      averageSystolic: 0,
      averageDiastolic: 0,
      averagePulse: 0,
      categories: {},
      trends: {}
    }
  }

  const stats = {
    averageSystolic: Math.round(
      readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length
    ),
    averageDiastolic: Math.round(
      readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length
    ),
    averagePulse: Math.round(
      readings.reduce((sum, r) => sum + (r.pulse || 0), 0) / 
      readings.filter(r => r.pulse).length
    ),
    categories: {},
    trends: {
      systolic: readings.map(r => ({
        date: r.timestamp,
        value: r.systolic
      })),
      diastolic: readings.map(r => ({
        date: r.timestamp,
        value: r.diastolic
      }))
    }
  }

  // Count by category
  readings.forEach(reading => {
    const category = reading.classification?.category || 'unknown'
    stats.categories[category] = (stats.categories[category] || 0) + 1
  })

  return stats
}