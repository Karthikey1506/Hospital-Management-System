import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TestTube, FileText, CheckCircle, Clock } from 'lucide-react';

export default function Lab() {
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLabTests()
      .then(res => setLabTests(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Diagnostics & Pathology Lab</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Laboratory diagnostic order queue & pathology test results.</p>
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
                <th>Result Summary</th>
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
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{test.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
