import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Pill, AlertTriangle, FileCheck, Plus } from 'lucide-react';

export default function Pharmacy() {
  const [medicines, setMedicines] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getMedicines(), api.getPrescriptions()])
      .then(([meds, rxs]) => {
        setMedicines(meds);
        setPrescriptions(rxs);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Pharmacy Inventory & E-Prescriptions</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Drug stock tracking, low-stock alerts, and digital prescriptions.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Medicine Inventory */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', color: 'var(--primary-cyan)' }}>
            Medicine Stock Inventory
          </h3>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Drug Name</th>
                <th>Category</th>
                <th>Stock Level</th>
                <th>Unit Price (₹)</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map(med => (
                <tr key={med.id}>
                  <td style={{ fontWeight: 600 }}>{med.name}</td>
                  <td>{med.category}</td>
                  <td>
                    {med.stockQuantity < 100 ? (
                      <span className="badge badge-red"><AlertTriangle size={12}/> Low: {med.stockQuantity}</span>
                    ) : (
                      <span className="badge badge-green">{med.stockQuantity} units</span>
                    )}
                  </td>
                  <td>₹{med.unitPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* E-Prescriptions Stream */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', color: 'var(--accent-purple)' }}>
            Issued E-Prescriptions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {prescriptions.map(rx => (
              <div key={rx.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary-cyan)' }}>{rx.prescriptionId}</span>
                  <span className="badge badge-blue">Dispensed</span>
                </div>
                <div style={{ fontSize: '0.85rem', marginBottom: '4px' }}>Patient: <strong>{rx.patientName}</strong> | Prescribed by: {rx.doctorName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Diagnosis: {rx.diagnosis}</div>
                <div style={{ fontSize: '0.8rem', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px' }}>
                  {rx.medicines.map((m, idx) => (
                    <div key={idx}>• {m.name} ({m.dosage})</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
