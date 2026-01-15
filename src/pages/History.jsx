import React from 'react';
import { useBP } from '../context/BPContext';
import { format } from 'date-fns';

const History = () => {
  const { readings, deleteReading } = useBP();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">History</h1>
        <p className="text-gray-600">View all your BP readings</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {readings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BP Reading</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pulse</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {readings.map((reading) => (
                  <tr key={reading.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(reading.timestamp), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-red-600">{reading.systolic}</span>
                      /
                      <span className="font-semibold text-blue-600">{reading.diastolic}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {reading.pulse || '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">
                      {reading.condition.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 max-w-xs truncate">
                        {reading.notes || '--'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => deleteReading(reading.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No readings found</p>
            <p className="text-gray-400 mt-2">Start by adding your first BP reading from the Dashboard</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;