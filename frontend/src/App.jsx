import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Beds from './pages/Beds';
import Pharmacy from './pages/Pharmacy';
import Lab from './pages/Lab';
import Billing from './pages/Billing';
import Emergency from './pages/Emergency';

function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#070a12', color: '#00F2FE', fontFamily: 'sans-serif' }}>
        <h2>Loading MedPulse Enterprise System...</h2>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard setActiveTab={setActiveTab} />;
      case 'patients': return <Patients />;
      case 'doctors': return <Doctors />;
      case 'appointments': return <Appointments />;
      case 'beds': return <Beds />;
      case 'pharmacy': return <Pharmacy />;
      case 'lab': return <Lab />;
      case 'billing': return <Billing />;
      case 'emergency': return <Emergency />;
      default: return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        <Navbar />
        <main className="page-body">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
