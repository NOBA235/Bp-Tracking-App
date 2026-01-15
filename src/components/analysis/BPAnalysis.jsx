// src/store/bpStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Utility functions for BP analysis
export const analyzeBP = (systolic, diastolic) => {
  if (systolic < 90 && diastolic < 60) return 'hypotension';
  if (systolic < 120 && diastolic < 80) return 'normal';
  if (systolic >= 120 && systolic <= 129 && diastolic < 80) return 'elevated';
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89))
    return 'hypertension_stage_1';
  if (systolic >= 140 || diastolic >= 90) return 'hypertension_stage_2';
  if (systolic > 180 || diastolic > 120) return 'hypertensive_crisis';
  return 'normal';
};

export const getBPColor = (category) => {
  const colors = {
    normal: '#4caf50',
    elevated: '#ff9800',
    hypertension_stage_1: '#ff5722',
    hypertension_stage_2: '#f44336',
    hypertensive_crisis: '#d32f2f',
    hypotension: '#2196f3',
  };
  return colors[category] || '#666';
};

export const getBPRecommendations = (category) => {
  const recommendations = {
    normal: ['Maintain healthy lifestyle', 'Regular checkups'],
    elevated: ['Reduce salt intake', 'Increase physical activity', 'Monitor regularly'],
    hypertension_stage_1: ['Consult doctor', 'Medication review', 'Lifestyle changes'],
    hypertension_stage_2: ['Immediate doctor consultation', 'Medication adherence', 'Regular monitoring'],
    hypertensive_crisis: ['Seek emergency care immediately'],
    hypotension: ['Increase fluid intake', 'Review medications', 'Avoid sudden position changes'],
  };
  return recommendations[category] || ['No specific recommendations'];
};

const useBPStore = create(
  persist(
    (set, get) => ({
      readings: [],
      selectedRange: {
        start: new Date(new Date().setDate(new Date().getDate() - 7)),
        end: new Date(),
        type: 'week'
      },
      isLoading: false,
      error: null,

      // Actions
      addReading: async (readingData) => {
        set({ isLoading: true });
        try {
          const newReading = {
            ...readingData,
            id: crypto.randomUUID(),
            timestamp: new Date(),
          };
          
          set((state) => ({
            readings: [newReading, ...state.readings],
            isLoading: false,
            error: null
          }));
        } catch (error) {
          set({ error: 'Failed to add reading', isLoading: false });
        }
      },

      updateReading: (id, updates) => {
        set((state) => ({
          readings: state.readings.map((reading) =>
            reading.id === id ? { ...reading, ...updates } : reading
          ),
        }));
      },

      deleteReading: (id) => {
        set((state) => ({
          readings: state.readings.filter((reading) => reading.id !== id),
        }));
      },

      setTimeRange: (range) => {
        set({ selectedRange: range });
      },

      getReadingsByRange: (range) => {
        const { readings } = get();
        if (!range) return readings;
        
        return readings.filter(
          (reading) =>
            new Date(reading.timestamp) >= new Date(range.start) &&
            new Date(reading.timestamp) <= new Date(range.end)
        );
      },

      getStatistics: () => {
        const { readings, selectedRange } = get();
        const filteredReadings = get().getReadingsByRange(selectedRange);
        
        if (filteredReadings.length === 0) {
          return {
            averageSystolic: 0,
            averageDiastolic: 0,
            readingsCount: 0,
            latestCategory: 'normal',
          };
        }

        const totalSystolic = filteredReadings.reduce(
          (sum, reading) => sum + reading.systolic,
          0
        );
        const totalDiastolic = filteredReadings.reduce(
          (sum, reading) => sum + reading.diastolic,
          0
        );

        const latestReading = filteredReadings[0];
        const latestCategory = analyzeBP(
          latestReading.systolic,
          latestReading.diastolic
        );

        return {
          averageSystolic: Math.round(totalSystolic / filteredReadings.length),
          averageDiastolic: Math.round(totalDiastolic / filteredReadings.length),
          readingsCount: filteredReadings.length,
          latestCategory,
          latestReading,
        };
      },

      clearAllReadings: () => {
        set({ readings: [] });
      },

      exportData: () => {
        const { readings } = get();
        const dataStr = JSON.stringify(readings, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `bp-readings-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      },

      importData: (data) => {
        try {
          const parsedData = Array.isArray(data) ? data : JSON.parse(data);
          // Validate imported data
          const validReadings = parsedData.filter(reading => 
            reading.systolic && reading.diastolic && reading.timestamp
          );
          
          set((state) => ({
            readings: [...validReadings, ...state.readings]
          }));
          
          return { success: true, count: validReadings.length };
        } catch (error) {
          return { success: false, error: 'Invalid data format' };
        }
      }
    }),
    {
      name: 'bp-storage',
      getStorage: () => localStorage,
    }
  )
);

export default useBPStore;