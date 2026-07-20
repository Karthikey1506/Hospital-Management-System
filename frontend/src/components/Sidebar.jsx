import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Calendar, 
  BedDouble, 
  Pill, 
  TestTube, 
  Receipt, 
  AlertTriangle,
  Shield,
  X
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patient EMR', icon: Users },
    { id: 'doctors', label: 'Doctor Directory', icon: UserCheck },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'beds', label: 'Bed & Ward Grid', icon: BedDouble },
    { id: 'pharmacy', label: 'Pharmacy & Stock', icon: Pill },
    { id: 'lab', label: 'Diagnostics & Lab', icon: TestTube },
    { id: 'billing', label: 'Billing & Invoices', icon: Receipt },
    { id: 'emergency', label: 'Emergency Triage', icon: AlertTriangle },
    { id: 'audit', label: 'System Audit Logs', icon: Shield }
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)} 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 999
          }} 
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`} style={{
        width: '260px',
        background: 'rgba(11, 15, 25, 0.98)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        gap: '8px',
        zIndex: 1000,
        transition: 'transform 0.3s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 12px 16px 12px', borderBottom: '1px solid var(--border-color)', marginBottom: '8px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Hospital Modules
          </div>
          {mobileOpen && (
            <button className="btn-secondary" style={{ padding: '4px' }} onClick={() => setMobileOpen(false)}>
              <X size={16} />
            </button>
          )}
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setMobileOpen && setMobileOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                background: isActive ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.15) 0%, rgba(79, 172, 254, 0.1) 100%)' : 'transparent',
                color: isActive ? 'var(--primary-cyan)' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                borderLeft: isActive ? '3px solid var(--primary-cyan)' : '3px solid transparent'
              }}
            >
              <Icon size={18} color={isActive ? 'var(--primary-cyan)' : 'var(--text-muted)'} />
              {item.label}
            </button>
          );
        })}

        <div style={{ marginTop: 'auto', padding: '16px 12px 0 12px', borderTop: '1px solid var(--border-color)' }}>
          <a 
            href="/api-docs" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ fontSize: '0.75rem', color: 'var(--primary-cyan)', textDecoration: 'none', display: 'block', marginBottom: '4px' }}
          >
            📄 OpenAPI Docs (/api-docs)
          </a>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            DB Status: <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>SQL Relational Active</span>
          </div>
        </div>
      </aside>
    </>
  );
}
