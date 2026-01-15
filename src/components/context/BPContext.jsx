import React, { createContext, useContext, useReducer, useEffect } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'

const BPContext = createContext()

const initialState = {
  readings: [],
  loading: false,
  error: null,
  filters: {
    dateRange: 'week',
    startDate: null,
    endDate: null,
    timeOfDay: 'all',
    category: 'all'
  }
}

function bpReducer(state, action) {
  switch (action.type) {
    case 'ADD_READING':
      return {
        ...state,
        readings: [action.payload, ...state.readings].sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        )
      }
    case 'UPDATE_READING':
      return {
        ...state,
        readings: state.readings.map(reading =>
          reading.id === action.payload.id ? action.payload : reading
        )
      }
    case 'DELETE_READING':
      return {
        ...state,
        readings: state.readings.filter(reading => reading.id !== action.payload)
      }
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      }
    case 'SET_READINGS':
      return {
        ...state,
        readings: action.payload
      }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    default:
      return state
  }
}

export function BPProvider({ children }) {
  const [storedReadings, setStoredReadings] = useLocalStorage('bp-readings', [])
  const [state, dispatch] = useReducer(bpReducer, {
    ...initialState,
    readings: storedReadings
  })

  useEffect(() => {
    setStoredReadings(state.readings)
  }, [state.readings, setStoredReadings])

  const addReading = (reading) => {
    const newReading = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...reading
    }
    dispatch({ type: 'ADD_READING', payload: newReading })
  }

  const updateReading = (id, updates) => {
    dispatch({ type: 'UPDATE_READING', payload: { id, ...updates } })
  }

  const deleteReading = (id) => {
    dispatch({ type: 'DELETE_READING', payload: id })
  }

  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters })
  }

  const value = {
    state,
    addReading,
    updateReading,
    deleteReading,
    setFilters
  }

  return <BPContext.Provider value={value}>{children}</BPContext.Provider>
}

export const useBP = () => {
  const context = useContext(BPContext)
  if (!context) {
    throw new Error('useBP must be used within a BPProvider')
  }
  return context
}