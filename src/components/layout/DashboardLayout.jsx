import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import photo from "../../assets/dad.jpg";

import {
  FaHeartbeat,
  FaHistory,
  FaChartBar,
  FaCog,
  FaBars
} from 'react-icons/fa';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <FaHeartbeat /> },
    { path: '/history', label: 'History', icon: <FaHistory /> },
    { path: '/analysis', label: 'Analysis', icon: <FaChartBar /> },
    { path: '/settings', label: 'Settings', icon: <FaCog /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* Mobile Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b px-4 py-3 flex items-center justify-between lg:hidden">
        <h1 className="font-semibold text-blue-600 flex items-center gap-2">
          <FaHeartbeat /> BP Tracker
        </h1>
        <button
          onClick={() => setOpen(!open)}
          className="text-gray-600 text-xl"
        >
          <FaBars />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-50 top-0 left-0 h-full w-64 bg-white border-r shadow-sm transform transition-transform
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0`}
      >
        <div className="p-6 border-b">
          <h1 className="text-lg font-bold text-blue-600 flex items-center gap-2">
            <FaHeartbeat />
            Aier Family BP
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Health Monitoring System
          </p>

          <div className="flex items-center gap-3 mt-4">
            <div className="patient-image">
              <img src={photo} alt="Dad" className="pho" />
            </div>
            <div>
              <p className="font-medium text-sm">Father</p>
              <p className="text-xs text-gray-500">Patient Profile</p>
            </div>
          </div>
        </div>

        <nav className="mt-4">
          {navItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all
                ${
                  active
                    ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                    : 'text-gray-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Overlay (mobile) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* Main Content */}
      <main className="flex-1 pt-16 lg:pt-0 p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
