import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Activity, Truck, PhoneCall, Radio, CheckCircle } from 'lucide-react';

export default function Emergency() {
  const [ambulances, setAmbulances] = useState([
    { id: 'AMB-01', driver: 'Unit 1 (Paramedic Dave)', status: 'EN ROUTE TO ER', eta: '4 mins', patient: 'Trauma Case (Red Code)' },
    { id: 'AMB-02', driver: 'Unit 2 (Paramedic Sarah)', status: 'STANDBY', eta: 'Ready', patient: 'None' },
    { id: 'AMB-03', driver: 'Unit 3 (Paramedic Mike)', status: 'DISPATCHED', eta: '12 mins', patient: 'Cardiac Arrest' }
  ]);

  const dispatchAmbulance = (id) => {
    setAmbulances(prev => prev.map(a => a.id === id ? { ...a, status: 'DISPATCHED', eta: '10 mins' } : a));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#EF4444' }}>Emergency Triage & Dispatch Desk</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Live critical triage monitoring, trauma bay status, and fleet dispatch.</p>
        </div>
      </div>

      {/* Triage Code Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' }}>
        <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FCA5A5' }}>RED CODE (CRITICAL)</span>
            <ShieldAlert size={24} color="#EF4444" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FCA5A5' }}>1 Patient</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Immediate Resuscitation Required</div>
        </div>

        <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FDE047' }}>YELLOW CODE (URGENT)</span>
            <AlertTriangle size={24} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FDE047' }}>1 Patient</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Severe Care within 30 mins</div>
        </div>

        <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6EE7B7' }}>GREEN CODE (STABLE)</span>
            <Activity size={24} color="#10B981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#6EE7B7' }}>2 Patients</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Minor Injuries / Triage Complete</div>
        </div>
      </div>

      {/* Ambulance Dispatch Fleet Tracker */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Truck size={22} color="var(--primary-cyan)" /> Ambulance Mobile Fleet Tracker
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {ambulances.map(amb => (
            <div key={amb.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 800, color: 'var(--primary-cyan)' }}>{amb.id}</span>
                <span className={`badge ${amb.status === 'EN ROUTE TO ER' ? 'badge-red' : amb.status === 'STANDBY' ? 'badge-green' : 'badge-yellow'}`}>
                  {amb.status}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{amb.driver}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Case: {amb.patient}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>ETA: <strong>{amb.eta}</strong></span>
                {amb.status === 'STANDBY' && (
                  <button className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => dispatchAmbulance(amb.id)}>
                    <Radio size={12} /> Dispatch Emergency
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
