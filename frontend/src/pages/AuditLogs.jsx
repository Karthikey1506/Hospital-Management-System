import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Pagination from '../components/Pagination';
import { Shield, Search, Clock, User, Filter, Code } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadLogs = () => {
    setLoading(true);
    fetch(`/api/audit-logs?page=${page}&limit=8&search=${search}&action=${filterAction}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('medpulse_token')}`
      }
    })
      .then(res => res.json())
      .then(res => {
        if (res.data) {
          setLogs(res.data);
          setTotalPages(res.pagination.totalPages);
        } else {
          setLogs(res);
        }
      })
      .catch(err => console.error('Error fetching audit logs:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLogs();
  }, [page, search, filterAction]);

  const getActionBadge = (action) => {
    if (action.includes('CREATE') || action.includes('REGISTER') || action.includes('UPLOAD')) {
      return <span className="badge badge-green">{action}</span>;
    }
    if (action.includes('UPDATE') || action.includes('ALLOCATE')) {
      return <span className="badge badge-blue">{action}</span>;
    }
    if (action.includes('DELETE') || action.includes('ARCHIVE')) {
      return <span className="badge badge-red">{action}</span>;
    }
    return <span className="badge badge-purple">{action}</span>;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>System Audit & Security Logs</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Immutable security ledger tracking clinical writes, EMR updates, bed allocations & billing.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by User Name, Action, or Details..." 
            className="input-field" 
            style={{ paddingLeft: '40px' }}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <select 
          className="input-field" 
          style={{ width: '220px' }}
          value={filterAction}
          onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
        >
          <option value="">All Action Types</option>
          <option value="USER_LOGIN">USER_LOGIN</option>
          <option value="CREATE_PATIENT">CREATE_PATIENT</option>
          <option value="BOOK_APPOINTMENT">BOOK_APPOINTMENT</option>
          <option value="ALLOCATE_BED">ALLOCATE_BED</option>
          <option value="GENERATE_BILL">GENERATE_BILL</option>
          <option value="FILE_UPLOADED">FILE_UPLOADED</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--primary-cyan)' }}>Loading Audit Stream...</div>
        ) : (
          <>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User / Role</th>
                  <th>Action Event</th>
                  <th>Module</th>
                  <th>Audit Details</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>No audit records found.</td></tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id}>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{log.userName}</div>
                        <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{log.userRole}</span>
                      </td>
                      <td>{getActionBadge(log.action)}</td>
                      <td><strong>{log.entity}</strong></td>
                      <td style={{ fontSize: '0.85rem' }}>{log.details}</td>
                      <td style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-dim)' }}>{log.ipAddress}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
