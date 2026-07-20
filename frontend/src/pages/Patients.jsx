import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { exportToCSV } from '../utils/exportUtils';
import Pagination from '../components/Pagination';
import FileUploadModal from '../components/FileUploadModal';
import { Search, Plus, Download, Eye, Trash2, ShieldAlert, Upload, FileText, ExternalLink } from 'lucide-react';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [filterTriage, setFilterTriage] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Selected Patient for EMR Detail View
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // File Upload State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTargetPatient, setUploadTargetPatient] = useState(null);

  // New Patient Form state
  const [showNewModal, setShowNewModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', age: '', gender: 'Male', bloodGroup: 'O+', phone: '', address: '', allergies: '', medicalHistory: '', triageLevel: 'GREEN'
  });

  const loadPatients = () => {
    setLoading(true);
    fetch(`/api/patients?page=${page}&limit=7&search=${search}&triageLevel=${filterTriage}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('medpulse_token')}` }
    })
      .then(res => res.json())
      .then(res => {
        if (res.data) {
          setPatients(res.data);
          setTotalPages(res.pagination.totalPages);
        } else {
          setPatients(res);
        }
      })
      .catch(err => console.error('Error loading patients:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPatients();
  }, [page, search, filterTriage]);

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    try {
      await api.createPatient(formData);
      setShowNewModal(false);
      setFormData({ name: '', age: '', gender: 'Male', bloodGroup: 'O+', phone: '', address: '', allergies: '', medicalHistory: '', triageLevel: 'GREEN' });
      loadPatients();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleViewPatient = async (id) => {
    try {
      const fullData = await api.getPatientById(id);
      setSelectedPatient(fullData);
      setShowModal(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm('Are you sure you want to archive this patient record? (Admin only)')) return;
    try {
      await api.deletePatient(id);
      loadPatients();
    } catch (err) {
      alert(err.message);
    }
  };

  const getTriageBadge = (level) => {
    if (level === 'RED') return <span className="badge badge-red"><ShieldAlert size={12}/> Critical Red</span>;
    if (level === 'YELLOW') return <span className="badge badge-yellow">Urgent Yellow</span>;
    return <span className="badge badge-green">Standard Green</span>;
  };

  return (
    <div>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Electronic Medical Records (EMR)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Comprehensive patient clinical directory & intake desk.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={() => exportToCSV('Patient_Registry', patients)}>
            <Download size={16} /> Export CSV
          </button>
          <button className="btn-primary" onClick={() => setShowNewModal(true)}>
            <Plus size={18} /> Register Patient
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by Patient Name or ID (e.g. PT-1001)..." 
            className="input-field" 
            style={{ paddingLeft: '40px' }}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select 
          className="input-field" 
          style={{ width: '180px' }}
          value={filterTriage}
          onChange={(e) => { setFilterTriage(e.target.value); setPage(1); }}
        >
          <option value="">All Triage Levels</option>
          <option value="RED">RED (Critical)</option>
          <option value="YELLOW">YELLOW (Urgent)</option>
          <option value="GREEN">GREEN (Standard)</option>
        </select>
      </div>

      {/* Patient Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--primary-cyan)' }}>Loading Clinical Records...</div>
        ) : (
          <>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Patient Name</th>
                  <th>Age / Gender</th>
                  <th>Blood Group</th>
                  <th>Triage Priority</th>
                  <th>Clinical Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>No patient records found.</td></tr>
                ) : (
                  patients.map(pt => (
                    <tr key={pt.id}>
                      <td style={{ fontWeight: 700, color: 'var(--primary-cyan)' }}>{pt.patientId}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{pt.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pt.phone}</div>
                      </td>
                      <td>{pt.age} yrs • {pt.gender}</td>
                      <td><span className="badge badge-purple">{pt.bloodGroup}</span></td>
                      <td>{getTriageBadge(pt.triageLevel)}</td>
                      <td>
                        <span className={`badge ${pt.status === 'Admitted' ? 'badge-red' : 'badge-blue'}`}>
                          {pt.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn-secondary" style={{ padding: '6px 10px' }} onClick={() => handleViewPatient(pt.id)}>
                            <Eye size={14} /> Profile
                          </button>
                          <button className="btn-secondary" style={{ padding: '6px 10px', color: 'var(--primary-cyan)' }} onClick={() => { setUploadTargetPatient(pt); setShowUploadModal(true); }}>
                            <Upload size={14} /> Upload
                          </button>
                          <button className="btn-secondary" style={{ padding: '6px 10px', color: '#EF4444' }} onClick={() => handleDeletePatient(pt.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* Detailed EMR Profile Modal */}
      {showModal && selectedPatient && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <span className="badge badge-blue">{selectedPatient.patientId}</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>{selectedPatient.name}</h3>
              </div>
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Close</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Demographics & Vitals</div>
                <div style={{ marginTop: '4px', fontSize: '0.9rem' }}>
                  <strong>{selectedPatient.age} yrs</strong> | {selectedPatient.gender} | <strong>{selectedPatient.bloodGroup}</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Phone: {selectedPatient.phone}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Known Allergies & History</div>
                <div style={{ color: '#FCA5A5', fontWeight: 600, fontSize: '0.85rem' }}>{selectedPatient.allergies || 'None recorded'}</div>
                <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>{selectedPatient.medicalHistory}</div>
              </div>
            </div>

            {/* Prescriptions */}
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px', color: 'var(--primary-cyan)' }}>Issued Prescriptions</h4>
            {selectedPatient.prescriptions && selectedPatient.prescriptions.length > 0 ? (
              selectedPatient.prescriptions.map(rx => (
                <div key={rx.id} style={{ background: 'rgba(0, 242, 254, 0.05)', border: '1px solid rgba(0, 242, 254, 0.2)', padding: '12px', borderRadius: '10px', marginBottom: '10px' }}>
                  <div style={{ fontWeight: 700 }}>{rx.prescriptionId} - Diagnosis: {rx.diagnosis}</div>
                  <ul style={{ paddingLeft: '20px', marginTop: '6px', fontSize: '0.85rem' }}>
                    {rx.medicines.map((m, i) => (
                      <li key={i}>{m.name} — <em>{m.dosage}</em> ({m.duration})</li>
                    ))}
                  </ul>
                </div>
              ))
            ) : <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>No active prescriptions.</p>}

            {/* Lab Reports & Documents */}
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px', color: 'var(--accent-emerald)' }}>Lab Diagnostic Results & Scans</h4>
            {selectedPatient.labTests && selectedPatient.labTests.length > 0 ? (
              selectedPatient.labTests.map(lab => (
                <div key={lab.id} style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '10px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700 }}>{lab.testName} ({lab.testCode})</div>
                    {lab.reportFileUrl && (
                      <a href={lab.reportFileUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--primary-cyan)' }}>
                        <ExternalLink size={12} /> View Report PDF/Scan
                      </a>
                    )}
                  </div>
                  <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Result: {lab.result}</div>
                </div>
              ))
            ) : <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No lab test records.</p>}
          </div>
        </div>
      )}

      {/* File Upload Modal (Multer) */}
      {showUploadModal && uploadTargetPatient && (
        <FileUploadModal 
          title={`Upload Medical Document for ${uploadTargetPatient.name}`}
          endpoint="/upload/lab-report"
          extraData={{ patientId: uploadTargetPatient.id }}
          onClose={() => setShowUploadModal(false)}
          onSuccess={(res) => {
            alert(`File ${res.originalName} uploaded successfully!`);
            loadPatients();
          }}
        />
      )}

      {/* New Patient Registration Modal */}
      {showNewModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '16px' }}>New Patient Registration Intake</h3>
            <form onSubmit={handleCreatePatient} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Full Name</label>
                <input type="text" required className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Age</label>
                  <input type="number" required className="input-field" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Gender</label>
                  <select className="input-field" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Blood Group</label>
                  <select className="input-field" value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})}>
                    <option>O+</option><option>A+</option><option>B+</option><option>AB+</option><option>O-</option><option>A-</option><option>AB-</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phone Number (+91 format)</label>
                <input type="text" required className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Triage Priority Level</label>
                <select className="input-field" value={formData.triageLevel} onChange={e => setFormData({...formData, triageLevel: e.target.value})}>
                  <option value="GREEN">GREEN (Standard)</option>
                  <option value="YELLOW">YELLOW (Urgent)</option>
                  <option value="RED">RED (Critical Emergency)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Medical History / Allergies</label>
                <textarea className="input-field" style={{ height: '60px' }} value={formData.medicalHistory} onChange={e => setFormData({...formData, medicalHistory: e.target.value})}></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowNewModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Complete Intake</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
