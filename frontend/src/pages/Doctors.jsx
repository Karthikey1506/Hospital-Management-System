import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Stethoscope, Calendar, Phone, CheckCircle, ShieldCheck } from 'lucide-react';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('');

  useEffect(() => {
    api.getDoctors()
      .then(res => setDoctors(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = selectedDept ? doctors.filter(d => d.departmentName === selectedDept) : doctors;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Medical Staff & Specialist Directory</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Roster of attending physicians, specialists, and on-call surgeons.</p>
        </div>

        <select 
          className="input-field" 
          style={{ width: '200px' }}
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
        >
          <option value="">All Departments</option>
          <option value="Cardiology">Cardiology</option>
          <option value="Neurology">Neurology</option>
          <option value="Pediatrics">Pediatrics</option>
          <option value="Emergency & Triage">Emergency & Triage</option>
        </select>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--primary-cyan)' }}>Loading Physician Roster...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {filtered.map(doc => (
            <div key={doc.id} className="glass-card glass-card-interactive" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 242, 254, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Stethoscope size={24} color="var(--primary-cyan)" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{doc.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary-cyan)', fontWeight: 600 }}>{doc.specialization}</span>
                  </div>
                </div>
                {doc.onCall ? (
                  <span className="badge badge-red"><span className="pulse-dot red"></span> On-Call</span>
                ) : (
                  <span className="badge badge-green">Regular</span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                <div><strong>Department:</strong> {doc.departmentName}</div>
                <div><strong>License:</strong> {doc.licenseNumber}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> {doc.phone}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {doc.availability}</div>
              </div>

              <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Assigned Patients: <strong>{doc.patientsCount}</strong></span>
                <span className="badge badge-blue">Active</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
