import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Users, BedDouble, DollarSign, CalendarCheck, TrendingUp, AlertCircle, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export default function Dashboard({ setActiveTab }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics()
      .then(res => setData(res))
      .catch(err => console.error('Error fetching analytics:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: 'var(--primary-cyan)' }}>
        Loading Executive Clinical Analytics...
      </div>
    );
  }

  const kpis = [
    { title: 'Total Revenue', value: `₹${(data.totalRevenue || 0).toLocaleString('en-IN')}`, change: '+18.4%', icon: DollarSign, color: '#10B981', desc: 'Paid Invoices' },
    { title: 'ICU / Bed Occupancy', value: `${data.occupancyRate}%`, change: `${data.occupiedBeds}/${data.totalBeds} Beds`, icon: BedDouble, color: '#00F2FE', desc: 'Real-time Ward Usage' },
    { title: 'Active Inpatients', value: data.activePatients, change: 'Currently Admitted', icon: Users, color: '#8B5CF6', desc: 'EMR Registered' },
    { title: 'Appointment Rate', value: `${data.appointmentCompletionRate}%`, change: `${data.completedAppointments} Completed`, icon: CalendarCheck, color: '#F59E0B', desc: 'Today Queue Status' }
  ];

  return (
    <div>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Hospital Command Center</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Real-time telemetry, clinical occupancy analytics, and revenue trends.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setActiveTab('patients')}>
          + New Patient Intake
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="glass-card glass-card-interactive" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{kpi.title}</span>
                <div style={{ background: `rgba(${kpi.color}, 0.15)`, padding: '8px', borderRadius: '10px' }}>
                  <Icon size={20} color={kpi.color} />
                </div>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>{kpi.value}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span style={{ color: kpi.color, fontWeight: 700 }}>{kpi.change}</span> • {kpi.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Revenue Trends Chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Revenue & Billing Trend (₹)</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monthly clinical billing receipts</p>
            </div>
            <div className="badge badge-green">+14.2% Growth</div>
          </div>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueTrends}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F2FE" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00F2FE" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip 
                  contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} 
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#00F2FE" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Patient Load Chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>Department Load</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Patient ratio across units</p>
          
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.departmentStats}>
                <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748B" />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                <Bar dataKey="patientCount" radius={[6, 6, 0, 0]}>
                  {data.departmentStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#00F2FE', '#8B5CF6', '#10B981', '#EF4444', '#F59E0B'][index % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Hospital Activity Stream & Quick Operations */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Real-time Clinical Stream</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="badge badge-red">Emergency Triage</span>
              <span style={{ fontSize: '0.9rem' }}>Arjun Mehta (PT-1001) admitted to <strong>ICU Bed 101</strong></span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>2 mins ago</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="badge badge-green">Prescription</span>
              <span style={{ fontSize: '0.9rem' }}>Dr. Rajesh Varma issued <strong>RX-7701</strong> for Cardiac Care</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>15 mins ago</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="badge badge-blue">Billing</span>
              <span style={{ fontSize: '0.9rem' }}>Invoice <strong>INV-2026-001</strong> (₹11,000) marked as PAID via Insurance</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>45 mins ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
