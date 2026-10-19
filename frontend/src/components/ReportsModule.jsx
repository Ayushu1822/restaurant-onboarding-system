import React, { useState } from 'react';

export default function ReportsModule({ orders = [] }) {
  const [activeTab, setActiveTab] = useState('Online Orders'); // 'Online Orders', 'Table Orders', 'Counter Orders'
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [hoveredRow, setHoveredRow] = useState(null);

  // Filter orders based on active tab and dropdown filters
  const filteredOrders = orders.filter(o => {
    const ch = (o.channel || 'COUNTER').toUpperCase();
    const type = (o.orderType || '').toUpperCase();
    
    // Tab filtering logic
    let matchesTab = true;
    if (activeTab === 'Online Orders') {
      matchesTab = ch !== 'COUNTER' && ch !== 'POS' && type !== 'DINE-IN';
    } else if (activeTab === 'Table Orders') {
      matchesTab = type === 'DINE-IN' || ch.includes('TABLE');
    } else if (activeTab === 'Counter Orders') {
      matchesTab = ch === 'COUNTER' || ch === 'POS';
    }

    // Status filtering
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    
    // Payment filtering
    const payMode = (o.paymentMethod || 'UPI').toUpperCase();
    const matchesPayment = paymentFilter === 'All' || payMode === paymentFilter.toUpperCase();

    return matchesTab && matchesStatus && matchesPayment;
  });

  // Calculate Metrics based on filtered orders
  const totalOrders = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce((acc, o) => acc + (Number(o.total) || Number(o.totalAmount) || 0), 0);
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const paidCount = filteredOrders.filter(o => (o.paymentStatus || 'PAID').toUpperCase() === 'PAID').length;

  // Chart Data Calculations (Day-wise / Channel-wise breakdown for Bar Graph simulation)
  const revenueByDay = filteredOrders.reduce((acc, o) => {
    const day = o.time || 'Today';
    acc[day] = (acc[day] || 0) + (Number(o.total) || Number(o.totalAmount) || 0);
    return acc;
  }, {});

  const handleExportReport = () => {
    window.print();
  };

  return (
    <div style={styles.container}>
      {/* Top Module Header */}
      <div style={styles.headerRow}>
        <h2 style={styles.pageTitle}>Reports</h2>
        <div style={styles.topRightIcon}>🔔</div>
      </div>

      {/* Category Tabs Bar matching screenshot */}
      <div style={styles.tabsBar}>
        {[
          { label: 'Online Orders', count: orders.filter(o => { const c = (o.channel||'').toUpperCase(); return c !== 'COUNTER' && c !== 'POS'; }).length },
          { label: 'Table Orders', count: orders.filter(o => (o.orderType||'').toUpperCase() === 'DINE-IN').length },
          { label: 'Counter Orders', count: orders.filter(o => { const c = (o.channel||'').toUpperCase(); return c === 'COUNTER' || c === 'POS'; }).length }
        ].map(tab => {
          const isActive = activeTab === tab.label;
          return (
            <div 
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              style={{
                ...styles.tabPill,
                backgroundColor: isActive ? '#047857' : '#fff',
                color: isActive ? '#fff' : '#334155',
                borderColor: isActive ? '#047857' : '#cbd5e1'
              }}
            >
              {tab.label} ({tab.count})
            </div>
          );
        })}
      </div>

      {/* Summary KPI Cards Grid matching screenshot */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>ORDERS</div>
          <div style={styles.kpiValue}>{totalOrders}</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>REVENUE</div>
          <div style={styles.kpiValueGreen}>₹{totalRevenue.toFixed(2)}</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>AVG. ORDER</div>
          <div style={styles.kpiValue}>₹{avgOrder.toFixed(2)}</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>PAID</div>
          <div style={styles.kpiValue}>{paidCount}</div>
        </div>
      </div>

      {/* Filters & Export Bar */}
      <div style={styles.filterBar}>
        <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
          <div>
            <span style={styles.filterSubLabel}>Order Status</span>
            <select 
              style={styles.dropdown}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="New">New</option>
              <option value="Accepted">Accepted</option>
              <option value="Preparing">Preparing</option>
              <option value="Ready">Ready</option>
              <option value="Picked Up">Picked Up</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <span style={styles.filterSubLabel}>Payment Mode</span>
            <select 
              style={styles.dropdown}
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="UPI">UPI</option>
              <option value="CARD">CARD</option>
              <option value="COD">COD</option>
              <option value="CASH">CASH</option>
            </select>
          </div>

          {(statusFilter !== 'All' || paymentFilter !== 'All') && (
            <button 
              onClick={() => { setStatusFilter('All'); setPaymentFilter('All'); }}
              style={styles.clearBtn}
            >
              Clear All
            </button>
          )}
        </div>

        <button onClick={handleExportReport} style={styles.exportBtn}>
          📥 Export Report
        </button>
      </div>

      {/* Master Orders Table matching screenshot */}
      <div style={styles.tableCard}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={styles.th}>Order ID</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Items</th>
                <th style={styles.th}>Order Value</th>
                <th style={styles.th}>Discount</th>
                <th style={styles.th}>Tax</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Pay Mode</th>
                <th style={styles.th}>Pay Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
                    No orders found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o, idx) => {
                  const sub = Number(o.subtotal) || (Number(o.total) * 0.9) || 500;
                  const disc = o.discount || (sub * 0.05);
                  const tax = o.tax || (sub * 0.05);
                  const tot = Number(o.total) || Number(o.totalAmount) || 0;
                  const payStat = (o.paymentStatus || 'PAID').toUpperCase();
                  const isHovered = hoveredRow === idx;

                  return (
                    <tr 
                      key={idx} 
                      onMouseEnter={() => setHoveredRow(idx)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        ...styles.tbodyRow,
                        backgroundColor: isHovered ? '#f1f5f9' : '#fff'
                      }}
                    >
                      <td style={styles.td}><strong>{o.id || o.orderId}</strong></td>
                      <td style={styles.td}>{o.customer || o.customerName}</td>
                      <td style={styles.td}>{o.items ? o.items.reduce((s, i) => s + i.qty, 0) : 3}</td>
                      <td style={styles.td}>₹{sub.toFixed(2)}</td>
                      <td style={styles.td}>₹{disc.toFixed(2)}</td>
                      <td style={styles.td}>₹{tax.toFixed(2)}</td>
                      <td style={{...styles.td, fontWeight: '800'}}>₹{tot.toFixed(2)}</td>
                      <td style={styles.td}>
                        <span style={styles.statusBadge(o.status)}>{o.status || 'New'}</span>
                      </td>
                      <td style={styles.td}>{o.type || o.orderType || 'Delivery'}</td>
                      <td style={styles.td}>{o.paymentMethod || 'UPI'}</td>
                      <td style={{...styles.td, fontWeight: '800', color: payStat === 'PAID' ? '#15803d' : '#dc2626'}}>
                        {payStat}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Analytics & Bar Graph Section */}
      <div style={styles.chartSectionCard}>
        <h3 style={{margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a'}}>📊 Revenue & Order Volume Distribution (Bar Graph Analysis)</h3>
        <div style={styles.barGraphContainer}>
          {filteredOrders.length === 0 ? (
            <div style={{color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '20px'}}>No data to display in chart.</div>
          ) : (
            filteredOrders.map((o, idx) => {
              const amount = Number(o.total) || Number(o.totalAmount) || 100;
              // Normalize bar height representation visually (max height 140px)
              const maxVal = Math.max(...filteredOrders.map(x => Number(x.total) || Number(x.totalAmount) || 100), 1000);
              const heightPercent = Math.min(Math.max((amount / maxVal) * 120, 25), 120);

              return (
                <div key={idx} style={styles.barColumn}>
                  <div style={{fontSize: '10px', fontWeight: '700', color: '#047857', marginBottom: '4px'}}>₹{amount.toFixed(0)}</div>
                  <div style={{...styles.barPillar, height: `${heightPercent}px`}}></div>
                  <div style={{fontSize: '10px', color: '#64748b', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '60px', textAlign: 'center'}}>
                    {o.id || `Ord #${idx+1}`}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', flex: 1, padding: '24px', backgroundColor: '#f8fafc', overflowY: 'auto', boxSizing: 'border-box' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  pageTitle: { fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: 0 },
  topRightIcon: { fontSize: '16px', background: '#fff', padding: '8px', borderRadius: '50%', border: '1px solid #e2e8f0', cursor: 'pointer' },
  tabsBar: { display: 'flex', gap: '12px', marginBottom: '20px' },
  tabPill: { padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', border: '1.5px solid', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', marginBottom: '20px' },
  kpiCard: { backgroundColor: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '18px 20px', textAlign: 'left', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  kpiLabel: { fontSize: '11px', fontWeight: '800', color: '#64748b', letterSpacing: '0.05em', marginBottom: '6px' },
  kpiValue: { fontSize: '24px', fontWeight: '900', color: '#0f172a' },
  kpiValueGreen: { fontSize: '24px', fontWeight: '900', color: '#047857' },
  filterBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '14px 20px', borderRadius: '12px', border: '1.5px solid #e2e8f0', marginBottom: '20px' },
  filterSubLabel: { fontSize: '10px', fontWeight: '800', color: '#64748b', display: 'block', marginBottom: '3px', textTransform: 'uppercase' },
  dropdown: { padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '12px', background: '#fff', fontWeight: '600', outline: 'none', cursor: 'pointer', minWidth: '130px' },
  clearBtn: { background: 'none', border: 'none', color: '#dc2626', fontSize: '12px', fontWeight: '700', cursor: 'pointer', alignSelf: 'flex-end', paddingBottom: '8px' },
  exportBtn: { backgroundColor: '#047857', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(4,120,87,0.2)', transition: 'all 0.2s' },
  tableCard: { backgroundColor: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' },
  theadRow: { backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' },
  th: { padding: '14px 16px', fontWeight: '800', color: '#334155', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' },
  tbodyRow: { borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' },
  td: { padding: '14px 16px', color: '#0f172a', verticalAlign: 'middle' },
  statusBadge: (status) => ({
    backgroundColor: status === 'New' ? '#e0f2fe' : status === 'Accepted' ? '#fef9c3' : status === 'Preparing' ? '#ffedd5' : status === 'Ready' ? '#ede9fe' : '#dcfce7',
    color: status === 'New' ? '#0369a1' : status === 'Accepted' ? '#854d0e' : status === 'Preparing' ? '#c2410c' : status === 'Ready' ? '#6d28d9' : '#15803d',
    fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase'
  }),
  chartSectionCard: { backgroundColor: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '24px', textAlign: 'left', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  barGraphContainer: { display: 'flex', alignItems: 'flex-end', gap: '20px', padding: '20px 10px 10px 10px', overflowX: 'auto', minHeight: '180px', borderBottom: '2px solid #e2e8f0' },
  barColumn: { display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 },
  barPillar: { width: '36px', backgroundColor: '#047857', borderRadius: '6px 6px 0 0', transition: 'height 0.3s ease', boxShadow: '0 4px 6px -1px rgba(4,120,87,0.2)' }
};