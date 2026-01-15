import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import DashboardLayout from './components/layout/DashboardLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import History from './pages/History.jsx'
import Analysis from './pages/Analysis.jsx'
import Settings from './pages/Settings.jsx'
import './App.css'

function App() {
  return (
    <Router>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </DashboardLayout>
    </Router>
  )
}

export default App