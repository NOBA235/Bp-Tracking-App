import React, { useState } from 'react'
import { useBP } from '../../context/BPContext'
import { classifyBP } from '../../utils/bpClassifier'


const BPEntryForm = () => {
  const { addReading } = useBP()
  const [formData, setFormData] = useState({
    systolic: '',
    diastolic: '',
    pulse: '',
    timeOfDay: 'morning',
    condition: 'before_meal',
    notes: ''
  })
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.systolic || formData.systolic < 50 || formData.systolic > 250) {
      newErrors.systolic = 'Systolic must be between 50 and 250'
    }
    
    if (!formData.diastolic || formData.diastolic < 30 || formData.diastolic > 150) {
      newErrors.diastolic = 'Diastolic must be between 30 and 150'
    }
    
    if (formData.pulse && (formData.pulse < 30 || formData.pulse > 200)) {
      newErrors.pulse = 'Pulse must be between 30 and 200'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const reading = {
      ...formData,
      systolic: parseInt(formData.systolic),
      diastolic: parseInt(formData.diastolic),
      pulse: formData.pulse ? parseInt(formData.pulse) : null,
      classification: classifyBP(formData.systolic, formData.diastolic)
    }

    addReading(reading)
    
    // Reset form
    setFormData({
      systolic: '',
      diastolic: '',
      pulse: '',
      timeOfDay: 'morning',
      condition: 'before_meal',
      notes: ''
    })
    
    alert('BP reading added successfully!')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const getClassificationColor = (systolic, diastolic) => {
    if (!systolic || !diastolic) return 'transparent'
    
    const classification = classifyBP(systolic, diastolic)
    switch (classification.category) {
      case 'normal': return 'bg-green-100 text-green-800'
      case 'elevated': return 'bg-yellow-100 text-yellow-800'
      case 'hypertension_stage_1': return 'bg-orange-100 text-orange-800'
      case 'hypertension_stage_2': return 'bg-red-100 text-red-800'
      case 'hypotension': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bp-form-container">
      <h2 className="form-title">Add New BP Reading</h2>
      
      <form onSubmit={handleSubmit} className="bp-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="systolic" className="form-label">
              Systolic (mmHg) *
            </label>
            <input
              type="number"
              id="systolic"
              name="systolic"
              value={formData.systolic}
              onChange={handleChange}
              className={`form-input ${errors.systolic ? 'error' : ''}`}
              placeholder="120"
              min="50"
              max="250"
              required
            />
            {errors.systolic && (
              <span className="error-message">{errors.systolic}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="diastolic" className="form-label">
              Diastolic (mmHg) *
            </label>
            <input
              type="number"
              id="diastolic"
              name="diastolic"
              value={formData.diastolic}
              onChange={handleChange}
              className={`form-input ${errors.diastolic ? 'error' : ''}`}
              placeholder="80"
              min="30"
              max="150"
              required
            />
            {errors.diastolic && (
              <span className="error-message">{errors.diastolic}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="pulse" className="form-label">
              Pulse (bpm)
            </label>
            <input
              type="number"
              id="pulse"
              name="pulse"
              value={formData.pulse}
              onChange={handleChange}
              className="form-input"
              placeholder="72"
              min="30"
              max="200"
            />
          </div>

          {formData.systolic && formData.diastolic && (
            <div className="form-group">
              <div className="classification-preview">
                <span className={`classification-badge ${getClassificationColor(formData.systolic, formData.diastolic)}`}>
                  {classifyBP(formData.systolic, formData.diastolic).label}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="timeOfDay" className="form-label">
              Time of Day
            </label>
            <select
              id="timeOfDay"
              name="timeOfDay"
              value={formData.timeOfDay}
              onChange={handleChange}
              className="form-select"
            >
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
              <option value="night">Night</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="condition" className="form-label">
              Condition
            </label>
            <select
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="form-select"
            >
              <option value="before_meal">Before Meal</option>
              <option value="after_meal">After Meal</option>
              <option value="before_medication">Before Medication</option>
              <option value="after_medication">After Medication</option>
              <option value="resting">Resting</option>
              <option value="active">After Activity</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes" className="form-label">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="form-textarea"
            placeholder="Any symptoms, feelings, or additional information..."
            rows="3"
          />
        </div>

        <button type="submit" className="submit-btn">
          Save Reading
        </button>
      </form>
    </div>
  )
}

export default BPEntryForm