import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Calendar, Plus, Clock, CheckCircle2, User, AlertCircle } from 'lucide-react';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '', doctorId: '', date: new Date().toISOString().slice(0, 10), timeSlot: '10:00 AM', reason: '', priority: 'NORMAL'
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([api.getAppointments(), api.getPatients(), api.getDoctors()])
      .then(([apts, pts, docs]) => {
        setAppointments(apts);
        setPatients(pts);
        setDoctors(docs);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    try {
      await api.createAppointment(formData);
      setShowModal(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.updateAppointmentStatus(id, newStatus);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Outpatient Appointments & Queue</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time consultation queue management and slot reservation.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Book Appointment
        </button>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--primary-cyan)' }}>Loading Queue...</div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Patient Name</th>
                <th>Assigned Physician</th>
                <th>Date & Slot</th>
                <th>Consultation Reason</th>
                <th>Priority</th>
                <th>Status / Queue Token</th>
                <th>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(apt => (
                <tr key={apt.id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary-cyan)' }}>{apt.appointmentCode}</td>
                  <td style={{ fontWeight: 600 }}>{apt.patientName}</td>
                  <td>{apt.doctorName}</td>
                  <td>
                    <div>{apt.date}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{apt.timeSlot}</div>
                  </td>
                  <td>{apt.reason}</td>
                  <td>
                    <span className={`badge ${apt.priority === 'HIGH' ? 'badge-red' : 'badge-green'}`}>
                      {apt.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      apt.status === 'In-Consultation' ? 'badge-purple' :
                      apt.status === 'Completed' ? 'badge-green' :
                      apt.status === 'Waiting' ? 'badge-yellow' : 'badge-blue'
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                  <td>
                    <select 
                      className="input-field" 
                      style={{ padding: '4px 8px', fontSize: '0.8rem', width: '130px' }}
                      value={apt.status}
                      onChange={(e) => handleUpdateStatus(apt.id, e.target.value)}
                    >
                      <option value="Waiting">Waiting</option>
                      <option value="In-Consultation">In-Consultation</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '16px' }}>Book Patient Appointment</h3>
            <form onSubmit={handleCreateAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select Patient</label>
                <select className="input-field" required value={formData.patientId} onChange={e => setFormData({...formData, patientId: e.target.value})}>
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.patientId})</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select Physician</label>
                <select className="input-field" required value={formData.doctorId} onChange={e => setFormData({...formData, doctorId: e.target.value})}>
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date</label>
                  <input type="date" required className="input-field" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Time Slot</label>
                  <select className="input-field" value={formData.timeSlot} onChange={e => setFormData({...formData, timeSlot: e.target.value})}>
                    <option>09:00 AM</option><option>10:30 AM</option><option>11:00 AM</option><option>02:00 PM</option><option>04:00 PM</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reason for Visit</label>
                <input type="text" required className="input-field" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
