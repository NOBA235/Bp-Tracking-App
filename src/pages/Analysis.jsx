import React, { useMemo } from 'react';
import { useBP } from '../context/BPContext';
import { 
  LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart, 
  Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  eachDayOfInterval,
  subDays
} from 'date-fns';
import { FaChartLine, FaHeartbeat, FaCalendarAlt, FaClock } from 'react-icons/fa';

const Analysis = () => {
  const { readings } = useBP();

  // Classify BP readings
  const classifyBP = (systolic, diastolic) => {
    if (systolic < 90 || diastolic < 60) return { category: 'hypotension', color: '#3b82f6', label: 'Low' };
    if (systolic < 120 && diastolic < 80) return { category: 'normal', color: '#10b981', label: 'Normal' };
    if (systolic < 130 && diastolic < 80) return { category: 'elevated', color: '#f59e0b', label: 'Elevated' };
    if (systolic < 140 || diastolic < 90) return { category: 'stage1', color: '#f97316', label: 'Stage 1' };
    return { category: 'stage2', color: '#ef4444', label: 'Stage 2' };
  };

  // Calculate statistics
  const stats = useMemo(() => {
    if (readings.length === 0) {
      return {
        averageBP: { systolic: 0, diastolic: 0 },
        highestBP: { systolic: 0, diastolic: 0 },
        lowestBP: { systolic: 0, diastolic: 0 },
        categoryDistribution: {},
        timeOfDayStats: {},
        weeklyTrends: []
      };
    }

    // Calculate averages, highest, lowest
    const systolicSum = readings.reduce((sum, r) => sum + parseInt(r.systolic), 0);
    const diastolicSum = readings.reduce((sum, r) => sum + parseInt(r.diastolic), 0);
    
    const highestSystolic = Math.max(...readings.map(r => parseInt(r.systolic)));
    const highestDiastolic = Math.max(...readings.map(r => parseInt(r.diastolic)));
    const lowestSystolic = Math.min(...readings.map(r => parseInt(r.systolic)));
    const lowestDiastolic = Math.min(...readings.map(r => parseInt(r.diastolic)));

    // Category distribution
    const categoryDistribution = readings.reduce((acc, reading) => {
      const classification = classifyBP(reading.systolic, reading.diastolic);
      acc[classification.category] = (acc[classification.category] || 0) + 1;
      return acc;
    }, {});

    // Time of day analysis
    const timeOfDayStats = readings.reduce((acc, reading) => {
      const hour = new Date(reading.timestamp).getHours();
      let timeOfDay;
      if (hour >= 5 && hour < 12) timeOfDay = 'Morning';
      else if (hour >= 12 && hour < 17) timeOfDay = 'Afternoon';
      else if (hour >= 17 && hour < 22) timeOfDay = 'Evening';
      else timeOfDay = 'Night';

      if (!acc[timeOfDay]) {
        acc[timeOfDay] = { systolic: 0, diastolic: 0, count: 0 };
      }
      acc[timeOfDay].systolic += parseInt(reading.systolic);
      acc[timeOfDay].diastolic += parseInt(reading.diastolic);
      acc[timeOfDay].count++;
      return acc;
    }, {});

    // Weekly trends (last 7 days)
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });

    const weeklyTrends = last7Days.map(day => {
      const dayReadings = readings.filter(r => 
        format(new Date(r.timestamp), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      
      if (dayReadings.length === 0) {
        return {
          date: format(day, 'MMM dd'),
          systolic: null,
          diastolic: null,
          count: 0
        };
      }

      const avgSystolic = Math.round(
        dayReadings.reduce((sum, r) => sum + parseInt(r.systolic), 0) / dayReadings.length
      );
      const avgDiastolic = Math.round(
        dayReadings.reduce((sum, r) => sum + parseInt(r.diastolic), 0) / dayReadings.length
      );

      return {
        date: format(day, 'MMM dd'),
        systolic: avgSystolic,
        diastolic: avgDiastolic,
        count: dayReadings.length
      };
    });

    return {
      averageBP: {
        systolic: Math.round(systolicSum / readings.length),
        diastolic: Math.round(diastolicSum / readings.length)
      },
      highestBP: { systolic: highestSystolic, diastolic: highestDiastolic },
      lowestBP: { systolic: lowestSystolic, diastolic: lowestDiastolic },
      categoryDistribution,
      timeOfDayStats,
      weeklyTrends
    };
  }, [readings]);

  // Prepare data for charts
  const categoryData = Object.entries(stats.categoryDistribution).map(([category, count]) => {
    const colors = {
      normal: '#10b981',
      elevated: '#f59e0b',
      stage1: '#f97316',
      stage2: '#ef4444',
      hypotension: '#3b82f6'
    };
    const labels = {
      normal: 'Normal',
      elevated: 'Elevated',
      stage1: 'Stage 1',
      stage2: 'Stage 2',
      hypotension: 'Low'
    };
    
    return {
      name: labels[category] || category,
      value: count,
      color: colors[category] || '#6b7280'
    };
  });

  const timeOfDayData = Object.entries(stats.timeOfDayStats).map(([time, data]) => ({
    time,
    avgSystolic: data.count ? Math.round(data.systolic / data.count) : 0,
    avgDiastolic: data.count ? Math.round(data.diastolic / data.count) : 0,
    count: data.count
  }));

  // Calculate health insights
  const insights = useMemo(() => {
    const insightsList = [];
    
    if (readings.length === 0) return insightsList;

    // Insight 1: Overall status
    const normalCount = stats.categoryDistribution.normal || 0;
    const abnormalCount = readings.length - normalCount;
    const normalPercentage = (normalCount / readings.length) * 100;

    if (normalPercentage >= 70) {
      insightsList.push({
        type: 'good',
        title: 'Good Control',
        message: `${Math.round(normalPercentage)}% of your readings are in the normal range. Keep it up!`,
        icon: '👍'
      });
    } else if (normalPercentage >= 50) {
      insightsList.push({
        type: 'warning',
        title: 'Moderate Control',
        message: `${Math.round(normalPercentage)}% of readings are normal. Consider lifestyle adjustments.`,
        icon: '⚠️'
      });
    } else {
      insightsList.push({
        type: 'alert',
        title: 'Needs Attention',
        message: `Only ${Math.round(normalPercentage)}% of readings are normal. Please consult your doctor.`,
        icon: '🚨'
      });
    }

    // Insight 2: Time of day variations
    if (timeOfDayData.length > 1) {
      const variations = timeOfDayData.map(t => t.avgSystolic);
      const maxVariation = Math.max(...variations) - Math.min(...variations);
      
      if (maxVariation > 20) {
        insightsList.push({
          type: 'info',
          title: 'High Daily Variation',
          message: 'Your BP varies significantly throughout the day. Monitor patterns closely.',
          icon: '📊'
        });
      }
    }

    // Insight 3: Recent trend
    if (stats.weeklyTrends.length >= 3) {
      const recentTrends = stats.weeklyTrends.filter(t => t.systolic !== null).slice(-3);
      if (recentTrends.length >= 3) {
        const trend = recentTrends[2].systolic - recentTrends[0].systolic;
        if (trend > 10) {
          insightsList.push({
            type: 'warning',
            title: 'Increasing Trend',
            message: 'Your BP shows an upward trend in recent days.',
            icon: '📈'
          });
        } else if (trend < -10) {
          insightsList.push({
            type: 'good',
            title: 'Improving Trend',
            message: 'Your BP shows improvement in recent days.',
            icon: '📉'
          });
        }
      }
    }

    return insightsList;
  }, [readings, stats, timeOfDayData]);

  if (readings.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">BP Analysis</h1>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FaChartLine className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Data Available</h3>
          <p className="text-gray-500 mb-4">Add some BP readings to see analysis and insights</p>
          <a href="/" className="text-blue-600 hover:text-blue-800 font-medium">
            Go to Dashboard to add readings →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">BP Analysis & Insights</h1>
      <p className="text-gray-600 mb-6">Detailed analysis of your blood pressure patterns and trends</p>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaHeartbeat className="text-blue-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Average BP</h3>
              <p className="text-2xl font-bold text-gray-900">
                {stats.averageBP.systolic}/{stats.averageBP.diastolic}
                <span className="text-sm font-normal text-gray-500 ml-2">mmHg</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <FaChartLine className="text-red-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Highest Recorded</h3>
              <p className="text-2xl font-bold text-gray-900">
                {stats.highestBP.systolic}/{stats.highestBP.diastolic}
                <span className="text-sm font-normal text-gray-500 ml-2">mmHg</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaCalendarAlt className="text-green-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Total Readings</h3>
              <p className="text-2xl font-bold text-gray-900">
                {readings.length}
                <span className="text-sm font-normal text-gray-500 ml-2">entries</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Trend Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-4">Weekly Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'mmHg', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="systolic" 
                  name="Systolic" 
                  stroke="#ef4444" 
                  fill="#fecaca" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="diastolic" 
                  name="Diastolic" 
                  stroke="#3b82f6" 
                  fill="#93c5fd" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BP Category Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-4">BP Category Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} readings`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {categoryData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Time of Day Analysis */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-4">Time of Day Analysis</h3>
          <div className="flex items-center gap-2 mb-4 text-gray-600">
            <FaClock />
            <span>Average BP by time of day</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeOfDayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" />
                <YAxis label={{ value: 'mmHg', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value} mmHg`, 'Average']} />
                <Legend />
                <Bar dataKey="avgSystolic" name="Systolic" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgDiastolic" name="Diastolic" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Based on {timeOfDayData.reduce((sum, t) => sum + t.count, 0)} readings
          </div>
        </div>

        {/* Daily Readings Count */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-4">Daily Readings Frequency</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="count" 
                  name="Readings per day" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Number of readings taken each day
          </div>
        </div>
      </div>

      {/* Health Insights */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Health Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg ${
                insight.type === 'good' ? 'bg-green-50 border border-green-200' :
                insight.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                insight.type === 'alert' ? 'bg-red-50 border border-red-200' :
                'bg-blue-50 border border-blue-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{insight.icon}</span>
                <div>
                  <h4 className="font-semibold mb-1">{insight.title}</h4>
                  <p className="text-sm text-gray-600">{insight.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-lg mb-4">Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Based on your data:</h4>
            <ul className="space-y-2">
              {stats.averageBP.systolic > 130 && (
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Consider reducing sodium intake in your diet</span>
                </li>
              )}
              {timeOfDayData.some(t => t.time === 'Evening' && t.avgSystolic > 130) && (
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Evening readings are higher - monitor evening activities</span>
                </li>
              )}
              {readings.length < 7 && (
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Take readings more consistently for better analysis</span>
                </li>
              )}
              {stats.categoryDistribution.normal && (stats.categoryDistribution.normal / readings.length) > 0.7 && (
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Excellent control - maintain your current routine</span>
                </li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">General Tips:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Take readings at the same time each day for consistency</li>
              <li>• Rest for 5 minutes before taking a reading</li>
              <li>• Avoid caffeine and exercise 30 minutes before measurement</li>
              <li>• Keep a log of any symptoms with your readings</li>
              <li>• Share this data with your healthcare provider regularly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;