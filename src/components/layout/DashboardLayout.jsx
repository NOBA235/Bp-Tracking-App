import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import photo from "../../assets/dad.jpg";
import {
  FaHeartbeat,
  FaHistory,
  FaChartBar,
  FaCog,
  FaBars,
  FaChevronRight,
  FaUser,
  FaSignOutAlt,
  FaHome,
  FaClock,
  FaChartLine,
  FaSlidersH
} from 'react-icons/fa';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <FaHome className="text-lg" /> },
    { path: '/history', label: 'History', icon: <FaHistory className="text-lg" /> },
    { path: '/analysis', label: 'Analysis', icon: <FaChartLine className="text-lg" /> },
    { path: '/settings', label: 'Settings', icon: <FaSlidersH className="text-lg" /> },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-inter">
      
      {/* Mobile Top Bar - Matching your design */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#e5e7eb] px-4 py-3 flex items-center justify-between lg:hidden shadow-[0_6px_16px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center">
            <FaHeartbeat className="text-white text-sm" />
          </div>
          <div>
            <h1 className="font-bold text-[#0f172a] text-sm">Aier Family BP</h1>
            <p className="text-[#94a3b8] text-xs">Health Monitoring</p>
          </div>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="text-[#475569] text-xl p-2 hover:bg-[#f1f5f9] rounded-lg transition-colors"
        >
          <FaBars />
        </button>
      </div>

      {/* Sidebar - Updated to match your design tokens */}
      <aside
        className={`fixed lg:static z-40 top-0 left-0 h-full w-72 bg-white border-r border-[#e5e7eb] transform transition-transform duration-300 ease-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:w-64 shadow-[0_6px_16px_rgba(0,0,0,0.05)]`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#2563eb] flex items-center justify-center">
              <FaHeartbeat className="text-white text-lg" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-[#0f172a]">BP Tracker</h1>
              <p className="text-[#94a3b8] text-xs mt-0.5">Built by Noba • © 2026</p>
            </div>
          </div>

          {/* Patient Profile - Matching your avatar style */}
          <div className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-xl border border-[#e5e7eb]">
            <div className="patient-image">
              <img src={photo} alt="Dad" className="pho rounded-full" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm text-[#0f172a]">Father</p>
              <p className="text-xs text-[#94a3b8]">Patient Profile</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#10b981] text-white text-xs font-medium rounded-full">
                  Active
                </span>
              </div>
            </div>
            <FaChevronRight className="text-[#94a3b8] text-sm" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3">
          {navItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all duration-200
                ${
                  active
                    ? 'bg-[#2563eb] text-white shadow-sm'
                    : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                }`}
              >
                <span className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
                  {item.icon}
                </span>
                <span className="font-medium text-sm">{item.label}</span>
                {active && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[#e5e7eb]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#475569]">v2.1.0</p>
              <p className="text-xs text-[#94a3b8] mt-0.5">Health Monitoring System</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-[#f1f5f9] rounded-lg transition-colors">
                <FaCog className="text-[#475569] text-sm" />
              </button>
              <button className="p-2 hover:bg-[#f1f5f9] rounded-lg transition-colors">
                <FaSignOutAlt className="text-[#475569] text-sm" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay (mobile) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 pt-16 lg:pt-0 lg:ml-64 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between mb-8">
            <div>
              <h1 className="font-bold text-2xl text-[#0f172a]">Dashboard</h1>
              <p className="text-[#475569] mt-1">Welcome to your health monitoring dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                  <img src={photo} alt="Dad" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#10b981] rounded-full border border-white"></div>
              </div>
            </div>
          </div>

          {/* Content Container */}
          <div className="bg-white rounded-[14px] border border-[#e5e7eb] shadow-[0_6px_16px_rgba(0,0,0,0.05)] overflow-hidden">
            {children}
          </div>

          {/* Footer Note */}
          <div className="mt-6 text-center text-sm text-[#94a3b8]">
            <p>Data is updated in real-time • Last sync: Just now</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;