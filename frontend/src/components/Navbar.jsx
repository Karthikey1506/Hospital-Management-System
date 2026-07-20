import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, ShieldCheck, Stethoscope, ClipboardList, Menu } from 'lucide-react';

export default function Navbar({ setMobileOpen }) {
  const { user, demoLogin } = useAuth();

  return (
    <header style={{
      height: '70px',
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand & Mobile Hamburger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          className="mobile-toggle-btn"
          style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'none' }}
          onClick={() => setMobileOpen(prev => !prev)}
        >
          <Menu size={24} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 242, 254, 0.4)'
          }}>
            <Activity size={22} color="#070a12" strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }} className="gradient-text">
              MedPulse Care
            </h1>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Enterprise Hospital System
            </span>
          </div>
        </div>
      </div>

      {/* Role Switcher & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '4px',
          display: 'flex',
          gap: '4px'
        }}>
          <button
            onClick={() => demoLogin('admin@hospital.com', 'admin123')}
            style={{
              background: user?.role === 'ADMIN' ? 'var(--primary-cyan)' : 'transparent',
              color: user?.role === 'ADMIN' ? '#070a12' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 10px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <ShieldCheck size={14} /> Admin
          </button>

          <button
            onClick={() => demoLogin('doctor@hospital.com', 'doctor123')}
            style={{
              background: user?.role === 'DOCTOR' ? 'var(--primary-cyan)' : 'transparent',
              color: user?.role === 'DOCTOR' ? '#070a12' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 10px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Stethoscope size={14} /> Doctor
          </button>

          <button
            onClick={() => demoLogin('reception@hospital.com', 'reception123')}
            style={{
              background: user?.role === 'RECEPTIONIST' ? 'var(--primary-cyan)' : 'transparent',
              color: user?.role === 'RECEPTIONIST' ? '#070a12' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 10px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <ClipboardList size={14} /> Receptionist
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          paddingLeft: '12px',
          borderLeft: '1px solid var(--border-color)'
        }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name || 'Dr. Ananya Sharma'}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Role: <span style={{ color: 'var(--primary-cyan)' }}>{user?.role || 'ADMIN'}</span></div>
          </div>
        </div>
      </div>
    </header>
  );
}
