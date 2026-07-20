import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BedDouble, UserPlus, LogOut, Wrench, Sparkles, CheckCircle } from 'lucide-react';

export default function Beds() {
  const [beds, setBeds] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedBed, setSelectedBed] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');

  const loadBeds = () => {
    setLoading(true);
    Promise.all([api.getBeds(), api.getPatients()])
      .then(([b, p]) => {
        setBeds(b);
        setPatients(p);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBeds();
  }, []);

  const handleStatusChange = async (bedId, status, patientId = null) => {
    try {
      await api.updateBedStatus(bedId, status, patientId);
      setShowAssignModal(false);
      loadBeds();
    } catch (err) {
      alert(err.message);
    }
  };

  const wards = ['ICU', 'Private Suite', 'General Ward', 'Emergency Triage'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Inpatient Ward & Bed Allocation</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time visual bed matrix across ICU, Suites, and General Wards.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--primary-cyan)' }}>Loading Bed Matrix...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {wards.map(ward => {
            const wardBeds = beds.filter(b => b.wardType === ward);
            return (
              <div key={ward} className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-cyan)' }}>{ward}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Occupied: {wardBeds.filter(b => b.status === 'OCCUPIED').length} / {wardBeds.length}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                  {wardBeds.map(bed => {
                    const isOccupied = bed.status === 'OCCUPIED';
                    const isCleaning = bed.status === 'CLEANING';
                    const isMaint = bed.status === 'MAINTENANCE';

                    return (
                      <div 
                        key={bed.id}
                        style={{
                          background: isOccupied ? 'rgba(239, 68, 68, 0.08)' : isCleaning ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                          border: `1px solid ${isOccupied ? 'rgba(239, 68, 68, 0.3)' : isCleaning ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                          borderRadius: '14px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{bed.bedNumber}</span>
                          <span className={`badge ${isOccupied ? 'badge-red' : isCleaning ? 'badge-yellow' : 'badge-green'}`}>
                            {bed.status}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', minHeight: '36px' }}>
                          {isOccupied ? (
                            <div>Occupied by: <strong>{bed.patientName || 'Admitted Patient'}</strong></div>
                          ) : (
                            <div>Rate: <strong>₹{bed.dailyRate}/day</strong></div>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                          {!isOccupied ? (
                            <button 
                              className="btn-primary" 
                              style={{ padding: '6px 10px', fontSize: '0.75rem', width: '100%' }}
                              onClick={() => { setSelectedBed(bed); setShowAssignModal(true); }}
                            >
                              <UserPlus size={14} /> Assign Patient
                            </button>
                          ) : (
                            <button 
                              className="btn-secondary" 
                              style={{ padding: '6px 10px', fontSize: '0.75rem', width: '100%', color: '#FCA5A5' }}
                              onClick={() => handleStatusChange(bed.id, 'AVAILABLE')}
                            >
                              <LogOut size={14} /> Discharge & Release
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bed Assignment Modal */}
      {showAssignModal && selectedBed && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '16px' }}>
              Assign Bed ({selectedBed.bedNumber} - {selectedBed.wardType})
            </h3>
            <div style={{ marginBottom: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Select an admitted or triage patient to occupy this bed.
            </div>
            <select 
              className="input-field" 
              style={{ marginBottom: '20px' }}
              value={selectedPatientId} 
              onChange={e => setSelectedPatientId(e.target.value)}
            >
              <option value="">-- Choose Patient --</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.patientId}) - Triage: {p.triageLevel}</option>)}
            </select>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
              <button 
                className="btn-primary" 
                onClick={() => handleStatusChange(selectedBed.id, 'OCCUPIED', selectedPatientId)}
              >
                Confirm Allocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
