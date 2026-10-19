import React, { useState } from 'react';

export default function ReportsModule({ orders = [] }) {
  const [filterPeriod, setFilterPeriod] = useState('ALL'); // 'ALL', 'MONTH', 'DAY'
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [hoveredCard, setHoveredCard] = useState(null);

  // Calculate Key Metrics
  const totalOrdersCount = orders.length;
  const totalRevenue = orders.reduce((acc, o) => acc + (Number(o.total) || Number(o.totalAmount) || 0), 0);
  const avgOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
  
  // Unique Customers Count
  const uniqueCustomers = new Set(orders.map(o => o.phone || o.customerPhone || o.customer)).size;

  // Channel-wise Breakdown
  const channelStats = orders.reduce((acc, o) => {
    const ch = (o.channel || 'COUNTER').toUpperCase();
    if (!acc[ch]) acc[ch] = { count: 0, revenue: 0 };
    acc[ch].count += 1;
    acc[ch].revenue += (Number(o.total) || Number(o.totalAmount) || 0);
    return acc;
  }, {});

  // Status-wise Breakdown
  const statusStats = orders.reduce((acc, o) => {
    const st = (o.status || 'Preparing');
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});

  // Handle PDF / Report Print Download
  const handleDownloadReport = () => {
    window.print();
  };

  return (
    <div style={styles.reportsContainer}>
      {/* Top Header Bar */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={{margin: '0 0 4px 0', fontSize: '20px', fontWeight: '900', color: '#0f172a'}}>Restaurant Analytics & Reports</h2>
          <span style={{fontSize: '12px', color: '#64748b'}}>Comprehensive insights across Online & Counter POS channels</span>
        </div>
        <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
          <button 
            onClick={handleDownloadReport}
            style={styles.downloadBtn}
          >
            📥 Download / Print PDF Report
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <div style={{fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px'}}>TOTAL REVENUE</div>
          <div style={{fontSize: '26px', fontWeight: '900', color: '#047857'}}>₹{totalRevenue.toFixed(2)}</div>
          <div style={{fontSize: '11px', color: '#10b981', marginTop: '4px'}}>Real-time database sync</div>
        </div>

        <div style={styles.metricCard}>
          <div style={{fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px'}}>TOTAL ORDERS</div>
          <div style={{fontSize: '26px', fontWeight: '900', color: '#0f172a'}}>{totalOrdersCount}</div>
          <div style={{fontSize: '11px', color: '#64748b', marginTop: '4px'}}>Online + Counter POS</div>
        </div>

        <div style={styles.metricCard}>
          <div style={{fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px'}}>UNIQUE CUSTOMERS</div>
          <div style={{fontSize: '26px', fontWeight: '900', color: '#2563eb'}}>{uniqueCustomers}</div>
          <div style={{fontSize: '11px', color: '#3b82f6', marginTop: '4px'}}>Active phone profiles</div>
        </div>

        <div style={styles.metricCard}>
          <div style={{fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px'}}>AVG ORDER VALUE</div>
          <div style={{fontSize: '26px', fontWeight: '900', color: '#d97706'}}>₹{avgOrderValue.toFixed(2)}</div>
          <div style={{fontSize: '11px', color: '#f59e0b', marginTop: '4px'}}>Per transaction average</div>
        </div>
      </div>

      {/* Channel Performance Breakdown */}
      <div style={styles.sectionCard}>
        <h3 style={{margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a'}}>Channel Performance (Online vs Counter POS)</h3>
        <div style={styles.channelGrid}>
          {Object.keys(channelStats).length === 0 ? (
            <div style={{padding: '20px', color: '#64748b', textAlign: 'center'}}>No channel data available.</div>
          ) : (
            Object.entries(channelStats).map(([channel, data]) => {
              const percentage = totalRevenue > 0 ? ((data.revenue / totalRevenue) * 100).toFixed(1) : 0;
              return (
                <div key={channel} style={styles.channelBox}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                    <span style={{fontWeight: '800', color: '#0f172a', fontSize: '14px'}}>🟢 {channel}</span>
                    <span style={{fontWeight: '700', color: '#047857', fontSize: '14px'}}>₹{data.revenue.toFixed(2)}</span>
                  </div>
                  <div style={{fontSize: '12px', color: '#64748b', marginBottom: '8px'}}>
                    Orders: <strong>{data.count}</strong> ({percentage}% of total revenue)
                  </div>
                  {/* Visual Progress Bar */}
                  <div style={styles.progressBarBg}>
                    <div style={{...styles.progressBarFill, width: `${percentage}%`}}></div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Detailed Master Orders Table for Reports */}
      <div style={styles.sectionCard}>
        <h3 style={{margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a'}}>Master Transaction Log</h3>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>Order ID</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Channel / Type</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Note / Request</th>
                <th style={{...styles.th, textAlign: 'right'}}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{padding: '30px', textAlign: 'center', color: '#64748b'}}>No orders found in database.</td>
                </tr>
              ) : (
                orders.map((o, idx) => (
                  <tr key={idx} style={styles.tableRow}>
                    <td style={styles.td}><strong>{o.id || o.orderId}</strong></td>
                    <td style={styles.td}>
                      <div style={{fontWeight: '700'}}>{o.customer}</div>
                      <div style={{fontSize: '11px', color: '#64748b'}}>{o.phone}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.channelBadge}>{o.channel || 'POS'}</span> · {o.type || 'Dine-In'}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.statusBadge(o.status)}>{o.status}</span>
                    </td>
                    <td style={styles.td}>
                      {o.customerRequest ? (
                        <span style={{color: '#d97706', fontWeight: '600', fontSize: '12px'}}>📝 {o.customerRequest}</span>
                      ) : (
                        <span style={{color: '#94a3b8', fontSize: '12px'}}>None</span>
                      )}
                    </td>
                    <td style={{...styles.td, textAlign: 'right', fontWeight: '800', color: '#047857'}}>
                      ₹{(Number(o.total) || Number(o.totalAmount) || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  reportsContainer: { display: 'flex', flexDirection: 'column', flex: 1, padding: '24px', backgroundColor: '#f8fafc', overflowY: 'auto', boxSizing: 'border-box' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  downloadBtn: { backgroundColor: '#047857', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(4,120,87,0.25)', transition: 'all 0.2s' },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '24px' },
  metricCard: { backgroundColor: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '20px', textAlign: 'left', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
  sectionCard: { backgroundColor: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '24px', textAlign: 'left', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
  channelGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' },
  channelBox: { backgroundColor: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '16px' },
  progressBarBg: { width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#047857', borderRadius: '4px', transition: 'width 0.4s ease' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' },
  tableHeaderRow: { borderBottom: '2px solid #e2e8f0', backgroundColor: '#f8fafc' },
  th: { padding: '12px 14px', fontWeight: '800', color: '#334155', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' },
  tableRow: { borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' },
  td: { padding: '14px', color: '#0f172a', verticalAlign: 'middle' },
  channelBadge: { backgroundColor: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' },
  statusBadge: (status) => ({
    backgroundColor: status === 'Preparing' ? '#ffedd5' : status === 'Completed' ? '#dcfce7' : '#e0f2fe',
    color: status === 'Preparing' ? '#c2410c' : status === 'Completed' ? '#15803d' : '#0369a1',
    fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase'
  })
};