import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { generatePDFInvoice } from '../utils/exportUtils';
import { Receipt, FileText, Download, Plus, DollarSign, ShieldCheck } from 'lucide-react';

export default function Billing() {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '', consultationFee: 150, bedCharge: 800, labCharge: 250, pharmacyCharge: 120, discount: 50, insuranceClaimStatus: 'Pending Verification', status: 'PENDING'
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([api.getBilling(), api.getPatients()])
      .then(([b, p]) => {
        setBills(b);
        setPatients(p);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBill = async (e) => {
    e.preventDefault();
    try {
      const selectedPt = patients.find(p => String(p.id) === String(formData.patientId));
      await api.createBill({
        ...formData,
        patientName: selectedPt ? selectedPt.name : 'Patient'
      });
      setShowModal(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Billing & Financial Invoicing</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Patient invoices, insurance claim tracking, and PDF receipts.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Generate Invoice
        </button>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--primary-cyan)' }}>Loading Invoices...</div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Patient Name</th>
                <th>Subtotal (₹)</th>
                <th>Discount (₹)</th>
                <th>Total Paid/Due (₹)</th>
                <th>Insurance Claim Status</th>
                <th>Payment Status</th>
                <th>PDF Export</th>
              </tr>
            </thead>
            <tbody>
              {bills.map(bill => (
                <tr key={bill.id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary-cyan)' }}>{bill.invoiceNumber}</td>
                  <td style={{ fontWeight: 600 }}>{bill.patientName}</td>
                  <td>₹{(bill.subtotal || bill.totalAmount).toLocaleString('en-IN')}</td>
                  <td style={{ color: '#FCA5A5' }}>-₹{(bill.discount || 0).toLocaleString('en-IN')}</td>
                  <td style={{ fontWeight: 800, fontSize: '1rem', color: '#10B981' }}>₹{bill.totalAmount.toLocaleString('en-IN')}</td>
                  <td><span className="badge badge-purple">{bill.insuranceClaimStatus}</span></td>
                  <td>
                    <span className={`badge ${bill.status === 'PAID' ? 'badge-green' : 'badge-yellow'}`}>
                      {bill.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => generatePDFInvoice(bill)}>
                      <Download size={14} /> PDF Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Invoice Creation Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '16px' }}>Generate Itemized Patient Invoice</h3>
            <form onSubmit={handleCreateBill} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select Patient</label>
                <select className="input-field" required value={formData.patientId} onChange={e => setFormData({...formData, patientId: e.target.value})}>
                  <option value="">-- Select Patient --</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.patientId})</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Consultation Fee (₹)</label>
                  <input type="number" required className="input-field" value={formData.consultationFee} onChange={e => setFormData({...formData, consultationFee: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bed / Ward Care (₹)</label>
                  <input type="number" required className="input-field" value={formData.bedCharge} onChange={e => setFormData({...formData, bedCharge: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lab Diagnostics (₹)</label>
                  <input type="number" required className="input-field" value={formData.labCharge} onChange={e => setFormData({...formData, labCharge: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pharmacy Dispensed (₹)</label>
                  <input type="number" required className="input-field" value={formData.pharmacyCharge} onChange={e => setFormData({...formData, pharmacyCharge: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Discount / Subsidy (₹)</label>
                  <input type="number" className="input-field" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Payment Status</label>
                  <select className="input-field" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="PAID">PAID</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Generate Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
