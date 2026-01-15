import React from 'react';

const StatsCard = ({ title, value, subtitle, icon, trend }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className="text-2xl">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;