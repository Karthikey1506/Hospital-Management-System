import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import FileUploadModal from '../components/FileUploadModal';
import { TestTube, FileText, CheckCircle, Clock, Upload, ExternalLink } from 'lucide-react';

export default function Lab() {
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  const loadLabTests = () => {
    setLoading(true);
    api.getLabTests()
      .then(res => setLabTests(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLabTests();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Diagnostics & Pathology Lab</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Laboratory diagnostic order queue, report upload & pathology test results.</p>
        </div>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--primary-cyan)' }}>Loading Lab Orders...</div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Test Code</th>
                <th>Patient Name</th>
                <th>Diagnostic Test</th>
                <th>Category</th>
                <th>Cost (₹)</th>
                <th>Status</th>
                <th>Report File</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {labTests.map(test => (
                <tr key={test.id}>
                  <td style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>{test.testCode}</td>
                  <td style={{ fontWeight: 600 }}>{test.patientName}</td>
                  <td>{test.testName}</td>
                  <td><span className="badge badge-purple">{test.category}</span></td>
                  <td>₹{test.cost}</td>
                  <td>
                    <span className={`badge ${test.status === 'Completed' ? 'badge-green' : 'badge-yellow'}`}>
                      {test.status}
                    </span>
                  </td>
                  <td>
                    {test.reportFileUrl ? (
                      <a href={test.reportFileUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-cyan)', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <ExternalLink size={12} /> Signed PDF
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Pending Upload</span>
                    )}
                  </td>
                  <td>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={() => { setSelectedTest(test); setShowUploadModal(true); }}
                    >
                      <Upload size={12} /> Upload PDF/Scan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showUploadModal && selectedTest && (
        <FileUploadModal 
          title={`Upload Report for ${selectedTest.testName} (${selectedTest.testCode})`}
          endpoint="/upload/lab-report"
          extraData={{ labTestId: selectedTest.id, patientId: selectedTest.patientId }}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            alert('Lab report document uploaded successfully!');
            loadLabTests();
          }}
        />
      )}
    </div>
  );
}
