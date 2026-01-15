import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import photo from "../../assets/dad.jpg";

import { 
  FaHeartbeat, 
  FaHistory, 
  FaChartBar, 
  FaCog 
} from 'react-icons/fa';

const DashboardLayout = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <FaHeartbeat /> },
    { path: '/history', label: 'History', icon: <FaHistory /> },
    { path: '/analysis', label: 'Analysis', icon: <FaChartBar /> },
    { path: '/settings', label: 'Settings', icon: <FaCog /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex ">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <FaHeartbeat />Aier family BP Tracker
          </h1>
          <p className="text-gray-500 text-sm mt-2">Health Monitoring System for Father</p>
         <div className='patient-image'>
          <img src={photo} className="pho" alt="Dad" />
    </div>
        </div>
        
        <nav className="mt-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-6 py-3 text-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;