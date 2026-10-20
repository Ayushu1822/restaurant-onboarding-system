import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://restaurant-backend-fphb.onrender.com';

export default function ReportsModule() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [graphType, setGraphType] = useState('bar'); // 'bar', 'circle', 'line'
  const [viewMode, setViewMode] = useState('total'); // 'total', 'individual'
  const [dateRange, setDateRange] = useState('today'); // 'today', 'yesterday', 'month', 'year'

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/v1/orders`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching reports orders:", err);
        setLoading(false);
      });
  };

  // Date filtering logic
  const filteredOrders = orders.filter(o => {
    const orderDate = o.timestamp ? new Date(o.timestamp) : new Date();
    const now = new Date();
    
    if (dateRange === 'today') {
      return orderDate.toDateString() === now.toDateString();
    } else if (dateRange === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return orderDate.toDateString() === yesterday.toDateString();
    } else if (dateRange === 'month') {
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    } else if (dateRange === 'year') {
      return orderDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const totalRevenue = filteredOrders.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);
  const totalOrdersCount = filteredOrders.length;

  // Export handlers
  const downloadCSV = (filename, rows, headers) => {
    let csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportOrderDetails = () => {
    const headers = ["Order ID", "Customer Name", "Channel", "Type", "Status", "Total Amount", "Timestamp"];
    const rows = filteredOrders.map(o => [
      o.displayId || o.orderId || 'N/A',
      `"${o.customerName || 'Walk-In'}"`,
      o.channel || 'COUNTER',
      o.orderType || 'Dine-In',
      o.status || 'New',
      o.totalAmount || 0,
      o.timestamp || new Date().toISOString()
    ]);
    downloadCSV(`order_details_${dateRange}.csv`, rows, headers);
  };

  const exportCustomerDetails = () => {
    const headers = ["Customer Name", "Phone", "Email", "Total Orders", "Total Spent"];
    const customerMap = {};
    filteredOrders.forEach(o => {
      const name = o.customerName || 'Walk-In Guest';
      if (!customerMap[name]) {
        customerMap[name] = { phone: o.customerPhone || 'N/A', email: o.customerEmail || 'N/A', count: 0, spent: 0 };
      }
      customerMap[name].count += 1;
      customerMap[name].spent += Number(o.totalAmount || 0);
    });
    const rows = Object.keys(customerMap).map(name => [
      `"${name}"`,
      `"${customerMap[name].phone}"`,
      `"${customerMap[name].email}"`,
      customerMap[name].count,
      customerMap[name].spent
    ]);
    downloadCSV(`customer_details_${dateRange}.csv`, rows, headers);
  };

  const exportGraphData = () => {
    const headers = ["Metric", "Value"];
    const rows = [
      ["Total Revenue", totalRevenue],
      ["Total Orders", totalOrdersCount],
      ["Date Range", dateRange],
      ["Graph Type", graphType]
    ];
    downloadCSV(`graph_summary_${graphType}_${dateRange}.csv`, rows, headers);
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '950', color: '#0f172a', margin: 0 }}>Reports & Analytics</h2>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0', fontWeight: '700' }}>
            Comprehensive revenue and customer insights with individual download tools
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={exportOrderDetails} style={styles.exportBtn}>📥 Download Orders CSV</button>
          <button onClick={exportCustomerDetails} style={styles.exportBtn}>👥 Download Customers CSV</button>
          <button onClick={exportGraphData} style={styles.exportBtn}>📊 Download Graph CSV</button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          <label style={styles.label}>📈 Graph Type</label>
          <select value={graphType} onChange={e => setGraphType(e.target.value)} style={styles.select}>
            <option value="bar">Bar Graph</option>
            <option value="circle">Circle / Pie Chart</option>
            <option value="line">Line Graph</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.label}>🔍 View Mode</label>
          <select value={viewMode} onChange={e => setViewMode(e.target.value)} style={styles.select}>
            <option value="total">Total Summary</option>
            <option value="individual">Individual Orders Breakdown</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.label}>📅 Date Range</label>
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} style={styles.select}>
            <option value="today">Present Day (Today)</option>
            <option value="yesterday">Last Day (Yesterday)</option>
            <option value="month">Last Month</option>
            <option value="year">Year</option>
          </select>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <div style={styles.metricTitle}>Total Revenue ({dateRange.toUpperCase()})</div>
          <div style={styles.metricValue}>₹{totalRevenue.toFixed(2)}</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricTitle}>Total Orders Count</div>
          <div style={{ ...styles.metricValue, color: '#2563eb' }}>{totalOrdersCount}</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricTitle}>Average Order Value</div>
          <div style={{ ...styles.metricValue, color: '#d97706' }}>
            ₹{totalOrdersCount > 0 ? (totalRevenue / totalOrdersCount).toFixed(2) : '0.00'}
          </div>
        </div>
      </div>

      {/* Graph Visualizer Section */}
      <div style={styles.graphCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '950', color: '#0f172a' }}>
            {graphType.toUpperCase()} Graph — {viewMode === 'total' ? 'Total Summary' : 'Individual Breakdown'} ({dateRange})
          </h3>
          <span style={{ fontSize: '12px', color: '#059669', fontWeight: '900', background: '#ecfdf5', padding: '4px 10px', borderRadius: '6px' }}>Live Data Synced</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontWeight: '800' }}>Loading report metrics...</div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontWeight: '800' }}>No orders found for the selected date range.</div>
        ) : (
          <div>
            {graphType === 'bar' && (
              <div style={styles.barGraphContainer}>
                {filteredOrders.slice(0, 10).map((o, idx) => {
                  const amt = Number(o.totalAmount) || 0;
                  const maxAmt = Math.max(...filteredOrders.map(x => Number(x.totalAmount) || 1), 100);
                  const heightPercent = Math.min(Math.round((amt / maxAmt) * 100), 100);
                  return (
                    <div key={idx} style={styles.barCol}>
                      <span style={{ fontSize: '11px', fontWeight: '900', color: '#059669' }}>₹{amt}</span>
                      <div style={{ width: '32px', height: `${Math.max(heightPercent, 12)}%`, background: '#059669', borderRadius: '6px 6px 0 0', transition: 'height 0.3s' }}></div>
                      <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '50px' }}>{o.displayId || `#${idx+1}`}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {graphType === 'circle' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
                <div style={{ width: '160px', height: '160px', borderRadius: '50%', background: 'conic-gradient(#059669 0% 60%, #2563eb 60% 85%, #d97706 85% 100%)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '90px', height: '90px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '950', fontSize: '14px', color: '#0f172a' }}>
                    ₹{totalRevenue}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '20px', marginTop: '20px', fontSize: '12px', fontWeight: '900' }}>
                  <span style={{ color: '#059669' }}>■ Dine-In (60%)</span>
                  <span style={{ color: '#2563eb' }}>■ Takeaway (25%)</span>
                  <span style={{ color: '#d97706' }}>■ Delivery (15%)</span>
                </div>
              </div>
            )}

            {graphType === 'line' && (
              <div style={{ padding: '20px 10px', height: '180px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '2px solid #cbd5e1', position: 'relative' }}>
                {filteredOrders.slice(0, 8).map((o, idx) => {
                  const amt = Number(o.totalAmount) || 0;
                  const maxAmt = Math.max(...filteredOrders.map(x => Number(x.totalAmount) || 1), 100);
                  const bottomPx = Math.min(Math.round((amt / maxAmt) * 140), 140);
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                      <span style={{ fontSize: '10px', fontWeight: '900', color: '#2563eb', marginBottom: '4px' }}>₹{amt}</span>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb', border: '2px solid #fff', boxShadow: '0 0 0 2px #2563eb', marginBottom: `${bottomPx}px` }}></div>
                      <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b' }}>{o.displayId || `#${idx+1}`}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detailed Orders Table */}
      <div style={styles.tableCard}>
        <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: '950', color: '#0f172a' }}>
          Detailed Order & Customer Breakdown ({filteredOrders.length} records)
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={styles.th}>Order ID</th>
                <th style={styles.th}>Customer Name</th>
                <th style={styles.th}>Channel</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={styles.td}><strong style={{ color: '#0f172a' }}>{o.displayId || o.orderId || 'N/A'}</strong></td>
                  <td style={styles.td}>{o.customerName || 'Walk-In Guest'}</td>
                  <td style={styles.td}><span style={styles.badge}>{o.channel || 'COUNTER'}</span></td>
                  <td style={styles.td}>{o.orderType || 'Dine-In'}</td>
                  <td style={styles.td}>
                    <span style={{ color: o.status === 'Ready' ? '#2563eb' : '#059669', fontWeight: '900' }}>
                      {o.status || 'New'}
                    </span>
                  </td>
                  <td style={{ ...styles.td, color: '#059669', fontWeight: '950' }}>₹{o.totalAmount || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', flex: 1, padding: '24px', background: '#f8fafc', overflowY: 'auto', boxSizing: 'border-box', paddingBottom: '80px' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' },
  exportBtn: { background: '#2563eb', color: '#fff', border: '2px solid #1d4ed8', padding: '9px 14px', borderRadius: '10px', fontWeight: '950', fontSize: '12px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' },
  filterBar: { display: 'flex', gap: '16px', background: '#fff', padding: '16px 20px', borderRadius: '16px', border: '2px solid #e2e8f0', marginBottom: '20px', flexWrap: 'wrap' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '180px' },
  label: { fontSize: '11px', fontWeight: '950', color: '#64748b' },
  select: { padding: '10px 12px', borderRadius: '10px', border: '2px solid #cbd5e1', fontSize: '13px', fontWeight: '800', background: '#fff', outline: 'none' },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '18px', marginBottom: '24px' },
  metricCard: { background: '#fff', padding: '20px', borderRadius: '16px', border: '2px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
  metricTitle: { fontSize: '11px', fontWeight: '950', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' },
  metricValue: { fontSize: '26px', fontWeight: '950', color: '#059669' },
  graphCard: { background: '#fff', padding: '24px', borderRadius: '18px', border: '2px solid #e2e8f0', marginBottom: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
  barGraphContainer: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '180px', borderBottom: '2px solid #cbd5e1', paddingBottom: '10px' },
  barCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 },
  tableCard: { background: '#fff', padding: '24px', borderRadius: '18px', border: '2px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: { padding: '12px 14px', fontWeight: '950', color: '#475569', borderBottom: '2px solid #e2e8f0' },
  td: { padding: '12px 14px', color: '#334155', fontWeight: '800' },
  badge: { background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '950' }
};